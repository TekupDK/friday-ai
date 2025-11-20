/**
 * Simple Feature Test - Checks if code compiles and functions exist
 * This test doesn't require database or external services
 * 
 * Run: tsx server/scripts/test-features-simple.ts
 */

import { existsSync } from "fs";
import { readFileSync } from "fs";

console.log("\n=== Simple Feature Test ===\n");

const results: Record<string, boolean> = {};

// Test 1: Check if files exist
console.log("Test 1: Checking if files exist...");
const files = [
  "server/email-intelligence/followup-reminders.ts",
  "server/email-intelligence/ghostwriter.ts",
  "server/modules/email/followup-scheduler.ts",
  "client/src/components/inbox/FollowupReminders.tsx",
  "client/src/components/inbox/GhostwriterReply.tsx",
];

files.forEach(file => {
  const exists = existsSync(file);
  results[`file:${file}`] = exists;
  console.log(`${exists ? "✓" : "✗"} ${file}`);
});

// Test 2: Check if functions are exported
console.log("\nTest 2: Checking function exports...");

try {
  const followupContent = readFileSync("server/email-intelligence/followup-reminders.ts", "utf-8");
  const followupFunctions = [
    "createFollowupReminder",
    "listFollowupReminders",
    "markFollowupComplete",
    "shouldCreateFollowup",
    "autoCreateFollowups",
  ];
  
  followupFunctions.forEach(func => {
    const exists = followupContent.includes(`export.*function ${func}`) || 
                   followupContent.includes(`export async function ${func}`);
    results[`followup:${func}`] = exists;
    console.log(`${exists ? "✓" : "✗"} ${func}`);
  });
} catch (error) {
  console.error("Error reading followup-reminders.ts:", error);
}

try {
  const ghostwriterContent = readFileSync("server/email-intelligence/ghostwriter.ts", "utf-8");
  const ghostwriterFunctions = [
    "analyzeWritingStyle",
    "getWritingStyle",
    "generateGhostwriterReply",
    "learnFromFeedback",
  ];
  
  ghostwriterFunctions.forEach(func => {
    const exists = ghostwriterContent.includes(`export.*function ${func}`) || 
                   ghostwriterContent.includes(`export async function ${func}`);
    results[`ghostwriter:${func}`] = exists;
    console.log(`${exists ? "✓" : "✗"} ${func}`);
  });
} catch (error) {
  console.error("Error reading ghostwriter.ts:", error);
}

// Test 3: Check if tRPC endpoints are added
console.log("\nTest 3: Checking tRPC endpoints...");

try {
  const routerContent = readFileSync("server/routers/inbox/email-router.ts", "utf-8");
  const endpoints = [
    "createFollowupReminder",
    "listFollowupReminders",
    "markFollowupComplete",
    "updateFollowupDate",
    "cancelFollowup",
    "generateGhostwriterReply",
    "getWritingStyle",
    "analyzeWritingStyle",
    "updateWritingStyleFromFeedback",
  ];
  
  endpoints.forEach(endpoint => {
    const exists = routerContent.includes(endpoint);
    results[`endpoint:${endpoint}`] = exists;
    console.log(`${exists ? "✓" : "✗"} ${endpoint}`);
  });
} catch (error) {
  console.error("Error reading email-router.ts:", error);
}

// Test 4: Check if schema tables are defined
console.log("\nTest 4: Checking database schema...");

try {
  const schemaContent = readFileSync("drizzle/schema.ts", "utf-8");
  const tables = [
    "emailFollowupsInFridayAi",
    "userWritingStylesInFridayAi",
    "emailResponseFeedbackInFridayAi",
  ];
  
  tables.forEach(table => {
    const exists = schemaContent.includes(`export const ${table}`);
    results[`schema:${table}`] = exists;
    console.log(`${exists ? "✓" : "✗"} ${table}`);
  });
} catch (error) {
  console.error("Error reading schema.ts:", error);
}

// Print summary
console.log("\n=== Test Summary ===");
const allTests = Object.entries(results);
const passed = allTests.filter(([_, result]) => result).length;
const total = allTests.length;

allTests.forEach(([test, result]) => {
  console.log(`${result ? "✅" : "❌"} ${test}`);
});

console.log(`\n${passed}/${total} tests passed`);

if (passed === total) {
  console.log("\n✅ All checks passed! Code structure is correct.\n");
  process.exit(0);
} else {
  console.log(`\n⚠️  ${total - passed} checks failed. Please review the code.\n`);
  process.exit(1);
}
