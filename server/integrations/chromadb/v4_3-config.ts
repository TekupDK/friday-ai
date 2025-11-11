/**
 * V4.3 Configuration
 * 
 * Lead costs, service types, and business rules for V4.3 enrichment
 */

// ============================================================================
// TIME WINDOW
// ============================================================================

// V4.3.4: Full history (Jul-Dec 2025) for complete recurring patterns + active/recurring tags
export const TIME_WINDOW = {
  start: '2025-07-01T00:00:00Z',
  end: '2025-12-31T23:59:59Z',
  startDate: '2025-07-01',
  endDate: '2025-12-31',
};

// Active period for tagging (most recent 2 months)
export const ACTIVE_PERIOD = {
  start: '2025-10-01T00:00:00Z',
  end: '2025-11-30T23:59:59Z',
};

// ============================================================================
// LEAD SOURCE TYPES & ENUMS
// ============================================================================

export enum LeadSource {
  LEADPOINT_AARHUS = 'Leadpoint.dk',
  RENGOERING_NU = 'Rengøring.nu',
  ADHELP = 'AdHelp',
  DIRECT = 'Direct',
  EXISTING = 'Existing',
}

// ============================================================================
// LEAD COSTS PER PARTNER (VERIFIED Nov 2025)
// ============================================================================

interface LeadCostConfig {
  perLead: number | { private: number; erhverv: number };
  monthlyFixed: number;
  description: string;
  verifiedDate: string;
}

/**
 * VERIFIED Lead Costs (Nov 2025)
 * 
 * Sources:
 * - Leadpoint: Jonas email ([Opsigelse af samarbejdsaftale])
 * - AdHelp: Silas email 19/8 ([Flere lokale rengøringskunder])
 * - Rengøring.nu: Nettbureau invoices Aug-Oct 2025
 */
export const LEAD_COST_CONFIG: Record<LeadSource, LeadCostConfig> = {
  [LeadSource.LEADPOINT_AARHUS]: {
    perLead: { private: 150, erhverv: 750 },
    monthlyFixed: 0,
    description: '750kr/5 leads (privat), 750kr/lead (erhverv)',
    verifiedDate: '2025-11-03',
  },
  [LeadSource.ADHELP]: {
    perLead: 250,
    monthlyFixed: 0,
    description: '250kr per lead, ~60% conversion rate',
    verifiedDate: '2025-08-19',
  },
  [LeadSource.RENGOERING_NU]: {
    perLead: 65,
    monthlyFixed: 100,
    description: '65kr per lead + 100kr monthly service fee',
    verifiedDate: '2025-10-31',
  },
  [LeadSource.DIRECT]: {
    perLead: 0,
    monthlyFixed: 0,
    description: 'Direct customer inquiries (organic)',
    verifiedDate: '2025-11-10',
  },
  [LeadSource.EXISTING]: {
    perLead: 0,
    monthlyFixed: 0,
    description: 'Existing/repeat customers',
    verifiedDate: '2025-11-10',
  },
};

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface ServiceTypeConfig {
  name: string;
  defaultHours: number;
  coefficient: number; // time per m²
}

export const SERVICE_TYPES: Record<string, ServiceTypeConfig> = {
  'REN-001': {
    name: 'Privatrengøring',
    defaultHours: 3,
    coefficient: 0.01, // 0.01 timer per m²
  },
  'REN-002': {
    name: 'Hovedrengøring',
    defaultHours: 4,
    coefficient: 0.015,
  },
  'REN-003': {
    name: 'Flytterengøring',
    defaultHours: 5,
    coefficient: 0.02,
  },
  'REN-004': {
    name: 'Erhvervsrengøring',
    defaultHours: 4,
    coefficient: 0.008,
  },
  'REN-005': {
    name: 'Fast rengøring',
    defaultHours: 3,
    coefficient: 0.01,
  },
};

// ============================================================================
// BUSINESS RULES
// ============================================================================

export const BUSINESS_RULES = {
  hourlyRate: 349, // kr per time inkl. moms
  fastFirstTimeMultiplier: 1.5, // 50% more time for first time
  windowsExtraPercent: 20, // 20% extra for windows
  defaultTeamSize: 1,
  overtimeThreshold: 1.0, // hours over estimate
};

// ============================================================================
// PIPELINE STAGES & STATUS
// ============================================================================

