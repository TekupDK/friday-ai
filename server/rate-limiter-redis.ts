/**
 * Redis-based Rate Limiter
 * Replaces in-memory rate limiting with persistent, distributed solution
 */

import { Redis } from "@upstash/redis";
import { logger } from "./logger";

// Initialize Redis client (will use env vars)
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      // ✅ SECURITY FIX: Use logger instead of console.warn
      logger.warn("Redis not configured, falling back to in-memory rate limiting");
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
          ? ((oldest[0] as any).score as number) + config.windowMs
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
    // ✅ SECURITY FIX: Use logger instead of console.error
    logger.error("Rate limit check failed", { err: error instanceof Error ? error : new Error(String(error)) });
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
    // ✅ SECURITY FIX: Use logger instead of console.error
    logger.error("Failed to reset rate limit", { err: error instanceof Error ? error : new Error(String(error)) });
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
        ? ((oldest[0] as any).score as number) + config.windowMs
        : now + config.windowMs;

    return {
      success: count < config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      reset: Math.floor(resetTime / 1000),
    };
  } catch (error) {
    // ✅ SECURITY FIX: Use logger instead of console.error
    logger.error("Failed to get rate limit status", { err: error instanceof Error ? error : new Error(String(error)) });
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
 * FIXED: Now supports operation-specific rate limits via keySuffix
 * FIXED: Added cleanup mechanism to prevent memory leaks
 */
const inMemoryLimits = new Map<string, number[]>();

// Cleanup interval for in-memory limits
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Stop cleanup interval (for graceful shutdown)
 * FIXED: Prevents memory leaks in test environment
 */
export function stopInMemoryCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', stopInMemoryCleanup);
  process.on('SIGINT', stopInMemoryCleanup);
}

/**
 * Start cleanup interval for in-memory limits
 * Cleans up expired entries every minute
 */
function startInMemoryCleanup(): void {
  if (cleanupInterval) return; // Already started
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    inMemoryLimits.forEach((requests, key) => {
      // Remove entries older than 2 minutes (safety margin for 60s windows)
      const recentRequests = requests.filter(
        time => now - time < 120000 // 2 minutes
      );
      
      if (recentRequests.length === 0) {
        keysToDelete.push(key);
      } else {
        inMemoryLimits.set(key, recentRequests);
      }
    });
    
    keysToDelete.forEach(key => inMemoryLimits.delete(key));
  }, 60000); // Every minute
}

export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): RateLimitResult {
  // Ensure cleanup is running
  startInMemoryCleanup();
  
  const now = Date.now();
  // Create composite key: userId:operationName or just userId
  const key = keySuffix ? `${userId}:${keySuffix}` : userId.toString();
  const userRequests = inMemoryLimits.get(key) || [];

  // Remove old requests
  // FIXED: Use <= to include requests at exact window boundary
  const recentRequests = userRequests.filter(
    time => now - time <= config.windowMs
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
  inMemoryLimits.set(key, recentRequests);

  // Calculate remaining: limit - current count (after adding this request)
  const remaining = config.limit - recentRequests.length;

  return {
    success: true,
    limit: config.limit,
    remaining: Math.max(0, remaining), // Ensure non-negative
    reset: Math.floor((now + config.windowMs) / 1000),
  };
}

/**
 * Lua script for atomic rate limiting in Redis
 * FIXED: Prevents race conditions by making operations atomic
 */
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local windowMs = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requestId = ARGV[4]
  
  local windowStart = now - windowMs
  
  -- Remove old entries (atomic)
  redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
  
  -- Count current requests (atomic)
  local count = redis.call('ZCARD', key)
  
  if count >= limit then
    -- Get oldest request for reset time
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local resetTime = now + windowMs
    if #oldest > 0 then
      resetTime = tonumber(oldest[2]) + windowMs
    end
    return {0, limit, 0, math.floor(resetTime / 1000)}
  end
  
  -- Add current request (atomic)
  redis.call('ZADD', key, now, requestId)
  redis.call('EXPIRE', key, math.ceil(windowMs / 1000))
  
  return {1, limit, limit - count - 1, math.floor((now + windowMs) / 1000)}
`;

/**
 * Sanitize key suffix to prevent injection and collisions
 * FIXED: Input validation for keySuffix
 */
function sanitizeKeySuffix(keySuffix: string): string {
  // Remove special characters, limit length, prevent collisions
  return keySuffix
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with _
    .replace(/_+/g, '_') // Collapse multiple underscores to single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase() // Case-insensitive to prevent case collisions
    .substring(0, 50); // Max 50 chars
}

/**
 * Unified rate limit check (tries Redis, falls back to in-memory)
 * FIXED: Uses atomic Lua script to prevent race conditions
 * FIXED: Validates and sanitizes keySuffix input
 * @param userId User ID for rate limiting
 * @param config Rate limit configuration
 * @param keySuffix Optional suffix for operation-specific rate limits (e.g., "archive", "delete")
 */
export async function checkRateLimitUnified(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): Promise<RateLimitResult> {
  try {
    const client = getRedisClient();
    // Sanitize keySuffix if provided
    const sanitizedSuffix = keySuffix ? sanitizeKeySuffix(keySuffix) : undefined;
    
    // Use operation-specific key if suffix provided
    const key = sanitizedSuffix 
      ? `ratelimit:user:${userId}:${sanitizedSuffix}`
      : `ratelimit:user:${userId}`;
    const now = Date.now();
    const requestId = `${now}:${Math.random()}`;

    // Use Lua script for atomic operations (prevents race conditions)
    const result = await client.eval(
      RATE_LIMIT_SCRIPT,
      [key],
      [config.windowMs, config.limit, now, requestId]
    ) as [number, number, number, number];

    // FIXED: Validate Lua script result format
    if (!Array.isArray(result) || result.length !== 4) {
      throw new Error("Invalid Lua script result format");
    }

    // Validate result types (prevent NaN/Infinity)
    if (result.some(v => typeof v !== 'number' || !isFinite(v))) {
      throw new Error("Invalid Lua script result values (NaN/Infinity detected)");
    }

    return {
      success: result[0] === 1,
      limit: result[1],
      remaining: result[2],
      reset: result[3],
    };
  } catch (error) {
    // ✅ SECURITY FIX: Use logger instead of console.warn
    logger.warn("Redis rate limiting unavailable, using in-memory fallback");
    // Pass sanitized keySuffix to in-memory fallback
    const sanitizedSuffix = keySuffix ? sanitizeKeySuffix(keySuffix) : undefined;
    return checkRateLimitInMemory(userId, config, sanitizedSuffix);
  }
}
