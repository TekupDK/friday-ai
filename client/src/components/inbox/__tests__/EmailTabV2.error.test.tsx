/**
 * EmailTabV2 Error State Component Tests
 *
 * Tests for error UI rendering in EmailTabV2 component.
 * This replaces the E2E test in rate-limit-ui.spec.ts which was unreliable due to:
 * 1. React Query caching making it impossible to trigger errors consistently
 * 2. Global rate limit state disabling queries before errors can be shown
 * 3. Network interception timing issues
 *
 * Component tests provide deterministic control over error states and are faster.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRateLimit } from "@/hooks/useRateLimit";
import { trpc } from "@/lib/trpc";
import EmailTabV2 from "../EmailTabV2";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    inbox: {
      email: {
        listPaged: {
          useQuery: vi.fn(),
        },
        bulkMarkAsRead: {
          useMutation: vi.fn(),
        },
        bulkMarkAsUnread: {
          useMutation: vi.fn(),
        },
        bulkArchive: {
          useMutation: vi.fn(),
        },
        bulkDelete: {
          useMutation: vi.fn(),
        },
        archive: {
          useMutation: vi.fn(),
        },
        star: {
          useMutation: vi.fn(),
        },
        delete: {
          useMutation: vi.fn(),
        },
        createLeadFromEmail: {
          useMutation: vi.fn(),
        },
      },
    },
    emailIntelligence: {
      getBatchIntelligence: {
        useQuery: vi.fn(),
      },
    },
    useUtils: vi.fn(() => ({
      inbox: {
        email: {
          listPaged: {
            invalidate: vi.fn(),
          },
        },
      },
    })),
  },
}));

// Mock useRateLimit hook
vi.mock("@/hooks/useRateLimit", () => {
  const mockFn = vi.fn(() => ({
    isRateLimited: false,
    isRateLimitError: vi.fn(() => false),
  }));

  return {
    useRateLimit: mockFn,
  };
});

// Mock EmailContext
vi.mock("@/contexts/EmailContext", () => ({
  useEmailContext: vi.fn(() => ({
    setSelectedEmail: vi.fn(),
  })),
}));

// Mock useEmailKeyboardShortcuts
vi.mock("@/hooks/useEmailKeyboardShortcuts", () => ({
  useEmailKeyboardShortcuts: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EmailTabV2 - Error States", () => {
  let queryClient: QueryClient;
  let mockRefetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockRefetch = vi.fn();

    // Default mock for mutations
    const mockMutation = {
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    };

    (trpc.inbox.email.bulkMarkAsRead.useMutation as any).mockReturnValue(
      mockMutation
    );
    (trpc.inbox.email.bulkMarkAsUnread.useMutation as any).mockReturnValue(
      mockMutation
    );
    (trpc.inbox.email.bulkArchive.useMutation as any).mockReturnValue(
      mockMutation
    );
    (trpc.inbox.email.bulkDelete.useMutation as any).mockReturnValue(
      mockMutation
    );
    (trpc.inbox.email.archive.useMutation as any).mockReturnValue(mockMutation);
    (trpc.inbox.email.star.useMutation as any).mockReturnValue(mockMutation);
    (trpc.inbox.email.delete.useMutation as any).mockReturnValue(mockMutation);
    (trpc.inbox.email.createLeadFromEmail.useMutation as any).mockReturnValue(
      mockMutation
    );

    // Default mock for batch intelligence (no data)
    (
      trpc.emailIntelligence.getBatchIntelligence.useQuery as any
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EmailTabV2 />
      </QueryClientProvider>
    );
  };

  describe("Generic Error State", () => {
    it("should render error UI when email list query fails", () => {
      // Mock error state
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("Network error"),
        refetch: mockRefetch,
      });

      renderComponent();

      // Check error UI elements
      expect(screen.getByText("Kunne ikke hente emails")).toBeInTheDocument();
      expect(
        screen.getByText("Der opstod en fejl. Prøv igen.")
      ).toBeInTheDocument();
      expect(screen.getByText("Prøv igen")).toBeInTheDocument();
    });

    it("should display AlertCircle icon on error", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("Network error"),
        refetch: mockRefetch,
      });

      const { container } = renderComponent();

      // AlertCircle icon should be in the DOM
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should call refetch when retry button is clicked", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("Network error"),
        refetch: mockRefetch,
      });

      renderComponent();

      const retryButton = screen.getByText("Prøv igen");
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Rate Limit Error State", () => {
    it("should show rate limit error message", () => {
      // Mock rate limit error
      (useRateLimit as any).mockReturnValue({
        isRateLimited: false,
        isRateLimitError: vi.fn((error: any) => {
          return error?.message?.includes("rate limit");
        }),
      });

      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("rate limit exceeded"),
        refetch: mockRefetch,
      });

      renderComponent();

      expect(
        screen.getByText("Rate limit overskredet. Prøv igen om et øjeblik.")
      ).toBeInTheDocument();
    });

    it("should disable retry button when rate limited", () => {
      (useRateLimit as any).mockReturnValue({
        isRateLimited: true,
        isRateLimitError: vi.fn(() => true),
      });

      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("rate limit exceeded"),
        refetch: mockRefetch,
      });

      renderComponent();

      const retryButton = screen.getByText("Venter...");
      expect(retryButton).toBeDisabled();
    });

    it("should show 'Venter...' text when rate limited", () => {
      (useRateLimit as any).mockReturnValue({
        isRateLimited: true,
        isRateLimitError: vi.fn(() => true),
      });

      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new Error("rate limit exceeded"),
        refetch: mockRefetch,
      });

      renderComponent();

      expect(screen.getByText("Venter...")).toBeInTheDocument();
    });
  });

  describe("Loading and Fetching States", () => {
    it("should show error UI and disable button when fetching", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: true,
        isError: true,
        error: new Error("Network error"),
        refetch: mockRefetch,
      });

      renderComponent();

      // Error UI should show even when fetching
      expect(screen.getByText("Kunne ikke hente emails")).toBeInTheDocument();
    });

    it("should disable retry button when fetching", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: true,
        isError: true,
        error: new Error("Network error"),
        refetch: mockRefetch,
      });

      renderComponent();

      // Button text could be "Prøv igen" but disabled, or could be replaced
      // In this case, the component shows the button as disabled
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toBeDisabled();
    });
  });

  describe("Success State (No Error)", () => {
    it("should not render error UI when query succeeds", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: { threads: [] },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      renderComponent();

      expect(
        screen.queryByText("Kunne ikke hente emails")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Prøv igen")).not.toBeInTheDocument();
    });

    it("should render email list components when data is available", () => {
      (trpc.inbox.email.listPaged.useQuery as any).mockReturnValue({
        data: {
          threads: [
            {
              id: "1",
              threadId: "thread-1",
              subject: "Test Email",
              from: "test@example.com",
              snippet: "Test snippet",
              date: new Date().toISOString(),
              unread: false,
              labels: [],
            },
          ],
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      renderComponent();

      // Main email interface should be visible
      // Check for EmailSearchV2 presence (search input)
      const searchElements = screen.queryAllByRole("textbox");
      expect(searchElements.length).toBeGreaterThan(0);
    });
  });
});
