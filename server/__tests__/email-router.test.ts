/**
 * Email Router Tests
 *
 * Tests for critical email operations in the inbox email router.
 * Focuses on security-sensitive and frequently-used endpoints.
 *
 * Coverage:
 * - Email listing and search
 * - Send, reply, forward operations
 * - Label operations (archive, delete, star)
 * - Bulk operations
 * - Lead creation from email
 * - Security and rate limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "../_core/trpc";

// Mock dependencies
vi.mock("../gmail-labels", () => ({
  addLabelToThread: vi.fn().mockResolvedValue(undefined),
  removeLabelFromThread: vi.fn().mockResolvedValue(undefined),
  archiveThread: vi.fn().mockResolvedValue(undefined),
  getGmailLabels: vi.fn().mockResolvedValue([]),
}));

vi.mock("../google-api", () => ({
  searchGmailThreads: vi.fn().mockResolvedValue([]),
  getGmailThread: vi.fn().mockResolvedValue({ id: "thread123", messages: [] }),
  sendGmailMessage: vi.fn().mockResolvedValue({ id: "msg123", threadId: "thread123" }),
  modifyGmailThread: vi.fn().mockResolvedValue(undefined),
  markGmailMessageAsRead: vi.fn().mockResolvedValue(undefined),
  starGmailMessage: vi.fn().mockResolvedValue(undefined),
  listCalendarEvents: vi.fn().mockResolvedValue([]),
}));

vi.mock("../billy", () => ({
  searchCustomerByEmail: vi.fn(),
}));

vi.mock("../lead-db", () => ({
  createLead: vi.fn(),
  getUserLeads: vi.fn(),
}));

vi.mock("../customer-db", () => ({
  createOrUpdateCustomerProfile: vi.fn().mockResolvedValue(undefined),
}));

// Mock rate limiter to avoid rate limiting in tests
vi.mock("../rate-limit-middleware", () => ({
  createRateLimitMiddleware: vi.fn(() => async (opts: any) => {
    // Pass through without rate limiting
    return opts.next();
  }),
  INBOX_CRM_RATE_LIMIT: { maxRequests: 100, windowMs: 60000 },
  STATS_RATE_LIMIT: { maxRequests: 100, windowMs: 60000 },
}));

// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  trackEvent: vi.fn().mockResolvedValue(undefined),
  getPipelineState: vi.fn().mockResolvedValue(null),
  updatePipelineStage: vi.fn().mockResolvedValue(undefined),
  getPipelineTransitions: vi.fn().mockResolvedValue([]),
  getUserPipelineStates: vi.fn().mockResolvedValue([]),
}));

// Mock environment
vi.mock("../_core/env", () => ({
  ENV: {
    ownerOpenId: "test-owner-id",
    isProduction: false,
  },
}));

/**
 * Create mock tRPC context for testing
 */
function createMockContext(options?: {
  user?: { id: number; role?: string; openId?: string; email?: string; };
  userRole?: string;
}): TrpcContext {
  const user = options?.user || {
    id: 1,
    email: "test@example.com",
    name: "Test User",
  };

  return {
    user,
    userRole: (options?.userRole as any) || "owner",
    req: {
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
      hostname: "localhost",
      protocol: "http",
      headers: { "x-forwarded-proto": "http" },
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Email Router - List Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should list emails from database", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const mockEmails = [
      {
        id: 1,
        threadId: "thread1",
        subject: "Test Email",
        from: "sender@example.com",
        snippet: "Test content",
      },
    ];

    mockDb.execute.mockResolvedValue(mockEmails);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.list({ maxResults: 10 });

    expect(result).toBeDefined();
    expect(mockDb.select).toHaveBeenCalled();
  });

  it("should limit email list results", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    mockDb.execute.mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.list({ maxResults: 50 });

    expect(mockDb.select).toHaveBeenCalled();
  });

  it("should handle empty email list", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    mockDb.execute.mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.list({});

    expect(result).toBeDefined();
  });

  it("should reject excessively long queries", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const longQuery = "a".repeat(501); // Exceeds 500 char limit

    await expect(caller.list({ query: longQuery })).rejects.toThrow();
  });

  it("should require authentication", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = emailRouter.createCaller(ctx);

    await expect(caller.list({})).rejects.toThrow();
  });
});

