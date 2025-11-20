import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { customerRouter } from "./customer-router";
import { adminUserRouter } from "./routers/admin-user-router";
import { aiMetricsRouter } from "./routers/ai-metrics-router";
import { authRouter } from "./routers/auth-router";
import { automationRouter } from "./routers/automation-router";
import { chatRouter } from "./routers/chat-router";
import { chatStreamingRouter } from "./routers/chat-streaming";
import { crmActivityRouter } from "./routers/crm-activity-router";
import { crmBookingRouter } from "./routers/crm-booking-router";
import { crmCustomerRouter } from "./routers/crm-customer-router";
import { crmExtensionsRouter } from "./routers/crm-extensions-router";
import { crmLeadRouter } from "./routers/crm-lead-router";
import { crmServiceTemplateRouter } from "./routers/crm-service-template-router";
import { crmStatsRouter } from "./routers/crm-stats-router";
import { emailIntelligenceRouter } from "./routers/email-intelligence-router";
import { fridayLeadsRouter } from "./routers/friday-leads-router";
import { fridayRouter } from "./routers/friday-router";
import { inboxRouter } from "./routers/inbox-router";
import { reportsRouter } from "./routers/reports-router";
import { twoFactorRouter } from "./routers/two-factor-router";
import { uiAnalysisRouter } from "./routers/ui-analysis-router";
import { workspaceRouter } from "./routers/workspace-router";

/**
 * Main Application Router
 *
 * This router was refactored from a single 340-line file into smaller,
 * focused router files for better maintainability and performance.
 *
 * Structure:
 * - system: System-level operations
 * - customer: Customer management
 * - auth: Authentication
 * - workspace: Workspace management
 * - inbox: Email, calendar, leads, tasks, invoices
 * - aiMetrics: AI metrics and analytics
 * - emailIntelligence: Email intelligence features
 * - fridayLeads: Friday AI leads integration
 * - uiAnalysis: UI analysis features
 * - crm: CRM features (customer, lead, booking, serviceTemplate, stats, activity, extensions)
 * - chat: Chat conversations and messages
 * - friday: Legacy Friday AI helper endpoints
 * - automation: Automation features
 * - chatStreaming: Enhanced chat with streaming
 * - twoFactor: Two-factor authentication (2FA) management
 */
export const appRouter = router({
  system: systemRouter,
  customer: customerRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  inbox: inboxRouter,
  aiMetrics: aiMetricsRouter,
  emailIntelligence: emailIntelligenceRouter,
  fridayLeads: fridayLeadsRouter,
  uiAnalysis: uiAnalysisRouter,
  admin: router({
    users: adminUserRouter, // Admin user management (create, list, update, delete team members)
  }),
  crm: router({
    customer: crmCustomerRouter,
    lead: crmLeadRouter,
    booking: crmBookingRouter,
    serviceTemplate: crmServiceTemplateRouter,
    stats: crmStatsRouter,
    activity: crmActivityRouter,
    extensions: crmExtensionsRouter, // Phase 2-6: Opportunities, Segments, Documents, Audit, Relationships
  }),
  chat: chatRouter,
  friday: fridayRouter,
  automation: automationRouter,
  chatStreaming: chatStreamingRouter, // Enhanced chat with streaming and unified flow
  reports: reportsRouter, // Business reports and analytics
  twoFactor: twoFactorRouter, // ✅ SECURITY: Two-factor authentication management
});

export type AppRouter = typeof appRouter;
