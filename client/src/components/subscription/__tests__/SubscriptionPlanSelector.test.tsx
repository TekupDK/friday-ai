/**
 * SubscriptionPlanSelector Component Tests
 * 
 * Tests for the subscription plan selector component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SubscriptionPlanSelector } from "../SubscriptionPlanSelector";
import { trpc, trpcClient } from "@/lib/trpc";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    subscription: {
      create: {
        useMutation: vi.fn(),
      },
      getRecommendation: {
        useQuery: vi.fn(),
      },
    },
  },
  trpcClient: {},
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SubscriptionPlanSelector", () => {
  let queryClient: QueryClient;
  let mockMutate: ReturnType<typeof vi.fn>;
  let mockMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockMutate = vi.fn();
    mockMutateAsync = vi.fn().mockResolvedValue({});
    
    (trpc.subscription.create.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    (trpc.subscription.getRecommendation.useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionPlanSelector customerProfileId={1} {...props} />
      </QueryClientProvider>
    );
  };

  it("should render all subscription plans", () => {
    renderComponent();
    
    expect(screen.getByText("Basis Abonnement")).toBeInTheDocument();
    expect(screen.getByText("Premium Abonnement")).toBeInTheDocument();
    expect(screen.getByText("VIP Abonnement")).toBeInTheDocument();
    expect(screen.getByText("Flex Basis")).toBeInTheDocument();
    expect(screen.getByText("Flex Plus")).toBeInTheDocument();
  });

  it("should display plan prices correctly", () => {
    renderComponent();
    
    expect(screen.getByText("12 kr.")).toBeInTheDocument(); // tier1: 1200 / 100
    expect(screen.getByText("18 kr.")).toBeInTheDocument(); // tier2: 1800 / 100
    expect(screen.getByText("25 kr.")).toBeInTheDocument(); // tier3: 2500 / 100
    expect(screen.getByText("10 kr.")).toBeInTheDocument(); // flex_basis: 1000 / 100
    expect(screen.getByText("15 kr.")).toBeInTheDocument(); // flex_plus: 1500 / 100
  });

  it("should show popular badge for tier2 plan", () => {
    renderComponent();
    
    const tier2Card = screen.getByText("Premium Abonnement").closest("div");
    expect(tier2Card).toHaveTextContent("Popular");
  });

  it("should show recommendation badge when showRecommendation is true", () => {
    renderComponent({ showRecommendation: true });
    
    const tier2Card = screen.getByText("Premium Abonnement").closest("div");
    expect(tier2Card).toHaveTextContent("Recommended");
  });

  it("should call onSelectPlan when plan is selected", async () => {
    const onSelectPlan = vi.fn();
    renderComponent({ onSelectPlan });
    
    const selectButton = screen.getAllByText("Select Plan")[0];
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(onSelectPlan).toHaveBeenCalled();
    });
  });

  it("should create subscription when plan is selected with customerProfileId", async () => {
    renderComponent({ customerProfileId: 1 });
    
    const selectButton = screen.getAllByText("Select Plan")[0];
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        customerProfileId: 1,
        planType: expect.any(String),
      });
    });
  });

  it("should show alert when customerProfileId is missing", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderComponent({ customerProfileId: undefined });
    
    const selectButton = screen.getAllByText("Select Plan")[0];
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Customer profile ID is required to create a subscription."
      );
    });
    
    alertSpy.mockRestore();
  });

  it("should show loading state when mutation is pending", () => {
    (trpc.subscription.create.useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: true,
      isError: false,
      error: null,
    });
    
    renderComponent({ customerProfileId: 1 });
    
    const selectButton = screen.getAllByText("Select Plan")[0];
    fireEvent.click(selectButton);
    
    expect(screen.getByText("Selecting...")).toBeInTheDocument();
  });

  it("should show selected state after plan selection", async () => {
    renderComponent({ customerProfileId: 1 });
    
    const selectButton = screen.getAllByText("Select Plan")[0];
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeInTheDocument();
    });
  });

  it("should display plan features correctly", () => {
    renderComponent();
    
    // Check tier1 features
    expect(screen.getByText("Månedlig rengøring")).toBeInTheDocument();
    expect(screen.getByText("3 timer inkluderet")).toBeInTheDocument();
    expect(screen.getByText("Grundlæggende support")).toBeInTheDocument();
  });

  it("should display plan descriptions correctly", () => {
    renderComponent();
    
    expect(screen.getByText("1x månedlig rengøring (3 timer)")).toBeInTheDocument();
    expect(screen.getByText("1x månedlig rengøring (4 timer) + Hovedrengøring")).toBeInTheDocument();
  });
});

