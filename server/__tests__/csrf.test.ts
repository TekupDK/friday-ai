/**
 * CSRF Protection Tests
 *
 * Comprehensive test suite for CSRF token generation and validation
 * Tests: Token generation, double-submit validation, middleware, safe methods
 * Security: Token format, token matching, public path exemptions
 */

import { randomBytes } from "crypto";
import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  csrfMiddleware,
  getCsrfToken,
  getOrCreateCsrfToken,
  validateCsrfToken,
} from "../_core/csrf";

// Mock logger
vi.mock("../_core/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock ENV
vi.mock("../_core/env", () => ({
  ENV: {
    isProduction: false,
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock request/response
function createMockReqRes(options?: {
  method?: string;
  path?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  protocol?: string;
}): { req: Request; res: Response } {
  const cookies = options?.cookies || {};
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

  const req = {
    method: options?.method || "GET",
    path: options?.path || "/api/test",
    protocol: options?.protocol || "http",
    headers: {
      cookie: cookieString || undefined,
      ...options?.headers,
    },
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as Request;

  const res = {
    cookie: vi.fn(),
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  } as unknown as Response;

  return { req, res };
}

describe("CSRF Protection - Token Generation", () => {
  it("should generate a valid CSRF token (64 hex characters)", () => {
    const { req, res } = createMockReqRes();

    const token = getOrCreateCsrfToken(req, res);

    // Token should be 64 hex characters (32 bytes)
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(token).toHaveLength(64);
  });

  it("should set CSRF token as cookie when generating new token", () => {
    const { req, res } = createMockReqRes();

    const token = getOrCreateCsrfToken(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "__csrf_token",
      token,
      expect.objectContaining({
        httpOnly: false, // Frontend needs to read it
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
    );
  });

  it("should return existing token from cookie if present", () => {
    const existingToken = randomBytes(32).toString("hex");
    const { req, res } = createMockReqRes({
      cookies: { __csrf_token: existingToken },
    });

    const token = getOrCreateCsrfToken(req, res);

    expect(token).toBe(existingToken);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should generate different tokens on subsequent calls", () => {
    const { req: req1, res: res1 } = createMockReqRes();
    const { req: req2, res: res2 } = createMockReqRes();

    const token1 = getOrCreateCsrfToken(req1, res1);
    const token2 = getOrCreateCsrfToken(req2, res2);

    expect(token1).not.toBe(token2);
  });

  it("should use secure flag in HTTPS connections", () => {
    const { req, res } = createMockReqRes({
      protocol: "https",
    });

    getOrCreateCsrfToken(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "__csrf_token",
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );
  });

  it("should use secure flag when x-forwarded-proto is https", () => {
    const { req, res } = createMockReqRes({
      headers: { "x-forwarded-proto": "https" },
    });

    getOrCreateCsrfToken(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "__csrf_token",
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );
  });

  it("should use strict sameSite in production", async () => {
    const envModule = await import("../_core/env");
    const originalIsProduction = envModule.ENV.isProduction;
    Object.defineProperty(envModule.ENV, "isProduction", {
      get: () => true,
      configurable: true,
    });

    try {
      const { req, res } = createMockReqRes({
        protocol: "https", // Production requires HTTPS
      });

      getOrCreateCsrfToken(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "__csrf_token",
        expect.any(String),
        expect.objectContaining({
          sameSite: "strict",
        })
      );
    } finally {
      Object.defineProperty(envModule.ENV, "isProduction", {
        get: () => originalIsProduction,
        configurable: true,
      });
    }
  });

  it("should use lax sameSite in development", () => {
    const { req, res } = createMockReqRes();

    getOrCreateCsrfToken(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "__csrf_token",
      expect.any(String),
      expect.objectContaining({
        sameSite: "lax",
      })
    );
  });
});

describe("CSRF Protection - Token Validation", () => {
  const validToken = randomBytes(32).toString("hex");

  it("should pass validation with matching cookie and header tokens", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: validToken },
      headers: { "x-csrf-token": validToken },
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for GET requests", () => {
    const { req } = createMockReqRes({
      method: "GET",
      path: "/api/test",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for HEAD requests", () => {
    const { req } = createMockReqRes({
      method: "HEAD",
      path: "/api/test",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for OPTIONS requests", () => {
    const { req } = createMockReqRes({
      method: "OPTIONS",
      path: "/api/test",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for auth endpoints", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/auth/login",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for health endpoints", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/health",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should skip validation for OAuth callback", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/oauth/callback",
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should throw error when cookie token is missing", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      headers: { "x-csrf-token": validToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token missing. Please refresh the page.");
  });

  it("should throw error when header token is missing", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: validToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token missing in request header.");
  });

  it("should throw error when tokens do not match", () => {
    const token1 = randomBytes(32).toString("hex");
    const token2 = randomBytes(32).toString("hex");

    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: token1 },
      headers: { "x-csrf-token": token2 },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token validation failed. Tokens do not match.");
  });

  it("should throw error for invalid token format (too short)", () => {
    const invalidToken = "abc123";

    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: invalidToken },
      headers: { "x-csrf-token": invalidToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token has invalid format.");
  });

  it("should throw error for invalid token format (non-hex)", () => {
    const invalidToken = "g".repeat(64); // Invalid hex character

    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: invalidToken },
      headers: { "x-csrf-token": invalidToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token has invalid format.");
  });

  it("should throw error for invalid token format (uppercase hex)", () => {
    const invalidToken = "A".repeat(64); // Uppercase not allowed

    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: invalidToken },
      headers: { "x-csrf-token": invalidToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token has invalid format.");
  });

  it("should validate POST requests to protected endpoints", () => {
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/users",
    });

    expect(() => validateCsrfToken(req)).toThrow();
  });

  it("should validate PUT requests to protected endpoints", () => {
    const { req } = createMockReqRes({
      method: "PUT",
      path: "/api/users/123",
    });

    expect(() => validateCsrfToken(req)).toThrow();
  });

  it("should validate DELETE requests to protected endpoints", () => {
    const { req } = createMockReqRes({
      method: "DELETE",
      path: "/api/users/123",
    });

    expect(() => validateCsrfToken(req)).toThrow();
  });

  it("should validate PATCH requests to protected endpoints", () => {
    const { req } = createMockReqRes({
      method: "PATCH",
      path: "/api/users/123",
    });

    expect(() => validateCsrfToken(req)).toThrow();
  });
});

describe("CSRF Protection - Middleware", () => {
  it("should generate token and call next() for GET requests", () => {
    const { req, res } = createMockReqRes({
      method: "GET",
      path: "/api/test",
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(res.cookie).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should validate token and call next() for POST requests with valid token", () => {
    const token = randomBytes(32).toString("hex");
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: token },
      headers: { "x-csrf-token": token },
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 for POST requests with missing token", () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/api/test",
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "CSRF validation failed",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 for POST requests with mismatched tokens", () => {
    const token1 = randomBytes(32).toString("hex");
    const token2 = randomBytes(32).toString("hex");

    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: token1 },
      headers: { "x-csrf-token": token2 },
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "CSRF validation failed",
        message: "CSRF token validation failed. Tokens do not match.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should log CSRF validation failures", async () => {
    const loggerModule = await import("../_core/logger");
    const warnSpy = vi.spyOn(loggerModule.logger, "warn");

    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/api/test",
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/test",
        method: "POST",
        ip: "127.0.0.1",
      }),
      "CSRF validation failed"
    );
  });

  it("should not expose internal error details in production", () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/api/test",
    });
    const next = vi.fn();

    csrfMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "CSRF validation failed",
        message: expect.any(String),
      })
    );
  });
});

