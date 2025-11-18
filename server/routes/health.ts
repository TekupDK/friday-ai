/**
 * Health Check Routes
 *
 * Provides monitoring and deployment verification endpoints for Friday AI Chat.
 *
 * Endpoints:
 * - GET /api/health - Basic health check (always returns 200 if server is running)
 * - GET /api/ready - Readiness check (verifies all dependencies are available)
 *
 * @see {@link https://github.com/TekupDK/friday-ai/blob/main/docs/HEALTH_CHECK_ENDPOINTS.md Health Check Documentation}
 *
 * @example
 * ```bash
 * # Basic health check
 * curl http://localhost:3000/api/health
 *
 * # Readiness check
 * curl http://localhost:3000/api/ready
 * ```
 */

import { sql } from "drizzle-orm";
import { Router, Request, Response } from "express";

import { logger } from "../_core/logger";
import { getDb } from "../db";

const router = Router();

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

interface ReadyStatus {
  status: "ready" | "not_ready";
  timestamp: string;
  checks: {
    database: {
      status: "ok" | "error";
      message?: string;
      responseTime?: number;
    };
    redis: {
      status: "ok" | "error" | "not_configured";
      message?: string;
      responseTime?: number;
    };
  };
}

/**
 * GET /api/health
 *
 * Basic health check endpoint that always returns 200 if the server is running.
 * Used by load balancers and basic monitoring to verify the server process is alive.
 *
 * @returns HTTP 200 with health status including uptime, version, and environment
 *
 * @example
 * ```bash
 * curl http://localhost:3000/api/health
 * # Returns: { status: "healthy", uptime: 3600, version: "2.0.0", ... }
 * ```
 */
router.get("/health", (_req: Request, res: Response) => {
  const startTime = Date.now();
  const uptime = process.uptime();

  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || "2.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  const responseTime = Date.now() - startTime;
  res.status(200).json({
    ...health,
    responseTime: `${responseTime}ms`,
  });
});

/**
 * GET /api/ready
 *
 * Readiness check endpoint that verifies all critical dependencies are available.
 * Used by Kubernetes readiness probes to determine if the pod should receive traffic.
 *
 * Checks the following dependencies:
 * - Database: Verifies connection with `SELECT 1` query
 * - Redis: Optional check (falls back to in-memory if not configured)
 *
 * @returns HTTP 200 if ready, HTTP 503 if not ready
 * @returns Detailed status for each dependency check
 *
 * @example
 * ```bash
 * curl http://localhost:3000/api/ready
 * # Returns: { status: "ready", checks: { database: {...}, redis: {...} } }
 * ```
 */
router.get("/ready", async (_req: Request, res: Response) => {
  const checks: ReadyStatus["checks"] = {
    database: { status: "error" },
    redis: { status: "not_configured" },
  };

  // Check database
  try {
    const dbStartTime = Date.now();
    const db = await getDb();
    const dbResponseTime = Date.now() - dbStartTime;

    if (db) {
      // Try a simple query to verify connection
      await db.execute(sql`SELECT 1`);
      checks.database = {
        status: "ok",
        responseTime: dbResponseTime,
      };
    } else {
      checks.database = {
        status: "error",
        message: "Database connection not available",
      };
    }
  } catch (error) {
    logger.error({ err: error }, "[Health] Database check failed");
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Redis
  try {
    const redisStartTime = Date.now();
    // Dynamically import to avoid errors if Redis is not configured
    const { getRedisClient } = await import("../rate-limiter-redis");
    const redis = getRedisClient();

    // Try a simple ping
    await redis.ping();
    const redisResponseTime = Date.now() - redisStartTime;

    checks.redis = {
      status: "ok",
      responseTime: redisResponseTime,
    };
  } catch (error) {
    // Redis is optional (falls back to in-memory), so not_configured is OK
    if (error instanceof Error && error.message === "Redis not configured") {
      checks.redis = {
        status: "not_configured",
        message: "Redis not configured (using in-memory fallback)",
      };
    } else {
      logger.warn({ err: error }, "[Health] Redis check failed");
      checks.redis = {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Determine overall readiness
  const isReady =
    checks.database.status === "ok" &&
    (checks.redis.status === "ok" || checks.redis.status === "not_configured");

  const readyStatus: ReadyStatus = {
    status: isReady ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks,
  };

  res.status(isReady ? 200 : 503).json(readyStatus);
});

export default router;
