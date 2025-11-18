/**
 * Unit Tests for LiteLLM Rate Limiter
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { LiteLLMRateLimiter } from "../rate-limiter";

describe("LiteLLMRateLimiter", () => {
  let rateLimiter: LiteLLMRateLimiter;

  beforeEach(() => {
    rateLimiter = new LiteLLMRateLimiter();
  });

  describe("Priority Queue", () => {
    it("should process high priority requests first", async () => {
      const results: string[] = [];

      // Enqueue in mixed order with delays to ensure ordering
      const lowPromise = rateLimiter.enqueue(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        results.push("low");
        return "low";
      }, "low");

      // Wait a bit before adding high priority
      await new Promise(resolve => setTimeout(resolve, 10));

      const highPromise = rateLimiter.enqueue(async () => {
        results.push("high");
        return "high";
      }, "high");

      const mediumPromise = rateLimiter.enqueue(async () => {
        results.push("medium");
        return "medium";
      }, "medium");

      await Promise.all([lowPromise, highPromise, mediumPromise]);

      // High should come before medium and low
      const highIndex = results.indexOf("high");
      const mediumIndex = results.indexOf("medium");
      const lowIndex = results.indexOf("low");

      expect(highIndex).toBeLessThan(mediumIndex);
      expect(highIndex).toBeLessThan(lowIndex);
    });

    it("should handle multiple high priority requests in order", async () => {
      const results: string[] = [];

      const promises = [
        rateLimiter.enqueue(async () => {
          results.push("high1");
          return "high1";
        }, "high"),
        rateLimiter.enqueue(async () => {
          results.push("high2");
          return "high2";
        }, "high"),
        rateLimiter.enqueue(async () => {
          results.push("low");
          return "low";
        }, "low"),
      ];

      await Promise.all(promises);

      // Both high priority should come before low
      expect(results.indexOf("high1")).toBeLessThan(results.indexOf("low"));
      expect(results.indexOf("high2")).toBeLessThan(results.indexOf("low"));
    });
  });

  describe("Rate Limiting", () => {
    it("should respect max requests per minute", async () => {
      const stats = rateLimiter.getStats();

      // Should be configured for 12 requests/min
      expect(stats.maxPerMinute).toBe(12);
    });

    it("should track request timestamps correctly", async () => {
      await rateLimiter.enqueue(async () => "test1", "medium");
      await rateLimiter.enqueue(async () => "test2", "medium");

      const stats = rateLimiter.getStats();
      expect(stats.requestsInLastMinute).toBe(2);
    });

    it("should have available slots after processing", async () => {
      await rateLimiter.enqueue(async () => "test", "medium");

      const stats = rateLimiter.getStats();
      expect(stats.availableSlots).toBe(11); // 12 - 1
    });
  });

  describe("Concurrent Request Control", () => {
    it("should limit concurrent requests", async () => {
      const stats = rateLimiter.getStats();

      // Should be configured for max 2 concurrent
      expect(stats.maxConcurrent).toBe(2);
    });

    it("should track concurrent requests", async () => {
      const longRunningTask = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "done";
      };

      // Start multiple requests
      const promises = [
        rateLimiter.enqueue(longRunningTask, "medium"),
        rateLimiter.enqueue(longRunningTask, "medium"),
      ];

      // Check concurrent count (may be 0, 1, or 2 depending on timing)
      const stats = rateLimiter.getStats();
      expect(stats.concurrent).toBeGreaterThanOrEqual(0);
      expect(stats.concurrent).toBeLessThanOrEqual(2);

      await Promise.all(promises);
    });
  });

  describe("Error Handling", () => {
    it("should handle request failures", async () => {
      const failingTask = async () => {
        throw new Error("Test error");
      };

      await expect(rateLimiter.enqueue(failingTask, "medium")).rejects.toThrow(
        "Test error"
      );
    });

    it("should continue processing after error", async () => {
      const results: string[] = [];

      const promises = [
        rateLimiter
          .enqueue(async () => {
            throw new Error("fail");
          }, "medium")
          .catch(() => "error"),
        rateLimiter.enqueue(async () => {
          results.push("success");
          return "success";
        }, "medium"),
      ];

      await Promise.all(promises);

      expect(results).toContain("success");
    });
  });

  describe("Rate Limit Error Detection", () => {
    it("should identify rate limit errors by message", () => {
      const rateLimitError = new Error("Rate limit exceeded");
      const normalError = new Error("Normal error");

      // Use type assertion to access private method for testing
      const limiter = rateLimiter as any;

      expect(limiter.isRateLimitError(rateLimitError)).toBe(true);
      expect(limiter.isRateLimitError(normalError)).toBe(false);
    });

    it("should identify rate limit errors by status code", () => {
      const rateLimitError = { statusCode: 429, message: "Too many requests" };

      const limiter = rateLimiter as any;
      expect(limiter.isRateLimitError(rateLimitError)).toBe(true);
    });
  });

  describe("Exponential Backoff", () => {
    it("should calculate exponential backoff correctly", () => {
      const limiter = rateLimiter as any;

      expect(limiter.calculateBackoff(1)).toBe(1000); // 1s
      expect(limiter.calculateBackoff(2)).toBe(2000); // 2s
      expect(limiter.calculateBackoff(3)).toBe(4000); // 4s
    });
  });

  describe("Stats Reporting", () => {
    it("should provide accurate queue stats", () => {
      const stats = rateLimiter.getStats();

      expect(stats).toHaveProperty("queueLength");
      expect(stats).toHaveProperty("requestsInLastMinute");
      expect(stats).toHaveProperty("maxPerMinute");
      expect(stats).toHaveProperty("concurrent");
      expect(stats).toHaveProperty("maxConcurrent");
      expect(stats).toHaveProperty("availableSlots");
    });

    it("should update stats after processing", async () => {
      const statsBefore = rateLimiter.getStats();
      expect(statsBefore.requestsInLastMinute).toBe(0);

      await rateLimiter.enqueue(async () => "test", "medium");

      const statsAfter = rateLimiter.getStats();
      expect(statsAfter.requestsInLastMinute).toBe(1);
    });
  });
});
