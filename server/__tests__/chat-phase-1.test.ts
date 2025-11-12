/**
 * Server-Side Tests for Phase 1 Chat
 * Tests conversation creation, message sending, and conversation history
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock dependencies
vi.mock("../db", () => ({
  createConversation: vi.fn(),
  createMessage: vi.fn(),
  getConversationMessages: vi.fn(),
}));

vi.mock("../ai-router", () => ({
  routeAI: vi.fn(),
  generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

describe("Phase 1: Server-Side Chat Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Conversation Creation", () => {
    it("should create conversation with title", async () => {
      const { createConversation } = await import("../db");
      vi.mocked(createConversation).mockResolvedValue({
        id: 1,
        userId: 1,
        title: "Friday AI Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createConversation({
        userId: 1,
        title: "Friday AI Chat",
      });

      expect(result.id).toBe(1);
      expect(result.title).toBe("Friday AI Chat");
    });

    it("should create conversation without title", async () => {
      const { createConversation } = await import("../db");
      vi.mocked(createConversation).mockResolvedValue({
        id: 2,
        userId: 1,
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createConversation({
        userId: 1,
      });

      expect(result.id).toBe(2);
      expect(result.title).toBe(null);
    });
  });

  describe("Message Sending", () => {
    it("should save user message", async () => {
      const { createMessage } = await import("../db");
      const mockMessage = {
        id: 1,
        conversationId: 1,
        role: "user" as const,
        content: "Hello Friday",
        createdAt: new Date(),
      };

      vi.mocked(createMessage).mockResolvedValue(mockMessage);

      const result = await createMessage({
        conversationId: 1,
        role: "user",
        content: "Hello Friday",
      });

      expect(result.role).toBe("user");
      expect(result.content).toBe("Hello Friday");
    });

    it("should save AI response", async () => {
      const { createMessage } = await import("../db");
      const mockMessage = {
        id: 2,
        conversationId: 1,
        role: "assistant" as const,
        content: "Hello! How can I help?",
        createdAt: new Date(),
      };

      vi.mocked(createMessage).mockResolvedValue(mockMessage);

      const result = await createMessage({
        conversationId: 1,
        role: "assistant",
        content: "Hello! How can I help?",
      });

      expect(result.role).toBe("assistant");
      expect(result.content).toBe("Hello! How can I help?");
    });
  });

  describe("Conversation History", () => {
    it("should load all messages from conversation", async () => {
      const { getConversationMessages } = await import("../db");
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          role: "user" as const,
          content: "First message",
          createdAt: new Date("2025-01-01T10:00:00Z"),
        },
        {
          id: 2,
          conversationId: 1,
          role: "assistant" as const,
          content: "First response",
          createdAt: new Date("2025-01-01T10:00:05Z"),
        },
        {
          id: 3,
          conversationId: 1,
          role: "user" as const,
          content: "Second message",
          createdAt: new Date("2025-01-01T10:01:00Z"),
        },
      ];

      vi.mocked(getConversationMessages).mockResolvedValue(mockMessages);

      const result = await getConversationMessages(1);

      expect(result).toHaveLength(3);
      expect(result[0].content).toBe("First message");
      expect(result[1].content).toBe("First response");
      expect(result[2].content).toBe("Second message");
    });

    it("should return empty array for new conversation", async () => {
      const { getConversationMessages } = await import("../db");
      vi.mocked(getConversationMessages).mockResolvedValue([]);

      const result = await getConversationMessages(999);

      expect(result).toHaveLength(0);
    });
  });

  describe("AI Router Integration", () => {
    it("should send full conversation history to AI", async () => {
      const { routeAI } = await import("../ai-router");
      const { getConversationMessages } = await import("../db");

      const mockHistory = [
        {
          id: 1,
          role: "user" as const,
          content: "Hello",
          createdAt: new Date(),
        },
        {
          id: 2,
          role: "assistant" as const,
          content: "Hi!",
          createdAt: new Date(),
        },
        {
          id: 3,
          role: "user" as const,
          content: "How are you?",
          createdAt: new Date(),
        },
      ];

      vi.mocked(getConversationMessages).mockResolvedValue(mockHistory);
      vi.mocked(routeAI).mockResolvedValue({
        content: "I am doing well, thanks!",
        model: "gemma-3-27b-free",
        usage: { tokens: 50 },
      });

      const messages = mockHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await routeAI({
        messages,
        taskType: "chat",
        userId: 1,
        requireApproval: false,
        correlationId: "test-id",
      });

      expect(routeAI).toHaveBeenCalledWith({
        messages,
        taskType: "chat",
        userId: 1,
        requireApproval: false,
        correlationId: "test-id",
      });

      expect(result.content).toBe("I am doing well, thanks!");
    });

    it("should include tools in AI request", async () => {
      const { routeAI } = await import("../ai-router");

      vi.mocked(routeAI).mockResolvedValue({
        content: "I can help with that!",
        model: "gemma-3-27b-free",
        usage: { tokens: 30 },
      });

      const mockTools = [
        {
          type: "function" as const,
          function: {
            name: "search_gmail",
            description: "Search Gmail",
            parameters: {},
          },
        },
      ];

      await routeAI({
        messages: [{ role: "user", content: "Search my emails" }],
        taskType: "chat",
        userId: 1,
        requireApproval: false,
        correlationId: "test-id",
        tools: mockTools,
      });

      expect(routeAI).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: mockTools,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const { createMessage } = await import("../db");
      vi.mocked(createMessage).mockRejectedValue(new Error("Database error"));

      await expect(
        createMessage({
          conversationId: 1,
          role: "user",
          content: "Test",
        })
      ).rejects.toThrow("Database error");
    });

    it("should handle AI router errors gracefully", async () => {
      const { routeAI } = await import("../ai-router");
      vi.mocked(routeAI).mockRejectedValue(new Error("AI error"));

      await expect(
        routeAI({
          messages: [{ role: "user", content: "Test" }],
          taskType: "chat",
          userId: 1,
          requireApproval: false,
          correlationId: "test-id",
        })
      ).rejects.toThrow("AI error");
    });
  });
});
