/**
 * Phase 9.8: Real-time Email Monitoring Service
 *
 * Automatically monitors Gmail inbox for new leads
 * and triggers immediate processing workflows.
 */

import { eq } from "drizzle-orm";
import { JWT } from "google-auth-library";
import { google } from "googleapis";

import { emailThreads, users } from "../../../drizzle/schema";

import { retryWithBackoff } from "../../_core/error-handling";
import { logger } from "../../_core/logger";
import { getDb } from "../../db";
import { enrichEmailFromSources } from "./email-enrichment";
import { detectLeadSourceIntelligent } from "../crm/lead-source-detector";
import { getWorkflowFromDetection } from "../crm/lead-source-workflows";



interface EmailMonitorConfig {
  pollInterval: number; // milliseconds
  maxEmailsPerPoll: number;
  watchedLabels: string[];
  autoProcessThreshold: number; // confidence % for auto-processing
}

interface NewEmailNotification {
  emailId: string;
  threadId: string;
  subject: string;
  from: string;
  body: string;
  timestamp: Date;
  sourceDetection: any;
  workflow: any;
  autoProcessed: boolean;
}

/**
 * Phase 9.8: Real-time email monitoring service
 */
export class EmailMonitorService {
  private gmail: any;
  private isRunning: boolean = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private processedEmails: Set<string> = new Set();

  private config: EmailMonitorConfig = {
    pollInterval: 30000, // 30 seconds
    maxEmailsPerPoll: 10,
    watchedLabels: ["INBOX", "UNREAD"],
    autoProcessThreshold: 80, // Auto-process if confidence > 80%
  };

  constructor() {
    this.gmail = this.initializeGmailClient();
  }

  private initializeGmailClient() {
    try {
      const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
        subject: process.env.GOOGLE_IMPERSONATED_USER,
      });

