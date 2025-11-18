/**
 * SubscriptionManagement Page Tests
 *
 * Tests for the subscription management page
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SubscriptionManagementPage from "../SubscriptionManagement";

import { trpc } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      stats: {
        useQuery: vi.fn(),
      },
      list: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Mock hooks
vi.mock("@/hooks/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

// Mock components
vi.mock("@/components/subscription/SubscriptionManagement", () => ({
  SubscriptionManagement: () => (
    <div data-testid="subscription-management">Subscription Management</div>
  ),
}));

vi.mock("@/components/subscription/UsageChart", () => ({
  UsageChart: ({ subscriptionId }: { subscriptionId: number }) => (
    <div data-testid={`usage-chart-${subscriptionId}`}>Usage Chart</div>
  ),
}));

vi.mock("@/components/crm/CRMLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="crm-layout">{children}</div>
  ),
}));

describe("SubscriptionManagementPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockStats = {
      mrr: 50000, // 500.00 kr in øre
      arr: 600000, // 6000.00 kr in øre
      active: 5,
      total: 10,
      arpu: 10000, // 100.00 kr in øre
      cancelled: 2,
    };

    const mockSubscriptions = [
      {
        id: 1,
        customerProfileId: 1,
        planType: "tier1",
        status: "active",
        createdAt: new Date(),
        nextBillingDate: new Date(),
      },
    ];

    (
      trpc.subscription.stats.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    });

    (
      trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockSubscriptions,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionManagementPage />
      </QueryClientProvider>
    );
  };

  it("should render page title", () => {
    renderPage();

    // Title appears in both header and component - use getAllByText
    const titles = screen.getAllByText("Subscription Management");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render subscription management component", () => {
    renderPage();

    expect(screen.getByTestId("subscription-management")).toBeInTheDocument();
  });

  it("should display statistics cards", () => {
    renderPage();

    expect(screen.getByText("Monthly Recurring Revenue")).toBeInTheDocument();
    expect(screen.getByText("Active Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Average Revenue Per User")).toBeInTheDocument();
    expect(screen.getByText("Churn Rate")).toBeInTheDocument();
  });

  it("should display MRR correctly", () => {
    renderPage();

    // MRR should be formatted as currency (50000 øre = 500 kr)
    expect(screen.getByText(/500.*kr/i)).toBeInTheDocument();
  });

  it("should display active subscriptions count", () => {
    renderPage();

    expect(screen.getByText("5")).toBeInTheDocument(); // active count
  });

  it("should show loading state", () => {
    (
      trpc.subscription.stats.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText(/Loading subscription data/i)).toBeInTheDocument();
  });

  it("should show error state", () => {
    (
      trpc.subscription.stats.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Failed to load" },
    });

    renderPage();

    expect(
      screen.getByText(/Failed to load subscription statistics/i)
    ).toBeInTheDocument();
  });

  it("should render usage chart for active subscription", () => {
    renderPage();

    // Should render UsageChart for active subscription (id: 1)
    expect(screen.getByTestId("usage-chart-1")).toBeInTheDocument();
  });

  it("should not render usage chart when no active subscription", () => {
    (
      trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    renderPage();

    // Should not render UsageChart when no active subscriptions
    expect(screen.queryByTestId(/usage-chart/)).not.toBeInTheDocument();
  });
});
