/**
 * Rate Limiter
 * Implements rate limiting for API endpoints to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private lastCleanupTime = 0;
  private static readonly CLEANUP_INTERVAL_MS = 5000; // 5 seconds

  /**
   * Check if a request should be rate limited
   * FIXED: Check limit BEFORE incrementing to prevent count > maxRequests
   */
  isRateLimited(key: string, config: RateLimitConfig): boolean {
    // Defensive cleanup - debounced to every 5 seconds for performance
    const now = Date.now();
    if (now - this.lastCleanupTime > RateLimiter.CLEANUP_INTERVAL_MS) {
      this.ensureCleanup();
      this.lastCleanupTime = now;
    }

    const entry = this.limits.get(key);

    // No previous requests or window expired
    if (!entry || now > entry.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return false;
    }

    // Check if limit exceeded BEFORE incrementing
    // This prevents count from exceeding maxRequests
    if (entry.count >= config.maxRequests) {
      return true;
    }

    // Increment count only if limit not exceeded
    entry.count++;
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getResetTime(key: string): number | null {
    const entry = this.limits.get(key);
    if (!entry) return null;
    return Math.max(0, entry.resetAt - Date.now());
  }

  /**
   * Cleanup expired entries
   * IMPROVED: Also cleanup on every request to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      if (now > entry.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));
  }

  /**
   * Defensive cleanup to prevent unbounded growth
   * Maximum entries limit to prevent memory leaks
   */
  private static readonly MAX_ENTRIES = 10000;

  private ensureCleanup(): void {
    // Cleanup expired entries before checking
    this.cleanup();

    // Emergency cleanup if Map grows too large (only if significantly over limit)
    // Use 1.5x threshold to avoid expensive sort operations on every cleanup
    if (this.limits.size > RateLimiter.MAX_ENTRIES * 1.5) {
      // More efficient: delete random 50% instead of sorting
      const entries = Array.from(this.limits.keys());
      const toDelete = entries.slice(0, Math.floor(entries.length / 2));
      toDelete.forEach(key => this.limits.delete(key));
    }
  }

  /**
   * Clear all rate limits (for testing)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configs
export const RATE_LIMITS = {
  // AI suggestions: 20 requests per minute per user
  AI_SUGGESTIONS: {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },
  // Action execution: 10 requests per minute per user
  ACTION_EXECUTION: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  // Dry run: 30 requests per minute per user
  DRY_RUN: {
    maxRequests: 30,
    windowMs: 60000, // 1 minute
  },
  // Chat messages: 50 per minute per user
  CHAT_MESSAGES: {
    maxRequests: 50,
    windowMs: 60000, // 1 minute
  },
} as const;

/**
 * Helper to create rate limit key
 */
export function createRateLimitKey(userId: number, endpoint: string): string {
  return `${userId}:${endpoint}`;
}
