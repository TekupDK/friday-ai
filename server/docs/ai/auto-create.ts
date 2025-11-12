/**
 * AI Docs Generator - Auto Create
 *
 * Orchestrates the entire flow:
 * 1. Collect data
 * 2. Analyze with AI
 * 3. Generate markdown
 * 4. Create doc in database
 */

import { nanoid } from "nanoid";
import { getDb } from "../../db";
import { documents, documentChanges, leads } from "../../../drizzle/schema";
import { collectLeadData, collectWeeklyData } from "./data-collector";
import { analyzeLeadData, analyzeWeeklyData } from "./analyzer";
import {
  generateLeadDocument,
  generateWeeklyDigest as generateWeeklyDigestMarkdown,
} from "./generator";
import { logger } from "../../_core/logger";
import { eq } from "drizzle-orm";

/**
 * Auto-generate and create lead documentation
 * With retry logic for AI failures
 */
export async function autoCreateLeadDoc(
  leadId: number,
  retryCount: number = 0
): Promise<{
  success: boolean;
  docId?: string;
  error?: string;
  retries?: number;
}> {
  const MAX_RETRIES = 2;

  try {
    logger.info(
      { leadId, retryCount },
      "[AI Auto-Create] Starting lead doc generation"
    );

    // Step 1: Collect data
    const data = await collectLeadData(leadId);
    if (!data) {
      return { success: false, error: "Lead not found" };
    }

    // Step 2: Analyze with AI
    const analysis = await analyzeLeadData(data);

    // Step 3: Generate markdown
    const markdown = generateLeadDocument(data, analysis);

    // Step 4: Create doc in database
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const docId = nanoid();
    const title = `Lead: ${data.lead.company || data.lead.name}`;
    const path = `leads/${slugify(data.lead.company || data.lead.name)}.md`;

    await db.insert(documents).values({
      id: docId,
      path,
      title,
      content: markdown,
      category: "Leads & Sales",
      tags: ["lead", "ai-generated", "auto-analysis", analysis.priority],
      author: "ai-system",
      version: 1,
    });

    // Log creation
    await db.insert(documentChanges).values({
      id: nanoid(),
      documentId: docId,
      userId: "ai-system",
      operation: "create",
      diff: `AI-generated lead documentation from ${data.emailThreads.length} emails, ${data.calendarEvents.length} meetings`,
    });

    logger.info(
      { leadId, docId, emailCount: data.emailThreads.length },
      "[AI Auto-Create] Lead doc created successfully"
    );

    return { success: true, docId, retries: retryCount };
  } catch (error: any) {
    logger.error(
      { error, leadId, retryCount },
      "[AI Auto-Create] Failed to create lead doc"
    );

    // Retry on AI failures
    if (
      retryCount < MAX_RETRIES &&
      (error.message?.includes("AI") ||
        error.message?.includes("OpenRouter") ||
        error.message?.includes("timeout"))
    ) {
      logger.info(
        { leadId, retryCount },
        "[AI Auto-Create] Retrying after error..."
      );
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return autoCreateLeadDoc(leadId, retryCount + 1);
    }

    return { success: false, error: error.message, retries: retryCount };
  }
}

/**
 * Update existing lead documentation
 */
export async function updateLeadDoc(
  leadId: number,
  docId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    logger.info({ leadId, docId }, "[AI Auto-Create] Updating lead doc");

    // Regenerate content
    const data = await collectLeadData(leadId);
    if (!data) {
      return { success: false, error: "Lead not found" };
    }

    const analysis = await analyzeLeadData(data);
    const markdown = generateLeadDocument(data, analysis);

    // Update in database
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existingDocResults = await db
      .select()
      .from(documents)
      .where(eq(documents.id, docId))
      .limit(1);

    const existingDoc = existingDocResults[0];

    if (!existingDoc) {
      return { success: false, error: "Document not found" };
    }

    await db
      .update(documents)
      .set({
        content: markdown,
        version: existingDoc.version + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, docId));

    // Log update
    await db.insert(documentChanges).values({
      id: nanoid(),
      documentId: docId,
      userId: "ai-system",
      operation: "update",
      diff: `AI-regenerated with latest data (${data.emailThreads.length} emails, ${data.calendarEvents.length} meetings)`,
    });

    logger.info(
      { leadId, docId },
      "[AI Auto-Create] Lead doc updated successfully"
    );

    return { success: true };
  } catch (error: any) {
    logger.error(
      { error, leadId, docId },
      "[AI Auto-Create] Failed to update lead doc"
    );
    return { success: false, error: error.message };
  }
}

/**
 * Auto-generate weekly digest
 */
export async function generateWeeklyDigest(): Promise<{
  success: boolean;
  docId?: string;
  error?: string;
}> {
  try {
    logger.info("[AI Auto-Create] Starting weekly digest generation");

    // Step 1: Collect weekly data
    const data = await collectWeeklyData();

    // Step 2: Analyze
    const analysis = await analyzeWeeklyData(data);

    // Step 3: Generate markdown
    const markdown = generateWeeklyDigestMarkdown(data, analysis);

    // Step 4: Create doc
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const docId = nanoid();
    const weekNumber = getWeekNumber(new Date());
    const year = new Date().getFullYear();
    const title = `Weekly Digest: Week ${weekNumber}, ${year}`;
    const path = `digests/week-${weekNumber}-${year}.md`;

    await db.insert(documents).values({
      id: docId,
      path,
      title,
      content: markdown,
      category: "Planning & Roadmap",
      tags: ["weekly-digest", "ai-generated", "summary", `week-${weekNumber}`],
      author: "ai-system",
      version: 1,
    });

    await db.insert(documentChanges).values({
      id: nanoid(),
      documentId: docId,
      userId: "ai-system",
      operation: "create",
      diff: `AI-generated weekly digest: ${data.leads.length} leads, ${data.emailThreads.length} emails, ${data.calendarEvents.length} meetings`,
    });

    logger.info(
      { docId, weekNumber, year },
      "[AI Auto-Create] Weekly digest created successfully"
    );

    return { success: true, docId };
  } catch (error: any) {
    logger.error({ error }, "[AI Auto-Create] Failed to create weekly digest");
    return { success: false, error: error.message };
  }
}

/**
 * Bulk generate docs for all leads
 */
export async function bulkGenerateLeadDocs(): Promise<{
  success: boolean;
  total: number;
  generated: number;
  failed: number;
  docIds: string[];
}> {
  try {
    logger.info("[AI Auto-Create] Starting bulk lead doc generation");

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all leads
    const allLeads = await db.select().from(leads).limit(100);

    const results = {
      success: true,
      total: allLeads.length,
      generated: 0,
      failed: 0,
      docIds: [] as string[],
    };

    for (const lead of allLeads) {
      const result = await autoCreateLeadDoc(lead.id);

      if (result.success && result.docId) {
        results.generated++;
        results.docIds.push(result.docId);
      } else {
        results.failed++;
      }

      // Rate limit: wait 1 second between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(results, "[AI Auto-Create] Bulk generation complete");

    return results;
  } catch (error: any) {
    logger.error({ error }, "[AI Auto-Create] Bulk generation failed");
    return {
      success: false,
      total: 0,
      generated: 0,
      failed: 0,
      docIds: [],
    };
  }
}

/**
 * Helper: Slugify string
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Helper: Get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
