/**
 * Unit Tests for Rate Limiter Bugs
 * Tests the count increment bug and other issues identified in error analysis
 */

import { describe, it, expect, beforeEach } from "vitest";

import { rateLimiter } from "../rate-limiter";

describe("Rate Limiter Count Bug", () => {
  beforeEach(() => {
    rateLimiter.clear();
  });

  it("should not allow count to exceed maxRequests", () => {
    const key = "test:user:1";
    const config = { maxRequests: 10, windowMs: 60000 };

    // Make 10 requests (should all be allowed)
    for (let i = 0; i < 10; i++) {
      const isLimited = rateLimiter.isRateLimited(key, config);
      expect(isLimited).toBe(false);
    }

    // Check remaining - should be 0
    const remaining = rateLimiter.getRemaining(key, config);
    expect(remaining).toBe(0);

    // 11th request should be blocked
    const isLimited11 = rateLimiter.isRateLimited(key, config);
    expect(isLimited11).toBe(true);

    // BUG: Count should be 10, not 11
    // Access private property for testing
    const entry = (rateLimiter as any).limits.get(key);
    expect(entry.count).toBeLessThanOrEqual(10);
  });

  it("should reset count correctly after window expires", async () => {
    const key = "test:user:2";
    const config = { maxRequests: 10, windowMs: 1000 }; // 1 second window

    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      rateLimiter.isRateLimited(key, config);
    }

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Next request should be allowed (new window)
    const isLimited = rateLimiter.isRateLimited(key, config);
    expect(isLimited).toBe(false);

    // Remaining should be 9 (not 10, because we just made 1 request)
    const remaining = rateLimiter.getRemaining(key, config);
    expect(remaining).toBe(9);
  });

  it("should block requests when limit is exactly reached", () => {
    const key = "test:user:3";
    const config = { maxRequests: 5, windowMs: 60000 };

    // Make exactly maxRequests requests
    for (let i = 0; i < config.maxRequests; i++) {
      const isLimited = rateLimiter.isRateLimited(key, config);
      expect(isLimited).toBe(false);
    }

    // Next request should be blocked
    const isLimited = rateLimiter.isRateLimited(key, config);
    expect(isLimited).toBe(true);

    // Count should not exceed maxRequests
    const entry = (rateLimiter as any).limits.get(key);
    expect(entry.count).toBeLessThanOrEqual(config.maxRequests);
  });
});

describe("Rate Limiter Memory Management", () => {
  beforeEach(() => {
    rateLimiter.clear();
  });

  it("should cleanup expired entries", async () => {
    const config = { maxRequests: 10, windowMs: 100 }; // 100ms window

    // Create 100 different keys
    for (let i = 0; i < 100; i++) {
      const key = `test:user:${i}`;
      rateLimiter.isRateLimited(key, config);
    }

    // Wait for all windows to expire
    await new Promise(resolve => setTimeout(resolve, 200));

    // Force cleanup
    const cleanup = (rateLimiter as any).cleanup.bind(rateLimiter);
    cleanup();

    // Check if Map is empty or significantly reduced
    const limits = (rateLimiter as any).limits;
    expect(limits.size).toBeLessThan(100);
  });

  it("should handle rapid requests without memory leak", () => {
    const config = { maxRequests: 10, windowMs: 60000 };

    // Make 1000 rapid requests with different keys
    for (let i = 0; i < 1000; i++) {
      const key = `test:user:${i}`;
      rateLimiter.isRateLimited(key, config);
    }

    // Map should not grow unbounded
    const limits = (rateLimiter as any).limits;
    expect(limits.size).toBe(1000); // All entries should exist

    // After cleanup, should be reduced
    const cleanup = (rateLimiter as any).cleanup.bind(rateLimiter);
    cleanup();

    // Size should be same (no entries expired yet)
    expect(limits.size).toBe(1000);
  });
});

describe("Rate Limiter Edge Cases", () => {
  beforeEach(() => {
    rateLimiter.clear();
  });

  it("should handle concurrent requests correctly", () => {
    const key = "test:user:concurrent";
    const config = { maxRequests: 10, windowMs: 60000 };

    // Simulate concurrent requests
    const results: boolean[] = [];
    for (let i = 0; i < 15; i++) {
      results.push(rateLimiter.isRateLimited(key, config));
    }

    // First 10 should be allowed
    const allowed = results.filter(r => !r).length;
    expect(allowed).toBe(10);

    // Remaining 5 should be blocked
    const blocked = results.filter(r => r).length;
    expect(blocked).toBe(5);
  });

  it("should handle multiple keys independently", () => {
    const config = { maxRequests: 5, windowMs: 60000 };

    // User 1 makes 5 requests
    for (let i = 0; i < 5; i++) {
      const isLimited = rateLimiter.isRateLimited("user:1", config);
      expect(isLimited).toBe(false);
    }

    // User 2 should still be able to make requests
    const isLimited = rateLimiter.isRateLimited("user:2", config);
    expect(isLimited).toBe(false);
  });
});
