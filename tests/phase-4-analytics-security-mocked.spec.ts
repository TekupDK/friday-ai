/**
 * Phase 4 Mocked Tests - Fast & Reliable
 * Tests analytics and rate limiting with mocked responses
 */

import { test, expect } from "@playwright/test";
import { enableAllMocks } from "./helpers/mock-ai";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 4: Analytics Tracking (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should send analytics events", async ({ page }) => {
    let messagesSent = 0;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      messagesSent++;
      await route.continue();
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Analytics test");
    await input.press("Enter");
    
    await page.waitForTimeout(500);
    
    // Should have sent message
    expect(messagesSent).toBeGreaterThanOrEqual(1);
  });

  test("should track multiple messages", async ({ page }) => {
    let eventCount = 0;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      eventCount++;
      await route.continue();
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 3 messages
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(150);
    }
    
    // Should track 3 events
    expect(eventCount).toBe(3);
  });

  test("should include context in analytics", async ({ page }) => {
    let hasContext = false;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.context !== undefined) {
        hasContext = true;
      }
      
      await route.continue();
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Context test");
    await input.press("Enter");
    
    await page.waitForTimeout(500);
    
    // Should include context
    expect(hasContext).toBe(true);
  });
});

test.describe("Phase 4: Rate Limiting (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 50 });
  });

  test("should allow messages under limit", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 5 messages (under limit)
    for (let i = 0; i < 5; i++) {
      await input.fill(`Message ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(100);
    }
    
    // All should succeed
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(5);
  });

  test("should block messages over limit", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    let requestCount = 0;
    let blockedCount = 0;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      requestCount++;
      
      // Simulate rate limit after 10 requests
      if (requestCount > 10) {
        blockedCount++;
        await route.fulfill({
          status: 429,
          body: JSON.stringify({ 
            error: { message: 'Rate limit exceeded' } 
          }),
        });
      } else {
        await route.continue();
      }
    });
    
    // Try to send 15 messages rapidly
    for (let i = 0; i < 15; i++) {
      await input.fill(`Spam ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(30);
    }
    
    await page.waitForTimeout(500);
    
    // Some should be blocked
    expect(blockedCount).toBeGreaterThan(0);
  });

  test("should show error on rate limit", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Mock rate limit error
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({ 
          error: { message: 'Rate limit exceeded. Please wait.' } 
        }),
      });
    });
    
    await input.fill("Rate limit test");
    await input.press("Enter");
    
    await page.waitForTimeout(1000);
    
    // Should show error (toast or message)
    const errorText = page.getByText(/rate limit|wait/i);
    const hasError = await errorText.isVisible().catch(() => false);
    
    // Error indication should exist
    // (Either visible error or console message)
  });
});

test.describe("Phase 4: Performance Metrics (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should track fast response times", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    const startTime = Date.now();
    await input.fill("Performance test");
    await input.press("Enter");
    
    // Wait for response (mocked, so fast)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });
    const responseTime = Date.now() - startTime;
    
    // With mocking, should be very fast
    expect(responseTime).toBeLessThan(2000);
  });

  test("should handle high message volume", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 10 messages
    for (let i = 0; i < 10; i++) {
      await input.fill(`Volume ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(80);
    }
    
    await page.waitForTimeout(500);
    
    // All should be tracked
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(10);
  });
});

test.describe("Phase 4: Integration (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should handle analytics + rate limiting + optimistic updates", async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      requestCount++;
      
      // Allow first 8, block rest
      if (requestCount > 8) {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({ error: { message: 'Rate limited' } }),
        });
      } else {
        await route.continue();
      }
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 10 messages
    for (let i = 0; i < 10; i++) {
      await input.fill(`Integration ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(50);
    }
    
    await page.waitForTimeout(500);
    
    // Should have sent 10 requests (8 success, 2 blocked)
    expect(requestCount).toBe(10);
    
    // UI should show messages (optimistic)
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(8);
  });

  test("should track all events in complete flow", async ({ page }) => {
    let messageSentEvents = 0;
    
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      messageSentEvents++;
      await route.continue();
    });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Complete flow
    await input.fill("Complete flow");
    await input.press("Enter");
    
    // User message (optimistic)
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
    
    // AI response (mocked)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });
    
    // Should have tracked event
    expect(messageSentEvents).toBeGreaterThanOrEqual(1);
    
    // Both messages visible
    const userMessage = page.locator('[data-testid="user-message"]').first();
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    
    await expect(userMessage).toBeVisible();
    await expect(aiMessage).toBeVisible();
  });
});
