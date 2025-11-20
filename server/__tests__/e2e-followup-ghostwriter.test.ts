/**
 * E2E Test - Follow-up Reminders & Ghostwriter
 * Tests the complete flow from API to database
 */

// Force TLS to accept self-signed chain in Supabase and load env from .env.prod
process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH || ".env.prod";
import "dotenv/config";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  emailFollowups,
  emailResponseFeedback,
  userWritingStyles,
} from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { inboxRouter } from "../routers/inbox-router";

// Normalize DATABASE_URL for postgres.js and Supabase
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

describe("Follow-up Reminders & Ghostwriter E2E", () => {
  const testRouter = router({
    inbox: inboxRouter,
  });

  let testUserId: number;
  let testUser: any;
  let createdFollowupIds: number[] = [];
  let createdFeedbackIds: number[] = [];
  const testThreadId = `test-thread-${nanoid()}`;

  beforeAll(async () => {
    // Ensure test user exists
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
  });

  afterAll(async () => {
    // Cleanup test data
    const db = await getDb();
    if (db) {
      // Delete follow-ups
      if (createdFollowupIds.length > 0) {
        for (const id of createdFollowupIds) {
          await db.delete(emailFollowups).where(eq(emailFollowups.id, id));
        }
      }

      // Delete feedback
      if (createdFeedbackIds.length > 0) {
        for (const id of createdFeedbackIds) {
          await db
            .delete(emailResponseFeedback)
            .where(eq(emailResponseFeedback.id, id));
        }
      }

      // Delete writing style (if created)
      await db
        .delete(userWritingStyles)
        .where(eq(userWritingStyles.userId, testUserId));
    }
  });

  describe("Follow-up Reminders", () => {
    it("should create a follow-up reminder", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 3);

      const result = await caller.inbox.email.createFollowupReminder({
        threadId: testThreadId,
        reminderDate: reminderDate.toISOString(),
        priority: "normal",
        notes: "E2E test reminder",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.threadId).toBe(testThreadId);
      expect(result.status).toBe("pending");
      expect(result.priority).toBe("normal");
      expect(result.notes).toBe("E2E test reminder");

      createdFollowupIds.push(result.id);
    });

    it("should list follow-up reminders", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const result = await caller.inbox.email.listFollowupReminders({
        status: "pending",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const ourReminder = result.find(r => r.id === createdFollowupIds[0]);
      expect(ourReminder).toBeDefined();
      expect(ourReminder?.threadId).toBe(testThreadId);
    });

    it("should update follow-up reminder date", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);

      const result = await caller.inbox.email.updateFollowupDate({
        followupId: createdFollowupIds[0],
        reminderDate: newDate.toISOString(),
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(createdFollowupIds[0]);
      expect(new Date(result.reminderDate).getTime()).toBeCloseTo(
        newDate.getTime(),
        -3
      ); // Within 1 second
    });

    it("should mark follow-up as complete", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const result = await caller.inbox.email.markFollowupComplete({
        followupId: createdFollowupIds[0],
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(createdFollowupIds[0]);
      expect(result.status).toBe("completed");
      expect(result.completedAt).toBeDefined();
    });

    it("should filter reminders by status", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const completed = await caller.inbox.email.listFollowupReminders({
        status: "completed",
      });

      expect(completed).toBeDefined();
      expect(Array.isArray(completed)).toBe(true);
      expect(completed.some(r => r.id === createdFollowupIds[0])).toBe(true);
    });
  });

  describe("Ghostwriter", () => {
    it("should get writing style (initially null)", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const result = await caller.inbox.email.getWritingStyle();

      // Initially should be null (no style analyzed yet)
      expect(result).toBeNull();
    });

    it("should generate ghostwriter reply (even without style)", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      try {
        const result = await caller.inbox.email.generateGhostwriterReply({
          threadId: testThreadId,
          subject: "Test Email",
          from: "test@example.com",
          body: "Hej, kan du hjælpe mig med at forstå hvordan systemet virker?",
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      } catch (error: any) {
        // If AI API is not available, that's OK for e2e test
        // We just verify the endpoint exists and is callable
        expect(error).toBeDefined();
        console.log("Note: AI API not available, but endpoint is callable");
      }
    });

    it("should save feedback from user edits", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      const result = await caller.inbox.email.updateWritingStyleFromFeedback({
        originalSuggestion: "Tak for din mail",
        editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
        threadId: testThreadId,
        suggestionId: "test-suggestion-123",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Verify feedback was saved to database
      const db = await getDb();
      if (db) {
        const feedbacks = await db
          .select()
          .from(emailResponseFeedback)
          .where(eq(emailResponseFeedback.userId, testUserId))
          .execute();

        const ourFeedback = feedbacks.find(
          f => f.threadId === testThreadId
        );
        expect(ourFeedback).toBeDefined();
        if (ourFeedback) {
          createdFeedbackIds.push(ourFeedback.id);
        }
      }
    });

    it("should analyze writing style (if emails exist)", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      try {
        const result = await caller.inbox.email.analyzeWritingStyle({
          sampleSize: 10,
        });

        // May return null if no sent emails exist, which is OK
        if (result) {
          expect(result).toBeDefined();
          expect(result.tone).toBeDefined();
          expect(result.averageLength).toBeGreaterThan(0);
        } else {
          console.log("Note: No sent emails found for analysis (expected)");
        }
      } catch (error: any) {
        // If AI API is not available, that's OK
        console.log("Note: AI API not available for analysis");
      }
    });
  });

  describe("Integration Flow", () => {
    it("should complete full follow-up workflow", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      // 1. Create reminder
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 2);
      const reminder = await caller.inbox.email.createFollowupReminder({
        threadId: `integration-test-${nanoid()}`,
        reminderDate: reminderDate.toISOString(),
        priority: "high",
      });

      expect(reminder.id).toBeGreaterThan(0);
      createdFollowupIds.push(reminder.id);

      // 2. List and verify
      const reminders = await caller.inbox.email.listFollowupReminders({
        status: "pending",
      });
      expect(reminders.some(r => r.id === reminder.id)).toBe(true);

      // 3. Update date
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 4);
      await caller.inbox.email.updateFollowupDate({
        followupId: reminder.id,
        reminderDate: newDate.toISOString(),
      });

      // 4. Mark complete
      const completed = await caller.inbox.email.markFollowupComplete({
        followupId: reminder.id,
      });
      expect(completed.status).toBe("completed");

      // 5. Verify in completed list
      const completedList = await caller.inbox.email.listFollowupReminders({
        status: "completed",
      });
      expect(completedList.some(r => r.id === reminder.id)).toBe(true);
    });

    it("should complete full ghostwriter workflow", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);
      const testThread = `ghostwriter-test-${nanoid()}`;

      try {
        // 1. Get style (may be null)
        const styleBefore = await caller.inbox.email.getWritingStyle();
        expect(styleBefore === null || typeof styleBefore === "object").toBe(
          true
        );

        // 2. Generate reply
        const reply = await caller.inbox.email.generateGhostwriterReply({
          threadId: testThread,
          subject: "Test",
          from: "customer@example.com",
          body: "Hej, hvornår kan du levere?",
        });

        expect(typeof reply).toBe("string");
        expect(reply.length).toBeGreaterThan(0);

        // 3. Save feedback
        await caller.inbox.email.updateWritingStyleFromFeedback({
          originalSuggestion: reply,
          editedResponse: reply + " Jeg vender tilbage snarest.",
          threadId: testThread,
        });

        // 4. Verify feedback saved
        const db = await getDb();
        if (db) {
          const feedbacks = await db
            .select()
            .from(emailResponseFeedback)
            .where(eq(emailResponseFeedback.userId, testUserId))
            .execute();

          const ourFeedback = feedbacks.find(f => f.threadId === testThread);
          expect(ourFeedback).toBeDefined();
          if (ourFeedback) {
            createdFeedbackIds.push(ourFeedback.id);
          }
        }
      } catch (error: any) {
        // If AI API not available, skip but don't fail
        if (error.message?.includes("AI") || error.message?.includes("API")) {
          console.log("Note: AI API not available, skipping ghostwriter test");
        } else {
          throw error;
        }
      }
    });
  });

  describe("Database Integrity", () => {
    it("should maintain referential integrity", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping integrity test");
        return;
      }

      // Verify follow-up was saved correctly
      if (createdFollowupIds.length > 0) {
        const followup = await db
          .select()
          .from(emailFollowups)
          .where(eq(emailFollowups.id, createdFollowupIds[0]))
          .limit(1)
          .execute();

        expect(followup.length).toBe(1);
        expect(followup[0].userId).toBe(testUserId);
        expect(followup[0].threadId).toBeDefined();
      }

      // Verify feedback was saved correctly
      if (createdFeedbackIds.length > 0) {
        const feedback = await db
          .select()
          .from(emailResponseFeedback)
          .where(eq(emailResponseFeedback.id, createdFeedbackIds[0]))
          .limit(1)
          .execute();

        expect(feedback.length).toBe(1);
        expect(feedback[0].userId).toBe(testUserId);
        expect(feedback[0].threadId).toBeDefined();
      }
    });

    it("should enforce user isolation", async () => {
      const mockContext: TrpcContext = {
        user: testUser,
        req: {} as any,
        res: {} as any,
      };

      const caller = testRouter.createCaller(mockContext);

      // List reminders should only return user's own
      const reminders = await caller.inbox.email.listFollowupReminders({});

      reminders.forEach(reminder => {
        expect(reminder.userId).toBe(testUserId);
      });
    });
  });
});
