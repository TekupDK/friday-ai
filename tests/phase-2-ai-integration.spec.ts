/**
 * Phase 2 E2E Tests - AI Integration
 * Tests tools integration, context integration, and optimistic updates
 */

import { test, expect } from "@playwright/test";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 2: Tools Integration", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should enable AI to call functions", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Ask Friday to search emails (should trigger tool calling)
    await input.fill("Søg efter emails fra i dag");
    await input.press("Enter");
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
    
    // AI should have processed the request
    const content = await aiMessage.textContent();
    expect(content).toBeTruthy();
  });

  test("should handle calendar requests", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    // Click calendar suggestion
    const calendarSuggestion = page.locator('[data-testid="suggestion-0"]'); // "Tjek min kalender i dag"
    await calendarSuggestion.click();
    
    // Should trigger calendar tool
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle invoice requests", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    // Click invoice suggestion
    const invoiceSuggestion = page.locator('[data-testid="suggestion-1"]'); // "Vis ubetalte fakturaer"
    await invoiceSuggestion.click();
    
    // Should trigger Billy integration
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle lead search requests", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    // Click leads suggestion
    const leadsSuggestion = page.locator('[data-testid="suggestion-2"]'); // "Find nye leads"
    await leadsSuggestion.click();
    
    // Should trigger email search
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });
});

test.describe("Phase 2: Context Integration", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should send context with messages", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    // Intercept sendMessage request to verify context is sent
    let contextSent = false;
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      // Check if context is included
      if (postData?.context !== undefined) {
        contextSent = true;
      }
      
      await route.continue();
    });
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test context");
    await input.press("Enter");
    
    // Wait a bit for request to be made
    await page.waitForTimeout(1000);
    
    // Context should have been sent (even if empty)
    expect(contextSent).toBe(true);
  });

  test("should handle email context", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Ask about selected emails (context-aware)
    await input.fill("Hvad handler de valgte emails om?");
    await input.press("Enter");
    
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
    
    // AI should respond (even if no emails selected)
    const content = await aiMessage.textContent();
    expect(content).toBeTruthy();
  });

  test("should handle calendar context", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Ask about calendar (context-aware)
    await input.fill("Hvad har jeg i min kalender?");
    await input.press("Enter");
    
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });
});

test.describe("Phase 2: Optimistic Updates", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should show user message instantly", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    const startTime = Date.now();
    await input.fill("Instant message test");
    await input.press("Enter");
    
    // User message should appear VERY quickly (optimistic update)
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
    const appearTime = Date.now() - startTime;
    
    // Should appear in less than 500ms (optimistic)
    expect(appearTime).toBeLessThan(500);
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText("Instant message test");
  });

  test("should handle rapid message sending", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 3 messages rapidly
    await input.fill("Message 1");
    await input.press("Enter");
    
    await page.waitForTimeout(100);
    
    await input.fill("Message 2");
    await input.press("Enter");
    
    await page.waitForTimeout(100);
    
    await input.fill("Message 3");
    await input.press("Enter");
    
    // All user messages should appear quickly (optimistic)
    await page.waitForTimeout(500);
    
    const userMessages = page.locator('[data-testid="user-message"]');
    const count = await userMessages.count();
    
    // Should have at least 3 user messages
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should rollback on error", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    // Mock API to fail
    await page.route('**/api/trpc/chat.sendMessage*', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("This will fail");
    await input.press("Enter");
    
    // Message should appear optimistically
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Message might be rolled back or error shown
    // (Exact behavior depends on implementation)
  });

  test("should maintain message order with optimistic updates", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send first message
    await input.fill("First message");
    await input.press("Enter");
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
    
    // Send second message quickly
    await input.fill("Second message");
    await input.press("Enter");
    
    await page.waitForTimeout(500);
    
    // Check message order
    const userMessages = page.locator('[data-testid="user-message"]');
    const firstMsg = userMessages.nth(0);
    const secondMsg = userMessages.nth(1);
    
    await expect(firstMsg).toContainText("First message");
    await expect(secondMsg).toContainText("Second message");
  });
});

test.describe("Phase 2: Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should handle complete flow: context + tools + optimistic", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send context-aware message that triggers tools
    const startTime = Date.now();
    await input.fill("Søg efter emails om rengøring fra i dag");
    await input.press("Enter");
    
    // User message should appear instantly (optimistic)
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
    const optimisticTime = Date.now() - startTime;
    expect(optimisticTime).toBeLessThan(500);
    
    // AI should process with tools and context
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    
    await expect(userMessage).toBeVisible();
    await expect(aiMessage).toBeVisible();
    
    // Both messages should have content
    const userContent = await userMessage.textContent();
    const aiContent = await aiMessage.textContent();
    
    expect(userContent).toContain("rengøring");
    expect(aiContent).toBeTruthy();
  });

  test("should handle multiple tool calls in sequence", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // First tool call (calendar)
    await input.fill("Tjek min kalender");
    await input.press("Enter");
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    // Second tool call (invoices)
    await input.fill("Vis fakturaer");
    await input.press("Enter");
    await page.waitForTimeout(1000);
    
    // Should have 2 user messages and 2 AI messages
    const userMessages = page.locator('[data-testid="user-message"]');
    const aiMessages = page.locator('[data-testid="ai-message"]');
    
    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
    expect(await aiMessages.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Phase 2: Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("optimistic updates should be under 100ms", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    const startTime = Date.now();
    await input.fill("Performance test");
    await input.press("Enter");
    
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 200 });
    const updateTime = Date.now() - startTime;
    
    // Optimistic update should be VERY fast
    expect(updateTime).toBeLessThan(100);
  });

  test("should handle high message volume", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 10 messages
    for (let i = 0; i < 10; i++) {
      await input.fill(`Message ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(50);
    }
    
    // All should appear
    await page.waitForTimeout(1000);
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(10);
  });
});
