/**
 * Quick UI Audit - Extract Visual Metrics
 */

import { test } from "@playwright/test";
import * as fs from "fs";

test("Complete UI Analysis - Email Center", async ({ page }) => {
  // Navigate
  await page.goto("http://localhost:3002");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({
    path: "test-results/ui-analysis/complete-ui.png",
    fullPage: true,
  });

  // Extract ALL UI metrics
  const analysis = await page.evaluate(() => {
    const report: any = {
      timestamp: new Date().toISOString(),
      page: {
        title: document.title,
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      },
      emailCenter: {},
      threads: [],
      badges: [],
      buttons: [],
      colors: { text: [], backgrounds: [] },
      spacing: [],
      typography: [],
    };

    // Find email/thread elements
    const threadElements = Array.from(
      document.querySelectorAll(
        '[class*="thread"], [class*="email"], [data-thread], [role="listitem"]'
      )
    );
    report.emailCenter.threadCount = threadElements.length;

    // Analyze first 5 threads
    threadElements.slice(0, 5).forEach((el, i) => {
      const computed = window.getComputedStyle(el);
      const bbox = el.getBoundingClientRect();

      report.threads.push({
        index: i,
        text: el.textContent?.slice(0, 100),
        styles: {
          padding: computed.padding,
          margin: computed.margin,
          height: bbox.height,
          backgroundColor: computed.backgroundColor,
          borderBottom: computed.borderBottom,
          gap: computed.gap,
        },
      });
    });

    // Find ALL badges
    const badgeElements = Array.from(
      document.querySelectorAll(
        '[class*="badge"], [class*="Badge"], [class*="chip"]'
      )
    );
    report.badges = badgeElements.slice(0, 20).map((el, i) => {
      const computed = window.getComputedStyle(el);
      return {
        index: i,
        text: el.textContent,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
        fontSize: computed.fontSize,
        borderRadius: computed.borderRadius,
      };
    });

    // Find ALL buttons
    const buttonElements = Array.from(document.querySelectorAll("button"));
    report.buttons = buttonElements.slice(0, 30).map((el, i) => {
      const computed = window.getComputedStyle(el);
      return {
        index: i,
        text: el.textContent?.trim().slice(0, 50),
        visible:
          computed.display !== "none" && computed.visibility !== "hidden",
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
      };
    });

    // Collect unique colors
    const colorSet = new Set<string>();
    const bgColorSet = new Set<string>();
    document.querySelectorAll("*").forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.color) colorSet.add(computed.color);
      if (
        computed.backgroundColor &&
        computed.backgroundColor !== "rgba(0, 0, 0, 0)"
      ) {
        bgColorSet.add(computed.backgroundColor);
      }
    });
    report.colors.text = Array.from(colorSet).slice(0, 30);
    report.colors.backgrounds = Array.from(bgColorSet).slice(0, 30);

    // Analyze spacing on main containers
    const containers = Array.from(
      document.querySelectorAll(
        '[class*="container"], [class*="wrapper"], [class*="panel"]'
      )
    );
    report.spacing = containers.slice(0, 10).map((el, i) => {
      const computed = window.getComputedStyle(el);
      return {
        index: i,
        className: el.className,
        padding: computed.padding,
        margin: computed.margin,
        gap: computed.gap,
      };
    });

    // Typography analysis
    const textElements = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, p, span, div")
    );
    report.typography = textElements
      .slice(0, 50)
      .map((el, i) => {
        const computed = window.getComputedStyle(el);
        const text = el.textContent?.trim().slice(0, 30);
        if (!text) return null;
        return {
          index: i,
          tag: el.tagName,
          text,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          color: computed.color,
        };
      })
      .filter(Boolean);

    // Check for sticky actionbar
    const stickyElements = Array.from(
      document.querySelectorAll(
        '[class*="sticky"], [style*="sticky"], [style*="fixed"]'
      )
    );
    report.emailCenter.hasStickyActionBar = stickyElements.some(el => {
      const text = el.textContent?.toLowerCase() || "";
      return (
        text.includes("reply") ||
        text.includes("svar") ||
        text.includes("archive") ||
        text.includes("arkiver")
      );
    });

    // Count badge colors
    const badgeColors = new Map<string, number>();
    badgeElements.forEach(el => {
      const bg = window.getComputedStyle(el).backgroundColor;
      badgeColors.set(bg, (badgeColors.get(bg) || 0) + 1);
    });
    report.emailCenter.badgeColorCount = badgeColors.size;
    report.emailCenter.badgeColorDistribution = Object.fromEntries(badgeColors);

    return report;
  });

  // Save to JSON
  const reportPath = "test-results/ui-analysis/ui-metrics.json";
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

  console.log("\n\n═══════════════════════════════════════════════════");
  console.log("🎨 UI/UX ANALYSIS COMPLETE");
  console.log("═══════════════════════════════════════════════════\n");

  console.log("📊 SUMMARY:");
  console.log(`   - Threads found: ${analysis.emailCenter.threadCount}`);
  console.log(`   - Badges found: ${analysis.badges.length}`);
  console.log(`   - Badge colors: ${analysis.emailCenter.badgeColorCount}`);
  console.log(`   - Buttons found: ${analysis.buttons.length}`);
  console.log(
    `   - Sticky ActionBar: ${analysis.emailCenter.hasStickyActionBar ? "✅ YES" : "❌ NO"}`
  );
  console.log(`   - Text colors used: ${analysis.colors.text.length}`);
  console.log(`   - BG colors used: ${analysis.colors.backgrounds.length}`);

  console.log("\n🏷️  BADGE ANALYSIS:");
  analysis.badges.slice(0, 5).forEach((badge: any) => {
    console.log(
      `   Badge: "${badge.text}" | BG: ${badge.backgroundColor} | Color: ${badge.color}`
    );
  });

  console.log("\n📐 THREAD SPACING:");
  analysis.threads.slice(0, 3).forEach((thread: any) => {
    console.log(
      `   Thread ${thread.index + 1}: Padding: ${thread.styles.padding} | Height: ${thread.styles.height}px`
    );
  });

  console.log("\n📝 TYPOGRAPHY SAMPLES:");
  analysis.typography.slice(0, 5).forEach((t: any) => {
    console.log(
      `   ${t.tag}: "${t.text}" | Size: ${t.fontSize} | Weight: ${t.fontWeight}`
    );
  });

  console.log("\n💾 Full report saved to:", reportPath);
  console.log("═══════════════════════════════════════════════════\n\n");
});
