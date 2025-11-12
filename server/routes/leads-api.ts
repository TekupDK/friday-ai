/**
 * Leads API Routes - ChromaDB Integration
 *
 * REST API endpoints for lead management and semantic search
 *
 * Endpoints:
 * - GET  /api/leads/search?q=query&limit=10
 * - GET  /api/leads/:id/similar?limit=5
 * - GET  /api/leads/recommendations?limit=10
 * - GET  /api/leads/classify
 * - GET  /api/leads/duplicates
 * - GET  /api/leads/stats
 */

import { Router, Request, Response } from "express";
import { ChromaClient } from "chromadb";
import { readFileSync } from "fs";
import { resolve } from "path";
import { V4_3_Dataset, V4_3_Lead } from "../integrations/chromadb/v4_3-types";

const router = Router();

// Initialize ChromaDB client
const CHROMA_HOST = process.env.CHROMA_HOST || "localhost";
const CHROMA_PORT = process.env.CHROMA_PORT || "8000";
const COLLECTION_NAME = "leads_v4_3_3";

const client = new ChromaClient({
  path: `http://${CHROMA_HOST}:${CHROMA_PORT}`,
});

// Load full lead data
const dataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.3.json"
);
const dataset: V4_3_Dataset = JSON.parse(readFileSync(dataPath, "utf-8"));
const leadsMap = new Map(dataset.leads.map(l => [l.id, l]));

// Helper to get collection with embedding
async function getCollection() {
  const { DefaultEmbeddingFunction } = await import(
    "@chroma-core/default-embed"
  );
  const embedder = new DefaultEmbeddingFunction();

  return await client.getCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });
}

// ============================================================================
// GET /api/leads/search - Semantic search
// ============================================================================

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const minRevenue = req.query.minRevenue
      ? parseInt(req.query.minRevenue as string)
      : undefined;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const collection = await getCollection();

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (minRevenue) {
      where.revenue = { $gt: minRevenue };
    }

    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
      ...(Object.keys(where).length > 0 && { where }),
    });

    const leads = results.ids![0].map((id, idx) => {
      const lead = leadsMap.get(id);
      const meta = results.metadatas![0][idx];
      const distance = results.distances?.[0]?.[idx] ?? 1;

      return {
        id,
        customerName: lead?.customerName,
        customerEmail: lead?.customerEmail,
        status: lead?.pipeline.status,
        stage: lead?.pipeline.stage,
        revenue: lead?.calculated?.financial.invoicedPrice || 0,
        profit: lead?.calculated?.financial.netProfit || 0,
        serviceType: lead?.calculated?.property.serviceType,
        leadSource: lead?.gmail?.leadSource,
        dataCompleteness: lead?.calculated?.quality.dataCompleteness,
        similarity: (1 - distance) * 100, // Convert to percentage
        metadata: meta,
      };
    });

    res.json({
      query,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed", message: error.message });
  }
});

// ============================================================================
// GET /api/leads/:id/similar - Find similar leads
// ============================================================================

router.get("/:id/similar", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const referenceLead = leadsMap.get(id);
    if (!referenceLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const collection = await getCollection();

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

    const results = await collection.query({
      queryTexts: [searchText],
      nResults: limit + 1, // +1 to exclude self
    });

    const similarLeads = results
      .ids![0].filter(resultId => resultId !== id)
      .slice(0, limit)
      .map((resultId, idx) => {
        const lead = leadsMap.get(resultId);
        const actualIdx = results.ids![0].indexOf(resultId);
        const distance = results.distances?.[0]?.[actualIdx] ?? 1;

        return {
          id: resultId,
          customerName: lead?.customerName,
          status: lead?.pipeline.status,
          revenue: lead?.calculated?.financial.invoicedPrice || 0,
          serviceType: lead?.calculated?.property.serviceType,
          similarity: ((1 - distance) * 100).toFixed(1),
        };
      });

    res.json({
      reference: {
        id: referenceLead.id,
        customerName: referenceLead.customerName,
        serviceType: referenceLead.calculated?.property.serviceType,
        revenue: referenceLead.calculated?.financial.invoicedPrice,
      },
      similarLeads,
    });
  } catch (error: any) {
    console.error("Similar leads error:", error);
    res
      .status(500)
      .json({ error: "Failed to find similar leads", message: error.message });
  }
});

// ============================================================================
// GET /api/leads/recommendations - Smart lead recommendations
// ============================================================================

router.get("/recommendations", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const collection = await getCollection();

    // Get all active leads
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

    // Score each lead
    const recommendations = activeLeads.ids.map(id => {
      const lead = leadsMap.get(id)!;
      const meta = activeLeads.metadatas[activeLeads.ids.indexOf(id)];

      let score = 0;
      const reasons: string[] = [];

      // Factor 1: Data completeness
      const completeness = Number(meta?.dataCompleteness) || 0;
      score += (completeness / 100) * 30;
      if (completeness > 70)
        reasons.push(`High quality data (${completeness}%)`);

      // Factor 2: Lead source
      const source = String(meta?.leadSource || "");
      if (source.includes("Leadpoint")) {
        score += 25;
        reasons.push("Premium source");
      }

      // Factor 3: Calendar booking
      if (meta?.hasCalendar) {
        score += 20;
        reasons.push("Booking scheduled");
      }

      // Factor 4: Billy invoice
      if (meta?.hasBilly) {
        score += 15;
        reasons.push("Invoice created");
      }

      // Factor 5: Pipeline stage
      const stageScores: Record<string, number> = {
        calendar: 10,
        scheduled: 9,
        proposal: 7,
        quoted: 6,
        contacted: 4,
        inbox: 0,
      };
      score += stageScores[String(meta?.status)] || 0;

      return {
        id,
        customerName: lead.customerName,
        status: lead.pipeline.status,
        revenue: lead.calculated?.financial.invoicedPrice || 0,
        score: Math.round(score),
        reasons,
      };
    });

    const sorted = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    res.json({
      count: sorted.length,
      recommendations: sorted,
    });
  } catch (error: any) {
    console.error("Recommendations error:", error);
    res
      .status(500)
      .json({ error: "Failed to get recommendations", message: error.message });
  }
});

