import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../mcp", () => ({
  searchGmail: vi.fn(async () => []),
  getGmailThread: vi.fn(async () => ({})),
  createGmailDraft: vi.fn(async () => ({ id: "draft-1" })),
  listCalendarEvents: vi.fn(async () => []),
  findFreeTimeSlots: vi.fn(async () => []),
}));

vi.mock("../billy", () => ({
  getInvoices: vi.fn(async () => []),
  createInvoice: vi.fn(async x => ({ id: "inv-1", ...x })),
  searchCustomerByEmail: vi.fn(async () => ({ id: "cust-1" })),
}));

vi.mock("../db", () => ({
  createTask: vi.fn(async x => ({ id: 1, ...x })),
  getUserLeads: vi.fn(async () => []),
  updateLeadStatus: vi.fn(async () => {}),
  trackEvent: vi.fn(async () => {}),
}));

vi.mock("../google-api", () => ({
  listCalendarEvents: vi.fn(async () => []),
  updateCalendarEvent: vi.fn(async x => ({ id: "evt-1", ...x })),
  deleteCalendarEvent: vi.fn(async () => {}),
}));

describe("Tool router (executeToolCall)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns VALIDATION_ERROR if args invalid", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const res = await executeToolCall("search_gmail", {} as any, 1);
    expect(res.success).toBe(false);
    expect(res.code).toBe("VALIDATION_ERROR");
  });

  it("returns AUTH_ERROR for stateful tool without user", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const res = await executeToolCall("list_leads", {}, 0 as any);
    expect(res.success).toBe(false);
    expect(res.code).toBe("AUTH_ERROR");
  });

  it("routes search_gmail and returns success", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const mcp = await import("../mcp");
    (mcp.searchGmail as any).mockResolvedValueOnce(["ok"]);

    const res = await executeToolCall("search_gmail", { query: "from:a" }, 123);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(["ok"]);
    expect(mcp.searchGmail).toHaveBeenCalledWith("from:a", undefined);
  });

  it("propagates API_ERROR when external call fails", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const mcp = await import("../mcp");
    (mcp.searchGmail as any).mockRejectedValueOnce(new Error("Rate limit"));

    const res = await executeToolCall("search_gmail", { query: "x" }, 9);
    expect(res.success).toBe(false);
    expect(res.code).toBe("API_ERROR");
  });

  it("normalizes create_task dueDate and passes priority", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const db = await import("../db");

    const res = await executeToolCall(
      "create_task",
      { title: "X", dueDate: "2025-11-05", priority: "urgent" },
      42
    );

    expect(res.success).toBe(true);
    expect(db.createTask).toHaveBeenCalled();
    const args = (db.createTask as any).mock.calls[0][0];
    expect(args.priority).toBe("urgent");
    expect(args.dueDate).toBe("2025-11-05T00:00:00.000Z");
  });

  it("passes filters to list_leads DB call", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const db = await import("../db");

    await executeToolCall("list_leads", { status: "won" }, 7);
    expect(db.getUserLeads).toHaveBeenCalledWith(7, {
      status: "won",
      source: undefined,
    });
  });

  it("returns UNKNOWN_TOOL for unknown tool name", async () => {
    const { executeToolCall } = await import("../friday-tool-handlers");
    const res = await executeToolCall("not_a_tool" as any, {}, 1);
    expect(res.success).toBe(false);
    expect(res.code).toBe("UNKNOWN_TOOL");
  });
});
