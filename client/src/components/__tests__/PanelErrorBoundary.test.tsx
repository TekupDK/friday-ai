// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PanelErrorBoundary } from "../PanelErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Working Component</div>;
};

describe("PanelErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    render(
      <PanelErrorBoundary name="Test Panel">
        <ThrowError shouldThrow={false} />
      </PanelErrorBoundary>
    );

    expect(screen.getByText("Working Component")).toBeInTheDocument();
  });

  it("shows error UI when child component throws", () => {
    render(
      <PanelErrorBoundary name="Test Panel">
        <ThrowError shouldThrow={true} />
      </PanelErrorBoundary>
    );

    expect(screen.getByText("Test Panel Panel Error")).toBeInTheDocument();
    expect(
      screen.getByText(/This panel encountered an error/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
  });

  it("shows error details in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <PanelErrorBoundary name="Test Panel">
        <ThrowError shouldThrow={true} />
      </PanelErrorBoundary>
    );

    expect(screen.getByText("Error Details")).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("resets error state when Try Again is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PanelErrorBoundary name="Test Panel">
        <ThrowError shouldThrow={true} />
      </PanelErrorBoundary>
    );

    expect(screen.getByText("Test Panel Panel Error")).toBeInTheDocument();

    // First, switch the child to a non-throwing component
    rerender(
      <PanelErrorBoundary name="Test Panel">
        <ThrowError shouldThrow={false} />
      </PanelErrorBoundary>
    );

    // Then click Try Again to reset the boundary state
    const tryAgainButton = screen.getByText("Try Again");
    await user.click(tryAgainButton);

    expect(await screen.findByText("Working Component")).toBeInTheDocument();
  });
});
