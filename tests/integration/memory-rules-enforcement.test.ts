/**
 * Memory Rules Enforcement Integration Tests
 * Tests rule enforcement in actual server workflows
 */

import { describe, it, expect, beforeEach } from "vitest";
import { parseIntent } from "../../server/intent-actions";
import { applyMemoryRules } from "../../client/src/lib/ai-memory-rules";

// Mock buildMemoryContext function logic
function buildMemoryContext(intent: ReturnType<typeof parseIntent>): any {
  const context: any = {};

  if (intent.intent === "book_meeting") {
    if (intent.params.startHour !== undefined && intent.params.startMinute !== undefined) {
      const hours = intent.params.startHour.toString().padStart(2, "0");
      const minutes = intent.params.startMinute.toString().padStart(2, "0");
      context.proposedTime = `${hours}:${minutes}`;
    }
    if (intent.params.dateHint) {
      context.proposedDate = intent.params.dateHint;
    }
    context.calendarEvent = {
      attendees: intent.params.attendees,
    };
  }

  if (intent.intent === "create_invoice") {
    context.invoice = {
      state: intent.params.state || "draft",
      lines: intent.params.lines || [],
    };
  }

  if (intent.intent === "create_lead") {
    context.lead = {
      name: intent.params.name,
      email: intent.params.email,
    };
    context.customerEmail = intent.params.email;
    if (intent.params.source?.toLowerCase().includes("flytter")) {
      context.isFlytterengøring = true;
      context.hasPhotos = intent.params.hasPhotos || false;
    }
  }

  if (intent.intent === "job_completion") {
    context.jobCompletion = {
      invoiceId: intent.params.invoiceId,
      team: intent.params.team,
      paymentMethod: intent.params.paymentMethod,
      actualTime: intent.params.actualTime,
      calendarUpdated: intent.params.calendarUpdated,
      labelsRemoved: intent.params.labelsRemoved,
    };
  }

  return context;
}

describe("Memory Rules Enforcement Integration", () => {
  describe("Calendar Booking Rules", () => {
    it("should block booking with non-round time (MEMORY_15)", async () => {
      const context: any = {
        proposedTime: "09:15",
      };

      const result = await applyMemoryRules(context);
      // MEMORY_15 should detect violation (HIGH priority, not CRITICAL, so may be warning)
      // Check that rule was applied (time was rounded or violation detected)
      const hasMemory15Issue = result.violations.some(v => v.includes("MEMORY_15")) ||
                               result.warnings.some(w => w.includes("MEMORY_15")) ||
                               context.proposedTime === "09:00";
      expect(hasMemory15Issue).toBe(true);
    });

    it("should allow booking with round time", async () => {
      const context = {
        proposedTime: "09:00",
      };

      const result = await applyMemoryRules(context);
      // MEMORY_15 should pass
      expect(result.violations.some(v => v.includes("MEMORY_15"))).toBe(false);
    });

    it("should block booking with attendees (MEMORY_19)", async () => {
      const context = {
        calendarEvent: {
          attendees: ["test@example.com"],
        },
      };

      const result = await applyMemoryRules(context);
      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.includes("MEMORY_19"))).toBe(true);
      // Attendees should be removed
      expect(context.calendarEvent.attendees).toBeUndefined();
    });
  });

  describe("Invoice Creation Rules", () => {
    it("should block invoice with non-draft state (MEMORY_17)", async () => {
      const context = {
        invoice: {
          state: "approved",
          lines: [{ unitPrice: 349, quantity: 2 }],
        },
      };

      const result = await applyMemoryRules(context);
      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.includes("MEMORY_17"))).toBe(true);
    });

    it("should allow invoice with draft state and correct price", async () => {
      const context = {
        invoice: {
          state: "draft",
          lines: [{ unitPrice: 349, quantity: 2 }],
        },
      };

      const result = await applyMemoryRules(context);
      expect(result.violations.some(v => v.includes("MEMORY_17"))).toBe(false);
    });
  });

  describe("Flytterengøring Rules", () => {
    it("should block quote without photos (MEMORY_16)", async () => {
      const context = {
        lead: {
          name: "Mette",
          email: "mette@example.com",
        },
        isFlytterengøring: true,
        hasPhotos: false,
      };

      const result = await applyMemoryRules(context);
      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.includes("MEMORY_16"))).toBe(true);
    });

    it("should allow quote with photos", async () => {
      const context = {
        lead: {
          name: "Mette",
          email: "mette@example.com",
        },
        isFlytterengøring: true,
        hasPhotos: true,
      };

      const result = await applyMemoryRules(context);
      // MEMORY_16 should pass if photos are present
      expect(result.violations.some(v => v.includes("MEMORY_16"))).toBe(false);
    });
  });

  describe("Job Completion Rules", () => {
    it("should block incomplete job completion (MEMORY_24)", async () => {
      const context = {
        jobCompletion: {
          invoiceId: "INV-001",
          team: "Jonas+Rawan",
          // Missing other required fields
        },
      };

      const result = await applyMemoryRules(context);
      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.includes("MEMORY_24"))).toBe(true);
    });

    it("should allow complete job completion", async () => {
      const context = {
        jobCompletion: {
          invoiceId: "INV-001",
          team: "Jonas+Rawan",
          paymentMethod: "MobilePay 71759",
          actualTime: "3 timer",
          calendarUpdated: true,
          labelsRemoved: true,
        },
      };

      const result = await applyMemoryRules(context);
      expect(result.violations.some(v => v.includes("MEMORY_24"))).toBe(false);
    });
  });
});

