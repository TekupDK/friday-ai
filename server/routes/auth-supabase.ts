import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import express, { Request, Response } from "express";

import { users } from "../../drizzle/schema";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { logger } from "../_core/logger";
import { sdk } from "../_core/sdk";
import * as db from "../db";

import { COOKIE_NAME, ONE_YEAR_MS, SEVEN_DAYS_MS } from "@shared/const";
import type { LoginMethod } from "@shared/types";

const router = express.Router();

router.post("/complete", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      logger.warn("[AUTH/SUPABASE] Missing Authorization token in request headers");
      return res.status(401).json({ error: "Missing Authorization token" });
    }

    if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
      return res
        .status(500)
        .json({ error: "Supabase not configured on server" });
    }

    const admin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data?.user) {
      logger.warn({
        error: error ? error.message || error : undefined,
        userId: data?.user?.id,
      }, "[AUTH/SUPABASE] Supabase admin.getUser failed");
      return res.status(401).json({ error: "Invalid Supabase token" });
    }

    const user = data.user;
    const openId = user.id;
    const name =
      (user.user_metadata &&
        (user.user_metadata.full_name || user.user_metadata.name)) ||
      user.email ||
      "Google User";

    // Check if there's a pre-created user with pending:email format
    const normalizedEmail = user.email?.toLowerCase() || null;
    if (normalizedEmail) {
      const pendingOpenId = `pending:${normalizedEmail}`;
      const existingUser = await db.getUserByOpenId(pendingOpenId);
      
      if (existingUser) {
        // User was pre-created by admin - update with actual Google openId
        // Delete the pending user and create/update with real openId
        const dbInstance = await db.getDb();
        if (dbInstance) {
          // Delete pending user
          await dbInstance.delete(users).where(eq(users.openId, pendingOpenId));
        }
        
        // Create user with actual Google openId, preserving role and other settings
        await db.upsertUser({
          openId,
          name: existingUser.name || name,
          email: normalizedEmail,
          loginMethod: "google" as LoginMethod,
          role: existingUser.role, // Preserve role set by admin
          lastSignedIn: new Date().toISOString(),
        });
      } else {
        // Normal flow - user logging in for first time
        await db.upsertUser({
          openId,
          name,
          email: normalizedEmail,
          loginMethod: "google" as LoginMethod,
          lastSignedIn: new Date().toISOString(),
        });
      }
    } else {
      // No email - fallback to normal flow
      await db.upsertUser({
        openId,
        name,
        email: null,
        loginMethod: "google" as LoginMethod,
        lastSignedIn: new Date().toISOString(),
      });
    }

    // ✅ SECURITY FIX: Use 7-day expiry in production, 1 year in development
    const sessionExpiry = ENV.isProduction ? SEVEN_DAYS_MS : ONE_YEAR_MS;
    const sessionToken = await sdk.createSessionToken(openId, {
      name,
      expiresInMs: sessionExpiry,
    });

    const cookieOpts = getSessionCookieOptions(req);
    // Set cookie and log options for easier debugging during development
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOpts,
      maxAge: sessionExpiry,
    });
    logger.info({
      cookieName: COOKIE_NAME,
      sameSite: cookieOpts.sameSite,
      secure: cookieOpts.secure,
      httpOnly: cookieOpts.httpOnly,
      path: cookieOpts.path,
    }, "[AUTH/SUPABASE] Session cookie set successfully");

    return res.json({ ok: true });
  } catch (err) {
    logger.error({ error: err }, "[AUTH/SUPABASE] Auth completion error");
    return res.status(500).json({ error: "Supabase auth completion failed" });
  }
});

export default router;
