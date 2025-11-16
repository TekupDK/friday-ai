/**
 * Regression Test for Race Condition Bug
 * Tests that concurrent requests don't exceed rate limit
 */

import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimitUnified } from "../rate-limiter-redis";

describe("Race Condition in Redis Operations", () => {
  beforeEach(() => {
    // Ensure clean state
    // Note: This test requires Redis to be unavailable to test in-memory fallback
    // or we need to mock Redis for predictable behavior
  });

  it("should not allow more requests than limit under concurrent load", async () => {
    const userId = 1;
    const config = { limit: 10, windowMs: 60000 };
    
    // Fire 20 concurrent requests - should only allow 10
    const promises = Array.from({ length: 20 }, () =>
      checkRateLimitUnified(userId, config, "test")
    );
    
    const results = await Promise.all(promises);
    const allowed = results.filter(r => r.success).length;
    
    // Should only allow 10, not more
    // This test will FAIL if race condition exists
    expect(allowed).toBeLessThanOrEqual(10);
    
    // Verify that exactly 10 were allowed (not less due to race)
    expect(allowed).toBe(10);
  });

  it("should handle high concurrency correctly", async () => {
    const userId = 2;
    const config = { limit: 5, windowMs: 60000 };
    
    // Fire 50 concurrent requests - should only allow 5
    const promises = Array.from({ length: 50 }, () =>
      checkRateLimitUnified(userId, config, "high-concurrency")
    );
    
    const results = await Promise.all(promises);
    const allowed = results.filter(r => r.success).length;
    
    // Should only allow 5
    expect(allowed).toBeLessThanOrEqual(5);
    expect(allowed).toBe(5);
  });

  it("should maintain separate limits for different operations under concurrency", async () => {
    const userId = 3;
    const config = { limit: 3, windowMs: 60000 };
    
    // Fire 10 concurrent "archive" requests
    const archivePromises = Array.from({ length: 10 }, () =>
      checkRateLimitUnified(userId, config, "archive")
    );
    
    // Fire 10 concurrent "delete" requests
    const deletePromises = Array.from({ length: 10 }, () =>
      checkRateLimitUnified(userId, config, "delete")
    );
    
    const [archiveResults, deleteResults] = await Promise.all([
      Promise.all(archivePromises),
      Promise.all(deletePromises),
    ]);
    
    const archiveAllowed = archiveResults.filter(r => r.success).length;
    const deleteAllowed = deleteResults.filter(r => r.success).length;
    
    // Each operation should allow 3 requests
    expect(archiveAllowed).toBe(3);
    expect(deleteAllowed).toBe(3);
    
    // Total allowed should be 6 (3 + 3), not 3 (shared limit)
    expect(archiveAllowed + deleteAllowed).toBe(6);
  });
});

