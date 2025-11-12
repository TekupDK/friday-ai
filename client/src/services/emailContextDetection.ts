/**
 * Email Context Detection Service
 * Centralized logic for detecting email context and workspace state
 * Replaces hardcoded logic in SmartWorkspacePanel with maintainable patterns
 */

export type WorkspaceContext =
  | "lead"
  | "booking"
  | "invoice"
  | "customer"
  | "dashboard";

export interface EmailContextData {
  type: WorkspaceContext;
  emailId?: string;
  threadId?: string;
  subject?: string;
  from?: string;
  body?: string;
  labels?: string[];
  confidence?: number; // 0-1 confidence score
  reason?: string; // Detection reason for debugging
}

export interface DetectionPatterns {
  leads: {
    domains: string[];
    keywords: string[];
    labels: string[];
  };
  bookings: {
    keywords: string[];
    labels: string[];
  };
  invoices: {
    keywords: string[];
    labels: string[];
  };
  customers: {
    labels: string[];
    minThreadLength: number;
  };
}

export const DETECTION_PATTERNS: DetectionPatterns = {
  leads: {
    domains: ["rengoring.nu", "leadpoint", "adhelp"],
    keywords: [
      "lead",
      "forespørgsel",
      "tilbud",
      "rengøring.nu",
      "rengoring.nu",
    ],
    labels: ["Leads", "Needs Reply"],
  },
  bookings: {
    keywords: ["bekræft", "booking", "aftale"],
    labels: ["I kalender"],
  },
  invoices: {
    keywords: ["faktura", "betaling", "payment", "invoice"],
    labels: ["Finance"],
  },
  customers: {
    labels: ["Afsluttet"],
    minThreadLength: 3,
  },
} as const;

/**
 * Detect email context based on patterns
 * Returns context with confidence score for better decision making
 */
export function detectEmailContext(email: any): EmailContextData {
  if (!email) {
    return { type: "dashboard", confidence: 1.0 };
  }

  const subject = (email.subject || "").toLowerCase();
  const from = (email.from || "").toLowerCase();
  const labels = email.labels || [];
  const threadLength = email.threadLength || 0;

  // Calculate confidence scores for each context type
  const scores = {
    lead: calculateLeadScore(subject, from, labels),
    booking: calculateBookingScore(subject, labels),
    invoice: calculateInvoiceScore(subject, labels),
    customer: calculateCustomerScore(labels, threadLength),
    dashboard: 0.1, // Base fallback
  };

  // Find highest scoring context
  const bestContext = Object.entries(scores).reduce(
    (best, [context, score]) =>
      score > best.score
        ? { context: context as WorkspaceContext, score }
        : best,
    { context: "dashboard" as WorkspaceContext, score: 0 }
  );

  return {
    type: bestContext.context,
    emailId: email.id,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    body: email.snippet,
    labels: labels,
    confidence: bestContext.score,
  };
}

function calculateLeadScore(
  subject: string,
  from: string,
  labels: string[]
): number {
  let score = 0;

  // Domain matches (high confidence)
  DETECTION_PATTERNS.leads.domains.forEach(domain => {
    if (from.includes(domain)) score += 0.4;
  });

  // Keyword matches (medium confidence)
  DETECTION_PATTERNS.leads.keywords.forEach(keyword => {
    if (subject.includes(keyword)) score += 0.3;
  });

  // Label matches (high confidence)
  DETECTION_PATTERNS.leads.labels.forEach(label => {
    if (labels.includes(label)) score += 0.3;
  });

  return Math.min(score, 1.0);
}

function calculateBookingScore(subject: string, labels: string[]): number {
  let score = 0;

  DETECTION_PATTERNS.bookings.keywords.forEach(keyword => {
    if (subject.includes(keyword)) score += 0.4;
  });

  DETECTION_PATTERNS.bookings.labels.forEach(label => {
    if (labels.includes(label)) score += 0.6;
  });

  return Math.min(score, 1.0);
}

function calculateInvoiceScore(subject: string, labels: string[]): number {
  let score = 0;

  DETECTION_PATTERNS.invoices.keywords.forEach(keyword => {
    if (subject.includes(keyword)) score += 0.4;
  });

  DETECTION_PATTERNS.invoices.labels.forEach(label => {
    if (labels.includes(label)) score += 0.6;
  });

  return Math.min(score, 1.0);
}

function calculateCustomerScore(
  labels: string[],
  threadLength: number
): number {
  let score = 0;

  DETECTION_PATTERNS.customers.labels.forEach(label => {
    if (labels.includes(label)) score += 0.5;
  });

  if (threadLength >= DETECTION_PATTERNS.customers.minThreadLength) {
    score += 0.3;
  }

  // Check for FAST customer labels
  labels.forEach(label => {
    if (label.includes("FAST")) score += 0.2;
  });

  return Math.min(score, 1.0);
}

/**
 * Validate context detection result
 * Returns true if confidence is above threshold
 */
export function validateContext(context: EmailContextData): boolean {
  return context.confidence !== undefined && context.confidence >= 0.3;
}

/**
 * Get human-readable context name
 */
export function getContextName(context: WorkspaceContext): string {
  const names = {
    lead: "Lead Analysis",
    booking: "Booking Management",
    invoice: "Invoice Tracking",
    customer: "Customer Profile",
    dashboard: "Business Dashboard",
  };
  return names[context];
}

/**
 * Get context description for UI
 */
export function getContextDescription(context: WorkspaceContext): string {
  const descriptions = {
    lead: "Analyzing lead and generating estimates",
    booking: "Managing booking details and team coordination",
    invoice: "Tracking payment status and financial data",
    customer: "Viewing customer history and preferences",
    dashboard: "Overview of business activities and urgent actions",
  };
  return descriptions[context];
}
