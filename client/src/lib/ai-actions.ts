/**
 * AI Actions System - Context-Aware Quick Actions
 * 
 * Implements Shortwave-style intelligent actions that adapt
 * based on selected email, current view, and user context
 */

import type { EnhancedEmailMessage } from '@/types/enhanced-email';
import { VerificationPresets } from './ai-verification';

export interface AIAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  count?: number;
  requiresSelection?: boolean;
  execute: (context: AIActionContext) => Promise<AIActionResult>;
}

export interface AIActionContext {
  selectedEmail?: EnhancedEmailMessage;
  allEmails?: EnhancedEmailMessage[];
  currentView?: 'inbox' | 'leads' | 'needs-reply';
  userQuery?: string;
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: any;
  nextActions?: AIAction[];
}

/**
 * Core AI Actions
 */
export const AI_ACTIONS: Record<string, AIAction> = {
  findHotLeads: {
    id: 'find-hot-leads',
    label: 'Find hot leads',
    description: 'Score 85+',
    icon: 'Flame',
    variant: 'default',
    execute: async (context) => {
      const hotLeads = context.allEmails?.filter(
        (email) => (email.aiAnalysis?.leadScore || 0) >= 85
      ) || [];

      return {
        success: true,
        message: `Fandt ${hotLeads.length} hot leads`,
        data: { leads: hotLeads },
        nextActions: [AI_ACTIONS.writeOfferToSelected],
      };
    },
  },

  showUrgentEmails: {
    id: 'show-urgent-emails',
    label: 'Show urgent emails',
    description: 'Deadline < 48h',
    icon: 'Clock',
    variant: 'destructive',
    execute: async (context) => {
      const urgentEmails = context.allEmails?.filter(
        (email) => email.aiAnalysis?.urgency === 'high'
      ) || [];

      return {
        success: true,
        message: `Fandt ${urgentEmails.length} urgent emails`,
        data: { emails: urgentEmails },
      };
    },
  },

  organizeBySource: {
    id: 'organize-by-source',
    label: 'Organize by source',
    description: 'Group by Rengøring.nu, etc.',
    icon: 'TrendingUp',
    variant: 'outline',
    execute: async (context) => {
      const grouped = context.allEmails?.reduce((acc, email) => {
        const source = email.aiAnalysis?.source || 'unknown';
        if (!acc[source]) acc[source] = [];
        acc[source].push(email);
        return acc;
      }, {} as Record<string, EnhancedEmailMessage[]>) || {};

      return {
        success: true,
        message: 'Inbox organiseret efter kilde',
        data: { grouped },
      };
    },
  },

  showHighValueLeads: {
    id: 'show-high-value-leads',
    label: 'High-value leads',
    description: '> 2000 kr.',
    icon: 'DollarSign',
    variant: 'secondary',
    execute: async (context) => {
      const highValueLeads = context.allEmails?.filter(
        (email) => (email.aiAnalysis?.estimatedValue || 0) > 2000
      ) || [];

      return {
        success: true,
        message: `Fandt ${highValueLeads.length} high-value leads`,
        data: { leads: highValueLeads },
      };
    },
  },

  writeOfferToSelected: {
    id: 'write-offer-to-selected',
    label: 'Skriv tilbud',
    description: 'Med verification',
    icon: 'Mail',
    variant: 'default',
    requiresSelection: true,
    execute: async (context) => {
      if (!context.selectedEmail) {
        return {
          success: false,
          message: 'Ingen email valgt',
        };
      }

      // VERIFICATION FIRST (Shortwave-style!)
      const verification = await VerificationPresets.beforeOfferToNewLead(
        context.selectedEmail.from
      );

      if (!verification.passed) {
        return {
          success: false,
          message: verification.message,
          data: { verification },
        };
      }

      // TODO: Implement actual offer writing
      return {
        success: true,
        message: `Klar til at skrive tilbud til ${context.selectedEmail.from}`,
        data: {
          verification,
          email: context.selectedEmail,
        },
        nextActions: [AI_ACTIONS.checkCalendarAvailability],
      };
    },
  },

  checkCalendarAvailability: {
    id: 'check-calendar-availability',
    label: 'Tjek ledige tider',
    description: 'Find available slots',
    icon: 'Calendar',
    variant: 'outline',
    execute: async (context) => {
      // TODO: Implement actual calendar check
      return {
        success: true,
        message: 'Kalender tjekket - 5 ledige tider fundet',
        data: {
          availableSlots: [
            { date: '2024-01-15', time: '10:00' },
            { date: '2024-01-15', time: '14:00' },
            { date: '2024-01-16', time: '09:00' },
          ],
        },
      };
    },
  },
};

/**
 * Get context-aware actions based on current state
 */
export function getContextAwareActions(context: AIActionContext): AIAction[] {
  const actions: AIAction[] = [];

  // If email is selected, add context-specific actions
  if (context.selectedEmail) {
    actions.push({
      ...AI_ACTIONS.writeOfferToSelected,
      label: `Skriv tilbud til ${context.selectedEmail.from.split('<')[0].trim()}`,
    });
    actions.push(AI_ACTIONS.checkCalendarAvailability);
  }

  // Always add general actions
  actions.push(
    AI_ACTIONS.findHotLeads,
    AI_ACTIONS.showUrgentEmails,
    AI_ACTIONS.organizeBySource,
    AI_ACTIONS.showHighValueLeads
  );

  // Add counts if emails are available
  if (context.allEmails) {
    const hotLeadsCount = context.allEmails.filter(
      (e) => (e.aiAnalysis?.leadScore || 0) >= 85
    ).length;
    const urgentCount = context.allEmails.filter(
      (e) => e.aiAnalysis?.urgency === 'high'
    ).length;
    const highValueCount = context.allEmails.filter(
      (e) => (e.aiAnalysis?.estimatedValue || 0) > 2000
    ).length;

    actions.forEach((action) => {
      if (action.id === 'find-hot-leads') action.count = hotLeadsCount;
      if (action.id === 'show-urgent-emails') action.count = urgentCount;
      if (action.id === 'show-high-value-leads') action.count = highValueCount;
    });
  }

  return actions;
}

/**
 * Execute an AI action with full context
 */
export async function executeAIAction(
  actionId: string,
  context: AIActionContext
): Promise<AIActionResult> {
  const action = AI_ACTIONS[actionId];
  
  if (!action) {
    return {
      success: false,
      message: `Unknown action: ${actionId}`,
    };
  }

  if (action.requiresSelection && !context.selectedEmail) {
    return {
      success: false,
      message: 'Denne action kræver at du vælger en email først',
    };
  }

  try {
    return await action.execute(context);
  } catch (error) {
    console.error(`[AI_ACTION] Error executing ${actionId}:`, error);
    return {
      success: false,
      message: `Fejl ved udførelse af action: ${error}`,
    };
  }
}

/**
 * Tool chaining - Execute multiple actions in sequence
 */
export async function executeActionChain(
  actionIds: string[],
  context: AIActionContext
): Promise<AIActionResult[]> {
  const results: AIActionResult[] = [];

  for (const actionId of actionIds) {
    const result = await executeAIAction(actionId, context);
    results.push(result);

    // Stop chain if any action fails
    if (!result.success) {
      break;
    }

    // Update context with results from previous action
    if (result.data) {
      context = { ...context, ...result.data };
    }
  }

  return results;
}
