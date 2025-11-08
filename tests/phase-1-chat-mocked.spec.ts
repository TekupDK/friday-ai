/**
 * Phase 1 Chat Tests with AI Mocking
 * Fast, reliable tests using mocked AI responses
 */

import { test, expect } from "@playwright/test";
import { enableAllMocks, mockAIResponses } from "./helpers/mock-ai";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test.describe("Phase 1: Mocked AI Tests (Fast)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    // Enable AI mocking for fast tests
    await enableAllMocks(page, { delay: 100 });
  });

  test("should send message and receive mocked AI response quickly", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Hej Friday");
    await input.press("Enter");
    
    // With mocking, response should be fast (<2s)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });
    
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
    
    // Check mock response content
    const aiContent = await aiMessage.textContent();
    expect(aiContent).toContain('mock');
  });

  test("should handle multiple messages quickly with mocking", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send first message
    await input.fill("Message 1");
    await input.press("Enter");
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });
    
    // Send second message
    await input.fill("Message 2");
    await input.press("Enter");
    await page.waitForTimeout(200); // Wait for second response
    
    // Should have 2 user messages and 2 AI messages
    const userMessages = page.locator('[data-testid="user-message"]');
    const aiMessages = page.locator('[data-testid="ai-message"]');
    
    expect(await userMessages.count()).toBeGreaterThanOrEqual(2);
    expect(await aiMessages.count()).toBeGreaterThanOrEqual(2);
  });

  test("should handle AI errors gracefully", async ({ page }) => {
    // Mock AI failure
    await mockAIResponses(page, { shouldFail: true });
    
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("This will fail");
    await input.press("Enter");
    
    // Should show error or handle gracefully
    // (Exact behavior depends on error handling implementation)
    await page.waitForTimeout(1000);
    
    // User message should still be visible
    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toBeVisible();
  });

  test("should click suggestion and get quick response", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const suggestion = page.locator('[data-testid="suggestion-0"]');
    await suggestion.click();
    
    // Fast response with mocking
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });
    
    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should load conversation quickly with mocked data", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    
    // Should load in <1s with mocking
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1000);
  });
});

test.describe("Phase 1: Performance with Mocking", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 50 }); // Very fast for performance tests
  });

  test("should handle rapid message sending", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      await input.fill(`Message ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(100);
    }
    
    // All messages should be sent
    await page.waitForTimeout(500);
    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(5);
  });

  test("should maintain UI responsiveness during message sending", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');
    
    const input = page.getByPlaceholder("Type your message...");
    
    const startTime = Date.now();
    await input.fill("Performance test");
    await input.press("Enter");
    
    // Input should be responsive immediately
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(100);
    
    // Message should appear quickly
    await page.waitForSelector('[data-testid="user-message"]', { timeout: 500 });
  });
});
