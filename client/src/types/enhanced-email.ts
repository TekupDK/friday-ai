/**
 * EnhancedEmailMessage.ts - Interface for AI-powered email data
 *
 * Extends base email message with AI analysis and business intelligence
 */

export interface EnhancedEmailMessage {
  // Base email properties
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate?: number;
  body: string;
  snippet: string;
  unread: boolean;
  labels: string[];
  hasAttachment: boolean;
  sender: string;

  // AI Enhancement data
  aiAnalysis?: {
    leadScore: number; // 0-100
    source: "rengoring_nu" | "rengoring_aarhus" | "adhelp" | "direct" | null;
    estimatedValue: number;
    urgency: "high" | "medium" | "low";
    jobType: string;
    location: string;
    confidence: number;
  };
}

export interface LeadSourceDistribution {
  rengoring_nu: number;
  rengoring_aarhus: number;
  adhelp: number;
  direct: number;
  unknown: number;
}

export interface IntelligenceSummary {
  totalValue: number;
  hotLeads: number;
  sourceCounts: LeadSourceDistribution;
  totalEmails: number;
  averageValue: number;
  highValueEmails: number; // > 2000 kr
  urgentEmails: number;
}

export type SortOption = "leadScore" | "date" | "value" | "urgency";
export type FilterSource =
  | "all"
  | "rengoring_nu"
  | "rengoring_aarhus"
  | "adhelp"
  | "direct";
export type Density = "compact" | "comfortable";
