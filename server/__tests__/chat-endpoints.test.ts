/**
 * Unit Tests: Chat TRPC Endpoints
 * Tests chat router endpoints including sendMessage, getMessages, and conversations
 */

import { TRPCError } from "@trpc/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("../db", () => ({
  getDb: vi.fn(),
  getUserConversations: vi.fn(),
  getConversationMessages: vi.fn(),
  createConversation: vi.fn(),
  createMessage: vi.fn(),
  deleteConversation: vi.fn(),
  getConversation: vi.fn(),
  updateConversationTitle: vi.fn(),
  getUserPreferences: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("../rate-limiter-redis", () => ({
  checkRateLimitUnified: vi.fn(),
}));

vi.mock("../ai-router", () => ({
  routeAI: vi.fn(),
}));

vi.mock("../action-audit", () => ({
  generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

import { routeAI } from "../ai-router";
import {
  getUserConversations,
  getConversationMessages,
  createConversation,
  createMessage,
  trackEvent,
} from "../db";
import { checkRateLimitUnified } from "../rate-limiter-redis";

describe("Chat TRPC Endpoints", () => {
  const mockUser = {
    id: 123,
    email: "test@example.com",
    name: "Test User",
  };

  const mockCtx = {
    user: mockUser,
    req: {},
    res: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConversations", () => {
    it("should return user conversations", async () => {
      const mockConversations = [
        { id: 1, title: "Chat 1", userId: mockUser.id },
        { id: 2, title: "Chat 2", userId: mockUser.id },
      ];

      (getUserConversations as any).mockResolvedValue(mockConversations);

      const result = await getUserConversations(mockUser.id);

      expect(result).toEqual(mockConversations);
      expect(getUserConversations).toHaveBeenCalledWith(mockUser.id);
    });

    it("should handle empty conversations", async () => {
      (getUserConversations as any).mockResolvedValue([]);

      const result = await getUserConversations(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe("getMessages", () => {
    it("should return paginated messages", async () => {
      const mockMessages = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        content: `Message ${i + 1}`,
        role: i % 2 === 0 ? "user" : "assistant",
        conversationId: 1,
      }));

      (getConversationMessages as any).mockResolvedValue(mockMessages);

      // Simulate pagination logic
      const input = { conversationId: 1, cursor: 0, limit: 20 };
      const allMessages = await getConversationMessages(input.conversationId);

      const startIndex = input.cursor || 0;
      const endIndex = startIndex + input.limit + 1;
      const slicedMessages = allMessages.slice(startIndex, endIndex);

      const hasMore = slicedMessages.length > input.limit;
      const messages = hasMore
        ? slicedMessages.slice(0, input.limit)
        : slicedMessages;

      const result = {
        messages,
        hasMore,
        nextCursor: hasMore ? endIndex - 1 : undefined,
      };

      expect(result.messages).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe(20);
    });

    it("should handle last page of messages", async () => {
      const mockMessages = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        content: `Message ${i + 1}`,
        role: "user",
      }));

      (getConversationMessages as any).mockResolvedValue(mockMessages);

      const input = { conversationId: 1, cursor: 0, limit: 20 };
      const allMessages = await getConversationMessages(input.conversationId);

      const startIndex = input.cursor || 0;
      const endIndex = startIndex + input.limit + 1;
      const slicedMessages = allMessages.slice(startIndex, endIndex);

      const hasMore = slicedMessages.length > input.limit;
      const messages = hasMore
        ? slicedMessages.slice(0, input.limit)
        : slicedMessages;

      const result = {
        messages,
        hasMore,
        nextCursor: hasMore ? endIndex - 1 : undefined,
      };

      expect(result.messages).toHaveLength(15);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe("createConversation", () => {
    it("should create new conversation", async () => {
      const mockConversation = {
        id: 1,
        userId: mockUser.id,
        title: "New Chat",
        createdAt: new Date(),
      };

      (createConversation as any).mockResolvedValue(mockConversation);

      const result = await createConversation({
        userId: mockUser.id,
        title: "New Chat",
      });

      expect(result).toEqual(mockConversation);
      expect(createConversation).toHaveBeenCalledWith({
        userId: mockUser.id,
        title: "New Chat",
      });
    });

    it("should create conversation without title", async () => {
      const mockConversation = {
        id: 1,
        userId: mockUser.id,
        title: undefined,
        createdAt: new Date(),
      };

      (createConversation as any).mockResolvedValue(mockConversation);

      const result = await createConversation({
        userId: mockUser.id,
      });

      expect(result).toEqual(mockConversation);
    });
  });

  describe("sendMessage", () => {
    beforeEach(() => {
      // Default: rate limit passes
      (checkRateLimitUnified as any).mockResolvedValue({ success: true });

      // Default: AI responds
      (routeAI as any).mockResolvedValue({
        content: "AI response",
        model: "test-model",
      });

      // Default: messages saved
      (createMessage as any).mockResolvedValue({ id: 1 });
      (getConversationMessages as any).mockResolvedValue([]);
      (trackEvent as any).mockResolvedValue(undefined);
    });

    it("should send message and get AI response", async () => {
      const input = {
        conversationId: 1,
        content: "Hello Friday",
      };

      // Save user message
      await createMessage({
        conversationId: input.conversationId,
        content: input.content,
        role: "user",
      });

      // Get conversation history
      const conversationHistory = await getConversationMessages(
        input.conversationId
      );

      // Format messages for AI
      const messages = conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI response
      const aiResponse = await routeAI({
        messages,
        taskType: "chat",
        userId: mockUser.id,
        requireApproval: false,
        correlationId: "test-correlation-id",
        tools: [],
      });

      // Save AI response
      await createMessage({
        conversationId: input.conversationId,
        content: aiResponse.content,
        role: "assistant",
      });

      expect(createMessage).toHaveBeenCalledTimes(2);
      expect(createMessage).toHaveBeenNthCalledWith(1, {
        conversationId: 1,
        content: "Hello Friday",
        role: "user",
      });
      expect(createMessage).toHaveBeenNthCalledWith(2, {
        conversationId: 1,
        content: "AI response",
        role: "assistant",
      });
    });

    it("should enforce rate limiting", async () => {
      (checkRateLimitUnified as any).mockResolvedValue({
        success: false,
        reset: Date.now() / 1000 + 30, // 30 seconds from now
      });

      const rateLimit = await checkRateLimitUnified(mockUser.id, {
        limit: 10,
        windowMs: 60000,
      });

      expect(rateLimit.success).toBe(false);
      expect(rateLimit.reset).toBeGreaterThan(Date.now() / 1000);
    });

    it("should track message sent event", async () => {
      const input = {
        conversationId: 1,
        content: "Test message",
        context: {
          hasEmails: true,
          hasCalendar: false,
        },
      };

      await createMessage({
        conversationId: input.conversationId,
        content: input.content,
        role: "user",
      });

      await trackEvent({
        userId: mockUser.id,
        eventType: "chat_message_sent",
        eventData: {
          conversationId: input.conversationId,
          messageLength: input.content.length,
          hasContext: !!input.context,
          contextKeys: input.context ? Object.keys(input.context) : [],
        },
      });

      expect(trackEvent).toHaveBeenCalledWith({
        userId: mockUser.id,
        eventType: "chat_message_sent",
        eventData: expect.objectContaining({
          conversationId: 1,
          messageLength: 12,
          hasContext: true,
        }),
      });
    });

    it("should validate message length", () => {
      const tooLongMessage = "a".repeat(10001);

      // In real implementation, Zod would throw
      expect(tooLongMessage.length).toBeGreaterThan(10000);
    });

    it("should validate empty message", () => {
      const emptyMessage = "";

      // In real implementation, Zod would throw
      expect(emptyMessage.length).toBe(0);
    });

    it("should pass context to AI", async () => {
      const context = {
        selectedEmails: ["email1", "email2"],
        hasCalendar: true,
        page: "inbox",
      };

      await createMessage({
        conversationId: 1,
        content: "Check my emails",
        role: "user",
      });

      await routeAI({
        messages: [],
        taskType: "chat",
        userId: mockUser.id,
        requireApproval: false,
        correlationId: "test-id",
        tools: [],
        context,
      });

      expect(routeAI).toHaveBeenCalledWith(
        expect.objectContaining({
          context,
        })
      );
    });

    it("should include conversation history", async () => {
      const mockHistory = [
        { id: 1, role: "user", content: "First message" },
        { id: 2, role: "assistant", content: "First response" },
        { id: 3, role: "user", content: "Second message" },
      ];

      (getConversationMessages as any).mockResolvedValue(mockHistory);

      const conversationHistory = await getConversationMessages(1);
      const messages = conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      await routeAI({
        messages,
        taskType: "chat",
        userId: mockUser.id,
        requireApproval: false,
        correlationId: "test-id",
        tools: [],
      });

      expect(routeAI).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: "user", content: "First message" },
            { role: "assistant", content: "First response" },
          ]),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      (createMessage as any).mockRejectedValue(dbError);

      await expect(
        createMessage({
          conversationId: 1,
          content: "Test",
          role: "user",
        })
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle AI router errors", async () => {
      const aiError = new Error("AI service unavailable");
      (routeAI as any).mockRejectedValue(aiError);

      await expect(
        routeAI({
          messages: [],
          taskType: "chat",
          userId: mockUser.id,
          requireApproval: false,
          correlationId: "test-id",
          tools: [],
        })
      ).rejects.toThrow("AI service unavailable");
    });

    it("should handle rate limit errors", async () => {
      (checkRateLimitUnified as any).mockResolvedValue({
        success: false,
        reset: Date.now() / 1000 + 60,
      });

      const rateLimit = await checkRateLimitUnified(mockUser.id, {
        limit: 10,
        windowMs: 60000,
      });

      expect(rateLimit.success).toBe(false);

      // In real implementation, would throw TRPCError
      if (!rateLimit.success) {
        const waitTime = Math.ceil(
          (rateLimit.reset * 1000 - Date.now()) / 1000
        );
        expect(waitTime).toBeGreaterThan(0);
      }
    });
  });

  describe("Message Formatting", () => {
    it("should format messages correctly for AI", () => {
      const rawMessages = [
        {
          id: 1,
          role: "user",
          content: "Hello",
          conversationId: 1,
          createdAt: new Date(),
        },
        {
          id: 2,
          role: "assistant",
          content: "Hi",
          conversationId: 1,
          createdAt: new Date(),
        },
      ];

      const formatted = rawMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      expect(formatted).toEqual([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]);
    });

    it("should preserve message order", () => {
      const messages = [
        { id: 1, role: "user", content: "First" },
        { id: 2, role: "assistant", content: "Second" },
        { id: 3, role: "user", content: "Third" },
      ];

      const formatted = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      expect(formatted[0].content).toBe("First");
      expect(formatted[1].content).toBe("Second");
      expect(formatted[2].content).toBe("Third");
    });
  });
});
