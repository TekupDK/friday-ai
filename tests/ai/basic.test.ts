/**
 * Ultra Basic Friday AI Test
 *
 * Just verify Playwright + browser works
 */

import { test, expect } from "@playwright/test";

test("🤖 Playwright AI Setup Works", async ({ page }) => {
  console.log("🚀 Starting basic AI test...");

  // Just navigate and verify browser works
  await page.goto("about:blank");

  // Test basic browser functionality
  await page.setContent("<html><body><h1>Friday AI Test</h1></body></html>");

  const title = await page.textContent("h1");
  expect(title).toBe("Friday AI Test");

  console.log("✅ Basic Playwright AI test passed!");
});
