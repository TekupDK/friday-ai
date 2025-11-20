/**
 * Tests for AI Ghostwriter Feature
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDb } from "../db";
import {
  analyzeWritingStyle,
  getWritingStyle,
  generateGhostwriterReply,
  learnFromFeedback,
} from "../email-intelligence/ghostwriter";
import { userWritingStyles, emailResponseFeedback } from "../../drizzle/schema";

// Mock dependencies
vi.mock("../db");
vi.mock("../ai-router");
vi.mock("../action-audit");
vi.mock("../_core/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AI Ghostwriter", () => {
  const mockUserId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWritingStyle", () => {
    it("should return null if no style exists", async () => {
      const db = await getDb();
      if (db) {
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);
      }

      const result = await getWritingStyle(mockUserId);

      expect(result).toBeNull();
    });

    it("should return existing style if found", async () => {
      const mockStyle = {
        id: 1,
        userId: mockUserId,
        tone: "professional",
        averageLength: 250,
        formalityLevel: "semi-formal",
        commonPhrases: ["Tak for din mail"],
        signature: "Med venlig hilsen",
        openingPatterns: ["Hej"],
        closingPatterns: ["Venlig hilsen"],
        language: "da",
        sampleCount: 10,
      };

      const db = await getDb();
      if (db) {
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockStyle]),
            }),
          }),
        } as any);
      }

      const result = await getWritingStyle(mockUserId);

      expect(result).toBeDefined();
      expect(result?.tone).toBe("professional");
    });
  });

  describe("generateGhostwriterReply", () => {
    it("should generate reply using learned style", async () => {
      const mockStyle = {
        id: 1,
        userId: mockUserId,
        tone: "professional",
        averageLength: 250,
        formalityLevel: "semi-formal",
        commonPhrases: ["Tak for din mail"],
        signature: "Med venlig hilsen",
        openingPatterns: ["Hej"],
        closingPatterns: ["Venlig hilsen"],
        language: "da",
        sampleCount: 10,
      };

      const db = await getDb();
      if (db) {
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockStyle]),
            }),
          }),
        } as any);
      }

      const { routeAI } = await import("../ai-router");
      vi.mocked(routeAI).mockResolvedValue({
        content: "Hej,\n\nTak for din mail. Jeg vender tilbage snarest.\n\nMed venlig hilsen",
      } as any);

      const { generateCorrelationId } = await import("../action-audit");
      vi.mocked(generateCorrelationId).mockReturnValue("test-correlation-id");

      const result = await generateGhostwriterReply(mockUserId, {
        threadId: "thread-123",
        subject: "Test Email",
        from: "test@example.com",
        body: "Hej, kan du hjælpe mig?",
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("learnFromFeedback", () => {
    it("should save feedback to database", async () => {
      const db = await getDb();
      if (db) {
        const mockInsert = vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        });

        vi.mocked(db.insert).mockReturnValue(mockInsert as any);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: 1 },
              { id: 2 },
              { id: 3 },
            ]),
          }),
        } as any);
      }

      await learnFromFeedback(mockUserId, {
        originalSuggestion: "Tak for din mail",
        editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
        threadId: "thread-123",
      });

      expect(db?.insert).toHaveBeenCalled();
    });
  });
});
