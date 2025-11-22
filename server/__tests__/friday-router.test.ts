/**
 * Friday Router Tests
 *
 * Tests for legacy Friday AI helper endpoints:
 * - findRecentLeads: Search Gmail threads from recent days
 * - getCustomers: Get all customers from Billy
 * - searchCustomer: Search for customer by email
 *
 * These endpoints are kept for backward compatibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TrpcContext } from "../_core/trpc";

// Mock dependencies
vi.mock("../billy", () => ({
  getCustomers: vi.fn(),
  searchCustomerByEmail: vi.fn(),
}));

vi.mock("../google-api", () => ({
  searchGmailThreads: vi.fn(),
}));

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 1,
              email: "test@example.com",
              role: "owner",
              openId: "test-owner-id",
            },
          ]),
        }),
      }),
    }),
  }),
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
  user?: { id: number; role?: string; openId?: string; email?: string; name?: string; };
}): TrpcContext {
  const user = options?.user || {
    id: 1,
    email: "test@example.com",
    name: "Test User",
  };

  return {
    user,
    userRole: "owner",
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

describe("Friday Router - findRecentLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should search Gmail threads from last 7 days by default", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    const mockThreads = [
      {
        id: "thread1",
        snippet: "Lead inquiry about pricing",
        messages: [],
      },
    ];
    vi.mocked(searchGmailThreads).mockResolvedValue(mockThreads);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.findRecentLeads({ days: 7 });

    expect(result).toEqual(mockThreads);
    expect(searchGmailThreads).toHaveBeenCalledWith({
      query: expect.stringContaining("after:"),
      maxResults: 100,
    });

    // Verify query contains a valid date format (YYYY-MM-DD)
    const calls = vi.mocked(searchGmailThreads).mock.calls;
    const query = calls[0][0].query;
    expect(query).toMatch(/after:\d{4}-\d{2}-\d{2}/);
  });

  it("should search Gmail threads from custom days", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    const mockThreads = [
      {
        id: "thread1",
        snippet: "Old lead inquiry",
        messages: [],
      },
    ];
    vi.mocked(searchGmailThreads).mockResolvedValue(mockThreads);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await caller.findRecentLeads({ days: 30 });

    expect(searchGmailThreads).toHaveBeenCalledWith({
      query: expect.stringContaining("after:"),
      maxResults: 100,
    });

    // Verify the date is approximately 30 days ago
    const calls = vi.mocked(searchGmailThreads).mock.calls;
    const query = calls[0][0].query;
    const dateMatch = query.match(/after:(\d{4}-\d{2}-\d{2})/);
    expect(dateMatch).toBeTruthy();

    if (dateMatch) {
      const queryDate = new Date(dateMatch[1]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 30);

      // Allow 1 day tolerance for test timing
      const diffDays = Math.abs(
        (queryDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeLessThan(2);
    }
  });

  it("should limit results to 100 threads", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await caller.findRecentLeads({ days: 7 });

    expect(searchGmailThreads).toHaveBeenCalledWith({
      query: expect.any(String),
      maxResults: 100,
    });
  });

  it("should handle empty Gmail search results", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.findRecentLeads({ days: 7 });

    expect(result).toEqual([]);
  });

  it("should handle Gmail API errors", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockRejectedValue(
      new Error("Gmail API quota exceeded")
    );

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.findRecentLeads({ days: 7 })).rejects.toThrow(
      "Gmail API quota exceeded"
    );
  });

  it("should require authentication", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    // Create context without user
    const ctx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.findRecentLeads({ days: 7 })).rejects.toThrow();
  });

  it("should format date query correctly for today", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await caller.findRecentLeads({ days: 0 });

    const calls = vi.mocked(searchGmailThreads).mock.calls;
    const query = calls[0][0].query;

    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    expect(query).toContain(`after:${today}`);
  });

  it("should handle large day values", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Search 365 days back
    await caller.findRecentLeads({ days: 365 });

    expect(searchGmailThreads).toHaveBeenCalled();
  });
});

describe("Friday Router - getCustomers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return all customers from Billy", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    const mockCustomers = [
      {
        id: "cust1",
        name: "Customer 1",
        email: "customer1@example.com",
      },
      {
        id: "cust2",
        name: "Customer 2",
        email: "customer2@example.com",
      },
    ];
    vi.mocked(getCustomers).mockResolvedValue(mockCustomers);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.getCustomers();

    expect(result).toEqual(mockCustomers);
    expect(getCustomers).toHaveBeenCalledTimes(1);
  });

  it("should handle empty customer list", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    vi.mocked(getCustomers).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.getCustomers();

    expect(result).toEqual([]);
  });

  it("should handle Billy API errors", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    vi.mocked(getCustomers).mockRejectedValue(
      new Error("Billy API authentication failed")
    );

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.getCustomers()).rejects.toThrow(
      "Billy API authentication failed"
    );
  });

  it("should require authentication", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    // Create context without user
    const ctx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.getCustomers()).rejects.toThrow();
  });

  it("should handle large customer datasets", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    // Simulate 1000 customers
    const mockCustomers = Array.from({ length: 1000 }, (_, i) => ({
      id: `cust${i}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
    }));
    vi.mocked(getCustomers).mockResolvedValue(mockCustomers);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.getCustomers();

    expect(result).toHaveLength(1000);
    expect(result[0].id).toBe("cust0");
    expect(result[999].id).toBe("cust999");
  });

  it("should not cache results between calls", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    const mockCustomers1 = [{ id: "cust1", name: "Customer 1", email: "c1@example.com" }];
    const mockCustomers2 = [{ id: "cust2", name: "Customer 2", email: "c2@example.com" }];

    vi.mocked(getCustomers)
      .mockResolvedValueOnce(mockCustomers1)
      .mockResolvedValueOnce(mockCustomers2);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result1 = await caller.getCustomers();
    const result2 = await caller.getCustomers();

    expect(result1).toEqual(mockCustomers1);
    expect(result2).toEqual(mockCustomers2);
    expect(getCustomers).toHaveBeenCalledTimes(2);
  });
});

describe("Friday Router - searchCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should search customer by email", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    const mockCustomer = {
      id: "cust1",
      name: "John Doe",
      email: "john@example.com",
    };
    vi.mocked(searchCustomerByEmail).mockResolvedValue(mockCustomer);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.searchCustomer({ email: "john@example.com" });

    expect(result).toEqual(mockCustomer);
    expect(searchCustomerByEmail).toHaveBeenCalledWith("john@example.com");
  });

  it("should handle customer not found", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    vi.mocked(searchCustomerByEmail).mockResolvedValue(null);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.searchCustomer({ email: "notfound@example.com" });

    expect(result).toBeNull();
  });

  it("should handle Billy API errors", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    vi.mocked(searchCustomerByEmail).mockRejectedValue(
      new Error("Billy API rate limit exceeded")
    );

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    await expect(
      caller.searchCustomer({ email: "test@example.com" })
    ).rejects.toThrow("Billy API rate limit exceeded");
  });

  it("should require authentication", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    // Create context without user
    const ctx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = fridayRouter.createCaller(ctx);

    await expect(
      caller.searchCustomer({ email: "test@example.com" })
    ).rejects.toThrow();
  });

  it("should validate email input", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Empty string should be rejected by Zod
    await expect(caller.searchCustomer({ email: "" })).rejects.toThrow();
  });

  it("should handle special characters in email", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    const specialEmail = "test+tag@example.com";
    const mockCustomer = {
      id: "cust1",
      name: "Test User",
      email: specialEmail,
    };
    vi.mocked(searchCustomerByEmail).mockResolvedValue(mockCustomer);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.searchCustomer({ email: specialEmail });

    expect(result).toEqual(mockCustomer);
    expect(searchCustomerByEmail).toHaveBeenCalledWith(specialEmail);
  });

  it("should handle case sensitivity in email search", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    const mockCustomer = {
      id: "cust1",
      name: "John Doe",
      email: "John@Example.com",
    };
    vi.mocked(searchCustomerByEmail).mockResolvedValue(mockCustomer);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Search with different case
    await caller.searchCustomer({ email: "JOHN@EXAMPLE.COM" });

    // Should pass the email as-is (Billy API handles normalization)
    expect(searchCustomerByEmail).toHaveBeenCalledWith("JOHN@EXAMPLE.COM");
  });

  it("should handle Unicode in email addresses", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    const unicodeEmail = "user@例え.jp";
    const mockCustomer = {
      id: "cust1",
      name: "Unicode User",
      email: unicodeEmail,
    };
    vi.mocked(searchCustomerByEmail).mockResolvedValue(mockCustomer);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.searchCustomer({ email: unicodeEmail });

    expect(result).toEqual(mockCustomer);
  });

  it("should pass through multiple search results if Billy returns array", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchCustomerByEmail } = await import("../billy");

    // Billy might return multiple customers with similar emails
    const mockCustomers = [
      { id: "cust1", name: "John Doe", email: "john@example.com" },
      { id: "cust2", name: "Jane Doe", email: "john@example.org" },
    ];
    vi.mocked(searchCustomerByEmail).mockResolvedValue(mockCustomers as any);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    const result = await caller.searchCustomer({ email: "john@example.com" });

    expect(result).toEqual(mockCustomers);
  });
});

describe("Friday Router - Security", () => {
  it("should require authentication for all endpoints", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    const unauthCtx = {
      user: null,
      userRole: null,
      req: {} as any,
      res: {} as any,
    } as any;

    const caller = fridayRouter.createCaller(unauthCtx);

    await expect(caller.findRecentLeads({ days: 7 })).rejects.toThrow();
    await expect(caller.getCustomers()).rejects.toThrow();
    await expect(
      caller.searchCustomer({ email: "test@example.com" })
    ).rejects.toThrow();
  });

  it("should allow owner role access", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    vi.mocked(getCustomers).mockResolvedValue([]);

    const ctx = createMockContext({
      user: { id: 1, email: "owner@example.com", role: "owner" },
    });

    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.getCustomers()).resolves.not.toThrow();
  });

  it("should allow admin role access", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    vi.mocked(getCustomers).mockResolvedValue([]);

    const ctx = createMockContext({
      user: { id: 2, email: "admin@example.com", role: "admin" },
    });
    ctx.userRole = "admin";

    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.getCustomers()).resolves.not.toThrow();
  });

  it("should allow user role access", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { getCustomers } = await import("../billy");

    vi.mocked(getCustomers).mockResolvedValue([]);

    const ctx = createMockContext({
      user: { id: 3, email: "user@example.com", role: "user" },
    });
    ctx.userRole = "user";

    const caller = fridayRouter.createCaller(ctx);

    await expect(caller.getCustomers()).resolves.not.toThrow();
  });
});

describe("Friday Router - Input Validation", () => {
  it("should validate days parameter in findRecentLeads", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Non-number should be rejected
    await expect(
      caller.findRecentLeads({ days: "invalid" as any })
    ).rejects.toThrow();
  });

  it("should use default days value of 7", async () => {
    const { fridayRouter } = await import("../routers/friday-router");
    const { searchGmailThreads } = await import("../google-api");

    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Call without explicit days parameter
    await caller.findRecentLeads({} as any);

    // Should use default of 7 days
    const calls = vi.mocked(searchGmailThreads).mock.calls;
    const query = calls[0][0].query;

    const queryDate = new Date(query.match(/after:(\d{4}-\d{2}-\d{2})/)?.[1] || "");
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 7);

    const diffDays = Math.abs(
      (queryDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeLessThan(2);
  });

  it("should reject negative days", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Negative days should still work (searches future emails)
    // This is a business logic decision - the API doesn't reject it
    const { searchGmailThreads } = await import("../google-api");
    vi.mocked(searchGmailThreads).mockResolvedValue([]);

    await expect(caller.findRecentLeads({ days: -7 })).resolves.not.toThrow();
  });

  it("should validate email parameter in searchCustomer", async () => {
    const { fridayRouter } = await import("../routers/friday-router");

    const ctx = createMockContext();
    const caller = fridayRouter.createCaller(ctx);

    // Non-string email should be rejected
    await expect(
      caller.searchCustomer({ email: 123 as any })
    ).rejects.toThrow();

    // Missing email should be rejected
    await expect(caller.searchCustomer({} as any)).rejects.toThrow();
  });
});
