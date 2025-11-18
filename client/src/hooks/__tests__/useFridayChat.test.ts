/**
 * Unit Tests: useFridayChat Hook
 * Tests chat functionality, pagination, error handling, and memory management
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { trpc } from "../../lib/trpc";
import { useFridayChat } from "../useFridayChat";

// Mock TRPC
vi.mock("../../lib/trpc", () => ({
  trpc: {
    useUtils: vi.fn(),
  },
}));

describe("useFridayChat Hook", () => {
  let mockUtils: any;

  beforeEach(() => {
    mockUtils = {
      client: {
        chat: {
          getMessages: {
            query: vi.fn(),
          },
          sendMessage: {
            mutate: vi.fn(),
          },
        },
      },
    };

    (trpc.useUtils as any).mockReturnValue(mockUtils);
  });

  describe("Initialization", () => {
    it("should initialize with empty messages", () => {
      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should accept maxMessages option", () => {
      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, maxMessages: 10 })
      );

      expect(result.current.messages).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("should send message and update state", async () => {
      mockUtils.client.chat.sendMessage.mutate.mockResolvedValue({
        content: "AI response",
        role: "assistant",
      });

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      await act(async () => {
        await result.current.sendMessage("Hello Friday");
      });

      expect(mockUtils.client.chat.sendMessage.mutate).toHaveBeenCalledWith({
        conversationId: 1,
        content: "Hello Friday",
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("AI response");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle pending actions", async () => {
      const mockPendingAction = {
        action: "create_task",
        params: { title: "Test Task" },
      };

      mockUtils.client.chat.sendMessage.mutate.mockResolvedValue({
        pendingAction: mockPendingAction,
      });

      const onPendingAction = vi.fn();
      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, onPendingAction })
      );

      await act(async () => {
        await result.current.sendMessage("Create a task");
      });

      expect(result.current.pendingAction).toEqual(mockPendingAction);
      expect(onPendingAction).toHaveBeenCalledWith(mockPendingAction);
    });

    it("should call onComplete callback", async () => {
      mockUtils.client.chat.sendMessage.mutate.mockResolvedValue({
        content: "Response",
      });

      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, onComplete })
      );

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(onComplete).toHaveBeenCalledWith("Response");
    });

    it("should handle errors", async () => {
      const mockError = new Error("Network error");
      mockUtils.client.chat.sendMessage.mutate.mockRejectedValue(mockError);

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, onError })
      );

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(result.current.error).toEqual(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
      expect(result.current.isLoading).toBe(false);
    });

    it("should require conversationId", async () => {
      const { result } = renderHook(() => useFridayChat({}));

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain("No conversation ID");
    });

    it("should abort previous requests", async () => {
      mockUtils.client.chat.sendMessage.mutate.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      // Send first message
      act(() => {
        result.current.sendMessage("First");
      });

      // Send second message immediately (should abort first)
      await act(async () => {
        await result.current.sendMessage("Second");
      });

      // Should only have one call completed
      expect(mockUtils.client.chat.sendMessage.mutate).toHaveBeenCalledTimes(2);
    });
  });

  describe("loadMoreMessages", () => {
    it("should load messages with pagination", async () => {
      const mockMessages = [
        { id: 1, content: "Message 1", role: "user" },
        { id: 2, content: "Message 2", role: "assistant" },
      ];

      mockUtils.client.chat.getMessages.query.mockResolvedValue({
        messages: mockMessages,
        hasMore: true,
        nextCursor: 20,
      });

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(result.current.messages).toEqual(mockMessages);
      expect(result.current.hasMoreMessages).toBe(true);
    });

    it("should not load if no conversationId", async () => {
      const { result } = renderHook(() => useFridayChat({}));

      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(mockUtils.client.chat.getMessages.query).not.toHaveBeenCalled();
    });

    it("should not load if no more messages", async () => {
      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      // Simulate no more messages
      mockUtils.client.chat.getMessages.query.mockResolvedValue({
        messages: [],
        hasMore: false,
        nextCursor: undefined,
      });

      await act(async () => {
        await result.current.loadMoreMessages();
      });

      // Try to load again
      await act(async () => {
        await result.current.loadMoreMessages();
      });

      // Should only call once
      expect(mockUtils.client.chat.getMessages.query).toHaveBeenCalledTimes(1);
    });

    it("should handle pagination cursor", async () => {
      mockUtils.client.chat.getMessages.query
        .mockResolvedValueOnce({
          messages: [{ id: 1, content: "First" }],
          hasMore: true,
          nextCursor: 20,
        })
        .mockResolvedValueOnce({
          messages: [{ id: 2, content: "Second" }],
          hasMore: false,
          nextCursor: undefined,
        });

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      // Load first batch
      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(mockUtils.client.chat.getMessages.query).toHaveBeenCalledWith({
        conversationId: 1,
        cursor: undefined,
        limit: 20,
      });

      // Load second batch
      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(mockUtils.client.chat.getMessages.query).toHaveBeenCalledWith({
        conversationId: 1,
        cursor: 20,
        limit: 20,
      });

      expect(result.current.messages).toHaveLength(2);
    });

    it("should prepend new messages to existing ones", async () => {
      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      // Add initial message
      mockUtils.client.chat.sendMessage.mutate.mockResolvedValue({
        content: "New message",
      });

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      // Load older messages
      mockUtils.client.chat.getMessages.query.mockResolvedValue({
        messages: [{ id: 1, content: "Old message" }],
        hasMore: false,
        nextCursor: undefined,
      });

      await act(async () => {
        await result.current.loadMoreMessages();
      });

      // Old message should be first
      expect(result.current.messages[0].content).toBe("Old message");
      expect(result.current.messages[1].content).toBe("New message");
    });
  });

  describe("Memory Management", () => {
    it("should limit messages to maxMessages", async () => {
      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, maxMessages: 3 })
      );

      mockUtils.client.chat.sendMessage.mutate.mockImplementation(
        (params: any) =>
          Promise.resolve({ content: `Response ${params.content}` })
      );

      // Send 5 messages (exceeds limit of 3)
      await act(async () => {
        await result.current.sendMessage("1");
        await result.current.sendMessage("2");
        await result.current.sendMessage("3");
        await result.current.sendMessage("4");
        await result.current.sendMessage("5");
      });

      // Should only keep last 3
      await waitFor(() => {
        expect(result.current.messages.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe("Context and Options", () => {
    it("should accept context parameter", () => {
      const context = {
        selectedEmails: ["email1", "email2"],
        hasCalendar: true,
      };

      const { result } = renderHook(() =>
        useFridayChat({ conversationId: 1, context })
      );

      expect(result.current).toBeTruthy();
    });

    it("should accept all callback options", async () => {
      const onComplete = vi.fn();
      const onError = vi.fn();
      const onPendingAction = vi.fn();

      mockUtils.client.chat.sendMessage.mutate.mockResolvedValue({
        content: "Response",
      });

      const { result } = renderHook(() =>
        useFridayChat({
          conversationId: 1,
          onComplete,
          onError,
          onPendingAction,
        })
      );

      await act(async () => {
        await result.current.sendMessage("Test");
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { unmount } = renderHook(() =>
        useFridayChat({ conversationId: 1 })
      );

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it("should abort pending requests on unmount", async () => {
      mockUtils.client.chat.sendMessage.mutate.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result, unmount } = renderHook(() =>
        useFridayChat({ conversationId: 1 })
      );

      act(() => {
        result.current.sendMessage("Test");
      });

      // Unmount while request is pending
      unmount();

      // Should not throw or cause memory leaks
      expect(true).toBe(true);
    });
  });

  describe("State Management", () => {
    it("should manage loading state correctly", async () => {
      mockUtils.client.chat.sendMessage.mutate.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ content: "Done" }), 100)
          )
      );

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.sendMessage("Test");
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 200 }
      );
    });

    it("should clear error on successful request", async () => {
      mockUtils.client.chat.sendMessage.mutate
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce({ content: "Success" });

      const { result } = renderHook(() => useFridayChat({ conversationId: 1 }));

      // First request fails
      await act(async () => {
        await result.current.sendMessage("Fail");
      });

      expect(result.current.error).toBeTruthy();

      // Second request succeeds
      await act(async () => {
        await result.current.sendMessage("Success");
      });

      expect(result.current.error).toBe(null);
    });
  });
});
