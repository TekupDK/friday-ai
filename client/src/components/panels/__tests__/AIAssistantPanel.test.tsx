// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock heavy child dependencies
import React from 'react';

vi.mock('@/components/ChatPanel', () => ({
  default: () => <div>Mock ChatPanel</div>,
}));

import AIAssistantPanel from '../AIAssistantPanelV2';

describe('AIAssistantPanel', () => {
  it('renders Chat mode by default', () => {
    render(<AIAssistantPanel />);

    // Header
    expect(screen.getByText(/Friday AI/i)).toBeInTheDocument();

    // Default mode content
    expect(screen.getByText(/Mock ChatPanel/i)).toBeInTheDocument();

    // Tab visible
    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument();
  });

  it('switches to Voice mode', async () => {
    render(<AIAssistantPanel />);

    const voiceTab = screen.getByRole('tab', { name: /voice/i });
    await userEvent.click(voiceTab);

    expect(voiceTab).toHaveAttribute('data-state', 'active');
  });

  it('switches to Agent mode', async () => {
    render(<AIAssistantPanel />);

    const agentTab = screen.getByRole('tab', { name: /agent/i });
    await userEvent.click(agentTab);

    expect(agentTab).toHaveAttribute('data-state', 'active');
  });

  it('switches to Smart mode', async () => {
    render(<AIAssistantPanel />);

    const smartTab = screen.getByRole('tab', { name: /smart/i });
    await userEvent.click(smartTab);

    expect(smartTab).toHaveAttribute('data-state', 'active');
  });
});
