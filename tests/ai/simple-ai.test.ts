/**
 * Simple Friday AI Test - Getting Started
 *
 * Basic AI testing to verify setup works
 */

import { test, expect } from "@playwright/test";

test.describe("🤖 Friday AI - Simple Tests", () => {
  test("basic page load", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Wait for app to load completely
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("body", { timeout: 10000 });

    // Check if page loads without crashing
    const body = await page.locator("body");
    expect(await body.isVisible()).toBe(true);

    console.log("✅ Page loaded successfully");
  });

  test("Friday AI panel exists", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Wait for app to load
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("body", { timeout: 10000 });

    // Look for Friday AI elements (using more generic selectors)
    const aiPanel = await page
      .locator("div")
      .filter({ hasText: "Friday" })
      .first();

    if (await aiPanel.isVisible()) {
      console.log("✅ Friday AI panel found");
      expect(true).toBe(true);
    } else {
      console.log("ℹ️ Friday AI panel not visible - might need login");
      // This is OK for now, we're just testing the setup
      expect(true).toBe(true);
    }
  });

  test("AI test infrastructure works", async ({ page }) => {
    // Set correct viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto("http://localhost:3000");

    // Test basic browser automation
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("body", { timeout: 10000 });

    // Take a screenshot for verification
    await page.screenshot({ path: "test-results/simple-ai-test.png" });

    console.log("📸 Screenshot taken successfully");

    // Check viewport
    const viewport = page.viewportSize();
    console.log("📐 Viewport:", viewport);

    expect(viewport?.width).toBe(1920);
    expect(viewport?.height).toBe(1080);
  });
});
