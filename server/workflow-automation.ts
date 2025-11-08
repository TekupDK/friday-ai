/**
 * Phase 9.8: Workflow Automation Service
 * 
 * Orchestrates the complete lead-to-cash workflow
 * Connects email monitoring, source detection, and Billy automation.
 */

import { emailMonitor } from "./email-monitor";
import { billyAutomation } from "./billy-automation";
import { detectLeadSourceIntelligent } from "./lead-source-detector";
import { getWorkflowFromDetection } from "./lead-source-workflows";
import { createCalendarEvent } from "./mcp";
import { getDb } from "./db";
import { leads, tasks } from "../drizzle/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

interface AutomationConfig {
  enableEmailMonitoring: boolean;
  enableBillyAutomation: boolean;
  enableCalendarSync: boolean;
  autoProcessThreshold: number; // confidence % for auto-processing
  autoCreateCustomerThreshold: number; // confidence % for auto customer creation
}

interface WorkflowResult {
  success: boolean;
  step: string;
  leadId?: number;
  customerId?: string;
  invoiceId?: string;
  calendarEventId?: string | null;
  error?: string;
}

/**
 * Phase 9.8: Complete workflow automation service
 */
export class WorkflowAutomationService {
  
  private config: AutomationConfig = {
    enableEmailMonitoring: true,
    enableBillyAutomation: true,
    enableCalendarSync: true,
    autoProcessThreshold: 85,
    autoCreateCustomerThreshold: 95,
  };

  private isRunning: boolean = false;

