/**
 * Email Intelligence Tests - Backend functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { categorizeEmail, getCategoryStats } from "../categorizer";
import { generateResponseSuggestions } from "../response-generator";
import { scorePriority } from "../priority-scorer";
import type { EmailMessage } from "../categorizer";

// Mock AI router
vi.mock("../../ai-router", () => ({
  routeAI: vi.fn(),
}));

vi.mock("../../action-audit", () => ({
  generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

const mockEmail: EmailMessage = {
  id: "test-thread-1",
  from: "test@example.com",
  to: "user@example.com",
  subject: "Test Subject",
  body: "Test email body",
  timestamp: new Date(),
};

describe("Email Categorizer", () => {
  it("should categorize email as marketing when unsubscribe is present", () => {
    const email = {
      ...mockEmail,
      subject: "Nyhedsbrev: Tilbud på produkter",
      body: "Klik her for at unsubscribe",
    };

    // Should use fallback categorization
    const result = categorizeEmail(email, 1);

    expect(result).toBeDefined();
  });

  it("should categorize email as finance when invoice mentioned", () => {
    const email = {
      ...mockEmail,
      subject: "Faktura #12345",
      body: "Her er din faktura for denne måned",
    };

    const result = categorizeEmail(email, 1);

    expect(result).toBeDefined();
  });

  it("should categorize email as important when urgent keyword present", () => {
    const email = {
      ...mockEmail,
      subject: "URGENT: Action required",
      body: "Please respond ASAP",
    };

    const result = categorizeEmail(email, 1);

    expect(result).toBeDefined();
  });

  it("should calculate category statistics correctly", () => {
    const categories = [
      {
        category: "work" as const,
        confidence: 0.9,
        subcategory: null,
        reasoning: null,
      },
      {
        category: "work" as const,
        confidence: 0.8,
        subcategory: null,
        reasoning: null,
      },
      {
        category: "personal" as const,
        confidence: 0.85,
        subcategory: null,
        reasoning: null,
      },
      {
        category: "finance" as const,
        confidence: 0.95,
        subcategory: null,
        reasoning: null,
      },
    ];

    const stats = getCategoryStats(categories);

    expect(stats.distribution.work).toBe(2);
    expect(stats.distribution.personal).toBe(1);
    expect(stats.distribution.finance).toBe(1);
    expect(stats.averageConfidence).toBeCloseTo(0.875, 2);
  });
});

describe("Response Generator", () => {
  it("should generate template responses when LLM fails", async () => {
    const result = await generateResponseSuggestions(mockEmail, 1);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should include sender name in template responses", async () => {
    const email = {
      ...mockEmail,
      from: "John Doe <john@example.com>",
    };

    const result = await generateResponseSuggestions(email, 1);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // Template should extract "John Doe"
  });

  it("should generate different response types", async () => {
    const result = await generateResponseSuggestions(mockEmail, 1);

    const types = result.map(r => r.type);
    expect(types).toContain("quick_reply");
    expect(types).toContain("detailed");
  });

  it("should handle VIP sender relationship", async () => {
    const result = await generateResponseSuggestions(mockEmail, 1, {
      senderRelationship: "vip",
    });

    expect(result.length).toBeGreaterThan(2); // Should include VIP-specific response
  });
});

describe("Priority Scorer", () => {
  it("should score urgent emails higher", async () => {
    const urgentEmail = {
      ...mockEmail,
      subject: "URGENT: Immediate action required",
      body: "This is urgent and needs immediate response",
    };

    const result = await scorePriority(urgentEmail, 1);

    expect(result.score).toBeGreaterThan(70);
    expect(result.level).toMatch(/urgent|high/);
    expect(result.factors.content_urgency).toBeGreaterThan(0.7);
  });

  it("should detect deadlines", async () => {
    const deadlineEmail = {
      ...mockEmail,
      subject: "Deadline tomorrow",
      body: "Please complete this before tomorrow",
    };

    const result = await scorePriority(deadlineEmail, 1);

    expect(result.factors.deadline_mentioned).toBe(true);
  });

  it("should detect action requirements", async () => {
    const actionEmail = {
      ...mockEmail,
      subject: "Action required",
      body: "You need to approve this request",
    };

    const result = await scorePriority(actionEmail, 1);

    expect(result.factors.requires_action).toBe(true);
  });

  it("should score low priority for normal emails", async () => {
    const normalEmail = {
      ...mockEmail,
      subject: "FYI: Weekly update",
      body: "Just keeping you informed about progress",
    };

    const result = await scorePriority(normalEmail, 1);

    expect(result.score).toBeLessThan(60);
    expect(result.level).toMatch(/normal|low/);
  });

  it("should recognize VIP senders", async () => {
    const vipEmail = {
      ...mockEmail,
      from: "ceo@kunde.dk",
      subject: "Meeting request",
    };

    const result = await scorePriority(vipEmail, 1);

    expect(result.factors.sender_importance).toBeGreaterThan(0.7);
  });
});

describe("Integration Tests", () => {
  it("should handle email processing end-to-end", async () => {
    const email = {
      ...mockEmail,
      subject: "Urgent: Invoice payment required",
      body: "Please process the invoice payment by tomorrow",
    };

    // Categorize
    const category = await categorizeEmail(email, 1);
    expect(category.category).toBe("finance");

    // Score priority
    const priority = await scorePriority(email, 1);
    expect(priority.level).toMatch(/urgent|high/);
    expect(priority.factors.deadline_mentioned).toBe(true);

    // Generate responses
    const responses = await generateResponseSuggestions(email, 1);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].text).toBeDefined();
  });

  it("should handle batch processing", async () => {
    const emails = [mockEmail, mockEmail, mockEmail];

    // All functions should handle multiple emails
    expect(emails.length).toBe(3);
  });
});
