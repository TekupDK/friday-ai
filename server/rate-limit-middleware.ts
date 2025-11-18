import { TRPCError } from "@trpc/server";

import { checkRateLimitUnified } from "./rate-limiter-redis";

/**
 * Rate limit configuration for inbox/CRM operations:
 * - 10 requests per 30 seconds per user
 */
export const INBOX_CRM_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 30 * 1000, // 30 seconds
};

/**
 * Rate limit for expensive stats/aggregation queries:
 * - 20 requests per 15 minutes per user
 */
export const STATS_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Rate limit for export operations:
 * - 10 requests per 15 minutes per user
 */
export const EXPORT_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Rate limit for bulk/pipeline operations:
 * - 30 requests per 15 minutes per user
 */
export const BULK_OPERATION_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Creates a rate limiting middleware for tRPC procedures
 * UPDATED: Now uses Redis-based rate limiting for consistency and distributed support
 * @param config Rate limit configuration (maxRequests, windowMs)
 * @param operationName Optional operation name for better error messages
 */
export function createRateLimitMiddleware(
  config: { maxRequests: number; windowMs: number },
  operationName?: string
) {
  // Validate config
  // FIXED: Check for NaN and Infinity
  if (!Number.isFinite(config.maxRequests) || config.maxRequests < 1) {
    throw new Error("maxRequests must be a finite number >= 1");
  }
  if (!Number.isFinite(config.windowMs) || config.windowMs < 1000) {
    throw new Error("windowMs must be a finite number >= 1000ms");
  }

  return async (opts: any) => {
    const { ctx, next } = opts;

    // Use userId as the rate limit key (preferred)
    const userId = ctx.user?.id;
    if (!userId) {
      // If no user, allow the request (auth middleware will handle this)
      return next();
    }

    // Use Redis-based rate limiting (consistent with chat endpoints)
    // Falls back to in-memory if Redis not configured
    // Include operationName in key for operation-specific rate limits
    let rateLimit: Awaited<ReturnType<typeof checkRateLimitUnified>>;
    try {
      rateLimit = await checkRateLimitUnified(
        userId,
        {
          limit: config.maxRequests,
          windowMs: config.windowMs,
        },
        operationName // Pass operationName as key suffix for separate limits per operation
      );
    } catch (error) {
      // Fail open: if rate limiting fails, allow the request
      // This prevents rate limiter from breaking the application
      // ✅ SECURITY FIX: Use logger instead of console.error
      const { logger } = await import("./_core/logger");
      logger.error({ err: error }, "[RateLimit] Rate limit check failed");
      return next();
    }

    if (!rateLimit.success) {
      const resetTime = rateLimit.reset * 1000;
      const now = Date.now();
      // FIXED: Prevent negative seconds (clock skew, stale data)
      const secondsUntilReset = Math.max(0, Math.ceil((resetTime - now) / 1000));

      // If reset time is in past (clock skew), allow immediate retry
      if (secondsUntilReset <= 0) {
        // Reset time is in past - allow request to proceed
        return next();
      }

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please retry after ${secondsUntilReset} seconds.`,
        cause: { retryAfter: new Date(resetTime) },
      });
    }

    return next();
  };
}
