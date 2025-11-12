/**
 * Customer Types for Friday AI Lead Intelligence System
 */

export interface CustomerProfile {
  // Basic Information
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;

  // Property Information
  propertySize?: number; // m²
  propertyType?: "house" | "apartment" | "office" | "commercial";
  propertyDetails?: {
    rooms?: number;
    floors?: number;
    specialFeatures?: string[];
  };
}

export interface CustomerMetrics {
  // Booking Metrics
  totalBookings: number;
  firstBookingDate: Date | null;
  lastBookingDate: Date | null;
  daysBetweenBookings: number | null;

  // Financial Metrics
  lifetimeValue: number; // kr
  averageBookingValue: number; // kr
  totalRevenue: number; // kr
  outstandingAmount: number; // kr

  // Engagement Metrics
  repeatRate: number; // percentage
  churnRisk: number; // 0-100
  engagementScore: number; // 0-100
}

export interface CustomerIntelligence {
  // Customer Classification
  customerType: "premium" | "standard" | "problematic" | "unknown";
  isRecurring: boolean;
  isActive: boolean;
  isPremium: boolean;

  // Booking Patterns
  recurringFrequency?:
    | "weekly"
    | "biweekly"
    | "triweekly"
    | "monthly"
    | "irregular";
  preferredDay?: string; // Monday, Tuesday, etc.
  preferredTime?: string; // Morning, Afternoon, etc.
  seasonality?: "consistent" | "seasonal" | "sporadic";

  // Quality Signals
  hasComplaints: boolean;
  hasSpecialNeeds: boolean;
  complaintHistory?: ComplaintRecord[];
  satisfactionScore?: number; // 1-5

  // Special Requirements
  specialRequirements: string[];
  accessInstructions?: string;
  preferredWorkers?: string[];
  avoidWorkers?: string[];

  // AI Insights
  aiParsedData?: {
    confidence: number;
    lastUpdated: Date;
    insights: string[];
  };
}

export interface ComplaintRecord {
  date: Date;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  resolution?: string;
  compensationGiven?: boolean;
}

export interface Customer {
  profile: CustomerProfile;
  metrics: CustomerMetrics;
  intelligence: CustomerIntelligence;

  // Relationships
  emailThreads?: string[]; // Thread IDs
  calendarEvents?: string[]; // Event IDs
  invoices?: string[]; // Invoice IDs

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  nextExpectedBooking?: Date;

  // Alerts
  activeAlerts?: CustomerAlert[];

  // Tags
  tags?: string[];
  notes?: string;
}

export interface CustomerAlert {
  id: string;
  type:
    | "overdue_booking"
    | "churn_risk"
    | "quality_issue"
    | "payment_issue"
    | "opportunity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  actionTaken?: string;
  value?: number; // Potential kr value at risk/opportunity
}

export interface CustomerSegment {
  name: string;
  description: string;
  criteria: {
    minBookings?: number;
    minLifetimeValue?: number;
    customerType?: CustomerIntelligence["customerType"];
    isRecurring?: boolean;
    frequency?: CustomerIntelligence["recurringFrequency"];
  };
  customers: Customer[];
  metrics: {
    count: number;
    totalRevenue: number;
    avgLifetimeValue: number;
    churnRate: number;
  };
}

export interface CustomerSearchQuery {
  // Search parameters
  query?: string; // Free text search
  email?: string;
  phone?: string;
  name?: string;

  // Filters
  customerType?: CustomerIntelligence["customerType"];
  isRecurring?: boolean;
  isActive?: boolean;
  hasComplaints?: boolean;
  hasSpecialNeeds?: boolean;

  // Ranges
  minLifetimeValue?: number;
  maxLifetimeValue?: number;
  minBookings?: number;
  maxBookings?: number;

  // Date ranges
  lastBookingAfter?: Date;
  lastBookingBefore?: Date;

  // Sorting
  sortBy?: "lifetimeValue" | "totalBookings" | "lastBooking" | "churnRisk";
  sortOrder?: "asc" | "desc";

  // Pagination
  limit?: number;
  offset?: number;
}

export interface CustomerUpdateRequest {
  customerId: string;
  updates: {
    profile?: Partial<CustomerProfile>;
    intelligence?: Partial<CustomerIntelligence>;
    notes?: string;
    tags?: string[];
  };
  reason: string;
  updatedBy: string;
}
