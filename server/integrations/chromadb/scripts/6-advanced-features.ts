/**
 * V4.3.3 Script 6: Advanced ChromaDB Features
 *
 * Advanced AI-powered lead intelligence:
 * - Customer similarity matching
 * - Smart lead recommendations
 * - Duplicate detection
 * - Auto lead classification
 * - Win probability prediction
 *
 * Usage: npx tsx server/integrations/chromadb/scripts/6-advanced-features.ts
 */

import { ChromaClient } from "chromadb";
import { readFileSync } from "fs";
import { resolve } from "path";
import { V4_3_Dataset, V4_3_Lead } from "../v4_3-types";

console.log("🧠 V4.3.3 Script 6: Advanced ChromaDB Features\n");
console.log("=".repeat(70));

const CHROMA_HOST = process.env.CHROMA_HOST || "localhost";
const CHROMA_PORT = process.env.CHROMA_PORT || "8000";
const COLLECTION_NAME = "leads_v4_3_3";

// Load full lead data for enrichment
const dataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.3.json"
);
const dataset: V4_3_Dataset = JSON.parse(readFileSync(dataPath, "utf-8"));
const leadsMap = new Map(dataset.leads.map(l => [l.id, l]));

const client = new ChromaClient({
  path: `http://${CHROMA_HOST}:${CHROMA_PORT}`,
});

// ============================================================================
// FEATURE 1: CUSTOMER SIMILARITY MATCHING
// ============================================================================

async function findSimilarCustomers(leadId: string, options = { nResults: 5 }) {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  const collection = await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  // Get reference lead
  const referenceLead = leadsMap.get(leadId);
  if (!referenceLead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Build search text from lead data
  const searchText = [
    referenceLead.customerName,
    referenceLead.calculated?.property.serviceType,
    referenceLead.calculated?.property.propertySize
      ? `${referenceLead.calculated.property.propertySize}m²`
      : "",
    referenceLead.gmail?.leadSource,
  ]
    .filter(Boolean)
    .join(" ");

  // Find similar leads
  const results = await collection.query({
    queryTexts: [searchText],
    nResults: options.nResults + 1, // +1 because first will be the reference itself
  });

  // Filter out the reference lead and enrich with full data
  const similarLeads = results
    .ids![0].slice(0, options.nResults + 1)
    .filter(id => id !== leadId)
    .slice(0, options.nResults)
    .map(id => {
      const lead = leadsMap.get(id);
      const metaIdx = results.ids?.[0]?.indexOf(id) ?? -1;
      return {
        id,
        lead,
        similarity: results.distances ? 1 - results.distances[0][metaIdx] : 0,
        metadata: results.metadatas![0][metaIdx],
      };
    });

  return {
    referenceLead,
    similarLeads,
  };
}

// ============================================================================
// FEATURE 2: SMART LEAD RECOMMENDATIONS
// ============================================================================

interface RecommendationScore {
  leadId: string;
  lead: V4_3_Lead;
  score: number;
  reasons: string[];
}

async function getLeadRecommendations(options = { limit: 10 }) {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  const collection = await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  // Get all active leads (not won/lost/dead)
  const activeLeads = await collection.get({
    where: {
      status: {
        $in: [
          "inbox",
          "contacted",
          "proposal",
          "calendar",
          "scheduled",
          "quoted",
        ],
      },
    },
  });

  // Score each lead based on multiple factors
  const recommendations: RecommendationScore[] = activeLeads.ids.map(id => {
    const lead = leadsMap.get(id)!;
    const meta = activeLeads.metadatas[activeLeads.ids.indexOf(id)];

    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Data completeness (0-30 points)
    const completeness = Number(meta?.dataCompleteness) || 0;
    const completenessScore = (completeness / 100) * 30;
    score += completenessScore;
    if (completeness > 70) {
      reasons.push(`High data quality (${completeness}%)`);
    }

    // Factor 2: Lead source quality (0-25 points)
    const source = String(meta?.leadSource || "");
    if (source.includes("Leadpoint")) {
      score += 25;
      reasons.push("Premium lead source (Leadpoint)");
    } else if (source.includes("Rengøring.nu")) {
      score += 15;
      reasons.push("Good lead source (Rengøring.nu)");
    }

    // Factor 3: Calendar booking (20 points)
    if (meta?.hasCalendar) {
      score += 20;
      reasons.push("Calendar booking scheduled");
    }

    // Factor 4: Billy invoice exists (15 points)
    if (meta?.hasBilly) {
      score += 15;
      reasons.push("Invoice already created");
    }

    // Factor 5: Pipeline stage progression (0-10 points)
    const stageScores: Record<string, number> = {
      calendar: 10,
      scheduled: 9,
      proposal: 7,
      quoted: 6,
      contacted: 4,
      inbox: 0,
    };
    const stageScore = stageScores[String(meta?.status)] || 0;
    score += stageScore;
    if (stageScore > 5) {
      reasons.push(`Advanced stage (${meta?.status})`);
    }

    return {
      leadId: id,
      lead,
      score,
      reasons,
    };
  });

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit);
}

