/**
 * Phase 1 Chat Tests - Core Functionality
 * Tests conversation management, message sending, and AI responses
 */

import { test, expect } from "@playwright/test";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 1: Core Chat Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should auto-create conversation on Friday AI open", async ({
    page,
  }) => {
    // Navigate to Friday AI panel
    await page.goto("http://localhost:3000/");

    // Wait for Friday AI to load
    await page.waitForSelector('[data-testid="friday-ai-panel"]', {
      timeout: 10000,
    });

    // Should NOT show "Starting Friday AI..." after load
    const loadingText = page.getByText("Starting Friday AI...");
    await expect(loadingText).not.toBeVisible();

    // Should show welcome screen or chat interface
    const welcomeOrChat = page.locator('[data-testid="friday-ai-panel"]');
    await expect(welcomeOrChat).toBeVisible();
  });

  test("should display welcome screen with suggestions", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Check for welcome screen
    const welcomeScreen = page.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).toBeVisible();

    // Check for welcome message
    const welcomeMessage = page.getByText("Hvad kan jeg hjælpe med i dag?");
    await expect(welcomeMessage).toBeVisible();

    // Check for suggestion buttons using data-testid
    const suggestion0 = page.locator('[data-testid="suggestion-0"]');
    const suggestion1 = page.locator('[data-testid="suggestion-1"]');
    const suggestion2 = page.locator('[data-testid="suggestion-2"]');
    const suggestion3 = page.locator('[data-testid="suggestion-3"]');

    await expect(suggestion0).toBeVisible();
    await expect(suggestion1).toBeVisible();
    await expect(suggestion2).toBeVisible();
    await expect(suggestion3).toBeVisible();
  });

  test("should send message and receive AI response", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Find and fill input
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Hej Friday, hvad kan du?");

    // Send message
    await input.press("Enter");

    // Wait for loading indicator
    await page.waitForSelector(".animate-bounce", { timeout: 5000 });

    // Wait for AI response (max 30 seconds)
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Check that user message is visible
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();

    // Check that AI response is visible
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();

    // AI response should have content
    const aiContent = await aiMessage.textContent();
    expect(aiContent).toBeTruthy();
    expect(aiContent!.length).toBeGreaterThan(10);
  });

  test("should remember conversation history", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // First message
    await input.fill("Mit navn er Test User");
    await input.press("Enter");
    await page.waitForSelector(".bg-muted", { timeout: 30000 });

    // Second message - reference first message
    await input.fill("Hvad er mit navn?");
    await input.press("Enter");

    // Wait for second AI response
    await page.waitForTimeout(2000); // Wait for first response to settle
    await page.waitForSelector(".bg-muted:nth-of-type(2)", { timeout: 30000 });

    // Get second AI response
    const aiResponses = page.locator(".bg-muted");
    const secondResponse = aiResponses.nth(1);
    const responseText = await secondResponse.textContent();

    // AI should remember the name
    expect(responseText?.toLowerCase()).toContain("test user");
  });

  test("should handle suggestion button clicks", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Click on first suggestion using data-testid
    const suggestion = page.locator('[data-testid="suggestion-3"]'); // "Hvad kan Friday?"
    await suggestion.click();

    // Should send message and get response
    await page.waitForSelector(".animate-bounce", { timeout: 5000 });
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Check that message was sent
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();

    // Check that AI responded
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should show error state on conversation creation failure", async ({
    page,
  }) => {
    // This test would require mocking the API to fail
    // For now, we'll skip it
    test.skip(true, "Requires API mocking");
  });

  test("should persist messages after page refresh", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send a unique message
    const uniqueMessage = `Test message ${Date.now()}`;
    await input.fill(uniqueMessage);
    await input.press("Enter");

    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Refresh page
    await page.reload();
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Check if message is still there
    const persistedMessage = page
      .locator('[data-testid="user-message"]')
      .filter({ hasText: uniqueMessage });
    await expect(persistedMessage).toBeVisible();
  });

  test("should display timestamps on messages", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test timestamp");
    await input.press("Enter");

    // Wait for message to appear
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 5000,
    });

    // Check for timestamp (format: HH:MM:SS or similar)
    const timestamp = page.locator(".text-xs.opacity-70");
    await expect(timestamp.first()).toBeVisible();

    const timestampText = await timestamp.first().textContent();
    expect(timestampText).toMatch(/\d{1,2}:\d{2}/); // Matches time format
  });

  test("should show loading indicator while AI is thinking", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test loading");
    await input.press("Enter");

    // Loading indicator should appear
    const loadingDots = page.locator(".animate-bounce");
    await expect(loadingDots.first()).toBeVisible({ timeout: 5000 });

    // Wait for response
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Loading indicator should disappear
    await expect(loadingDots.first()).not.toBeVisible();
  });
});

test.describe("Phase 1: Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("conversation creation should be fast", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("message send should be responsive", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    const startTime = Date.now();
    await input.fill("Quick test");
    await input.press("Enter");

    // User message should appear quickly
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 1000,
    });
    const messageAppearTime = Date.now() - startTime;

    // Should appear in less than 1 second
    expect(messageAppearTime).toBeLessThan(1000);
  });
});
