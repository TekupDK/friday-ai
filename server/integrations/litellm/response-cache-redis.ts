/**
 * Redis-backed Response Cache for LiteLLM
 * Provides persistent, distributed caching for AI responses
 * Falls back to in-memory cache if Redis is unavailable
 * ✅ NEW: Redis caching for AI responses
 */

import { getRedisClient } from "../../rate-limiter-redis";
import { logger } from "../../_core/logger";
import { responseCache } from "./response-cache";

interface CacheEntry<T = unknown> {
  response: T;
  timestamp: number;
  hits: number;
}

export class LiteLLMCacheRedis {
  private maxAge = 5 * 60 * 1000; // 5 minutes
  private keyPrefix = "llm:cache:";

  /**
   * Generate cache key from request
   */
  private getCacheKey(messages: unknown[], model: string): string {
    const messagesStr = JSON.stringify(messages);
    // Hash the key to prevent Redis key length issues
    const hash = this.simpleHash(`${model}:${messagesStr}`);
    return `${this.keyPrefix}${model}:${hash}`;
  }

  /**
   * Simple hash function for cache keys
   * Prevents Redis key length issues with long messages
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached response if available and fresh
   */
  async get<T = unknown>(messages: unknown[], model: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const key = this.getCacheKey(messages, model);

      // Get cached entry
      const cached = await client.get<CacheEntry<T>>(key);

      if (!cached) {
        return null;
      }

      // Check if expired
      const age = Date.now() - cached.timestamp;
      if (age > this.maxAge) {
        // Expired - delete and return null
        await client.del(key).catch(() => {
          // Ignore deletion errors
        });
        return null;
      }

      // Update hits count
      cached.hits++;
      await client.set(key, cached, { ex: Math.ceil(this.maxAge / 1000) }).catch(() => {
        // Ignore update errors
      });

      logger.info(
        { model, hits: cached.hits, age },
        "[Redis Cache] Hit! Saved 1 API call"
      );

      return cached.response;
    } catch (error) {
      // Fallback to in-memory cache if Redis fails
      logger.warn("Redis cache unavailable, falling back to in-memory cache");
      return responseCache.get(messages, model) as T | null;
    }
  }

  /**
   * Store response in cache
   */
  async set<T = unknown>(messages: unknown[], model: string, response: T): Promise<void> {
    try {
      const client = getRedisClient();
      const key = this.getCacheKey(messages, model);

      const entry: CacheEntry<T> = {
        response,
        timestamp: Date.now(),
        hits: 0,
      };

      // Store with TTL (expires in maxAge seconds)
      await client.set(key, entry, { ex: Math.ceil(this.maxAge / 1000) });

      logger.debug({ model, key }, "[Redis Cache] Stored response");
    } catch (error) {
      // Fallback to in-memory cache if Redis fails
      logger.warn("Redis cache unavailable, falling back to in-memory cache");
      responseCache.set(messages, model, response);
    }
  }

  /**
   * Clear expired entries (Redis handles TTL automatically, but we can clean up manually)
   */
  async cleanup(): Promise<void> {
    try {
      const client = getRedisClient();
      // Redis handles TTL automatically, but we can scan for expired keys if needed
      // For now, we rely on Redis TTL expiration
      logger.debug("[Redis Cache] Cleanup called (TTL handled automatically)");
    } catch (error) {
      // Fallback to in-memory cleanup
      responseCache.cleanup();
    }
  }

  /**
   * Get cache stats
   */
  async getStats() {
    try {
      const client = getRedisClient();
      const pattern = `${this.keyPrefix}*`;

      // Get all keys matching pattern
      const keys = await client.keys(pattern);
      const size = keys.length;

      // Calculate total hits (requires fetching all entries)
      let totalHits = 0;
      let totalAge = 0;

      if (keys.length > 0) {
        const entries = await Promise.all(
          keys.map(async key => {
            const entry = await client.get<CacheEntry<unknown>>(key);
            return entry;
          })
        );

        const validEntries = entries.filter((e): e is CacheEntry<unknown> => e !== null);
        totalHits = validEntries.reduce((sum, e) => sum + e.hits, 0);
        totalAge = validEntries.reduce(
          (sum, e) => sum + (Date.now() - e.timestamp),
          0
        );
      }

      return {
        size,
        maxSize: -1, // Redis has no max size limit
        totalHits,
        avgAge: size > 0 ? totalAge / size : 0,
      };
    } catch (error) {
      // Fallback to in-memory stats
      return responseCache.getStats();
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const client = getRedisClient();
      const pattern = `${this.keyPrefix}*`;
      const keys = await client.keys(pattern);

      if (keys.length > 0) {
        await client.del(...keys);
      }

      logger.info({ count: keys.length }, "[Redis Cache] Cleared all entries");
    } catch (error) {
      // Fallback to in-memory clear
      responseCache.clear();
    }
  }

  /**
   * Start cleanup interval (no-op for Redis, TTL handles expiration)
   */
  startCleanup(): void {
    // Redis handles TTL automatically, no interval needed
    // But we can still call cleanup periodically for stats
    logger.debug("[Redis Cache] Cleanup started (TTL handled automatically)");
  }

  /**
   * Stop cleanup interval (no-op for Redis)
   */
  stopCleanup(): void {
    // No interval to stop for Redis
    logger.debug("[Redis Cache] Cleanup stopped");
  }

  /**
   * Destroy the cache instance
   */
  async destroy(): Promise<void> {
    await this.clear();
    this.stopCleanup();
  }
}

// Singleton instance
export const responseCacheRedis = new LiteLLMCacheRedis();

// Start cleanup (no-op for Redis, but keeps interface consistent)
responseCacheRedis.startCleanup();

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => responseCacheRedis.stopCleanup());
  process.on("SIGINT", () => responseCacheRedis.stopCleanup());
}