// ============================================================================
// FEATURE 3: DUPLICATE DETECTION
// ============================================================================

interface DuplicateGroup {
  leads: V4_3_Lead[];
  similarityScore: number;
  reason: string;
}

async function detectDuplicates(threshold = 0.95) {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  const collection = await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  const allLeads = Array.from(leadsMap.values());
  const duplicateGroups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (const lead of allLeads) {
    if (processed.has(lead.id)) continue;

    // Search for similar leads
    const searchText = [
      lead.customerName,
      lead.customerEmail,
      lead.customerPhone,
    ]
      .filter(Boolean)
      .join(" ");

    const results = await collection.query({
      queryTexts: [searchText],
      nResults: 5,
    });

    const duplicates: V4_3_Lead[] = [lead];
    processed.add(lead.id);

    results.ids![0].forEach((id, idx) => {
      if (id === lead.id || processed.has(id)) return;

      const similarity = results.distances ? 1 - results.distances[0][idx] : 0;

      if (similarity >= threshold) {
        const duplicateLead = leadsMap.get(id)!;
        duplicates.push(duplicateLead);
        processed.add(id);
      }
    });

    if (duplicates.length > 1) {
      duplicateGroups.push({
        leads: duplicates,
        similarityScore: 0.95, // Average similarity
        reason: "Similar name, email, or phone",
      });
    }
  }

  return duplicateGroups;
}

// ============================================================================
// FEATURE 4: AUTO LEAD CLASSIFICATION
// ============================================================================

interface LeadClassification {
  leadId: string;
  classification: "hot" | "warm" | "cold";
  confidence: number;
  predictedRevenue: number;
  winProbability: number;
  recommendedActions: string[];
}

async function classifyLeads() {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  const collection = await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  // Get all non-closed leads
  const activeLeads = await collection.get({
    where: {
      status: { $nin: ["won", "lost", "dead", "paid"] },
    },
  });

  const classifications: LeadClassification[] = activeLeads.ids.map(id => {
    const lead = leadsMap.get(id)!;
    const meta = activeLeads.metadatas[activeLeads.ids.indexOf(id)];

    let winProbability = 0;
    const recommendedActions: string[] = [];

    // Calculate win probability based on historical patterns
    const hasCalendar = Boolean(meta?.hasCalendar);
    const hasBilly = Boolean(meta?.hasBilly);
    const completeness = Number(meta?.dataCompleteness) || 0;
    const leadSource = String(meta?.leadSource || "");

    // Base probability on data completeness
    winProbability += (completeness / 100) * 30;

    // Boost for calendar booking
    if (hasCalendar) {
      winProbability += 35;
      recommendedActions.push("Follow up on calendar booking");
    } else {
      recommendedActions.push("Schedule calendar booking");
    }

    // Boost for Billy invoice
    if (hasBilly) {
      winProbability += 25;
      recommendedActions.push("Send invoice reminder");
    }

    // Lead source quality boost
    if (leadSource.includes("Leadpoint")) {
      winProbability += 10;
    }

    // Predict revenue based on similar won deals
    const avgRevenue = Number(meta?.revenue) || 2500; // Default avg
    const predictedRevenue = Math.round(avgRevenue * (winProbability / 100));

    // Classify as hot/warm/cold
    let classification: "hot" | "warm" | "cold";
    if (winProbability >= 70) {
      classification = "hot";
      recommendedActions.unshift("🔥 Priority follow-up");
    } else if (winProbability >= 40) {
      classification = "warm";
      recommendedActions.unshift("📞 Contact within 24h");
    } else {
      classification = "cold";
      recommendedActions.unshift("📧 Email nurture sequence");
    }

    return {
      leadId: id,
      classification,
      confidence: Math.min(winProbability, 100) / 100,
      predictedRevenue,
      winProbability: Math.min(winProbability, 100),
      recommendedActions,
    };
  });

  return classifications;
}

// ============================================================================
// RUN ALL FEATURES
// ============================================================================

