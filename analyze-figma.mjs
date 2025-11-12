import { chromium } from "playwright";

async function analyzeFigmaDesign() {
  console.log("🚀 Starting Figma Design Analysis...\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Figma
    console.log("📍 Navigating to Figma site...");
    await page.goto("https://trout-cling-66917018.figma.site");
    await page.waitForTimeout(3000);

    // Take welcome screenshot
    console.log("📸 Screenshot 1: Welcome Screen");
    await page.screenshot({ path: "figma-analysis/01-welcome.png" });

    // Analyze welcome screen
    const welcomeText = await page.textContent(
      'h1, h2, .title, [class*="title"]'
    );
    console.log("   Title:", welcomeText);

    // Count suggested actions
    const actionButtons = await page
      .locator('button[class*="action"], button[class*="suggestion"]')
      .count();
    console.log("   Action buttons:", actionButtons);

    // Try to find demo scenarios
    const scenarios = [
      "Vejr Forespørgsel",
      "Web Søgning",
      "Kalender Møder",
      "Ubetalte Fakturaer",
      "Opret Lead",
    ];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n🎯 Scenario ${i + 2}: ${scenario}`);

      try {
        // Try to find and click the scenario
        const button = page.locator(`text="${scenario}"`).first();
        const isVisible = await button.isVisible({ timeout: 2000 });

        if (isVisible) {
          await button.click();
          await page.waitForTimeout(2000);

          // Take screenshot
          const filename = `0${i + 2}-${scenario.toLowerCase().replace(/\s+/g, "-")}.png`;
          await page.screenshot({ path: `figma-analysis/${filename}` });
          console.log(`   ✅ Screenshot saved: ${filename}`);

          // Try to extract UI elements
          const cards = await page
            .locator('[class*="card"], [class*="response"]')
            .count();
          console.log(`   Cards visible: ${cards}`);
        } else {
          console.log(`   ⚠️  Scenario button not visible`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log("\n=== 📊 Design Analysis Summary ===");

    // Try to get all text content
    const allText = await page.textContent("body");
    const hasEmojis = /[🌤️☁️👤📅💰🔍🔧⚙️]/.test(allText || "");
    console.log("Uses Emojis:", hasEmojis ? "✅ Yes" : "❌ No");

    // Check for tool execution elements
    const hasProgressBar =
      (await page.locator('[class*="progress"]').count()) > 0;
    console.log("Has Progress Bar:", hasProgressBar ? "✅ Yes" : "❌ No");

    const hasSubtasks =
      allText?.includes("Subtasks") || allText?.includes("subtask");
    console.log("Has Subtasks:", hasSubtasks ? "✅ Yes" : "❌ No");

    console.log(
      "\n✅ Analysis Complete! Check figma-analysis/ folder for screenshots"
    );
  } catch (error) {
    console.error("❌ Error during analysis:", error);
  } finally {
    await browser.close();
  }
}

analyzeFigmaDesign();
