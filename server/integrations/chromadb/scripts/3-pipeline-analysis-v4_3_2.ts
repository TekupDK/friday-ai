/**
 * V4.3 Script 3: Pipeline Analysis
 *
 * Generates comprehensive analysis report:
 * - KPI summary (revenue, profit, conversion)
 * - Funnel analysis (inbox → won)
 * - Lead source ROI
 * - Time accuracy by service type
 * - Pipeline health metrics
 * - Customer lifetime value
 *
 * Input: complete-leads-v4.3.json
 * Output: v4_3-analysis-report.json + .md
 *
 * Run: npx tsx server/integrations/chromadb/scripts/3-pipeline-analysis-v4_3.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { V4_3_Dataset, V4_3_Lead } from "../v4_3-types";

console.log("📊 V4.3.2 Script 3: Pipeline Analysis\n");
console.log("=".repeat(70));

// ============================================================================
// LOAD DATA
// ============================================================================

const dataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.2.json"
);

console.log(`📂 Loading: ${dataPath}\n`);

const dataset: V4_3_Dataset = JSON.parse(readFileSync(dataPath, "utf-8"));
const leads = dataset.leads;

console.log(`Loaded ${leads.length} leads\n`);

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

interface KPISummary {
  totalLeads: number;
  totalRevenue: number;
  totalLeadCost: number;
  totalLaborCost: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  avgGrossMargin: number;
  avgNetMargin: number;
  avgRevenuePerLead: number;
  conversionRate: number; // % of leads that became paid
  avgDaysToBooking: number;
  avgDaysToPayment: number;
}

function calculateKPIs(leads: V4_3_Lead[]): KPISummary {
  const totalLeads = leads.length;
  const paidLeads = leads.filter(
    l =>
      l.pipeline.status === "paid" || l.pipeline.status === "active_recurring"
  );

  const totalRevenue = leads.reduce(
    (sum, l) => sum + l.calculated.financial.invoicedPrice,
    0
  );
  const totalLeadCost = leads.reduce(
    (sum, l) => sum + l.calculated.financial.leadCost,
    0
  );
  const totalLaborCost = leads.reduce(
    (sum, l) => sum + l.calculated.financial.laborCost,
    0
  );
  const totalGrossProfit = leads.reduce(
    (sum, l) => sum + l.calculated.financial.grossProfit,
    0
  );
  const totalNetProfit = leads.reduce(
    (sum, l) => sum + l.calculated.financial.netProfit,
    0
  );

  const avgGrossMargin =
    totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const avgNetMargin =
    totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;
  const avgRevenuePerLead = totalRevenue / totalLeads;
  const conversionRate = (paidLeads.length / totalLeads) * 100;

  const daysToBooking = leads
    .map(l => l.calculated.timeline.daysToBooking)
    .filter((d): d is number => d !== null);
  const avgDaysToBooking =
    daysToBooking.length > 0
      ? daysToBooking.reduce((sum, d) => sum + d, 0) / daysToBooking.length
      : 0;

  const daysToPayment = leads
    .map(l => l.calculated.timeline.daysToPayment)
    .filter((d): d is number => d !== null);
  const avgDaysToPayment =
    daysToPayment.length > 0
      ? daysToPayment.reduce((sum, d) => sum + d, 0) / daysToPayment.length
      : 0;

  return {
    totalLeads,
    totalRevenue,
    totalLeadCost,
    totalLaborCost,
    totalGrossProfit,
    totalNetProfit,
    avgGrossMargin,
    avgNetMargin,
    avgRevenuePerLead,
    conversionRate,
    avgDaysToBooking,
    avgDaysToPayment,
  };
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoffFromPrevious: number;
}

function analyzeFunnel(leads: V4_3_Lead[]): FunnelStage[] {
  const stages = [
    { stage: "Inbox", statuses: ["new", "spam"] },
    { stage: "Contacted", statuses: ["contacted", "quoted"] },
    { stage: "Scheduled", statuses: ["scheduled"] },
    { stage: "Invoiced", statuses: ["invoiced"] },
    { stage: "Won", statuses: ["paid", "active_recurring"] },
  ];

  const funnel: FunnelStage[] = [];
  let previousCount = leads.length;

  for (const { stage, statuses } of stages) {
    const count = leads.filter(l =>
      statuses.includes(l.pipeline.status)
    ).length;
    const percentage = (count / leads.length) * 100;
    const dropoffFromPrevious =
      previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;

    funnel.push({
      stage,
      count,
      percentage,
      dropoffFromPrevious: stage === "Inbox" ? 0 : dropoffFromPrevious,
    });

    previousCount = count;
  }

  return funnel;
}

interface LeadSourceROI {
  source: string;
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalRevenue: number;
  totalLeadCost: number;
  totalProfit: number;
  roi: number; // (profit / leadCost) * 100
  avgRevenuePerLead: number;
  avgCostPerLead: number;
}

function analyzeLeadSourceROI(leads: V4_3_Lead[]): LeadSourceROI[] {
  const sourceMap = new Map<string, V4_3_Lead[]>();

  for (const lead of leads) {
    const source = lead.gmail?.leadSource || "Unknown";
    if (!sourceMap.has(source)) {
      sourceMap.set(source, []);
    }
    sourceMap.get(source)!.push(lead);
  }

  const rois: LeadSourceROI[] = [];

  for (const [source, sourceLeads] of sourceMap.entries()) {
    const wonLeads = sourceLeads.filter(
      l =>
        l.pipeline.status === "paid" || l.pipeline.status === "active_recurring"
    );

    const totalRevenue = sourceLeads.reduce(
      (sum, l) => sum + l.calculated.financial.invoicedPrice,
      0
    );
    const totalLeadCost = sourceLeads.reduce(
      (sum, l) => sum + l.calculated.financial.leadCost,
      0
    );
    const totalProfit = sourceLeads.reduce(
      (sum, l) => sum + l.calculated.financial.netProfit,
      0
    );

    const roi = totalLeadCost > 0 ? (totalProfit / totalLeadCost) * 100 : 0;

    rois.push({
      source,
      totalLeads: sourceLeads.length,
      wonLeads: wonLeads.length,
      conversionRate: (wonLeads.length / sourceLeads.length) * 100,
      totalRevenue,
      totalLeadCost,
      totalProfit,
      roi,
      avgRevenuePerLead: totalRevenue / sourceLeads.length,
      avgCostPerLead: totalLeadCost / sourceLeads.length,
    });
  }

  return rois.sort((a, b) => b.roi - a.roi);
}

interface ServiceTypeAccuracy {
  serviceType: string;
  totalBookings: number;
  avgEstimatedHours: number;
  avgActualHours: number;
  avgTimeAccuracy: number; // % (actual / estimated)
  overtimeCount: number;
  overtimePercentage: number;
}

function analyzeTimeAccuracy(leads: V4_3_Lead[]): ServiceTypeAccuracy[] {
  const serviceMap = new Map<string, V4_3_Lead[]>();

  for (const lead of leads) {
    const serviceType = lead.calculated.property.serviceType || "Unknown";
    if (lead.calculated.time.actualHours > 0) {
      if (!serviceMap.has(serviceType)) {
        serviceMap.set(serviceType, []);
      }
      serviceMap.get(serviceType)!.push(lead);
    }
  }

  const accuracies: ServiceTypeAccuracy[] = [];

  for (const [serviceType, serviceLeads] of serviceMap.entries()) {
    const totalBookings = serviceLeads.length;
    const avgEstimatedHours =
      serviceLeads.reduce(
        (sum, l) => sum + l.calculated.time.estimatedHours,
        0
      ) / totalBookings;
    const avgActualHours =
      serviceLeads.reduce((sum, l) => sum + l.calculated.time.actualHours, 0) /
      totalBookings;
    const avgTimeAccuracy = (avgActualHours / avgEstimatedHours) * 100;
    const overtimeCount = serviceLeads.filter(
      l => l.calculated.time.overtimeFlag
    ).length;

    accuracies.push({
      serviceType,
      totalBookings,
      avgEstimatedHours,
      avgActualHours,
      avgTimeAccuracy,
      overtimeCount,
      overtimePercentage: (overtimeCount / totalBookings) * 100,
    });
  }

  return accuracies;
}

interface PipelineHealth {
  activeLeads: number; // Inbox + Contacted + Scheduled
  staleLeads: number; // No response > 7 days
  deadLeads: number; // No response > 30 days
  avgDataCompleteness: number;
  highConfidenceLinks: number;
  lowConfidenceLinks: number;
}

function analyzePipelineHealth(leads: V4_3_Lead[]): PipelineHealth {
  const activeStatuses = [
    "new",
    "contacted",
    "quoted",
    "scheduled",
    "invoiced",
  ];
  const activeLeads = leads.filter(l =>
    activeStatuses.includes(l.pipeline.status)
  ).length;
  const staleLeads = leads.filter(
    l => l.pipeline.status === "no_response"
  ).length;
  const deadLeads = leads.filter(l => l.pipeline.status === "dead").length;

  const avgDataCompleteness =
    leads.reduce((sum, l) => sum + l.calculated.quality.dataCompleteness, 0) /
    leads.length;
  const highConfidenceLinks = leads.filter(
    l => l.calculated.quality.linkingConfidence === "high"
  ).length;
  const lowConfidenceLinks = leads.filter(
    l => l.calculated.quality.linkingConfidence === "low"
  ).length;

  return {
    activeLeads,
    staleLeads,
    deadLeads,
    avgDataCompleteness,
    highConfidenceLinks,
    lowConfidenceLinks,
  };
}

interface CustomerValue {
  totalCustomers: number;
  repeatCustomers: number;
  repeatCustomerRate: number;
  avgLifetimeValue: number;
  avgBookingsPerCustomer: number;
  topCustomers: Array<{
    name: string;
    email: string;
    lifetimeValue: number;
    totalBookings: number;
  }>;
}

function analyzeCustomerValue(leads: V4_3_Lead[]): CustomerValue {
  const totalCustomers = leads.length;
  const repeatCustomers = leads.filter(l => l.customer.isRepeatCustomer).length;

  const avgLifetimeValue =
    leads.reduce((sum, l) => sum + l.customer.lifetimeValue, 0) /
    totalCustomers;
  const avgBookingsPerCustomer =
    leads.reduce((sum, l) => sum + l.customer.totalBookings, 0) /
    totalCustomers;

  const topCustomers = leads
    .filter(l => l.customer.lifetimeValue > 0)
    .sort((a, b) => b.customer.lifetimeValue - a.customer.lifetimeValue)
    .slice(0, 10)
    .map(l => ({
      name: l.customerName,
      email: l.customerEmail,
      lifetimeValue: l.customer.lifetimeValue,
      totalBookings: l.customer.totalBookings,
    }));

  return {
    totalCustomers,
    repeatCustomers,
    repeatCustomerRate: (repeatCustomers / totalCustomers) * 100,
    avgLifetimeValue,
    avgBookingsPerCustomer,
    topCustomers,
  };
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

console.log("📈 Running analysis...\n");

const kpis = calculateKPIs(leads);
const funnel = analyzeFunnel(leads);
const leadSourceROI = analyzeLeadSourceROI(leads);
const timeAccuracy = analyzeTimeAccuracy(leads);
const pipelineHealth = analyzePipelineHealth(leads);
const customerValue = analyzeCustomerValue(leads);

const report = {
  metadata: {
    generated: new Date().toISOString(),
    timeWindow: dataset.metadata.timeWindow,
    totalLeads: leads.length,
  },
  kpis,
  funnel,
  leadSourceROI,
  timeAccuracy,
  pipelineHealth,
  customerValue,
};

// Save JSON
const jsonPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/v4_3_2-analysis-report.json"
);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));

// Generate Markdown report
const mdLines: string[] = [];

mdLines.push("# V4.3.2 Pipeline Analysis Report");
mdLines.push("");
mdLines.push(`**Generated**: ${new Date().toISOString()}`);
mdLines.push(
  `**Time Window**: ${dataset.metadata.timeWindow.start} → ${dataset.metadata.timeWindow.end}`
);
mdLines.push(`**Total Leads**: ${leads.length}`);
mdLines.push("");
mdLines.push("---");
mdLines.push("");

// KPIs
mdLines.push("## 📊 Key Performance Indicators");
mdLines.push("");
mdLines.push(`| Metric | Value |`);
mdLines.push(`|--------|-------|`);
mdLines.push(
  `| Total Revenue | ${kpis.totalRevenue.toLocaleString("da-DK")} kr |`
);
mdLines.push(
  `| Total Lead Cost | ${kpis.totalLeadCost.toLocaleString("da-DK")} kr |`
);
mdLines.push(
  `| Total Labor Cost | ${kpis.totalLaborCost.toLocaleString("da-DK")} kr |`
);
mdLines.push(
  `| **Total Net Profit** | **${kpis.totalNetProfit.toLocaleString("da-DK")} kr** |`
);
mdLines.push(`| Avg Gross Margin | ${kpis.avgGrossMargin.toFixed(1)}% |`);
mdLines.push(`| Avg Net Margin | ${kpis.avgNetMargin.toFixed(1)}% |`);
mdLines.push(
  `| Avg Revenue/Lead | ${kpis.avgRevenuePerLead.toLocaleString("da-DK")} kr |`
);
mdLines.push(`| Conversion Rate | ${kpis.conversionRate.toFixed(1)}% |`);
mdLines.push(
  `| Avg Days to Booking | ${kpis.avgDaysToBooking.toFixed(1)} days |`
);
mdLines.push(
  `| Avg Days to Payment | ${kpis.avgDaysToPayment.toFixed(1)} days |`
);
mdLines.push("");

// Funnel
mdLines.push("## 🔻 Conversion Funnel");
mdLines.push("");
mdLines.push(`| Stage | Count | % of Total | Dropoff |`);
mdLines.push(`|-------|-------|------------|---------|`);
for (const stage of funnel) {
  mdLines.push(
    `| ${stage.stage} | ${stage.count} | ${stage.percentage.toFixed(1)}% | ${stage.dropoffFromPrevious.toFixed(1)}% |`
  );
}
mdLines.push("");

// Lead Source ROI
mdLines.push("## 💰 Lead Source ROI");
mdLines.push("");
mdLines.push(
  `| Source | Leads | Won | Conv % | Revenue | Cost | Profit | ROI % |`
);
mdLines.push(
  `|--------|-------|-----|--------|---------|------|--------|-------|`
);
for (const roi of leadSourceROI) {
  mdLines.push(
    `| ${roi.source} | ${roi.totalLeads} | ${roi.wonLeads} | ${roi.conversionRate.toFixed(1)}% | ${roi.totalRevenue.toLocaleString("da-DK")} kr | ${roi.totalLeadCost.toLocaleString("da-DK")} kr | ${roi.totalProfit.toLocaleString("da-DK")} kr | ${roi.roi.toFixed(0)}% |`
  );
}
mdLines.push("");

// Time Accuracy
mdLines.push("## ⏱️ Time Estimation Accuracy by Service Type");
mdLines.push("");
mdLines.push(
  `| Service Type | Bookings | Est Hours | Actual Hours | Accuracy % | Overtime % |`
);
mdLines.push(
  `|--------------|----------|-----------|--------------|------------|------------|`
);
for (const acc of timeAccuracy) {
  mdLines.push(
    `| ${acc.serviceType} | ${acc.totalBookings} | ${acc.avgEstimatedHours.toFixed(1)}h | ${acc.avgActualHours.toFixed(1)}h | ${acc.avgTimeAccuracy.toFixed(1)}% | ${acc.overtimePercentage.toFixed(1)}% |`
  );
}
mdLines.push("");

// Pipeline Health
mdLines.push("## 🏥 Pipeline Health");
mdLines.push("");
mdLines.push(`| Metric | Value |`);
mdLines.push(`|--------|-------|`);
mdLines.push(`| Active Leads | ${pipelineHealth.activeLeads} |`);
mdLines.push(`| Stale Leads (7-30 days) | ${pipelineHealth.staleLeads} |`);
mdLines.push(`| Dead Leads (>30 days) | ${pipelineHealth.deadLeads} |`);
mdLines.push(
  `| Avg Data Completeness | ${pipelineHealth.avgDataCompleteness.toFixed(1)}% |`
);
mdLines.push(
  `| High Confidence Links | ${pipelineHealth.highConfidenceLinks} |`
);
mdLines.push(`| Low Confidence Links | ${pipelineHealth.lowConfidenceLinks} |`);
mdLines.push("");

// Customer Value
mdLines.push("## 👥 Customer Value Analysis");
mdLines.push("");
mdLines.push(`| Metric | Value |`);
mdLines.push(`|--------|-------|`);
mdLines.push(`| Total Customers | ${customerValue.totalCustomers} |`);
mdLines.push(
  `| Repeat Customers | ${customerValue.repeatCustomers} (${customerValue.repeatCustomerRate.toFixed(1)}%) |`
);
mdLines.push(
  `| Avg Lifetime Value | ${customerValue.avgLifetimeValue.toLocaleString("da-DK")} kr |`
);
mdLines.push(
  `| Avg Bookings/Customer | ${customerValue.avgBookingsPerCustomer.toFixed(1)} |`
);
mdLines.push("");
mdLines.push("### Top 10 Customers by Lifetime Value");
mdLines.push("");
mdLines.push(`| Name | Email | LTV | Bookings |`);
mdLines.push(`|------|-------|-----|----------|`);
for (const customer of customerValue.topCustomers) {
  mdLines.push(
    `| ${customer.name} | ${customer.email} | ${customer.lifetimeValue.toLocaleString("da-DK")} kr | ${customer.totalBookings} |`
  );
}
mdLines.push("");

// Save MD
const mdPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/v4_3-analysis-report.md"
);
writeFileSync(mdPath, mdLines.join("\n"));

// Console output
console.log("=".repeat(70));
console.log("✅ ANALYSIS COMPLETE");
console.log("=".repeat(70));
console.log(`\nJSON Report: ${jsonPath}`);
console.log(`Markdown Report: ${mdPath}`);
console.log("\n📊 KEY INSIGHTS");
console.log("-".repeat(70));
console.log(
  `Net Profit: ${kpis.totalNetProfit.toLocaleString("da-DK")} kr (${kpis.avgNetMargin.toFixed(1)}% margin)`
);
console.log(`Conversion Rate: ${kpis.conversionRate.toFixed(1)}%`);
console.log(
  `Best Lead Source: ${leadSourceROI[0]?.source} (${leadSourceROI[0]?.roi.toFixed(0)}% ROI)`
);
console.log(`Active Leads: ${pipelineHealth.activeLeads}`);
console.log(
  `Repeat Customer Rate: ${customerValue.repeatCustomerRate.toFixed(1)}%`
);
console.log("");
console.log("✅ V4.3.2 Pipeline Complete!");
console.log("\n💾 Output Files:");
console.log("   • complete-leads-v4.3.2.json");
console.log("   • v4_3_2-analysis-report.json");
console.log("   • v4_3_2-analysis-report.md");
console.log("");
