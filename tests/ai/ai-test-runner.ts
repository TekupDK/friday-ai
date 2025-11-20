/**
 * AI Test Runner - Friday AI Testing Suite
 *
 * Intelligent test execution with:
 * - Natural language test commands
 * - AI-powered validation
 * - Performance monitoring
 * - Visual regression detection
 * - Automated reporting
 */

import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import FridayAITestDataGenerator from "./test-data-generator";

// AI Test fixture with enhanced capabilities
type AITestFixtures = {
  aiPage: Page;
  aiContext: BrowserContext;
  testData: typeof FridayAITestDataGenerator;
  aiValidate: (response: string, criteria: any) => Promise<any>;
  aiMeasurePerformance: (action: () => Promise<void>) => Promise<any>;
};

// Extend base test with AI fixtures
export const test = base.extend<AITestFixtures>({
  aiPage: async ({ browser }, use) => {
    const isTestMode = process.env.AI_TEST_MODE === "true" || process.env.FRIDAY_TEST_ENV === "playwright";
    const extraHeaders: Record<string, string> = isTestMode
      ? { "x-test-user-id": "test-user-123" }
      : {};
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      // Enable AI-specific features
      permissions: ["clipboard-read"],
      extraHTTPHeaders: extraHeaders,
      // Set Danish locale for testing
      locale: "da-DK",
      timezoneId: "Europe/Copenhagen",
    });

    const page = await context.newPage();

    // Enable console logging for debugging
    page.on("console", msg => {
      if (msg.type() === "error") {
        console.error("🔥 Browser Error:", msg.text());
      } else if (msg.type() === "warning") {
        console.warn("⚠️ Browser Warning:", msg.text());
      } else {
        console.log("📝 Browser Log:", msg.text());
      }
    });

    // Monitor network requests for AI testing
    page.on("request", request => {
      if (request.url().includes("openrouter.ai")) {
        console.log("🤖 AI API Request:", request.method(), request.url());
      }
    });

    page.on("response", response => {
      if (response.url().includes("openrouter.ai")) {
        console.log("📡 AI API Response:", response.status(), response.url());
      }
    });

    await use(page);
    await context.close();
  },

  aiContext: async ({ browser }, use) => {
    const isTestMode = process.env.AI_TEST_MODE === "true" || process.env.FRIDAY_TEST_ENV === "playwright";
    const extraHeaders: Record<string, string> = isTestMode
      ? { "x-test-user-id": "test-user-123" }
      : {};
    const context = await browser.newContext({
      // AI test specific settings
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      extraHTTPHeaders: extraHeaders,
    });
    await use(context);
    await context.close();
  },

  testData: async ({}, use) => {
    await use(FridayAITestDataGenerator);
  },

  aiValidate: async ({}, use) => {
    const validate = async (response: string, criteria: any) => {
      console.log(
        "🔍 AI Validating response:",
        response.substring(0, 100) + "..."
      );

      const results = {
        danishLanguage: FridayAITestDataGenerator.containsDanish(response),
        professionalTone:
          FridayAITestDataGenerator.hasProfessionalTone(response),
        businessContext: FridayAITestDataGenerator.hasBusinessContext(response),
        actionItems: FridayAITestDataGenerator.hasActionItems(response),
        contextUsage: FridayAITestDataGenerator.usesProvidedContext(response),
        length: response.length,
        wordCount: response.split(/\s+/).length,
      };

      // Calculate quality score
      const score = Object.values(results).filter(
        v => typeof v === "boolean" && v
      ).length;
      results.qualityScore = score;
      results.qualityPercentage = (score / 5) * 100; // 5 criteria max

      console.log("📊 Validation Results:", results);
      return results;
    };

    await use(validate);
  },

  aiMeasurePerformance: async ({}, use) => {
    const measure = async (action: () => Promise<void>) => {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();

      await action();

      const endTime = performance.now();
      const endMemory = process.memoryUsage();

      const metrics = {
        duration: endTime - startTime,
        memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
        timestamp: new Date().toISOString(),
      };

      console.log("⚡ Performance Metrics:", metrics);
      return metrics;
    };

    await use(measure);
  },
});

// AI-powered test helpers
export class AITestHelper {
  constructor(private page: Page) {}

  // Navigate to Friday AI with error handling
  async navigateToFriday() {
    try {
      await this.page.goto("http://localhost:3000");
      await this.page.waitForSelector('[data-testid="app-root"]', {
        timeout: 10000,
      });

      // Wait for Friday AI panel to be ready
      const aiPanel = this.page.locator('[data-testid="ai-assistant-panel"]');
      await aiPanel
        .locator('[data-testid="friday-chat-input"]')
        .waitFor({ timeout: 5000 });

      console.log("✅ Friday AI loaded successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to load Friday AI:", error);
      return false;
    }
  }

