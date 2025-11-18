/**
 * V4.3.3 Script 4: Upload to ChromaDB
 *
 * Uploads complete leads to ChromaDB for semantic search capabilities.
 *
 * Features:
 * - Semantic lead search
 * - Customer similarity matching
 * - Smart recommendations
 * - Duplicate detection
 * - Lead classification
 *
 * Input: complete-leads-v4.3.3.json
 * Output: ChromaDB collection "leads_v4_3"
 *
 * Run: npx tsx server/integrations/chromadb/scripts/4-upload-to-chromadb.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

import { ChromaClient, Collection } from "chromadb";

import { V4_3_Dataset, V4_3_Lead } from "../v4_3-types";

console.log("🔌 V4.3.3 Script 4: Upload to ChromaDB\n");
console.log("=".repeat(70));

// ============================================================================
// INITIALIZE CHROMADB CLIENT
// ============================================================================

const CHROMA_HOST = process.env.CHROMA_HOST || "localhost";
const CHROMA_PORT = process.env.CHROMA_PORT || "8000";
const COLLECTION_NAME = "leads_v4_3_3";

console.log(
  `🔌 Connecting to ChromaDB at http://${CHROMA_HOST}:${CHROMA_PORT}...`
);

const client = new ChromaClient({
  path: `http://${CHROMA_HOST}:${CHROMA_PORT}`,
});

// ============================================================================
// LOAD DATA
// ============================================================================

const dataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.3.3.json"
);

console.log(`📂 Loading: ${dataPath}\n`);

const dataset: V4_3_Dataset = JSON.parse(readFileSync(dataPath, "utf-8"));
const leads = dataset.leads;

console.log(`Loaded ${leads.length} leads\n`);

// ============================================================================
// PREPARE DATA FOR CHROMADB
// ============================================================================

console.log("📝 Preparing embeddings...\n");

interface ChromaDocument {
  id: string;
  document: string;
  metadata: Record<string, any>;
}

function leadToDocument(lead: V4_3_Lead): ChromaDocument {
  // Create rich text representation for embedding
  const parts: string[] = [];

  // Customer info
  parts.push(`Customer: ${lead.customerName || "Unknown"}`);
  if (lead.customerEmail) parts.push(`Email: ${lead.customerEmail}`);
  if (lead.customerPhone) parts.push(`Phone: ${lead.customerPhone}`);

  // Lead source and status
  if (lead.gmail?.leadSource) parts.push(`Source: ${lead.gmail.leadSource}`);
  parts.push(`Status: ${lead.pipeline.status}`);
  parts.push(`Stage: ${lead.pipeline.stage}`);

  // Property details
  if (lead.calculated?.property.propertySize) {
    parts.push(`Property: ${lead.calculated.property.propertySize}m²`);
  }
  if (lead.calculated?.property.serviceType) {
    parts.push(`Service: ${lead.calculated.property.serviceType}`);
  }

  // Gmail info
  if (lead.gmail) {
    parts.push(`Subject: ${lead.gmail.subject}`);
    parts.push(`From: ${lead.gmail.from}`);
  }

  // Calendar info
  if (lead.calendar) {
    parts.push(`Booking: ${lead.calendar.summary}`);
    parts.push(`Duration: ${lead.calendar.duration} minutes`);
  }

  // Financial info
  if (lead.calculated?.financial) {
    const fin = lead.calculated.financial;
    if (fin.invoicedPrice > 0) {
      parts.push(`Revenue: ${fin.invoicedPrice} kr`);
      parts.push(`Profit: ${fin.netProfit} kr`);
      parts.push(`Margin: ${fin.netMargin.toFixed(1)}%`);
    }
  }

  // Customer value
  if (lead.customer) {
    parts.push(`Lifetime Value: ${lead.customer.lifetimeValue} kr`);
    parts.push(`Total Bookings: ${lead.customer.totalBookings}`);
  }

  const document = parts.join(" | ");

  // Metadata for filtering
  const metadata: Record<string, any> = {
    leadId: lead.id,
    customerName: lead.customerName || "",
    customerEmail: lead.customerEmail || "",
    leadSource: lead.gmail?.leadSource || "Unknown",
    status: lead.pipeline.status,
    stage: lead.pipeline.stage,
    hasCalendar: !!lead.calendar,
    hasBilly: !!lead.billy,
    dataCompleteness: lead.calculated?.quality.dataCompleteness || 0,
    revenue: lead.calculated?.financial.invoicedPrice || 0,
    profit: lead.calculated?.financial.netProfit || 0,
    margin: lead.calculated?.financial.netMargin || 0,
    serviceType: lead.calculated?.property.serviceType || "",
    propertySize: lead.calculated?.property.propertySize || 0,
    date: lead.gmail?.date || new Date().toISOString(),
  };

  return {
    id: lead.id,
    document,
    metadata,
  };
}

const documents: ChromaDocument[] = leads.map(leadToDocument);

console.log(`✅ Prepared ${documents.length} documents\n`);

// ============================================================================
// UPLOAD TO CHROMADB
// ============================================================================

async function uploadToChromaDB() {
  try {
    // Delete existing collection if exists
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`🗑️  Deleted existing collection: ${COLLECTION_NAME}`);
    } catch (e) {
      // Collection doesn't exist, that's fine
    }

    // Create new collection (will use server-side default embeddings)
    console.log(`📦 Creating collection: ${COLLECTION_NAME}...`);
    const collection = await client.createCollection({
      name: COLLECTION_NAME,
      metadata: {
        description: "V4.3.3 Leads with optimized matching",
        version: "4.3.3",
        created: new Date().toISOString(),
        totalLeads: leads.length,
      },
    });

    console.log(`✅ Collection created\n`);

    // Upload documents in batches
    const BATCH_SIZE = 50;
    const batches = Math.ceil(documents.length / BATCH_SIZE);

    console.log(
      `📤 Uploading ${documents.length} documents in ${batches} batches...\n`
    );

    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min((i + 1) * BATCH_SIZE, documents.length);
      const batch = documents.slice(start, end);

      await collection.add({
        ids: batch.map(d => d.id),
        documents: batch.map(d => d.document),
        metadatas: batch.map(d => d.metadata),
      });

      console.log(
        `   Uploaded batch ${i + 1}/${batches} (${batch.length} documents)`
      );
    }

    console.log("\n✅ Upload complete!\n");

    // Verify upload
    const count = await collection.count();
    console.log(`📊 Collection contains ${count} documents`);

    // Test query
    console.log("\n🔍 Testing semantic search...\n");
    const testResults = await collection.query({
      queryTexts: ["flytterengøring villa"],
      nResults: 3,
    });

    console.log(
      `Found ${testResults.ids[0].length} relevant leads for "flytterengøring villa":`
    );
    testResults.ids[0].forEach((id, idx) => {
      const meta = testResults.metadatas![0][idx];
      console.log(
        `   ${idx + 1}. ${meta?.customerName} - ${meta?.serviceType} (${meta?.revenue} kr)`
      );
    });

    console.log("\n" + "=".repeat(70));
    console.log("✅ CHROMADB UPLOAD COMPLETE");
    console.log("=".repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Collection: ${COLLECTION_NAME}`);
    console.log(`   Documents: ${count}`);
    console.log(`   URL: http://${CHROMA_HOST}:${CHROMA_PORT}`);
    console.log("\n💡 Next: Use semantic search to find similar leads!");
    console.log("");
  } catch (error) {
    console.error("\n❌ Upload failed:", error);
    process.exit(1);
  }
}

uploadToChromaDB();
