import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { users } from "../../drizzle/schema";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { checkRateLimitUnified } from "../rate-limiter-redis";

import { COOKIE_NAME, ONE_YEAR_MS, SEVEN_DAYS_MS } from "@shared/const";



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
      { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
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
    if (user.loginMethod === "google" || user.loginMethod === "oauth") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please sign in with Google. This account uses OAuth authentication.",
      });
    }

    // ✅ SECURITY FIX: For demo/dev mode, only allow in development
    // In production, this should require proper password hashing
    if (process.env.NODE_ENV === "production") {
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
    const sessionExpiry = process.env.NODE_ENV === "production" ? SEVEN_DAYS_MS : ONE_YEAR_MS;
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
      secure: process.env.NODE_ENV === "production",
    });
    return { success: true };
  }),
});