export const PIPELINE_STAGES = {
  spam: {
    name: 'Spam',
    substages: ['filtered', 'irrelevant', 'test'],
  },
  inbox: {
    name: 'Inbox',
    substages: ['new', 'reviewing'],
  },
  contacted: {
    name: 'Contacted',
    substages: ['awaiting_response', 'in_discussion', 'quote_sent'],
  },
  calendar: {
    name: 'Calendar',
    substages: ['scheduled', 'completed', 'cancelled'],
  },
  proposal: {
    name: 'Proposal',
    substages: ['draft', 'approved', 'sent'],
  },
  won: {
    name: 'Won',
    substages: ['paid', 'partial_paid', 'completed'],
  },
  active: {
    name: 'Active',
    substages: ['recurring', 'ongoing', 'scheduled_future'],
  },
  lost: {
    name: 'Lost',
    substages: ['declined', 'no_response', 'too_expensive', 'dead'],
  },
};

/**
 * Lead status types
 */
export enum LeadStatus {
  SPAM = 'spam',                    // Filtered spam/noise
  NEW = 'new',                      // New lead, no action
  CONTACTED = 'contacted',          // We replied, awaiting response
  NO_RESPONSE = 'no_response',      // No response after 7+ days
  DEAD = 'dead',                    // No response after 30+ days
  QUOTED = 'quoted',                // Quote sent
  SCHEDULED = 'scheduled',          // Booking confirmed
  INVOICED = 'invoiced',            // Invoice sent
  PAID = 'paid',                    // Payment received
  ACTIVE_RECURRING = 'active_recurring', // Active recurring customer
  LOST = 'lost',                    // Lost to competitor or declined
  CANCELLED = 'cancelled',          // Booking cancelled
}

/**
 * Determine lead status from available data and timestamps
 */
export function determineLeadStatus(lead: {
  billy?: { state: string; isPaid: boolean } | null;
  calendar?: { startTime: string } | null;
  gmail?: { date: string; labels: string[] } | null;
  calculated?: { 
    timeline?: { 
      leadReceivedDate: string | null;
      firstReplyDate: string | null;
    } 
  };
  serviceType?: string;
}): LeadStatus {
  const now = new Date();

  // Check spam first
  if (lead.gmail?.labels?.includes('Spam') || lead.gmail?.labels?.includes('Trash')) {
    return LeadStatus.SPAM;
  }

  // Check Billy invoice status
  if (lead.billy) {
    if (lead.billy.isPaid) {
      // Check if recurring customer (REN-005 = Fast rengøring)
      if (lead.serviceType === 'REN-005') {
        return LeadStatus.ACTIVE_RECURRING;
      }
      return LeadStatus.PAID;
    }
    if (['sent', 'approved'].includes(lead.billy.state)) {
      return LeadStatus.INVOICED;
    }
  }

  // Check calendar booking
  if (lead.calendar) {
    const eventTime = new Date(lead.calendar.startTime);
    if (eventTime > now) {
      return LeadStatus.SCHEDULED;
    }
    // Past event without invoice = might be lost or pending
    return LeadStatus.QUOTED;
  }

  // Check Gmail timeline
  if (lead.calculated?.timeline?.firstReplyDate) {
    const replyDate = new Date(lead.calculated.timeline.firstReplyDate);
    const daysSinceReply = (now.getTime() - replyDate.getTime()) / (1000 * 60 * 60 * 24);

    // No response after reply
    if (daysSinceReply > 30) {
      return LeadStatus.DEAD;
    }
    if (daysSinceReply > 7) {
      return LeadStatus.NO_RESPONSE;
    }

    return LeadStatus.CONTACTED;
  }

  // New lead, no action yet
  if (lead.calculated?.timeline?.leadReceivedDate) {
    const receivedDate = new Date(lead.calculated.timeline.leadReceivedDate);
    const daysSinceReceived = (now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReceived > 30) {
      return LeadStatus.DEAD;
    }
  }

  return LeadStatus.NEW;
}

// ============================================================================
// DATA QUALITY THRESHOLDS
// ============================================================================

export const QUALITY_THRESHOLDS = {
  linkingConfidence: {
    high: 80, // score >= 80
    medium: 40, // score >= 40
    low: 0, // score < 40
  },
  dataCompleteness: {
    excellent: 90, // >= 90%
    good: 70, // >= 70%
    fair: 50, // >= 50%
    poor: 0, // < 50%
  },
};

// ============================================================================
// SPAM PATTERNS
// ============================================================================

export const SPAM_PATTERNS = [
  /mærkedage/i,
  /helligdag/i,
  /nytår/i,
  /jul/i,
  /halloween/i,
  /påske/i,
  /møde\s+(babylon|intern|team|standup)/i,
  /ferie/i,
  /frokost/i,
  /pause/i,
  /kontor\s+lukket/i,
  /lukket/i,
  /^unknown$/i,
];

