/**
 * Phase 9.8: Workflow Automation API
 *
 * REST endpoints to control and monitor the automation system
 */

import { z } from "zod";

import { permissionProcedure, protectedProcedure, router } from "../_core/trpc";
import { billyAutomation } from "../billy-automation";
import * as db from "../db";
import { emailAnalysisEngine } from "../email-analysis-engine";
import { emailMonitor } from "../email-monitor";
import { generateSourceAnalytics } from "../lead-source-analytics";
import { workflowAutomation } from "../workflow-automation";

const { trackEvent } = db;

/**
 * Phase 9.8: Automation control router
 */
export const automationRouter = router({
  // Start/Stop complete automation
  startAutomation: protectedProcedure.mutation(async () => {
    try {
      await workflowAutomation.startAutomation();
      return {
        success: true,
        message: "Workflow automation started successfully",
        status: workflowAutomation.getStatus(),
      };
    } catch (error) {
      throw new Error(`Failed to start automation: ${error}`);
    }
  }),

  stopAutomation: protectedProcedure.mutation(async () => {
    try {
      await workflowAutomation.stopAutomation();
      return {
        success: true,
        message: "Workflow automation stopped successfully",
        status: workflowAutomation.getStatus(),
      };
    } catch (error) {
      throw new Error(`Failed to stop automation: ${error}`);
    }
  }),

  // Get automation status
  getAutomationStatus: protectedProcedure.query(async () => {
    return {
      workflow: workflowAutomation.getStatus(),
      emailMonitor: emailMonitor.getStatus(),
      timestamp: new Date().toISOString(),
    };
  }),

  // Process individual lead manually
  processLead: protectedProcedure
    .input(
      z.object({
        emailId: z.string(),
        threadId: z.string(),
        subject: z.string(),
        from: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await workflowAutomation.processLeadWorkflow(input);
        return {
          success: result.success,
          result,
          message: result.success
            ? "Lead processed successfully"
            : `Failed to process lead: ${result.error}`,
        };
      } catch (error) {
        throw new Error(`Failed to process lead: ${error}`);
      }
    }),

  // Billy automation functions
  createBillyCustomer: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const customer = await billyAutomation.createCustomerFromLead(
          input.leadId
        );
        return {
          success: !!customer,
          customer,
          message: customer
            ? "Billy customer created successfully"
            : "Failed to create Billy customer",
        };
      } catch (error) {
        throw new Error(`Failed to create Billy customer: ${error}`);
      }
    }),

  createInvoiceFromJob: permissionProcedure("create_invoice")
    .input(
      z.object({
        leadId: z.number(),
        jobType: z.string(),
        hoursWorked: z.number(),
        hourlyRate: z.number(),
        materials: z.number().optional(),
        travelCost: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // ✅ RBAC: Only owner can create invoices (enforced by permissionProcedure)
      try {
        const result = await billyAutomation.createInvoiceFromJob(input);
        return {
          success: result.success,
          result,
          message: result.success
            ? "Invoice created successfully"
            : `Failed to create invoice: ${result.error}`,
        };
      } catch (error) {
        throw new Error(`Failed to create invoice: ${error}`);
      }
    }),

  getFinancialSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      try {
        const summary = await billyAutomation.getFinancialSummary(
          new Date(input.startDate),
          new Date(input.endDate)
        );
        return {
          success: true,
          summary,
        };
      } catch (error) {
        throw new Error(`Failed to get financial summary: ${error}`);
      }
    }),

  // Email monitoring control
  startEmailMonitoring: protectedProcedure.mutation(async () => {
    try {
      await emailMonitor.startMonitoring();
      return {
        success: true,
        message: "Email monitoring started successfully",
        status: emailMonitor.getStatus(),
      };
    } catch (error) {
      throw new Error(`Failed to start email monitoring: ${error}`);
    }
  }),

  stopEmailMonitoring: protectedProcedure.mutation(async () => {
    try {
      emailMonitor.stopMonitoring();
      return {
        success: true,
        message: "Email monitoring stopped successfully",
        status: emailMonitor.getStatus(),
      };
    } catch (error) {
      throw new Error(`Failed to stop email monitoring: ${error}`);
    }
  }),

  // Configuration
  updateAutomationConfig: protectedProcedure
    .input(
      z.object({
        enableEmailMonitoring: z.boolean().optional(),
        enableBillyAutomation: z.boolean().optional(),
        enableCalendarSync: z.boolean().optional(),
        autoProcessThreshold: z.number().min(0).max(100).optional(),
        autoCreateCustomerThreshold: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        workflowAutomation.updateConfig(input);
        return {
          success: true,
          message: "Automation configuration updated successfully",
          config: workflowAutomation.getStatus().config,
        };
      } catch (error) {
        throw new Error(`Failed to update config: ${error}`);
      }
    }),

  // Analytics
  getSourceAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      try {
        const analytics = generateSourceAnalytics(
          new Date(input.startDate),
          new Date(input.endDate)
        );
        return {
          success: true,
          analytics,
        };
      } catch (error) {
        throw new Error(`Failed to get source analytics: ${error}`);
      }
    }),

  // Phase 9.9: Email Assistant
  analyzeEmail: protectedProcedure
    .input(
      z.object({
        from: z.string(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Analyze email content
        const analysis = emailAnalysisEngine.analyzeEmail(input);

        // Generate suggestions
        const suggestions = emailAnalysisEngine.generateSuggestions(analysis);

        return {
          success: true,
          analysis,
          suggestions,
        };
      } catch (error) {
        throw new Error(`Failed to analyze email: ${error}`);
      }
    }),

  logSuggestionUsage: protectedProcedure
    .input(
      z.object({
        suggestionId: z.string(),
        emailData: z.object({
          from: z.string(),
          subject: z.string(),
          body: z.string(),
          threadId: z.string().optional(),
        }),
        chosenContent: z.string(),
        sent: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Log to analytics database
        await trackEvent({
          userId: ctx.user.id,
          eventType: "email_assistant_suggestion_used",
          eventData: {
            suggestionId: input.suggestionId,
            emailSubject: input.emailData.subject,
            emailFrom: input.emailData.from,
            threadId: input.emailData.threadId,
            chosenContent: input.chosenContent,
            sent: input.sent || false,
            timestamp: new Date().toISOString(),
          },
        });
        
        console.log(`[EmailAssistant] Suggestion used: ${input.suggestionId}`);
        console.log(`[EmailAssistant] Email: ${input.emailData.subject}`);
        console.log(`[EmailAssistant] Sent: ${input.sent || false}`);

        return {
          success: true,
          message: "Suggestion usage logged",
        };
      } catch (error) {
        throw new Error(`Failed to log suggestion usage: ${error}`);
      }
    }),

  runRendetaljeLeadEngine: protectedProcedure
    .input(
      z.object({
        dryRun: z.boolean().optional(),
        daysBack: z.number().min(1).max(180).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await workflowAutomation.runRendetaljeLeadEngine({
          dryRun: input.dryRun ?? true,
          daysBack: input.daysBack ?? 90,
        });
        return {
          success: true,
          message: "Rendetalje Lead Engine executed",
          counts: {
            p1: result.p1.length,
            p2: result.p2.length,
            p3: result.p3.length,
            actions: result.actions.length,
          },
          reportText: result.reportText,
        };
      } catch (error) {
        throw new Error(`Failed to run lead engine: ${error}`);
      }
    }),
});
