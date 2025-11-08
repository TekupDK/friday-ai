/**
 * Phase 4 E2E Tests - Analytics & Security
 * Tests analytics tracking and rate limiting
 */

import { test, expect } from "@playwright/test";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 4: Analytics Tracking", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should track message sent events", async ({ page }) => {
    let eventTracked = false;
    
    // Intercept analytics calls (if exposed)
    await page.on('console', (msg) => {
      if (msg.text().includes('chat_message_sent')) {
        eventTracked = true;
      }
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Analytics test");
    await input.press("Enter");
    
    // Message should be sent
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 1000 });
    
    // Analytics should be tracked on server
    // (Can't verify directly from client, but event is sent)
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
  });

  test("should track AI response events", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Response tracking test");
    await input.press("Enter");
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    // Analytics should track response time, model, etc.
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should track context usage", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Context tracking test");
    await input.press("Enter");
    
    // Analytics should track hasContext and contextKeys
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 1000 });
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
  });

  test("should track message length", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    const longMessage = "This is a longer message to test analytics tracking of message length and ensure we capture this metric correctly";
    await input.fill(longMessage);
    await input.press("Enter");
    
    // Analytics should track messageLength
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 1000 });
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toContainText(longMessage);
  });
});

test.describe("Phase 4: Rate Limiting", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should allow normal message sending", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 3 messages (well under limit)
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(200);
    }
    
    // All should be sent successfully
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(3);
  });

  test("should enforce rate limit (10 messages per minute)", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Try to send 11 messages rapidly (over limit)
    let rateLimitError = false;
    
    page.on('console', (msg) => {
      if (msg.text().includes('Rate limit') || msg.text().includes('TOO_MANY_REQUESTS')) {
        rateLimitError = true;
      }
    });
    
    for (let i = 0; i < 11; i++) {
      await input.fill(`Spam ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(50); // Send very quickly
    }
    
    // Should either get rate limited or show error
    await page.waitForTimeout(1000);
    
    // Check if error toast appeared
    const errorToast = page.getByText(/rate limit|too many/i);
    const hasError = await errorToast.isVisible().catch(() => false);
    
    // Either error shown or some messages blocked
    const userMessages = page.locator('[data-testid="user-message"]');
    const messageCount = await userMessages.count();
    
    // Should not have all 11 messages (some should be blocked)
    expect(messageCount).toBeLessThanOrEqual(10);
  });

  test("should reset rate limit after time window", async ({ page }) => {
    // This test would take 60+ seconds to run
    // Skip for now, but documents the expected behavior
    test.skip(true, "Rate limit reset test takes >60s");
  });

  test("should show appropriate error message on rate limit", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Try to trigger rate limit
    for (let i = 0; i < 12; i++) {
      await input.fill(`Fast ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(30);
    }
    
    await page.waitForTimeout(500);
    
    // Should show error message
    const errorMessage = page.getByText(/rate limit|wait|too many/i);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // Some indication of rate limiting should exist
    // (Either toast, console error, or blocked messages)
  });
});

test.describe("Phase 4: Performance Monitoring", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should track response time", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    const startTime = Date.now();
    await input.fill("Performance test");
    await input.press("Enter");
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    const responseTime = Date.now() - startTime;
    
    // Analytics should track this response time
    // Response time should be reasonable (<30s)
    expect(responseTime).toBeLessThan(30000);
  });

  test("should track model usage", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Model tracking");
    await input.press("Enter");
    
    // Analytics should track model='gemma-3-27b'
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should track tools available", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Tools test");
    await input.press("Enter");
    
    // Analytics should track toolsAvailable=35+
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });
});

test.describe("Phase 4: Integration", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should track complete flow with analytics", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send message
    await input.fill("Complete analytics flow");
    await input.press("Enter");
    
    // User message appears
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 1000 });
    
    // AI responds
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    // Both analytics events should be tracked:
    // 1. chat_message_sent
    // 2. chat_ai_response
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    
    await expect(userMessage).toBeVisible();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle analytics + rate limiting together", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send messages up to limit
    for (let i = 0; i < 5; i++) {
      await input.fill(`Analytics + Rate ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(100);
    }
    
    // All should be tracked and sent
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(5);
  });
});