// ============================================================================
// LEAD SOURCE PATTERNS
// ============================================================================

export const LEAD_SOURCE_PATTERNS = {
  leadpoint: {
    from: ['system@leadpoint.dk', 'noreply@leadpoint.dk'],
    subject: ['formular via rengøring aarhus', 'rengøring aarhus'],
    name: 'Leadpoint.dk (Rengøring Aarhus)',
  },
  rengoeringNu: {
    from: ['noreply@leadmail.no', 'system@leadmail.no'],
    subject: ['ny henvendelse', 'rengøring.nu'],
    name: 'Rengøring.nu (Leadmail.no)',
  },
  adHelp: {
    from: ['leads@adhelp.dk'],
    subject: ['ny lead', 'adhelp'],
    name: 'AdHelp',
  },
  direct: {
    from: [], // Not from partners
    subject: [],
    name: 'Direct',
  },
  existing: {
    from: [], // Known customer emails
    subject: [],
    name: 'Existing',
  },
};

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Normalize lead source strings from various data sources
 */
export function normalizeLeadSource(rawSource: string | null | undefined): LeadSource {
  if (!rawSource) return LeadSource.DIRECT;

  const normalized = rawSource.toLowerCase().trim();

  // Leadpoint variations
  if (
    normalized.includes('leadpoint') ||
    normalized.includes('rengøring aarhus') ||
    normalized.includes('system@leadpoint.dk')
  ) {
    return LeadSource.LEADPOINT_AARHUS;
  }

  // Rengøring.nu variations
  if (
    normalized.includes('rengøring.nu') ||
    normalized.includes('leadmail.no') ||
    normalized.includes('nettbureau')
  ) {
    return LeadSource.RENGOERING_NU;
  }

  // AdHelp variations
  if (
    normalized.includes('adhelp') ||
    normalized.includes('mw@adhelp.dk') ||
    normalized.includes('sp@adhelp.dk')
  ) {
    return LeadSource.ADHELP;
  }

  // Existing customer
  if (normalized.includes('existing') || normalized.includes('repeat')) {
    return LeadSource.EXISTING;
  }

  return LeadSource.DIRECT;
}

/**
 * Get per-lead cost for a specific source and service type
 */
export function getPerLeadCost(
  leadSource: LeadSource,
  serviceType?: string
): number {
  const config = LEAD_COST_CONFIG[leadSource];

  if (!config) {
    console.error(`❌ Unknown lead source: ${leadSource}`);
    return 0;
  }

  // Leadpoint: differentiate private vs erhverv
  if (leadSource === LeadSource.LEADPOINT_AARHUS) {
    const costs = config.perLead as { private: number; erhverv: number };
    return serviceType === 'REN-004' ? costs.erhverv : costs.private;
  }

  return config.perLead as number;
}

/**
 * Get monthly fixed cost for a lead source
 */
export function getMonthlyFixedCost(leadSource: LeadSource): number {
  const config = LEAD_COST_CONFIG[leadSource];
  return config?.monthlyFixed || 0;
}

/**
 * Calculate total lead acquisition cost including prorated monthly fees
 */
export function calculateTotalLeadCost(
  leadSource: LeadSource,
  serviceType: string,
  totalLeadsThisMonth: number
): number {
  const perLeadCost = getPerLeadCost(leadSource, serviceType);
  const monthlyFixed = getMonthlyFixedCost(leadSource);

  // Prorate monthly fixed cost across all leads in the month
  const proratedFixed = totalLeadsThisMonth > 0 
    ? monthlyFixed / totalLeadsThisMonth 
    : 0;

  return perLeadCost + proratedFixed;
}

/**
 * Profit calculation interface
 */
export interface ProfitMetrics {
  revenue: number;           // Invoiced price
  laborCost: number;         // actualHours × 90kr
  leadCost: number;          // Lead acquisition cost
  grossProfit: number;       // revenue - laborCost
  netProfit: number;         // grossProfit - leadCost
  grossMargin: number;       // % (grossProfit / revenue)
  netMargin: number;         // % (netProfit / revenue)
}

/**
 * Calculate profit metrics for a booking
 */
