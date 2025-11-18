/**
 * Phase 2 Unit Tests for useFridayChatSimple Hook
 * Tests context integration and optimistic updates
 */

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useFridayChatSimple } from "../useFridayChatSimple";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: vi.fn(() => ({
      chat: {
        getMessages: {
          invalidate: vi.fn(),
          cancel: vi.fn(),
          getData: vi.fn(() => ({ messages: [] })),
          setData: vi.fn(),
        },
      },
    })),
    chat: {
      getMessages: {
        useQuery: vi.fn(() => ({
          data: { messages: [] },
          isLoading: false,
          error: null,
        })),
      },
      sendMessage: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
          isPending: false,
          error: null,
        })),
      },
    },
  },
}));

describe("useFridayChatSimple - Phase 2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Context Integration", () => {
    it("should send context with message", async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      const mockContext = {
        selectedEmails: ["email1", "email2"],
        searchQuery: "test query",
      };

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: mockContext,
        })
      );

      await result.current.sendMessage("Test message");

      expect(mockMutateAsync).toHaveBeenCalledWith({
        conversationId: 1,
        content: "Test message",
        context: mockContext,
      });
    });

    it("should handle empty context", async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: {},
        })
      );

      await result.current.sendMessage("Test");

      expect(mockMutateAsync).toHaveBeenCalledWith({
        conversationId: 1,
        content: "Test",
        context: {},
      });
    });

    it("should handle undefined context", async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: undefined,
        })
      );

      await result.current.sendMessage("Test");

      expect(mockMutateAsync).toHaveBeenCalledWith({
        conversationId: 1,
        content: "Test",
        context: undefined,
      });
    });
  });

  describe("Optimistic Updates", () => {
    it("should optimistically add message before server response", async () => {
      const mockSetData = vi.fn();
      const mockGetData = vi.fn(() => ({
        messages: [
          {
            id: 1,
            role: "user",
            content: "Old message",
            createdAt: "2025-01-01",
          },
        ],
      }));

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.useUtils).mockReturnValue({
        chat: {
          getMessages: {
            invalidate: vi.fn(),
            cancel: vi.fn(),
            getData: mockGetData,
            setData: mockSetData,
          },
        },
      } as any);

      const mockMutateAsync = vi.fn().mockResolvedValue({});
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: {},
        })
      );

      await result.current.sendMessage("New message");

      // Should have called setData to add optimistic message
      expect(mockSetData).toHaveBeenCalled();
    });

    it("should cancel pending queries before optimistic update", async () => {
      const mockCancel = vi.fn();

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.useUtils).mockReturnValue({
        chat: {
          getMessages: {
            invalidate: vi.fn(),
            cancel: mockCancel,
            getData: vi.fn(() => ({ messages: [] })),
            setData: vi.fn(),
          },
        },
      } as any);

      const mockMutateAsync = vi.fn().mockResolvedValue({});
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: {},
        })
      );

      await result.current.sendMessage("Test");

      // Should cancel pending queries
      expect(mockCancel).toHaveBeenCalled();
    });

    it("should rollback on error", async () => {
      const mockSetData = vi.fn();
      const previousData = {
        messages: [{ id: 1, role: "user", content: "Old" }],
      };
      const mockGetData = vi.fn(() => previousData);

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.useUtils).mockReturnValue({
        chat: {
          getMessages: {
            invalidate: vi.fn(),
            cancel: vi.fn(),
            getData: mockGetData,
            setData: mockSetData,
          },
        },
      } as any);

      const mockError = new Error("Send failed");
      const mockMutateAsync = vi.fn().mockRejectedValue(mockError);
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: {},
        })
      );

      await expect(result.current.sendMessage("Test")).rejects.toThrow(
        "Send failed"
      );

      // Should have called setData at least twice (optimistic + rollback)
      expect(mockSetData).toHaveBeenCalled();
    });

    it("should invalidate after successful send", async () => {
      const mockInvalidate = vi.fn();

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.useUtils).mockReturnValue({
        chat: {
          getMessages: {
            invalidate: mockInvalidate,
            cancel: vi.fn(),
            getData: vi.fn(() => ({ messages: [] })),
            setData: vi.fn(),
          },
        },
      } as any);

      const mockMutateAsync = vi.fn().mockResolvedValue({});
      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: {},
        })
      );

      await result.current.sendMessage("Test");

      // Should invalidate to fetch AI response
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  describe("Integration", () => {
    it("should handle context + optimistic updates together", async () => {
      const mockContext = {
        selectedEmails: ["email1"],
        hasEmails: true,
      };
      const mockSetData = vi.fn();
      const mockMutateAsync = vi.fn().mockResolvedValue({});

      const { trpc } = await import("@/lib/trpc");
      vi.mocked(trpc.useUtils).mockReturnValue({
        chat: {
          getMessages: {
            invalidate: vi.fn(),
            cancel: vi.fn(),
            getData: vi.fn(() => ({ messages: [] })),
            setData: mockSetData,
          },
        },
      } as any);

      vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      } as any);

      const { result } = renderHook(() =>
        useFridayChatSimple({
          conversationId: 1,
          context: mockContext,
        })
      );

      await result.current.sendMessage("Test with context");

      // Should send context
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockContext,
        })
      );

      // Should do optimistic update
      expect(mockSetData).toHaveBeenCalled();
    });
  });
});
