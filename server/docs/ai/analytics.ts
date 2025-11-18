/**
 * AI Documentation Analytics & Metrics
 *
 * Track and analyze AI doc generation:
 * - Success/failure rates
 * - Generation times
 * - Cost tracking (even though FREE)
 * - Popular leads
 * - Usage patterns
 */

import { and, eq, gte, sql, desc } from "drizzle-orm";

import { documents } from "../../../drizzle/schema";
import { logger } from "../../_core/logger";
import { getDb } from "../../db";

export interface AIDocMetrics {
  totalGenerated: number;
  successRate: number;
  averageGenerationTime: number;
  totalCost: number;
  generatedToday: number;
  generatedThisWeek: number;
  generatedThisMonth: number;
  topLeads: Array<{
    leadId: number;
    leadName: string;
    docCount: number;
  }>;
  recentGenerations: Array<{
    docId: string;
    title: string;
    createdAt: Date;
    tags: string[];
  }>;
}

/**
 * Get comprehensive AI doc metrics
 */
export async function getAIDocMetrics(): Promise<AIDocMetrics> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        totalGenerated: 0,
        successRate: 0,
        averageGenerationTime: 0,
        totalCost: 0,
        generatedToday: 0,
        generatedThisWeek: 0,
        generatedThisMonth: 0,
        topLeads: [],
        recentGenerations: [],
      };
    }

    // Get all AI-generated docs
    const aiDocs = await db
      .select()
      .from(documents)
      .where(
        sql`${documents.tags} ? 'ai-generated'`
      )
      .orderBy(desc(documents.createdAt));

    const totalGenerated = aiDocs.length;

    // Calculate time-based metrics
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const generatedToday = aiDocs.filter(
      (doc: any) => new Date(doc.createdAt) >= todayStart
    ).length;

    const generatedThisWeek = aiDocs.filter(
      (doc: any) => new Date(doc.createdAt) >= weekStart
    ).length;

    const generatedThisMonth = aiDocs.filter(
      (doc: any) => new Date(doc.createdAt) >= monthStart
    ).length;

    // Success rate (assuming all retrieved docs are successful)
    const successRate = totalGenerated > 0 ? 100 : 0;

    // Average generation time (estimate ~25 seconds)
    const averageGenerationTime = 25000;

    // Total cost (FREE!)
    const totalCost = 0.0;

    // Top leads (extract from doc metadata)
    const leadCounts = new Map<string, { name: string; count: number }>();

    aiDocs.forEach((doc: any) => {
      // Try to extract lead info from title or content
      const titleMatch = doc.title?.match(/Lead:\s*(.+?)(?:\s*-|$)/);
      if (titleMatch) {
        const leadName = titleMatch[1].trim();
        const current = leadCounts.get(leadName) || {
          name: leadName,
          count: 0,
        };
        leadCounts.set(leadName, { ...current, count: current.count + 1 });
      }
    });

    const topLeads = Array.from(leadCounts.entries())
      .map(([name, data]) => ({
        leadId: 0, // We don't store leadId in title, would need separate tracking
        leadName: name,
        docCount: data.count,
      }))
      .sort((a, b) => b.docCount - a.docCount)
      .slice(0, 5);

    // Recent generations
    const recentGenerations = aiDocs.slice(0, 10).map((doc: any) => ({
      docId: doc.id,
      title: doc.title || "Untitled",
      createdAt: new Date(doc.createdAt),
      tags: doc.tags || [],
    }));

    logger.info(
      { totalGenerated, generatedToday },
      "[AI Analytics] Metrics retrieved"
    );

    return {
      totalGenerated,
      successRate,
      averageGenerationTime,
      totalCost,
      generatedToday,
      generatedThisWeek,
      generatedThisMonth,
      topLeads,
      recentGenerations,
    };
  } catch (error: any) {
    logger.error({ error }, "[AI Analytics] Failed to get metrics");

    // Return empty metrics on error
    return {
      totalGenerated: 0,
      successRate: 0,
      averageGenerationTime: 0,
      totalCost: 0,
      generatedToday: 0,
      generatedThisWeek: 0,
      generatedThisMonth: 0,
      topLeads: [],
      recentGenerations: [],
    };
  }
}

/**
 * Log AI doc generation event for analytics
 */
export async function logAIGeneration(data: {
  docId: string;
  leadId?: number;
  generationType: "lead" | "weekly" | "bulk";
  success: boolean;
  duration: number;
  error?: string;
  retries?: number;
}) {
  try {
    logger.info(
      {
        docId: data.docId,
        leadId: data.leadId,
        type: data.generationType,
        success: data.success,
        duration: data.duration,
        retries: data.retries,
      },
      "[AI Analytics] Generation logged"
    );

    // In production, you might want to store this in a separate analytics table
    // For now, just logging it

    // Could also send to external analytics service like Mixpanel, Segment, etc.
  } catch (error: any) {
    logger.error({ error }, "[AI Analytics] Failed to log generation");
  }
}

/**
 * Get AI doc generation statistics for a specific time period
 */
export async function getGenerationStats(period: "day" | "week" | "month") {
  try {
    const db = await getDb();
    if (!db) {
      logger.warn("[AI Analytics] Database not available");
      return { period, count: 0, docs: [] };
    }
    const now = new Date();

    let startDate: Date;
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const docs = await db
      .select({
        id: documents.id,
        title: documents.title,
        createdAt: documents.createdAt,
        tags: documents.tags,
      })
      .from(documents)
      .where(
        and(
          sql`${documents.tags} ? 'ai-generated'`,
          gte(documents.createdAt, startDate.toISOString())
        )
      );

    return {
      period,
      count: docs.length,
      docs: docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        createdAt: new Date(doc.createdAt),
      })),
    };
  } catch (error: any) {
    logger.error({ error, period }, "[AI Analytics] Failed to get stats");
    return {
      period,
      count: 0,
      docs: [],
    };
  }
}

/**
 * Calculate estimated time and cost savings
 */
export function calculateSavings(totalDocs: number) {
  // Assumptions:
  // - Manual doc creation: 30 minutes per doc
  // - AI doc creation: 30 seconds
  // - Time saved per doc: 29.5 minutes
  // - Cost of manual work: 500 DKK/hour (consultant rate)

  const timePerDocManual = 30; // minutes
  const timePerDocAI = 0.5; // minutes
  const timeSavedPerDoc = timePerDocManual - timePerDocAI;
  const totalTimeSaved = timeSavedPerDoc * totalDocs; // minutes
  const hoursSaved = totalTimeSaved / 60;

  const hourlyRate = 500; // DKK
  const costSaved = hoursSaved * hourlyRate;

  return {
    totalDocs,
    timeSavedMinutes: totalTimeSaved,
    timeSavedHours: hoursSaved,
    costSavedDKK: costSaved,
    costOfAI: 0, // FREE!
    netSavings: costSaved,
  };
}
