/**
 * Phase 9.4: Lead Source Analytics
 *
 * Track and analyze source effectiveness with comprehensive metrics.
 * Business intelligence for lead source optimization.
 */

import type { LeadSource, SourceDetection } from "./lead-source-detector";
import type { SourceWorkflow } from "./lead-source-workflows";

export interface SourceMetrics {
  source: LeadSource;
  totalLeads: number;
  conversionRate: number; // leads to customers
  averageResponseTime: number; // hours
  averageDealValue: number; // DKK
  costPerLead: number; // DKK
  qualityScore: number; // 0-100
  trendScore: number; // -100 to 100 (negative = declining)
  timeToClose: number; // days
  roi: number; // return on investment
}

export interface SourceAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totalLeads: number;
  totalRevenue: number;
  averageConversionRate: number;
  sourceMetrics: SourceMetrics[];
  topPerformers: {
    byVolume: LeadSource[];
    byConversion: LeadSource[];
    byRevenue: LeadSource[];
    byQuality: LeadSource[];
  };
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsRecommendation {
  type: "optimize" | "invest" | "reduce" | "investigate";
  source: LeadSource;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  expectedImprovement: number; // percentage
}

/**
 * Phase 9.4: Mock analytics data generator
 * In production, this would query the database
 */
export function generateSourceAnalytics(
  startDate: Date,
  endDate: Date
): SourceAnalytics {
  // Mock data - in production, this would be real database queries
  const mockSourceMetrics: SourceMetrics[] = [
    {
      source: "rengoring_nu",
      totalLeads: 45,
      conversionRate: 0.22, // 22%
      averageResponseTime: 0.5, // 30 minutes
      averageDealValue: 3500,
      costPerLead: 150,
      qualityScore: 75,
      trendScore: 15, // improving
      timeToClose: 7,
      roi: 2.33, // 233% return
    },
    {
      source: "rengoring_aarhus",
      totalLeads: 28,
      conversionRate: 0.18, // 18%
      averageResponseTime: 1.2, // 1.2 hours
      averageDealValue: 4200,
      costPerLead: 120,
      qualityScore: 68,
      trendScore: -5, // slightly declining
      timeToClose: 10,
      roi: 2.5, // 250% return
    },
    {
      source: "adhelp",
      totalLeads: 15,
      conversionRate: 0.13, // 13%
      averageResponseTime: 4.5, // 4.5 hours
      averageDealValue: 2800,
      costPerLead: 200,
      qualityScore: 45,
      trendScore: -20, // declining
      timeToClose: 14,
      roi: 1.4, // 140% return
    },
    {
      source: "website",
      totalLeads: 32,
      conversionRate: 0.31, // 31%
      averageResponseTime: 2.1, // 2.1 hours
      averageDealValue: 5100,
      costPerLead: 80,
      qualityScore: 85,
      trendScore: 25, // strongly improving
      timeToClose: 5,
      roi: 3.19, // 319% return
    },
    {
      source: "referral",
      totalLeads: 12,
      conversionRate: 0.42, // 42%
      averageResponseTime: 1.8, // 1.8 hours
      averageDealValue: 6200,
      costPerLead: 50,
      qualityScore: 92,
      trendScore: 10, // improving
      timeToClose: 4,
      roi: 4.24, // 424% return
    },
    {
      source: "phone",
      totalLeads: 18,
      conversionRate: 0.28, // 28%
      averageResponseTime: 0.2, // 12 minutes
      averageDealValue: 3800,
      costPerLead: 100,
      qualityScore: 78,
      trendScore: 5, // stable
      timeToClose: 3,
      roi: 2.66, // 266% return
    },
    {
      source: "social_media",
      totalLeads: 8,
      conversionRate: 0.15, // 15%
      averageResponseTime: 6.2, // 6.2 hours
      averageDealValue: 2900,
      costPerLead: 180,
      qualityScore: 52,
      trendScore: -10, // declining
      timeToClose: 12,
      roi: 1.61, // 161% return
    },
    {
      source: "direct",
      totalLeads: 22,
      conversionRate: 0.2, // 20%
      averageResponseTime: 3.5, // 3.5 hours
      averageDealValue: 3600,
      costPerLead: 110,
      qualityScore: 65,
      trendScore: 0, // stable
      timeToClose: 8,
      roi: 2.18, // 218% return
    },
  ];

  const totalLeads = mockSourceMetrics.reduce(
    (sum, m) => sum + m.totalLeads,
    0
  );
  const totalRevenue = mockSourceMetrics.reduce(
    (sum, m) => sum + m.totalLeads * m.conversionRate * m.averageDealValue,
    0
  );
  const averageConversionRate =
    mockSourceMetrics.reduce((sum, m) => sum + m.conversionRate, 0) /
    mockSourceMetrics.length;

  // Sort sources by different metrics
  const byVolume = [...mockSourceMetrics]
    .sort((a, b) => b.totalLeads - a.totalLeads)
    .slice(0, 3)
    .map(m => m.source);

  const byConversion = [...mockSourceMetrics]
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3)
    .map(m => m.source);

  const byRevenue = [...mockSourceMetrics]
    .sort(
      (a, b) =>
        b.totalLeads * b.conversionRate * b.averageDealValue -
        a.totalLeads * a.conversionRate * a.averageDealValue
    )
    .slice(0, 3)
    .map(m => m.source);

  const byQuality = [...mockSourceMetrics]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 3)
    .map(m => m.source);

  // Generate recommendations
  const recommendations = generateRecommendations(mockSourceMetrics);

  return {
    period: { start: startDate, end: endDate },
    totalLeads,
    totalRevenue,
    averageConversionRate,
    sourceMetrics: mockSourceMetrics,
    topPerformers: {
      byVolume,
      byConversion,
      byRevenue,
      byQuality,
    },
    recommendations,
  };
}

