/**
 * Follow-up Reminders Configuration
 */

export interface FollowupReminderConfig {
  daysUntilReminder: number; // Default days before creating reminder
  autoDetectLeads: boolean;
  autoDetectQuotes: boolean;
  autoDetectInvoices: boolean;
}

export const DEFAULT_CONFIG: FollowupReminderConfig = {
  daysUntilReminder: 3,
  autoDetectLeads: true,
  autoDetectQuotes: true,
  autoDetectInvoices: true,
};
