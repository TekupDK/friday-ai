/**
 * CRMLayout Navigation Tests
 * 
 * Tests for CRM Layout navigation behavior, including standalone mode detection
 * and path adjustment.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocation } from "wouter";

// Mock wouter
const mockNavigate = vi.fn();
vi.mock("wouter", () => ({
  useLocation: vi.fn(() => ["/crm/dashboard", mockNavigate]),
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock CRM navigation items
vi.mock("@/const/crm", () => ({
  CRM_NAV_ITEMS: [
    { path: "/crm/dashboard", label: "Dashboard", icon: () => <div>DashboardIcon</div> },
    { path: "/crm/customers", label: "Customers", icon: () => <div>CustomersIcon</div> },
    { path: "/crm/leads", label: "Leads", icon: () => <div>LeadsIcon</div> },
    { path: "/crm/opportunities", label: "Opportunities", icon: () => <div>OpportunitiesIcon</div> },
    { path: "/crm/segments", label: "Segments", icon: () => <div>SegmentsIcon</div> },
    { path: "/crm/bookings", label: "Bookings", icon: () => <div>BookingsIcon</div> },
  ],
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, "aria-label": ariaLabel }: any) => (
    <button onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

// Import after mocks
import CRMLayout from "../CRMLayout";

describe("CRMLayout Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.pathname
    Object.defineProperty(window, "location", {
      value: { pathname: "/crm/dashboard" },
      writable: true,
    });
  });

  describe("Standalone Mode Detection", () => {
    it("should detect standalone mode from /crm-standalone path", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm-standalone/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm-standalone/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test Content</div></CRMLayout>);

      // Verify component renders
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should detect standalone mode from /crm/debug path", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm/debug" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm/debug", mockNavigate]);

      render(<CRMLayout><div>Test Content</div></CRMLayout>);

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should not detect standalone mode from normal /crm path", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test Content</div></CRMLayout>);

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("Home Button", () => {
    it("should show 'CRM Home' in standalone mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm-standalone/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm-standalone/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const homeButton = screen.getByText(/CRM Home/i);
      expect(homeButton).toBeInTheDocument();
    });

    it("should show 'Workspace' in normal mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const workspaceButton = screen.getByText(/Workspace/i);
      expect(workspaceButton).toBeInTheDocument();
    });

    it("should navigate to standalone dashboard when in standalone mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm-standalone/customers" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm-standalone/customers", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const homeButton = screen.getByText(/CRM Home/i);
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith("/crm-standalone/dashboard");
    });

    it("should navigate to workspace when in normal mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm/customers" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm/customers", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const workspaceButton = screen.getByText(/Workspace/i);
      fireEvent.click(workspaceButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("Navigation Items", () => {
    it("should render all navigation items", () => {
      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Customers")).toBeInTheDocument();
      expect(screen.getByText("Leads")).toBeInTheDocument();
      expect(screen.getByText("Opportunities")).toBeInTheDocument();
      expect(screen.getByText("Segments")).toBeInTheDocument();
      expect(screen.getByText("Bookings")).toBeInTheDocument();
    });

    it("should adjust paths for standalone mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm-standalone/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm-standalone/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const customersButton = screen.getByText("Customers");
      fireEvent.click(customersButton);

      // Should navigate to standalone version
      expect(mockNavigate).toHaveBeenCalledWith("/crm-standalone/customers");
    });

    it("should use normal paths in normal mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const customersButton = screen.getByText("Customers");
      fireEvent.click(customersButton);

      // Should navigate to normal version
      expect(mockNavigate).toHaveBeenCalledWith("/crm/customers");
    });
  });

  describe("Active State", () => {
    it("should highlight active route", () => {
      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const dashboardButton = screen.getByText("Dashboard").closest("button");
      expect(dashboardButton).toHaveClass("bg-primary/10");
    });

    it("should highlight active route in standalone mode", () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/crm-standalone/dashboard" },
        writable: true,
      });

      vi.mocked(useLocation).mockReturnValue(["/crm-standalone/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      const dashboardButton = screen.getByText("Dashboard").closest("button");
      expect(dashboardButton).toHaveClass("bg-primary/10");
    });
  });

  describe("Component Rendering", () => {
    it("should render children", () => {
      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(
        <CRMLayout>
          <div data-testid="child-content">Child Content</div>
        </CRMLayout>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should render navigation bar", () => {
      vi.mocked(useLocation).mockReturnValue(["/crm/dashboard", mockNavigate]);

      render(<CRMLayout><div>Test</div></CRMLayout>);

      // Navigation should be present
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });
});

