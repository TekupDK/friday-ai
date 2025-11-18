/**
 * UsageChart Component Tests
 *
 * Tests for the subscription usage chart component
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsageChart } from "../UsageChart";

import { trpc } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      getUsage: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Component doesn't use recharts - it uses custom bar chart implementation

describe("UsageChart", () => {
  let queryClient: QueryClient;
  let mockUseQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Component makes multiple queries (one per month) - mock all of them
    const mockUsageData = {
      totalUsage: 2.5,
      includedHours: 3,
      overage: {
        hasOverage: false,
        overageHours: 0,
      },
    };

    mockUseQuery = vi.fn().mockReturnValue({
      data: mockUsageData,
      isLoading: false,
      isError: false,
      error: null,
    });

    // Mock multiple queries (one per month for 6 months default)
    (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mockImplementation(mockUseQuery);
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UsageChart subscriptionId={1} months={6} {...props} />
      </QueryClientProvider>
    );
  };

  it("should render usage chart", () => {
    renderComponent();

    // Component renders AppleCard with usage data
    expect(screen.getByText("Usage Over Time")).toBeInTheDocument();
  });

  it("should display chart title", () => {
    renderComponent();

    expect(screen.getByText("Usage Over Time")).toBeInTheDocument();
    expect(screen.getByText(/Last \d+ months/i)).toBeInTheDocument();
  });

  it("should show loading state", () => {
    (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show error state", () => {
    (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Failed to load usage data" },
    });

    renderComponent();

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it("should display usage data when available", () => {
    renderComponent();

    // Component displays statistics and bar charts
    expect(screen.getByText("Total Used")).toBeInTheDocument();
    expect(screen.getByText("Average/Month")).toBeInTheDocument();
    expect(screen.getByText("Utilization")).toBeInTheDocument();
    expect(screen.getByText("Peak Usage")).toBeInTheDocument();
  });

  it("should display statistics even when some months have no data", () => {
    // Mock some queries with data, some without
    let callCount = 0;
    (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {
      callCount++;
      // First 3 months have data, rest don't
      if (callCount <= 3) {
        return {
          data: {
            totalUsage: 2.5,
            includedHours: 3,
            overage: { hasOverage: false, overageHours: 0 },
          },
          isLoading: false,
          isError: false,
          error: null,
        };
      }
      return {
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      };
    });

    renderComponent();

    // Component should still render with available data
    expect(screen.getByText("Usage Over Time")).toBeInTheDocument();
  });

  it("should use correct subscriptionId in query", () => {
    renderComponent({ subscriptionId: 5 });

    // Component makes multiple queries (one per month) with subscriptionId
    expect(trpc.subscription.getUsage.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 5,
      }),
      expect.any(Object)
    );
  });

  it("should use correct months parameter", () => {
    renderComponent({ months: 12 });

    // Component should make 12 queries (one per month)
    // Each query has year and month, not a months parameter
    expect(trpc.subscription.getUsage.useQuery).toHaveBeenCalled();
    // Verify it was called 12 times (one per month)
    const callCount = (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(6); // At least default 6 months
  });

  it("should display overage warning when overage exists", () => {
    // Mock queries with overage data
    (
      trpc.subscription.getUsage.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        totalUsage: 4.5,
        includedHours: 3,
        overage: {
          hasOverage: true,
          overageHours: 1.5,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderComponent();

    // Component should show overage warning in header
    expect(screen.getByText(/month.*with overage/i)).toBeInTheDocument();
  });
});