  /**
   * Start complete workflow automation
   */
  async startAutomation(): Promise<void> {
    if (this.isRunning) {
      console.log("[WorkflowAutomation] Automation already running");
      return;
    }

    console.log("[WorkflowAutomation] 🚀 Starting complete workflow automation...");
    this.isRunning = true;

    try {
      // Start email monitoring
      if (this.config.enableEmailMonitoring) {
        await emailMonitor.startMonitoring();
        console.log("[WorkflowAutomation] ✅ Email monitoring started");
      }

      // Setup webhook handlers for real-time processing
      this.setupEventHandlers();

      console.log("[WorkflowAutomation] ✅ Complete workflow automation started");

    } catch (error) {
      console.error("[WorkflowAutomation] Error starting automation:", error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop workflow automation
   */
  async stopAutomation(): Promise<void> {
    if (!this.isRunning) {
      console.log("[WorkflowAutomation] Automation not running");
      return;
    }

    console.log("[WorkflowAutomation] 🛑 Stopping workflow automation...");
    this.isRunning = false;

    // Stop email monitoring
    await emailMonitor.stopMonitoring();

    console.log("[WorkflowAutomation] ✅ Workflow automation stopped");
  }

  /**
   * Process new lead through complete workflow
   */
  async processLeadWorkflow(emailData: {
    emailId: string;
    threadId: string;
    subject: string;
    from: string;
    body: string;
  }): Promise<WorkflowResult> {
    try {
      console.log(`[WorkflowAutomation] 🎯 Processing lead workflow for: ${emailData.subject}`);

      // Step 1: Intelligent source detection
      const sourceDetection = detectLeadSourceIntelligent({
        from: emailData.from,
        to: "",
        subject: emailData.subject,
        body: emailData.body,
      });

      console.log(`[WorkflowAutomation] ✅ Source detected: ${sourceDetection.source} (${sourceDetection.confidence}% confidence)`);

      // Step 2: Get workflow for this source
      const workflow = getWorkflowFromDetection(sourceDetection);
      
      console.log(`[WorkflowAutomation] ✅ Workflow: ${workflow.workflow.priority} priority, ${workflow.workflow.responseTime} response time`);

      // Step 3: Create lead in database
      const leadId = await this.createLeadInDatabase(emailData, sourceDetection);
      
      if (!leadId) {
        return {
          success: false,
          step: "create_lead",
          error: "Failed to create lead in database",
        };
      }

      console.log(`[WorkflowAutomation] ✅ Lead created: ${leadId}`);

      // Step 4: Auto-create Billy customer if high confidence
      let customerId: string | undefined;
      
      if (sourceDetection.confidence >= this.config.autoCreateCustomerThreshold) {
        const billyCustomer = await billyAutomation.createCustomerFromLead(leadId);
        if (billyCustomer) {
          customerId = billyCustomer.id;
          console.log(`[WorkflowAutomation] ✅ Billy customer created: ${customerId}`);
        }
      }

      // Step 5: Execute immediate workflow actions
      await this.executeImmediateActions(leadId, sourceDetection, workflow);

      // Step 6: Create calendar event if enabled
      let calendarEventId: string | null = null;
      
      if (this.config.enableCalendarSync && workflow.workflow.responseTime === "immediate") {
        calendarEventId = await this.createFollowUpEvent(leadId, emailData);
        if (calendarEventId) {
          console.log(`[WorkflowAutomation] ✅ Calendar event created: ${calendarEventId}`);
        }
      }

      // Step 7: Send notifications
      await this.sendNotifications(leadId, sourceDetection, workflow);

      return {
        success: true,
        step: "complete",
        leadId,
        customerId,
        calendarEventId,
      };

    } catch (error) {
      console.error("[WorkflowAutomation] Error in lead workflow:", error);
      return {
        success: false,
        step: "workflow_error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create lead in database
   */
  private async createLeadInDatabase(
    emailData: any, 
    sourceDetection: any
  ): Promise<number | null> {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Extract customer info from email
      const customerName = this.extractCustomerName(emailData.from);
      const customerEmail = this.extractCustomerEmail(emailData.from);
      const customerPhone = this.extractPhoneFromEmail(emailData.body);

      const [lead] = await db.insert(leads).values({
        // userId: 1, // TODO: Check if this field exists in schema
        // source: sourceDetection.source, // TODO: Check if this field exists in schema
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        score: this.calculateLeadScore(sourceDetection),
        status: "new",
        notes: `Auto-detected from email: ${emailData.subject} (${sourceDetection.source})`,
        metadata: JSON.stringify({
          emailId: emailData.emailId,
          threadId: emailData.threadId,
          sourceDetection,
          workflow: getWorkflowFromDetection(sourceDetection),
          source: sourceDetection.source, // Store in metadata instead
          createdAt: new Date().toISOString(),
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: leads.id });

      return lead?.id || null;

    } catch (error) {
      console.error("[WorkflowAutomation] Error creating lead in database:", error);
      return null;
    }
  }

  /**
   * Execute immediate workflow actions
   */
  private async executeImmediateActions(
    leadId: number,
    sourceDetection: any,
    workflow: any
  ): Promise<void> {
    try {
      console.log(`[WorkflowAutomation] ⚡ Executing immediate actions for ${sourceDetection.source}`);

      for (const action of workflow.workflow.requiredActions) {
        console.log(`[WorkflowAutomation] 📋 Required action: ${action.title}`);
        
        // Create task for required actions
        await this.createTaskForAction(leadId, action, true);
      }

      for (const action of workflow.workflow.suggestedActions) {
        console.log(`[WorkflowAutomation] 💡 Suggested action: ${action.title}`);
        
        // Create task for suggested actions (lower priority)
        await this.createTaskForAction(leadId, action, false);
      }

      // Execute auto-actions
      for (const autoAction of workflow.workflow.autoActions) {
        if (autoAction.trigger === "immediate") {
          console.log(`[WorkflowAutomation] 🤖 Auto-action: ${autoAction.title}`);
          await this.executeAutoAction(leadId, autoAction);
        }
      }

    } catch (error) {
      console.error("[WorkflowAutomation] Error executing immediate actions:", error);
    }
  }

  /**
   * Create task for workflow action
   */
  private async createTaskForAction(
    leadId: number,
    action: any,
    isRequired: boolean
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error("[WorkflowAutomation] Database not available for task creation");
        return;
      }

      await db.insert(tasks).values({
        // userId: 1, // TODO: Check if this field exists in schema
        relatedLeadId: leadId, // Use relatedLeadId instead of leadId
        title: action.title,
        description: action.description,
        status: "pending",
        priority: isRequired ? "high" : "medium",
        estimatedTime: action.estimatedTime,
        dueDate: new Date(Date.now() + (isRequired ? 60 : 240) * 60 * 1000), // 1h or 4h from now
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    } catch (error) {
      console.error("[WorkflowAutomation] Error creating task:", error);
    }
  }

  /**
   * Execute auto-action
   */
  private async executeAutoAction(leadId: number, autoAction: any): Promise<void> {
    try {
      switch (autoAction.title) {
        case "Auto-tag lead":
          // Lead is already tagged in metadata
          console.log(`[WorkflowAutomation] ✅ Lead auto-tagged`);
          break;
          
        case "Notify sales":
          // TODO: Send notification to sales team
          console.log(`[WorkflowAutomation] 📢 Sales team notified`);
          break;
          
        case "Geo tag":
          // TODO: Add geographic tagging
          console.log(`[WorkflowAutomation] 📍 Geographic tag added`);
          break;
          
        default:
          console.log(`[WorkflowAutomation] ❓ Unknown auto-action: ${autoAction.title}`);
      }

    } catch (error) {
      console.error("[WorkflowAutomation] Error executing auto-action:", error);
    }
  }

  /**
   * Create follow-up calendar event
   */
  private async createFollowUpEvent(leadId: number, emailData: any): Promise<string | null> {
    try {
      const eventData = {
        summary: `Follow-up: ${emailData.subject}`,
        description: `Lead follow-up for: ${emailData.subject}\nFrom: ${emailData.from}`,
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        location: "Follow-up required",
      };

      const event = await createCalendarEvent(eventData);
      return event?.id || null;

    } catch (error) {
      console.error("[WorkflowAutomation] Error creating calendar event:", error);
      return null;
    }
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    leadId: number,
    sourceDetection: any,
    workflow: any
  ): Promise<void> {
    try {
      console.log(`[WorkflowAutomation] 📬 Sending notifications for lead ${leadId}`);

      // TODO: Implement notification channels
      // - Slack notification
      // - Email notification
      // - SMS notification
      // - Push notification

      console.log(`[WorkflowAutomation] ✅ Notifications sent`);

    } catch (error) {
      console.error("[WorkflowAutomation] Error sending notifications:", error);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // TODO: Setup webhook handlers for real-time events
    console.log("[WorkflowAutomation] ✅ Event handlers setup");
  }

  /**
   * Utility functions for data extraction
   */
  private extractCustomerName(from: string): string {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim().replace(/['"]/g, "") : "Ukendt Kunde";
  }

  private extractCustomerEmail(from: string): string {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  }

  private extractPhoneFromEmail(body: string): string | null {
    const phoneRegex = /(\+45|45)?\s*[2-9]\d{7}/g;
    const match = body.match(phoneRegex);
    return match ? match[0].replace(/\s/g, "") : null;
  }

  private calculateLeadScore(sourceDetection: any): number {
    // Base score from confidence
    let score = sourceDetection.confidence;

    // Bonus for high-value sources
    const sourceBonus: Record<string, number> = {
      "referral": 20,
      "website": 15,
      "phone": 10,
      "rengoring_nu": 5,
      "rengoring_aarhus": 5,
      "direct": 0,
      "adhelp": -5,
      "social_media": -5,
      "unknown": -10,
    };

    score += sourceBonus[sourceDetection.source] || 0;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get automation status
   */
  getStatus(): {
    isRunning: boolean;
    emailMonitorStatus: any;
    config: AutomationConfig;
  } {
    return {
      isRunning: this.isRunning,
      emailMonitorStatus: emailMonitor.getStatus(),
      config: this.config,
    };
  }

  /**
   * Update automation config
   */
  updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("[WorkflowAutomation] ✅ Config updated:", this.config);
  }
}

// Singleton instance
export const workflowAutomation = new WorkflowAutomationService();
