#!/usr/bin/env node
/**
 * Test AI Documentation Generator
 *
 * Tests the full pipeline:
 * 1. Data collection
 * 2. AI analysis
 * 3. Markdown generation
 * 4. Database insertion
 *
 * NOTE: Run with tsx: pnpm tsx scripts/test-ai-docs.mjs
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "..", ".env") });

console.log("\n🧪 Testing AI Documentation Generator\n");
console.log("=".repeat(60));

// Dynamic imports - Note: These need to be transpiled TypeScript
let getDb,
  collectLeadData,
  analyzeLeadData,
  generateLeadDocument,
  autoCreateLeadDoc,
  leads;

try {
  // Try importing from built files
  const dbModule = await import("../server/db.js");
  const collectorModule = await import("../server/docs/ai/data-collector.js");
  const analyzerModule = await import("../server/docs/ai/analyzer.js");
  const generatorModule = await import("../server/docs/ai/generator.js");
  const autoCreateModule = await import("../server/docs/ai/auto-create.js");
  const schemaModule = await import("../drizzle/schema.js");

  getDb = dbModule.getDb;
  collectLeadData = collectorModule.collectLeadData;
  analyzeLeadData = analyzerModule.analyzeLeadData;
  generateLeadDocument = generatorModule.generateLeadDocument;
  autoCreateLeadDoc = autoCreateModule.autoCreateLeadDoc;
  leads = schemaModule.leads;
} catch (error) {
  console.error("⚠️  Cannot load TypeScript modules directly.");
  console.error("   Please run: pnpm tsx scripts/test-ai-docs.mjs");
  console.error("   Or build first: pnpm build\n");
  process.exit(1);
}

async function testDataCollection() {
  console.log("\n📊 Step 1: Testing Data Collection\n");

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get first lead for testing
    const testLeads = await db.select().from(leads).limit(1);

    if (testLeads.length === 0) {
      console.log("⚠️  No leads found in database");
      console.log("   Create a lead first to test the system");
      return null;
    }

    const testLead = testLeads[0];
    console.log(`✓ Found test lead: ${testLead.name} (${testLead.email})`);
    console.log(`  ID: ${testLead.id}`);
    console.log(`  Company: ${testLead.company || "N/A"}`);
    console.log(`  Status: ${testLead.status}`);

    console.log("\n  Collecting data...");
    const data = await collectLeadData(testLead.id);

    if (!data) {
      throw new Error("Failed to collect data");
    }

    console.log(`  ✓ Email threads found: ${data.emailThreads.length}`);
    console.log(`  ✓ Calendar events: ${data.calendarEvents.length}`);
    console.log(`  ✓ Chat messages: ${data.chatMessages.length}`);

    return { testLead, data };
  } catch (error) {
    console.error("  ✗ Data collection failed:", error.message);
    throw error;
  }
}

async function testAIAnalysis(data) {
  console.log("\n🤖 Step 2: Testing AI Analysis\n");

  try {
    console.log("  Sending to OpenRouter GLM-4.5-Air (FREE)...");
    const analysis = await analyzeLeadData(data);

    console.log(`  ✓ Summary: ${analysis.summary.slice(0, 80)}...`);
    console.log(`  ✓ Sentiment: ${analysis.sentiment}`);
    console.log(`  ✓ Priority: ${analysis.priority}`);
    console.log(`  ✓ Key topics: ${analysis.keyTopics.length}`);
    console.log(`  ✓ Action items: ${analysis.actionItems.length}`);
    console.log(`  ✓ Risks identified: ${analysis.risks.length}`);

    if (analysis.keyTopics.length > 0) {
      console.log("\n  Topics discussed:");
      analysis.keyTopics.slice(0, 3).forEach(topic => {
        console.log(`    - ${topic}`);
      });
    }

    if (analysis.actionItems.length > 0) {
      console.log("\n  Action items:");
      analysis.actionItems.slice(0, 3).forEach(item => {
        console.log(`    - ${item}`);
      });
    }

    return analysis;
  } catch (error) {
    console.error("  ✗ AI analysis failed:", error.message);
    throw error;
  }
}

async function testMarkdownGeneration(data, analysis) {
  console.log("\n📝 Step 3: Testing Markdown Generation\n");

  try {
    const markdown = generateLeadDocument(data, analysis);

    const lines = markdown.split("\n").length;
    const wordCount = markdown.split(/\s+/).length;
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(markdown);

    console.log(`  ✓ Generated ${lines} lines`);
    console.log(`  ✓ Word count: ${wordCount}`);
    console.log(`  ✓ Contains emojis: ${hasEmojis ? "Yes" : "No"}`);

    // Show preview
    const preview = markdown.split("\n").slice(0, 15).join("\n");
    console.log("\n  Preview:");
    console.log("  " + "-".repeat(58));
    preview.split("\n").forEach(line => {
      console.log(`  ${line}`);
    });
    console.log("  " + "-".repeat(58));
    console.log(`  ... (${lines - 15} more lines)`);

    return markdown;
  } catch (error) {
    console.error("  ✗ Markdown generation failed:", error.message);
    throw error;
  }
}

async function testDatabaseInsertion(testLead) {
  console.log("\n💾 Step 4: Testing Database Insertion\n");

  try {
    console.log(
      "  Running full pipeline (collect → analyze → generate → save)..."
    );
    const result = await autoCreateLeadDoc(testLead.id);

    if (!result.success) {
      throw new Error(result.error || "Unknown error");
    }

    console.log(`  ✓ Document created successfully!`);
    console.log(`  ✓ Document ID: ${result.docId}`);
    console.log(`  ✓ View at: /docs?id=${result.docId}`);

    return result;
  } catch (error) {
    console.error("  ✗ Database insertion failed:", error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log("\n🚀 Starting AI Documentation Generator Tests\n");

    // Step 1: Data Collection
    const collectionResult = await testDataCollection();
    if (!collectionResult) {
      console.log("\n⚠️  Cannot continue without test data");
      process.exit(1);
    }

    const { testLead, data } = collectionResult;

    // Step 2: AI Analysis
    const analysis = await testAIAnalysis(data);

    // Step 3: Markdown Generation
    const markdown = await testMarkdownGeneration(data, analysis);

    // Step 4: Database Insertion
    const result = await testDatabaseInsertion(testLead);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED!\n");
    console.log("📊 Summary:");
    console.log(`   Lead: ${testLead.name}`);
    console.log(`   Emails analyzed: ${data.emailThreads.length}`);
    console.log(`   Sentiment: ${analysis.sentiment}`);
    console.log(`   Priority: ${analysis.priority}`);
    console.log(`   Document ID: ${result.docId}`);
    console.log(`   Markdown size: ${markdown.length} chars`);
    console.log("\n💰 Cost: $0.00 (FREE!)");
    console.log("\n🎉 AI Documentation Generator is working perfectly!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED\n");
    console.error("Error:", error.message);
    console.error("\nStack trace:", error.stack);
    console.log("\n" + "=".repeat(60) + "\n");
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
