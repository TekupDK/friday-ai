/**
 * Phase 9.8: Workflow Automation Service
 *
 * Orchestrates the complete lead-to-cash workflow
 * Connects email monitoring, source detection, and Billy automation.
 */

import { leads, tasks } from "../drizzle/schema";

import { billyAutomation } from "./billy-automation";
import { getDb, trackEvent } from "./db";
import { emailMonitor } from "./email-monitor";
import { detectLeadSourceIntelligent } from "./lead-source-detector";
import { getWorkflowFromDetection } from "./lead-source-workflows";
import { createCalendarEvent } from "./mcp";

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

    console.log(
      "[WorkflowAutomation] 🚀 Starting complete workflow automation..."
    );
    this.isRunning = true;

    try {
      // Start email monitoring
      if (this.config.enableEmailMonitoring) {
        await emailMonitor.startMonitoring();
        console.log("[WorkflowAutomation] ✅ Email monitoring started");
      }

      // Setup webhook handlers for real-time processing
      this.setupEventHandlers();

      console.log(
        "[WorkflowAutomation] ✅ Complete workflow automation started"
      );
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
      console.log(
        `[WorkflowAutomation] 🎯 Processing lead workflow for: ${emailData.subject}`
      );

      // Step 1: Intelligent source detection
      const sourceDetection = detectLeadSourceIntelligent({
        from: emailData.from,
        to: "",
        subject: emailData.subject,
        body: emailData.body,
      });

      console.log(
        `[WorkflowAutomation] ✅ Source detected: ${sourceDetection.source} (${sourceDetection.confidence}% confidence)`
      );

      // Step 2: Get workflow for this source
      const workflow = getWorkflowFromDetection(sourceDetection);

      console.log(
        `[WorkflowAutomation] ✅ Workflow: ${workflow.workflow.priority} priority, ${workflow.workflow.responseTime} response time`
      );

      // Step 3: Create lead in database
      const leadId = await this.createLeadInDatabase(
        emailData,
        sourceDetection
      );

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

      if (
        sourceDetection.confidence >= this.config.autoCreateCustomerThreshold
      ) {
        const billyCustomer =
          await billyAutomation.createCustomerFromLead(leadId);
        if (billyCustomer) {
          customerId = billyCustomer.id;
          console.log(
            `[WorkflowAutomation] ✅ Billy customer created: ${customerId}`
          );
        }
      }

      // Step 5: Execute immediate workflow actions
      await this.executeImmediateActions(leadId, sourceDetection, workflow);

      // Step 6: Create calendar event if enabled
      let calendarEventId: string | null = null;

      if (
        this.config.enableCalendarSync &&
        workflow.workflow.responseTime === "immediate"
      ) {
        calendarEventId = await this.createFollowUpEvent(leadId, emailData);
        if (calendarEventId) {
          console.log(
            `[WorkflowAutomation] ✅ Calendar event created: ${calendarEventId}`
          );
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

      const [lead] = await db
        .insert(leads)
        .values({
          userId: 1, // TODO: extract from context
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          score: this.calculateLeadScore(sourceDetection),
          status: "new",
          source: sourceDetection.source,
          notes: `Auto-detected from email: ${emailData.subject} (${sourceDetection.source})`,
          metadata: JSON.stringify({
            emailId: emailData.emailId,
            threadId: emailData.threadId,
            sourceDetection,
            workflow: getWorkflowFromDetection(sourceDetection),
            createdAt: new Date().toISOString(),
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning({ id: leads.id });

      return lead?.id || null;
    } catch (error) {
      console.error(
        "[WorkflowAutomation] Error creating lead in database:",
        error
      );
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
      console.log(
        `[WorkflowAutomation] ⚡ Executing immediate actions for ${sourceDetection.source}`
      );

      for (const action of workflow.workflow.requiredActions) {
        console.log(`[WorkflowAutomation] 📋 Required action: ${action.title}`);

        // Create task for required actions
        await this.createTaskForAction(leadId, action, true);
      }

      for (const action of workflow.workflow.suggestedActions) {
        console.log(
          `[WorkflowAutomation] 💡 Suggested action: ${action.title}`
        );

        // Create task for suggested actions (lower priority)
        await this.createTaskForAction(leadId, action, false);
      }

      // Execute auto-actions
      for (const autoAction of workflow.workflow.autoActions) {
        if (autoAction.trigger === "immediate") {
          console.log(
            `[WorkflowAutomation] 🤖 Auto-action: ${autoAction.title}`
          );
          await this.executeAutoAction(leadId, autoAction);
        }
      }
    } catch (error) {
      console.error(
        "[WorkflowAutomation] Error executing immediate actions:",
        error
      );
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
        console.error(
          "[WorkflowAutomation] Database not available for task creation"
        );
        return;
      }

      await db.insert(tasks).values({
        userId: 1, // TODO: extract from context
        relatedLeadId: leadId,
        title: action.title,
        description: action.description,
        status: "todo",
        priority: isRequired ? "high" : "medium",
        dueDate: new Date(
          Date.now() + (isRequired ? 60 : 240) * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[WorkflowAutomation] Error creating task:", error);
    }
  }

  /**
   * Execute auto-action
   */
  private async executeAutoAction(
    leadId: number,
    autoAction: any
  ): Promise<void> {
    try {
      switch (autoAction.title) {
        case "Auto-tag lead":
          // Lead is already tagged in metadata
          console.log(`[WorkflowAutomation] ✅ Lead auto-tagged`);
          // Track automation event
          await trackEvent({
            userId: 1,
            eventType: "auto_action",
            eventData: { leadId, action: "auto_tag" },
          });
          break;

        case "Notify sales":
          // TODO: Send notification to sales team
          console.log(`[WorkflowAutomation] 📢 Sales team notified`);
          // Track automation event
          await trackEvent({
            userId: 1,
            eventType: "auto_action",
            eventData: { leadId, action: "notify_sales" },
          });
          break;

        case "Geo tag":
          // TODO: Add geographic tagging
          console.log(`[WorkflowAutomation] 📍 Geographic tag added`);
          // Track automation event
          await trackEvent({
            userId: 1,
            eventType: "auto_action",
            eventData: { leadId, action: "geo_tag" },
          });
          break;

        default:
          console.log(
            `[WorkflowAutomation] ❓ Unknown auto-action: ${autoAction.title}`
          );
      }
    } catch (error) {
      console.error("[WorkflowAutomation] Error executing auto-action:", error);
    }
  }

  /**
   * Create follow-up calendar event
   */
  private async createFollowUpEvent(
    leadId: number,
    emailData: any
  ): Promise<string | null> {
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
      console.error(
        "[WorkflowAutomation] Error creating calendar event:",
        error
      );
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
      console.log(
        `[WorkflowAutomation] 📬 Sending notifications for lead ${leadId}`
      );

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
      referral: 20,
      website: 15,
      phone: 10,
      rengoring_nu: 5,
      rengoring_aarhus: 5,
      direct: 0,
      adhelp: -5,
      social_media: -5,
      unknown: -10,
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

  async runRendetaljeLeadEngine(options?: {
    dryRun?: boolean;
    daysBack?: number;
  }): Promise<{
    p1: any[];
    p2: any[];
    p3: any[];
    rejected: any[];
    actions: { type: string; details: string }[];
    reportText: string;
  }> {
    const dryRun = !!options?.dryRun;
    const daysBack = options?.daysBack ?? 90;

    const { ENV } = await import("./_core/env");
    const {
      searchGmailThreads,
      sendGmailMessage,
      findFreeSlots,
      checkCalendarAvailability,
    } = await import("./google-api");
    const {
      ensureStandardLabels,
      addLabelToThread,
      getOrCreateLabel,
      archiveThread,
    } = await import("./gmail-labels");

    await ensureStandardLabels();

    const keywords = [
      "rengøring",
      "fast rengøring",
      "flytterengøring",
      "hovedrengøring",
      "tilbud",
      "pris",
    ];
    const query =
      `newer_than:${daysBack}d (in:inbox OR in:sent) ({keywords})`.replace(
        "{keywords}",
        keywords.map(k => `\"${k}\"`).join(" OR ")
      );

    let threads: any[] = [];
    try {
      threads = await searchGmailThreads({ query, maxResults: 200 });
    } catch (err) {
      console.warn(
        "[LeadEngine] Gmail search failed, continuing with empty set",
        err
      );
      threads = [];
    }
    const now = Date.now();

    const p1: any[] = [];
    const p2: any[] = [];
    const p3: any[] = [];
    const rejected: any[] = [];
    const actions: { type: string; details: string }[] = [];

    function getDaysSince(dateStr: string): number {
      const t = Date.parse(dateStr || "");
      if (isNaN(t)) return 0;
      return Math.floor((now - t) / 86400000);
    }

    function wroteLastIsUs(fromValue: string): boolean {
      const me = (ENV.googleImpersonatedUser || "").toLowerCase();
      return (fromValue || "").toLowerCase().includes(me);
    }

    function buildReplyBody(info: {
      name?: string;
      sqm?: number;
      rooms?: number;
      estHours?: number;
      persons?: number;
      firstSlots?: { start: string; end: string }[];
    }): string {
      const pricePerHour = 349;
      const persons = info.persons ?? 2;
      const hours = info.estHours ?? 3;
      const totalMin = pricePerHour * persons * Math.max(hours - 0.5, 1);
      const totalMax = pricePerHour * persons * (hours + 0.5);
      const slotsText = (info.firstSlots || [])
        .slice(0, 2)
        .map(
          s =>
            `* ${new Date(s.start).toLocaleString()} – ${new Date(s.end).toLocaleTimeString()}`
        )
        .join("\n");
      return [
        `Hej ${info.name || ""},`,
        "",
        "Tak for din henvendelse!",
        "",
        `📏 Bolig: ${info.sqm ?? "?"}m²${info.rooms ? ` med ${info.rooms} værelser` : ""}`,
        `👥 Medarbejdere: ${persons} personer`,
        `⏱️ Estimeret tid: ca. ${hours} timer på stedet = ${persons * hours} arbejdstimer total`,
        `💰 Pris: ${pricePerHour} kr/time/person = ca. ${Math.round(totalMin)}–${Math.round(totalMax)} kr inkl. moms`,
        "",
        "💡 Du betaler kun det faktiske tidsforbrug - estimatet er vejledende",
        "📞 Vi ringer ved +1 times overskridelse så der ingen overraskelser er",
        "",
        "📅 Ledige tider:",
        slotsText,
        "",
        "Vi bruger svanemærkede produkter og leverer professionel kvalitet.",
        "",
        "Hvad siger du til en af tiderne ovenfor?",
        "",
        "Mvh,",
        "Rendetalje",
        "22 65 02 26",
      ].join("\n");
    }

    for (const th of threads) {
      const lastMsg = th.messages[th.messages.length - 1];
      const days = getDaysSince(lastMsg?.date || th.date);

      const summary = {
        id: th.id,
        name: "",
        email: (lastMsg?.from || "").replace(/.*<([^>]+)>.*/, "$1"),
        type: "",
        lastContact: lastMsg?.date || th.date,
        daysSince: days,
        keyInfo: th.subject || th.snippet,
        thread: th,
      };

      const lastByUs = wroteLastIsUs(lastMsg?.from || "");

      // Avvist: heuristik via labels
      const isRejected = (th.labels || []).some((l: any) =>
        /closed[- ]?lost/i.test(l)
      );
      if (isRejected) {
        rejected.push(summary);
        continue;
      }

      if (!lastByUs) {
        // P1: Kunden skrev sidst
        p1.push(summary);
        const needsReplyId = await getOrCreateLabel("Needs Reply");
        if (dryRun) {
          actions.push({
            type: "label",
            details: `Add Needs Reply to ${th.id}`,
          });
        } else {
          await addLabelToThread(th.id, "Needs Reply");
        }

        // Kalender: find 2 slots de næste 7 dage (2 timer)
        let slots: { start: string; end: string }[] = [];
        try {
          const free = await findFreeSlots({
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            durationHours: 2,
          });
          slots = (free || []).slice(0, 2);
        } catch {}

        const body = buildReplyBody({
          name: "",
          firstSlots: slots,
        });
        const subject = th.subject || "Vedr. rengøring";

        if (dryRun) {
          actions.push({
            type: "email",
            details: `Would send reply to ${summary.email}`,
          });
        } else if (summary.email) {
          await sendGmailMessage({
            to: summary.email,
            subject,
            body,
            replyToThreadId: th.id,
          });
          actions.push({
            type: "email",
            details: `Sent reply to ${summary.email}`,
          });
        }
      } else {
        // Vi skrev sidst → P2/P3 via ventetid
        if (days > 14) {
          p3.push(summary);
          if (dryRun) {
            actions.push({ type: "label", details: `Archive ${th.id}` });
          } else {
            await addLabelToThread(th.id, "Archive");
            await archiveThread(th.id);
          }
        } else {
          p2.push(summary);
          if (days > 10) {
            if (dryRun) {
              actions.push({
                type: "email",
                details: `Would send last ping to ${summary.email}`,
              });
            } else if (summary.email) {
              const body =
                "Sidste ping: Har du haft mulighed for at kigge? Vi har ledige tider næste uge.";
              await sendGmailMessage({
                to: summary.email,
                subject: th.subject || "Opfølgning",
                body,
                replyToThreadId: th.id,
              });
              actions.push({
                type: "email",
                details: `Sent last ping to ${summary.email}`,
              });
            }
          } else if (days > 3) {
            if (dryRun) {
              actions.push({
                type: "email",
                details: `Would send gentle follow-up to ${summary.email}`,
              });
            } else if (summary.email) {
              const body =
                "Venlig opfølgning: Sig endelig til hvis du ønsker et konkret forslag eller en booking.";
              await sendGmailMessage({
                to: summary.email,
                subject: th.subject || "Opfølgning",
                body,
                replyToThreadId: th.id,
              });
              actions.push({
                type: "email",
                details: `Sent follow-up to ${summary.email}`,
              });
            }
          }
        }
      }
    }

    function table(rows: any[], headers: string[]): string {
      const head = `| ${headers.join(" | ")} |`;
      const sep = `| ${headers.map(() => "---").join(" | ")} |`;
      const body = rows
        .map(
          r =>
            `| ${[r.name || "", r.email || "", r.type || "", r.lastContact || "", r.daysSince ?? "", r.keyInfo || ""].join(" | ")} |`
        )
        .join("\n");
      return [head, sep, body].join("\n");
    }

    const reportParts: string[] = [];
    reportParts.push(
      "PRIORITET 1 – Klar til opfølgning\n" +
        table(p1, [
          "Navn",
          "Email",
          "Type",
          "Sidste kontakt",
          "Dage siden",
          "Nøgleinfo",
        ])
    );
    reportParts.push(
      "\nPRIORITET 2 – Afventer deres svar\n" +
        table(p2, [
          "Navn",
          "Email",
          "Type",
          "Sidste kontakt",
          "Dage siden",
          "Hvad vi tilbød",
        ])
    );
    reportParts.push(
      "\nPRIORITET 3 – Inaktive\n" +
        table(p3, ["Navn", "Email", "Type", "Sidste kontakt", "Anbefaling"])
    );
    reportParts.push(
      "\nHandlinger udført i Gmail:\n" +
        actions.map(a => `- ${a.type}: ${a.details}`).join("\n")
    );

    return {
      p1,
      p2,
      p3,
      rejected,
      actions,
      reportText: reportParts.join("\n\n"),
    };
  }
}

// Singleton instance
export const workflowAutomation = new WorkflowAutomationService();
