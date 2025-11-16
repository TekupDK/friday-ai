import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { createClient } from "@supabase/supabase-js";
import express, { Request, Response } from "express";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import * as db from "../db";

const router = express.Router();

router.post("/complete", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      console.warn(
        "[AUTH/SUPABASE] Missing Authorization token in request headers"
      );
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
      console.warn("[AUTH/SUPABASE] Supabase admin.getUser failed", {
        error: error ? error.message || error : undefined,
        user: data?.user?.id,
      });
      return res.status(401).json({ error: "Invalid Supabase token" });
    }

    const user = data.user;
    const openId = user.id;
    const name =
      (user.user_metadata &&
        (user.user_metadata.full_name || user.user_metadata.name)) ||
      user.email ||
      "Google User";

    await db.upsertUser({
      openId,
      name,
      email: user.email || null,
      loginMethod: "google",
      lastSignedIn: new Date().toISOString(),
    });

    const sessionToken = await sdk.createSessionToken(openId, {
      name,
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOpts = getSessionCookieOptions(req);
    // Set cookie and log options for easier debugging during development
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOpts,
      maxAge: ONE_YEAR_MS,
    });
    console.log("[AUTH/SUPABASE] Session cookie set:", {
      cookieName: COOKIE_NAME,
      sameSite: cookieOpts.sameSite,
      secure: cookieOpts.secure,
      httpOnly: cookieOpts.httpOnly,
      path: cookieOpts.path,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("[AUTH/SUPABASE] auth completion error:", err);
    return res.status(500).json({ error: "Supabase auth completion failed" });
  }
});

export default router;