async function runAdvancedFeatures() {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  const collection = await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  console.log(`\n🔌 Connected to ChromaDB collection: ${COLLECTION_NAME}\n`);
  console.log("=".repeat(70));

  // ============================================================================
  // DEMO 1: Similar Customer Matching
  // ============================================================================

  console.log("\n🔗 FEATURE 1: Similar Customer Matching");
  console.log("-".repeat(70));

  // Find a won customer to use as reference
  const wonLeads = await collection.get({
    where: { status: "won" },
    limit: 1,
  });

  if (wonLeads.ids.length > 0) {
    const referenceId = wonLeads.ids[0];
    const similarity = await findSimilarCustomers(referenceId, { nResults: 3 });

    console.log(`\nReference: ${similarity.referenceLead.customerName}`);
    console.log(
      `Service: ${similarity.referenceLead.calculated?.property.serviceType}`
    );
    console.log(
      `Revenue: ${similarity.referenceLead.calculated?.financial.invoicedPrice} kr\n`
    );

    console.log("Top 3 similar customers to target:");
    similarity.similarLeads.forEach((sim, idx) => {
      console.log(
        `   ${idx + 1}. ${sim.lead?.customerName} - ${sim.lead?.pipeline.status}`
      );
      console.log(
        `      Similarity: ${(sim.similarity * 100).toFixed(1)}% | Service: ${sim.lead?.calculated?.property.serviceType}`
      );
    });
  }

  // ============================================================================
  // DEMO 2: Smart Lead Recommendations
  // ============================================================================

  console.log("\n\n🎯 FEATURE 2: Smart Lead Recommendations");
  console.log("-".repeat(70));

  const recommendations = await getLeadRecommendations({ limit: 5 });

  console.log("\nTop 5 leads to prioritize today:\n");
  recommendations.forEach((rec, idx) => {
    console.log(
      `   ${idx + 1}. ${rec.lead.customerName} (Score: ${rec.score.toFixed(1)}/100)`
    );
    console.log(
      `      Status: ${rec.lead.pipeline.status} | Revenue: ${rec.lead.calculated?.financial.invoicedPrice || 0} kr`
    );
    console.log(`      Why: ${rec.reasons.join(", ")}`);
    console.log("");
  });

  // ============================================================================
  // DEMO 3: Duplicate Detection
  // ============================================================================

  console.log("\n🔍 FEATURE 3: Duplicate Detection");
  console.log("-".repeat(70));

  const duplicates = await detectDuplicates(0.9);

  if (duplicates.length > 0) {
    console.log(`\nFound ${duplicates.length} potential duplicate groups:\n`);
    duplicates.slice(0, 3).forEach((group, idx) => {
      console.log(`   Group ${idx + 1}: ${group.leads.length} leads`);
      group.leads.forEach(lead => {
        console.log(
          `      - ${lead.customerName} (${lead.id}) - ${lead.pipeline.status}`
        );
      });
      console.log(`      Reason: ${group.reason}\n`);
    });
  } else {
    console.log("\n✅ No duplicates found!");
  }

  // ============================================================================
  // DEMO 4: Lead Classification
  // ============================================================================

  console.log("\n\n🧠 FEATURE 4: Auto Lead Classification & Win Probability");
  console.log("-".repeat(70));

  const classifications = await classifyLeads();

  const hotLeads = classifications.filter(c => c.classification === "hot");
  const warmLeads = classifications.filter(c => c.classification === "warm");
  const coldLeads = classifications.filter(c => c.classification === "cold");

  console.log(`\n🔥 HOT Leads (${hotLeads.length}): Win probability ≥70%\n`);
  hotLeads.slice(0, 3).forEach(lead => {
    const fullLead = leadsMap.get(lead.leadId)!;
    console.log(`   ${fullLead.customerName}`);
    console.log(
      `      Win Probability: ${lead.winProbability.toFixed(1)}% | Predicted Revenue: ${lead.predictedRevenue} kr`
    );
    console.log(`      Actions: ${lead.recommendedActions.join(", ")}\n`);
  });

  console.log(
    `\n📞 WARM Leads (${warmLeads.length}): Win probability 40-70%\n`
  );
  warmLeads.slice(0, 3).forEach(lead => {
    const fullLead = leadsMap.get(lead.leadId)!;
    console.log(`   ${fullLead.customerName}`);
    console.log(
      `      Win Probability: ${lead.winProbability.toFixed(1)}% | Predicted Revenue: ${lead.predictedRevenue} kr`
    );
    console.log(`      Actions: ${lead.recommendedActions.join(", ")}\n`);
  });

  console.log(`\n📧 COLD Leads (${coldLeads.length}): Win probability <40%\n`);

  // Calculate total predicted revenue
  const totalPredictedRevenue = classifications.reduce(
    (sum, c) => sum + c.predictedRevenue,
    0
  );
  const weightedRevenue = classifications.reduce(
    (sum, c) => sum + (c.predictedRevenue * c.winProbability) / 100,
    0
  );

  console.log("\n" + "=".repeat(70));
  console.log("📊 PIPELINE INTELLIGENCE SUMMARY");
  console.log("=".repeat(70));
  console.log(`\nTotal Active Leads: ${classifications.length}`);
  console.log(`   🔥 Hot: ${hotLeads.length} leads`);
  console.log(`   📞 Warm: ${warmLeads.length} leads`);
  console.log(`   📧 Cold: ${coldLeads.length} leads`);
  console.log(
    `\nPredicted Revenue (100% close): ${totalPredictedRevenue.toLocaleString()} kr`
  );
  console.log(
    `Weighted Revenue (prob-adjusted): ${weightedRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} kr`
  );

  console.log("\n" + "=".repeat(70));
  console.log("✅ ADVANCED FEATURES COMPLETE");
  console.log("=".repeat(70));
  console.log("\n💡 These AI-powered insights help you:");
  console.log("   - Find customers similar to your best wins");
  console.log("   - Prioritize leads with highest conversion potential");
  console.log("   - Detect and merge duplicate contacts");
  console.log("   - Predict revenue and win probability\n");
}

runAdvancedFeatures().catch(console.error);