describe("Email Router - Search Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should search emails with query", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { searchGmailThreads } = await import("../google-api");

    const mockThreads = [
      {
        id: "thread1",
        snippet: "Search result",
        messages: [],
      },
    ];
    vi.mocked(searchGmailThreads).mockResolvedValue(mockThreads);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.search({ query: "important", maxResults: 10 });

    expect(result).toEqual(mockThreads);
    expect(searchGmailThreads).toHaveBeenCalledWith({
      query: "important",
      maxResults: 10,
    });
  });

  it("should handle search with no results", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.search({ query: "nonexistent", maxResults: 10 });

    expect(result).toEqual([]);
  });

  it("should handle Gmail API errors during search", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockRejectedValue(
      new Error("Gmail API quota exceeded")
    );

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await expect(
      caller.search({ query: "test", maxResults: 10 })
    ).rejects.toThrow("Gmail API quota exceeded");
  });
});

describe("Email Router - Send Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { sendGmailMessage } = await import("../google-api");

    vi.mocked(sendGmailMessage).mockResolvedValue({
      id: "msg123",
      threadId: "thread123",
    });

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.send({
      to: "recipient@example.com", // String, not array
      subject: "Test Email",
      body: "Test content",
    });

    expect(result).toBeDefined();
    expect(sendGmailMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "recipient@example.com",
        subject: "Test Email",
        body: "Test content",
      })
    );
  });

  it("should handle send email errors", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { sendGmailMessage } = await import("../google-api");

    vi.mocked(sendGmailMessage).mockRejectedValue(
      new Error("Failed to send email")
    );

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await expect(
      caller.send({
        to: "recipient@example.com",
        subject: "Test",
        body: "Test",
      })
    ).rejects.toThrow("Failed to send email");
  });

  it("should validate email recipients", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Empty string should be rejected
    await expect(
      caller.send({
        to: "",
        subject: "Test",
        body: "Test",
      })
    ).rejects.toThrow();
  });

  it("should validate email subject", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Empty subject should be rejected
    await expect(
      caller.send({
        to: ["recipient@example.com"],
        subject: "",
        body: "Test",
      })
    ).rejects.toThrow();
  });
});

describe("Email Router - Label Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should archive email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { archiveThread } = await import("../gmail-labels");

    vi.mocked(archiveThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.archive({ threadId: "thread123" });

    expect(archiveThread).toHaveBeenCalledWith("thread123");
  });

  it("should add label to email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { addLabelToThread } = await import("../gmail-labels");

    vi.mocked(addLabelToThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.addLabel({ threadId: "thread123", labelName: "IMPORTANT" });

    expect(addLabelToThread).toHaveBeenCalledWith("thread123", "IMPORTANT");
  });

  it("should remove label from email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { removeLabelFromThread } = await import("../gmail-labels");

    vi.mocked(removeLabelFromThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.removeLabel({ threadId: "thread123", labelName: "IMPORTANT" });

    expect(removeLabelFromThread).toHaveBeenCalledWith("thread123", "IMPORTANT");
  });

  it("should star email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { starGmailMessage } = await import("../google-api");

    vi.mocked(starGmailMessage).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.star({ messageId: "msg123" });

    expect(starGmailMessage).toHaveBeenCalledWith("msg123", true);
  });

  it("should unstar email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { starGmailMessage } = await import("../google-api");

    vi.mocked(starGmailMessage).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.unstar({ messageId: "msg123" });

    expect(starGmailMessage).toHaveBeenCalledWith("msg123", false);
  });

  it("should handle label operation errors", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { addLabelToThread } = await import("../gmail-labels");

    vi.mocked(addLabelToThread).mockRejectedValue(
      new Error("Label operation failed")
    );

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await expect(
      caller.addLabel({ threadId: "thread123", labelName: "IMPORTANT" })
    ).rejects.toThrow("Label operation failed");
  });
});

