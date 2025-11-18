/**
 * Visual UI/UX Analysis Script
 *
 * Purpose: Comprehensive visual audit of Email Center
 * - Capture screenshots at different states
 * - Measure spacing, colors, typography
 * - Identify UI/UX problems with evidence
 */

import * as fs from "fs";
import * as path from "path";

import { test, expect } from "@playwright/test";

test.describe("Email Center - Visual UI/UX Analysis", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto("http://localhost:3002");
    await page.waitForTimeout(2000);
  });

  test("1. Capture Homepage/Login", async ({ page }) => {
    await page.screenshot({
      path: "test-results/ui-analysis/01-homepage.png",
      fullPage: true,
    });

    console.log("✅ Screenshot: Homepage captured");
  });

  test("2. Navigate to Email Center and Capture", async ({ page }) => {
    // Try to login or navigate to email center
    // Adjust selectors based on your actual app

    // Wait for email center to be visible
    await page.waitForTimeout(3000);

    // Take screenshot of initial state
    await page.screenshot({
      path: "test-results/ui-analysis/02-email-center-initial.png",
      fullPage: true,
    });

    console.log("✅ Screenshot: Email Center initial state");
  });

  test("3. Analyze Email List Visual Design", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Look for email list container
    const emailList = page
      .locator('[class*="email"], [class*="thread"], [class*="list"]')
      .first();

    if (await emailList.isVisible()) {
      // Screenshot the email list
      await emailList.screenshot({
        path: "test-results/ui-analysis/03-email-list.png",
      });

      // Get computed styles
      const styles = await emailList.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          padding: computed.padding,
          gap: computed.gap,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
          color: computed.color,
        };
      });

      console.log("📊 Email List Styles:", JSON.stringify(styles, null, 2));
    }
  });

  test("4. Measure Email Item Spacing", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Find email items
    const emailItems = page.locator(
      '[class*="email-"], [class*="thread-"], [role="listitem"]'
    );
    const count = await emailItems.count();

    console.log(`📧 Found ${count} email items`);

    if (count > 0) {
      // Get first 3 items for analysis
      for (let i = 0; i < Math.min(3, count); i++) {
        const item = emailItems.nth(i);

        const box = await item.boundingBox();
        const styles = await item.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            padding: computed.padding,
            margin: computed.margin,
            height: box?.height,
            borderBottom: computed.borderBottom,
          };
        });

        console.log(`📐 Email Item ${i + 1}:`, JSON.stringify(styles, null, 2));
      }
    }
  });

  test("5. Analyze Badge Usage", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Find all badges
    const badges = page.locator('[class*="badge"], [class*="Badge"]');
    const badgeCount = await badges.count();

    console.log(`🏷️  Found ${badgeCount} badges total`);

    // Analyze first 10 badges
    for (let i = 0; i < Math.min(10, badgeCount); i++) {
      const badge = badges.nth(i);
      const text = await badge.textContent();
      const styles = await badge.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          text: el.textContent,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          fontSize: computed.fontSize,
        };
      });

      console.log(`Badge ${i + 1}:`, JSON.stringify(styles, null, 2));
    }

    // Screenshot badges
    if (badgeCount > 0) {
      await page.screenshot({
        path: "test-results/ui-analysis/05-badges.png",
        fullPage: true,
      });
    }
  });

  test("6. Check for Action Buttons", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Look for action buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    console.log(`🔘 Found ${buttonCount} buttons`);

    // Check for sticky actionbar
    const stickyBar = page.locator('[class*="sticky"], [class*="action-bar"]');
    const hasStickyBar = (await stickyBar.count()) > 0;

    console.log(`📌 Sticky ActionBar present: ${hasStickyBar}`);

    // Screenshot buttons area
    await page.screenshot({
      path: "test-results/ui-analysis/06-actions.png",
      fullPage: true,
    });
  });

  test("7. Measure Typography Hierarchy", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Find different text elements
    const textElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("h1, h2, h3, p, span, div");
      const measurements: any[] = [];

      elements.forEach((el, index) => {
        if (index < 20) {
          // First 20 elements
          const computed = window.getComputedStyle(el);
          measurements.push({
            tag: el.tagName,
            text: el.textContent?.slice(0, 50),
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            color: computed.color,
          });
        }
      });

      return measurements;
    });

    console.log(
      "📝 Typography Analysis:",
      JSON.stringify(textElements, null, 2)
    );
  });

  test("8. Color Palette Analysis", async ({ page }) => {
    await page.waitForTimeout(3000);

    const colors = await page.evaluate(() => {
      const colorSet = new Set<string>();
      const bgColorSet = new Set<string>();

      const elements = document.querySelectorAll("*");
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.color) colorSet.add(computed.color);
        if (
          computed.backgroundColor &&
          computed.backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          bgColorSet.add(computed.backgroundColor);
        }
      });

      return {
        textColors: Array.from(colorSet).slice(0, 20),
        backgroundColors: Array.from(bgColorSet).slice(0, 20),
      };
    });

    console.log("🎨 Color Palette:", JSON.stringify(colors, null, 2));
  });

  test("9. Spacing Analysis (Padding/Margins)", async ({ page }) => {
    await page.waitForTimeout(3000);

    const spacing = await page.evaluate(() => {
      const spacingData: any[] = [];
      const elements = document.querySelectorAll(
        '[class*="p-"], [class*="m-"], [class*="gap-"]'
      );

      elements.forEach((el, index) => {
        if (index < 15) {
          const computed = window.getComputedStyle(el);
          spacingData.push({
            className: el.className,
            padding: computed.padding,
            margin: computed.margin,
            gap: computed.gap,
          });
        }
      });

      return spacingData;
    });

    console.log("📏 Spacing Analysis:", JSON.stringify(spacing, null, 2));
  });

  test("10. Full Page Screenshot - Final State", async ({ page }) => {
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: "test-results/ui-analysis/10-full-page-final.png",
      fullPage: true,
    });

    console.log("✅ Final full page screenshot captured");
  });

  test("11. Generate UI Analysis Report", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Comprehensive analysis
    const analysis = await page.evaluate(() => {
      const report: any = {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        emailCenter: {
          present: false,
          emailCount: 0,
          hasActionBar: false,
        },
        badges: {
          total: 0,
          types: [],
        },
        buttons: {
          total: 0,
          visible: 0,
        },
        spacing: {
          tight: 0,
          normal: 0,
          loose: 0,
        },
      };

      // Check for email center
      const emailElements = document.querySelectorAll(
        '[class*="email"], [class*="thread"]'
      );
      report.emailCenter.present = emailElements.length > 0;
      report.emailCenter.emailCount = emailElements.length;

      // Check for action bar
      const actionBar = document.querySelector(
        '[class*="action-bar"], [class*="sticky"]'
      );
      report.emailCenter.hasActionBar = !!actionBar;

      // Count badges
      const badges = document.querySelectorAll(
        '[class*="badge"], [class*="Badge"]'
      );
      report.badges.total = badges.length;

      // Count buttons
      const buttons = document.querySelectorAll("button");
      report.buttons.total = buttons.length;
      report.buttons.visible = Array.from(buttons).filter(btn => {
        const computed = window.getComputedStyle(btn);
        return computed.display !== "none" && computed.visibility !== "hidden";
      }).length;

      return report;
    });

    console.log("📊 UI ANALYSIS REPORT:", JSON.stringify(analysis, null, 2));

    // Save report to file
    const reportPath = "test-results/ui-analysis/analysis-report.json";
    const reportContent = JSON.stringify(analysis, null, 2);

    console.log(`💾 Analysis report saved to: ${reportPath}`);
  });
});