// ============================================================================
// GET /api/leads/classify - Lead classification with win probability
// ============================================================================

router.get("/classify", async (req: Request, res: Response) => {
  try {
    const collection = await getCollection();

    const activeLeads = await collection.get({
      where: {
        status: { $nin: ["won", "lost", "dead", "paid"] },
      },
    });

    const classifications = activeLeads.ids.map(id => {
      const lead = leadsMap.get(id)!;
      const meta = activeLeads.metadatas[activeLeads.ids.indexOf(id)];

      let winProbability = 0;

      winProbability += ((Number(meta?.dataCompleteness) || 0) / 100) * 30;
      if (meta?.hasCalendar) winProbability += 35;
      if (meta?.hasBilly) winProbability += 25;
      if (String(meta?.leadSource).includes("Leadpoint")) winProbability += 10;

      const predictedRevenue = Math.round(
        (Number(meta?.revenue) || 2500) * (winProbability / 100)
      );

      let classification: "hot" | "warm" | "cold";
      if (winProbability >= 70) classification = "hot";
      else if (winProbability >= 40) classification = "warm";
      else classification = "cold";

      return {
        id,
        customerName: lead.customerName,
        status: lead.pipeline.status,
        classification,
        winProbability: Math.round(Math.min(winProbability, 100)),
        predictedRevenue,
      };
    });

    const hot = classifications.filter(c => c.classification === "hot");
    const warm = classifications.filter(c => c.classification === "warm");
    const cold = classifications.filter(c => c.classification === "cold");

    res.json({
      total: classifications.length,
      hot: hot.length,
      warm: warm.length,
      cold: cold.length,
      leads: classifications.sort(
        (a, b) => b.winProbability - a.winProbability
      ),
    });
  } catch (error: any) {
    console.error("Classification error:", error);
    res
      .status(500)
      .json({ error: "Failed to classify leads", message: error.message });
  }
});

// ============================================================================
// GET /api/leads/duplicates - Detect duplicate leads
// ============================================================================

router.get("/duplicates", async (req: Request, res: Response) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 0.9;

    const collection = await getCollection();
    const allLeads = Array.from(leadsMap.values());
    const duplicateGroups: any[] = [];
    const processed = new Set<string>();

    for (const lead of allLeads.slice(0, 50)) {
      // Limit to avoid timeout
      if (processed.has(lead.id)) continue;

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

      const duplicates: any[] = [{ id: lead.id, name: lead.customerName }];
      processed.add(lead.id);

      results.ids![0].forEach((id, idx) => {
        if (id === lead.id || processed.has(id)) return;

        const distance = results.distances?.[0]?.[idx] ?? 1;
        const similarity = 1 - distance;

        if (similarity >= threshold) {
          const dup = leadsMap.get(id)!;
          duplicates.push({
            id,
            name: dup.customerName,
            similarity: (similarity * 100).toFixed(1),
          });
          processed.add(id);
        }
      });

      if (duplicates.length > 1) {
        duplicateGroups.push({ leads: duplicates });
      }
    }

    res.json({
      count: duplicateGroups.length,
      groups: duplicateGroups,
    });
  } catch (error: any) {
    console.error("Duplicates error:", error);
    res
      .status(500)
      .json({ error: "Failed to detect duplicates", message: error.message });
  }
});

// ============================================================================
// GET /api/leads/stats - Collection statistics
// ============================================================================

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const collection = await getCollection();
    const count = await collection.count();

    const totalRevenue = dataset.leads.reduce(
      (sum, l) => sum + (l.calculated?.financial.invoicedPrice || 0),
      0
    );

    const statusCounts = dataset.leads.reduce(
      (acc, l) => {
        acc[l.pipeline.status] = (acc[l.pipeline.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sourceCounts = dataset.leads.reduce(
      (acc, l) => {
        const source = l.gmail?.leadSource || "Unknown";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      collection: COLLECTION_NAME,
      totalLeads: count,
      totalRevenue,
      avgRevenue: Math.round(totalRevenue / count),
      statusBreakdown: statusCounts,
      sourceBreakdown: sourceCounts,
      dataQuality: {
        avgCompleteness: dataset.metadata.quality?.avgDataCompleteness || 0,
        withCalendar: dataset.leads.filter(l => l.calendar).length,
        withBilly: dataset.leads.filter(l => l.billy).length,
      },
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    res
      .status(500)
      .json({ error: "Failed to get stats", message: error.message });
  }
});

export default router;
