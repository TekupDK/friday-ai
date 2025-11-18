/**
 * Redis-based Database Query Cache
 * Provides caching for expensive database queries
 * ✅ NEW: Redis caching for expensive queries
 */

import { createHash } from "crypto";

import { logger } from "./_core/logger";
import { getRedisClient } from "./rate-limiter-redis";

interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 5 minutes)
  keyPrefix?: string; // Cache key prefix (default: "db:query:")
}

/**
 * Generate cache key from query parameters
 * Uses hash to keep keys short and consistent
 */
function generateCacheKey(
  queryName: string,
  params: Record<string, any>,
  prefix: string = "db:query:"
): string {
  const keyData = {
    query: queryName,
    params: JSON.stringify(params),
  };
  const keyString = JSON.stringify(keyData);
  const hash = createHash("sha256").update(keyString).digest("hex").substring(0, 16);
  return `${prefix}${queryName}:${hash}`;
}

/**
 * Get cached query result or execute query and cache it
 * 
 * @param queryName - Name of the query (for cache key)
 * @param queryFn - Function that executes the database query
 * @param params - Query parameters (for cache key generation)
 * @param options - Cache options (TTL, key prefix)
 * @returns Cached or fresh query result
 */
export async function getCachedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  params: Record<string, any> = {},
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 300, keyPrefix = "db:query:" } = options; // Default 5 minutes

  try {
    const redis = getRedisClient();
    const cacheKey = generateCacheKey(queryName, params, keyPrefix);

    // Try to get from cache
    const cached = await redis.get<T>(cacheKey);
    if (cached !== null) {
      logger.debug(
        { queryName, cacheKey: cacheKey.substring(0, 30) + "..." },
        "[DB Cache] Cache hit"
      );
      return cached;
    }

    // Cache miss - execute query
    logger.debug({ queryName }, "[DB Cache] Cache miss, executing query");
    const result = await queryFn();

    // Store in cache with TTL
    await redis.setex(cacheKey, ttl, JSON.stringify(result));

    logger.debug(
      { queryName, ttl, cacheKey: cacheKey.substring(0, 30) + "..." },
      "[DB Cache] Query result cached"
    );

    return result;
  } catch (error) {
    // If Redis fails, just execute the query without caching
    logger.warn(
      { err: error, queryName },
      "[DB Cache] Redis unavailable, executing query without cache"
    );
    return await queryFn();
  }
}

/**
 * Invalidate cache for a specific query pattern
 * 
 * @param queryName - Name of the query to invalidate
 * @param params - Optional parameters to match (if not provided, invalidates all for queryName)
 */
export async function invalidateCache(
  queryName: string,
  params?: Record<string, any>
): Promise<void> {
  try {
    const redis = getRedisClient();
    
    if (params) {
      // Invalidate specific cache entry
      const cacheKey = generateCacheKey(queryName, params);
      await redis.del(cacheKey);
      logger.debug({ queryName, cacheKey }, "[DB Cache] Cache invalidated");
    } else {
      // Invalidate all entries for this query
      // Note: This requires SCAN which is expensive, use sparingly
      const pattern = `db:query:${queryName}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(
          { queryName, count: keys.length },
          "[DB Cache] All cache entries invalidated for query"
        );
      }
    }
  } catch (error) {
    logger.warn(
      { err: error, queryName },
      "[DB Cache] Failed to invalidate cache"
    );
  }
}

/**
 * Clear all database query cache entries
 * Use with caution - this clears ALL query caches
 */
export async function clearAllQueryCache(): Promise<void> {
  try {
    const redis = getRedisClient();
    const pattern = "db:query:*";
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(
        { count: keys.length },
        "[DB Cache] All query caches cleared"
      );
    }
  } catch (error) {
    logger.warn({ err: error }, "[DB Cache] Failed to clear all caches");
  }
}