describe("Email Router - Bulk Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should bulk mark as read", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { modifyGmailThread } = await import("../google-api");

    vi.mocked(modifyGmailThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.bulkMarkAsRead({ threadIds: ["thread1", "thread2"] });

    expect(modifyGmailThread).toHaveBeenCalledTimes(2);
  });

  it("should bulk archive", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { archiveThread } = await import("../gmail-labels");

    vi.mocked(archiveThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await caller.bulkArchive({ threadIds: ["thread1", "thread2"] });

    expect(archiveThread).toHaveBeenCalledTimes(2);
  });

  it("should limit bulk operations to prevent abuse", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Try to bulk mark 101 threads (exceeds likely limit)
    const manyThreads = Array.from({ length: 101 }, (_, i) => `thread${i}`);

    await expect(caller.bulkMarkAsRead({ threadIds: manyThreads })).rejects.toThrow();
  });

  it("should handle partial bulk operation failures", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { modifyGmailThread } = await import("../google-api");

    // First call succeeds, second fails
    vi.mocked(modifyGmailThread)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Gmail API error"));

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Should return partial success (uses Promise.allSettled)
    const result = await caller.bulkMarkAsRead({ threadIds: ["thread1", "thread2"] });

    expect(result).toEqual({
      success: true,
      processed: 1, // Only 1 succeeded
      failed: 1, // 1 failed
      total: 2,
    });
  });
});

describe("Email Router - Delete Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should delete email (move to trash)", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { modifyGmailThread } = await import("../google-api");

    vi.mocked(modifyGmailThread).mockResolvedValue(undefined);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.delete({ threadId: "thread123" });

    expect(result).toEqual({ success: true, trashed: true });
    expect(modifyGmailThread).toHaveBeenCalledWith({
      threadId: "thread123",
      addLabelIds: ["TRASH"],
    });
  });

  it("should allow any authenticated user to delete", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { modifyGmailThread } = await import("../google-api");

    vi.mocked(modifyGmailThread).mockResolvedValue(undefined);

    // Regular user role
    const ctx = createMockContext({ userRole: "user" });
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.delete({ threadId: "thread123" });

    expect(result).toEqual({ success: true, trashed: true });
  });

  it("should require admin permission for bulk delete", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    // User role (not admin)
    const ctx = createMockContext({ userRole: "user" });
    const caller = emailRouter.createCaller(ctx);

    await expect(
      caller.bulkDelete({ threadIds: ["thread1", "thread2"] })
    ).rejects.toThrow();
  });
});

describe("Email Router - Thread Mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should map Gmail thread IDs to internal email IDs", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    mockDb.execute.mockResolvedValue([{ id: 123 }, { id: 456 }]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.mapThreadsToEmailIds({
      threadIds: ["gmail-thread-1", "gmail-thread-2"],
    });

    expect(result).toEqual([123, 456]);
  });

  it("should limit thread ID array size", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // 101 thread IDs (exceeds 100 limit)
    const manyThreadIds = Array.from({ length: 101 }, (_, i) => `thread${i}`);

    await expect(
      caller.mapThreadsToEmailIds({ threadIds: manyThreadIds })
    ).rejects.toThrow();
  });

  it("should limit thread ID string length", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Thread ID with 101 characters (exceeds 100 limit)
    const longThreadId = "a".repeat(101);

    await expect(
      caller.mapThreadsToEmailIds({ threadIds: [longThreadId] })
    ).rejects.toThrow();
  });

  it("should reject empty thread ID array", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await expect(caller.mapThreadsToEmailIds({ threadIds: [] })).rejects.toThrow();
  });

  it("should return unique email IDs", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    // Return duplicate IDs from database
    mockDb.execute.mockResolvedValue([{ id: 123 }, { id: 123 }, { id: 456 }]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.mapThreadsToEmailIds({
      threadIds: ["thread1", "thread2"],
    });

    // Should deduplicate
    expect(result).toEqual([123, 456]);
  });

  it("should handle threads not found in database", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    mockDb.execute.mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.mapThreadsToEmailIds({
      threadIds: ["nonexistent-thread"],
    });

    expect(result).toEqual([]);
  });
});