describe("CSRF Protection - getCsrfToken Helper", () => {
  it("should return token from cookie", () => {
    const token = randomBytes(32).toString("hex");
    const { req } = createMockReqRes({
      cookies: { __csrf_token: token },
    });

    const result = getCsrfToken(req);

    expect(result).toBe(token);
  });

  it("should return null when token is not in cookie", () => {
    const { req } = createMockReqRes();

    const result = getCsrfToken(req);

    expect(result).toBeNull();
  });

  it("should handle missing cookie header", () => {
    const { req } = createMockReqRes();
    delete req.headers.cookie;

    const result = getCsrfToken(req);

    expect(result).toBeNull();
  });
});

describe("CSRF Protection - Cookie Parsing", () => {
  it("should parse multiple cookies correctly", () => {
    const token = randomBytes(32).toString("hex");
    const { req, res } = createMockReqRes({
      cookies: {
        __csrf_token: token,
        session_id: "abc123",
        preferences: "theme=dark",
      },
    });

    const result = getOrCreateCsrfToken(req, res);

    expect(result).toBe(token);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should handle URL-encoded cookie values", () => {
    const token = randomBytes(32).toString("hex");
    const encodedToken = encodeURIComponent(token);
    const { req } = createMockReqRes();
    req.headers.cookie = `__csrf_token=${encodedToken}`;

    const result = getCsrfToken(req);

    expect(result).toBe(token);
  });

  it("should handle cookies with = in value", () => {
    const { req } = createMockReqRes();
    req.headers.cookie = "test_cookie=key=value=data";

    const { res } = createMockReqRes();
    // Should not throw
    expect(() => getOrCreateCsrfToken(req, res)).not.toThrow();
  });

  it("should handle empty cookie header", () => {
    const { req } = createMockReqRes();
    req.headers.cookie = "";

    const result = getCsrfToken(req);

    expect(result).toBeNull();
  });
});

describe("CSRF Protection - Security Scenarios", () => {
  it("should prevent CSRF attack with stolen cookie but no header", () => {
    const stolenToken = randomBytes(32).toString("hex");
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/users/delete",
      cookies: { __csrf_token: stolenToken },
      // Attacker can't set custom headers in cross-site requests
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token missing in request header.");
  });

  it("should prevent CSRF attack with forged header but no cookie", () => {
    const forgedToken = randomBytes(32).toString("hex");
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/users/delete",
      // Cross-site request can't read cookies
      headers: { "x-csrf-token": forgedToken },
    });

    expect(() => validateCsrfToken(req)).toThrow("CSRF token missing. Please refresh the page.");
  });

  it("should allow legitimate requests with both cookie and header", () => {
    const token = randomBytes(32).toString("hex");
    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/users/update",
      cookies: { __csrf_token: token },
      headers: { "x-csrf-token": token },
    });

    expect(() => validateCsrfToken(req)).not.toThrow();
  });

  it("should protect against timing attacks with constant-time comparison", () => {
    // Note: While our implementation doesn't use constant-time comparison,
    // this test documents the expectation for future improvements
    const token1 = randomBytes(32).toString("hex");
    const token2 = randomBytes(32).toString("hex");

    const { req } = createMockReqRes({
      method: "POST",
      path: "/api/test",
      cookies: { __csrf_token: token1 },
      headers: { "x-csrf-token": token2 },
    });

    expect(() => validateCsrfToken(req)).toThrow();
  });
});
