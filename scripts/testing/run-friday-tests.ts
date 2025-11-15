#!/usr/bin/env tsx

/**
 * Friday AI Test Runner
 *
 * Run comprehensive tests for:
 * 1. OpenRouter API connection
 * 2. Gemma 3 27B Free model
 * 3. Prompt variations (A/B testing)
 * 4. Danish language quality
 * 5. Context awareness
 * 6. Performance benchmarks
 */

import { runCompleteTestSuite } from "./test-friday-complete";

console.log("🚀 Starting Friday AI Test Suite...");
console.log("=====================================");

// Check environment
if (!process.env.VITE_OPENROUTER_API_KEY) {
  console.error("❌ VITE_OPENROUTER_API_KEY not found in environment");
  console.log("💡 Make sure to set up your .env.dev file with:");
  console.log("   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here");
  process.exit(1);
}

// Run the test suite
runCompleteTestSuite()
  .then(() => {
    console.log("\n✅ All tests completed successfully!");
    console.log(
      "📊 Check the results above for prompt optimization recommendations"
    );
  })
  .catch(error => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  });
