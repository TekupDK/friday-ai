/**
 * E2E Test - Database Integrity
 */

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  emailFollowups,
  emailResponseFeedback,
} from "../../../drizzle/schema";
import { getDb } from "../../db";
import { createE2ETestContext } from "./setup";

describe("Database Integrity E2E", () => {
  let ctx: Awaited<ReturnType<typeof createE2ETestContext>>;

  beforeAll(async () => {
    ctx = await createE2ETestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it("should maintain referential integrity", async () => {
    const db = await getDb();
    if (!db) {
      console.log("Database not available, skipping integrity test");
      return;
    }

    if (ctx.createdFollowupIds.length > 0) {
      const followup = await db
        .select()
        .from(emailFollowups)
        .where(eq(emailFollowups.id, ctx.createdFollowupIds[0]))
        .limit(1)
        .execute();

      expect(followup.length).toBe(1);
      expect(followup[0].userId).toBe(ctx.testUserId);
      expect(followup[0].threadId).toBeDefined();
    }

    if (ctx.createdFeedbackIds.length > 0) {
      const feedback = await db
        .select()
        .from(emailResponseFeedback)
        .where(eq(emailResponseFeedback.id, ctx.createdFeedbackIds[0]))
        .limit(1)
        .execute();

      expect(feedback.length).toBe(1);
      expect(feedback[0].userId).toBe(ctx.testUserId);
      expect(feedback[0].threadId).toBeDefined();
    }
  });

  it("should enforce user isolation", async () => {
    const caller = ctx.getCaller();

    const reminders = await caller.inbox.email.listFollowupReminders({});

    reminders.forEach(reminder => {
      expect(reminder.userId).toBe(ctx.testUserId);
    });
  });
});
