/**
 * V4.3 Deduplication & Merging
 *
 * Handles:
 * - Multiple Gmail threads from same customer
 * - Multiple Calendar events for same customer
 * - Multiple Billy invoices for same customer
 * - Recurring customers (Fast rengøring)
 * - Dead/spam lead filtering
 */

import { LeadStatus, determineLeadStatus } from "./v4_3-config";
import { V4_3_Lead } from "./v4_3-types";

// ============================================================================
// DEDUPLICATION KEY GENERATION
// ============================================================================

/**
 * Generate a unique customer key for deduplication
 * Priority: email > phone > normalized name
 */
export function generateCustomerKey(lead: {
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerName?: string | null;
}): string {
  // Email is best identifier
  if (lead.customerEmail) {
    return `email:${normalizeEmail(lead.customerEmail)}`;
  }

  // Phone as fallback
  if (lead.customerPhone) {
    return `phone:${normalizePhone(lead.customerPhone)}`;
  }

  // Name as last resort (less reliable)
  if (lead.customerName) {
    return `name:${normalizeName(lead.customerName)}`;
  }

  return "unknown";
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  // Remove all non-digits
  return phone.replace(/\D/g, "");
}

function normalizeName(name: string): string {
  // Lowercase, remove extra spaces, remove special chars
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zæøå\s]/gi, "");
}

// ============================================================================
// LEAD MERGING
// ============================================================================

/**
 * Merge multiple leads for the same customer into one canonical lead
 *
 * Strategy:
 * - Keep most complete Gmail data
 * - Keep all Calendar events (track multiple bookings)
 * - Keep all Billy invoices (track payment history)
 * - Calculate aggregated metrics (lifetime value, total bookings, etc.)
 */
export function mergeCustomerLeads(leads: V4_3_Lead[]): V4_3_Lead {
  if (leads.length === 0) {
    throw new Error("Cannot merge empty leads array");
  }

  if (leads.length === 1) {
    return leads[0];
  }

  // Use the most recent lead as base
  const baseLead = leads.sort((a, b) => {
    const dateA = a.gmail?.date || a.calendar?.startTime || "";
    const dateB = b.gmail?.date || b.calendar?.startTime || "";
    return dateB.localeCompare(dateA);
  })[0];

  // Collect all Gmail threads
  const gmailThreads = leads
    .filter(l => l.gmail)
    .map(l => l.gmail!)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Collect all Calendar events
  const calendarEvents = leads
    .filter(l => l.calendar)
    .map(l => l.calendar!)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));

  // Collect all Billy invoices
  const billyInvoices = leads
    .filter(l => l.billy)
    .map(l => l.billy!)
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));

  // Use most complete data for each field
  const merged: V4_3_Lead = {
    ...baseLead,

    // Use best available email/phone/name
    customerEmail:
      leads.find(l => l.customerEmail)?.customerEmail || baseLead.customerEmail,
    customerPhone:
      leads.find(l => l.customerPhone)?.customerPhone || baseLead.customerPhone,
    customerName:
      leads.find(l => l.customerName)?.customerName || baseLead.customerName,

    // Use most recent Gmail data (but track all threads internally)
    gmail: gmailThreads[0] || null,

    // Use most recent Calendar event
    calendar: calendarEvents[0] || null,

    // Use most recent Billy invoice
    billy: billyInvoices[0] || null,

    // Store arrays for historical tracking (extend interface if needed)
    // allGmailThreads: gmailThreads,
    // allCalendarEvents: calendarEvents,
    // allBillyInvoices: billyInvoices,
  };

  // Recalculate customer value metrics based on all data
  const totalInvoiced = billyInvoices.reduce(
    (sum, inv) => sum + inv.invoicedPrice,
    0
  );
  const avgBooking =
    billyInvoices.length > 0 ? totalInvoiced / billyInvoices.length : 0;
  const totalBookingsCount = calendarEvents.length;
  const isRec = totalBookingsCount > 1 || billyInvoices.length > 1;

  merged.customer = {
    isRepeatCustomer: isRec,
    totalBookings: totalBookingsCount,
    lifetimeValue: totalInvoiced,
    averageBookingValue: avgBooking,
    avgBookingValue: avgBooking, // alias
    repeatRate:
      totalBookingsCount > 1
        ? ((totalBookingsCount - 1) / totalBookingsCount) * 100
        : 0,
    firstBookingDate:
      calendarEvents.length > 0
        ? calendarEvents[calendarEvents.length - 1].startTime
        : null,
    lastBookingDate:
      calendarEvents.length > 0 ? calendarEvents[0].startTime : null,
    daysBetweenBookings: calculateAvgDaysBetweenBookings(calendarEvents),
    isActive: false, // TODO: compute based on Oct-Nov period
    isRecurring: isRec,
    recurringFrequency: totalBookingsCount > 1 ? ("irregular" as const) : null,
  };

  return merged;
}

