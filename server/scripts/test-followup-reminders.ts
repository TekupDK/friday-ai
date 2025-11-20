/**
 * Follow-up Reminders Test Script
 * Tests the follow-up reminders functionality
 * 
 * Run: dotenv -e .env.dev -- tsx server/scripts/test-followup-reminders.ts
 */

import "dotenv/config";
import { getDb } from "../db";
import {
  createFollowupReminder,
  listFollowupReminders,
  markFollowupComplete,
  shouldCreateFollowup,
  autoCreateFollowups,
} from "../email-intelligence/followup-reminders";
import { emailFollowups } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("\n=== Follow-up Reminders Test ===\n");

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

    // Test 2: Create a follow-up reminder
    console.log("Test 2: Creating follow-up reminder...");
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    const reminder = await createFollowupReminder(testUserId, {
      threadId: testThreadId,
      reminderDate: reminderDate.toISOString(),
      priority: "normal",
      notes: "Test reminder created by test script",
    });

    results.create = `OK (id=${reminder.id})`;
    console.log(`✓ Created reminder with ID: ${reminder.id}\n`);

    // Test 3: List reminders
    console.log("Test 3: Listing follow-up reminders...");
    const reminders = await listFollowupReminders(testUserId, {
      status: "pending",
    });
    results.list = `OK (found ${reminders.length} reminders)`;
    console.log(`✓ Found ${reminders.length} pending reminders\n`);

    // Test 4: Mark reminder as complete
    console.log("Test 4: Marking reminder as complete...");
    const completed = await markFollowupComplete(testUserId, reminder.id);
    results.complete = `OK (status=${completed.status})`;
    console.log(`✓ Marked reminder as ${completed.status}\n`);

    // Test 5: Test shouldCreateFollowup detection
    console.log("Test 5: Testing auto-detection logic...");
    const needsFollowup = await shouldCreateFollowup(
      testThreadId,
      testUserId,
      "Test Email with Question?",
      "Hej, hvornår kan du levere?"
    );
    results.detection = needsFollowup ? "OK (detected)" : "OK (not needed)";
    console.log(`✓ Detection test: ${needsFollowup ? "Would create follow-up" : "No follow-up needed"}\n`);

    // Test 6: Clean up test data
    console.log("Test 6: Cleaning up test data...");
    await db
      .delete(emailFollowups)
      .where(eq(emailFollowups.id, reminder.id))
      .execute();
    results.cleanup = "OK";
    console.log("✓ Cleaned up test reminder\n");

    // Print summary
    console.log("\n=== Test Summary ===");
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${test}: ${result}`);
    });
    console.log("\n✅ All tests passed!\n");
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
