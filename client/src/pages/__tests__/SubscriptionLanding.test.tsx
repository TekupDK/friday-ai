/**
 * SubscriptionLanding Page Tests
 *
 * Tests for the subscription landing page
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SubscriptionLandingPage from "../SubscriptionLanding";

// Mock hooks
vi.mock("@/hooks/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: vi.fn(() => ["/subscriptions/plans", vi.fn()]),
}));

// Mock components
vi.mock("@/components/subscription/SubscriptionPlanSelector", () => ({
  SubscriptionPlanSelector: ({
    showRecommendation,
  }: {
    showRecommendation?: boolean;
  }) => (
    <div data-testid="subscription-plan-selector">
      Plan Selector {showRecommendation ? "(with recommendation)" : ""}
    </div>
  ),
}));

vi.mock("@/components/crm/CRMLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="crm-layout">{children}</div>
  ),
}));

describe("SubscriptionLandingPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionLandingPage />
      </QueryClientProvider>
    );
  };

  it("should render page title", () => {
    renderPage();

    expect(
      screen.getByText(/Choose Your Cleaning Subscription/i)
    ).toBeInTheDocument();
  });

  it("should render hero section", () => {
    renderPage();

    expect(
      screen.getByText(/Choose Your Cleaning Subscription/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Flexible monthly subscriptions for regular cleaning services/i
      )
    ).toBeInTheDocument();
  });

  it("should render plan selector section", () => {
    renderPage();

    // Page has plan selector section
    expect(
      screen.getByTestId("subscription-plan-selector")
    ).toBeInTheDocument();
  });

  it("should render plan selector", () => {
    renderPage();

    expect(
      screen.getByTestId("subscription-plan-selector")
    ).toBeInTheDocument();
  });

  it("should render benefits section", () => {
    renderPage();

    expect(screen.getByText("Regular Service")).toBeInTheDocument();
    // Check for other benefit text that exists in component
    const benefitCards = screen.getAllByText(
      /Regular Service|Easy Management|Premium Quality/i
    );
    expect(benefitCards.length).toBeGreaterThan(0);
  });

  it("should render FAQ section", () => {
    renderPage();

    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I change my plan later/i)).toBeInTheDocument();
    expect(
      screen.getByText(/What happens if I use more hours/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Can I pause my subscription/i)
    ).toBeInTheDocument();
  });

  it("should render plan selector with recommendation disabled", () => {
    renderPage();

    // Plan selector should have showRecommendation={false} on landing page
    const planSelector = screen.getByTestId("subscription-plan-selector");
    expect(planSelector).toBeInTheDocument();
    // Component shows "(with recommendation)" only when showRecommendation is true
    expect(planSelector).not.toHaveTextContent("(with recommendation)");
  });
});
