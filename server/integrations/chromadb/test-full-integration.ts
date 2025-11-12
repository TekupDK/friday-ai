/**
 * Full Integration Test for ChromaDB
 * Tests all features: embeddings, lead dedup, email context, ChromaDB health
 *
 * Run with: tsx server/integrations/chromadb/test-full-integration.ts
 */

import {
  getChromaClient,
  getCollection,
  addDocuments,
  searchSimilar,
  countDocuments,
  listCollections,
  formatLeadForEmbedding,
  formatEmailForEmbedding,
} from "./client";

import { generateEmbedding, cosineSimilarity } from "./embeddings";

console.log("🧪 ChromaDB Full Integration Test\n");
console.log("=".repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function logTest(name: string, passed: boolean, details?: string) {
  if (passed) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: ChromaDB Connection
  console.log("\n📡 Test 1: ChromaDB Connection");
  console.log("-".repeat(60));
  try {
    const client = getChromaClient();
    logTest("ChromaDB client initialized", client !== null);

    const collections = await listCollections();
    logTest(
      "Can list collections",
      true,
      `Found ${collections?.length || 0} collections`
    );
    console.log("Collections:", collections || "none");
  } catch (error) {
    logTest(
      "ChromaDB connection",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 2: Collection Management
  console.log("\n📦 Test 2: Collection Management");
  console.log("-".repeat(60));
  try {
    // Create test collection
    const testCollection = await getCollection("test_friday_integration");
    logTest("Can create/get collection", testCollection !== null);

    // Count initial documents
    const initialCount = await countDocuments("test_friday_integration");
    console.log(`Initial document count: ${initialCount}`);

    // Add test documents
    await addDocuments("test_friday_integration", [
      {
        id: "test-doc-1",
        text: "John Doe works at ACME Corporation in Copenhagen",
        metadata: { type: "test", name: "John Doe" },
      },
      {
        id: "test-doc-2",
        text: "Jane Smith is employed by XYZ Industries in Aarhus",
        metadata: { type: "test", name: "Jane Smith" },
      },
      {
        id: "test-doc-3",
        text: "ACME Corp is a technology company based in Denmark",
        metadata: { type: "test", name: "ACME Info" },
      },
    ]);

    const newCount = await countDocuments("test_friday_integration");
    logTest("Can add documents", newCount === 3, `Added ${newCount} documents`);
  } catch (error) {
    logTest(
      "Collection management",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 3: Semantic Search
  console.log("\n🔍 Test 3: Semantic Search");
  console.log("-".repeat(60));
  try {
    // Search for similar documents
    const query = "Person working at ACME";
    const results = await searchSimilar("test_friday_integration", query, 3);

    logTest(
      "Can perform semantic search",
      results !== null && results.ids.length > 0
    );

    if (results && results.ids.length > 0) {
      console.log("\nSearch Results:");
      for (let i = 0; i < results.ids.length; i++) {
        const id = results.ids[i];
        const distance = results.distances[i];
        const similarity = (1 - distance / 2).toFixed(3);
        const metadata = results.metadatas[i];
        console.log(`  ${i + 1}. ${id} (similarity: ${similarity})`);
        console.log(`     ${metadata?.name || "Unknown"}`);
      }

      // Verify top result is relevant
      const topResult = results.metadatas[0];
      const isRelevant =
        topResult?.name === "John Doe" || topResult?.name === "ACME Info";
      logTest(
        "Search returns relevant results",
        isRelevant,
        `Top: ${topResult?.name}`
      );
    }
  } catch (error) {
    logTest(
      "Semantic search",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 4: Lead Deduplication
  console.log("\n👥 Test 4: Lead Deduplication Simulation");
  console.log("-".repeat(60));
  try {
    // Simulate lead data
    const lead1 = {
      name: "John Doe",
      email: "john@acme.com",
      phone: "+45 12 34 56 78",
      company: "ACME Corporation",
    };

    const lead2 = {
      name: "John Doe",
      email: "john.doe@acme.com", // Different email
      phone: "+4512345678", // Different format
      company: "ACME Corp", // Shorter name
    };

    const lead3 = {
      name: "Jane Smith",
      email: "jane@xyz.com",
      phone: "+45 98 76 54 32",
      company: "XYZ Industries",
    };

    // Format leads
    const lead1Text = formatLeadForEmbedding(lead1);
    const lead2Text = formatLeadForEmbedding(lead2);
    const lead3Text = formatLeadForEmbedding(lead3);

    // Generate embeddings
    const emb1 = await generateEmbedding(lead1Text);
    const emb2 = await generateEmbedding(lead2Text);
    const emb3 = await generateEmbedding(lead3Text);

    // Calculate similarities
    const sim12 = cosineSimilarity(emb1, emb2);
    const sim13 = cosineSimilarity(emb1, emb3);

    console.log(`\nLead Similarity Analysis:`);
    console.log(`  Lead 1 vs Lead 2 (same person): ${sim12.toFixed(3)}`);
    console.log(`  Lead 1 vs Lead 3 (different): ${sim13.toFixed(3)}`);

    const DUPLICATE_THRESHOLD = 0.85;
    const isDuplicate = sim12 > DUPLICATE_THRESHOLD;
    const isDifferent = sim13 < DUPLICATE_THRESHOLD;

    logTest(
      "Detects duplicate leads",
      isDuplicate,
      `Similarity: ${sim12.toFixed(3)} > ${DUPLICATE_THRESHOLD}`
    );
    logTest(
      "Distinguishes different leads",
      isDifferent,
      `Similarity: ${sim13.toFixed(3)} < ${DUPLICATE_THRESHOLD}`
    );
  } catch (error) {
    logTest(
      "Lead deduplication",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 5: Email Context
  console.log("\n📧 Test 5: Email Context Retrieval");
  console.log("-".repeat(60));
  try {
    // Create test email collection
    await getCollection("test_friday_emails");

    // Add test emails
    await addDocuments("test_friday_emails", [
      {
        id: "email-1",
        text: formatEmailForEmbedding({
          from: "john@acme.com",
          subject: "Product inquiry about pricing",
          body: "We are interested in your Enterprise plan. Can you send pricing?",
        }),
        metadata: {
          from: "john@acme.com",
          subject: "Product inquiry about pricing",
          type: "inquiry",
        },
      },
      {
        id: "email-2",
        text: formatEmailForEmbedding({
          from: "john@acme.com",
          subject: "Follow up on pricing quote",
          body: "Thanks for the quote. We need some clarifications on the Enterprise features.",
        }),
        metadata: {
          from: "john@acme.com",
          subject: "Follow up on pricing quote",
          type: "follow-up",
        },
      },
      {
        id: "email-3",
        text: formatEmailForEmbedding({
          from: "jane@xyz.com",
          subject: "Support ticket #1234",
          body: "We are experiencing issues with login. Please help.",
        }),
        metadata: {
          from: "jane@xyz.com",
          subject: "Support ticket #1234",
          type: "support",
        },
      },
    ]);

    // Search for related emails
    const currentEmail = formatEmailForEmbedding({
      from: "john@acme.com",
      subject: "Ready to proceed with Enterprise plan",
      body: "We have reviewed the pricing and features. Let's move forward.",
    });

    const relatedEmails = await searchSimilar(
      "test_friday_emails",
      currentEmail,
      3
    );

    logTest(
      "Can find related emails",
      relatedEmails !== null && relatedEmails.ids.length > 0
    );

    if (relatedEmails && relatedEmails.ids.length > 0) {
      console.log("\nRelated Emails:");
      for (let i = 0; i < relatedEmails.ids.length; i++) {
        const id = relatedEmails.ids[i];
        const distance = relatedEmails.distances[i];
        const similarity = (1 - distance / 2).toFixed(3);
        const metadata = relatedEmails.metadatas[i];
        console.log(
          `  ${i + 1}. ${metadata?.subject || "Unknown"} (${similarity})`
        );
        console.log(`     From: ${metadata?.from || "Unknown"}`);
      }

      // Verify context is relevant (should find John's emails, not Jane's)
      const topTwoAreRelevant =
        relatedEmails.metadatas[0]?.from === "john@acme.com" &&
        relatedEmails.metadatas[1]?.from === "john@acme.com";

      logTest(
        "Returns relevant email context",
        topTwoAreRelevant,
        `Top 2 are from same person/company`
      );
    }
  } catch (error) {
    logTest(
      "Email context",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 6: Production Collections Status
  console.log("\n🏭 Test 6: Production Collections");
  console.log("-".repeat(60));
  try {
    const leadsCount = await countDocuments("friday_leads");
    const emailsCount = await countDocuments("friday_emails");

    console.log(`friday_leads: ${leadsCount} documents`);
    console.log(`friday_emails: ${emailsCount} documents`);

    logTest(
      "Production collections exist",
      true,
      `Leads: ${leadsCount}, Emails: ${emailsCount}`
    );

    if (leadsCount === 0) {
      console.log("⚠️  WARNING: No leads indexed yet. Create a lead to test!");
    }

    if (emailsCount === 0) {
      console.log("⚠️  WARNING: No emails indexed yet. Sync emails to test!");
    }
  } catch (error) {
    logTest(
      "Production collections",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Test 7: Performance
  console.log("\n⚡ Test 7: Performance Metrics");
  console.log("-".repeat(60));
  try {
    // Test embedding speed
    const start = Date.now();
    await generateEmbedding("Performance test text");
    const embeddingTime = Date.now() - start;

    logTest(
      "Embedding performance",
      embeddingTime < 2000,
      `${embeddingTime}ms (target: <2000ms)`
    );

    // Test search speed
    const searchStart = Date.now();
    await searchSimilar("test_friday_integration", "test query", 5);
    const searchTime = Date.now() - searchStart;

    logTest(
      "Search performance",
      searchTime < 1000,
      `${searchTime}ms (target: <1000ms)`
    );
  } catch (error) {
    logTest(
      "Performance",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(
    `📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`
  );

  if (testsFailed === 0) {
    console.log(
      "\n🎉 All tests passed! ChromaDB integration is working perfectly!"
    );
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above for details.");
  }

  console.log("\n💡 Next Steps:");
  console.log("1. Create a real lead in the UI to test automatic indexing");
  console.log("2. Sync emails to test email context retrieval");
  console.log("3. Monitor Langfuse dashboard for embedding performance");
  console.log(
    "4. Check ChromaDB collections: http://localhost:8000/api/v2/collections"
  );

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run all tests
runTests().catch(console.error);
