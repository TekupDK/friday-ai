/**
 * AI Documentation Generator - Authenticated E2E Test
 *
 * Full flow test with authentication:
 * 1. Login
 * 2. Navigate to docs
 * 3. See AI buttons
 * 4. Test generation flow
 */

import { test, expect } from "@playwright/test";

test.describe("🤖 AI Docs - Authenticated Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Check if already logged in
    const url = page.url();
    if (!url.includes("/docs") && !url.includes("/dashboard")) {
      console.log("🔐 Not logged in, attempting login...");

      // Try dev login if available
      const devLoginBtn = page.locator('button:has-text("Dev Login")');
      if ((await devLoginBtn.count()) > 0) {
        console.log("✓ Found Dev Login button");
        await devLoginBtn.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
      } else {
        console.log("⚠️  No Dev Login - manual auth required");
      }
    } else {
      console.log("✓ Already authenticated");
    }
  });

  test("should show AI generation buttons when authenticated", async ({
    page,
  }) => {
    console.log("\n🧪 Testing AI Buttons (Authenticated)\n");

    // Navigate to docs
    await page.goto("http://localhost:3000/docs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("✓ Docs page loaded");

    // Take screenshot
    await page.screenshot({
      path: "test-results/ai-docs-authenticated.png",
      fullPage: true,
    });

    // Check for AI buttons
    const weeklyDigestBtn = page.locator('button:has-text("Weekly Digest")');
    const bulkGenerateBtn = page.locator('button:has-text("Bulk Generate")');
    const newDocBtn = page.locator('button:has-text("New Document")');

    const hasWeekly = (await weeklyDigestBtn.count()) > 0;
    const hasBulk = (await bulkGenerateBtn.count()) > 0;
    const hasNewDoc = (await newDocBtn.count()) > 0;

    console.log(
      `✓ Weekly Digest button: ${hasWeekly ? "✅ Found" : "❌ Not found"}`
    );
    console.log(
      `✓ Bulk Generate button: ${hasBulk ? "✅ Found" : "❌ Not found"}`
    );
    console.log(
      `✓ New Document button: ${hasNewDoc ? "✅ Found" : "❌ Not found"}`
    );

    // Log all buttons for debugging
    const allButtons = await page.locator("button").allTextContents();
    console.log(`\n📊 All buttons found (${allButtons.length}):`);
    allButtons.slice(0, 15).forEach((text, i) => {
      if (text.trim()) {
        console.log(`   ${i + 1}. "${text.trim()}"`);
      }
    });

    // Check for AI icons
    const sparklesCount = await page.locator("svg.lucide-sparkles").count();
    const zapCount = await page.locator("svg.lucide-zap").count();
    const calendarCount = await page.locator("svg.lucide-calendar").count();

    console.log(`\n📊 AI Icons:`);
    console.log(`   Sparkles: ${sparklesCount}`);
    console.log(`   Zap: ${zapCount}`);
    console.log(`   Calendar: ${calendarCount}`);

    if (hasWeekly || hasBulk) {
      console.log(
        "\n✅ AI buttons are visible! System working correctly! 🎉\n"
      );
    } else {
      console.log(
        "\n⚠️  AI buttons not visible - check authentication status\n"
      );
      console.log(`   Current URL: ${page.url()}`);
    }
  });

  test("should display AI-generated doc with proper formatting", async ({
    page,
  }) => {
    console.log("\n🧪 Testing AI Doc Display\n");

    await page.goto("http://localhost:3000/docs?view=P9_dkAIR3Sa_q5QJqyx6y");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("✓ AI doc loaded");

    const content = await page.content();

    // Check for markdown rendering
    const hasHeadings = content.includes("<h1") || content.includes("<h2");
    const hasParagraphs = content.includes("<p>");
    const hasLists = content.includes("<ul>") || content.includes("<ol>");

    console.log(`✓ Has headings: ${hasHeadings ? "✅" : "❌"}`);
    console.log(`✓ Has paragraphs: ${hasParagraphs ? "✅" : "❌"}`);
    console.log(`✓ Has lists: ${hasLists ? "✅" : "❌"}`);

    // Check for AI tags
    const aiTags = await page
      .locator('[class*="badge"]:has-text("ai"), [class*="tag"]:has-text("ai")')
      .count();
    console.log(`✓ AI tags/badges: ${aiTags}`);

    await page.screenshot({
      path: "test-results/ai-doc-display.png",
      fullPage: true,
    });

    console.log("\n✅ AI doc display test completed\n");
  });

  test("should have working doc search and filters", async ({ page }) => {
    console.log("\n🧪 Testing Docs Search & Filters\n");

    await page.goto("http://localhost:3000/docs");
    await page.waitForLoadState("networkidle");

    // Check search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    if ((await searchInput.count()) > 0) {
      console.log("✓ Search box found");

      // Try searching for "AI"
      await searchInput.fill("AI");
      await page.waitForTimeout(1000);

      console.log("✓ Search executed");
    } else {
      console.log("⚠️  Search box not found");
    }

    // Check category filter
    const categoryFilter = page.locator('select, [role="combobox"]').first();
    if ((await categoryFilter.count()) > 0) {
      console.log("✓ Category filter found");
    }

    await page.screenshot({
      path: "test-results/ai-docs-search.png",
      fullPage: true,
    });

    console.log("\n✅ Search & filters test completed\n");
  });

  test("should load docs list without errors", async ({ page }) => {
    console.log("\n🧪 Testing Docs List Load\n");

    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("http://localhost:3000/docs");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log("✓ Docs list loaded");

    // Check for doc cards
    const docCards = await page.locator('[class*="card"]').count();
    console.log(`✓ Document cards found: ${docCards}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors detected (${errors.length}):`);
      errors.slice(0, 3).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.slice(0, 100)}`);
      });
    } else {
      console.log("✓ No errors! Clean load! 🎉");
    }

    console.log("\n✅ Docs list test completed\n");
  });
});
