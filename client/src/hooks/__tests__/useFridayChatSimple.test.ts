/**
 * Unit Tests for useFridayChatSimple Hook
 * Tests Phase 1 functionality: message loading, sending, and refetch
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFridayChatSimple } from "../useFridayChatSimple";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: vi.fn(() => ({
      chat: {
        getMessages: {
          invalidate: vi.fn(),
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

describe("useFridayChatSimple", () => {
  beforeEach(async () => {
    // Reset mocks and re-seed default implementations between tests
    vi.resetAllMocks();
    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.chat.getMessages.useQuery).mockReturnValue({
      data: { messages: [] },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any);
    vi.mocked(trpc.useUtils).mockReturnValue({
      chat: { getMessages: { invalidate: vi.fn() } },
    } as any);
  });

  it("should initialize with empty messages", () => {
    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: 1,
        context: {},
      })
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should load messages when conversationId is provided", async () => {
    const mockMessages = [
      { id: 1, role: "user", content: "Hello", createdAt: new Date() },
      { id: 2, role: "assistant", content: "Hi there!", createdAt: new Date() },
    ];

    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.chat.getMessages.useQuery).mockReturnValue({
      data: { messages: mockMessages },
      isLoading: false,
      error: null,
    } as any);

    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: 1,
        context: {},
      })
    );

    await waitFor(() => {
      expect(result.current.messages).toEqual(mockMessages);
    });
  });

  it("should not load messages when conversationId is undefined", () => {
    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: undefined,
        context: {},
      })
    );

    expect(result.current.messages).toEqual([]);
  });

  it("should send message and invalidate query", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    const mockInvalidate = vi.fn();

    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.useUtils).mockReturnValue({
      chat: {
        getMessages: {
          invalidate: mockInvalidate,
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
        context: {},
      })
    );

    await result.current.sendMessage("Test message");

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 1,
        content: "Test message",
      })
    );
  });

  it("should handle send message error", async () => {
    const mockError = new Error("Send failed");
    const mockMutateAsync = vi.fn().mockRejectedValue(mockError);

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

    await expect(result.current.sendMessage("Test")).rejects.toThrow(
      "Send failed"
    );
  });

  it("should not send message when conversationId is undefined", async () => {
    const mockMutateAsync = vi.fn();

    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: undefined,
        context: {},
      })
    );

    await result.current.sendMessage("Test");

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should show loading state while sending", async () => {
    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.chat.sendMessage.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    } as any);

    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: 1,
        context: {},
      })
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("should show error state on query error", async () => {
    const mockError = new Error("Load failed");

    const { trpc } = await import("@/lib/trpc");
    vi.mocked(trpc.chat.getMessages.useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    } as any);

    const { result } = renderHook(() =>
      useFridayChatSimple({
        conversationId: 1,
        context: {},
      })
    );

    expect(result.current.error).toBe(mockError);
  });
});
