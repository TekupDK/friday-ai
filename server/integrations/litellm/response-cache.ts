/**
 * Response Cache for LiteLLM
 * Caches identical requests to avoid rate limits
 */

interface CacheEntry {
  response: any;
  timestamp: number;
  hits: number;
}

export class LiteLLMCache {
  private cache = new Map<string, CacheEntry>();
  private maxAge = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  /**
   * Generate cache key from request
   */
  private getCacheKey(messages: any[], model: string): string {
    const messagesStr = JSON.stringify(messages);
    return `${model}:${messagesStr}`;
  }

  /**
   * Get cached response if available and fresh
   */
  get(messages: any[], model: string): any | null {
    const key = this.getCacheKey(messages, model);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Record cache hit
    entry.hits++;
    console.log(`✅ [Cache] Hit! Saved 1 API call (${entry.hits} total hits)`);

    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(messages: any[], model: string, response: any): void {
    // Enforce max size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0]?.[0];

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const key = this.getCacheKey(messages, model);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      avgAge:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (Date.now() - e.timestamp), 0) /
            entries.length
          : 0,
    };
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const responseCache = new LiteLLMCache();

// Cleanup every 5 minutes
setInterval(() => responseCache.cleanup(), 5 * 60 * 1000);