function calculateAvgDaysBetweenBookings(
  events: Array<{ startTime: string }>
): number | null {
  if (events.length < 2) return null;

  const sortedDates = events
    .map(e => new Date(e.startTime).getTime())
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const days = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(days);
  }

  return intervals.reduce((sum, d) => sum + d, 0) / intervals.length;
}

// ============================================================================
// LEAD FILTERING
// ============================================================================

export interface LeadFilterConfig {
  includeSpam: boolean;
  includeDead: boolean;
  includeNoResponse: boolean;
  minDataCompleteness?: number; // 0-100%
  requiredFields?: Array<"billy" | "calendar" | "gmail">;
}

export const DEFAULT_FILTER_CONFIG: LeadFilterConfig = {
  includeSpam: false,
  includeDead: false,
  includeNoResponse: true,
  minDataCompleteness: 0, // No minimum by default
  requiredFields: [],
};

/**
 * Filter leads based on status and data quality
 */
export function filterLeads(
  leads: V4_3_Lead[],
  config: LeadFilterConfig = DEFAULT_FILTER_CONFIG
): V4_3_Lead[] {
  return leads.filter(lead => {
    // Determine status
    const status = determineLeadStatus(lead);

    // Filter spam
    if (!config.includeSpam && status === LeadStatus.SPAM) {
      return false;
    }

    // Filter dead leads
    if (!config.includeDead && status === LeadStatus.DEAD) {
      return false;
    }

    // Filter no response
    if (!config.includeNoResponse && status === LeadStatus.NO_RESPONSE) {
      return false;
    }

    // Check data completeness
    if (config.minDataCompleteness && config.minDataCompleteness > 0) {
      if (
        lead.calculated.quality.dataCompleteness < config.minDataCompleteness
      ) {
        return false;
      }
    }

    // Check required fields
    if (config.requiredFields && config.requiredFields.length > 0) {
      for (const field of config.requiredFields) {
        if (!lead[field]) {
          return false;
        }
      }
    }

    return true;
  });
}

// ============================================================================
// DEDUPLICATION WORKFLOW
// ============================================================================

/**
 * Complete deduplication workflow
 *
 * 1. Group leads by customer key (email/phone/name)
 * 2. Merge leads for same customer
 * 3. Filter spam/dead/low-quality leads
 * 4. Return deduplicated array
 */
export function deduplicateLeads(
  leads: V4_3_Lead[],
  filterConfig?: LeadFilterConfig
): V4_3_Lead[] {
  console.log(`\n🔄 Deduplicating ${leads.length} leads...`);

  // Group by customer key
  const customerGroups = new Map<string, V4_3_Lead[]>();

  for (const lead of leads) {
    const key = generateCustomerKey(lead);
    if (!customerGroups.has(key)) {
      customerGroups.set(key, []);
    }
    customerGroups.get(key)!.push(lead);
  }

  console.log(`  → Found ${customerGroups.size} unique customers`);

  // Merge leads for each customer
  const mergedLeads: V4_3_Lead[] = [];
  let totalMerged = 0;

  for (const [key, groupLeads] of customerGroups.entries()) {
    if (groupLeads.length > 1) {
      console.log(
        `  → Merging ${groupLeads.length} leads for customer: ${key}`
      );
      totalMerged += groupLeads.length - 1;
    }
    const merged = mergeCustomerLeads(groupLeads);
    mergedLeads.push(merged);
  }

  console.log(`  → Merged ${totalMerged} duplicate leads`);

  // Apply filters
  const filtered = filterConfig
    ? filterLeads(mergedLeads, filterConfig)
    : mergedLeads;

  console.log(`  → After filtering: ${filtered.length} leads remaining`);
  console.log(`  → Removed: ${mergedLeads.length - filtered.length} leads\n`);

  return filtered;
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export interface DeduplicationSummary {
  input: {
    total: number;
  };
  deduplication: {
    uniqueCustomers: number;
    duplicatesRemoved: number;
    mergedLeads: number;
  };
  filtering: {
    spamFiltered: number;
    deadFiltered: number;
    noResponseFiltered: number;
    lowQualityFiltered: number;
  };
  output: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export function generateDeduplicationSummary(
  inputLeads: V4_3_Lead[],
  outputLeads: V4_3_Lead[]
): DeduplicationSummary {
  const uniqueCustomers = new Set(outputLeads.map(l => generateCustomerKey(l)))
    .size;

  const statusCounts: Record<string, number> = {};
  for (const lead of outputLeads) {
    const status = determineLeadStatus(lead);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  return {
    input: {
      total: inputLeads.length,
    },
    deduplication: {
      uniqueCustomers,
      duplicatesRemoved: inputLeads.length - uniqueCustomers,
      mergedLeads: outputLeads.filter(l => l.customer.isRepeatCustomer).length,
    },
    filtering: {
      spamFiltered: inputLeads.length - outputLeads.length,
      deadFiltered: 0, // TODO: Track separately
      noResponseFiltered: 0,
      lowQualityFiltered: 0,
    },
    output: {
      total: outputLeads.length,
      byStatus: statusCounts,
    },
  };
}
