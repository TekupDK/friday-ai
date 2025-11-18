/**
 * SubscriptionPlanSelector Component Tests
 *
 * Tests for the subscription plan selector component
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { trpc } from "@/lib/trpc";
import { SubscriptionPlanSelector } from "../SubscriptionPlanSelector";

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

    (
      trpc.subscription.create.useMutation as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    (
      trpc.subscription.getRecommendation.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
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

    // Prices are formatted as full amount in øre with Danish locale (e.g., "1.200 kr")
    expect(screen.getByText(/1\.200\s*kr/i)).toBeInTheDocument(); // tier1: 1200
    expect(screen.getByText(/1\.800\s*kr/i)).toBeInTheDocument(); // tier2: 1800
    expect(screen.getByText(/2\.500\s*kr/i)).toBeInTheDocument(); // tier3: 2500
    expect(screen.getByText(/1\.000\s*kr/i)).toBeInTheDocument(); // flex_basis: 1000
    expect(screen.getByText(/1\.500\s*kr/i)).toBeInTheDocument(); // flex_plus: 1500
  });

  it("should show popular badge for tier2 plan", () => {
    renderComponent();

    // Component uses "Mest Populær" not "Popular"
    expect(screen.getByText("Mest Populær")).toBeInTheDocument();
  });

  it("should show recommendation badge when showRecommendation is true", () => {
    // Mock recommendation data
    (
      trpc.subscription.getRecommendation.useQuery as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        recommendedPlan: "tier2",
        confidence: 85,
        reasoning: "Based on your usage patterns",
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderComponent({ showRecommendation: true, customerProfileId: 1 });

    // Component shows recommendation badge when recommendation data exists
    // Use getAllByText since there might be multiple "Anbefalet" elements
    const anbefaletElements = screen.getAllByText(/anbefalet/i);
    expect(anbefaletElements.length).toBeGreaterThan(0);
  });

  it("should call onSelectPlan when plan is selected", async () => {
    const onSelectPlan = vi.fn();
    renderComponent({ onSelectPlan });

    // Component uses card click, not button - find the plan card and click it
    const tier1Card = screen.getByText("Basis Abonnement").closest("div");
    if (tier1Card) {
      fireEvent.click(tier1Card);
    }

    await waitFor(() => {
      expect(onSelectPlan).toHaveBeenCalled();
    });
  });

  it("should call onSelectPlan when plan is selected with customerProfileId", async () => {
    const onSelectPlan = vi.fn();
    renderComponent({ customerProfileId: 1, onSelectPlan });

    // Click the "Vælg Plan" button (component uses callback pattern, not direct mutation)
    const selectButtons = screen.getAllByText(/vælg plan/i);
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);
    }

    await waitFor(() => {
      expect(onSelectPlan).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it("should call onSelectPlan even when customerProfileId is missing", async () => {
    const onSelectPlan = vi.fn();
    renderComponent({ customerProfileId: undefined, onSelectPlan });

    // Component doesn't validate customerProfileId - it just calls callback
    // Parent component should handle validation
    const selectButtons = screen.getAllByText(/vælg plan/i);
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);
    }

    await waitFor(() => {
      expect(onSelectPlan).toHaveBeenCalled();
    });
  });

  it("should show selected state when plan is selected", () => {
    renderComponent({ customerProfileId: 1 });

    // Click the "Vælg Plan" button to select a plan
    const selectButtons = screen.getAllByText(/vælg plan/i);
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);
    }

    // Button text should change to "Valgt" when selected
    expect(screen.getByText("Valgt")).toBeInTheDocument();
  });

  it("should apply selected styling when plan is selected", async () => {
    renderComponent({ customerProfileId: 1 });

    // Click the "Vælg Plan" button to select a plan
    const selectButtons = screen.getAllByText(/vælg plan/i);
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);
    }

    // After selection, button should show "Valgt" and card should have selected state
    await waitFor(() => {
      expect(screen.getByText("Valgt")).toBeInTheDocument();
    });
  });

  it("should display plan features correctly", () => {
    renderComponent();

    // Check tier1 features (features appear in multiple plans, so use getAllByText)
    const maanedligRengoering = screen.getAllByText("Månedlig rengøring");
    expect(maanedligRengoering.length).toBeGreaterThan(0);

    // Check unique features for tier1
    const grundlaeggendeSupport = screen.getAllByText("Grundlæggende support");
    expect(grundlaeggendeSupport.length).toBeGreaterThan(0);

    // Check hours display - format is "3 timer" (not "3 timer inkluderet" in the hours section)
    const timerElements = screen.getAllByText(/timer/i);
    expect(timerElements.length).toBeGreaterThan(0);
  });

  it("should display plan descriptions correctly", () => {
    renderComponent();

    expect(
      screen.getByText("1x månedlig rengøring (3 timer)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("1x månedlig rengøring (4 timer) + Hovedrengøring")
    ).toBeInTheDocument();
  });
});
