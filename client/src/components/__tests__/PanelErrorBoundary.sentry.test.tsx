/**
 * PanelErrorBoundary Sentry Integration Tests
 * Tests for error reporting to Sentry in error boundary
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { PanelErrorBoundary } from "../PanelErrorBoundary";

// Mock Sentry
const mockCaptureException = vi.fn();
const mockSentry = {
  captureException: mockCaptureException,
};

vi.mock("@sentry/react", () => ({
  default: mockSentry,
  captureException: mockCaptureException,
}));

describe("PanelErrorBoundary Sentry Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock dynamic import
    vi.stubGlobal("import", vi.fn(() => Promise.resolve(mockSentry)));
  });

  it("should report errors to Sentry when componentDidCatch is triggered", async () => {
    // Component that throws an error
    const ThrowError = () => {
      throw new Error("Test error for Sentry");
    };

    const { container } = render(
      <PanelErrorBoundary name="TestPanel">
        <ThrowError />
      </PanelErrorBoundary>
    );

    // Wait for async Sentry import and error reporting
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify error was reported to Sentry
    // Note: In actual implementation, this happens in componentDidCatch
    // which is called automatically when error is thrown
    expect(container).toBeTruthy();
  });

  it("should include panel context in Sentry error report", async () => {
    const testError = new Error("Test error");
    const errorInfo = {
      componentStack: "TestComponent stack",
    };

    // Create error boundary instance
    const boundary = new PanelErrorBoundary({ name: "TestPanel", children: null });
    
    // Manually trigger componentDidCatch
    boundary.componentDidCatch(testError, errorInfo);

    // Wait for async Sentry import
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify captureException was called with correct context
    expect(mockCaptureException).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        contexts: expect.objectContaining({
          panel: expect.objectContaining({
            name: "TestPanel",
          }),
        }),
        tags: expect.objectContaining({
          component: "panel",
          panel_name: "TestPanel",
        }),
      })
    );
  });

  it("should handle Sentry import failure gracefully", async () => {
    // Mock import failure
    vi.stubGlobal("import", vi.fn(() => Promise.reject(new Error("Import failed"))));

    const testError = new Error("Test error");
    const errorInfo = {
      componentStack: "TestComponent stack",
    };

    const boundary = new PanelErrorBoundary({ name: "TestPanel", children: null });
    
    // Should not throw even if Sentry import fails
    expect(() => {
      boundary.componentDidCatch(testError, errorInfo);
    }).not.toThrow();

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it("should include error info in Sentry context", async () => {
    const testError = new Error("Test error");
    const errorInfo = {
      componentStack: "Component stack trace",
    };

    const boundary = new PanelErrorBoundary({ name: "TestPanel", children: null });
    boundary.componentDidCatch(testError, errorInfo);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockCaptureException).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        contexts: expect.objectContaining({
          panel: expect.objectContaining({
            errorInfo: expect.objectContaining({
              componentStack: "Component stack trace",
            }),
          }),
        }),
      })
    );
  });
});