export function calculateProfit(
  invoicedPrice: number,
  actualHours: number,
  leadSource: LeadSource,
  serviceType: string,
  totalLeadsThisMonth: number
): ProfitMetrics {
  // Labor cost: 90 kr/hour (fixed cost per employee)
  const laborCost = actualHours * 90;

  // Lead acquisition cost (with prorated monthly fees)
  const leadCost = calculateTotalLeadCost(
    leadSource,
    serviceType,
    totalLeadsThisMonth
  );

  // Profit calculations
  const grossProfit = invoicedPrice - laborCost;
  const netProfit = grossProfit - leadCost;

  // Margins (avoid division by zero)
  const grossMargin = invoicedPrice > 0 
    ? (grossProfit / invoicedPrice) * 100 
    : 0;
  const netMargin = invoicedPrice > 0 
    ? (netProfit / invoicedPrice) * 100 
    : 0;

  return {
    revenue: invoicedPrice,
    laborCost,
    leadCost,
    grossProfit,
    netProfit,
    grossMargin,
    netMargin,
  };
}

export function getServiceTypeConfig(serviceType: string): ServiceTypeConfig {
  return SERVICE_TYPES[serviceType] ?? SERVICE_TYPES['REN-001'];
}

export function isSpam(text: string): boolean {
  return SPAM_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Classify lead source from email metadata (alternative to normalizeLeadSource)
 * Returns the enum value name (e.g., 'Leadpoint.dk')
 */
export function classifyLeadSource(from: string, subject: string): string {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  // Check Leadpoint
  if (
    LEAD_SOURCE_PATTERNS.leadpoint.from.some(f => fromLower.includes(f)) ||
    LEAD_SOURCE_PATTERNS.leadpoint.subject.some(s => subjectLower.includes(s))
  ) {
    return LEAD_SOURCE_PATTERNS.leadpoint.name;
  }

  // Check Rengøring.nu
  if (
    LEAD_SOURCE_PATTERNS.rengoeringNu.from.some(f => fromLower.includes(f)) ||
    LEAD_SOURCE_PATTERNS.rengoeringNu.subject.some(s => subjectLower.includes(s))
  ) {
    return LEAD_SOURCE_PATTERNS.rengoeringNu.name;
  }

  // Check AdHelp
  if (
    LEAD_SOURCE_PATTERNS.adHelp.from.some(f => fromLower.includes(f)) ||
    LEAD_SOURCE_PATTERNS.adHelp.subject.some(s => subjectLower.includes(s))
  ) {
    return LEAD_SOURCE_PATTERNS.adHelp.name;
  }

  return 'Direct';
}

/**
 * Validate lead cost configuration at startup
 */
export function validateLeadCostConfig(): boolean {
  let isValid = true;

  for (const [source, config] of Object.entries(LEAD_COST_CONFIG)) {
    // Check required fields
    if (config.perLead === undefined || config.perLead === null) {
      console.error(`❌ ${source}: Missing perLead cost`);
      isValid = false;
    }

    if (config.monthlyFixed === undefined) {
      console.error(`❌ ${source}: Missing monthlyFixed cost`);
      isValid = false;
    }

    // Warn about old verification dates
    const verifiedDate = new Date(config.verifiedDate);
    const monthsOld = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsOld > 6) {
      console.warn(`⚠️ ${source}: Cost data is ${Math.round(monthsOld)} months old - consider updating`);
    }
  }

  return isValid;
}

/**
 * Get human-readable summary of all lead costs
 */
export function getLeadCostSummary(): string {
  const lines: string[] = ['📊 LEAD COST SUMMARY\n'];

  for (const [source, config] of Object.entries(LEAD_COST_CONFIG)) {
    const perLead = typeof config.perLead === 'number'
      ? `${config.perLead} kr` 
      : `${config.perLead.private}/${config.perLead.erhverv} kr (privat/erhverv)`;

    lines.push(
      `${source}:`,
      `  Per Lead: ${perLead}`,
      `  Monthly: ${config.monthlyFixed} kr`,
      `  Description: ${config.description}`,
      `  Verified: ${config.verifiedDate}`,
      ''
    );
  }

  return lines.join('\n');
}

// ============================================================================
// COMPLETE CONFIG EXPORT
// ============================================================================

/**
 * Complete configuration object for convenience
 */
export const V4_3_CONFIG = {
  timeWindow: TIME_WINDOW,
  serviceTypes: SERVICE_TYPES,
  businessRules: BUSINESS_RULES,
  pipelineStages: PIPELINE_STAGES,
  qualityThresholds: QUALITY_THRESHOLDS,
  spamPatterns: SPAM_PATTERNS,
  leadSourcePatterns: LEAD_SOURCE_PATTERNS,
};
