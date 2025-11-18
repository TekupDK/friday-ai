/**
 * Transaction-to-email matching logic
 */

import type {
  Transaction,
  SupplierKey,
  GmailClient,
  GmailMessageAttachment,
  AttachmentMatch,
} from "./types.js";
import { buildSupplierGmailQuery } from "./supplierMapping.js";
import { GmailClient as GmailClientImpl } from "./gmailClient.js";

/**
 * Calculate match score for an attachment
 */
function calculateMatchScore(
  transaction: Transaction,
  attachment: GmailMessageAttachment,
  messageDetails: { subject: string; from: string; date: string; snippet: string }
): number {
  let score = 0;

  // Base score for having an attachment
  score += 0.3;

  // Check if filename contains supplier keywords
  const filename = attachment.filename.toUpperCase();
  const supplier = transaction.supplierGuess;
  if (supplier) {
    const supplierLower = supplier.toLowerCase();
    if (filename.includes(supplierLower.toUpperCase())) {
      score += 0.2;
    }
  }

  // Check if subject/from contains supplier keywords
  const searchText = `${messageDetails.subject} ${messageDetails.from} ${messageDetails.snippet}`.toUpperCase();
  if (supplier) {
    const supplierLower = supplier.toLowerCase();
    if (searchText.includes(supplierLower.toUpperCase())) {
      score += 0.2;
    }
  }

  // Check date proximity (±7 days)
  try {
    const transactionDate = new Date(transaction.date);
    const messageDate = new Date(messageDetails.date);
    const daysDiff = Math.abs(
      (transactionDate.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 7) {
      score += 0.3 - (daysDiff / 7) * 0.1; // Decay with distance
    }
  } catch {
    // Date parsing failed, skip date scoring
  }

  // Prefer PDFs and images (likely invoices/receipts)
  if (attachment.mimeType === "application/pdf") {
    score += 0.1;
  } else if (attachment.mimeType.startsWith("image/")) {
    score += 0.05;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Match attachments for a transaction
 */
export async function matchAttachmentsForTransaction(
  transaction: Transaction,
  gmailClient: GmailClient,
  supplier: SupplierKey
): Promise<AttachmentMatch[]> {
  // Build Gmail query
  const transactionDate = new Date(transaction.date);
  const dateFrom = new Date(transactionDate);
  dateFrom.setDate(dateFrom.getDate() - 7);
  const dateTo = new Date(transactionDate);
  dateTo.setDate(dateTo.getDate() + 7);

  const query = buildSupplierGmailQuery(
    supplier,
    dateFrom.toISOString().split("T")[0].replace(/-/g, "/"),
    dateTo.toISOString().split("T")[0].replace(/-/g, "/")
  );

  // Search for messages
  const messageIds = await gmailClient.searchMessages({
    query,
    maxResults: 20,
  });

  const matches: AttachmentMatch[] = [];

  // Get attachments from each message
  for (const messageId of messageIds) {
    try {
      const attachments = await gmailClient.getMessageAttachments(messageId);

      // Get message details for scoring
      let messageDetails = {
        subject: "",
        from: "",
        date: transaction.date,
        snippet: "",
      };

      if (gmailClient instanceof GmailClientImpl) {
        messageDetails = await gmailClient.getMessageDetails(messageId);
      }

      // Score each attachment
      for (const attachment of attachments) {
        // Only consider PDFs and images
        if (
          attachment.mimeType !== "application/pdf" &&
          !attachment.mimeType.startsWith("image/")
        ) {
          continue;
        }

        const matchScore = calculateMatchScore(transaction, attachment, messageDetails);

        // Only include matches with score > 0.3
        if (matchScore > 0.3) {
          matches.push({
            transactionId: transaction.id,
            messageId,
            attachmentId: attachment.attachmentId,
            filename: attachment.filename,
            path: "", // Will be set when saving
            matchScore,
            hash: "", // Will be calculated when saving
          });
        }
      }
    } catch (error: any) {
      console.warn(`Failed to process message ${messageId}:`, error.message);
    }
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}
