/**
 * Friday AI Lead Pipeline Import (v4.3.5)
 *
 * Loads the AI-enriched dataset (complete-leads-v4.3.3.json) and upserts
 * leads, customer profiles, and invoices into the Friday AI Supabase database.
 *
 * Usage:
 *   npx tsx server/scripts/import-pipeline-v4_3_5.ts [path/to/dataset.json]
 *
 * The script is idempotent – rerunning updates existing records using the
 * datasetLeadId stored in the metadata column.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as dotenv from "dotenv";
import { and, eq, sql } from "drizzle-orm";

import {
  customerInvoices,
  customerProfiles,
  leads,
  type CustomerInvoice,
  type CustomerProfile,
  type InsertCustomerProfile,
  type InsertLead,
  type Lead,
} from "../../drizzle/schema";
import type {
  V4_3_Dataset,
  V4_3_Lead,
} from "../integrations/chromadb/v4_3-types";

import {
  addCustomerInvoice,
  createOrUpdateCustomerProfile,
} from "../customer-db";
import { getDb, getUserByOpenId, upsertUser } from "../db";
import { createLead } from "../lead-db";

dotenv.config({ path: ".env.supabase" });
dotenv.config();

const DEFAULT_DATASET_PATH = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.3.json"
);

const DATASET_VERSION = "4.3.5";

interface ImportStats {
  leadsProcessed: number;
  leadsCreated: number;
  leadsUpdated: number;
  leadsSkipped: number;
  customersLinked: number;
  invoicesUpserted: number;
  errors: number;
  syntheticEmails: number;
}

type DbClient = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function main() {
  const datasetPath = process.argv[2]
    ? resolve(process.cwd(), process.argv[2]!)
    : DEFAULT_DATASET_PATH;

  console.log(`📂 Loading dataset: ${datasetPath}`);

  const dataset: V4_3_Dataset = JSON.parse(readFileSync(datasetPath, "utf-8"));
  console.log(
    `✅ Dataset loaded (version ${dataset.metadata.version} → import as ${DATASET_VERSION})`
  );
  console.log(`   Leads: ${dataset.leads.length}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed – check DATABASE_URL");
  }

  const ownerOpenId = process.env.OWNER_OPEN_ID || "";
  if (!ownerOpenId) {
    throw new Error("OWNER_OPEN_ID missing – add to environment variables");
  }

  let ownerUser = await getUserByOpenId(ownerOpenId);
  if (!ownerUser) {
    console.log("[Import] Owner user not found, creating via upsert...");
    await upsertUser({ openId: ownerOpenId });
    ownerUser = await getUserByOpenId(ownerOpenId);
  }
  if (!ownerUser) {
    throw new Error(
      "Owner user still not found after upsert. Please verify OWNER_OPEN_ID."
    );
  }

  const stats: ImportStats = {
    leadsProcessed: 0,
    leadsCreated: 0,
    leadsUpdated: 0,
    leadsSkipped: 0,
    customersLinked: 0,
    invoicesUpserted: 0,
    errors: 0,
    syntheticEmails: 0,
  };

  for (const lead of dataset.leads) {
    stats.leadsProcessed += 1;
    try {
      const result = await upsertLeadAndCustomer(db, ownerUser.id, lead);
      if (result === "skipped") {
        stats.leadsSkipped += 1;
        continue;
      }

      if (result.action === "created") {
        stats.leadsCreated += 1;
      } else {
        stats.leadsUpdated += 1;
      }

      if (result.customerLinked) {
        stats.customersLinked += 1;
      }
      stats.invoicesUpserted += result.invoicesUpserted;
      if (result.syntheticEmail) {
        stats.syntheticEmails += 1;
      }
    } catch (error) {
      stats.errors += 1;
      console.error(
        `❌ Failed to import lead ${lead.id}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("\n================= Import Summary =================");
  console.log(`Processed leads:       ${stats.leadsProcessed}`);
  console.log(`Created leads:         ${stats.leadsCreated}`);
  console.log(`Updated leads:         ${stats.leadsUpdated}`);
  console.log(`Skipped leads:         ${stats.leadsSkipped}`);
  console.log(`Customers linked:      ${stats.customersLinked}`);
  console.log(`Invoices upserted:     ${stats.invoicesUpserted}`);
  console.log(`Synthetic emails used: ${stats.syntheticEmails}`);
  console.log(`Errors:                ${stats.errors}`);
  console.log("=================================================\n");

  process.exit(stats.errors > 0 ? 1 : 0);
}

type UpsertResult =
  | "skipped"
  | {
      action: "created" | "updated";
      leadId: number;
      customerLinked: boolean;
      invoicesUpserted: number;
      syntheticEmail: boolean;
    };

async function upsertLeadAndCustomer(
  db: DbClient,
  userId: number,
  datasetLead: V4_3_Lead
): Promise<UpsertResult> {
  const customerEmail = resolveCustomerEmail(datasetLead);

  let syntheticEmail = false;
  const email = customerEmail ?? generateSyntheticEmail(datasetLead.id);
  if (!customerEmail) {
    syntheticEmail = true;
    console.warn(
      `⚠️  Lead ${datasetLead.id} missing email – using synthetic placeholder (${email}).`
    );
  }

  const name = resolveCustomerName(datasetLead);
  if (!name) {
    console.warn(`⚠️  Lead ${datasetLead.id} missing name – skipping import.`);
    return "skipped";
  }

  const phone = resolveCustomerPhone(datasetLead);

  const leadStatus = mapLeadStatus(datasetLead);
  const score = resolveLeadScore(datasetLead);
  const source = resolveLeadSource(datasetLead);
  const company = resolveCompany(datasetLead);
  const notes = buildLeadNotes(datasetLead);
  const metadata = buildLeadMetadata(datasetLead, syntheticEmail);

  const existing = await db
    .select({ id: leads.id, metadata: leads.metadata })
    .from(leads)
    .where(
      and(
        eq(leads.userId, userId),
        sql`(${leads.metadata} ->> 'datasetLeadId') = ${datasetLead.id}`
      )
    )
    .limit(1);

  let leadRecord: Lead;

  const baseLeadData: Partial<InsertLead> = {
    userId,
    name,
    email,
    phone: phone ?? undefined,
    company: company ?? undefined,
    status: leadStatus,
    source,
    notes,
    score,
    metadata,
  };

  if (existing.length === 0) {
    leadRecord = await createLead(baseLeadData as InsertLead);
    console.log(`➕ Lead created #${leadRecord.id} • ${name}`);
  } else {
    const leadId = existing[0]!.id;
    const mergedMetadata = mergeMetadata(existing[0]!.metadata, metadata);
    await db
      .update(leads)
      .set({
        ...baseLeadData,
        metadata: mergedMetadata,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(leads.id, leadId));
    const [updated] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);
    leadRecord = updated;
    console.log(`♻️  Lead updated #${leadRecord.id} • ${name}`);
  }

  const customerResult = await linkCustomerProfile(
    userId,
    leadRecord,
    datasetLead,
    email
  );
  const invoiceCount = await upsertInvoice(
    userId,
    customerResult?.customerId ?? null,
    datasetLead
  );

  return {
    action: existing.length === 0 ? "created" : "updated",
    leadId: leadRecord.id,
    customerLinked: Boolean(customerResult?.customerId),
    invoicesUpserted: invoiceCount,
    syntheticEmail,
  };
}

async function linkCustomerProfile(
  userId: number,
  lead: Lead,
  datasetLead: V4_3_Lead,
  email: string
): Promise<{ customerId: number } | null> {
  try {
    const customerData = buildCustomerProfileData(
      userId,
      lead,
      datasetLead,
      email
    );
    const customerId = await createOrUpdateCustomerProfile(customerData);
    return { customerId };
  } catch (error) {
    console.error(
      `⚠️  Failed to link customer profile for lead ${lead.id}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function upsertInvoice(
  userId: number,
  customerId: number | null,
  datasetLead: V4_3_Lead
): Promise<number> {
  if (!customerId) return 0;
  const invoice = datasetLead.billy;
  if (!invoice) return 0;

  try {
    await addCustomerInvoice({
      userId,
      customerId,
      billyInvoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNo ?? undefined,
      amount: toCurrencyString(invoice.invoicedPrice),
      paidAmount: toCurrencyString(
        invoice.isPaid
          ? invoice.invoicedPrice
          : invoice.invoicedPrice - (invoice.balance ?? 0)
      ),
      grossAmount: toCurrencyString(invoice.invoicedPrice),
      taxAmount: toCurrencyString(0),
      status: mapInvoiceStatus(invoice.state, invoice.isPaid),
      entryDate: toIsoString(invoice.entryDate),
      dueDate: toIsoString(invoice.dueDate),
      paymentTermsDays: undefined,
      paidAt: invoice.isPaid ? toIsoString(invoice.entryDate) : undefined,
    });
    return 1;
  } catch (error) {
    console.error(
      `⚠️  Failed to upsert invoice ${invoice.invoiceId}:`,
      error instanceof Error ? error.message : error
    );
    return 0;
  }
}

function resolveCustomerEmail(lead: V4_3_Lead): string | null {
  return (
    lead.customerEmail?.toLowerCase() ||
    lead.calendar?.aiParsed?.customer?.email?.toLowerCase() ||
    null
  );
}

function resolveCustomerName(lead: V4_3_Lead): string | null {
  return (
    lead.customerName ||
    lead.calendar?.aiParsed?.customer?.name ||
    extractNameFromSummary(lead.calendar?.summary) ||
    null
  );
}

function resolveCustomerPhone(lead: V4_3_Lead): string | null {
  return lead.customerPhone || lead.calendar?.aiParsed?.customer?.phone || null;
}

function resolveLeadSource(lead: V4_3_Lead): string {
  const sources = new Set<string>();
  sources.add(`pipeline_${DATASET_VERSION}`);
  if (lead.gmail?.leadSource) {
    sources.add(lead.gmail.leadSource);
  }
  if (lead.pipeline?.stage) {
    sources.add(`stage:${lead.pipeline.stage}`);
  }
  return Array.from(sources).join("|");
}

function resolveCompany(lead: V4_3_Lead): string | null {
  if (lead.billy?.description) {
    return lead.billy.description.slice(0, 255) || null;
  }
  if (lead.gmail?.leadSource) {
    return lead.gmail.leadSource.split("(")[0]?.trim() || null;
  }
  return null;
}

function mapLeadStatus(lead: V4_3_Lead): InsertLead["status"] {
  const stage = lead.pipeline?.stage ?? "inbox";

  switch (stage) {
    case "won":
    case "active":
      return "won";
    case "lost":
      return "lost";
    case "proposal":
      return "proposal";
    case "contacted":
      return "contacted";
    case "calendar":
      return "qualified";
    default:
      return "new";
  }
}

function resolveLeadScore(lead: V4_3_Lead): number {
  let score = 50;

  if (lead.customer?.isRecurring) score += 15;
  if (lead.customer?.customerType === "premium") score += 20;
  if (lead.customer?.hasComplaints) score -= 20;
  if (lead.calculated?.financial?.grossProfit > 0) score += 5;
  if (lead.calculated?.quality?.dataCompleteness >= 80) score += 5;

  return Math.max(0, Math.min(100, score));
}

function buildLeadNotes(lead: V4_3_Lead): string {
  const lines: string[] = [`Imported from AI pipeline v${DATASET_VERSION}`];

  if (lead.customer?.recurringFrequency) {
    lines.push(`Frequency: ${lead.customer.recurringFrequency}`);
  }
  if (lead.customer?.customerType) {
    lines.push(`Customer type: ${lead.customer.customerType}`);
  }
  if (lead.calendar?.aiParsed?.specialRequirements?.length) {
    lines.push(
      `Special requirements: ${lead.calendar.aiParsed.specialRequirements.join(", ")}`
    );
  }
  if (lead.calculated?.timeline?.leadReceivedDate) {
    lines.push(`Lead received: ${lead.calculated.timeline.leadReceivedDate}`);
  }

  return lines.join(" | ");
}

function buildLeadMetadata(lead: V4_3_Lead, syntheticEmail: boolean) {
  const metadata = {
    datasetVersion: DATASET_VERSION,
    datasetLeadId: lead.id,
    pipelineStage: lead.pipeline?.stage,
    pipelineStatus: lead.pipeline?.status,
    quality: lead.calculated?.quality,
    customer: {
      isRecurring: lead.customer?.isRecurring ?? false,
      recurringFrequency: lead.customer?.recurringFrequency ?? null,
      customerType: lead.customer?.customerType ?? null,
      specialRequirements: lead.calendar?.aiParsed?.specialRequirements ?? [],
      hasComplaints: lead.customer?.hasComplaints ?? false,
      hasSpecialNeeds: lead.customer?.hasSpecialNeeds ?? false,
    },
    financial: lead.calculated?.financial,
    calendarEvent: lead.calendar
      ? {
          eventId: lead.calendar.eventId,
          summary: lead.calendar.summary,
          startTime: lead.calendar.startTime,
          bookingNumber:
            lead.calendar.aiParsed?.qualitySignals?.bookingNumber ?? null,
        }
      : null,
    gmailThreadId: lead.gmail?.threadId ?? null,
    billyInvoiceId: lead.billy?.invoiceId ?? null,
    syntheticEmail,
  };

  return JSON.parse(JSON.stringify(metadata));
}

function buildCustomerProfileData(
  userId: number,
  lead: Lead,
  datasetLead: V4_3_Lead,
  email: string
) {
  const tags = new Set<string>();
  if (datasetLead.customer?.customerType) {
    tags.add(`type:${datasetLead.customer.customerType}`);
  }
  if (datasetLead.customer?.isRecurring) tags.add("recurring");
  if (datasetLead.customer?.isActive) tags.add("active");
  if (datasetLead.customer?.hasComplaints) tags.add("at_risk");
  if (datasetLead.calendar?.aiParsed?.specialRequirements) {
    for (const req of datasetLead.calendar.aiParsed.specialRequirements) {
      tags.add(`req:${req}`);
    }
  }

  const lifetimeValue = datasetLead.customer?.lifetimeValue ?? 0;
  const totalInvoiced = toCents(lifetimeValue);
  const totalPaid = toCents(lifetimeValue);
  const balance = totalInvoiced - totalPaid;

  const status = determineCustomerStatus(datasetLead);
  const customerType = determineCustomerType(datasetLead);

  const payload: InsertCustomerProfile = {
    userId,
    leadId: lead.id,
    email,
    name: lead.name ?? undefined,
    phone: lead.phone ?? undefined,
    status,
    tags: Array.from(tags),
    customerType,
    totalInvoiced,
    totalPaid,
    balance,
    invoiceCount: datasetLead.customer?.totalBookings ?? 0,
    emailCount: datasetLead.customer?.totalBookings ?? 0,
    aiResume: buildCustomerResume(datasetLead),
    lastContactDate:
      toIsoString(datasetLead.calculated?.timeline?.bookingConfirmedDate) ??
      datasetLead.calendar?.startTime ??
      undefined,
    lastSyncDate: new Date().toISOString(),
  };

  return payload;
}

function determineCustomerStatus(lead: V4_3_Lead): CustomerProfile["status"] {
  if (lead.customer?.customerType === "premium") return "vip";
  if (lead.customer?.hasComplaints) return "at_risk";
  if (lead.customer?.isActive || lead.customer?.isRecurring) return "active";
  return "new";
}

function determineCustomerType(
  lead: V4_3_Lead
): CustomerProfile["customerType"] {
  const category =
    lead.calendar?.aiParsed?.service?.category?.toLowerCase() ?? "";
  if (category.includes("erhverv")) return "erhverv";
  const source = lead.gmail?.leadSource?.toLowerCase() ?? "";
  if (source.includes("erhverv")) return "erhverv";
  return "private";
}

function buildCustomerResume(lead: V4_3_Lead): string {
  const parts: string[] = [];
  const metrics = lead.customer;
  if (metrics?.totalBookings) {
    parts.push(`${metrics.totalBookings} historiske bookinger`);
  }
  if (metrics?.recurringFrequency) {
    parts.push(`Frekvens: ${metrics.recurringFrequency}`);
  }
  if (metrics?.lifetimeValue) {
    parts.push(
      `Lifetime value: ${metrics.lifetimeValue.toLocaleString("da-DK")} kr`
    );
  }
  if (lead.customer?.hasSpecialNeeds) {
    parts.push("Har specialbehov");
  }
  if (lead.customer?.hasComplaints) {
    parts.push("Klager registreret");
  }
  return parts.length > 0 ? parts.join(" • ") : "AI pipeline import";
}

function mergeMetadata(existing: Lead["metadata"], incoming: unknown) {
  const existingClean = existing ? JSON.parse(JSON.stringify(existing)) : {};
  const incomingClean = JSON.parse(JSON.stringify(incoming));
  return { ...existingClean, ...incomingClean };
}

function toCurrencyString(
  value: number | null | undefined
): string | undefined {
  if (value === null || value === undefined || Number.isNaN(value))
    return undefined;
  return Number(value).toFixed(2);
}

function toCents(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.round(Number(value) * 100);
}

function toIsoString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function mapInvoiceStatus(
  state: string,
  isPaid: boolean
): CustomerInvoice["status"] {
  if (isPaid) return "paid";
  switch (state) {
    case "approved":
      return "approved";
    case "sent":
      return "sent";
    case "overdue":
      return "overdue";
    case "voided":
      return "voided";
    default:
      return "draft";
  }
}

function extractNameFromSummary(
  summary: string | null | undefined
): string | null {
  if (!summary) return null;
  const match = summary.match(/[-–]\s*(.+)$/);
  return match ? (match[1]?.trim() ?? null) : summary.trim();
}

function generateSyntheticEmail(datasetLeadId: string): string {
  return `lead-${datasetLeadId.toLowerCase()}@pipeline.local`;
}

void main().catch(error => {
  console.error("❌ Import failed:", error);
  process.exit(1);
});
