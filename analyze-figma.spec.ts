import { test, expect } from "@playwright/test";

test("Analyze Figma Design - All Scenarios", async ({ page }) => {
  // Naviger til Figma site
  await page.goto("https://trout-cling-66917018.figma.site");
  await page.waitForTimeout(3000);

  console.log("\n=== 📸 SCENARIO 1: Welcome Screen ===");
  await page.screenshot({ path: "figma-analysis/01-welcome.png" });

  // Find all demo scenario buttons
  const scenarios = [
    {
      name: "Vejr Forespørgsel",
      description: "Weather response card med 3-kolonne grid",
    },
    { name: "Web Søgning", description: "Search results med 3 artikler" },
    { name: "Kalender Møder", description: "Calendar events med attendees" },
    {
      name: "Ubetalte Fakturaer",
      description: "Invoice cards med status badges",
    },
    { name: "Opret Lead", description: "Lead creation confirmation card" },
  ];

  for (const scenario of scenarios) {
    console.log(`\n=== 🎯 Testing: ${scenario.name} ===`);
    console.log(`Description: ${scenario.description}`);

    try {
      // Click on scenario button
      await page.click(`text=${scenario.name}`, { timeout: 5000 });
      await page.waitForTimeout(2000);

      // Take screenshot
      const filename = scenario.name.toLowerCase().replace(/\s+/g, "-");
      await page.screenshot({ path: `figma-analysis/${filename}.png` });

      // Extract visible text
      const chatContent = await page
        .locator('.chat-message, [role="article"], .message')
        .allTextContents();
      console.log("Chat content:", chatContent.slice(0, 3).join(" | "));
    } catch (error) {
      console.log(`❌ Could not test ${scenario.name}:`, error.message);
    }
  }

  console.log("\n=== ✅ Analysis Complete ===");
  console.log("Screenshots saved to figma-analysis/ folder");
});
