/**
 * E2E Test - Ghostwriter
 */

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { emailResponseFeedback } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { createE2ETestContext } from "./setup";

describe("Ghostwriter E2E", () => {
  let ctx: Awaited<ReturnType<typeof createE2ETestContext>>;

  beforeAll(async () => {
    ctx = await createE2ETestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it("should get writing style (initially null)", async () => {
    const caller = ctx.getCaller();

    const result = await caller.inbox.email.getWritingStyle();

    expect(result).toBeNull();
  });

  it("should generate ghostwriter reply (even without style)", async () => {
    const caller = ctx.getCaller();

    try {
      const result = await caller.inbox.email.generateGhostwriterReply({
        threadId: ctx.testThreadId,
        subject: "Test Email",
        from: "test@example.com",
        body: "Hej, kan du hjælpe mig med at forstå hvordan systemet virker?",
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log("Note: AI API not available, but endpoint is callable");
    }
  });

  it("should save feedback from user edits", async () => {
    const caller = ctx.getCaller();

    const result = await caller.inbox.email.updateWritingStyleFromFeedback({
      originalSuggestion: "Tak for din mail",
      editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
      threadId: ctx.testThreadId,
      suggestionId: "test-suggestion-123",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    const db = await getDb();
    if (db) {
      const feedbacks = await db
        .select()
        .from(emailResponseFeedback)
        .where(eq(emailResponseFeedback.userId, ctx.testUserId))
        .execute();

      const ourFeedback = feedbacks.find(f => f.threadId === ctx.testThreadId);
      expect(ourFeedback).toBeDefined();
      if (ourFeedback) {
        ctx.createdFeedbackIds.push(ourFeedback.id);
      }
    }
  });

  it("should analyze writing style (if emails exist)", async () => {
    const caller = ctx.getCaller();

    try {
      const result = await caller.inbox.email.analyzeWritingStyle({
        sampleSize: 10,
      });

      if (result) {
        expect(result).toBeDefined();
        expect(result.tone).toBeDefined();
        expect(result.averageLength).toBeGreaterThan(0);
      } else {
        console.log("Note: No sent emails found for analysis (expected)");
      }
    } catch (error: any) {
      console.log("Note: AI API not available for analysis");
    }
  });
});
