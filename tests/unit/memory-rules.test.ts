/**
 * Memory Rules Unit Tests
 * Tests for Friday AI memory rules enforcement
 */

import { describe, expect, it } from "vitest";

import { AI_MEMORY_RULES, applyMemoryRules } from "../../shared/ai/memory-rules";

describe("Memory Rules", () => {
  describe("MEMORY_15 - Round hours only", () => {
    it("should accept round hours (00 minutes)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "09:00" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(true);
      expect(context.proposedTime).toBe("09:00");
    });

    it("should accept half hours (30 minutes)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "09:30" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(true);
      expect(context.proposedTime).toBe("09:30");
    });

    it("should round 9:15 to 9:00 (preserving hours)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "09:15" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(false); // Violation
      expect(context.proposedTime).toBe("09:00"); // Rounded down, hours preserved
    });

    it("should round 9:45 to 9:30 (preserving hours)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "09:45" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(false); // Violation
      expect(context.proposedTime).toBe("09:30"); // Rounded to nearest half hour
    });

    it("should round 10:07 to 10:00 (preserving hours)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "10:07" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(false); // Violation
      expect(context.proposedTime).toBe("10:00"); // Rounded down, hours preserved
    });

    it("should round 14:22 to 14:30 (preserving hours)", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "14:22" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(false); // Violation
      expect(context.proposedTime).toBe("14:30"); // Rounded to nearest half hour
    });

    it("should handle single-digit hours", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = { proposedTime: "9:15" };
      const result = await rule!.enforcement(context);
      expect(result).toBe(false); // Violation
      expect(context.proposedTime).toBe("09:00"); // Hours padded, rounded down
    });

    it("should return true if no proposedTime", async () => {
      const rule = AI_MEMORY_RULES.find(r => r.id === "MEMORY_15");
      expect(rule).toBeDefined();

      const context = {};
      const result = await rule!.enforcement(context);
      expect(result).toBe(true); // No validation needed
    });
  });

  describe("applyMemoryRules", () => {
    it("should apply all rules and return violations", async () => {
      const context = {
        proposedTime: "09:15", // Violates MEMORY_15
        calendarEvent: { attendees: ["test@example.com"] }, // Violates MEMORY_19
      };

      const result = await applyMemoryRules(context);
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it("should pass when all rules are satisfied", async () => {
      const context = {
        proposedTime: "09:00", // Valid round hour
        calendarEvent: {}, // No attendees
      };

      const result = await applyMemoryRules(context);
      // May have warnings but should have no CRITICAL violations
      expect(result.violations.length).toBe(0);
    });
  });
});
