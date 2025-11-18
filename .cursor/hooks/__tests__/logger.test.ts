/**
 * Hook Logger Tests
 * 
 * Tests for logging system
 */

import { describe, it, expect, beforeEach } from "vitest";

import { hookLogger } from "../logger";
import {
  expectLogEntry,
  expectStats,
  expectLogsContainHook,
  expectLogsContainStatus,
} from "../test-utils/assertions";
import type { HookCategory } from "../types";

describe("Hook Logger", () => {
  beforeEach(() => {
    hookLogger.clear();
  });

  describe("Logging", () => {
    it("should log hook start", () => {
      hookLogger.log("test-hook", "pre-execution", "started");
      const logs = hookLogger.getLogs();
      expect(logs.length).toBe(1);
      expectLogEntry(logs[0]);
      expect(logs[0].status).toBe("started");
    });

    it("should log hook completion with duration", () => {
      hookLogger.log("test-hook", "pre-execution", "completed", 100);
      const logs = hookLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe("completed");
      expect(logs[0].duration).toBe(100);
    });

    it("should log hook failure with error", () => {
      hookLogger.log("test-hook", "pre-execution", "failed", 50, "Test error");
      const logs = hookLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe("failed");
      expect(logs[0].error).toBe("Test error");
    });
  });

  describe("Log Filtering", () => {
    beforeEach(() => {
      hookLogger.log("hook-1", "pre-execution", "completed", 100);
      hookLogger.log("hook-2", "post-execution", "completed", 200);
      hookLogger.log("hook-1", "pre-execution", "failed", 50, "Error");
    });

    it("should filter logs by hook name", () => {
      const logs = hookLogger.getLogsForHook("hook-1");
      expect(logs.length).toBe(2);
      logs.forEach((log) => {
        expect(log.hook).toBe("hook-1");
      });
    });

    it("should filter logs by category", () => {
      const logs = hookLogger.getLogsForCategory("pre-execution");
      expect(logs.length).toBe(2);
      logs.forEach((log) => {
        expect(log.category).toBe("pre-execution");
      });
    });
  });

  describe("Statistics", () => {
    beforeEach(() => {
      hookLogger.log("hook-1", "pre-execution", "completed", 100);
      hookLogger.log("hook-2", "pre-execution", "completed", 200);
      hookLogger.log("hook-3", "pre-execution", "failed", 50, "Error");
    });

    it("should calculate statistics correctly", () => {
      const stats = hookLogger.getStats();
      expectStats(stats);
      expect(stats.completed).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.total).toBe(3);
    });

    it("should calculate average duration", () => {
      const stats = hookLogger.getStats();
      expect(stats.avgDuration).toBeGreaterThan(0);
      // Average of 100, 200, and 50 = 116.67 (all hooks have duration)
      // Using 0 precision to allow for rounding differences
      expect(stats.avgDuration).toBeCloseTo(116.67, 0);
    });
  });

  describe("Log Management", () => {
    it("should clear all logs", () => {
      hookLogger.log("hook-1", "pre-execution", "completed");
      hookLogger.clear();
      const logs = hookLogger.getLogs();
      expect(logs.length).toBe(0);
    });

    it("should limit log size", () => {
      // Add more than maxLogs (1000)
      for (let i = 0; i < 1500; i++) {
        hookLogger.log(`hook-${i}`, "pre-execution", "completed");
      }
      const logs = hookLogger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it("should export logs as JSON", () => {
      hookLogger.log("hook-1", "pre-execution", "completed", 100);
      const exported = hookLogger.export();
      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });
  });
});

