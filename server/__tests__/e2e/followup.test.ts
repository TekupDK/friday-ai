/**
 * E2E Test - Follow-up Reminders
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createE2ETestContext } from "./setup";

describe("Follow-up Reminders E2E", () => {
  let ctx: Awaited<ReturnType<typeof createE2ETestContext>>;

  beforeAll(async () => {
    ctx = await createE2ETestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it("should create a follow-up reminder", async () => {
    const caller = ctx.getCaller();

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    const result = await caller.inbox.email.createFollowupReminder({
      threadId: ctx.testThreadId,
      reminderDate: reminderDate.toISOString(),
      priority: "normal",
      notes: "E2E test reminder",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.threadId).toBe(ctx.testThreadId);
    expect(result.status).toBe("pending");
    expect(result.priority).toBe("normal");
    expect(result.notes).toBe("E2E test reminder");

    ctx.createdFollowupIds.push(result.id);
  });

  it("should list follow-up reminders", async () => {
    const caller = ctx.getCaller();

    const result = await caller.inbox.email.listFollowupReminders({
      status: "pending",
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    const ourReminder = result.find(r => r.id === ctx.createdFollowupIds[0]);
    expect(ourReminder).toBeDefined();
    expect(ourReminder?.threadId).toBe(ctx.testThreadId);
  });

  it("should update follow-up reminder date", async () => {
    const caller = ctx.getCaller();

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 5);

    const result = await caller.inbox.email.updateFollowupDate({
      followupId: ctx.createdFollowupIds[0],
      reminderDate: newDate.toISOString(),
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(ctx.createdFollowupIds[0]);
    expect(new Date(result.reminderDate).getTime()).toBeCloseTo(
      newDate.getTime(),
      -3
    );
  });

  it("should mark follow-up as complete", async () => {
    const caller = ctx.getCaller();

    const result = await caller.inbox.email.markFollowupComplete({
      followupId: ctx.createdFollowupIds[0],
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(ctx.createdFollowupIds[0]);
    expect(result.status).toBe("completed");
    expect(result.completedAt).toBeDefined();
  });

  it("should filter reminders by status", async () => {
    const caller = ctx.getCaller();

    const completed = await caller.inbox.email.listFollowupReminders({
      status: "completed",
    });

    expect(completed).toBeDefined();
    expect(Array.isArray(completed)).toBe(true);
    expect(completed.some(r => r.id === ctx.createdFollowupIds[0])).toBe(true);
  });
});
