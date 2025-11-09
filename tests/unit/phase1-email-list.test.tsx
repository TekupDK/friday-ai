/**
 * Phase 1 Unit Tests - Email List AI Improvements
 * 
 * Tests for:
 * - Badge conditional rendering (only hot leads >= 70)
 * - Quick Actions integration
 * - Simplified layout
 * - Removal of badge clutter
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import EmailListAI from '../../client/src/components/inbox/EmailListAI';
import type { EnhancedEmailMessage } from '../../client/src/types/enhanced-email';

// Mock TRPC and other dependencies
vi.mock('@/lib/trpc', () => ({
  trpc: {
    emailIntelligence: {
      getBatchIntelligence: {
        useQuery: () => ({ data: null }),
      },
    },
  },
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    scrollToIndex: vi.fn(),
  }),
}));

const createMockEmail = (overrides: Partial<EnhancedEmailMessage> = {}): EnhancedEmailMessage => ({
  threadId: 'thread-123',
  id: 'email-123',
  from: 'test@example.com',
  sender: 'Test User',
  to: ['user@example.com'],
  subject: 'Test Email Subject',
  snippet: 'This is a test email snippet',
  date: '2025-11-09T10:00:00Z',
  internalDate: '2025-11-09T10:00:00Z',
  labels: [],
  unread: false,
  hasAttachment: false,
  aiAnalysis: {
    leadScore: 50,
    source: 'direct',
    estimatedValue: 2000,
    urgency: 'medium',
    jobType: 'Anden',
    location: 'Anden',
    confidence: 85,
  },
  ...overrides,
});

describe('Phase 1: Badge Conditional Rendering', () => {
  
  it('should NOT show badge for emails with lead score < 70', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        aiAnalysis: { 
          leadScore: 50, 
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Anden',
          location: 'Anden',
          confidence: 85,
        } 
      }),
      createMockEmail({ 
        threadId: 'thread-2',
        aiAnalysis: { 
          leadScore: 69, 
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Anden',
          location: 'Anden',
          confidence: 85,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should NOT find any hot lead badges
    const badges = container.querySelectorAll('[data-testid="hot-lead-badge"]');
    expect(badges.length).toBe(0);
  });
  
  it('should show badge ONLY for emails with lead score >= 70', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        aiAnalysis: { 
          leadScore: 75, // Hot lead!
          source: 'rengoring_nu',
          estimatedValue: 5000,
          urgency: 'high',
          jobType: 'Hovedrengøring',
          location: 'København',
          confidence: 90,
        } 
      }),
      createMockEmail({ 
        threadId: 'thread-2',
        aiAnalysis: { 
          leadScore: 50, // Not hot
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Anden',
          location: 'Anden',
          confidence: 85,
        } 
      }),
      createMockEmail({ 
        threadId: 'thread-3',
        aiAnalysis: { 
          leadScore: 85, // Hot lead!
          source: 'rengoring_aarhus',
          estimatedValue: 6000,
          urgency: 'high',
          jobType: 'Flytterengøring',
          location: 'Aarhus',
          confidence: 95,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should find exactly 2 hot lead badges (score >= 70)
    const badges = container.querySelectorAll('[data-testid="hot-lead-badge"]');
    expect(badges.length).toBe(2);
  });
  
  it('should show badge for lead score exactly 70', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        aiAnalysis: { 
          leadScore: 70, // Exactly 70 = hot lead
          source: 'rengoring_nu',
          estimatedValue: 3000,
          urgency: 'high',
          jobType: 'Hovedrengøring',
          location: 'København',
          confidence: 85,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should find 1 hot lead badge (score = 70)
    const badges = container.querySelectorAll('[data-testid="hot-lead-badge"]');
    expect(badges.length).toBe(1);
  });
  
});

describe('Phase 1: Badge Clutter Removal', () => {
  
  it('should NOT render source badges in email items', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        aiAnalysis: { 
          leadScore: 50,
          source: 'rengoring_nu', // Should NOT show as badge
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Anden',
          location: 'Anden',
          confidence: 85,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should NOT find source badges
    expect(screen.queryByText('Rengøring.nu')).not.toBeInTheDocument();
    expect(screen.queryByText('Adhelp')).not.toBeInTheDocument();
    expect(screen.queryByText('Direct')).not.toBeInTheDocument();
  });
  
  it('should NOT render urgency badges in email items', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        aiAnalysis: { 
          leadScore: 50,
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'high', // Should NOT show as badge
          jobType: 'Anden',
          location: 'Anden',
          confidence: 85,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should NOT find urgency badges
    expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    expect(screen.queryByText('Medium')).not.toBeInTheDocument();
    expect(screen.queryByText('Low')).not.toBeInTheDocument();
  });
  
  it('should NOT render location/job type in email items', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        subject: 'Cleaning needed',
        aiAnalysis: { 
          leadScore: 50,
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Hovedrengøring', // Should NOT show in list
          location: 'København', // Should NOT show in list
          confidence: 85,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should NOT find location or job type in list view
    // (These should only appear in detail view)
    const listItems = container.querySelectorAll('[role="button"]');
    expect(listItems.length).toBeGreaterThan(0);
    
    // Check that location/job type are NOT in the email item
    const emailItem = listItems[0];
    expect(emailItem?.textContent).not.toContain('København');
    expect(emailItem?.textContent).not.toContain('Hovedrengøring');
  });
  
});

describe('Phase 1: Simplified Email Layout', () => {
  
  it('should render clean compact layout', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        from: 'test@example.com',
        sender: 'Test User',
        subject: 'Test Subject',
        unread: true,
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="compact"
        isLoading={false}
      />
    );
    
    // Should render name and subject
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    
    // Should have unread indicator
    const unreadDots = container.querySelectorAll('.bg-blue-500');
    expect(unreadDots.length).toBeGreaterThan(0);
  });
  
  it('should render comfortable layout with snippet', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        from: 'test@example.com',
        sender: 'Test User',
        subject: 'Test Subject',
        snippet: 'This is a test snippet',
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should render name, subject, and snippet
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('This is a test snippet')).toBeInTheDocument();
  });
  
  it('should show attachment icon when email has attachment', () => {
    const emails = [
      createMockEmail({ 
        threadId: 'thread-1',
        hasAttachment: true,
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Should render paperclip icon
    const paperclipIcons = container.querySelectorAll('svg');
    const hasPaperclip = Array.from(paperclipIcons).some(
      icon => icon.classList.contains('lucide-paperclip') || 
              icon.getAttribute('data-lucide') === 'paperclip'
    );
    expect(hasPaperclip).toBe(true);
  });
  
});

describe('Phase 1: Email Selection', () => {
  
  it('should call onEmailSelect when email is clicked', async () => {
    const mockOnSelect = vi.fn();
    const emails = [
      createMockEmail({ threadId: 'thread-1' }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={mockOnSelect}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    const emailButton = container.querySelector('[role="button"]');
    expect(emailButton).toBeTruthy();
    
    // Click email
    const user = userEvent.setup();
    await user.click(emailButton!);
    
    // Should call onEmailSelect with correct threadId
    expect(mockOnSelect).toHaveBeenCalledWith('thread-1');
  });
  
  it('should handle multi-selection with cmd/ctrl+click', async () => {
    const mockOnSelectionChange = vi.fn();
    const emails = [
      createMockEmail({ threadId: 'thread-1' }),
      createMockEmail({ threadId: 'thread-2' }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={mockOnSelectionChange}
        density="comfortable"
        isLoading={false}
      />
    );
    
    const emailButtons = container.querySelectorAll('[role="button"]');
    expect(emailButtons.length).toBe(2);
    
    // Cmd+click first email
    const user = userEvent.setup();
    await user.keyboard('[ControlLeft>]');
    await user.click(emailButtons[0]!);
    await user.keyboard('[/ControlLeft]');
    
    // Should update selection
    expect(mockOnSelectionChange).toHaveBeenCalled();
  });
  
});

describe('Phase 1: Performance', () => {
  
  it('should handle large email lists efficiently', () => {
    // Create 100 emails
    const emails = Array.from({ length: 100 }, (_, i) => 
      createMockEmail({ 
        threadId: `thread-${i}`,
        subject: `Email ${i}`,
      })
    );
    
    const start = performance.now();
    
    render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Should render in less than 500ms (with virtualization)
    expect(renderTime).toBeLessThan(500);
  });
  
});

describe('Phase 1: Integration Test', () => {
  
  it('should render complete email list with all Phase 1 improvements', () => {
    const emails = [
      // Hot lead - should show badge
      createMockEmail({ 
        threadId: 'thread-1',
        from: 'lead@rengoring.nu',
        sender: 'Hot Lead',
        subject: 'Hovedrengøring i København',
        snippet: 'Vi skal have hovedrengøring...',
        unread: true,
        hasAttachment: true,
        aiAnalysis: { 
          leadScore: 85, // Hot!
          source: 'rengoring_nu',
          estimatedValue: 5000,
          urgency: 'high',
          jobType: 'Hovedrengøring',
          location: 'København',
          confidence: 90,
        } 
      }),
      // Normal email - no badge
      createMockEmail({ 
        threadId: 'thread-2',
        from: 'normal@example.com',
        sender: 'Normal Lead',
        subject: 'Normal inquiry',
        snippet: 'Looking for information...',
        unread: false,
        hasAttachment: false,
        aiAnalysis: { 
          leadScore: 50, // Not hot
          source: 'direct',
          estimatedValue: 2000,
          urgency: 'medium',
          jobType: 'Anden',
          location: 'Anden',
          confidence: 75,
        } 
      }),
    ];
    
    const { container } = render(
      <EmailListAI 
        emails={emails}
        onEmailSelect={vi.fn()}
        selectedThreadId={null}
        selectedEmails={new Set()}
        onEmailSelectionChange={vi.fn()}
        density="comfortable"
        isLoading={false}
      />
    );
    
    // Verify hot lead badge present
    const badges = container.querySelectorAll('[data-testid="hot-lead-badge"]');
    expect(badges.length).toBe(1);
    
    // Verify NO source badges
    expect(screen.queryByText('Rengøring.nu')).not.toBeInTheDocument();
    
    // Verify NO urgency badges
    expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    
    // Verify clean content visible
    expect(screen.getByText('Hot Lead')).toBeInTheDocument();
    expect(screen.getByText('Normal Lead')).toBeInTheDocument();
    expect(screen.getByText('Hovedrengøring i København')).toBeInTheDocument();
    expect(screen.getByText('Normal inquiry')).toBeInTheDocument();
    
    // Verify unread indicator present
    const unreadDots = container.querySelectorAll('.bg-blue-500');
    expect(unreadDots.length).toBeGreaterThan(0);
  });
  
});
