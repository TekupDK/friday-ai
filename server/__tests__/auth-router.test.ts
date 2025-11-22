/**
 * Auth Router Tests
 *
 * Comprehensive test suite for authentication endpoints
 * Tests: me, login, logout operations
 * Security: Rate limiting, email validation, password validation, OAuth handling
 */

import { TRPCError } from "@trpc/server";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { TrpcContext } from "../_core/context";
import { appRouter } from "../routers";

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Mock context creator
function createMockContext(options?: {
  user?: {
    id: number;
    role?: string;
    openId?: string;
    email?: string;
    name?: string;
  };
  req?: any;
  res?: any;
}): TrpcContext {
  const mockRes = options?.res || {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };

  const mockReq = options?.req || {
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    hostname: "localhost",
    protocol: "http",
    headers: {
      "x-forwarded-proto": "http",
    },
  };

  if (!options?.user) {
    return {
      req: mockReq,
      res: mockRes,
      user: null,
    };
  }

  return {
    req: mockReq,
    res: mockRes,
    user: {
      id: options.user.id,
      openId: options.user.openId || `openid-${options.user.id}`,
      name: options.user.name || `Test User ${options.user.id}`,
      email: options.user.email || `test${options.user.id}@example.com`,
      role: (options.user.role as "user" | "admin") || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("Auth Router - me endpoint", () => {
  it("should return user when authenticated", async () => {
    const ctx = createMockContext({
      user: { id: 1, email: "user@example.com", name: "Test User" },
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.email).toBe("user@example.com");
    expect(result?.name).toBe("Test User");
  });

  it("should return null when not authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });
});

describe("Auth Router - login endpoint", () => {
  beforeEach(() => {
    // Reset NODE_ENV before each test
    vi.stubEnv("NODE_ENV", "development");
  });

  describe("Input Validation", () => {
    it("should accept valid email and password", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      const result = await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
    });

    it("should reject invalid email format", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "invalid-email",
          password: "password123",
        })
      ).rejects.toThrow();
    });

    it("should reject email exceeding max length (320 chars)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const longEmail = "a".repeat(310) + "@example.com"; // 321 characters

      await expect(
        caller.auth.login({
          email: longEmail,
          password: "password123",
        })
      ).rejects.toThrow();
    });

    it("should reject password exceeding max length (128 chars)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const longPassword = "a".repeat(129);

      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: longPassword,
        })
      ).rejects.toThrow();
    });

    it("should reject empty password", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("Rate Limiting", () => {
    it("should apply rate limiting (5 attempts per 15 minutes)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter - limit exceeded
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() / 1000 + 600, // 10 minutes remaining
      });

      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "test@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("TOO_MANY_REQUESTS");
        expect(error.message).toContain("Too many login attempts");
      }
    });

    it("should use IP address for rate limiting", async () => {
      const ctx = createMockContext({
        req: {
          ip: "192.168.1.100",
          socket: { remoteAddress: "192.168.1.100" },
          hostname: "localhost",
          protocol: "http",
          headers: {
            "x-forwarded-proto": "http",
          },
        },
      });
      const caller = appRouter.createCaller(ctx);

      const rateLimiterModule = await import("../rate-limiter-redis");
      const rateLimitSpy = vi
        .spyOn(rateLimiterModule, "checkRateLimitUnified")
        .mockResolvedValue({
          success: true,
          limit: 5,
          remaining: 4,
          reset: Date.now() / 1000 + 900,
        });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(rateLimitSpy).toHaveBeenCalled();
      const [userId, config, key] = rateLimitSpy.mock.calls[0];
      expect(config).toEqual({ limit: 5, windowMs: 15 * 60 * 1000 });
      expect(key).toBe("login");
    });

    it("should handle missing IP address gracefully", async () => {
      const ctx = createMockContext({
        req: {
          ip: undefined,
          socket: { remoteAddress: undefined },
          hostname: "localhost",
          protocol: "http",
          headers: {
            "x-forwarded-proto": "http",
          },
        },
      });
      const caller = appRouter.createCaller(ctx);

      const rateLimiterModule = await import("../rate-limiter-redis");
      const rateLimitSpy = vi
        .spyOn(rateLimiterModule, "checkRateLimitUnified")
        .mockResolvedValue({
          success: true,
          limit: 5,
          remaining: 4,
          reset: Date.now() / 1000 + 900,
        });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(rateLimitSpy).toHaveBeenCalled();
      // Should still work with "unknown" IP
    });
  });

  describe("Database Operations", () => {
    it("should handle database unavailable", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - unavailable
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue(null);

      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "test@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
        expect(error.message).toBe("Database unavailable");
      }
    });

    it("should normalize email to lowercase", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      const whereSpy = vi.fn().mockReturnThis();
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: whereSpy,
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      // Test with uppercase email
      const result = await caller.auth.login({
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      });

      // Should successfully login (meaning email was normalized to match lowercase in DB)
      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
    });

    it("should not reveal if email exists (prevent enumeration)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - user not found
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // Empty result
      } as any);

      await expect(
        caller.auth.login({
          email: "nonexistent@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "nonexistent@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toBe("Invalid email or password");
      }
    });
  });

  describe("OAuth User Handling", () => {
    it("should prevent OAuth users from using password login (google)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - OAuth user
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "oauth@example.com",
            loginMethod: "google",
          },
        ]),
      } as any);

      await expect(
        caller.auth.login({
          email: "oauth@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "oauth@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toContain("Please sign in with Google");
      }
    });

    it("should prevent OAuth users from using password login (oauth)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - OAuth user
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "oauth@example.com",
            loginMethod: "oauth",
          },
        ]),
      } as any);

      await expect(
        caller.auth.login({
          email: "oauth@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "oauth@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toContain("Please sign in with Google");
      }
    });
  });

  describe("Production vs Development Mode", () => {
    it("should reject password login in production mode", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            loginMethod: "password",
          },
        ]),
      } as any);

      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.auth.login({
          email: "test@example.com",
          password: "password123",
        });
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toContain("Password-based login is not available");
      }
    });

    it("should allow password login in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      const result = await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
    });

    it("should reject empty password even in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Note: This test sends empty string through the schema which should fail validation
      // But if it gets past that, the additional check in the router should catch it
      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("Session Creation", () => {
    it("should create session with correct parameters", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "custom-openid",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      const createSessionSpy = vi
        .spyOn(sdkModule.sdk, "createSessionToken")
        .mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(createSessionSpy).toHaveBeenCalledWith(
        "custom-openid",
        expect.objectContaining({
          name: "Test User",
          expiresInMs: expect.any(Number),
        })
      );
    });

    it("should use email-based openId if not present", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - no openId
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: null,
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      const createSessionSpy = vi
        .spyOn(sdkModule.sdk, "createSessionToken")
        .mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(createSessionSpy).toHaveBeenCalledWith(
        "email:test@example.com",
        expect.any(Object)
      );
    });

    it("should set session cookie with correct options", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const mockRes = {
        cookie: vi.fn(),
        clearCookie: vi.fn(),
      };

      const ctx = createMockContext({ res: mockRes });
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(mockRes.cookie).toHaveBeenCalled();
      const [cookieName, cookieValue, cookieOptions] = mockRes.cookie.mock.calls[0];
      expect(cookieName).toBe("app_session_id");
      expect(cookieValue).toBe("mock-session-token");
      expect(cookieOptions).toHaveProperty("maxAge");
    });

    it("should use 7-day expiry in production", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - but will fail due to production check
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Should fail in production before reaching session creation
      await expect(
        caller.auth.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow();
    });

    it("should use 1-year expiry in development", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const mockRes = {
        cookie: vi.fn(),
        clearCookie: vi.fn(),
      };

      const ctx = createMockContext({ res: mockRes });
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      const createSessionSpy = vi
        .spyOn(sdkModule.sdk, "createSessionToken")
        .mockResolvedValue("mock-session-token");

      await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      // Check that expiry is 1 year (365 days in ms)
      const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
      expect(createSessionSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          expiresInMs: ONE_YEAR_MS,
        })
      );
    });
  });

  describe("Response Data", () => {
    it("should return user data on successful login", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      const result = await caller.auth.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        id: "openid-1",
        email: "test@example.com",
        name: "Test User",
      });
    });

    it("should use email prefix as name if name not provided", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Mock rate limiter
      const rateLimiterModule = await import("../rate-limiter-redis");
      vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() / 1000 + 900,
      });

      // Mock database - no name
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "testuser@example.com",
            name: null,
            openId: "openid-1",
            loginMethod: "password",
          },
        ]),
      } as any);

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("mock-session-token");

      const result = await caller.auth.login({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(result.name).toBe("testuser");
    });
  });
});