  // Send message to Friday AI with timing
  async sendMessage(message: string) {
    console.log("💬 Sending message:", message);

    const startTime = Date.now();

    const aiPanel = this.page.locator('[data-testid="ai-assistant-panel"]');
    await aiPanel.locator('[data-testid="friday-chat-input"]').fill(message);
    await aiPanel.locator('[data-testid="friday-send-button"]').click();

    // Wait for AI response
    await aiPanel
      .locator('[data-testid="ai-message"]')
      .last()
      .waitFor({ timeout: 15000 });

    const responseTime = Date.now() - startTime;
    const response = await aiPanel
      .locator('[data-testid="ai-message"]')
      .last()
      .textContent();

    console.log(
      `🤖 Response received in ${responseTime}ms:`,
      response?.substring(0, 100)
    );

    return {
      message,
      response: response || "",
      responseTime,
      timestamp: new Date().toISOString(),
    };
  }

  // Get conversation history
  async getConversationHistory() {
    const messages = await this.page
      .locator('[data-testid="ai-message"]')
      .all();
    const history = [];

    for (const message of messages) {
      const content = await message.textContent();
      const role = await message.getAttribute("data-role");

      history.push({
        role: role || "unknown",
        content: content || "",
        timestamp: new Date().toISOString(),
      });
    }

    return history;
  }

  // Simulate context (emails, calendar, etc.)
  async simulateContext(type: "emails" | "calendar" | "invoices") {
    switch (type) {
      case "emails":
        // Simulate selecting emails (adapted for EmailTabV2 / EmailCenterPanel)
        const emailTabV2 = this.page.locator('[data-testid="email-tab-v2"]');
        if (await emailTabV2.count().catch(() => 0)) {
          await emailTabV2
            .first()
            .click()
            .catch(() => {});
        } else {
          const header = this.page.locator("text=Email Center");
          if (await header.count().catch(() => 0)) {
            await header
              .first()
              .click()
              .catch(() => {});
          }
        }
        await Promise.race([
          this.page
            .waitForSelector('[data-testid="email-list"]', { timeout: 5000 })
            .catch(() => {}),
          this.page
            .waitForSelector('[data-testid="email-center-panel"]', {
              timeout: 5000,
            })
            .catch(() => {}),
        ]);
        const emails = this.page.locator('[data-testid="email-item"]');
        if (await emails.count().catch(() => 0)) {
          await emails
            .first()
            .click()
            .catch(() => {});
        }
        console.log("📧 Simulated email context");
        break;

      case "calendar":
        // Simulate calendar view
        await this.page.click('[data-testid="calendar-tab"]');
        await this.page.waitForSelector('[data-testid="calendar-view"]');
        console.log("📅 Simulated calendar context");
        break;

      case "invoices":
        // Simulate invoice view
        await this.page.click('[data-testid="invoice-tab"]');
        await this.page.waitForSelector('[data-testid="invoice-list"]');
        console.log("💰 Simulated invoice context");
        break;
    }
  }

  // Take AI-powered screenshot
  async takeAIScreenshot(name: string) {
    const screenshot = await this.page.screenshot({
      path: `test-results/ai-screenshots/${name}.png`,
      fullPage: false,
    });

    console.log("📸 AI Screenshot taken:", name);
    return screenshot;
  }

  // Validate UI elements with AI
  async validateUI() {
    const aiPanel = this.page.locator('[data-testid="ai-assistant-panel"]');
    const validations = {
      fridayPanelVisible: await aiPanel.isVisible().catch(() => false),
      inputFieldVisible: await aiPanel
        .locator('[data-testid="friday-chat-input"]')
        .isVisible()
        .catch(() => false),
      sendButtonVisible: await aiPanel
        .locator('[data-testid="friday-send-button"]')
        .isVisible()
        .catch(() => false),
      messageAreaVisible: await aiPanel
        .locator('[data-testid="friday-message-area"]')
        .isVisible()
        .catch(() => false),
    };

    // Check 20% width constraint
    const panel = await this.page.locator('[data-testid="ai-assistant-panel"]');
    const boundingBox = await panel.boundingBox();
    validations.panelWidth = boundingBox?.width || 0;
    validations.widthConstraint = (validations.panelWidth || 0) < 400; // Should be ~384px

    console.log("🎨 UI Validations:", validations);
    return validations;
  }
}

// Custom AI matchers
expect.extend({
  async toHaveDanishLanguage(response: string) {
    const hasDanish = FridayAITestDataGenerator.containsDanish(response);
    return {
      message: () => `Expected response to contain Danish language`,
      pass: hasDanish,
    };
  },

  async toHaveProfessionalTone(response: string) {
    const isProfessional =
      FridayAITestDataGenerator.hasProfessionalTone(response);
    return {
      message: () => `Expected response to have professional tone`,
      pass: isProfessional,
    };
  },

  async toHaveBusinessContext(response: string) {
    const hasBusiness = FridayAITestDataGenerator.hasBusinessContext(response);
    return {
      message: () => `Expected response to have business context`,
      pass: hasBusiness,
    };
  },

  async toRespondWithinTime(responseTime: number, maxTime: number) {
    const isFastEnough = responseTime <= maxTime;
    return {
      message: () =>
        `Expected response time ${responseTime}ms to be <= ${maxTime}ms`,
      pass: isFastEnough,
    };
  },
});

// Export test and helper
export { expect };
export default AITestHelper;
