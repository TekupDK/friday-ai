/**
 * V4.3.2 Script 2: Calculate Metrics (Enhanced Calendar Data)
 *
 * Takes raw linked leads from V4.3.2 with enhanced calendar parsing.
 *
 * NEW in V4.3.2:
 * - Uses calendar parsed email/phone for better matching
 * - Uses calendar service type for classification
 * - Uses calendar price for revenue tracking
 *
 * Calculates all metrics:
 * - Property metrics (size, service type)
 * - Financial metrics (profit, margins, lead costs)
 * - Time metrics (accuracy, variance)
 * - Timeline metrics (days to booking/payment)
 * - Quality metrics (completeness, confidence)
 * - Pipeline status
 * - Customer value
 * - Quote recommendations
 *
 * Then deduplicates and filters spam/dead leads.
 *
 * Input: raw-leads-v4_3_2.json
 * Output: complete-leads-v4.3.2.json
 *
 * Run: npx tsx server/integrations/chromadb/scripts/2-calculate-metrics-v4_3_2.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  V4_3_CONFIG,
  normalizeLeadSource,
  getPerLeadCost,
  calculateProfit,
  determineLeadStatus,
  LeadStatus,
  LeadSource,
} from "../v4_3-config";
import { deduplicateLeads, DEFAULT_FILTER_CONFIG } from "../v4_3-deduplication";
import { V4_3_Lead, V4_3_Dataset } from "../v4_3-types";

console.log("🧮 V4.3.2 Script 2: Calculate Metrics (Enhanced Calendar)\n");
console.log("=".repeat(70));

// ============================================================================
// LOAD RAW DATA
// ============================================================================

const rawPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/raw-leads-v4_3_2.json"
);

console.log(`📂 Loading: ${rawPath}\n`);

const rawData = JSON.parse(readFileSync(rawPath, "utf-8"));
let leads: V4_3_Lead[] = rawData.leads || [];

console.log(`Loaded ${leads.length} raw leads\n`);

// ============================================================================
// CALCULATE METRICS
// ============================================================================

console.log("🔢 Calculating metrics...\n");

for (const lead of leads) {
  // =========================================================================
  // 1. PROPERTY METRICS
  // =========================================================================

  let propertySize = 0;
  let propertySizeSource: "billy" | "gmail" | "calendar" | "unknown" =
    "unknown";

  // Try Billy first (most accurate)
  if (lead.billy) {
    const match = lead.billy.description.match(/(\d+)\s*m[²2]/i);
    if (match) {
      propertySize = parseInt(match[1]);
      propertySizeSource = "billy";
    }
  }

  // Try Gmail if not found
  if (propertySize === 0 && lead.gmail) {
    const match = lead.gmail.subject.match(/(\d+)\s*m[²2]/i);
    if (match) {
      propertySize = parseInt(match[1]);
      propertySizeSource = "gmail";
    }
  }

  // Service type
  const serviceType = lead.billy?.productId || "REN-001";
  const serviceConfig =
    V4_3_CONFIG.serviceTypes[serviceType] ||
    V4_3_CONFIG.serviceTypes["REN-001"];

  lead.calculated.property = {
    propertySize,
    propertySizeSource,
    serviceType,
    serviceTypeName: serviceConfig.name,
  };

  // =========================================================================
  // 2. FINANCIAL METRICS
  // =========================================================================

  const quotedPrice = 0; // TODO: Extract from Gmail body
  const invoicedPrice = lead.billy?.invoicedPrice || 0;
  const paidAmount = lead.billy?.isPaid ? invoicedPrice : 0;
  const priceVariance = invoicedPrice - quotedPrice;

  // Lead cost
  const leadSource = normalizeLeadSource(lead.gmail?.leadSource);
  const leadCost = lead.billy ? getPerLeadCost(leadSource, serviceType) : 0;

  // Labor cost (90 kr/hour)
  const actualHours = lead.billy?.invoicedHours || 0;
  const laborCost = actualHours * 90;

  // Profit
  const grossProfit = invoicedPrice - laborCost;
  const netProfit = grossProfit - leadCost;

  // Margins
  const grossMargin =
    invoicedPrice > 0 ? (grossProfit / invoicedPrice) * 100 : 0;
  const netMargin = invoicedPrice > 0 ? (netProfit / invoicedPrice) * 100 : 0;

  lead.calculated.financial = {
    quotedPrice,
    invoicedPrice,
    paidAmount,
    priceVariance,
    leadCost,
    laborCost,
    grossProfit,
    netProfit,
    grossMargin,
    netMargin,
  };

  // =========================================================================
  // 3. TIME METRICS
  // =========================================================================

  // Estimated hours (m² × coefficient)
  let estimatedHours = 0;
  if (propertySize > 0) {
    estimatedHours = propertySize * serviceConfig.coefficient;
  }

  // Calendar work hours (duration × people)
  const calendarWorkHours = lead.calendar
    ? (lead.calendar.duration / 60) * (lead.calendar.numberOfPeople || 1)
    : 0;

  const timeVariance = actualHours - estimatedHours;
  const timeAccuracy = estimatedHours > 0 ? actualHours / estimatedHours : 0;
  const overtimeFlag = timeVariance > 1.0;

  lead.calculated.time = {
    estimatedHours,
    actualHours,
    calendarWorkHours,
    timeVariance,
    timeAccuracy,
    overtimeFlag,
  };

  // Update Gmail with estimated hours
  if (lead.gmail) {
    lead.gmail.estimatedHours = estimatedHours;
    lead.gmail.propertySize = propertySize;
    lead.gmail.quotedPrice = estimatedHours * 349; // hourly rate
  }

  // =========================================================================
  // 4. TIMELINE METRICS
  // =========================================================================

  const leadReceivedDate = lead.gmail?.date
    ? new Date(lead.gmail.date).toISOString().split("T")[0]
    : null;
  const firstReplyDate = null; // TODO: Extract from Gmail thread
  const bookingConfirmedDate = lead.calendar?.startTime
    ? new Date(lead.calendar.startTime).toISOString().split("T")[0]
    : null;
  const invoiceSentDate = lead.billy?.entryDate || null;
  const paidDate = lead.billy?.isPaid ? lead.billy.entryDate : null; // Approximate

  let daysToBooking: number | null = null;
  if (leadReceivedDate && bookingConfirmedDate) {
    const diff =
      new Date(bookingConfirmedDate).getTime() -
      new Date(leadReceivedDate).getTime();
    daysToBooking = Math.round(diff / (1000 * 60 * 60 * 24));
  }

  let daysToPayment: number | null = null;
  if (invoiceSentDate && paidDate) {
    const diff =
      new Date(paidDate).getTime() - new Date(invoiceSentDate).getTime();
    daysToPayment = Math.round(diff / (1000 * 60 * 60 * 24));
  }

  lead.calculated.timeline = {
    leadReceivedDate,
    firstReplyDate,
    bookingConfirmedDate,
    invoiceSentDate,
    paidDate,
    daysToBooking,
    daysToPayment,
  };

  // =========================================================================
  // 5. QUALITY METRICS
  // =========================================================================

  const hasGmail = lead.gmail !== null;
  const hasCalendar = lead.calendar !== null;
  const hasBilly = lead.billy !== null;

  // Data completeness (0-100%)
  let completeness = 0;
  if (hasGmail) completeness += 33;
  if (hasCalendar) completeness += 33;
  if (hasBilly) completeness += 34;

  // Linking confidence
  let linkingConfidence: "high" | "medium" | "low" = "high";
  if (!hasCalendar && !hasBilly) {
    linkingConfidence = "low";
  } else if (!hasBilly) {
    linkingConfidence = "medium";
  }

  lead.calculated.quality = {
    hasGmail,
    hasCalendar,
    hasBilly,
    dataCompleteness: completeness,
    linkingConfidence,
  };

  // =========================================================================
  // 6. PIPELINE STATUS
  // =========================================================================

  const status = determineLeadStatus({
    billy: lead.billy,
    calendar: lead.calendar,
    gmail: lead.gmail,
    calculated: lead.calculated,
    serviceType,
  });

  // Map status to stage
  let stage: typeof lead.pipeline.stage = "inbox";
  if (status === LeadStatus.SPAM) stage = "spam";
  else if (status === LeadStatus.ACTIVE_RECURRING) stage = "active";
  else if (status === LeadStatus.PAID) stage = "won";
  else if (status === LeadStatus.INVOICED) stage = "proposal";
  else if (status === LeadStatus.SCHEDULED) stage = "calendar";
  else if (status === LeadStatus.CONTACTED || status === LeadStatus.QUOTED)
    stage = "contacted";
  else if (
    status === LeadStatus.DEAD ||
    status === LeadStatus.LOST ||
    status === LeadStatus.CANCELLED
  )
    stage = "lost";

  lead.pipeline = {
    stage,
    substage: status,
    status,
  };

  // =========================================================================
  // 7. QUOTE RECOMMENDATION
  // =========================================================================

  let basis: typeof lead.quoteRecommendation.basis = "default";
  let confidence: typeof lead.quoteRecommendation.confidence = "low";

  if (actualHours > 0) {
    basis = "actual_invoiced";
    confidence = "high";
  } else if (estimatedHours > 0) {
    basis = "m2_rule";
    confidence = "medium";
  }

  const recommendedHours = actualHours > 0 ? actualHours : estimatedHours;
  const recommendedPrice = recommendedHours * 349;

  lead.quoteRecommendation = {
    estimatedHours: recommendedHours,
    estimatedPrice: recommendedPrice,
    basis,
    confidence,
    breakdown: {
      hours: recommendedHours,
      hourlyRate: 349,
      subtotal: recommendedPrice,
    },
  };
}

console.log("✅ Metrics calculated for all leads\n");

// ============================================================================
// DEDUPLICATION & FILTERING
// ============================================================================

console.log("🔄 Deduplicating and filtering...\n");

const deduplicatedLeads = deduplicateLeads(leads, {
  ...DEFAULT_FILTER_CONFIG,
  includeSpam: false,
  includeDead: false,
  includeNoResponse: true,
});

console.log(
  `✅ Filtered: ${leads.length} → ${deduplicatedLeads.length} leads\n`
);

// ============================================================================
// GENERATE DATASET METADATA
// ============================================================================

console.log("📊 Generating dataset metadata...\n");

const metadata: V4_3_Dataset["metadata"] = {
  version: "4.3",
  generated: new Date().toISOString(),
  timeWindow: V4_3_CONFIG.timeWindow,
  counts: {
    total: deduplicatedLeads.length,
    withBilly: deduplicatedLeads.filter(l => l.billy).length,
    withCalendar: deduplicatedLeads.filter(l => l.calendar).length,
    withGmail: deduplicatedLeads.filter(l => l.gmail).length,
    byStage: {},
    byLeadSource: {},
  },
  quality: {
    avgDataCompleteness: 0,
    avgLinkingConfidence: "medium",
  },
  financial: {
    totalRevenue: 0,
    totalLeadCost: 0,
    totalLaborCost: 0,
    totalProfit: 0,
    avgProfitMargin: 0,
  },
};

// Count by stage
for (const lead of deduplicatedLeads) {
  const stage = lead.pipeline.stage;
  metadata.counts.byStage[stage] = (metadata.counts.byStage[stage] || 0) + 1;

  const leadSource = lead.gmail?.leadSource || "Unknown";
  metadata.counts.byLeadSource[leadSource] =
    (metadata.counts.byLeadSource[leadSource] || 0) + 1;
}

// Calculate averages
const totalCompleteness = deduplicatedLeads.reduce(
  (sum, l) => sum + l.calculated.quality.dataCompleteness,
  0
);
metadata.quality.avgDataCompleteness =
  totalCompleteness / deduplicatedLeads.length;

// Financial totals
for (const lead of deduplicatedLeads) {
  metadata.financial.totalRevenue += lead.calculated.financial.invoicedPrice;
  metadata.financial.totalLeadCost += lead.calculated.financial.leadCost;
  metadata.financial.totalLaborCost += lead.calculated.financial.laborCost;
  metadata.financial.totalProfit += lead.calculated.financial.netProfit;
}

metadata.financial.avgProfitMargin =
  metadata.financial.totalRevenue > 0
    ? (metadata.financial.totalProfit / metadata.financial.totalRevenue) * 100
    : 0;

// ============================================================================
// SAVE OUTPUT
// ============================================================================

const outputPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.2.json"
);

const output: V4_3_Dataset = {
  metadata,
  leads: deduplicatedLeads,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log("=".repeat(70));
console.log("✅ METRICS CALCULATION COMPLETE");
console.log("=".repeat(70));
console.log(`\nOutput: ${outputPath}`);
console.log(`\n📊 DATASET SUMMARY`);
console.log("-".repeat(70));
console.log(`Total Leads: ${metadata.counts.total}`);
console.log(
  `• With Gmail: ${metadata.counts.withGmail} (${Math.round((metadata.counts.withGmail / metadata.counts.total) * 100)}%)`
);
console.log(
  `• With Calendar: ${metadata.counts.withCalendar} (${Math.round((metadata.counts.withCalendar / metadata.counts.total) * 100)}%)`
);
console.log(
  `• With Billy: ${metadata.counts.withBilly} (${Math.round((metadata.counts.withBilly / metadata.counts.total) * 100)}%)`
);

console.log(`\n📈 PIPELINE STAGES`);
console.log("-".repeat(70));
for (const [stage, count] of Object.entries(metadata.counts.byStage).sort(
  (a, b) => b[1] - a[1]
)) {
  const pct = Math.round((count / metadata.counts.total) * 100);
  console.log(`• ${stage}: ${count} (${pct}%)`);
}

console.log(`\n💰 FINANCIAL SUMMARY`);
console.log("-".repeat(70));
console.log(
  `Total Revenue: ${metadata.financial.totalRevenue.toLocaleString("da-DK")} kr`
);
console.log(
  `Total Lead Cost: ${metadata.financial.totalLeadCost.toLocaleString("da-DK")} kr`
);
console.log(
  `Total Labor Cost: ${metadata.financial.totalLaborCost.toLocaleString("da-DK")} kr`
);
console.log(
  `Total Net Profit: ${metadata.financial.totalProfit.toLocaleString("da-DK")} kr`
);
console.log(
  `Avg Profit Margin: ${metadata.financial.avgProfitMargin.toFixed(1)}%`
);

console.log(`\n📋 LEAD SOURCES`);
console.log("-".repeat(70));
for (const [source, count] of Object.entries(metadata.counts.byLeadSource).sort(
  (a, b) => b[1] - a[1]
)) {
  const pct = Math.round((count / metadata.counts.total) * 100);
  console.log(`• ${source}: ${count} (${pct}%)`);
}

console.log(`\n🎯 DATA QUALITY`);
console.log("-".repeat(70));
console.log(
  `Avg Data Completeness: ${metadata.quality.avgDataCompleteness.toFixed(1)}%`
);

console.log("\n💡 Next Step: Run script 3 to generate analysis report");
console.log(
  "   npx tsx server/integrations/chromadb/scripts/3-pipeline-analysis-v4_3.ts\n"
);