/**
 * Generate intelligent recommendations based on source metrics
 */
function generateRecommendations(
  metrics: SourceMetrics[]
): AnalyticsRecommendation[] {
  const recommendations: AnalyticsRecommendation[] = [];

  for (const metric of metrics) {
    // High ROI, low volume - invest more
    if (metric.roi > 3.0 && metric.totalLeads < 20) {
      recommendations.push({
        type: "invest",
        source: metric.source,
        title: `Øg investering i ${metric.source}`,
        description: `Høj ROI (${metric.roi.toFixed(1)}x) men lav volumen. Potentiale for vækst.`,
        impact: "high",
        effort: "medium",
        expectedImprovement: 25,
      });
    }

    // Low conversion rate - optimize
    if (metric.conversionRate < 0.15) {
      recommendations.push({
        type: "optimize",
        source: metric.source,
        title: `Optimer ${metric.source} konvertering`,
        description: `Lav konverteringsrate (${(metric.conversionRate * 100).toFixed(1)}%). Forbedre kvalifikation og follow-up.`,
        impact: "medium",
        effort: "high",
        expectedImprovement: 40,
      });
    }

    // High cost per lead - investigate or reduce
    if (metric.costPerLead > 150) {
      recommendations.push({
        type: metric.roi < 2.0 ? "reduce" : "investigate",
        source: metric.source,
        title: `Analyser ${metric.source} omkostninger`,
        description: `Høj cost per lead (DKK ${metric.costPerLead}). Undersøg effektivitet.`,
        impact: "medium",
        effort: "medium",
        expectedImprovement: 20,
      });
    }

    // Declining trend - investigate
    if (metric.trendScore < -15) {
      recommendations.push({
        type: "investigate",
        source: metric.source,
        title: `Undersøg faldende trend for ${metric.source}`,
        description: `Negativ trend (${metric.trendScore}%). Identificer årsager og handl.`,
        impact: "high",
        effort: "medium",
        expectedImprovement: 30,
      });
    }

    // Slow response time - optimize
    if (metric.averageResponseTime > 4.0) {
      recommendations.push({
        type: "optimize",
        source: metric.source,
        title: `Hurtig respons for ${metric.source}`,
        description: `Langsom respons (${metric.averageResponseTime.toFixed(1)}t). Hurtigere svar øger konvertering.`,
        impact: "medium",
        effort: "low",
        expectedImprovement: 15,
      });
    }
  }

  // Sort by expected improvement
  return recommendations.sort(
    (a, b) => b.expectedImprovement - a.expectedImprovement
  );
}

