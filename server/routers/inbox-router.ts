import { router } from "../_core/trpc";

import { aiRouter } from "./inbox/ai-router";
import { calendarRouter } from "./inbox/calendar-router";
import { emailRouter } from "./inbox/email-router";
import { invoicesRouter } from "./inbox/invoices-router";
import { leadsRouter } from "./inbox/leads-router";
import { pipelineRouter } from "./inbox/pipeline-router";
import { tasksRouter } from "./inbox/tasks-router";

/**
 * Main inbox router that combines all inbox-related sub-routers.
 *
 * This router was refactored from a single 1917-line file into smaller,
 * focused router files for better maintainability and performance.
 *
 * Structure:
 * - email: Email operations (list, send, archive, etc.)
 * - AI features: Email summaries and label suggestions (at inbox level for backward compatibility)
 * - invoices: Invoice management
 * - calendar: Calendar event management
 * - leads: Lead management
 * - tasks: Task management
 * - pipeline: Email pipeline state management
 */
export const inboxRouter = router({
  email: emailRouter,
  // AI features are at inbox level (not nested) for backward compatibility
  getEmailSummary: aiRouter.getEmailSummary,
  generateEmailSummary: aiRouter.generateEmailSummary,
  batchGenerateSummaries: aiRouter.batchGenerateSummaries,
  getLabelSuggestions: aiRouter.getLabelSuggestions,
  generateLabelSuggestions: aiRouter.generateLabelSuggestions,
  applyLabel: aiRouter.applyLabel,
  batchGenerateLabelSuggestions: aiRouter.batchGenerateLabelSuggestions,
  batchRemoveDbLabels: aiRouter.batchRemoveDbLabels,
  invoices: invoicesRouter,
  calendar: calendarRouter,
  leads: leadsRouter,
  tasks: tasksRouter,
  pipeline: pipelineRouter,
});
