/**
 * Type definitions for BilagsExtractor
 */

export type SupplierKey =
  | "Danfoods"
  | "Dagrofa"
  | "Inco"
  | "AarhusCatering"
  | "Braendstof"
  | "Airbnb"
  | "Festival"
  | "Diverse"
  | "RendetaljeExcluded";

export interface Transaction {
  id: string;
  date: string; // ISO date string
  text: string; // Original bank text, e.g. "LS 38393 DANFOODS APS"
  amount: number; // Negative for expenses
  supplierGuess?: SupplierKey;
}

export interface GmailMessageAttachment {
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  data?: Buffer;
  size?: number;
}

export interface AttachmentMatch {
  transactionId: string;
  messageId: string;
  attachmentId: string;
  filename: string;
  path: string;
  matchScore: number;
  hash: string;
}

export interface MatchResult {
  transactionId: string;
  date: string;
  text: string;
  amount: number;
  supplier: SupplierKey;
  status: "FOUND" | "MISSING";
  matchedAttachments: AttachmentMatch[];
}

export interface GmailClient {
  searchMessages(params: {
    query: string;
    maxResults?: number;
  }): Promise<string[]>; // Returns messageIds

  getMessageAttachments(messageId: string): Promise<GmailMessageAttachment[]>;
}
