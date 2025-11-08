/**
 * Phase 9.8: Real-time Email Monitoring Service
 * 
 * Automatically monitors Gmail inbox for new leads
 * and triggers immediate processing workflows.
 */

import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { detectLeadSourceIntelligent } from "./lead-source-detector";
import { getWorkflowFromDetection } from "./lead-source-workflows";
import { enrichEmailFromSources } from "./email-enrichment";
import { emailThreads } from "../drizzle/schema";
import { getDb } from "./db";

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
      console.error("[EmailMonitor] Failed to initialize Gmail client:", error);
      throw error;
    }
  }

  /**
   * Start real-time email monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log("[EmailMonitor] Monitoring already running");
      return;
    }

    console.log("[EmailMonitor] 🚀 Starting real-time email monitoring...");
    this.isRunning = true;

    // Initial scan
    await this.processNewEmails();

    // Start polling
    this.pollTimer = setInterval(async () => {
      try {
        await this.processNewEmails();
      } catch (error) {
        console.error("[EmailMonitor] Error in polling cycle:", error);
      }
    }, this.config.pollInterval);

    console.log(`[EmailMonitor] ✅ Monitoring started (polling every ${this.config.pollInterval/1000}s)`);
  }

  /**
   * Stop email monitoring
   */
  stopMonitoring(): void {
    if (!this.isRunning) {
      console.log("[EmailMonitor] Monitoring not running");
      return;
    }

    console.log("[EmailMonitor] 🛑 Stopping email monitoring...");
    this.isRunning = false;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    console.log("[EmailMonitor] ✅ Monitoring stopped");
  }

  /**
   * Process new emails from inbox
   */
  private async processNewEmails(): Promise<NewEmailNotification[]> {
    try {
      console.log("[EmailMonitor] 🔍 Scanning for new emails...");

      // Get unread emails
      const response = await this.gmail.users.messages.list({
        userId: "me",
        labelIds: this.config.watchedLabels,
        maxResults: this.config.maxEmailsPerPoll,
        q: "is:unread", // Only unread emails
      });

      const messages = response.data.messages || [];
      const newEmails: NewEmailNotification[] = [];

      console.log(`[EmailMonitor] Found ${messages.length} unread emails`);

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
          console.error(`[EmailMonitor] Error processing email ${emailId}:`, error);
        }
      }

      if (newEmails.length > 0) {
        console.log(`[EmailMonitor] 🎯 Processed ${newEmails.length} new emails:`);
        newEmails.forEach(email => {
          console.log(`  - ${email.sourceDetection.source} (${email.sourceDetection.confidence}% confidence): ${email.subject}`);
        });
      }

      return newEmails;

    } catch (error) {
      console.error("[EmailMonitor] Error processing new emails:", error);
      return [];
    }
  }

  /**
   * Process individual email
   */
  private async processEmail(message: any): Promise<NewEmailNotification | null> {
    try {
      // Get full email details
      const emailDetail = await this.gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const headers = emailDetail.data.payload.headers;
      const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
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
        console.log(`[EmailMonitor] Skipping non-lead email: ${subject}`);
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
      const autoProcessed = sourceDetection.confidence >= this.config.autoProcessThreshold;
      
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

    } catch (error) {
      console.error(`[EmailMonitor] Error processing email ${message.id}:`, error);
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
   * Store email in database
   */
  private async storeEmailInDatabase(emailData: any): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[EmailMonitor] Database not available");
        return;
      }
      
      // Store in email_threads table
      await db.insert(emailThreads).values({
        gmailThreadId: emailData.threadId,
        subject: emailData.subject,
        fromEmail: emailData.from,
        toEmail: emailData.to,
        text: emailData.body,
        createdAt: emailData.timestamp.toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: JSON.stringify({
          sourceDetection: emailData.sourceDetection,
          workflow: emailData.workflow,
        }),
      });

      console.log(`[EmailMonitor] ✅ Stored email in database: ${emailData.subject}`);

    } catch (error) {
      console.error("[EmailMonitor] Error storing email in database:", error);
    }
  }

  /**
   * Auto-process email with high confidence
   */
  private async autoProcessEmail(emailId: string, sourceDetection: any, workflow: any): Promise<void> {
    try {
      console.log(`[EmailMonitor] 🤖 Auto-processing ${sourceDetection.source} lead (${sourceDetection.confidence}% confidence)`);
      
      // Trigger immediate workflow actions
      if (workflow.workflow.autoActions) {
        for (const action of workflow.workflow.autoActions) {
          if (action.trigger === "immediate") {
            console.log(`[EmailMonitor] ⚡ Executing auto-action: ${action.title}`);
            // TODO: Implement specific auto-actions
            // - Send notification to sales team
            // - Create calendar event
            // - Send auto-response
          }
        }
      }

    } catch (error) {
      console.error("[EmailMonitor] Error in auto-processing:", error);
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
    console.log("[EmailMonitor] 🗑️ Cleared processed emails cache");
  }
}

// Singleton instance
export const emailMonitor = new EmailMonitorService();
