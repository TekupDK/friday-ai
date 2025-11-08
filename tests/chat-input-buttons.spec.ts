/**
 * E2E Test: ChatInput Disabled Buttons
 * 
 * Tests that non-functional buttons are properly disabled with tooltips
 * and that Send/Stop buttons work correctly.
 */

import { test, expect } from '@playwright/test';

test.describe('ChatInput Button Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (dev mode)
    await page.goto('/api/dev-login');
    await page.waitForTimeout(1000); // Wait for auth cookie
    
    // Navigate to workspace (Friday AI panel)
    await page.goto('/');
    
    // Wait for workspace and Friday panel to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="friday-chat-input"]', { timeout: 15000 });
  });

  test('should show disabled buttons with "kommer snart" tooltips', async ({ page }) => {
    const chatInput = page.locator('[data-testid="friday-chat-input-wrapper"]');
    
    // Find left icons (Paperclip, Apps)
    const leftIcons = chatInput.locator('[data-testid="friday-input-left-icons"] button');
    
    // Should have 2 disabled buttons
    await expect(leftIcons).toHaveCount(2);
    
    // Check first button (Paperclip) is disabled
    const attachButton = leftIcons.first();
    await expect(attachButton).toBeDisabled();
    
    // Hover to see tooltip
    await attachButton.hover();
    await expect(attachButton).toHaveAttribute('title', /kommer snart/i);
    
    // Check second button (Apps) is disabled
    const appsButton = leftIcons.nth(1);
    await expect(appsButton).toBeDisabled();
    await appsButton.hover();
    await expect(appsButton).toHaveAttribute('title', /kommer snart/i);
  });

  test('should have disabled voice button with tooltip', async ({ page }) => {
    const chatInput = page.locator('[data-testid="friday-chat-input-wrapper"]');
    
    // Find right icons (Mic, Send/Stop)
    const rightIcons = chatInput.locator('[data-testid="friday-input-right-icons"]');
    
    // Find Mic button (should be first of right icons, before Send)
    const micButton = rightIcons.locator('button').first();
    
    // Should be disabled
    await expect(micButton).toBeDisabled();
    
    // Check tooltip
    await micButton.hover();
    await expect(micButton).toHaveAttribute('title', /stemme.*kommer snart/i);
  });

  test('Send button should be disabled when input is empty', async ({ page }) => {
    const sendButton = page.locator('[data-testid="friday-send-button"]');
    
    // Should exist
    await expect(sendButton).toBeVisible();
    
    // Should be disabled when no text
    await expect(sendButton).toBeDisabled();
  });

  test('Send button should be enabled when input has text', async ({ page }) => {
    const chatInput = page.locator('[data-testid="friday-chat-input"]');
    const sendButton = page.locator('[data-testid="friday-send-button"]');
    
    // Type some text
    await chatInput.fill('Test besked');
    
    // Send button should now be enabled
    await expect(sendButton).toBeEnabled();
  });

  test('Stop button should appear during streaming', async ({ page }) => {
    const chatInput = page.locator('[data-testid="friday-chat-input"]');
    
    // Type and send a message
    await chatInput.fill('Hvad kan du hjælpe med?');
    await chatInput.press('Enter');
    
    // Stop button should appear while AI is thinking
    const stopButton = page.locator('[data-testid="friday-stop-button"]');
    await expect(stopButton).toBeVisible({ timeout: 5000 });
    
    // Loading indicator should be visible
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible();
  });

  test('disabled buttons should log to console when clicked', async ({ page }) => {
    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    const chatInput = page.locator('[data-testid="friday-chat-input-wrapper"]');
    const leftIcons = chatInput.locator('[data-testid="friday-input-left-icons"] button');
    
    // Try to click disabled Paperclip button (should still trigger console.log)
    await leftIcons.first().click({ force: true });
    
    // Wait a bit for console log
    await page.waitForTimeout(500);
    
    // Should have logged "coming soon" message
    expect(consoleLogs.some(log => log.includes('coming soon') || log.includes('kommer snart'))).toBeTruthy();
  });

  test('compact UI should be visible in narrow panel', async ({ page }) => {
    // Resize to narrow panel width (20% of 1920px = 384px)
    await page.setViewportSize({ width: 400, height: 800 });
    
    const chatInput = page.locator('[data-testid="friday-chat-input-wrapper"]');
    
    // Input should be visible and functional
    await expect(chatInput).toBeVisible();
    
    // Should have compact padding (check class)
    const container = page.locator('[data-testid="friday-chat-input-container"]');
    await expect(container).toHaveClass(/p-3/);
    
    // Welcome screen should be compact
    if (await page.locator('[data-testid="welcome-screen"]').isVisible()) {
      const welcomeScreen = page.locator('[data-testid="welcome-screen"]');
      
      // Should have compact spacing
      await expect(welcomeScreen).toHaveClass(/space-y-4/);
      await expect(welcomeScreen).toHaveClass(/px-3/);
    }
  });

  test('messages should use compact styling', async ({ page }) => {
    // Send a test message
    const chatInput = page.locator('[data-testid="friday-chat-input"]');
    await chatInput.fill('Test for kompakt styling');
    await chatInput.press('Enter');
    
    // Wait for message to appear
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible({ timeout: 5000 });
    
    // Check compact styling
    const messageContent = userMessage.locator('div').first();
    
    // Should use small padding (p-2)
    await expect(messageContent).toHaveClass(/p-2/);
    
    // Text should be small (text-xs)
    const messageText = messageContent.locator('p').first();
    await expect(messageText).toHaveClass(/text-xs/);
    
    // Timestamp should be tiny (text-\[10px\])
    const timestamp = messageContent.locator('p').last();
    await expect(timestamp).toHaveClass(/text-\[10px\]/);
  });
});
