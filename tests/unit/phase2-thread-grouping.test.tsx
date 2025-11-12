/**
 * Phase 2 Unit Tests - Thread Grouping & Conversations
 *
 * Tests for:
 * - Thread grouping logic
 * - Thread statistics calculation
 * - Thread expansion state
 * - EmailThreadGroup component rendering
 */

import { describe, it, expect } from "vitest";
import {
  groupEmailsByThread,
  sortThreads,
  calculateThreadStats,
  searchThreads,
  getThreadSummary,
  threadMatchesSource,
} from "../../client/src/utils/thread-grouping";
import type { EnhancedEmailMessage } from "../../client/src/types/enhanced-email";
import type { EmailThread } from "../../client/src/types/email-thread";

// Helper to create mock emails
const createMockEmail = (
  overrides: Partial<EnhancedEmailMessage> = {}
): EnhancedEmailMessage => {
  const date = overrides.date || new Date().toISOString();
  const internalDate =
    overrides.internalDate !== undefined
      ? overrides.internalDate
      : new Date(date).getTime();

  return {
    id: `email-${Math.random()}`,
    threadId: "thread-1",
    subject: "Test Subject",
    from: "test@example.com",
    to: "user@example.com",
    sender: "Test User",
    date,
    internalDate,
    body: "Test body",
    snippet: "Test snippet",
    unread: false,
    labels: [],
    hasAttachment: false,
    ...overrides,
  };
};

describe("Phase 2: Thread Grouping Logic", () => {
  it("should group emails by SENDER correctly", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({
        from: "customer1@example.com",
        subject: "First email",
      }),
      createMockEmail({
        from: "customer1@example.com",
        subject: "Second email",
      }),
      createMockEmail({
        from: "customer2@example.com",
        subject: "Different customer",
      }),
    ];

    const threads = groupEmailsByThread(emails);

    // Should have 2 threads (one per unique sender)
    expect(threads).toHaveLength(2);
    // First thread should have 2 messages from customer1
    expect(
      threads.find(t => t.id === "customer1@example.com")?.messageCount
    ).toBe(2);
    // Second thread should have 1 message from customer2
    expect(
      threads.find(t => t.id === "customer2@example.com")?.messageCount
    ).toBe(1);
  });

  it("should calculate unread count per thread", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({ from: "customer@example.com", unread: true }),
      createMockEmail({ from: "customer@example.com", unread: true }),
      createMockEmail({ from: "customer@example.com", unread: false }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].unreadCount).toBe(2);
  });

  it("should track latest message correctly", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({
        from: "customer@example.com",
        date: "2025-11-09T10:00:00Z",
        subject: "Oldest",
      }),
      createMockEmail({
        from: "customer@example.com",
        date: "2025-11-09T12:00:00Z",
        subject: "Latest",
      }),
      createMockEmail({
        from: "customer@example.com",
        date: "2025-11-09T11:00:00Z",
        subject: "Middle",
      }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].latestMessage.subject).toBe("Latest");
  });

  it("should calculate max lead score for thread", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({
        from: "customer@example.com",
        aiAnalysis: {
          leadScore: 50,
          source: null,
          estimatedValue: 0,
          urgency: "low",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
      createMockEmail({
        from: "customer@example.com",
        aiAnalysis: {
          leadScore: 85,
          source: null,
          estimatedValue: 0,
          urgency: "high",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
      createMockEmail({
        from: "customer@example.com",
        aiAnalysis: {
          leadScore: 60,
          source: null,
          estimatedValue: 0,
          urgency: "medium",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].maxLeadScore).toBe(85);
  });

  it("should track participants in thread", () => {
    // Note: With sender-based grouping, each sender gets their own thread
    // This test now verifies a single participant per thread
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({ from: "alice@example.com" }),
      createMockEmail({ from: "alice@example.com" }),
      createMockEmail({ from: "alice@example.com" }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].participants).toHaveLength(1);
    expect(threads[0].participants).toContain("alice@example.com");
  });

  it("should detect attachments in thread", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({ from: "customer@example.com", hasAttachment: false }),
      createMockEmail({ from: "customer@example.com", hasAttachment: true }),
      createMockEmail({ from: "customer@example.com", hasAttachment: false }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].hasAttachments).toBe(true);
  });

  it("should detect starred messages in thread", () => {
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({ from: "customer@example.com", labels: [] }),
      createMockEmail({ from: "customer@example.com", labels: ["starred"] }),
      createMockEmail({ from: "customer@example.com", labels: [] }),
    ];

    const threads = groupEmailsByThread(emails);

    expect(threads[0].isStarred).toBe(true);
  });
});

