/**
 * AI-Powered Playwright Agent
 * Uses vision + LLM to intelligently verify UI components
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { join } from "path";
import { chromium } from "playwright";

// Configure OpenRouter (acts as OpenAI proxy)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/TekupDK/friday-ai",
    "X-Title": "Friday AI - Playwright Agent",
  },
});

// Phase 0 components
const components = [
  { name: "AppleButton", id: "apple-ui-applebutton--primary" },
  { name: "AppleInput", id: "apple-ui-appleinput--default" },
  { name: "AppleSearchField", id: "apple-ui-applesearchfield--default" },
  { name: "AppleListItem", id: "apple-ui-applelistitem--default" },
  { name: "AppleBadge", id: "apple-ui-applebadge--all-statuses" },
  { name: "AppleTag", id: "apple-ui-appletag--default" },
  { name: "AppleCard", id: "apple-ui-applecard--elevated" },
];

// Apple HIG Color Guidelines
const COLOR_GUIDELINES = `
**Apple Human Interface Guidelines - Colors:**

Light Mode:
- System Blue: #007AFF
- Background: #FFFFFF  
- Secondary Background: #F2F2F7
- Label (text): #000000
- Secondary Label: rgba(60, 60, 67, 0.6)
- Placeholder: rgba(60, 60, 67, 0.3)

Dark Mode:
- System Blue: #0A84FF
- Background: #1C1C1E
- Secondary Background: #2C2C2E  
- Label (text): #FFFFFF
- Secondary Label: rgba(235, 235, 245, 0.6)
- Placeholder: rgba(235, 235, 245, 0.3)
`;

async function analyzeWithAI(
  componentName,
  lightScreenshotBase64,
  darkScreenshotBase64
) {
  console.log(`  🤖 AI analyzing ${componentName}...`);

  const prompt = `You are an expert UI designer specializing in Apple's Human Interface Guidelines.

${COLOR_GUIDELINES}

I'm showing you two screenshots of the SAME component: one in Light mode, one in Dark mode.

Your task:
1. Analyze if the colors match Apple HIG guidelines
2. Verify that colors ACTUALLY CHANGE between light and dark mode
3. Check for these specific issues:
   - Is system blue #007AFF in light mode and #0A84FF in dark mode?
   - Does background change from white to dark?
   - Do text colors invert properly?
   - Are there any color violations or contrast issues?

Component: ${componentName}

Please provide:
1. **Status**: PASS or FAIL
2. **Color Analysis**: What colors you observe in each mode
3. **Issues Found**: List any problems
4. **Recommendation**: What needs to be fixed (if any)

Be very specific and technical. Respond in JSON format:
{
  "status": "PASS" or "FAIL",
  "lightModeColors": {
    "primary": "color observed",
    "background": "color observed",
    "text": "color observed"
  },
  "darkModeColors": {
    "primary": "color observed", 
    "background": "color observed",
    "text": "color observed"
  },
  "colorsChanged": true/false,
  "issues": ["list of issues"],
  "recommendation": "what to fix"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${lightScreenshotBase64}`,
                detail: "high",
              },
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${darkScreenshotBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if no JSON
    return {
      status: "FAIL",
      issues: ["AI response was not in expected format"],
      recommendation: "Manual review needed",
      rawResponse: content,
    };
  } catch (error) {
    console.error(`  ❌ AI Error: ${error.message}`);
    return {
      status: "ERROR",
      issues: [error.message],
      recommendation: "AI analysis failed",
    };
  }
}

async function main() {
  console.log("🚀 AI-Powered Playwright Agent Starting\n");

  // Check for API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY environment variable not set!");
    console.log("Please set it in your .env.dev file or environment.");
    process.exit(1);
  }

  const outputDir = join(process.cwd(), "test-results", "ai-verification");
  mkdirSync(outputDir, { recursive: true });

  process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1";

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  const results = [];

  for (const component of components) {
    console.log(`\n📦 Testing: ${component.name}`);

    try {
      await page.goto(
        `http://localhost:6006/iframe.html?id=${component.id}&viewMode=story`,
        {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        }
      );

      await page.waitForTimeout(500);

      // Light Mode
      console.log("  ☀️  Capturing light mode...");
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });
      await page.waitForTimeout(500);

      const lightScreenshotPath = join(
        outputDir,
        `${component.name}-light.png`
      );
      await page.screenshot({ path: lightScreenshotPath });
      const lightScreenshotBase64 =
        readFileSync(lightScreenshotPath).toString("base64");

      // Dark Mode
      console.log("  🌙 Capturing dark mode...");
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await page.waitForTimeout(500);

      const darkScreenshotPath = join(outputDir, `${component.name}-dark.png`);
      await page.screenshot({ path: darkScreenshotPath });
      const darkScreenshotBase64 =
        readFileSync(darkScreenshotPath).toString("base64");

      // AI Analysis
      const aiAnalysis = await analyzeWithAI(
        component.name,
        lightScreenshotBase64,
        darkScreenshotBase64
      );

      results.push({
        component: component.name,
        ...aiAnalysis,
        lightScreenshot: lightScreenshotPath,
        darkScreenshot: darkScreenshotPath,
      });

      console.log(
        `  ${aiAnalysis.status === "PASS" ? "✅" : "❌"} Status: ${aiAnalysis.status}`
      );
      if (aiAnalysis.issues && aiAnalysis.issues.length > 0) {
        aiAnalysis.issues.forEach(issue => console.log(`     - ${issue}`));
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({
        component: component.name,
        status: "ERROR",
        error: error.message,
      });
    }
  }

  await browser.close();

  // Generate Report
  console.log("\n\n📊 Generating AI Analysis Report...\n");

  const report = {
    timestamp: new Date().toISOString(),
    model: "google/gemini-flash-1.5-8b",
    totalComponents: components.length,
    passed: results.filter(r => r.status === "PASS").length,
    failed: results.filter(r => r.status === "FAIL").length,
    errors: results.filter(r => r.status === "ERROR").length,
    results,
  };

  const reportPath = join(outputDir, "ai-report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print Summary
  console.log("═══════════════════════════════════════════════════════");
  console.log("            AI VERIFICATION SUMMARY                    ");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`Model: ${report.model}`);
  console.log(`Total Components: ${report.totalComponents}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⚠️  Errors: ${report.errors}`);
  console.log(`\n📁 Screenshots: ${outputDir}`);
  console.log(`📄 AI Report: ${reportPath}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Print detailed results with AI recommendations
  console.log("DETAILED AI ANALYSIS:\n");
  results.forEach(result => {
    console.log(
      `${result.status === "PASS" ? "✅" : "❌"} ${result.component}`
    );
    if (result.issues && result.issues.length > 0) {
      console.log(`   Issues:`);
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    if (result.recommendation) {
      console.log(`   💡 Recommendation: ${result.recommendation}`);
    }
    console.log("");
  });

  console.log("✨ AI Verification Complete!\n");

  process.exit(report.failed > 0 || report.errors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
