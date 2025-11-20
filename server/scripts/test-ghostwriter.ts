/**
 * AI Ghostwriter Test Script
 * Tests the ghostwriter functionality
 * 
 * Run: dotenv -e .env.dev -- tsx server/scripts/test-ghostwriter.ts
 */

import "dotenv/config";
import { getDb } from "../db";
import {
  getWritingStyle,
  analyzeWritingStyle,
  generateGhostwriterReply,
  learnFromFeedback,
} from "../email-intelligence/ghostwriter";
import { userWritingStyles, emailResponseFeedback } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("\n=== AI Ghostwriter Test ===\n");

  // Get test user ID (you may need to adjust this)
  const testUserId = 1; // Replace with actual user ID from your database
  const testThreadId = "test-thread-" + Date.now();

  const results: Record<string, string> = {};

  try {
    // Test 1: Check if database connection works
    console.log("Test 1: Checking database connection...");
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    results.database = "OK";
    console.log("✓ Database connection OK\n");

    // Test 2: Get writing style (should be null initially)
    console.log("Test 2: Getting writing style...");
    let style = await getWritingStyle(testUserId);
    results.getStyle = style ? `OK (found style)` : "OK (no style yet)";
    console.log(`✓ ${style ? "Found existing style" : "No style found (expected)"}\n`);

    // Test 3: Analyze writing style (if user has sent emails)
    console.log("Test 3: Analyzing writing style...");
    try {
      const analyzedStyle = await analyzeWritingStyle(testUserId, 10);
      if (analyzedStyle) {
        results.analyze = `OK (tone=${analyzedStyle.tone}, length=${analyzedStyle.averageLength})`;
        console.log(`✓ Analyzed style: ${analyzedStyle.tone}, avg length: ${analyzedStyle.averageLength}\n`);
        style = await getWritingStyle(testUserId);
      } else {
        results.analyze = "SKIP (no sent emails found)";
        console.log("⚠ No sent emails found to analyze (this is OK if user hasn't sent emails yet)\n");
      }
    } catch (error: any) {
      results.analyze = `SKIP (${error.message})`;
      console.log(`⚠ Analysis skipped: ${error.message}\n`);
    }

    // Test 4: Generate ghostwriter reply
    console.log("Test 4: Generating ghostwriter reply...");
    try {
      const reply = await generateGhostwriterReply(testUserId, {
        threadId: testThreadId,
        subject: "Test Email",
        from: "test@example.com",
        body: "Hej, kan du hjælpe mig med at forstå hvordan systemet virker?",
      });
      results.generate = `OK (length=${reply.length} chars)`;
      console.log(`✓ Generated reply (${reply.length} characters):\n${reply.substring(0, 200)}...\n`);
    } catch (error: any) {
      results.generate = `FAIL (${error.message})`;
      console.error(`✗ Failed to generate reply: ${error.message}\n`);
    }

    // Test 5: Learn from feedback
    console.log("Test 5: Testing feedback learning...");
    try {
      await learnFromFeedback(testUserId, {
        originalSuggestion: "Tak for din mail",
        editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
        threadId: testThreadId,
      });
      results.feedback = "OK";
      console.log("✓ Feedback saved successfully\n");
    } catch (error: any) {
      results.feedback = `FAIL (${error.message})`;
      console.error(`✗ Failed to save feedback: ${error.message}\n`);
    }

    // Test 6: Clean up test data (optional - keep feedback for learning)
    console.log("Test 6: Verifying data...");
    const feedbackCount = await db
      .select()
      .from(emailResponseFeedback)
      .where(eq(emailResponseFeedback.userId, testUserId))
      .execute();
    results.verify = `OK (${feedbackCount.length} feedback entries)`;
    console.log(`✓ Found ${feedbackCount.length} feedback entries\n`);

    // Print summary
    console.log("\n=== Test Summary ===");
    Object.entries(results).forEach(([test, result]) => {
      const status = result.startsWith("OK") ? "✅" : result.startsWith("SKIP") ? "⚠️" : "❌";
      console.log(`${status} ${test}: ${result}`);
    });
    console.log("\n✅ Tests completed!\n");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    console.log("\n=== Test Summary ===");
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${test}: ${result}`);
    });
    process.exit(1);
  }
}

main().catch(console.error);