describe("Phase 2: Thread Sorting", () => {
  it("should sort threads by date (newest first)", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail({ date: "2025-11-09T10:00:00Z" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail({ date: "2025-11-09T12:00:00Z" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const sorted = sortThreads(threads, "date", "desc");

    expect(sorted[0].id).toBe("thread-2"); // Newest first
  });

  it("should sort threads by lead score (highest first)", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 50,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 85,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const sorted = sortThreads(threads, "leadScore", "desc");

    expect(sorted[0].id).toBe("thread-2"); // Highest score first
  });

  it("should sort threads by unread count", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 1,
        messageCount: 3,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 5,
        messageCount: 5,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const sorted = sortThreads(threads, "unreadCount", "desc");

    expect(sorted[0].id).toBe("thread-2"); // Most unread first
  });
});

describe("Phase 2: Thread Statistics", () => {
  it("should calculate total messages across threads", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 3,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 5,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const stats = calculateThreadStats(threads);

    expect(stats.totalThreads).toBe(2);
    expect(stats.totalMessages).toBe(8);
  });

  it("should count hot lead threads correctly", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 85, // Hot lead (>= 70)
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 50, // Not hot
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const stats = calculateThreadStats(threads);

    expect(stats.hotLeadThreads).toBe(1);
  });

  it("should calculate total value across threads", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 2000,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail(),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 3000,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const stats = calculateThreadStats(threads);

    expect(stats.totalValue).toBe(5000);
  });
});

describe("Phase 2: Thread Search", () => {
  it("should search threads by subject", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail({ subject: "Rengøring tilbud" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail({ subject: "Different topic" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const results = searchThreads(threads, "rengøring");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("thread-1");
  });

  it("should search threads by sender", () => {
    const threads: EmailThread[] = [
      {
        id: "thread-1",
        messages: [],
        latestMessage: createMockEmail({ from: "john@example.com" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
      {
        id: "thread-2",
        messages: [],
        latestMessage: createMockEmail({ from: "jane@example.com" }),
        unreadCount: 0,
        messageCount: 1,
        maxLeadScore: 0,
        totalEstimatedValue: 0,
        participants: [],
        hasAttachments: false,
        isStarred: false,
        source: null,
        labels: [],
      },
    ];

    const results = searchThreads(threads, "john");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("thread-1");
  });
});

describe("Phase 2: Thread Helper Functions", () => {
  it("should generate thread summary for multi-message threads", () => {
    const thread: EmailThread = {
      id: "thread-1",
      messages: [createMockEmail(), createMockEmail(), createMockEmail()],
      latestMessage: createMockEmail(),
      unreadCount: 2,
      messageCount: 3,
      maxLeadScore: 75,
      totalEstimatedValue: 2000,
      participants: [],
      hasAttachments: false,
      isStarred: false,
      source: null,
      labels: [],
    };

    const summary = getThreadSummary(thread);

    expect(summary).toContain("3 messages");
    expect(summary).toContain("2 unread");
    expect(summary).toContain("Hot lead");
  });

  it("should match thread to source filter", () => {
    const thread: EmailThread = {
      id: "thread-1",
      messages: [],
      latestMessage: createMockEmail(),
      unreadCount: 0,
      messageCount: 1,
      maxLeadScore: 0,
      totalEstimatedValue: 0,
      participants: [],
      hasAttachments: false,
      isStarred: false,
      source: "rengoring_nu",
      labels: [],
    };

    expect(threadMatchesSource(thread, "rengoring_nu")).toBe(true);
    expect(threadMatchesSource(thread, "direct")).toBe(false);
    expect(threadMatchesSource(thread, "all")).toBe(true);
  });
});

describe("Phase 2: Integration Tests", () => {
  it("should handle complete thread workflow", () => {
    // Create diverse emails from different senders
    const emails: EnhancedEmailMessage[] = [
      createMockEmail({
        from: "rendstelsje@example.com",
        subject: "Rengøring tilbud",
        unread: true,
        aiAnalysis: {
          leadScore: 85,
          source: "rengoring_nu",
          estimatedValue: 2000,
          urgency: "high",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
      createMockEmail({
        from: "rendstelsje@example.com",
        subject: "RE: Rengøring tilbud",
        unread: false,
        aiAnalysis: {
          leadScore: 70,
          source: "rengoring_nu",
          estimatedValue: 0,
          urgency: "medium",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
      createMockEmail({
        from: "another@example.com",
        subject: "Another email",
        unread: false,
        aiAnalysis: {
          leadScore: 40,
          source: "direct",
          estimatedValue: 500,
          urgency: "low",
          jobType: "",
          location: "",
          confidence: 0,
        },
      }),
    ];

    // Group emails by sender
    const threads = groupEmailsByThread(emails, {
      sortBy: "leadScore",
      sortDirection: "desc",
    });

    // Calculate stats
    const stats = calculateThreadStats(threads);

    // Verify results - should have 2 threads (one per unique sender)
    expect(threads).toHaveLength(2);
    expect(threads[0].maxLeadScore).toBe(85); // Sorted by lead score
    expect(stats.hotLeadThreads).toBe(1);
    expect(stats.totalMessages).toBe(3);
    expect(stats.totalValue).toBe(2500);
  });
});
