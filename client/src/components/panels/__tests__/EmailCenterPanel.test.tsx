// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';

// V2: Mock EmailTab instead of InboxPanel
vi.mock('@/components/inbox/EmailTab', () => ({
  default: () => (
    <div data-testid="email-tab">
      <div>Mock EmailTab</div>
      <div>Email list would be here</div>
    </div>
  ),
}));

import EmailCenterPanel from '../EmailCenterPanel';

describe('EmailCenterPanel V2', () => {
  it('renders email center header', () => {
    render(<EmailCenterPanel />);

    expect(screen.getByText(/Email Center/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-powered email workspace/i)).toBeInTheDocument();
  });

  it('renders EmailTab component', () => {
    render(<EmailCenterPanel />);

    expect(screen.getByTestId('email-tab')).toBeInTheDocument();
    expect(screen.getByText(/Mock EmailTab/i)).toBeInTheDocument();
  });

  it('has no tabs - dedicated to emails only', () => {
    render(<EmailCenterPanel />);

    // Should NOT have tab navigation (V2 design)
    expect(screen.queryByText(/Fakturaer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kalender/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Leads/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Opgaver/i)).not.toBeInTheDocument();
  });
});