/**
 * Get source performance summary
 */
export function getSourcePerformanceSummary(analytics: SourceAnalytics): {
  bestOverall: LeadSource;
  worstOverall: LeadSource;
  mostImproved: LeadSource;
  needsAttention: LeadSource[];
} {
  const sortedByQuality = [...analytics.sourceMetrics].sort(
    (a, b) => b.qualityScore - a.qualityScore
  );
  const sortedByTrend = [...analytics.sourceMetrics].sort(
    (a, b) => b.trendScore - a.trendScore
  );

  const needsAttention = analytics.sourceMetrics
    .filter(m => m.qualityScore < 50 || m.trendScore < -20)
    .map(m => m.source);

  return {
    bestOverall: sortedByQuality[0]?.source || "unknown",
    worstOverall:
      sortedByQuality[sortedByQuality.length - 1]?.source || "unknown",
    mostImproved: sortedByTrend[0]?.source || "unknown",
    needsAttention,
  };
}

/**
 * Calculate source effectiveness score (0-100)
 */
export function calculateSourceEffectiveness(metric: SourceMetrics): number {
  const weights = {
    conversionRate: 0.3,
    qualityScore: 0.25,
    roi: 0.2,
    trendScore: 0.15,
    responseTime: 0.1,
  };

  // Normalize metrics to 0-100 scale
  const normalizedConversion = Math.min(metric.conversionRate * 100, 100);
  const normalizedQuality = metric.qualityScore;
  const normalizedRoi = Math.min(metric.roi * 20, 100); // 5x ROI = 100 points
  const normalizedTrend = Math.max(
    0,
    Math.min((metric.trendScore + 100) / 2, 100)
  );
  const normalizedResponse = Math.max(0, 100 - metric.averageResponseTime * 10); // Faster = better

  return (
    normalizedConversion * weights.conversionRate +
    normalizedQuality * weights.qualityScore +
    normalizedRoi * weights.roi +
    normalizedTrend * weights.trendScore +
    normalizedResponse * weights.responseTime
  );
}

/**
 * Export analytics data for reporting
 */
export function exportAnalyticsReport(analytics: SourceAnalytics): {
  csv: string;
  json: string;
  summary: string;
} {
  const csvHeaders = [
    "Source",
    "Total Leads",
    "Conversion Rate",
    "Avg Response Time",
    "Avg Deal Value",
    "Cost Per Lead",
    "Quality Score",
    "ROI",
    "Effectiveness Score",
  ].join(",");

  const csvRows = analytics.sourceMetrics.map(metric => {
    const effectiveness = calculateSourceEffectiveness(metric);
    return [
      metric.source,
      metric.totalLeads,
      (metric.conversionRate * 100).toFixed(1) + "%",
      metric.averageResponseTime.toFixed(1) + "h",
      "DKK " + metric.averageDealValue,
      "DKK " + metric.costPerLead,
      metric.qualityScore,
      metric.roi.toFixed(2) + "x",
      effectiveness.toFixed(1),
    ].join(",");
  });

  const csv = [csvHeaders, ...csvRows].join("\n");
  const json = JSON.stringify(analytics, null, 2);

  const summary = `
Lead Source Analytics Report
Period: ${analytics.period.start.toLocaleDateString()} - ${analytics.period.end.toLocaleDateString()}

Total Leads: ${analytics.totalLeads}
Total Revenue: DKK ${analytics.totalRevenue.toLocaleString()}
Average Conversion Rate: ${(analytics.averageConversionRate * 100).toFixed(1)}%

Top Performers:
- By Volume: ${analytics.topPerformers.byVolume.join(", ")}
- By Conversion: ${analytics.topPerformers.byConversion.join(", ")}
- By Revenue: ${analytics.topPerformers.byRevenue.join(", ")}
- By Quality: ${analytics.topPerformers.byQuality.join(", ")}

Key Recommendations:
${analytics.recommendations
  .slice(0, 3)
  .map(r => `• ${r.title}: ${r.description}`)
  .join("\n")}
  `.trim();

  return { csv, json, summary };
}
