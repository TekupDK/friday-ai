/**
 * OAuth Routes Tests
 *
 * Comprehensive test suite for OAuth authentication endpoints
 * Tests: Dev login, session refresh, OAuth callback
 * Security: Environment validation, cookie handling, session management
 */

import type { Express, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerOAuthRoutes } from "../_core/oauth";

// Mock dependencies
vi.mock("../_core/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn(),
    verifySessionWithExp: vi.fn(),
  },
}));

vi.mock("../db", () => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("../_core/env", () => ({
  ENV: {
    ownerOpenId: "owner-test-123",
    cookieSecret: "test-secret",
    appId: "test-app-id",
    isProduction: false,
  },
}));

vi.mock("../_core/cookies", () => ({
  getSessionCookieOptions: vi.fn(() => ({
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  })),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock app with route handlers
function createMockApp(): {
  app: Express;
  getHandlers: Map<string, any>;
  postHandlers: Map<string, any>;
} {
  const getHandlers = new Map();
  const postHandlers = new Map();

  const app = {
    get: vi.fn((path: string, handler: any) => {
      getHandlers.set(path, handler);
    }),
    post: vi.fn((path: string, handler: any) => {
      postHandlers.set(path, handler);
    }),
  } as unknown as Express;

  return { app, getHandlers, postHandlers };
}

// Helper to create mock request/response
function createMockReqRes(options?: {
  query?: Record<string, any>;
  headers?: Record<string, any>;
  cookies?: Record<string, string>;
}): { req: Request; res: Response } {
  const cookies = options?.cookies || {};
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

  const req = {
    query: options?.query || {},
    headers: {
      "user-agent": "test-agent",
      cookie: cookieString || undefined,
      ...options?.headers,
    },
    protocol: "http",
    hostname: "localhost",
  } as unknown as Request;

  const res = {
    cookie: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe("OAuth Routes - Dev Login Endpoint", () => {
  it("should register /api/auth/login endpoint", () => {
    const { app, getHandlers } = createMockApp();

    registerOAuthRoutes(app);

    expect(app.get).toHaveBeenCalledWith("/api/auth/login", expect.any(Function));
    expect(getHandlers.has("/api/auth/login")).toBe(true);
  });

  it("should create owner user and return JSON in test mode", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      query: { test: "true" },
    });

    // Mock db functions
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValueOnce(null);
    vi.spyOn(dbModule, "upsertUser").mockResolvedValue();
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValueOnce({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Login successful",
        cookieName: "app_session_id",
        cookieValue: "test-session-token",
        user: expect.objectContaining({
          openId: "owner-test-123",
          name: "Jonas",
          email: "jonas@rendetalje.dk",
        }),
      })
    );
  });

  it("should set session cookie with correct options", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      query: { test: "true" },
    });

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "app_session_id",
      "test-session-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: expect.any(Number),
      })
    );
  });

  it("should return HTML with redirect in browser mode", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      headers: { "user-agent": "Mozilla/5.0" },
    });

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining("window.location.href")
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining("Logging in...")
    );
  });

  it("should detect test mode from user-agent (vitest)", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      headers: { "user-agent": "vitest" },
    });

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should detect test mode from x-test-mode header", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      headers: { "x-test-mode": "true" },
    });

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it("should return 500 if JWT_SECRET is not configured", async () => {
    const envModule = await import("../_core/env");
    const originalSecret = envModule.ENV.cookieSecret;
    Object.defineProperty(envModule.ENV, "cookieSecret", {
      get: () => undefined,
      configurable: true,
    });

    try {
      const { app, getHandlers } = createMockApp();
      registerOAuthRoutes(app);

      const handler = getHandlers.get("/api/auth/login");
      const { req, res } = createMockReqRes({
        query: { test: "true" },
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Login failed",
        })
      );
    } finally {
      Object.defineProperty(envModule.ENV, "cookieSecret", {
        get: () => originalSecret,
        configurable: true,
      });
    }
  });

  it("should return 500 if VITE_APP_ID is not configured", async () => {
    const envModule = await import("../_core/env");
    const originalAppId = envModule.ENV.appId;
    Object.defineProperty(envModule.ENV, "appId", {
      get: () => undefined,
      configurable: true,
    });

    try {
      const { app, getHandlers } = createMockApp();
      registerOAuthRoutes(app);

      const handler = getHandlers.get("/api/auth/login");
      const { req, res } = createMockReqRes({
        query: { test: "true" },
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Login failed",
        })
      );
    } finally {
      Object.defineProperty(envModule.ENV, "appId", {
        get: () => originalAppId,
        configurable: true,
      });
    }
  });

  it("should return 500 if user creation fails", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      query: { test: "true" },
    });

    // Mock db to fail user creation
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue(null);
    vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Failed to create user",
      })
    );
  });

  it("should create user if not exists", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      query: { test: "true" },
    });

    // Mock db
    const dbModule = await import("../db");
    const getUserSpy = vi.spyOn(dbModule, "getUserByOpenId");
    const upsertUserSpy = vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

    getUserSpy.mockResolvedValueOnce(null); // First call - user doesn't exist
    getUserSpy.mockResolvedValueOnce({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("test-session-token");

    await handler(req, res);

    expect(upsertUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "owner-test-123",
        name: "Jonas",
        email: "jonas@rendetalje.dk",
        loginMethod: "dev",
      })
    );
  });

  it("should use production expiry (7 days) in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");

    try {
      const { app, getHandlers } = createMockApp();
      registerOAuthRoutes(app);

      const handler = getHandlers.get("/api/auth/login");
      const { req, res } = createMockReqRes({
        query: { test: "true" },
        headers: { "x-forwarded-proto": "https" },
      });
      req.protocol = "https";

      // Mock db
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
        id: 1,
        openId: "owner-test-123",
        name: "Jonas",
        email: "jonas@rendetalje.dk",
        role: "admin" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
        loginMethod: "dev",
      });

      // Mock SDK
      const sdkModule = await import("../_core/sdk");
      const createSessionSpy = vi
        .spyOn(sdkModule.sdk, "createSessionToken")
        .mockResolvedValue("test-session-token");

      await handler(req, res);

      const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;
      expect(createSessionSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          expiresInMs: SEVEN_DAYS_MS,
        })
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("should use development expiry (1 year) in development mode", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/auth/login");
    const { req, res } = createMockReqRes({
      query: { test: "true" },
    });

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    const createSessionSpy = vi
      .spyOn(sdkModule.sdk, "createSessionToken")
      .mockResolvedValue("test-session-token");

    await handler(req, res);

    const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
    expect(createSessionSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        expiresInMs: ONE_YEAR_MS,
      })
    );
  });
});

