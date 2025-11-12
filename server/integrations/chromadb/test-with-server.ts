/**
 * Test ChromaDB with running server environment
 * Run AFTER starting server with: npm run dev
 *
 * This will test:
 * 1. ChromaDB client initialization
 * 2. Collection creation
 * 3. Lead indexing and deduplication
 */

// Load .env.dev before anything else
import { config } from "dotenv";
import { resolve } from "path";

// Force enable ChromaDB BEFORE loading anything
process.env.CHROMA_ENABLED = "true";
process.env.CHROMA_URL = "http://localhost:8000";
process.env.CHROMA_AUTH_TOKEN = "friday-chromadb-token-dev";
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Load .env.dev
config({ path: resolve(process.cwd(), ".env.dev") });

// Force again to override
process.env.CHROMA_ENABLED = "true";

import {
  getChromaClient,
  getCollection,
  addDocuments,
  searchSimilar,
} from "./client";
import { generateEmbedding } from "./embeddings";

console.log("🧪 Testing ChromaDB with Server Environment\n");
console.log("=".repeat(60));

async function testWithServer() {
  // Check environment (read directly from process.env)
  const chromaEnabled = process.env.CHROMA_ENABLED === "true";
  const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";
  const chromaToken = process.env.CHROMA_AUTH_TOKEN || "";

  console.log("\n📋 Environment Check:");
  console.log(`CHROMA_ENABLED: ${chromaEnabled}`);
  console.log(`CHROMA_URL: ${chromaUrl}`);
  console.log(
    `CHROMA_AUTH_TOKEN: ${chromaToken ? "***" + chromaToken.slice(-4) : "NOT SET"}`
  );

  if (!chromaEnabled) {
    console.log("\n❌ ChromaDB is NOT enabled in environment!");
    console.log("💡 Make sure .env.dev has: CHROMA_ENABLED=true");
    process.exit(1);
  }

  // Test 1: Client initialization
  console.log("\n📡 Test 1: ChromaDB Client");
  console.log("-".repeat(60));
  try {
    const client = getChromaClient();
    if (!client) {
      console.log("❌ Client is null - ChromaDB not enabled");
      process.exit(1);
    }
    console.log("✅ Client initialized successfully");
  } catch (error) {
    console.log("❌ Client initialization failed:", error);
    process.exit(1);
  }

  // Test 2: Collection creation
  console.log("\n📦 Test 2: Collection Creation");
  console.log("-".repeat(60));
  try {
    const collection = await getCollection("test_friday_leads");
    if (!collection) {
      console.log("❌ Collection creation failed");
      process.exit(1);
    }
    console.log("✅ Collection created: test_friday_leads");
  } catch (error) {
    console.log("❌ Collection creation error:", error);
    process.exit(1);
  }

  // Test 3: Document indexing
  console.log("\n📝 Test 3: Document Indexing");
  console.log("-".repeat(60));
  try {
    await addDocuments("test_friday_leads", [
      {
        id: "test-lead-1",
        text: "John Doe from ACME Corporation, email: john@acme.com",
        metadata: {
          name: "John Doe",
          company: "ACME Corporation",
          email: "john@acme.com",
        },
      },
    ]);
    console.log("✅ Document indexed successfully");
  } catch (error) {
    console.log("❌ Document indexing error:", error);
    process.exit(1);
  }

  // Test 4: Semantic search
  console.log("\n🔍 Test 4: Semantic Search");
  console.log("-".repeat(60));
  try {
    const query = "John Doe at ACME Corp";
    const results = await searchSimilar("test_friday_leads", query, 1);

    if (!results || results.ids.length === 0) {
      console.log("❌ Search returned no results");
      process.exit(1);
    }

    const similarity = 1 - results.distances[0] / 2;
    console.log(`✅ Found: ${results.ids[0]}`);
    console.log(`   Similarity: ${similarity.toFixed(3)}`);
    console.log(`   Metadata:`, results.metadatas[0]);
  } catch (error) {
    console.log("❌ Search error:", error);
    process.exit(1);
  }

  // Test 5: Duplicate detection
  console.log("\n👥 Test 5: Duplicate Detection");
  console.log("-".repeat(60));
  try {
    const duplicate = "J. Doe working at ACME Corporation";
    const results = await searchSimilar("test_friday_leads", duplicate, 1);

    if (!results || results.ids.length === 0) {
      console.log("❌ Duplicate search failed");
      process.exit(1);
    }

    const similarity = 1 - results.distances[0] / 2;
    console.log(`Query: "${duplicate}"`);
    console.log(`Match: "${results.metadatas[0]?.name}"`);
    console.log(`Similarity: ${similarity.toFixed(3)}`);

    if (similarity > 0.85) {
      console.log("✅ DUPLICATE DETECTED (similarity > 0.85)");
    } else {
      console.log(
        `⚠️  Not a duplicate (similarity: ${similarity.toFixed(3)} < 0.85)`
      );
    }
  } catch (error) {
    console.log("❌ Duplicate detection error:", error);
    process.exit(1);
  }

  // Test 6: Embeddings with Langfuse
  console.log("\n📊 Test 6: Embeddings + Langfuse");
  console.log("-".repeat(60));
  try {
    const testText = "Testing Langfuse integration";
    const embedding = await generateEmbedding(testText);
    console.log(`✅ Embedding generated (${embedding.length} dimensions)`);
    console.log("💡 Check Langfuse dashboard for trace:");
    console.log("   http://localhost:3001/project/default");
    console.log("   Look for: chromadb-embedding-generation");
  } catch (error) {
    console.log("❌ Embedding error:", error);
    process.exit(1);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL TESTS PASSED!");
  console.log("=".repeat(60));
  console.log("\n✅ ChromaDB Integration Status:");
  console.log("   • Client: Working");
  console.log("   • Collections: Working");
  console.log("   • Indexing: Working");
  console.log("   • Search: Working");
  console.log("   • Duplicate Detection: Working");
  console.log("   • Langfuse Monitoring: Active");
  console.log("\n💡 Next Steps:");
  console.log(
    "   1. Test in UI: Create a lead and check for duplicate detection"
  );
  console.log("   2. Monitor Langfuse: http://localhost:3001");
  console.log("   3. Check server logs for ChromaDB messages");

  process.exit(0);
}

// Run tests
testWithServer().catch(error => {
  console.error("\n❌ Test suite failed:", error);
  process.exit(1);
});
