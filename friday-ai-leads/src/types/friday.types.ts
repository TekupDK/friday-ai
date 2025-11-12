/**
 * Friday AI Types for Lead Intelligence System
 */

export interface FridayAIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp?: Date;
  processingTime?: number; // ms
}

export interface FridayAIIntent {
  type:
    | "customer_lookup"
    | "booking_prediction"
    | "booking_history"
    | "revenue_opportunities"
    | "quality_check"
    | "churn_analysis"
    | "segment_analysis"
    | "daily_summary"
    | "create_reminder"
    | "send_campaign"
    | "unknown";
  confidence: number; // 0-1
  parameters: Record<string, any>;
  originalQuery?: string;
  language?: "da" | "en";
}

export interface FridayAIContext {
  sessionId: string;
  userId?: string;
  conversationHistory: ConversationEntry[];
  currentCustomer?: {
    id: string;
    name: string;
    email: string;
  };
  preferences?: {
    language: "da" | "en";
    responseStyle: "concise" | "detailed" | "conversational";
    autoActions: boolean;
  };
}

export interface ConversationEntry {
  timestamp: Date;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: FridayAIIntent;
  response?: FridayAIResponse;
  metadata?: Record<string, any>;
}

export interface FridayAIAction {
  id: string;
  type: "email" | "sms" | "call" | "calendar" | "task" | "alert" | "report";
  status: "pending" | "executing" | "completed" | "failed" | "cancelled";
  target?: {
    customerId?: string;
    email?: string;
    phone?: string;
  };
  content: {
    subject?: string;
    body?: string;
    template?: string;
    variables?: Record<string, any>;
  };
  scheduledFor?: Date;
  executedAt?: Date;
  result?: any;
  error?: string;
}

export interface FridayAITemplate {
  id: string;
  name: string;
  category:
    | "booking"
    | "reminder"
    | "upsell"
    | "winback"
    | "quality"
    | "payment";
  language: "da" | "en";
  subject?: string;
  content: string;
  variables: TemplateVariable[];
  conditions?: TemplateCondition[];
  metadata?: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    successRate: number;
  };
}

export interface TemplateVariable {
  name: string;
  type: "string" | "number" | "date" | "boolean" | "array" | "object";
  required: boolean;
  defaultValue?: any;
  description?: string;
  example?: any;
}

export interface TemplateCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "not_contains";
  value: any;
  action: "include" | "exclude" | "modify";
  modification?: string;
}

export interface FridayAIQuery {
  text: string;
  context?: FridayAIContext;
  filters?: QueryFilter[];
  includeHistory?: boolean;
  maxResults?: number;
  language?: "da" | "en";
}

export interface QueryFilter {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "between"
    | "in";
  value: any;
  combinator?: "AND" | "OR";
}

export interface FridayAIInsight {
  id: string;
  type: "trend" | "anomaly" | "opportunity" | "risk" | "recommendation";
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedCustomers?: string[];
  potentialValue?: number;
  confidence: number; // 0-1
  evidence: InsightEvidence[];
  recommendations: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface InsightEvidence {
  type: "metric" | "pattern" | "comparison" | "correlation";
  description: string;
  data: any;
  significance: number; // 0-1
}

export interface FridayAINotification {
  id: string;
  type: "alert" | "reminder" | "update" | "report" | "action_required";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  customer?: {
    id: string;
    name: string;
  };
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface FridayAIReport {
  id: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  period: {
    start: Date;
    end: Date;
  };
  sections: ReportSection[];
  summary: {
    highlights: string[];
    metrics: Record<string, any>;
    trends: TrendData[];
    actions: string[];
  };
  generatedAt: Date;
  generatedBy: string;
  format?: "html" | "pdf" | "json" | "markdown";
}

export interface ReportSection {
  title: string;
  type: "text" | "metrics" | "chart" | "table" | "list";
  content: any;
  insights?: string[];
  recommendations?: string[];
}

export interface TrendData {
  metric: string;
  direction: "up" | "down" | "stable";
  change: number; // percentage
  period: string;
  significance: "low" | "medium" | "high";
  forecast?: number;
}

export interface FridayAIConfig {
  // API Configuration
  chromaDbUrl: string;
  openAiKey?: string;

  // Feature Flags
  features: {
    naturalLanguage: boolean;
    predictiveAnalytics: boolean;
    automatedActions: boolean;
    qualityMonitoring: boolean;
    revenueOptimization: boolean;
  };

  // Thresholds
  thresholds: {
    churnRiskThreshold: number; // 0-100
    overdueBookingDays: number;
    qualityAlertScore: number; // 1-5
    minimumConfidence: number; // 0-1
  };

  // Scheduling
  scheduling: {
    dailyAnalysisTime: string; // e.g., "09:00"
    reminderLeadDays: number;
    campaignBatchSize: number;
  };

  // Defaults
  defaults: {
    language: "da" | "en";
    currency: "DKK" | "EUR" | "USD";
    timezone: string;
    dateFormat: string;
  };
}
