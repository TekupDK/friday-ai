/**
 * Dev Login Endpoint Security Tests
 * 
 * Tests that the dev login endpoint is properly blocked in production
 * to prevent unauthorized access.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Request, Response } from "express";

// Create a mockable ENV object
const mockENV = {
  isProduction: false,
  ownerOpenId: "test-owner-id",
  cookieSecret: "test-secret",
  appId: "test-app-id",
};

// Mock modules
vi.mock("../_core/env", async () => {
  return {
    ENV: mockENV,
  };
});

const mockLogger = {
  debug: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

vi.mock("../_core/logger", () => ({
  logger: mockLogger,
}));

const mockSdk = {
  createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
};

vi.mock("../_core/sdk", () => ({
  sdk: mockSdk,
}));

const mockGetUserByOpenId = vi.fn().mockResolvedValue({
  id: 1,
  openId: "test-owner-id",
  name: "Test User",
  email: "test@example.com",
});

vi.mock("../db", () => ({
  getUserByOpenId: mockGetUserByOpenId,
}));

const mockGetSessionCookieOptions = vi.fn().mockReturnValue({
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
});

vi.mock("../_core/cookies", () => ({
  getSessionCookieOptions: mockGetSessionCookieOptions,
}));

describe("Dev Login Endpoint Security", () => {
  let registerOAuthRoutes: (app: any) => void;
  let mockApp: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    mockSdk.createSessionToken.mockResolvedValue("mock-session-token");
    mockGetUserByOpenId.mockResolvedValue({
      id: 1,
      openId: "test-owner-id",
      name: "Test User",
      email: "test@example.com",
    });

    // Setup mock Express app
    mockApp = {
      get: vi.fn((path: string, handler: (req: Request, res: Response) => void) => {
        if (path === "/api/auth/login") {
          mockApp.loginHandler = handler;
        }
      }),
      post: vi.fn(), // Mock post method for other routes
    };

    // Setup mock request
    mockReq = {
      query: {},
      headers: {
        "user-agent": "test-agent",
      },
      ip: "127.0.0.1",
      hostname: "localhost",
    };

    // Setup mock response
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    // Import after mocks are set up
    const oauthModule = await import("../_core/oauth");
    registerOAuthRoutes = oauthModule.registerOAuthRoutes;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Production Mode", () => {
    beforeEach(() => {
      // Set production mode
      mockENV.isProduction = true;
      registerOAuthRoutes(mockApp);
    });

    it("should block dev login endpoint in production", async () => {
      expect(mockApp.loginHandler).toBeDefined();

      await mockApp.loginHandler(mockReq as Request, mockRes as Response);

      // Should return 404
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Not found" });

      // Should NOT create session or set cookie
      const { sdk } = await import("../_core/sdk");
      expect(sdk.createSessionToken).not.toHaveBeenCalled();
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it("should log warning when blocked in production", async () => {
      await mockApp.loginHandler(mockReq as Request, mockRes as Response);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "[AUTH] Dev login endpoint blocked in production"
      );
    });

    it("should block even with test mode query params", async () => {
      mockReq.query = { mode: "test", test: "true" };

      await mockApp.loginHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Not found" });
    });

    it("should block even with test user agent", async () => {
      mockReq.headers = {
        "user-agent": "vitest",
        "x-test-mode": "true",
      };

      await mockApp.loginHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Not found" });
    });
  });

  describe("Development Mode", () => {
    beforeEach(() => {
      // Set development mode
      mockENV.isProduction = false;
      registerOAuthRoutes(mockApp);
    });

    it("should allow dev login endpoint in development", async () => {
      expect(mockApp.loginHandler).toBeDefined();

      await mockApp.loginHandler(mockReq as Request, mockRes as Response);

      // Should NOT return 404
      expect(mockRes.status).not.toHaveBeenCalledWith(404);
      expect(mockRes.json).not.toHaveBeenCalledWith({ error: "Not found" });

      // Should create session (mocked)
      // Note: This will be called if the handler completes successfully
      // We're just checking it's not blocked
    });
  });
});

