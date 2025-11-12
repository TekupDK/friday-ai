/**
 * Redis-based Rate Limiter
 * Replaces in-memory rate limiting with persistent, distributed solution
 */

import { Redis } from "@upstash/redis";

// Initialize Redis client (will use env vars)
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.warn(
        "⚠️ Redis not configured, falling back to in-memory rate limiting"
      );
      throw new Error("Redis not configured");
    }

    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  return redis;
}

interface RateLimitConfig {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

/**
 * Check rate limit using Redis sliding window
 */
export async function checkRateLimit(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  try {
    const client = getRedisClient();
    const key = `ratelimit:user:${userId}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis sorted set for sliding window
    // Score is timestamp, member is unique request ID

    // 1. Remove old entries outside the window
    await client.zremrangebyscore(key, 0, windowStart);

    // 2. Count current requests in window
    const count = await client.zcard(key);

    // 3. Check if limit exceeded
    if (count >= config.limit) {
      // Get oldest request to calculate reset time
      const oldest = await client.zrange(key, 0, 0, { withScores: true });
      const resetTime =
        oldest.length > 0
          ? (oldest[0].score as number) + config.windowMs
          : now + config.windowMs;

      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: Math.floor(resetTime / 1000),
      };
    }

    // 4. Add current request
    const requestId = `${now}:${Math.random()}`;
    await client.zadd(key, { score: now, member: requestId });

    // 5. Set expiry on key (cleanup)
    await client.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - count - 1,
      reset: Math.floor((now + config.windowMs) / 1000),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.floor((Date.now() + config.windowMs) / 1000),
    };
  }
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetRateLimit(userId: number): Promise<void> {
  try {
    const client = getRedisClient();
    const key = `ratelimit:user:${userId}`;
    await client.del(key);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
  }
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  try {
    const client = getRedisClient();
    const key = `ratelimit:user:${userId}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries
    await client.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const count = await client.zcard(key);

    // Get oldest request for reset time
    const oldest = await client.zrange(key, 0, 0, { withScores: true });
    const resetTime =
      oldest.length > 0
        ? (oldest[0].score as number) + config.windowMs
        : now + config.windowMs;

    return {
      success: count < config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      reset: Math.floor(resetTime / 1000),
    };
  } catch (error) {
    console.error("Failed to get rate limit status:", error);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.floor((Date.now() + config.windowMs) / 1000),
    };
  }
}

/**
 * Fallback in-memory rate limiter (if Redis not available)
 */
const inMemoryLimits = new Map<number, number[]>();

export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const userRequests = inMemoryLimits.get(userId) || [];

  // Remove old requests
  const recentRequests = userRequests.filter(
    time => now - time < config.windowMs
  );

  if (recentRequests.length >= config.limit) {
    const resetTime = recentRequests[0] + config.windowMs;
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.floor(resetTime / 1000),
    };
  }

  recentRequests.push(now);
  inMemoryLimits.set(userId, recentRequests);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - recentRequests.length,
    reset: Math.floor((now + config.windowMs) / 1000),
  };
}

/**
 * Unified rate limit check (tries Redis, falls back to in-memory)
 */
export async function checkRateLimitUnified(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  try {
    return await checkRateLimit(userId, config);
  } catch (error) {
    console.warn("Redis rate limiting unavailable, using in-memory fallback");
    return checkRateLimitInMemory(userId, config);
  }
}
