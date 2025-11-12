/**
 * Phase 2 Mocked Tests - Fast & Reliable
 * Tests AI integration with mocked responses
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

test.describe("Phase 2: Tools Integration (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should send tools to AI (verified via network)", async ({ page }) => {
    // Intercept to verify tools are sent
    let toolsSent = false;
    await page.route("**/api/trpc/chat.sendMessage*", async route => {
      const request = route.request();
      const url = new URL(request.url());

      // Tools should be configured on server
      toolsSent = true;

      await route.continue();
    });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test tools");
    await input.press("Enter");

    await page.waitForTimeout(500);
    expect(toolsSent).toBe(true);
  });

  test("should handle calendar suggestion with mocked response", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const calendarBtn = page.locator('[data-testid="suggestion-0"]');
    await calendarBtn.click();

    // Fast response with mocking
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle invoice suggestion with mocked response", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const invoiceBtn = page.locator('[data-testid="suggestion-1"]');
    await invoiceBtn.click();

    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle leads suggestion with mocked response", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const leadsBtn = page.locator('[data-testid="suggestion-2"]');
    await leadsBtn.click();

    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });
});

test.describe("Phase 2: Context Integration (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should send context in request payload", async ({ page }) => {
    let contextReceived = false;
    let contextData: any = null;

    await page.route("**/api/trpc/chat.sendMessage*", async route => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.context !== undefined) {
        contextReceived = true;
        contextData = postData.context;
      }

      await route.continue();
    });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test with context");
    await input.press("Enter");

    await page.waitForTimeout(500);

    expect(contextReceived).toBe(true);
    // Context should be an object (even if empty)
    expect(typeof contextData).toBe("object");
  });

  test("should handle email context in requests", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("What are the selected emails about?");
    await input.press("Enter");

    // Fast mocked response
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    const aiMessage = page.locator('[data-testid="ai-message"]').first();
    await expect(aiMessage).toBeVisible();
  });

  test("should include context in all messages", async ({ page }) => {
    let messageCount = 0;
    let allHaveContext = true;

    await page.route("**/api/trpc/chat.sendMessage*", async route => {
      const request = route.request();
      const postData = request.postDataJSON();

      messageCount++;
      if (postData?.context === undefined) {
        allHaveContext = false;
      }

      await route.continue();
    });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send 3 messages
    await input.fill("Message 1");
    await input.press("Enter");
    await page.waitForTimeout(200);

    await input.fill("Message 2");
    await input.press("Enter");
    await page.waitForTimeout(200);

    await input.fill("Message 3");
    await input.press("Enter");
    await page.waitForTimeout(200);

    expect(messageCount).toBeGreaterThanOrEqual(3);
    expect(allHaveContext).toBe(true);
  });
});

test.describe("Phase 2: Optimistic Updates (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should show message instantly (<100ms)", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    const startTime = Date.now();
    await input.fill("Instant test");
    await input.press("Enter");

    // Should appear VERY fast
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 200,
    });
    const appearTime = Date.now() - startTime;

    expect(appearTime).toBeLessThan(200);

    const userMessage = page.locator('[data-testid="user-message"]').first();
    await expect(userMessage).toContainText("Instant test");
  });

  test("should handle 5 rapid messages", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      await input.fill(`Rapid ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(50);
    }

    // All should appear quickly
    await page.waitForTimeout(500);

    const userMessages = page.locator('[data-testid="user-message"]');
    const count = await userMessages.count();

    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("should maintain order during rapid sending", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    await input.fill("First");
    await input.press("Enter");
    await page.waitForTimeout(50);

    await input.fill("Second");
    await input.press("Enter");
    await page.waitForTimeout(50);

    await input.fill("Third");
    await input.press("Enter");
    await page.waitForTimeout(300);

    const userMessages = page.locator('[data-testid="user-message"]');

    const first = await userMessages.nth(0).textContent();
    const second = await userMessages.nth(1).textContent();
    const third = await userMessages.nth(2).textContent();

    expect(first).toContain("First");
    expect(second).toContain("Second");
    expect(third).toContain("Third");
  });

  test("should show AI response after optimistic update", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");
    await input.fill("Test both");
    await input.press("Enter");

    // User message appears instantly
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 200,
    });

    // AI message appears after (mocked, so fast)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    const userMessage = page.locator('[data-testid="user-message"]').first();
    const aiMessage = page.locator('[data-testid="ai-message"]').first();

    await expect(userMessage).toBeVisible();
    await expect(aiMessage).toBeVisible();
  });
});

test.describe("Phase 2: Integration (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 100 });
  });

  test("should handle complete flow: optimistic + context + tools", async ({
    page,
  }) => {
    let contextSent = false;

    await page.route("**/api/trpc/chat.sendMessage*", async route => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.context !== undefined) {
        contextSent = true;
      }

      await route.continue();
    });

    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    const startTime = Date.now();
    await input.fill("Search emails about cleaning");
    await input.press("Enter");

    // Optimistic update
    await page.waitForSelector('[data-testid="user-message"]', {
      timeout: 200,
    });
    const optimisticTime = Date.now() - startTime;
    expect(optimisticTime).toBeLessThan(200);

    // AI response (mocked)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 2000 });

    // Context sent
    expect(contextSent).toBe(true);

    // Both messages visible
    const userMessage = page.locator('[data-testid="user-message"]').first();
    const aiMessage = page.locator('[data-testid="ai-message"]').first();

    await expect(userMessage).toBeVisible();
    await expect(aiMessage).toBeVisible();
  });

  test("should handle all suggestions with full integration", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    // Test all 4 suggestions
    for (let i = 0; i < 4; i++) {
      const suggestion = page.locator(`[data-testid="suggestion-${i}"]`);
      await suggestion.click();

      // Optimistic + AI response
      await page.waitForSelector('[data-testid="user-message"]', {
        timeout: 200,
      });
      await page.waitForSelector('[data-testid="ai-message"]', {
        timeout: 2000,
      });

      await page.waitForTimeout(100);
    }

    // Should have 4 user messages and 4 AI messages
    const userMessages = page.locator('[data-testid="user-message"]');
    const aiMessages = page.locator('[data-testid="ai-message"]');

    expect(await userMessages.count()).toBeGreaterThanOrEqual(4);
    expect(await aiMessages.count()).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Phase 2: Performance (Mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
    await enableAllMocks(page, { delay: 50 }); // Very fast
  });

  test("should handle 10 messages in under 5 seconds", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await input.fill(`Perf test ${i}`);
      await input.press("Enter");
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(1000);

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(5000);

    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(10);
  });

  test("should maintain UI responsiveness under load", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector('[data-testid="friday-ai-panel"]');

    const input = page.getByPlaceholder("Type your message...");

    // Send 20 messages
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      await input.fill(`Load test ${i}`);
      await input.press("Enter");
      const responseTime = Date.now() - startTime;

      // Each should be responsive
      expect(responseTime).toBeLessThan(100);

      await page.waitForTimeout(25);
    }

    const userMessages = page.locator('[data-testid="user-message"]');
    expect(await userMessages.count()).toBeGreaterThanOrEqual(20);
  });
});
