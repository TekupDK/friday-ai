import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import {
  calendarEvents,
  leads,
  type CalendarEvent,
  type InsertLead,
  type Lead,
} from "../../../drizzle/schema";

import { ENV } from "../../_core/env";
import { getDb } from "../../db";

// ============= Lead Functions (extracted) =============

export async function createLead(data: InsertLead): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Debug: Log ChromaDB status
  console.log(`[ChromaDB DEBUG] chromaEnabled: ${ENV.chromaEnabled}`);
  console.log(`[ChromaDB DEBUG] chromaUrl: ${ENV.chromaUrl}`);
  console.log(
    `[ChromaDB DEBUG] process.env.CHROMA_ENABLED: ${process.env.CHROMA_ENABLED}`
  );

  // Check for duplicate leads using ChromaDB semantic search
  if (ENV.chromaEnabled) {
    console.log("[ChromaDB] Starting duplicate detection...");
    try {
      const { searchSimilar, formatLeadForEmbedding } = await import(
        "../../integrations/chromadb"
      );

      const leadText = formatLeadForEmbedding({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
      });

      const similar = await searchSimilar("friday_leads", leadText, 3);

      // If very similar lead found (likely duplicate)
      if (similar && similar.distances.length > 0) {
        const similarity = 1 - similar.distances[0] / 2; // Convert distance to similarity (0-1)

        if (similarity > 0.85) {
          // Very likely duplicate - return existing lead
          const existingLeadId = similar.metadatas[0]?.leadId;
          if (existingLeadId) {
            console.log(
              `[ChromaDB] Duplicate lead detected (similarity: ${similarity.toFixed(
                3
              )}), returning existing lead #${existingLeadId}`
            );
            const existing = await db
              .select()
              .from(leads)
              .where(eq(leads.id, Number(existingLeadId)))
              .limit(1);
            if (existing.length > 0) {
              return existing[0];
            }
          }
        } else if (similarity > 0.7) {
          console.log(
            `[ChromaDB] Similar lead found (similarity: ${similarity.toFixed(
              3
            )}), creating new lead anyway`
          );
        }
      }
    } catch (error) {
      console.error("[ChromaDB] Failed to check for duplicates:", error);
      // Continue with creation if ChromaDB fails
    }
  }

  // Insert new lead
  const result = await db.insert(leads).values(data).returning();
  const newLead = result[0];

  // Add to ChromaDB for future duplicate detection
  if (ENV.chromaEnabled && newLead) {
    try {
      const { addDocuments, formatLeadForEmbedding } = await import(
        "../../integrations/chromadb"
      );

      const leadText = formatLeadForEmbedding({
        name: newLead.name || "",
        email: newLead.email || "",
        phone: newLead.phone || "",
        company: newLead.company || "",
      });

      await addDocuments("friday_leads", [
        {
          id: `lead-${newLead.id}`,
          text: leadText,
          metadata: {
            leadId: newLead.id,
            userId: newLead.userId,
            name: newLead.name || "",
            email: newLead.email || "",
            company: newLead.company || "",
            status: newLead.status,
            createdAt: newLead.createdAt,
          },
        },
      ]);

      console.log(`[ChromaDB] Indexed new lead #${newLead.id}`);
    } catch (error) {
      console.error("[ChromaDB] Failed to index lead:", error);
      // Don't fail the entire operation if indexing fails
    }
  }

  return newLead;
}