      return google.gmail({ version: "v1", auth });
    } catch (error) {
      logger.error({ err: error }, "[EmailMonitor] Failed to initialize Gmail client");
      throw error;
    }
  }

  /**
   * Start real-time email monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      logger.info("[EmailMonitor] Monitoring already running");
      return;
    }

    logger.info("[EmailMonitor] 🚀 Starting real-time email monitoring...");
    this.isRunning = true;

    // Initial scan
    await this.processNewEmails();

    // Start polling
    this.pollTimer = setInterval(async () => {
      try {
        await this.processNewEmails();
      } catch (error) {
        logger.error({ err: error }, "[EmailMonitor] Error in polling cycle");
      }
    }, this.config.pollInterval);

    logger.info(
      { pollInterval: this.config.pollInterval / 1000 },
      `[EmailMonitor] ✅ Monitoring started (polling every ${this.config.pollInterval / 1000}s)`
    );
  }

  /**
   * Stop email monitoring
   */
  stopMonitoring(): void {
    if (!this.isRunning) {
      logger.info("[EmailMonitor] Monitoring not running");
      return;
    }

    logger.info("[EmailMonitor] 🛑 Stopping email monitoring...");
    this.isRunning = false;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    logger.info("[EmailMonitor] ✅ Monitoring stopped");
  }

  /**
   * Process new emails from inbox
   */
  private async processNewEmails(): Promise<NewEmailNotification[]> {
    try {
      logger.debug("[EmailMonitor] 🔍 Scanning for new emails...");

      // Get unread emails with retry logic for rate limits
      const response = await retryWithBackoff(
        async () => {
          return await this.gmail.users.messages.list({
            userId: "me",
            labelIds: this.config.watchedLabels,
            maxResults: this.config.maxEmailsPerPoll,
            q: "is:unread", // Only unread emails
          });
        },
        {
          maxAttempts: 3,
          initialDelayMs: 2000,
          maxDelayMs: 30000,
          retryableErrors: ["429", "rate limit", "RESOURCE_EXHAUSTED", "503", "502"],
        }
      );

      const messages = response.data.messages || [];
      const newEmails: NewEmailNotification[] = [];

      logger.debug({ count: messages.length }, `[EmailMonitor] Found ${messages.length} unread emails`);

      for (const message of messages) {
        const emailId = message.id;

        // Skip if already processed
        if (this.processedEmails.has(emailId)) {
          continue;
        }

        try {
          const notification = await this.processEmail(message);
          if (notification) {
            newEmails.push(notification);
            this.processedEmails.add(emailId);
          }
        } catch (error) {
          logger.error(
            { err: error, emailId },
            `[EmailMonitor] Error processing email ${emailId}`
          );
        }
      }

      if (newEmails.length > 0) {
        logger.info(
          { count: newEmails.length },
          `[EmailMonitor] 🎯 Processed ${newEmails.length} new emails`
        );
        newEmails.forEach(email => {
          logger.debug(
            {
              source: email.sourceDetection.source,
              confidence: email.sourceDetection.confidence,
              subject: email.subject,
            },
            `[EmailMonitor] Processed: ${email.sourceDetection.source} (${email.sourceDetection.confidence}% confidence)`
          );
        });
      }

      return newEmails;
    } catch (error: any) {
      const isRateLimit =
        error?.code === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("rate limit") ||
        error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit) {
        logger.warn(
          { err: error },
          "[EmailMonitor] Rate limit exceeded while processing new emails"
        );
      } else {
        logger.error(
          { err: error },
          "[EmailMonitor] Error processing new emails"
        );
      }
      return [];
    }
  }

  /**
   * Process individual email
   */
  private async processEmail(
    message: any
  ): Promise<NewEmailNotification | null> {
    try {
      // Get full email details with retry logic
      const emailDetail = await retryWithBackoff(
        async () => {
          return await this.gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full",
          });
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          retryableErrors: ["429", "rate limit", "RESOURCE_EXHAUSTED", "503", "502"],
        }
      );

      const headers = emailDetail.data.payload.headers;
      const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "";
      const from = headers.find((h: any) => h.name === "From")?.value || "";
      const to = headers.find((h: any) => h.name === "To")?.value || "";
      const date = headers.find((h: any) => h.name === "Date")?.value || "";

      // Extract email body
      const body = this.extractEmailBody(emailDetail.data.payload);

      // Phase 9.2: Intelligent source detection
      const sourceDetection = detectLeadSourceIntelligent({
        from,
        to,
        subject,
        body,
      });

      // Phase 9.3: Get workflow for this source
      const workflow = getWorkflowFromDetection(sourceDetection);

      // Check if this is a lead (not a reply, etc.)
      const isLead = this.isLeadEmail(subject, from);

      if (!isLead) {
        logger.debug({ subject }, `[EmailMonitor] Skipping non-lead email: ${subject}`);
        return null;
      }

      // Store in database
      await this.storeEmailInDatabase({
        emailId: message.id,
        threadId: message.threadId,
        subject,
        from,
        to,
        body,
        timestamp: new Date(date),
        sourceDetection,
        workflow,
      });

      // Auto-process if high confidence
      const autoProcessed =
        sourceDetection.confidence >= this.config.autoProcessThreshold;

      if (autoProcessed) {
        await this.autoProcessEmail(message.id, sourceDetection, workflow);
        // Mark as read
        await this.gmail.users.messages.modify({
          userId: "me",
          id: message.id,
          requestBody: {
            removeLabelIds: ["UNUN"],
            addLabelIds: ["Label_1"], // Mark as processed
          },
        });
      }

      return {
        emailId: message.id,
        threadId: message.threadId,
        subject,
        from,
        body,
        timestamp: new Date(date),
        sourceDetection,
        workflow,
        autoProcessed,
      };
    } catch (error: any) {
      const isRateLimit =
        error?.code === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("rate limit") ||
        error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit) {
        logger.warn(
          { err: error, messageId: message.id },
          "[EmailMonitor] Rate limit exceeded while processing email"
        );
      } else {
        logger.error(
          { err: error, messageId: message.id },
          `[EmailMonitor] Error processing email ${message.id}`
        );
      }
      return null;
    }
  }

  /**
   * Extract email body from payload
   */
  private extractEmailBody(payload: any): string {
    if (payload.body.data) {
      return Buffer.from(payload.body.data, "base64").toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString();
        }
      }
    }

    return "";
  }

  /**
   * Check if email is a lead (not a reply/fwd)
   */
  private isLeadEmail(subject: string, from: string): boolean {
    const subjectLower = subject.toLowerCase();

    // Skip replies and forwards
    if (subjectLower.startsWith("re:") || subjectLower.startsWith("fwd:")) {
      return false;
    }

    // Skip known non-lead senders
    const skipSenders = ["noreply@", "no-reply@", "notification@"];
    if (skipSenders.some(sender => from.includes(sender))) {
      return false;
    }

    return true;
  }

  /**
   * Get userId from Gmail email address
   * ✅ SECURITY FIX: Resolve userId from email instead of hardcoded fallback
   */
  private async getUserIdFromEmail(gmailEmail: string): Promise<number | null> {
    try {
      const db = await getDb();
      if (!db) return null;

      // Find user by email address
      const userRows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, gmailEmail))
        .limit(1);

      return userRows.length > 0 ? userRows[0].id : null;
    } catch (error) {
      logger.error({ err: error, email: gmailEmail }, "[EmailMonitor] Failed to resolve userId from email");
      return null;
    }
  }

  /**
   * Store email in database
   */
  private async storeEmailInDatabase(emailData: any): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        logger.error("[EmailMonitor] Database not available");
        return;
      }

      // ✅ SECURITY FIX: Resolve userId from Gmail email address
      // Get the "to" email address (our Gmail account)
      const gmailEmail = emailData.to?.split(",")[0]?.trim() || process.env.GOOGLE_IMPERSONATED_USER;
      const userId = await this.getUserIdFromEmail(gmailEmail || "");

      if (!userId) {
        logger.warn(
          { to: emailData.to, gmailEmail },
          "[EmailMonitor] Could not resolve userId for email, skipping database storage"
        );
        return;
      }

      // Store in email_threads table
      await db.insert(emailThreads).values({
        userId: userId,
        gmailThreadId: emailData.threadId,
        subject: emailData.subject,
        participants: JSON.stringify({
          from: emailData.from,
          to: emailData.to,
        }),
        snippet: emailData.body?.substring(0, 200),
        labels: JSON.stringify(emailData.labels ?? []),
        lastMessageAt: emailData.timestamp.toISOString(),
        isRead: false,
      });

      logger.info(
        { subject: emailData.subject },
        `[EmailMonitor] ✅ Stored email in database: ${emailData.subject}`
      );
    } catch (error) {
      logger.error(
        { err: error, subject: emailData.subject },
        "[EmailMonitor] Error storing email in database"
      );
    }
  }

  /**
   * Auto-process email with high confidence
   */
  private async autoProcessEmail(
    emailId: string,
    sourceDetection: any,
    workflow: any
  ): Promise<void> {
    try {
      logger.info(
        {
          source: sourceDetection.source,
          confidence: sourceDetection.confidence,
        },
        `[EmailMonitor] 🤖 Auto-processing ${sourceDetection.source} lead (${sourceDetection.confidence}% confidence)`
      );

      // Trigger immediate workflow actions
      if (workflow.workflow.autoActions) {
        for (const action of workflow.workflow.autoActions) {
          if (action.trigger === "immediate") {
            logger.info(
              { action: action.title },
              `[EmailMonitor] ⚡ Executing auto-action: ${action.title}`
            );
            // TODO: Implement specific auto-actions
            // - Send notification to sales team
            // - Create calendar event
            // - Send auto-response
          }
        }
      }
    } catch (error) {
      logger.error({ err: error, emailId }, "[EmailMonitor] Error in auto-processing");
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isRunning: boolean;
    processedCount: number;
    config: EmailMonitorConfig;
  } {
    return {
      isRunning: this.isRunning,
      processedCount: this.processedEmails.size,
      config: this.config,
    };
  }

  /**
   * Clear processed emails cache
   */
  clearCache(): void {
    this.processedEmails.clear();
    logger.info("[EmailMonitor] 🗑️ Cleared processed emails cache");
  }
}

// Singleton instance
export const emailMonitor = new EmailMonitorService();
