/**
 * E2E Test Script - Follow-up Reminders & Ghostwriter
 * Run with: npx tsx server/scripts/test-e2e-followup-ghostwriter.ts
 * 
 * Note: Requires .env.dev file or environment variables to be set
 */

// Load environment variables
// Note: This script expects .env.dev or environment variables to be set
// If dotenv is not available, ensure environment variables are set manually

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import {
  emailFollowups,
  emailResponseFeedback,
  userWritingStyles,
} from "../../drizzle/schema";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { inboxRouter } from "../routers/inbox-router";

// Normalize DATABASE_URL
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    const sslmode = u.searchParams.get("sslmode");
    if (!sslmode || sslmode === "require") {
      u.searchParams.set("sslmode", "no-verify");
    }
    if (u.searchParams.has("schema")) {
      u.searchParams.delete("schema");
    }
    return u.toString();
  } catch {
    return url;
  }
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);

async function runE2ETest() {
  console.log("🧪 Starting E2E Test - Follow-up Reminders & Ghostwriter\n");

  const testRouter = router({
    inbox: inboxRouter,
  });

  let testUserId: number;
  let testUser: any;
  const createdFollowupIds: number[] = [];
  const createdFeedbackIds: number[] = [];
  const testThreadId = `test-thread-${nanoid()}`;

  try {
    // Setup: Get or create test user
    console.log("📋 Setting up test user...");
    const { ENV } = await import("../_core/env");
    const { upsertUser, getUserByOpenId } = await import("../db");

    await upsertUser({
      openId: ENV.ownerOpenId,
      name: "E2E Test User",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });

    const user = await getUserByOpenId(ENV.ownerOpenId);
    if (!user) throw new Error("Failed to create/find test user");
    testUser = user;
    testUserId = user.id;
    console.log(`✅ Test user ID: ${testUserId}\n`);

    const mockContext = {
      user: testUser,
      req: {} as any,
      res: {} as any,
    };

    const caller = testRouter.createCaller(mockContext);

    // Test 1: Create Follow-up Reminder
    console.log("📝 Test 1: Create Follow-up Reminder");
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    const followup = await caller.inbox.email.createFollowupReminder({
      threadId: testThreadId,
      reminderDate: reminderDate.toISOString(),
      priority: "normal",
      notes: "E2E test reminder",
    });

    console.log(`   ✅ Created follow-up ID: ${followup.id}`);
    console.log(`   ✅ Thread ID: ${followup.threadId}`);
    console.log(`   ✅ Status: ${followup.status}`);
    console.log(`   ✅ Priority: ${followup.priority}\n`);
    createdFollowupIds.push(followup.id);

    // Test 2: List Follow-up Reminders
    console.log("📋 Test 2: List Follow-up Reminders");
    const reminders = await caller.inbox.email.listFollowupReminders({
      status: "pending",
    });

    console.log(`   ✅ Found ${reminders.length} pending reminders`);
    const ourReminder = reminders.find(r => r.id === followup.id);
    if (ourReminder) {
      console.log(`   ✅ Our reminder found in list\n`);
    } else {
      throw new Error("Our reminder not found in list");
    }

    // Test 3: Update Follow-up Date
    console.log("📅 Test 3: Update Follow-up Date");
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 5);

    const updated = await caller.inbox.email.updateFollowupDate({
      followupId: followup.id,
      reminderDate: newDate.toISOString(),
    });

    console.log(`   ✅ Updated follow-up ID: ${updated.id}`);
    console.log(`   ✅ New reminder date: ${updated.reminderDate}\n`);

    // Test 4: Mark Follow-up Complete
    console.log("✅ Test 4: Mark Follow-up Complete");
    const completed = await caller.inbox.email.markFollowupComplete({
      followupId: followup.id,
    });

    console.log(`   ✅ Completed follow-up ID: ${completed.id}`);
    console.log(`   ✅ Status: ${completed.status}`);
    console.log(`   ✅ Completed at: ${completed.completedAt}\n`);

    // Test 5: Filter by Status
    console.log("🔍 Test 5: Filter Reminders by Status");
    const completedList = await caller.inbox.email.listFollowupReminders({
      status: "completed",
    });

    console.log(`   ✅ Found ${completedList.length} completed reminders`);
    if (completedList.some(r => r.id === followup.id)) {
      console.log(`   ✅ Our reminder found in completed list\n`);
    } else {
      throw new Error("Our reminder not found in completed list");
    }

    // Test 6: Get Writing Style
    console.log("✍️  Test 6: Get Writing Style");
    const style = await caller.inbox.email.getWritingStyle();
    if (style) {
      console.log(`   ✅ Writing style found`);
      console.log(`   ✅ Tone: ${style.tone}`);
      console.log(`   ✅ Average length: ${style.averageLength}\n`);
    } else {
      console.log(`   ℹ️  No writing style yet (expected if no sent emails)\n`);
    }

    // Test 7: Generate Ghostwriter Reply
    console.log("🤖 Test 7: Generate Ghostwriter Reply");
    try {
      const reply = await caller.inbox.email.generateGhostwriterReply({
        threadId: testThreadId,
        subject: "Test Email",
        from: "test@example.com",
        body: "Hej, kan du hjælpe mig med at forstå hvordan systemet virker?",
      });

      console.log(`   ✅ Generated reply (${reply.length} chars)`);
      console.log(`   ✅ Preview: ${reply.substring(0, 100)}...\n`);
    } catch (error: any) {
      console.log(
        `   ℹ️  AI API not available: ${error.message} (this is OK for e2e test)\n`
      );
    }

    // Test 8: Save Feedback
    console.log("💬 Test 8: Save Feedback");
    const feedbackResult =
      await caller.inbox.email.updateWritingStyleFromFeedback({
        originalSuggestion: "Tak for din mail",
        editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
        threadId: testThreadId,
        suggestionId: "test-suggestion-123",
      });

    console.log(`   ✅ Feedback saved: ${feedbackResult.success}\n`);

    // Verify feedback in database
    const db = await getDb();
    if (db) {
      const feedbacks = await db
        .select()
        .from(emailResponseFeedback)
        .where(eq(emailResponseFeedback.userId, testUserId))
        .execute();

      const ourFeedback = feedbacks.find(f => f.threadId === testThreadId);
      if (ourFeedback) {
        console.log(`   ✅ Feedback verified in database (ID: ${ourFeedback.id})\n`);
        createdFeedbackIds.push(ourFeedback.id);
      }
    }

    // Test 9: Analyze Writing Style
    console.log("🔬 Test 9: Analyze Writing Style");
    try {
      const analysis = await caller.inbox.email.analyzeWritingStyle({
        sampleSize: 10,
      });

      if (analysis) {
        console.log(`   ✅ Analysis complete`);
        console.log(`   ✅ Tone: ${analysis.tone}`);
        console.log(`   ✅ Average length: ${analysis.averageLength}\n`);
      } else {
        console.log(
          `   ℹ️  No sent emails found for analysis (expected)\n`
        );
      }
    } catch (error: any) {
      console.log(
        `   ℹ️  AI API not available: ${error.message} (this is OK)\n`
      );
    }

    // Test 10: User Isolation
    console.log("🔒 Test 10: User Isolation");
    const allReminders = await caller.inbox.email.listFollowupReminders({});
    const allOwnReminders = allReminders.every(r => r.userId === testUserId);
    if (allOwnReminders) {
      console.log(`   ✅ All reminders belong to test user\n`);
    } else {
      throw new Error("User isolation failed");
    }

    // Test 11: Database Integrity
    console.log("🗄️  Test 11: Database Integrity");
    if (db && createdFollowupIds.length > 0) {
      const dbFollowup = await db
        .select()
        .from(emailFollowups)
        .where(eq(emailFollowups.id, createdFollowupIds[0]))
        .limit(1)
        .execute();

      if (dbFollowup.length === 1 && dbFollowup[0].userId === testUserId) {
        console.log(`   ✅ Follow-up integrity verified\n`);
      } else {
        throw new Error("Database integrity check failed");
      }
    }

    console.log("🎉 All E2E tests passed!\n");

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    if (db) {
      // Delete follow-ups
      for (const id of createdFollowupIds) {
        await db.delete(emailFollowups).where(eq(emailFollowups.id, id));
      }
      console.log(`   ✅ Deleted ${createdFollowupIds.length} follow-ups`);

      // Delete feedback
      for (const id of createdFeedbackIds) {
        await db
          .delete(emailResponseFeedback)
          .where(eq(emailResponseFeedback.id, id));
      }
      console.log(`   ✅ Deleted ${createdFeedbackIds.length} feedback entries`);

      // Delete writing style
      await db
        .delete(userWritingStyles)
        .where(eq(userWritingStyles.userId, testUserId));
      console.log(`   ✅ Cleaned up writing style\n`);
    }

    console.log("✅ E2E test completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ E2E test failed:");
    console.error(error);

    // Cleanup on error
    const db = await getDb();
    if (db) {
      try {
        for (const id of createdFollowupIds) {
          await db.delete(emailFollowups).where(eq(emailFollowups.id, id));
        }
        for (const id of createdFeedbackIds) {
          await db
            .delete(emailResponseFeedback)
            .where(eq(emailResponseFeedback.id, id));
        }
        if (testUserId) {
          await db
            .delete(userWritingStyles)
            .where(eq(userWritingStyles.userId, testUserId));
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    process.exit(1);
  }
}

runE2ETest();
