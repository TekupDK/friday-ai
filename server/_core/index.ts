import "dotenv/config";
import { createServer } from "http";
import net from "net";

import * as Sentry from "@sentry/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import * as db from "../db";
import { startDocsService } from "../docs/service";
import * as leadDb from "../lead-db";
import { appRouter } from "../routers";

import { createContext } from "./context";
import { ENV } from "./env";
import { logger } from "./logger";
import { registerOAuthRoutes } from "./oauth";
import { serveStatic, setupVite } from "./vite";

// Initialize Sentry error tracking (before any other imports)
// Note: Express integration will be set up in startServer() after app is created
if (ENV.sentryEnabled && ENV.sentryDsn) {
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.sentryEnvironment,
    tracesSampleRate: ENV.sentryTracesSampleRate,
    integrations: [
      // Express integration is automatically enabled in v10
      Sentry.expressIntegration(),
    ],
    // Note: captureUnhandledRejections and captureUncaughtExceptions are enabled by default in v10
  });
  logger.info("[Sentry] Error tracking initialized");
} else {
  logger.info("[Sentry] Error tracking disabled (SENTRY_ENABLED=false or SENTRY_DSN not set)");
}

/**
 * Check if historical data import is needed and run it automatically
 */
async function runAutoImportIfNeeded() {
  try {
    // Get the owner user (created via dev-login or OAuth)
    const ownerUser = await db.getUserByOpenId(ENV.ownerOpenId);

    if (!ownerUser) {
      logger.info(
        "[Auto-Import] No owner user found, skipping import (user needs to login first)"
      );
      return;
    }

    // Check if user already has leads
    const hasLeads = await leadDb.hasUserLeads(ownerUser.id);

    if (hasLeads) {
      logger.info(
        "[Auto-Import] User already has leads, skipping historical import"
      );
      return;
    }

    logger.info(
      "[Auto-Import] No leads found, starting historical data import from July 2025..."
    );

    // Import historical data
    const { importHistoricalData } = await import("../import-historical-data");
    const fromDate = new Date("2025-07-01");
    const result = await importHistoricalData(ownerUser.id, fromDate);

    logger.info(
      `[Auto-Import] ✅ Import complete! Created ${result.leadsCreated} leads and ${result.customersCreated} customer profiles`
    );

    if (result.errors.length > 0) {
      logger.warn(
        `[Auto-Import] ⚠️  ${result.errors.length} errors occurred during import`
      );
      result.errors
        .slice(0, 5)
        .forEach(error => logger.warn({ err: error }, `[Auto-Import] Error`));
    }
  } catch (error) {
    logger.error(
      { err: error },
      "[Auto-Import] ❌ Error during automatic import"
    );
    // Don't throw - server should still start even if import fails
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Sentry Express integration
  // In Sentry v10, Express integration is automatically enabled via expressIntegration() in Sentry.init()
  // No additional middleware needed - the integration handles request/response tracking automatically

  // Security headers via Helmet
  app.use(
    helmet({
      // ✅ SECURITY FIX: Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // ✅ SECURITY FIX: Only allow unsafe-eval in development (Vite HMR needs it)
          // In production, remove unsafe-eval for better security
          scriptSrc: ENV.isProduction
            ? ["'self'", "'unsafe-inline'"] // Production: no unsafe-eval
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Dev: Vite needs unsafe-eval
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"], // WebSocket for Vite HMR
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          workerSrc: ["'self'", "blob:"], // Allow Vite HMR workers in dev
        },
      },
      crossOriginEmbedderPolicy: false, // Needed for some external resources
      // ✅ SECURITY FIX: HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // ✅ SECURITY FIX: X-Content-Type-Options - Prevent MIME type sniffing
      noSniff: true,
      // ✅ SECURITY FIX: X-Frame-Options - Prevent clickjacking (DENY is most secure)
      frameguard: {
        action: "deny",
      },
      // ✅ SECURITY FIX: X-DNS-Prefetch-Control - Disable DNS prefetching
      dnsPrefetchControl: {
        allow: false,
      },
      // ✅ SECURITY FIX: Referrer-Policy - Control referrer information
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },
      // Note: permissionsPolicy is not available in Helmet types
      // Can be set manually via res.setHeader("Permissions-Policy", "...") if needed
    })
  );

  // CORS configuration with strict production rules
  const allowedOrigins = ENV.corsAllowedOrigins;

  // ✅ SECURITY FIX: Custom CORS middleware that handles public endpoints
  // This runs before the cors() middleware to set headers for public endpoints
  app.use((req, res, next) => {
    // Check if this is a public endpoint that can accept no-origin
    const isPublicEndpoint = 
      req.path?.startsWith("/api/auth/") ||
      req.path?.startsWith("/api/health") ||
      req.path === "/api/health" ||
      req.path === "/api/oauth/callback";
    
    // Store flag for cors middleware to use
    (req as any).isPublicEndpoint = isPublicEndpoint;
    
    // For public endpoints in production, allow no-origin by setting CORS headers manually
    if (isPublicEndpoint && ENV.isProduction && !req.headers.origin) {
      // Allow no-origin for public endpoints
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-CSRF-Token");
    }
    
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        // ✅ SECURITY FIX: Only allow no-origin for specific public endpoints
        // or in development. In production, require origin for security.
        if (!origin) {
          // ✅ SECURITY FIX: Only allow in development
          // For production public endpoints, headers are set in middleware above
          if (!ENV.isProduction) {
            callback(null, true);
            return;
          }
          
          // ✅ SECURITY FIX: Block no-origin in production (public endpoints handled above)
          logger.warn("CORS: Blocked no-origin request in production");
          callback(new Error("Origin required in production"));
          return;
        }

        // Explicit whitelist from env
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        // In development: allow any localhost port to simplify HMR/fallback port usage
        if (!ENV.isProduction && /^http:\/\/localhost:\d{2,5}$/.test(origin)) {
          callback(null, true);
          return;
        }

        logger.warn({ origin, allowedOrigins }, "CORS: Blocked origin");
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true, // CRITICAL: Allow cookies to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-CSRF-Token"],
      exposedHeaders: ["Set-Cookie"],
      maxAge: 86400, // 24 hours preflight cache
    })
  );

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.isProduction ? 100 : 1000, // Limit each IP to 100 requests per windowMs (1000 in dev)
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiting to all API routes
  app.use("/api/", limiter);

  // ✅ SECURITY FIX: CSRF protection for state-changing operations
  const { csrfMiddleware } = await import("./csrf");
  app.use("/api/", csrfMiddleware);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Health check endpoints
  const healthApi = (await import("../routes/health")).default;
  app.use("/api", healthApi);
  // Leads API for ChromaDB integration
  const leadsApi = (await import("../routes/leads-api")).default;
  app.use("/api/leads", leadsApi);
  // Supabase auth completion
  const supabaseAuthApi = (await import("../routes/auth-supabase")).default;
  app.use("/api/auth/supabase", supabaseAuthApi);
  // Inbound email webhook endpoint
  const { handleInboundEmail } = await import("../api/inbound-email");
  app.post("/api/inbound/email", handleInboundEmail);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    await serveStatic(app);
  }

  // Sentry error handler
  // In Sentry v10, error handling is automatically handled by expressIntegration()
  // No additional error handler middleware needed - unhandled errors are captured automatically

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(
      { preferredPort, port },
      `Port ${preferredPort} is busy, using port ${port} instead`
    );
  }

  server.listen(port, async () => {
    logger.info(
      { port, env: process.env.NODE_ENV },
      `Server running on http://localhost:${port}/`
    );

    // Run automatic historical data import if needed (non-blocking)
    // This only runs if no leads exist in the database
    runAutoImportIfNeeded().catch(error => {
      logger.error(
        { err: error },
        "[Auto-Import] Failed to run automatic import"
      );
    });

    // Start Documentation service (optional)
    logger.info(
      { docsEnable: process.env.DOCS_ENABLE },
      "[Server] Checking DOCS_ENABLE"
    );
    if (process.env.DOCS_ENABLE === "true") {
      try {
        logger.info("[Server] Starting docs service...");
        await startDocsService();
        logger.info("[Server] Docs service started successfully");
      } catch (err) {
        logger.error({ err }, "[Docs] Failed to start docs service");
      }
    } else {
      logger.info("[Docs] DOCS_ENABLE is not 'true', skipping docs service");
    }
  });
}

startServer().catch(err => logger.error({ err }, "Server start failed"));