describe("OAuth Routes - Session Refresh Endpoint", () => {
  it("should register /api/auth/refresh endpoint", () => {
    const { app, postHandlers } = createMockApp();

    registerOAuthRoutes(app);

    expect(app.post).toHaveBeenCalledWith("/api/auth/refresh", expect.any(Function));
    expect(postHandlers.has("/api/auth/refresh")).toBe(true);
  });

  it("should return 401 if session cookie is missing", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "No session cookie",
        refreshed: false,
      })
    );
  });

  it("should return 401 if session is invalid", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes({
      cookies: { app_session_id: "invalid-token" },
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "verifySessionWithExp").mockResolvedValue(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid session",
        refreshed: false,
      })
    );
  });

  it("should not refresh if session is still valid (outside rolling window)", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes({
      cookies: { app_session_id: "valid-token" },
    });

    // Mock SDK - session has 10 days remaining (outside 7-day rolling window)
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "verifySessionWithExp").mockResolvedValue({
      openId: "owner-test-123",
      name: "Jonas",
      remainingMs: 10 * 24 * 60 * 60 * 1000, // 10 days
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshed: false,
        message: "Session still valid",
        remainingMs: expect.any(Number),
      })
    );
  });

  it("should refresh session if within rolling window (< 7 days)", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes({
      cookies: { app_session_id: "valid-token" },
    });

    // Mock SDK - session has 5 days remaining (within 7-day rolling window)
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "verifySessionWithExp").mockResolvedValue({
      openId: "owner-test-123",
      name: "Jonas",
      remainingMs: 5 * 24 * 60 * 60 * 1000, // 5 days
    });
    vi.spyOn(sdkModule.sdk, "createSessionToken").mockResolvedValue("new-session-token");

    // Mock db
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue({
      id: 1,
      openId: "owner-test-123",
      name: "Jonas",
      email: "jonas@rendetalje.dk",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "dev",
    });

    await handler(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "app_session_id",
      "new-session-token",
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshed: true,
        message: "Session refreshed",
      })
    );
  });

  it("should return 401 if user not found during refresh", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes({
      cookies: { app_session_id: "valid-token" },
    });

    // Mock SDK
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "verifySessionWithExp").mockResolvedValue({
      openId: "owner-test-123",
      name: "Jonas",
      remainingMs: 5 * 24 * 60 * 60 * 1000,
    });

    // Mock db - user not found
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getUserByOpenId").mockResolvedValue(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "User not found",
        refreshed: false,
      })
    );
  });

  it("should return 500 on refresh errors", async () => {
    const { app, postHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = postHandlers.get("/api/auth/refresh");
    const { req, res } = createMockReqRes({
      cookies: { app_session_id: "valid-token" },
    });

    // Mock SDK to throw error
    const sdkModule = await import("../_core/sdk");
    vi.spyOn(sdkModule.sdk, "verifySessionWithExp").mockRejectedValue(
      new Error("Verification failed")
    );

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Refresh failed",
        refreshed: false,
      })
    );
  });
});

describe("OAuth Routes - OAuth Callback Endpoint", () => {
  it("should register /api/oauth/callback endpoint", () => {
    const { app, getHandlers } = createMockApp();

    registerOAuthRoutes(app);

    expect(app.get).toHaveBeenCalledWith("/api/oauth/callback", expect.any(Function));
    expect(getHandlers.has("/api/oauth/callback")).toBe(true);
  });

  it("should return 400 if code is missing", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/oauth/callback");
    const { req, res } = createMockReqRes({
      query: { state: "test-state" },
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "code and state are required",
      })
    );
  });

  it("should return 400 if state is missing", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/oauth/callback");
    const { req, res } = createMockReqRes({
      query: { code: "test-code" },
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "code and state are required",
      })
    );
  });

  it("should return 501 (not implemented) with valid code and state", async () => {
    const { app, getHandlers } = createMockApp();
    registerOAuthRoutes(app);

    const handler = getHandlers.get("/api/oauth/callback");
    const { req, res } = createMockReqRes({
      query: {
        code: "test-code",
        state: "test-state",
      },
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "OAuth callback not implemented",
      })
    );
  });
});
