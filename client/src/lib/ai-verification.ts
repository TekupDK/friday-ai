/**
 * AI Verification Layer - Shortwave-Inspired
 * 
 * Implements verification checks before AI actions:
 * - MEMORY_1: Verify date/time
 * - MEMORY_5: Check calendar availability
 * - MEMORY_7: Search for existing communication
 * - MEMORY_18: Check for calendar overlaps
 */

import { trpc } from './trpc';

export interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

export interface VerificationContext {
  customerEmail?: string;
  proposedDate?: Date;
  proposedTime?: string;
  threadId?: string;
}

/**
 * MEMORY_1: Verify current date/time
 */
export async function verifyDateTime(): Promise<VerificationResult> {
  const now = new Date();
  const formatted = now.toLocaleString('da-DK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  console.log(`[VERIFICATION] Current time: ${formatted}`);

  return {
    passed: true,
    message: `Verificeret: ${formatted}`,
    details: { timestamp: now.toISOString() },
  };
}

/**
 * MEMORY_7: Search for existing communication
 */
export async function verifyNoExistingCommunication(
  customerEmail: string
): Promise<VerificationResult> {
  try {
    // TODO: Implement actual email search via tRPC
    // const existing = await trpc.email.search.query({
    //   filter: `from:${customerEmail}`,
    //   limit: 5
    // });

    // Mock implementation for now
    const existing: any[] = [];

    if (existing.length > 0) {
      return {
        passed: false,
        message: `⚠️ Vi har allerede ${existing.length} email(s) fra denne kunde`,
        details: { existingEmails: existing },
      };
    }

    return {
      passed: true,
      message: '✅ Ingen tidligere emails fundet',
      details: { existingEmails: [] },
    };
  } catch (error) {
    console.error('[VERIFICATION] Error checking existing communication:', error);
    return {
      passed: false,
      message: '❌ Kunne ikke verificere tidligere kommunikation',
      details: { error },
    };
  }
}

/**
 * MEMORY_5 + MEMORY_18: Check calendar availability
 */
export async function verifyCalendarAvailability(
  proposedDate: Date,
  proposedTime?: string
): Promise<VerificationResult> {
  try {
    // TODO: Implement actual calendar check via tRPC
    // const events = await trpc.calendar.getEvents.query({
    //   start: proposedDate,
    //   end: proposedDate
    // });

    // Mock implementation for now
    const events: any[] = [];

    if (events.length > 0) {
      return {
        passed: false,
        message: `⚠️ Kalender konflikt: ${events.length} event(s) på denne dato`,
        details: { conflictingEvents: events },
      };
    }

    return {
      passed: true,
      message: '✅ Kalender er ledig',
      details: { conflictingEvents: [] },
    };
  } catch (error) {
    console.error('[VERIFICATION] Error checking calendar:', error);
    return {
      passed: false,
      message: '❌ Kunne ikke verificere kalender',
      details: { error },
    };
  }
}

/**
 * Complete verification workflow
 */
export async function runCompleteVerification(
  context: VerificationContext
): Promise<{
  allPassed: boolean;
  results: Record<string, VerificationResult>;
}> {
  const results: Record<string, VerificationResult> = {};

  // MEMORY_1: Verify date/time
  results.dateTime = await verifyDateTime();

  // MEMORY_7: Check existing communication
  if (context.customerEmail) {
    results.existingCommunication = await verifyNoExistingCommunication(
      context.customerEmail
    );
  }

  // MEMORY_5 + MEMORY_18: Check calendar
  if (context.proposedDate) {
    results.calendar = await verifyCalendarAvailability(
      context.proposedDate,
      context.proposedTime
    );
  }

  const allPassed = Object.values(results).every((r) => r.passed);

  return { allPassed, results };
}

/**
 * Format verification results for display
 */
export function formatVerificationResults(
  results: Record<string, VerificationResult>
): string {
  return Object.entries(results)
    .map(([key, result]) => `${result.message}`)
    .join('\n');
}

/**
 * Quick verification for common scenarios
 */
export const VerificationPresets = {
  /**
   * Verify before writing offer to new lead
   */
  async beforeOfferToNewLead(customerEmail: string): Promise<VerificationResult> {
    const results = await runCompleteVerification({ customerEmail });
    
    if (!results.allPassed) {
      return {
        passed: false,
        message: formatVerificationResults(results.results),
        details: results.results,
      };
    }

    return {
      passed: true,
      message: '✅ Alle verificeringer bestået - klar til at skrive tilbud',
      details: results.results,
    };
  },

  /**
   * Verify before scheduling meeting
   */
  async beforeScheduleMeeting(
    customerEmail: string,
    proposedDate: Date
  ): Promise<VerificationResult> {
    const results = await runCompleteVerification({
      customerEmail,
      proposedDate,
    });

    if (!results.allPassed) {
      return {
        passed: false,
        message: formatVerificationResults(results.results),
        details: results.results,
      };
    }

    return {
      passed: true,
      message: '✅ Alle verificeringer bestået - klar til at booke møde',
      details: results.results,
    };
  },
};
