/**
 * Unit Tests for LiteLLM Response Cache
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { LiteLLMCache } from "../response-cache";

describe("LiteLLMCache", () => {
  let cache: LiteLLMCache;

  beforeEach(() => {
    cache = new LiteLLMCache();
  });

  afterEach(() => {
    // ✅ FIXED: Cleanup interval to prevent memory leaks in tests
    cache.destroy();
  });

  describe("Cache Get/Set", () => {
    it("should store and retrieve responses", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";
      const response = { content: "response" };

      cache.set(messages, model, response);
      const retrieved = cache.get(messages, model);

      expect(retrieved).toEqual(response);
    });

    it("should return null for non-existent cache", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";

      const retrieved = cache.get(messages, model);

      expect(retrieved).toBeNull();
    });

    it("should differentiate between different messages", () => {
      const messages1 = [{ role: "user", content: "test1" }];
      const messages2 = [{ role: "user", content: "test2" }];
      const model = "test-model";

      cache.set(messages1, model, { content: "response1" });
      cache.set(messages2, model, { content: "response2" });

      expect(cache.get(messages1, model)).toEqual({ content: "response1" });
      expect(cache.get(messages2, model)).toEqual({ content: "response2" });
    });

    it("should differentiate between different models", () => {
      const messages = [{ role: "user", content: "test" }];

      cache.set(messages, "model1", { content: "response1" });
      cache.set(messages, "model2", { content: "response2" });

      expect(cache.get(messages, "model1")).toEqual({ content: "response1" });
      expect(cache.get(messages, "model2")).toEqual({ content: "response2" });
    });
  });

  describe("Cache Expiration", () => {
    it("should expire old entries", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";
      const response = { content: "response" };

      // Mock timestamp to be 6 minutes ago (beyond 5 min TTL)
      const oldTimestamp = Date.now() - 6 * 60 * 1000;
      vi.spyOn(Date, "now").mockReturnValueOnce(oldTimestamp);

      cache.set(messages, model, response);

      // Restore real time
      vi.restoreAllMocks();

      // Should be expired
      const retrieved = cache.get(messages, model);
      expect(retrieved).toBeNull();
    });

    it("should not expire recent entries", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";
      const response = { content: "response" };

      cache.set(messages, model, response);

      // Should still be valid
      const retrieved = cache.get(messages, model);
      expect(retrieved).toEqual(response);
    });
  });

  describe("Cache Hits Tracking", () => {
    it("should track cache hits", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";
      const response = { content: "response" };

      cache.set(messages, model, response);

      // Hit cache multiple times
      cache.get(messages, model);
      cache.get(messages, model);
      cache.get(messages, model);

      const stats = cache.getStats();
      expect(stats.totalHits).toBeGreaterThan(0);
    });
  });

  describe("Cache Size Management", () => {
    it("should enforce max size", () => {
      const model = "test-model";

      // Fill cache beyond max size (100)
      for (let i = 0; i < 110; i++) {
        const messages = [{ role: "user", content: `test${i}` }];
        cache.set(messages, model, { content: `response${i}` });
      }

      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(100);
    });

    it("should remove oldest entries when full", () => {
      const model = "test-model";

      // Add first entry
      const firstMessages = [{ role: "user", content: "first" }];
      cache.set(firstMessages, model, { content: "first-response" });

      // Fill cache
      for (let i = 0; i < 100; i++) {
        const messages = [{ role: "user", content: `test${i}` }];
        cache.set(messages, model, { content: `response${i}` });
      }

      // First entry should be evicted
      const retrieved = cache.get(firstMessages, model);
      expect(retrieved).toBeNull();
    });
  });

  describe("Cache Cleanup", () => {
    it("should remove expired entries during cleanup", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";

      // Mock old timestamp
      const oldTimestamp = Date.now() - 6 * 60 * 1000;
      vi.spyOn(Date, "now").mockReturnValueOnce(oldTimestamp);

      cache.set(messages, model, { content: "response" });

      vi.restoreAllMocks();

      // Run cleanup
      cache.cleanup();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe("Cache Clear", () => {
    it("should clear all entries", () => {
      const messages = [{ role: "user", content: "test" }];
      const model = "test-model";

      cache.set(messages, model, { content: "response" });

      const statsBefore = cache.getStats();
      expect(statsBefore.size).toBe(1);

      cache.clear();

      const statsAfter = cache.getStats();
      expect(statsAfter.size).toBe(0);
    });
  });

  describe("Cache Stats", () => {
    it("should provide accurate stats", () => {
      const stats = cache.getStats();

      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("maxSize");
      expect(stats).toHaveProperty("totalHits");
      expect(stats).toHaveProperty("avgAge");

      expect(stats.maxSize).toBe(100);
    });

    it("should calculate average age correctly", () => {
      const messages1 = [{ role: "user", content: "test1" }];
      const messages2 = [{ role: "user", content: "test2" }];
      const model = "test-model";

      cache.set(messages1, model, { content: "response1" });
      cache.set(messages2, model, { content: "response2" });

      const stats = cache.getStats();
      expect(stats.avgAge).toBeGreaterThanOrEqual(0);
    });
  });
});
