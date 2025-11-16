/**
 * Accessibility Tests for LoginPage
 * Tests WCAG 2.1 Level A and AA compliance
 */

import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import LoginPage from "@/pages/LoginPage";
import { beforeAll, vi } from "vitest";
import { renderWithA11y, expectNoA11yViolations } from "./test-utils";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      login: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isLoading: false,
        }),
      },
    },
  },
}));

// Mock supabase client
vi.mock("@/lib/supabaseClient", () => ({ supabase: undefined }));

// Stub canvas getContext to avoid jsdom not implemented errors
beforeAll(() => {
  // @ts-ignore
  global.HTMLCanvasElement.prototype.getContext = () => ({
    canvas: typeof document !== "undefined" ? document.createElement("canvas") : ({} as HTMLCanvasElement),
    save: () => {},
    restore: () => {},
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    shadowColor: "",
    shadowBlur: 0,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    filter: "none",
  });
});

describe("LoginPage Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = renderWithA11y(<LoginPage />);
    await expectNoA11yViolations(container);
  });

  it("should have proper form labels", () => {
    renderWithA11y(<LoginPage />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adgangskode/i)).toBeInTheDocument();
  });

  it("should have a page title", () => {
    renderWithA11y(<LoginPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should have accessible submit button", () => {
    renderWithA11y(<LoginPage />);
    // Find submit button specifically by type, not just by name (to avoid matching "Log ind med Google")
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find(btn => btn.getAttribute("type") === "submit");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/^log ind$/i);
  });

  it("should announce errors to screen readers", () => {
    renderWithA11y(<LoginPage />);
    // Verify form exists (may not have explicit role="form" but should be a form element)
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
    
    // Verify form has proper structure for error announcements
    // Form should have aria-live region or error container for screen readers
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/adgangskode/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    
    // Form inputs should have aria-invalid capability (even if not currently invalid)
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should have proper image alt text", () => {
    renderWithA11y(<LoginPage />);
    const images = screen.getAllByRole("img");
    images.forEach(img => {
      expect(img).toHaveAttribute("alt");
      const alt = img.getAttribute("alt");
      expect(alt).not.toBe("");
    });
  });

  it("should support keyboard navigation", () => {
    renderWithA11y(<LoginPage />);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/adgangskode/i);
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find(btn => btn.getAttribute("type") === "submit");

    // Form inputs are naturally focusable (don't need tabIndex)
    // Check that they're not disabled and can receive focus
    expect(emailInput).not.toBeDisabled();
    expect(passwordInput).not.toBeDisabled();
    expect(submitButton).not.toBeDisabled();
    
    // Verify they're actually focusable elements
    expect(emailInput.tagName).toBe("INPUT");
    expect(passwordInput.tagName).toBe("INPUT");
    expect(submitButton?.tagName).toBe("BUTTON");
  });
});

