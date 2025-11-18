/**
 * Phase 1 Code Verification Test
 *
 * Automated test to verify all Phase 1 improvements are correctly implemented
 * in the codebase before manual browser testing.
 */

import * as fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { expect, test } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EMAIL_LIST_AI_PATH = join(
  __dirname,
  "../client/src/components/inbox/EmailListAI.tsx"
);
const EMAIL_THREAD_GROUP_PATH = join(
  __dirname,
  "../client/src/components/inbox/EmailThreadGroup.tsx"
);

test.describe("Phase 1 Code Verification", () => {
  test("EmailQuickActions should be imported (moved to EmailThreadGroup)", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(content).toContain(
      'import EmailQuickActions from "./EmailQuickActions"'
    );
  });

  test("Badge should be conditional (only for score >= 70) in thread group", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(
      content.includes("maxLeadScore >= 70") ||
        content.includes("leadScore >= 70")
    ).toBe(true);
    expect(content.includes("Hot") || content.includes("hot")).toBe(true);
  });

  test("Quick Actions should be hover-activated in thread group", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(content).toContain("opacity-0 group-hover:opacity-100");
    expect(content).toContain("EmailQuickActions");
  });

  test("Simplified layout should NOT include legacy intelligence badges in thread group", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(content.includes("sourceConfig") && content.includes("Badge")).toBe(
      false
    );
    expect(content.includes("urgencyConfig") && content.includes("Badge")).toBe(
      false
    );
  });

  test("Source badges should be removed from thread group items", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(content.includes("sourceConfig") && content.includes("Badge")).toBe(
      false
    );
  });

  test("Urgency badges should be removed from thread group items", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(content.includes("urgencyConfig") && content.includes("Badge")).toBe(
      false
    );
  });

  test("Email thread group should have Shortwave-style markers & snippet display", async () => {
    const content = fs.readFileSync(EMAIL_THREAD_GROUP_PATH, "utf-8");
    expect(
      content.includes("Shortwave-style") ||
        content.includes("Shortwave-inspired")
    ).toBe(true);
    expect(content).toContain("line-clamp-2");
  });
});

// Skipped unless RUN_VISUAL_EMAIL_TESTS env var is set (dev server not always available in CI/unit runs)
if (!process.env.RUN_VISUAL_EMAIL_TESTS) {
  test.describe.skip("Phase 1 Visual Verification (Browser)", () => {
    test("Email Center should load without errors", async ({ page }) => {});
    test("Email list should render without badge clutter", async ({
      page,
    }) => {});
    test("Quick Actions should appear on hover", async ({ page }) => {});
    test("SPLITS sidebar should be functional", async ({ page }) => {});
  });
} else {
  test.describe("Phase 1 Visual Verification (Browser)", () => {
    test("Email Center should load without errors", async ({ page }) => {
      await page.goto("http://localhost:3002");

      // Wait for page load
      await page.waitForLoadState("networkidle");

      // Check for no console errors
      const errors: string[] = [];
      page.on("console", msg => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      // Navigate to Email Center
      await page.click("text=Email Center");
      await page.waitForTimeout(2000);

      // Should have no critical errors
      const criticalErrors = errors.filter(
        e => !e.includes("Warning") && !e.includes("DevTools")
      );

      expect(criticalErrors.length).toBe(0);
    });

    test("Email list should render without badge clutter", async ({ page }) => {
      await page.goto("http://localhost:3002");
      await page.click("text=Email Center");
      await page.waitForTimeout(2000);

      // Get first email item
      const emailItem = page.locator('[role="button"]').first();
      await emailItem.waitFor();

      // Check that email is visible
      expect(await emailItem.isVisible()).toBe(true);

      // Take screenshot for manual verification
      await page.screenshot({
        path: "test-results/phase1-email-list.png",
        fullPage: true,
      });
    });

    test("Quick Actions should appear on hover", async ({ page }) => {
      await page.goto("http://localhost:3002");
      await page.click("text=Email Center");
      await page.waitForTimeout(2000);

      // Get first email item
      const emailItem = page.locator('[role="button"]').first();
      await emailItem.waitFor();

      // Hover over email
      await emailItem.hover();
      await page.waitForTimeout(500); // Wait for fade-in animation

      // Take screenshot to verify quick actions appeared
      await page.screenshot({
        path: "test-results/phase1-quick-actions-hover.png",
      });

      // Note: Actual visual verification needs manual review of screenshot
      // since opacity transitions are hard to detect programmatically
    });

    test("SPLITS sidebar should be functional", async ({ page }) => {
      await page.goto("http://localhost:3002");
      await page.click("text=Email Center");
      await page.waitForTimeout(2000);

      // Check for SPLITS elements
      const allEmailsSplit = page.locator("text=Alle Emails");
      const hotLeadsSplit = page.locator("text=Hot Leads");

      expect(await allEmailsSplit.isVisible()).toBe(true);
      expect(await hotLeadsSplit.isVisible()).toBe(true);

      // Click on Hot Leads split
      await hotLeadsSplit.click();
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: "test-results/phase1-hot-leads-split.png",
      });
    });
  });
}
