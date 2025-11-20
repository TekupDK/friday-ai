// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/components/workspace/LeadAnalyzer", () => ({
  LeadAnalyzer: ({ context }: { context: any }) => (
    <div data-testid="lead-analyzer">
      Lead Analyzer - {context.emailId || "no-email"}
    </div>
  ),
}));

vi.mock("@/components/workspace/BookingManager", () => ({
  BookingManager: ({ context }: { context: any }) => (
    <div data-testid="booking-manager">
      Booking Manager - {context.threadId || "no-thread"}
    </div>
  ),
}));

vi.mock("@/components/workspace/InvoiceTracker", () => ({
  InvoiceTracker: ({ context }: { context: any }) => (
    <div data-testid="invoice-tracker">
      Invoice Tracker - {context.threadId || "no-thread"}
    </div>
  ),
}));

vi.mock("@/components/workspace/CustomerProfile", () => ({
  CustomerProfile: ({ context }: { context: any }) => (
    <div data-testid="customer-profile">
      Customer Profile - {context.threadId || "no-thread"}
    </div>
  ),
}));

vi.mock("@/components/workspace/BusinessDashboard", () => ({
  BusinessDashboard: () => (
    <div data-testid="business-dashboard">Business Dashboard</div>
  ),
}));

vi.mock("@/services/emailContextDetection", () => ({
  detectEmailContext: vi.fn((email) => {
    if (!email) {
      return { type: "dashboard", confidence: 1.0 };
    }
    // Simple mock detection based on subject
    if (email.subject?.toLowerCase().includes("lead") || email.subject?.toLowerCase().includes("tilbud")) {
      return { type: "lead", confidence: 0.9 };
    }
    if (email.subject?.toLowerCase().includes("booking") || email.subject?.toLowerCase().includes("rengøring")) {
      return { type: "booking", confidence: 0.9 };
    }
    if (email.subject?.toLowerCase().includes("invoice") || email.subject?.toLowerCase().includes("faktura")) {
      return { type: "invoice", confidence: 0.9 };
    }
    if (email.threadLength && email.threadLength > 1) {
      return { type: "customer", confidence: 0.8 };
    }
    return { type: "dashboard", confidence: 0.5 };
  }),
  getContextName: vi.fn((type) => {
    const names: Record<string, string> = {
      lead: "Lead",
      booking: "Booking",
      invoice: "Invoice",
      customer: "Customer",
      dashboard: "Dashboard",
    };
    return names[type] || "Unknown";
  }),
  getContextDescription: vi.fn((type) => {
    const descriptions: Record<string, string> = {
      lead: "Lead analysis",
      booking: "Booking management",
      invoice: "Invoice tracking",
      customer: "Customer profile",
      dashboard: "Business dashboard",
    };
    return descriptions[type] || "Unknown context";
  }),
}));

vi.mock("@/contexts/EmailContext", () => ({
  useEmailContext: vi.fn(() => ({
    state: {
      selectedEmail: null,
    },
  })),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import SmartWorkspacePanel from "../SmartWorkspacePanel";
import { useEmailContext } from "@/contexts/EmailContext";

describe("SmartWorkspacePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Business Dashboard when no email is selected", () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: null,
      },
    });

    render(<SmartWorkspacePanel />);

    expect(screen.getByTestId("business-dashboard")).toBeInTheDocument();
  });

  it("renders Lead Analyzer for lead context", async () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: {
          id: "email-1",
          threadId: "thread-1",
          subject: "Tilbud på rengøring",
          from: "test@example.com",
          snippet: "Test snippet",
          labels: [],
          threadLength: 1,
        },
      },
    });

    render(<SmartWorkspacePanel />);

    await waitFor(() => {
      expect(screen.getByTestId("lead-analyzer")).toBeInTheDocument();
    });
  });

  it("renders Booking Manager for booking context", async () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: {
          id: "email-2",
          threadId: "thread-2",
          subject: "Booking rengøring",
          from: "customer@example.com",
          snippet: "Test snippet",
          labels: [],
          threadLength: 1,
        },
      },
    });

    render(<SmartWorkspacePanel />);

    await waitFor(() => {
      expect(screen.getByTestId("booking-manager")).toBeInTheDocument();
    });
  });

  it("renders Invoice Tracker for invoice context", async () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: {
          id: "email-3",
          threadId: "thread-3",
          subject: "Faktura #123",
          from: "billing@example.com",
          snippet: "Test snippet",
          labels: [],
          threadLength: 1,
        },
      },
    });

    render(<SmartWorkspacePanel />);

    await waitFor(() => {
      expect(screen.getByTestId("invoice-tracker")).toBeInTheDocument();
    });
  });

  it("renders Customer Profile for customer context (threadLength > 1)", async () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: {
          id: "email-4",
          threadId: "thread-4",
          subject: "Test email",
          from: "customer@example.com",
          snippet: "Test snippet",
          labels: [],
          threadLength: 3, // Multiple messages = customer
        },
      },
    });

    render(<SmartWorkspacePanel />);

    await waitFor(() => {
      expect(screen.getByTestId("customer-profile")).toBeInTheDocument();
    });
  });

  it("handles error gracefully", async () => {
    const { logger } = await import("@/lib/logger");
    
    // Mock a component that throws an error
    vi.doMock("@/components/workspace/BusinessDashboard", () => ({
      BusinessDashboard: () => {
        throw new Error("Test error");
      },
    }));

    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: null,
      },
    });

    render(<SmartWorkspacePanel />);

    // Should show error fallback UI
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Should log error
    expect(logger.error).toHaveBeenCalled();
  });

  it("shows loading state while analyzing", () => {
    (useEmailContext as any).mockReturnValue({
      state: {
        selectedEmail: {
          id: "email-5",
          threadId: "thread-5",
          subject: "Test",
          from: "test@example.com",
          snippet: "Test",
          labels: [],
          threadLength: 1,
        },
      },
    });

    render(<SmartWorkspacePanel />);

    // Should show analyzing state initially
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });
});
