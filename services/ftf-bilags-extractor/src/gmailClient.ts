/**
 * Gmail API client wrapper for BilagsExtractor
 * Uses OAuth2 to access ftfiestaa@gmail.com inbox
 */

import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import type {
  GmailClient as IGmailClient,
  GmailMessageAttachment,
} from "./types.js";

export class GmailClient implements IGmailClient {
  private gmail: any;
  private auth: OAuth2Client;

  constructor(auth: OAuth2Client) {
    this.auth = auth;
    this.gmail = google.gmail({ version: "v1", auth });
  }

  /**
   * Search for Gmail messages matching query
   */
  async searchMessages(params: {
    query: string;
    maxResults?: number;
  }): Promise<string[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: params.query,
        maxResults: params.maxResults || 50,
      });

      if (!response.data.messages) {
        return [];
      }

      return response.data.messages.map((msg: any) => msg.id as string);
    } catch (error: any) {
      console.error("Error searching Gmail messages:", error.message);
      throw error;
    }
  }

  /**
   * Get all attachments from a Gmail message
   */
  async getMessageAttachments(
    messageId: string
  ): Promise<GmailMessageAttachment[]> {
    try {
      const message = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const attachments: GmailMessageAttachment[] = [];
      const payload = message.data.payload;

      if (!payload) {
        return attachments;
      }

      // Recursively find all attachments in message parts
      const findAttachments = (part: any) => {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            messageId,
            attachmentId: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType || "application/octet-stream",
            size: part.body.size,
          });
        }

        if (part.parts) {
          for (const subPart of part.parts) {
            findAttachments(subPart);
          }
        }
      };

      findAttachments(payload);

      // Download attachment data for invoice-like files
      for (const attachment of attachments) {
        if (
          attachment.mimeType === "application/pdf" ||
          attachment.mimeType.startsWith("image/")
        ) {
          try {
            const attData = await this.gmail.users.messages.attachments.get({
              userId: "me",
              messageId,
              id: attachment.attachmentId,
            });

            // Decode base64url to Buffer
            const data = attData.data.data as string;
            const buffer = Buffer.from(
              data.replace(/-/g, "+").replace(/_/g, "/"),
              "base64"
            );
            attachment.data = buffer;
          } catch (error: any) {
            console.warn(
              `Failed to download attachment ${attachment.attachmentId}:`,
              error.message
            );
          }
        }
      }

      return attachments;
    } catch (error: any) {
      console.error(
        `Error getting attachments for message ${messageId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get message details (subject, from, date, snippet)
   */
  async getMessageDetails(messageId: string): Promise<{
    subject: string;
    from: string;
    date: string;
    snippet: string;
  }> {
    try {
      const message = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = message.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || "";

      return {
        subject: getHeader("Subject"),
        from: getHeader("From"),
        date: getHeader("Date"),
        snippet: message.data.snippet || "",
      };
    } catch (error: any) {
      console.error(
        `Error getting message details for ${messageId}:`,
        error.message
      );
      throw error;
    }
  }
}
