/**
 * SubscriptionManagement Component Tests
 * 
 * Tests for the subscription management component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SubscriptionManagement } from "../SubscriptionManagement";
import { trpc } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      list: {
        useQuery: vi.fn(),
      },
      update: {
        useMutation: vi.fn(),
      },
      cancel: {
        useMutation: vi.fn(),
      },
    },
    useUtils: vi.fn(),
  },
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock SubscriptionCard
vi.mock("@/components/crm/SubscriptionCard", () => ({
  SubscriptionCard: ({ subscription, onCancel }: any) => (
    <div data-testid={`subscription-${subscription.id}`}>
      <span>{subscription.planType}</span>
      <span>{subscription.status}</span>
      <button onClick={() => onCancel(subscription.id)}>Cancel</button>
    </div>
  ),
}));

describe("SubscriptionManagement", () => {
  let queryClient: QueryClient;
  let mockSubscriptions: any[];
  let mockUseQuery: ReturnType<typeof vi.fn>;
  let mockUpdateMutation: ReturnType<typeof vi.fn>;
  let mockCancelMutation: ReturnType<typeof vi.fn>;
  let mockUtils: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockSubscriptions = [
      {
        id: 1,
        customerProfileId: 1,
        planType: "tier1",
        status: "active",
        createdAt: new Date(),
        nextBillingDate: new Date(),
      },
      {
        id: 2,
        customerProfileId: 2,
        planType: "tier2",
        status: "paused",
        createdAt: new Date(),
        nextBillingDate: new Date(),
      },
      {
        id: 3,
        customerProfileId: 3,
        planType: "tier3",
        status: "cancelled",
        createdAt: new Date(),
        nextBillingDate: new Date(),
      },
    ];

    mockUseQuery = vi.fn().mockReturnValue({
      data: mockSubscriptions,
      isLoading: false,
      isError: false,
      error: null,
    });

    mockUpdateMutation = vi.fn().mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockCancelMutation = vi.fn().mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockUtils = {
      subscription: {
        list: {
          invalidate: vi.fn(),
        },
      },
    };

    (trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>).mockImplementation(mockUseQuery);
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateMutation());
    (trpc.subscription.cancel.useMutation as ReturnType<typeof vi.fn>).mockReturnValue(mockCancelMutation());
    (trpc.useUtils as ReturnType<typeof vi.fn>).mockReturnValue(mockUtils);
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionManagement {...props} />
      </QueryClientProvider>
    );
  };

  it("should render subscription list", () => {
    renderComponent();
    
    expect(screen.getByTestId("subscription-1")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-2")).toBeInTheDocument();
    expect(screen.getByTestId("subscription-3")).toBeInTheDocument();
  });

  it("should display statistics cards", () => {
    renderComponent();
    
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("should show correct subscription counts", () => {
    renderComponent();
    
    // Active: 1, Paused: 1, Cancelled: 1, Expired: 0
    const activeCount = screen.getByText("1").closest("div");
    expect(activeCount).toHaveTextContent("Active");
  });

  it("should filter subscriptions by status", () => {
    renderComponent();
    
    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, { target: { value: "active" } });
    
    // Should only show active subscriptions
    expect(screen.getByTestId("subscription-1")).toBeInTheDocument();
    expect(screen.queryByTestId("subscription-2")).not.toBeInTheDocument();
  });

  it("should show loading state", () => {
    (trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    
    renderComponent();
    
    expect(screen.getByText(/Loading subscriptions/i)).toBeInTheDocument();
  });

  it("should show error state", () => {
    (trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Failed to load" },
    });
    
    renderComponent();
    
    expect(screen.getByText(/Failed to load subscriptions/i)).toBeInTheDocument();
  });

  it("should handle pause action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    const pauseButton = screen.getAllByText("Pause")[0];
    fireEvent.click(pauseButton);
    
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "paused",
      });
    });
  });

  it("should handle resume action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    // Filter to show paused subscriptions
    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, { target: { value: "paused" } });
    
    const resumeButton = screen.getByText("Resume");
    fireEvent.click(resumeButton);
    
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        subscriptionId: 2,
        status: "active",
      });
    });
  });

  it("should handle upgrade action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    const upgradeButton = screen.getAllByText("Upgrade")[0];
    fireEvent.click(upgradeButton);
    
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        subscriptionId: 1,
        planType: "flex_plus", // tier1 -> flex_plus
      });
    });
  });

  it("should handle downgrade action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    const downgradeButton = screen.getAllByText("Downgrade")[0];
    fireEvent.click(downgradeButton);
    
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        subscriptionId: 1,
        planType: "flex_basis", // tier1 -> flex_basis
      });
    });
  });

  it("should handle cancel action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.cancel.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    const cancelButton = screen.getAllByText("Cancel")[0];
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        subscriptionId: 1,
        reason: "Cancelled by user",
      });
    });
  });

  it("should show info toast when already at highest tier", async () => {
    const { toast } = await import("sonner");
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    // Mock tier3 subscription
    const tier3Subscriptions = [
      {
        id: 1,
        customerProfileId: 1,
        planType: "tier3",
        status: "active",
        createdAt: new Date(),
        nextBillingDate: new Date(),
      },
    ];
    
    (trpc.subscription.list.useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: tier3Subscriptions,
      isLoading: false,
      isError: false,
      error: null,
    });
    
    renderComponent();
    
    const upgradeButton = screen.getByText("Upgrade");
    fireEvent.click(upgradeButton);
    
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Subscription is already at the highest tier");
    });
  });

  it("should invalidate subscription list after mutation", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (trpc.subscription.update.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync,
      isPending: false,
    });
    
    renderComponent();
    
    const pauseButton = screen.getAllByText("Pause")[0];
    fireEvent.click(pauseButton);
    
    await waitFor(() => {
      expect(mockUtils.subscription.list.invalidate).toHaveBeenCalled();
    });
  });
});

