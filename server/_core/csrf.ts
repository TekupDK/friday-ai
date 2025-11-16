/**
 * CSRF Protection
 * 
 * Implements CSRF token generation and validation for state-changing operations.
 * Uses the double-submit cookie pattern for stateless validation.
 * 
 * Reference: OWASP CSRF Prevention Cheat Sheet
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import { randomBytes } from "crypto";
import type { Request, Response } from "express";
import { logger } from "./logger";
import { ENV } from "./env";

const CSRF_TOKEN_COOKIE_NAME = "__csrf_token";
const CSRF_TOKEN_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

/**
 * Generate a cryptographically secure CSRF token
 */
function generateToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Get or create CSRF token for a request
 * 
 * If token doesn't exist, generates a new one and sets it as a cookie.
 * Returns the token value.
 */
/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name && valueParts.length > 0) {
      cookies.set(name, decodeURIComponent(valueParts.join("=")));
    }
  });

  return cookies;
}

export function getOrCreateCsrfToken(req: Request, res: Response): string {
  // Parse cookies from header (cookie-parser may not be available)
  const cookieHeader = req.headers.cookie;
  const cookies = parseCookies(cookieHeader);
  
  // Check if token already exists in cookie
  const existingToken = cookies.get(CSRF_TOKEN_COOKIE_NAME);
  if (existingToken) {
    return existingToken;
  }

  // Generate new token
  const token = generateToken();
  
  // Set token as httpOnly cookie (prevents JavaScript access)
  // Note: We use httpOnly=false here because the frontend needs to read it
  // for the double-submit pattern. The token is still secure because:
  // 1. It's random and unpredictable
  // 2. It's validated against the header value
  // 3. SameSite=strict prevents cross-site access
  const isProduction = ENV.isProduction;
  const isSecure = req.protocol === "https" || 
    req.headers["x-forwarded-proto"] === "https";

  res.cookie(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false, // Frontend needs to read it
    secure: isSecure || isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  return token;
}

/**
 * Validate CSRF token from request
 * 
 * Uses double-submit cookie pattern:
 * 1. Token is stored in cookie (set by getOrCreateCsrfToken)
 * 2. Token is sent in header (X-CSRF-Token)
 * 3. Both must match for validation to pass
 * 
 * @throws Error if token is invalid
 */
export function validateCsrfToken(req: Request): void {
  // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (req.method && safeMethods.includes(req.method.toUpperCase())) {
    return;
  }

  // Skip CSRF validation for public endpoints (auth, health checks)
  const publicPaths = ["/api/auth/", "/api/health", "/api/oauth/callback"];
  const isPublicPath = publicPaths.some(path => req.path?.startsWith(path));
  if (isPublicPath) {
    return;
  }

  // ✅ SECURITY FIX: For tRPC, we validate all POST requests (both queries and mutations)
  // This is secure because:
  // 1. Frontend includes CSRF token in all tRPC requests (queries and mutations)
  // 2. SameSite=strict cookies prevent cross-site requests
  // 3. Queries can also expose sensitive data, so protecting them is good practice

  // Parse cookies from header
  const cookieHeader = req.headers.cookie;
  const cookies = parseCookies(cookieHeader);
  
  // Get token from cookie
  const cookieToken = cookies.get(CSRF_TOKEN_COOKIE_NAME);
  if (!cookieToken) {
    logger.warn({ path: req.path, method: req.method }, "CSRF: Missing token cookie");
    throw new Error("CSRF token missing. Please refresh the page.");
  }

  // Get token from header
  const headerToken = req.headers[CSRF_TOKEN_HEADER_NAME] as string | undefined;
  if (!headerToken) {
    logger.warn({ path: req.path, method: req.method }, "CSRF: Missing token header");
    throw new Error("CSRF token missing in request header.");
  }

  // Validate tokens match (double-submit pattern)
  if (cookieToken !== headerToken) {
    logger.warn({ path: req.path, method: req.method }, "CSRF: Token mismatch");
    throw new Error("CSRF token validation failed. Tokens do not match.");
  }

  // Additional validation: Check token format (64 hex characters)
  if (!/^[a-f0-9]{64}$/.test(cookieToken)) {
    logger.warn({ path: req.path, method: req.method }, "CSRF: Invalid token format");
    throw new Error("CSRF token has invalid format.");
  }
}

/**
 * Express middleware for CSRF protection
 * 
 * Validates CSRF token on all state-changing requests (POST, PUT, DELETE, PATCH).
 * Automatically generates and sets token cookie if missing.
 * 
 * Error handling:
 * - Logs all CSRF validation failures for security monitoring
 * - Returns 403 Forbidden with clear error message
 * - Uses safe error messages to prevent information leakage
 */
export function csrfMiddleware(req: Request, res: Response, next: () => void): void {
  try {
    // Always ensure token exists (generates if missing)
    getOrCreateCsrfToken(req, res);

    // Validate token for state-changing requests
    validateCsrfToken(req);

    next();
  } catch (error) {
    // Log CSRF validation failures for security monitoring
    logger.warn(
      {
        err: error,
        path: req.path,
        method: req.method,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
      "CSRF validation failed"
    );

    // Return 403 Forbidden with safe error message
    // Don't expose internal error details to prevent information leakage
    const safeMessage = error instanceof Error 
      ? error.message 
      : "CSRF validation failed. Please refresh the page and try again.";

    res.status(403).json({
      error: "CSRF validation failed",
      message: safeMessage,
    });
  }
}

/**
 * Get CSRF token for frontend
 * 
 * Returns the current CSRF token from cookie (for use in frontend).
 * Frontend should include this token in X-CSRF-Token header for all mutations.
 */
export function getCsrfToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  const cookies = parseCookies(cookieHeader);
  return cookies.get(CSRF_TOKEN_COOKIE_NAME) || null;
}

