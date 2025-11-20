/**
 * Follow-up Reminders - Auto-detection Logic
 */

import { and, eq, or } from "drizzle-orm";

import { emailFollowups } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { getGmailThread } from "../../google-api";
import { logger } from "../../_core/logger";
import { getUserEmail } from "./helpers";

/**
 * Auto-detect if an email requires follow-up
 */
export async function shouldCreateFollowup(
  threadId: string,
  userId: number,
  emailSubject?: string,
  emailBody?: string
): Promise<boolean> {
  try {
    // Get thread details
    const thread = await getGmailThread(threadId);
    if (!thread || !thread.messages || thread.messages.length === 0) {
      return false;
    }

    const lastMessage = thread.messages[thread.messages.length - 1];
    const subject = emailSubject || thread.subject || "";
    const body = emailBody || lastMessage.body || "";

    // Check if we already have a follow-up for this thread
    const db = await getDb();
    if (db) {
      const existing = await db
        .select()
        .from(emailFollowups)
        .where(
          and(
            eq(emailFollowups.threadId, threadId),
            eq(emailFollowups.userId, userId),
            or(
              eq(emailFollowups.status, "pending"),
              eq(emailFollowups.status, "overdue")
            )
          )
        )
        .limit(1)
        .execute();

      if (existing.length > 0) {
        return false; // Already has a pending follow-up
      }
    }

    // Check if last message is from user (sent email) - no follow-up needed
    const userEmail = await getUserEmail(userId);
    if (userEmail && lastMessage.from?.includes(userEmail)) {
      return false; // User sent the last message
    }

    // Auto-detect patterns
    const lowerSubject = subject.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Lead indicators
    const leadKeywords = [
      "tilbud",
      "forespørgsel",
      "henvendelse",
      "pris",
      "kostpris",
      "budget",
      "anbefaling",
      "reference",
    ];
    const hasLeadKeywords =
      leadKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Quote/Proposal indicators
    const quoteKeywords = [
      "tilbud",
      "offerte",
      "prisoverslag",
      "faktura",
      "invoice",
      "betaling",
      "payment",
    ];
    const hasQuoteKeywords =
      quoteKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Invoice indicators
    const invoiceKeywords = [
      "faktura",
      "invoice",
      "betaling",
      "payment",
      "regning",
      "betalingsfrist",
      "due date",
    ];
    const hasInvoiceKeywords =
      invoiceKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Question indicators (requires response)
    const questionPatterns = [
      /\?/g, // Contains question mark
      /hvornår/i,
      /hvordan/i,
      /hvorfor/i,
      /kan du/i,
      /vil du/i,
      /må jeg/i,
    ];
    const hasQuestions = questionPatterns.some(pattern => pattern.test(body));

    // If email contains questions, it likely needs a response
    if (hasQuestions) {
      return true;
    }

    // Check for lead/quote/invoice keywords
    if (hasLeadKeywords || hasQuoteKeywords || hasInvoiceKeywords) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error(
      { err: error, threadId, userId },
      "[FollowupReminders] Error checking if follow-up needed"
    );
    return false;
  }
}