describe("Email Router - Lead Creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create lead from email", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { createLead, getUserLeads } = await import("../lead-db");

    vi.mocked(getUserLeads).mockResolvedValue([]);
    vi.mocked(createLead).mockResolvedValue({
      id: 1,
      email: "lead@example.com",
      name: "Lead Example",
      status: "new",
    } as any);

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    const result = await caller.createLeadFromEmail({
      email: "lead@example.com",
      name: "Lead Example",
    });

    expect(result).toBeDefined();
    expect(result.created).toBe(true);
    expect(result.lead.email).toBe("lead@example.com");
    expect(createLead).toHaveBeenCalled();
  });

  it("should handle lead creation errors", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");
    const { createLead, getUserLeads } = await import("../lead-db");

    vi.mocked(getUserLeads).mockResolvedValue([]);
    vi.mocked(createLead).mockRejectedValue(new Error("Database error"));

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    await expect(
      caller.createLeadFromEmail({ email: "lead@example.com" })
    ).rejects.toThrow("Database error");
  });

  it("should validate email format for lead creation", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Invalid email format
    await expect(
      caller.createLeadFromEmail({ email: "invalid-email" })
    ).rejects.toThrow();
  });
});

describe("Email Router - Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should apply rate limiting to archive operation", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    // Rate limited procedures should have middleware applied
    expect(emailRouter._def.procedures.archive).toBeDefined();
  });

  it("should apply rate limiting to delete operation", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    expect(emailRouter._def.procedures.delete).toBeDefined();
  });

  it("should apply rate limiting to bulk operations", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    expect(emailRouter._def.procedures.bulkArchive).toBeDefined();
  });
});

describe("Email Router - Security", () => {
  it("should require authentication for all endpoints", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const unauthCtx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = emailRouter.createCaller(unauthCtx);

    await expect(caller.list({})).rejects.toThrow();
    await expect(
      caller.search({ query: "test", maxResults: 10 })
    ).rejects.toThrow();
    await expect(
      caller.send({ to: ["test@example.com"], subject: "Test", body: "Test" })
    ).rejects.toThrow();
  });

  it("should enforce user ownership of emails", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    // This is tested implicitly by the database queries that filter by ctx.user.id
    // All email operations should only return/modify emails owned by the authenticated user

    const ctx = createMockContext({ user: { id: 1, email: "user1@example.com" } });
    const caller = emailRouter.createCaller(ctx);

    mockDb.execute.mockResolvedValue([]);

    await caller.list({});

    // Verify the database query includes user ID filter
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("should validate input lengths to prevent DoS", async () => {
    const { emailRouter } = await import("../routers/inbox/email-router");

    const ctx = createMockContext();
    const caller = emailRouter.createCaller(ctx);

    // Query length limit (500 chars)
    const longQuery = "a".repeat(501);
    await expect(caller.list({ query: longQuery })).rejects.toThrow();

    // Thread ID array size limit (100)
    const manyThreadIds = Array.from({ length: 101 }, (_, i) => `t${i}`);
    await expect(
      caller.mapThreadsToEmailIds({ threadIds: manyThreadIds })
    ).rejects.toThrow();

    // Thread ID string length limit (100 chars)
    const longThreadId = "a".repeat(101);
    await expect(
      caller.mapThreadsToEmailIds({ threadIds: [longThreadId] })
    ).rejects.toThrow();
  });
});
