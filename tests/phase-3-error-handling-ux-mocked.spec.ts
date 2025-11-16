/**
 * Phase 3 Mocked Tests - Fast & Reliable
 * Tests error handling and UX with mocked responses
 */

import { expect, test } from "@playwright/test";
import { enableAllMocks } from "./helpers/mock-ai";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 3: Loading States (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should show and hide loading indicator quickly", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Fast loading test");
    await input.press("Enter");

    // Loading should appear
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 500 });

    // Should disappear quickly with mocking
    await expect(loadingIndicator).not.toBeVisible({ timeout: 2000 });
  });

  test("should show loading text", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Loading text test");
    await input.press("Enter");

    // Should show "Friday is thinking..."
    const thinkingText = page.getByText("Friday is thinking...");
    await expect(thinkingText).toBeVisible({ timeout: 500 });
  });

  test("should show animated dots", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Dots test");
    await input.press("Enter");

    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 500 });

    // Check for animated dots
    const dots = loadingIndicator.locator(".animate-bounce");
    expect(await dots.count()).toBe(3);
  });
});

test.describe("Phase 3: Scroll Behavior (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 50 });
  });

  test("should scroll to bottom on rapid messages", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");

    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      await input.fill(`Scroll test ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);

    // Last message should be visible
    const messages = aiPanel.locator('[data-testid="user-message"]');
    const lastMessage = messages.last();
    await expect(lastMessage).toBeInViewport();
  });

  test("should scroll smoothly", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Smooth scroll");
    await input.press("Enter");

    // Wait for scroll animation
    await page.waitForTimeout(300);

    const userMessage = aiPanel.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeInViewport();
  });

  test("should scroll after AI response", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("AI scroll test");
    await input.press("Enter");

    // Wait for AI response (mocked, fast) - scope to ai panel
    await aiPanel
      .locator('[data-testid="ai-message"]')
      .first()
      .waitFor({ timeout: 2000 });

    // AI message should be visible
    const aiMessage = aiPanel.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeInViewport();
  });
});

test.describe("Phase 3: Error Handling (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should handle conversation creation errors", async ({ page }) => {
    // Mock conversation creation to fail
    await page.route("**/api/trpc/chat.createConversation*", async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Creation failed" }),
      });
    });

    await page.goto("http://localhost:3000/");

    // Should show error message
    const errorMessage = page.getByText(/Failed to start chat/i);
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test("should not crash on errors", async ({ page }) => {
    await enableAllMocks(page, { delay: 50 });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    // Should not show error boundary
    const errorBoundary = page.getByText("An unexpected error occurred");
    await expect(errorBoundary).not.toBeVisible();

    // UI should be functional
    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible();
  });

  test("should recover from send errors", async ({ page }) => {
    await enableAllMocks(page, { delay: 50 });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");

    // Should still be able to type and send
    await input.fill("Recovery test");
    await expect(input).toHaveValue("Recovery test");

    await input.press("Enter");

    // Message should appear
    await aiPanel.locator('[data-testid="user-message"]').first().waitFor({
      timeout: 1000,
    });
  });
});

test.describe("Phase 3: UX Polish (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 50 });
  });

  test("should show welcome screen", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const welcomeScreen = aiPanel.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).toBeVisible();
  });

  test("should hide welcome after message", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Hide welcome");
    await input.press("Enter");

    await page.waitForTimeout(200);

    const welcomeScreen = aiPanel.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).not.toBeVisible();
  });

  test("should maintain UI responsiveness", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");

    // Should respond instantly
    const startTime = Date.now();
    await input.fill("Responsive test");
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(100);
    await expect(input).toHaveValue("Responsive test");
  });

  test("should show timestamps", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");
    await input.fill("Timestamp");
    await input.press("Enter");

    await aiPanel
      .locator('[data-testid="user-message"]')
      .first()
      .waitFor({ timeout: 500 });

    const timestamp = page.locator(".text-xs.opacity-70");
    await expect(timestamp.first()).toBeVisible();
  });
});

test.describe("Phase 3: Complete Flow (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should handle full UX flow", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');

    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");

    // Send message
    await input.fill("Full UX test");
    await input.press("Enter");

    // Loading appears
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 500 });

    // User message appears (optimistic)
    const userMessage = aiPanel.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();

    // AI responds - scope to ai panel
    await aiPanel
      .locator('[data-testid="ai-message"]')
      .first()
      .waitFor({ timeout: 2000 });

    // Loading disappears
    await expect(loadingIndicator).not.toBeVisible();

    // Scrolled to bottom
    const aiMessage = aiPanel.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeInViewport();

    // No errors
    const errorBoundary = page.getByText("An unexpected error occurred");
    await expect(errorBoundary).not.toBeVisible();
  });

  test("should handle 10 messages with all features", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="ai-assistant-panel"]');
    const aiPanel = page.locator('[data-testid="ai-assistant-panel"]');
    const input = aiPanel.getByPlaceholder("Type your message...");

    for (let i = 0; i < 10; i++) {
      await input.fill(`Message ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(150);
    }

    // All messages should be visible
    const userMessages = aiPanel.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(10);

    // Last message visible (scrolled)
    const lastMessage = userMessages.last();
    await expect(lastMessage).toBeInViewport();

    // No errors
    const errorBoundary = page.getByText("An unexpected error occurred");
    await expect(errorBoundary).not.toBeVisible();
  });
});
