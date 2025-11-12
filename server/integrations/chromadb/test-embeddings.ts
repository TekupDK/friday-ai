/**
 * Test script for embeddings
 * Run with: tsx server/integrations/chromadb/test-embeddings.ts
 */

import { generateEmbedding, cosineSimilarity } from "./embeddings";

async function testEmbeddings() {
  console.log("🧪 Testing OpenRouter Embeddings\n");

  // Test 1: Generate single embedding
  console.log('Test 1: Generate embedding for "Hello World"');
  const embedding1 = await generateEmbedding("Hello World");
  console.log(`✅ Generated embedding with ${embedding1.length} dimensions\n`);

  // Test 2: Semantic similarity
  console.log("Test 2: Semantic similarity test");
  const text1 = "John Doe works at ACME Corporation";
  const text2 = "Jane Smith is employed by ACME Corp";
  const text3 = "Python programming language tutorial";

  const emb1 = await generateEmbedding(text1);
  const emb2 = await generateEmbedding(text2);
  const emb3 = await generateEmbedding(text3);

  const similarity12 = cosineSimilarity(emb1, emb2);
  const similarity13 = cosineSimilarity(emb1, emb3);

  console.log(`Text 1: "${text1}"`);
  console.log(`Text 2: "${text2}"`);
  console.log(
    `Similarity 1-2: ${similarity12.toFixed(4)} (should be HIGH - same company)`
  );
  console.log();
  console.log(`Text 3: "${text3}"`);
  console.log(
    `Similarity 1-3: ${similarity13.toFixed(4)} (should be LOW - different topic)\n`
  );

  // Test 3: Lead similarity
  console.log("Test 3: Lead deduplication test");
  const lead1 =
    "Name: John Doe\nEmail: john@acme.com\nCompany: ACME Corp\nMessage: Interested in your product";
  const lead2 =
    "Name: John Doe\nEmail: john.doe@acme.com\nCompany: ACME Corporation\nMessage: Want to buy your service";
  const lead3 =
    "Name: Jane Smith\nEmail: jane@xyz.com\nCompany: XYZ Inc\nMessage: Need pricing information";

  const leadEmb1 = await generateEmbedding(lead1);
  const leadEmb2 = await generateEmbedding(lead2);
  const leadEmb3 = await generateEmbedding(lead3);

  const leadSim12 = cosineSimilarity(leadEmb1, leadEmb2);
  const leadSim13 = cosineSimilarity(leadEmb1, leadEmb3);

  console.log(`Lead 1: John Doe @ ACME`);
  console.log(`Lead 2: John Doe @ ACME (slight variation)`);
  console.log(
    `Similarity: ${leadSim12.toFixed(4)} (should be HIGH - likely duplicate)`
  );
  console.log();
  console.log(`Lead 3: Jane Smith @ XYZ`);
  console.log(
    `Similarity: ${leadSim13.toFixed(4)} (should be LOW - different person)\n`
  );

  // Test 4: Performance
  console.log("Test 4: Performance test");
  const start = Date.now();
  await generateEmbedding("Performance test text");
  const duration = Date.now() - start;
  console.log(`✅ Single embedding took ${duration}ms\n`);

  console.log("🎉 All tests complete!");
  console.log("\nInterpretation:");
  console.log("- Similarity > 0.9: Nearly identical");
  console.log("- Similarity 0.7-0.9: Very similar (likely duplicate)");
  console.log("- Similarity 0.5-0.7: Somewhat similar");
  console.log("- Similarity < 0.5: Different");
}

// Run tests
testEmbeddings().catch(console.error);
