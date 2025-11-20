import type { Express, Request, Response } from "express";

import * as db from "../db";

import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { logger } from "./logger";
import { sdk } from "./sdk";

import { COOKIE_NAME, ONE_YEAR_MS, SEVEN_DAYS_MS } from "@shared/const";

// Phase 7.1: Rolling session refresh window (7 days)
const ROLLING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Development login endpoint - Auto-login as OWNER
  // Supports both browser redirect and test mode (JSON response)
  app.get("/api/auth/login", async (req: Request, res: Response) => {
    // ✅ SECURITY FIX: Use logger instead of console.log
    logger.debug({ isProduction: ENV.isProduction }, "[AUTH] Dev-login endpoint called");

    // ✅ SECURITY FIX: Disable dev login endpoint in production
    // This endpoint allows unauthenticated access and should only be used in development
    if (ENV.isProduction) {
      logger.warn("[AUTH] Dev login endpoint blocked in production");
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Check if test mode (return JSON instead of redirect)
    const isTestMode = req.query.mode === "test" || req.query.test === "true";
    const userAgent = req.headers["user-agent"] || "";
    const isTestEnvironment =
      userAgent.includes("vitest") ||
      userAgent.includes("jsdom") ||
      req.headers["x-test-mode"] === "true";

    const ownerOpenId = ENV.ownerOpenId || "owner-friday-ai-dev";

    try {
      // Validate required environment variables
      if (!ENV.cookieSecret) {
        throw new Error(
          "JWT_SECRET is not configured. Set JWT_SECRET in .env file."
        );
      }
      if (!ENV.appId) {
        throw new Error(
          "VITE_APP_ID is not configured. Set VITE_APP_ID in .env file."
        );
      }
      if (!ownerOpenId) {
        throw new Error("OWNER_OPEN_ID is not configured.");
      }

      // Get or create OWNER user
      let user = await db.getUserByOpenId(ownerOpenId);

      if (!user) {
        // Create OWNER user if it doesn't exist
        // Role defaults to "user" in schema, but can be manually updated to "admin" in DB
        await db.upsertUser({
          openId: ownerOpenId,
          name: "Jonas",
          email: "jonas@rendetalje.dk",
          loginMethod: "dev",
          lastSignedIn: new Date().toISOString(),
        });
        user = await db.getUserByOpenId(ownerOpenId);
      }

      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(ownerOpenId, {
        name: user.name || "Jonas",
        expiresInMs: ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS,
      });

      // Set cookie with proper options
      // ✅ SECURITY FIX: Use getSessionCookieOptions for consistent security settings
      const cookieOptions = getSessionCookieOptions(req);
      const finalCookieOptions = {
        ...cookieOptions,
        maxAge: ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS,
      };
      res.cookie(COOKIE_NAME, sessionToken, finalCookieOptions);

      // ✅ SECURITY FIX: Use logger (redacts cookie value)
      logger.info({
        cookieName: COOKIE_NAME,
        sameSite: finalCookieOptions.sameSite,
        secure: finalCookieOptions.secure,
        httpOnly: finalCookieOptions.httpOnly,
        maxAge: finalCookieOptions.maxAge,
        domain: finalCookieOptions.domain,
        path: finalCookieOptions.path,
      }, "[AUTH] Session cookie set successfully");

      // Return JSON in test mode, redirect otherwise
      if (isTestMode || isTestEnvironment) {
        return res.status(200).json({
          success: true,
          message: "Login successful",
          cookieName: COOKIE_NAME,
          cookieValue: sessionToken,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
          },
        });
      }

      // For browser mode: Return HTML with client-side redirect
      // This ensures cookie is set before redirect happens
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Logging in...</title>
            <meta http-equiv="refresh" content="0; url=/">
          </head>
          <body>
            <p>Logging in... Redirecting to home page.</p>
            <script>window.location.href = "/";</script>
          </body>
        </html>
      `);
    } catch (error) {
      // ✅ SECURITY FIX: Use logger (redacts error details)
      logger.error({ error }, "[Auth] Dev login failed");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const statusCode = errorMessage.includes("session") ? 500 : 500;
      res.status(statusCode).json({
        error: "Login failed",
        details:
          !ENV.isProduction ? errorMessage : undefined,
      });
    }
  });

  // Phase 7.1: Silent session refresh endpoint
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    // ✅ SECURITY FIX: Use logger
    logger.debug("[Auth] Session refresh endpoint called");

    try {
      // Extract session cookie
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader
        ? cookieHeader.split(";").reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split("=");
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>
          )
        : {};

      const sessionCookie = cookies[COOKIE_NAME];
      if (!sessionCookie) {
        return res.status(401).json({
          error: "No session cookie",
          refreshed: false,
        });
      }

      // Verify session and check expiration
      const sessionData = await sdk.verifySessionWithExp(sessionCookie);
      if (!sessionData) {
        return res.status(401).json({
          error: "Invalid session",
          refreshed: false,
        });
      }

      // Check if we should refresh (within rolling window)
      const shouldRefresh = sessionData.remainingMs < ROLLING_WINDOW_MS;

      if (!shouldRefresh) {
        return res.json({
          refreshed: false,
          remainingMs: sessionData.remainingMs,
          message: "Session still valid",
        });
      }

      // Get user for token creation
      const user = await db.getUserByOpenId(sessionData.openId);
      if (!user) {
        return res.status(401).json({
          error: "User not found",
          refreshed: false,
        });
      }

      // Create new session token
      const newSessionToken = await sdk.createSessionToken(sessionData.openId, {
        name: user.name || sessionData.name,
        expiresInMs: ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS,
      });

      // ✅ SECURITY FIX: Use getSessionCookieOptions for consistent security settings
      const cookieOptions = getSessionCookieOptions(req);
      const finalCookieOptions = {
        ...cookieOptions,
        maxAge: ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS,
      };

      res.cookie(COOKIE_NAME, newSessionToken, finalCookieOptions);

      // ✅ SECURITY FIX: Use logger (redacts openId if sensitive)
      logger.info({
        openId: sessionData.openId,
        oldRemainingMs: sessionData.remainingMs,
        newExpiry: "1 year",
      }, "[Auth] Session refreshed successfully");

      return res.json({
        refreshed: true,
        message: "Session refreshed",
      });
    } catch (error) {
      // ✅ SECURITY FIX: Use logger (redacts error details)
      logger.error({ error }, "[Auth] Session refresh failed");
      return res.status(500).json({
        error: "Refresh failed",
        refreshed: false,
      });
    }
  });

  // OAuth callback (for future OAuth integration if needed)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // OAuth callback not implemented yet (Manus removed)
    // This can be implemented for future OAuth providers
    res.status(501).json({ error: "OAuth callback not implemented" });
  });
}
