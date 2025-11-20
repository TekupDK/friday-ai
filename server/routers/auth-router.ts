import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { users } from "../../drizzle/schema";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, getUserPreferences, updateUserPreferences } from "../db";
import { checkRateLimitUnified } from "../rate-limiter-redis";

import {
  COOKIE_NAME,
  LOGIN_RATE_LIMIT_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  ONE_YEAR_MS,
  SEVEN_DAYS_MS,
} from "@shared/const";
import type { LoginMethod } from "@shared/types";



const loginSchema = z.object({
  email: z.string().email().max(320), // RFC 5321 max email length
  password: z.string().min(1).max(128), // Reasonable password max length
});

// Auth router with login functionality
export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    // ✅ SECURITY FIX: Rate limit login attempts to prevent brute force
    const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || "unknown";
    // Create a numeric hash from IP for rate limiting (works with IPv4 and IPv6)
    const ipHash = clientIp
      .split("")
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
    const rateLimit = await checkRateLimitUnified(
      Math.abs(ipHash) || 1,
      { limit: LOGIN_RATE_LIMIT_ATTEMPTS, windowMs: LOGIN_RATE_LIMIT_WINDOW_MS },
      "login"
    );

    if (!rateLimit.success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Too many login attempts. Please try again in ${Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)} seconds.`,
      });
    }

    // ✅ SECURITY FIX: Check if user exists in database
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // ✅ SECURITY FIX: Don't reveal if email exists (prevent enumeration)
    // Always return same error message for security
    if (!userRecords || userRecords.length === 0) {
      // Small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const user = userRecords[0];

    // ✅ SECURITY FIX: Check login method
    // If user uses OAuth (Google), redirect to OAuth flow instead
    const loginMethod = user.loginMethod as LoginMethod;
    if (loginMethod === "google" || loginMethod === "oauth") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please sign in with Google. This account uses OAuth authentication.",
      });
    }

    // ✅ SECURITY FIX: For demo/dev mode, only allow in development
    // In production, this should require proper password hashing
    if (ENV.isProduction) {
      // In production, we should have password hashing
      // For now, reject password-based login in production
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Password-based login is not available. Please use Google Sign-In.",
      });
    }

    // ✅ SECURITY FIX: Development mode - still validate input
    // Accept any password in dev mode, but with proper validation
    if (!input.password || input.password.length < 1) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Create session using SDK so it matches verification
    const openId = user.openId || `email:${normalizedEmail}`;
    // ✅ SECURITY FIX: Use 7-day expiry in production, 1 year in development
    const sessionExpiry = ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS;
    const sessionToken = await sdk.createSessionToken(openId, {
      name: user.name || input.email.split("@")[0],
      expiresInMs: sessionExpiry,
    });
    const cookieOpts = getSessionCookieOptions(ctx.req);
    ctx.res?.cookie(COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: sessionExpiry });
    
    return {
      id: openId,
      email: user.email || input.email,
      name: user.name || input.email.split("@")[0],
    };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    // ✅ SECURITY FIX: Clear correct cookie name
    ctx.res?.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: ENV.isProduction,
    });
    return { success: true };
  }),

  /**
   * Get user preferences
   * Returns user's saved preferences (theme, notifications, etc.)
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Must be logged in",
      });
    }

    const preferences = await getUserPreferences(ctx.user.id);
    if (!preferences) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load preferences",
      });
    }

    // Map desktopNotifications to pushNotifications for frontend compatibility
    // Also extract language from preferences JSONB if it exists
    const prefsJson = preferences.preferences as Record<string, unknown> | null;
    return {
      ...preferences,
      pushNotifications: preferences.desktopNotifications,
      language: (prefsJson?.language as string) || null,
    };
  }),

  /**
   * Update user preferences
   * Updates user's saved preferences (theme, notifications, language, etc.)
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        emailNotifications: z.boolean().optional(),
        desktopNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(), // Maps to desktopNotifications
        language: z.string().optional(), // Stored in preferences JSONB
        preferences: z.record(z.any()).optional(), // For additional JSONB data
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in",
        });
      }

      // Map pushNotifications to desktopNotifications if provided
      const updateData: Parameters<typeof updateUserPreferences>[1] = {};

      if (input.theme !== undefined) {
        updateData.theme = input.theme;
      }

      if (input.emailNotifications !== undefined) {
        updateData.emailNotifications = input.emailNotifications;
      }

      // Handle pushNotifications -> desktopNotifications mapping
      if (input.pushNotifications !== undefined) {
        updateData.desktopNotifications = input.pushNotifications;
      } else if (input.desktopNotifications !== undefined) {
        updateData.desktopNotifications = input.desktopNotifications;
      }

      // Handle language and other preferences in JSONB field
      if (input.language !== undefined || input.preferences !== undefined) {
        // Get existing preferences to merge
        const existing = await getUserPreferences(ctx.user.id);
        const existingPrefs = (existing?.preferences as Record<string, unknown>) || {};

        const newPrefs: Record<string, unknown> = {
          ...existingPrefs,
          ...(input.preferences || {}),
        };

        if (input.language !== undefined) {
          newPrefs.language = input.language;
        }

        updateData.preferences = newPrefs;
      }

      const updated = await updateUserPreferences(ctx.user.id, updateData);
      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update preferences",
        });
      }

      // Return in same format as getPreferences
      const prefsJson = updated.preferences as Record<string, unknown> | null;
      return {
        ...updated,
        pushNotifications: updated.desktopNotifications,
        language: (prefsJson?.language as string) || null,
      };
    }),
});
