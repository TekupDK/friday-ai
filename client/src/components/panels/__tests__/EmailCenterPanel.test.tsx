// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// V2: Component now uses EmailTabV2 – mock updated module
vi.mock("@/components/inbox/EmailTabV2", () => ({
  default: () => (
    <div data-testid="email-tab-v2">
      <div>Mock EmailTabV2</div>
      <div>Email list would be here</div>
    </div>
  ),
}));

import EmailCenterPanel from "../EmailCenterPanel";

describe("EmailCenterPanel V2", () => {
  it("renders email center header", () => {
    render(<EmailCenterPanel />);

    expect(screen.getByText(/Email Center/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-powered email workspace/i)).toBeInTheDocument();
  });

  it("renders EmailTabV2 component", () => {
    render(<EmailCenterPanel />);

    expect(screen.getByTestId("email-tab-v2")).toBeInTheDocument();
    expect(screen.getByText(/Mock EmailTabV2/i)).toBeInTheDocument();
  });

  it("has no tabs - dedicated to emails only", () => {
    render(<EmailCenterPanel />);

    // Should NOT have tab navigation (V2 design)
    expect(screen.queryByText(/Fakturaer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kalender/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Leads/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Opgaver/i)).not.toBeInTheDocument();
  });
});
