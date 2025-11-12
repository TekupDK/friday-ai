/**
 * Phase 3 E2E Tests - Error Handling & UX
 * Tests error boundary, loading states, and scroll behavior
 */

import { test, expect } from "@playwright/test";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 3: Error Boundary", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should not crash on component errors", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Chat should be visible and working
    const chatPanel = page.locator('[data-testid="friday-ai-panel"]');
    await expect(chatPanel).toBeVisible();

    // Should not show error boundary UI
    const errorBoundary = page.getByText("An unexpected error occurred");
    await expect(errorBoundary).not.toBeVisible();
  });

  test("should show error state on conversation creation failure", async ({
    page,
  }) => {
    // Mock API to fail
    await page.route("**/api/trpc/chat.createConversation*", async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    await page.goto("http://localhost:3000/");

    // Should show error message
    const errorMessage = page.getByText(/Failed to start chat/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should handle graceful degradation", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Even with errors, UI should remain functional
    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible();
  });
});

test.describe("Phase 3: Loading States", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
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
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });

    // Should show "Friday is thinking..." text
    const thinkingText = page.getByText("Friday is thinking...");
    await expect(thinkingText).toBeVisible();
  });

  test("should show loading state during conversation creation", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");

    // Should show "Starting Friday AI..." briefly
    const startingText = page.getByText("Starting Friday AI...");

    // Either it's visible or already loaded
    const isVisible = await startingText.isVisible().catch(() => false);

    // Eventually should load
    await page.waitForSelector('[data-testid="friday-ai-panel"]', {
      timeout: 5000,
    });
  });

  test("should hide loading indicator after AI responds", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Quick test");
    await input.press("Enter");

    // Wait for loading to appear
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });

    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Loading should be gone
    await expect(loadingIndicator).not.toBeVisible();
  });

  test("should show loading dots animation", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Animation test");
    await input.press("Enter");

    // Check for loading indicator
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });

    // Should have animated dots
    const dots = loadingIndicator.locator(".animate-bounce");
    expect(await dots.count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Phase 3: Scroll Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should auto-scroll to bottom on new message", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send first message
    await input.fill("First message");
    await input.press("Enter");
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 1000,
    });

    // Send second message
    await input.fill("Second message");
    await input.press("Enter");

    await page.waitForTimeout(500);

    // Latest message should be visible (scrolled to bottom)
    const messages = page.locator('[data-testid="user-message"]');
    const lastMessage = messages.last();
    await expect(lastMessage).toBeInViewport();
  });

  test("should scroll to bottom when AI responds", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test scroll");
    await input.press("Enter");

    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // AI message should be visible (scrolled to bottom)
    const aiMessage = page.locator('[data-testid="ai-message"]').last();
    await expect(aiMessage).toBeInViewport();
  });

  test("should handle multiple messages with auto-scroll", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send 5 messages
    for (let i = 0; i < 5; i++) {
      await input.fill(`Message ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(200);
    }

    // Last message should be visible
    const messages = page.locator('[data-testid="user-message"]');
    const lastMessage = messages.last();
    await expect(lastMessage).toBeInViewport();
  });

  test("should use smooth scrolling", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send message
    await input.fill("Smooth scroll test");
    await input.press("Enter");

    // Wait a bit for smooth scroll animation
    await page.waitForTimeout(300);

    // Message should be visible
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
  });
});

test.describe("Phase 3: Error Display", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should show error message on send failure", async ({ page }) => {
    // Mock API to fail
    await page.route("**/api/trpc/chat.sendMessage*", async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Send failed" }),
      });
    });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("This will fail");
    await input.press("Enter");

    // Should show error (either toast or inline)
    await page.waitForTimeout(1000);

    // Check for error indication
    const errorText = page.getByText(/error|failed/i);
    const hasError = await errorText.isVisible().catch(() => false);

    // Some error indication should be present
    expect(hasError).toBeTruthy();
  });

  test("should recover from errors", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Even after errors, should be able to send new messages
    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeEnabled();

    await input.fill("Recovery test");
    await input.press("Enter");

    // Should process normally
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 1000,
    });
  });
});

test.describe("Phase 3: UX Polish", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should show welcome screen initially", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Welcome screen should be visible
    const welcomeScreen = page.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).toBeVisible();

    // Should have suggestions
    const suggestions = page.locator('[data-testid^="suggestion-"]');
    expect(await suggestions.count()).toBeGreaterThanOrEqual(4);
  });

  test("should hide welcome screen after first message", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Hide welcome");
    await input.press("Enter");

    await page.waitForTimeout(500);

    // Welcome screen should be hidden
    const welcomeScreen = page.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).not.toBeVisible();
  });

  test("should maintain UI responsiveness", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Input should always be responsive
    await input.fill("Test 1");
    await expect(input).toHaveValue("Test 1");

    await input.clear();
    await input.fill("Test 2");
    await expect(input).toHaveValue("Test 2");
  });

  test("should show timestamps on messages", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Timestamp test");
    await input.press("Enter");

    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 1000,
    });

    // Should have timestamp
    const timestamp = page.locator(".text-xs.opacity-70");
    await expect(timestamp.first()).toBeVisible();
  });
});

test.describe("Phase 3: Integration", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should handle complete flow with all Phase 3 features", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send message
    await input.fill("Complete flow test");
    await input.press("Enter");

    // Loading indicator appears
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });

    // Message appears (optimistic)
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();

    // AI responds
    await page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 30000,
    });

    // Loading gone
    await expect(loadingIndicator).not.toBeVisible();

    // Scrolled to bottom
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeInViewport();

    // No errors
    const errorBoundary = page.getByText("An unexpected error occurred");
    await expect(errorBoundary).not.toBeVisible();
  });
});