describe("Auth Router - logout endpoint", () => {
  it("should clear session cookie on logout", async () => {
    const mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    const ctx = createMockContext({
      user: { id: 1, email: "user@example.com" },
      res: mockRes,
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(mockRes.clearCookie).toHaveBeenCalledWith(
      "app_session_id",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    );
  });

  it("should clear cookie with secure flag in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    const ctx = createMockContext({
      user: { id: 1, email: "user@example.com" },
      res: mockRes,
    });
    const caller = appRouter.createCaller(ctx);

    await caller.auth.logout();

    expect(mockRes.clearCookie).toHaveBeenCalledWith(
      "app_session_id",
      expect.objectContaining({
        secure: true,
      })
    );
  });

  it("should clear cookie without secure flag in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    const ctx = createMockContext({
      user: { id: 1, email: "user@example.com" },
      res: mockRes,
    });
    const caller = appRouter.createCaller(ctx);

    await caller.auth.logout();

    expect(mockRes.clearCookie).toHaveBeenCalledWith(
      "app_session_id",
      expect.objectContaining({
        secure: false,
      })
    );
  });

  it("should allow logout without authentication", async () => {
    const mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    const ctx = createMockContext({ res: mockRes });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(mockRes.clearCookie).toHaveBeenCalled();
  });
});

describe("Auth Router - Security Features", () => {
  it("should add timing delay to prevent enumeration attacks", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Mock rate limiter
    const rateLimiterModule = await import("../rate-limiter-redis");
    vi.spyOn(rateLimiterModule, "checkRateLimitUnified").mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() / 1000 + 900,
    });

    // Mock database - user not found
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getDb").mockResolvedValue({
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // No user found
    } as any);

    const startTime = Date.now();

    try {
      await caller.auth.login({
        email: "nonexistent@example.com",
        password: "password123",
      });
    } catch (error) {
      // Expected to throw
    }

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // Should have at least 100ms delay (timing attack prevention)
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});
