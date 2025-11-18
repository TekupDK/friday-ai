/**
 * Phase 0 Story Discovery Script
 *
 * Discovers correct story IDs by testing different formats
 */

import puppeteer from "puppeteer";

async function discoverStories() {
  console.log("🔍 Discovering Phase 0 Story IDs...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on("console", msg => console.log("Browser console:", msg.text()));

  try {
    // Navigate to Storybook
    await page.goto("http://localhost:6006", { waitUntil: "networkidle2" });

    // Wait a bit for Storybook to load
    await page.waitForTimeout(3000);

    // Try to get stories from the sidebar
    const stories = await page.evaluate(() => {
      // Look for story items in the sidebar
      const storyItems = document.querySelectorAll(
        '[data-item-id], [role="treeitem"]'
      );
      const storyIds = [];

      storyItems.forEach(item => {
        const id =
          item.getAttribute("data-item-id") ||
          item.getAttribute("id") ||
          item.textContent;
        if (id && (id.includes("apple") || id.includes("Apple"))) {
          storyIds.push(id);
        }
      });

      return storyIds;
    });

    console.log("Found Apple-related story IDs:");
    stories.forEach(id => console.log(`  - ${id}`));

    // Test specific component stories
    const components = [
      "AppleButton",
      "AppleInput",
      "AppleModal",
      "AppleBadge",
      "AppleCard",
      "ScrollToTop",
      "AppleSearchField",
      "AppleListItem",
      "AppleDrawer",
      "AppleSheet",
      "AppleTag",
    ];

    console.log("\n🧪 Testing component stories...\n");

    for (const component of components) {
      const storyIdFormats = [
        `apple-ui-${component.toLowerCase()}--default`,
        `apple-ui-${component.toLowerCase()}--primary`,
        `crm-apple-ui-${component.toLowerCase()}--default`,
        `${component.toLowerCase()}--default`,
        `apple-ui-${component.toLowerCase()}`,
      ];

      let found = false;

      for (const storyId of storyIdFormats) {
        try {
          const testPage = await browser.newPage();
          const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;

          await testPage.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 5000,
          });

          // Check if story loaded successfully
          const hasContent = await testPage.evaluate(() => {
            const root = document.querySelector("#storybook-root");
            const hasError = document.querySelector(".sb-errordisplay");
            return root && root.children.length > 0 && !hasError;
          });

          if (hasContent) {
            console.log(`✅ ${component} - Found: ${storyId}`);
            found = true;
            await testPage.close();
            break;
          }

          await testPage.close();
        } catch (error) {
          // Story not found, try next format
          await testPage.close();
        }
      }

      if (!found) {
        console.log(`❌ ${component} - No working story ID found`);
      }
    }
  } catch (error) {
    console.error("Error during discovery:", error);
  } finally {
    await browser.close();
  }
}

// Run discovery
discoverStories().catch(console.error);
