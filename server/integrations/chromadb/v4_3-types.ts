/**
 * V4.3 Lead Interface Definitions
 * 
 * Complete 360° view of leads from Gmail → Calendar → Billy
 * with calculated metrics, pipeline stages, and customer value
 */

import { LeadSource } from './v4_3-config';

// ============================================================================
// CORE DATA TIERS
// ============================================================================

export interface BillyData {
  invoiceId: string;
  invoiceNo: string | null;
  state: string; // draft, approved, sent, paid
  isPaid: boolean;
  balance: number;
  entryDate: string; // YYYY-MM-DD
  dueDate: string | null;
  contactId: string;
  invoicedHours: number;
  invoicedPrice: number;
  productId: string; // REN-001 to REN-005
  description: string;
}

export interface CalendarData {
  eventId: string;
  summary: string;
  description: string;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  duration: number; // minutes
  numberOfPeople: number;
  profit?: number; // calculated
  bookingNumber?: number; // sequential per customer
  // V4.3.5: AI-enhanced parsing
  aiParsed?: {
    customer: {
      name: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      propertySize: number | null;
      propertyType: string | null;
    };
    service: {
      type: string | null;
      category: string | null;
      frequency: string | null;
      estimatedHours: number | null;
      estimatedPrice: number | null;
      actualHours: number | null;
      actualPrice: number | null;
      numberOfWorkers: number | null;
    };
    specialRequirements: string[];
    qualitySignals: {
      isRepeatBooking: boolean;
      bookingNumber: number | null;
      hasComplaints: boolean;
      hasSpecialNeeds: boolean;
      customerType: 'standard' | 'premium' | 'problematic' | 'unknown';
      confidence: 'high' | 'medium' | 'low';
    };
    notes: string | null;
  };
}

export interface GmailData {
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  date: string; // ISO timestamp
  labels: string[];
  estimatedHours: number;
  propertySize: number; // m²
  quotedPrice: number;
  leadSource: string;
  isLeadmail: boolean;
}

// ============================================================================
// CALCULATED METRICS
// ============================================================================

export interface PropertyMetrics {
  propertySize: number; // m²
  propertySizeSource: 'billy' | 'gmail' | 'calendar' | 'unknown';
  serviceType: string; // REN-001 to REN-005
  serviceTypeName: string; // Privatrengøring, etc.
}

export interface FinancialMetrics {
  quotedPrice: number;
  invoicedPrice: number;
  paidAmount: number;
  priceVariance: number; // invoiced - quoted
  leadCost: number;
  laborCost: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number; // %
  netMargin: number; // %
}

export interface TimeMetrics {
  estimatedHours: number;
  actualHours: number;
  calendarWorkHours: number; // duration × people
  timeVariance: number; // actual - estimated
  timeAccuracy: number; // actual / estimated
  overtimeFlag: boolean;
}

export interface TimelineMetrics {
  leadReceivedDate: string | null;
  firstReplyDate: string | null;
  bookingConfirmedDate: string | null;
  invoiceSentDate: string | null;
  paidDate: string | null;
  daysToBooking: number | null;
  daysToPayment: number | null;
}

export interface QualityMetrics {
  hasGmail: boolean;
  hasCalendar: boolean;
  hasBilly: boolean;
  dataCompleteness: number; // 0-100%
  linkingConfidence: 'high' | 'medium' | 'low';
}

export interface CalculatedMetrics {
  property: PropertyMetrics;
  financial: FinancialMetrics;
  time: TimeMetrics;
  timeline: TimelineMetrics;
  quality: QualityMetrics;
}

// ============================================================================
// PIPELINE STATUS
// ============================================================================

export interface PipelineStatus {
  stage: 'spam' | 'inbox' | 'contacted' | 'calendar' | 'proposal' | 'won' | 'active' | 'lost';
  substage: string;
  status: 'spam' | 'new' | 'contacted' | 'no_response' | 'dead' | 'quoted' | 'scheduled' | 'invoiced' | 'paid' | 'active_recurring' | 'lost' | 'cancelled';
  daysInStage?: number; // Days since last status change
  lastActivity?: string; // ISO timestamp of last action
}

// ============================================================================
// CUSTOMER VALUE
// ============================================================================

export interface CustomerValueMetrics {
  isRepeatCustomer: boolean;
  totalBookings: number;
  lifetimeValue: number; // total revenue
  averageBookingValue: number;
  avgBookingValue: number; // alias for consistency
  repeatRate: number; // percentage
  firstBookingDate: string | null;
  lastBookingDate: string | null;
  daysBetweenBookings: number | null;
  // V4.3.4: Active & Recurring tags
  isActive: boolean; // Lead from active period (Oct-Nov)
  isRecurring: boolean; // Customer has 2+ bookings
  recurringFrequency: 'weekly' | 'biweekly' | 'triweekly' | 'monthly' | 'irregular' | null; // Pattern if recurring
  // V4.3.5: AI Quality Signals
  customerType?: 'standard' | 'premium' | 'problematic' | 'unknown';
  hasComplaints?: boolean;
  hasSpecialNeeds?: boolean;
  specialRequirements?: string[];
}

// ============================================================================
// QUOTE RECOMMENDATION
// ============================================================================

export interface QuoteRecommendation {
  estimatedHours: number;
  estimatedPrice: number;
  basis: 'actual_invoiced' | 'actual_avg' | 'estimated' | 'm2_rule' | 'default';
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    hours: number;
    hourlyRate: number;
    subtotal: number;
    adjustments?: Array<{ type: string; amount: number; description: string }>;
  };
}

// ============================================================================
// MAIN LEAD INTERFACE
// ============================================================================

export interface V4_3_Lead {
  // === IDENTITY ===
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  // === SOURCE DATA (TIERS 1-3) ===
  billy: BillyData | null;
  calendar: CalendarData | null;
  gmail: GmailData | null;

  // === CALCULATED (TIER 4) ===
  calculated: CalculatedMetrics;

  // === PIPELINE (TIER 5) ===
  pipeline: PipelineStatus;

  // === CUSTOMER VALUE (TIER 6) ===
  customer: CustomerValueMetrics;

  // === QUOTE RECOMMENDATION ===
  quoteRecommendation: QuoteRecommendation;
}

// ============================================================================
// COLLECTION METADATA
// ============================================================================

export interface V4_3_Dataset {
  metadata: {
    version: '4.3';
    generated: string; // ISO timestamp
    timeWindow: {
      start: string;
      end: string;
    };
    counts: {
      total: number;
      withBilly: number;
      withCalendar: number;
      withGmail: number;
      byStage: Record<string, number>;
      byLeadSource: Record<string, number>;
    };
    quality: {
      avgDataCompleteness: number;
      avgLinkingConfidence: string;
    };
    financial: {
      totalRevenue: number;
      totalLeadCost: number;
      totalLaborCost: number;
      totalProfit: number;
      avgProfitMargin: number;
    };
  };
  leads: V4_3_Lead[];
}
