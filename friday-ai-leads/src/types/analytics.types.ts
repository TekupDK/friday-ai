/**
 * Analytics Types for Friday AI Lead Intelligence System
 */

export interface BookingPrediction {
  customerId: string;
  customerName?: string;
  nextBookingDate: Date;
  isOverdue: boolean;
  daysOverdue: number;
  churnRisk: number; // 0-100
  suggestedService: string;
  estimatedPrice: number;
  estimatedDuration?: number; // hours
  preferredWorkers?: string[];
  confidence: number; // 0-1
  recommendation: string;
  basedOn?: {
    historicalFrequency?: string;
    averageGap?: number;
    lastBookingDate?: Date;
    totalBookings?: number;
  };
}

export interface RevenueOpportunity {
  type: "upsell" | "frequency" | "premium" | "winback" | "retention";
  customerId: string;
  customerName: string;
  customerEmail?: string;
  potential: number; // kr
  confidence: number; // 0-1
  suggestion: string;
  priority: "low" | "medium" | "high" | "critical";
  timeframe?: "1_week" | "1_month" | "3_months" | "1_year";
  actionItems?: string[];
  expectedROI?: number;
  implementationCost?: number;
}

export interface ChurnRiskAssessment {
  customerId: string;
  customerName: string;
  riskScore: number; // 0-100
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  factors: ChurnFactor[];
  predictedChurnDate?: Date;
  lifetimeValueAtRisk: number; // kr
  recommendedActions: string[];
  confidence: number; // 0-1
}

export interface ChurnFactor {
  factor: string;
  weight: number;
  value: any;
  contribution: number; // How much this contributes to churn risk
  description: string;
}

export interface CustomerSegmentAnalysis {
  segmentName: string;
  segmentSize: number;
  totalRevenue: number;
  avgLifetimeValue: number;
  avgBookingFrequency: string;
  churnRate: number;
  growthRate: number;
  characteristics: string[];
  opportunities: RevenueOpportunity[];
  recommendations: string[];
}

export interface FrequencyOptimization {
  customerId: string;
  currentFrequency: string;
  optimalFrequency: string;
  currentAnnualValue: number;
  projectedAnnualValue: number;
  incrementalRevenue: number;
  feasibilityScore: number; // 0-100
  barriers?: string[];
  incentivesNeeded?: string[];
}

export interface QualityMetrics {
  customerId: string;
  satisfactionScore: number; // 1-5
  complaintCount: number;
  complaintResolutionRate: number;
  avgResolutionTime: number; // hours
  qualityTrend: "improving" | "stable" | "declining";
  riskFactors: QualityRiskFactor[];
  recommendations: string[];
}

export interface QualityRiskFactor {
  factor: string;
  severity: "low" | "medium" | "high" | "critical";
  occurences: number;
  lastOccurence: Date;
  impact: string;
  mitigation: string;
}

export interface DailyAnalytics {
  date: Date;

  // Overview
  activeCustomers: number;
  recurringCustomers: number;
  atRiskCustomers: number;

  // Bookings
  overdueBookings: OverdueBooking[];
  predictedBookings: BookingPrediction[];

  // Opportunities
  revenueOpportunities: RevenueOpportunity[];
  totalOpportunityValue: number;

  // Alerts
  qualityAlerts: QualityAlert[];
  churnAlerts: ChurnRiskAssessment[];
  paymentAlerts: PaymentAlert[];

  // Actions
  recommendedActions: ActionItem[];

  // Metrics
  projectedMonthlyRevenue: number;
  churnRiskValue: number;
  customerSatisfactionAvg: number;
}

export interface OverdueBooking {
  customerId: string;
  customerName: string;
  lastBookingDate: Date;
  expectedBookingDate: Date;
  daysOverdue: number;
  estimatedValue: number;
  churnRisk: number;
  action: string;
}

export interface QualityAlert {
  customerId: string;
  customerName: string;
  alertType:
    | "complaint"
    | "low_satisfaction"
    | "service_issue"
    | "access_problem";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  dateRaised: Date;
  requiresAction: boolean;
  suggestedAction: string;
}

export interface PaymentAlert {
  customerId: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  daysOverdue: number;
  collectionStatus: "pending" | "in_progress" | "escalated";
  recommendedAction: string;
}

export interface ActionItem {
  id: string;
  type: "call" | "email" | "visit" | "offer" | "review" | "other";
  priority: "low" | "medium" | "high" | "critical";
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  action: string;
  reason: string;
  expectedOutcome: string;
  value?: number; // Potential kr value
  deadline?: Date;
  assignedTo?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface PerformanceMetrics {
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate: Date;

  // Revenue Metrics
  totalRevenue: number;
  recurringRevenue: number;
  newRevenue: number;
  lostRevenue: number;
  growthRate: number;

  // Customer Metrics
  totalCustomers: number;
  newCustomers: number;
  lostCustomers: number;
  retentionRate: number;
  churnRate: number;

  // Operational Metrics
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  avgBookingValue: number;

  // Quality Metrics
  satisfactionScore: number;
  complaintRate: number;
  resolutionRate: number;

  // Efficiency Metrics
  utilizationRate: number;
  productivityScore: number;
  costPerBooking: number;
  profitMargin: number;
}