export async function getUserLeads(
  userId: number,
  options?: {
    status?: string;
    source?: string;
    searchQuery?: string;
    hideBillyImport?: boolean;
    sortBy?: "date" | "score" | "name";
    limit?: number;
  }
): Promise<Array<Lead & { duplicateCount: number }>> {
  const db = await getDb();
  if (!db) return [];

  // Build where conditions
  const conditions = [eq(leads.userId, userId)];

  if (options?.status && options.status !== "all") {
    conditions.push(eq(leads.status, options.status as any));
  }

  if (options?.source && options.source !== "all") {
    conditions.push(eq(leads.source, options.source));
  }

  if (options?.hideBillyImport) {
    conditions.push(sql`${leads.source} != 'billy_import'`);
  }

  // Get all leads first (we need all to calculate duplicates)
  let allLeads = await db
    .select()
    .from(leads)
    .where(
      conditions.length > 0 ? and(...conditions) : eq(leads.userId, userId)
    )
    .execute();

  // Apply search filter (client-side for now, can be optimized with SQL LIKE later)
  if (options?.searchQuery) {
    const searchLower = options.searchQuery.toLowerCase();
    allLeads = allLeads.filter(
      lead =>
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower)
    );
  }

  // Calculate duplicate counts using SQL (more efficient)
  // For now, do it in memory (can be optimized with SQL GROUP BY later)
  const keyMap = new Map<string, number[]>();
  const duplicateMap = new Map<number, number>();

  // Helper to normalize phone
  const normalizePhone = (phone: string | null | undefined): string | null => {
    if (!phone) return null;
    return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "") || null;
  };

  // Helper to get deduplication key
  const getDeduplicationKey = (lead: Lead): string | null => {
    const emailKey = lead.email?.toLowerCase().trim();
    if (emailKey) return `email:${emailKey}`;

    const phoneKey = normalizePhone(lead.phone);
    if (phoneKey) return `phone:${phoneKey}`;

    const nameCompanyKey =
      lead.name && lead.company
        ? `name:${lead.name.toLowerCase().trim()}_${lead.company
            .toLowerCase()
            .trim()}`
        : null;
    if (nameCompanyKey) return nameCompanyKey;

    return null;
  };

  // Build key map
  for (const lead of allLeads) {
    const key = getDeduplicationKey(lead);
    if (key) {
      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key)!.push(lead.id);
    }
  }

  // Calculate duplicate counts
  keyMap.forEach(leadIds => {
    const count = leadIds.length;
    if (count > 1) {
      leadIds.forEach(id => duplicateMap.set(id, count));
    }
  });

  // Add duplicateCount to all leads
  const leadsWithCounts = allLeads.map(lead => ({
    ...lead,
    duplicateCount: duplicateMap.get(lead.id) || 1,
  }));

  // Apply sorting
  if (options?.sortBy === "score") {
    leadsWithCounts.sort((a, b) => b.score - a.score);
  } else if (options?.sortBy === "name") {
    leadsWithCounts.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });
  } else {
    // Default: sort by date
    leadsWithCounts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  // Apply limit if specified
  if (options?.limit) {
    return leadsWithCounts.slice(0, options.limit);
  }

  return leadsWithCounts;
}

/**
 * Check if user has any leads (used to determine if import is needed)
 */
export async function hasUserLeads(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId))
    .limit(1);

  return result.length > 0;
}

export async function updateLeadStatus(
  id: number,
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(leads).set({ status }).where(eq(leads.id, id));
}

export async function updateLeadScore(
  id: number,
  score: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(leads).set({ score }).where(eq(leads.id, id));
}

export async function getLeadCalendarEvents(
  leadId: number
): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];

  // First get the lead
  const lead = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (!lead.length || !lead[0].name || !lead[0].email) return [];

  const leadName = lead[0].name.toLowerCase();
  const leadEmail = lead[0].email.toLowerCase();

  // Get all calendar events for the user
  const allEvents = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.userId, lead[0].userId))
    .orderBy(desc(calendarEvents.startTime));

  // Match events by name or email in title/description
  return allEvents.filter(event => {
    const title = (event.title || "").toLowerCase();
    const description = (event.description || "").toLowerCase();

    // Check if lead name or email appears in event title/description
    return (
      title.includes(leadName) ||
      description.includes(leadName) ||
      title.includes(leadEmail) ||
      description.includes(leadEmail)
    );
  });
}
