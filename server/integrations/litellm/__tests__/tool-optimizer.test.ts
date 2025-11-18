/**
 * Unit Tests for LiteLLM Tool Optimizer
 */

import { describe, it, expect, vi } from "vitest";

import { ToolCallOptimizer } from "../tool-optimizer";

describe("ToolCallOptimizer", () => {
  const optimizer = new ToolCallOptimizer();

  describe("Tool Call Batching", () => {
    it("should execute multiple tool calls in parallel", async () => {
      const mockExecutor = vi.fn(async (name: string, args: any) => {
        return { result: `${name} executed` };
      });

      const toolCalls = [
        { id: "1", function: { name: "checkAvailability", arguments: "{}" } },
        { id: "2", function: { name: "getPricing", arguments: "{}" } },
        { id: "3", function: { name: "getBusinessHours", arguments: "{}" } },
      ];

      const results = await optimizer.batchToolCalls(toolCalls, mockExecutor);

      expect(results).toHaveLength(3);
      expect(mockExecutor).toHaveBeenCalledTimes(3);
      expect(results[0]).toMatchObject({
        tool_call_id: "1",
        name: "checkAvailability",
      });
    });

    it("should handle tool call failures gracefully", async () => {
      const mockExecutor = vi.fn(async (name: string) => {
        if (name === "failingTool") {
          throw new Error("Tool failed");
        }
        return { success: true };
      });

      const toolCalls = [
        { id: "1", function: { name: "goodTool", arguments: "{}" } },
        { id: "2", function: { name: "failingTool", arguments: "{}" } },
      ];

      const results = await optimizer.batchToolCalls(toolCalls, mockExecutor);

      expect(results).toHaveLength(2);
      expect(results[0].result).toEqual({ success: true });
      expect(results[1].result).toHaveProperty("error");
    });
  });

  describe("Tool Caching", () => {
    it("should identify cacheable tools", () => {
      expect(optimizer.canCacheToolResult("getBusinessHours")).toBe(true);
      expect(optimizer.canCacheToolResult("getServicePricing")).toBe(true);
      expect(optimizer.canCacheToolResult("getCompanyInfo")).toBe(true);
    });

    it("should identify non-cacheable tools", () => {
      expect(optimizer.canCacheToolResult("checkAvailability")).toBe(false);
      expect(optimizer.canCacheToolResult("createBooking")).toBe(false);
      expect(optimizer.canCacheToolResult("sendEmail")).toBe(false);
    });
  });

  describe("API Call Estimation", () => {
    it("should estimate API calls correctly for small tool count", () => {
      // 1 initial + 1 batch (up to 5 tools) + 1 final = 3 calls
      expect(optimizer.estimateApiCalls(1)).toBe(3);
      expect(optimizer.estimateApiCalls(3)).toBe(3);
      expect(optimizer.estimateApiCalls(5)).toBe(3);
    });

    it("should estimate API calls correctly for large tool count", () => {
      // 1 initial + 2 batches (5 tools each) + 1 final = 4 calls
      expect(optimizer.estimateApiCalls(6)).toBe(4);
      expect(optimizer.estimateApiCalls(10)).toBe(4);
    });

    it("should estimate API calls correctly for very large tool count", () => {
      // 1 initial + 3 batches + 1 final = 5 calls
      expect(optimizer.estimateApiCalls(15)).toBe(5);
    });
  });

  describe("Priority Suggestion", () => {
    it("should suggest high priority for many tools", () => {
      expect(optimizer.suggestPriority(true, 5)).toBe("high");
      expect(optimizer.suggestPriority(true, 3)).toBe("high");
    });

    it("should suggest medium priority for few tools", () => {
      expect(optimizer.suggestPriority(true, 2)).toBe("medium");
      expect(optimizer.suggestPriority(true, 1)).toBe("medium");
    });

    it("should suggest medium priority for no tools", () => {
      expect(optimizer.suggestPriority(false, 0)).toBe("medium");
    });
  });

  describe("Stats", () => {
    it("should provide stats", () => {
      const stats = optimizer.getStats();

      expect(stats).toHaveProperty("note");
      expect(stats.note).toBe("Tool optimizer active");
    });
  });
});
