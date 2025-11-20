/**
 * E2E Test - Integration Workflows
 */

import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { emailResponseFeedback } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { createE2ETestContext } from "./setup";

describe("Integration Workflows E2E", () => {
  let ctx: Awaited<ReturnType<typeof createE2ETestContext>>;

  beforeAll(async () => {
    ctx = await createE2ETestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it("should complete full follow-up workflow", async () => {
    const caller = ctx.getCaller();

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 2);
    const reminder = await caller.inbox.email.createFollowupReminder({
      threadId: `integration-test-${nanoid()}`,
      reminderDate: reminderDate.toISOString(),
      priority: "high",
    });

    expect(reminder.id).toBeGreaterThan(0);
    ctx.createdFollowupIds.push(reminder.id);

    const reminders = await caller.inbox.email.listFollowupReminders({
      status: "pending",
    });
    expect(reminders.some(r => r.id === reminder.id)).toBe(true);

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 4);
    await caller.inbox.email.updateFollowupDate({
      followupId: reminder.id,
      reminderDate: newDate.toISOString(),
    });

    const completed = await caller.inbox.email.markFollowupComplete({
      followupId: reminder.id,
    });
    expect(completed.status).toBe("completed");

    const completedList = await caller.inbox.email.listFollowupReminders({
      status: "completed",
    });
    expect(completedList.some(r => r.id === reminder.id)).toBe(true);
  });

  it("should complete full ghostwriter workflow", async () => {
    const caller = ctx.getCaller();
    const testThread = `ghostwriter-test-${nanoid()}`;

    try {
      const styleBefore = await caller.inbox.email.getWritingStyle();
      expect(styleBefore === null || typeof styleBefore === "object").toBe(true);

      const reply = await caller.inbox.email.generateGhostwriterReply({
        threadId: testThread,
        subject: "Test",
        from: "customer@example.com",
        body: "Hej, hvornår kan du levere?",
      });

      expect(typeof reply).toBe("string");
      expect(reply.length).toBeGreaterThan(0);

      await caller.inbox.email.updateWritingStyleFromFeedback({
        originalSuggestion: reply,
        editedResponse: reply + " Jeg vender tilbage snarest.",
        threadId: testThread,
      });

      const db = await getDb();
      if (db) {
        const feedbacks = await db
          .select()
          .from(emailResponseFeedback)
          .where(eq(emailResponseFeedback.userId, ctx.testUserId))
          .execute();

        const ourFeedback = feedbacks.find(f => f.threadId === testThread);
        expect(ourFeedback).toBeDefined();
        if (ourFeedback) {
          ctx.createdFeedbackIds.push(ourFeedback.id);
        }
      }
    } catch (error: any) {
      if (error.message?.includes("AI") || error.message?.includes("API")) {
        console.log("Note: AI API not available, skipping ghostwriter test");
      } else {
        throw error;
      }
    }
  });
});
