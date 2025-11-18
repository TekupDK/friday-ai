import { chromium } from "playwright";
import fs from "node:fs";

const COMPONENTS = [
  {
    name: "AppleButton",
    storyIds: ["apple-ui-applebutton--primary"],
    selectors: ["button"],
    themeProps: ["background-color", "color", "border-color", "box-shadow"],
    status: "working",
  },
  {
    name: "AppleInput",
    storyIds: ["apple-ui-appleinput--default"],
    selectors: ["input"],
    themeProps: ["background-color", "color", "border-color"],
    status: "working",
  },
  {
    name: "AppleModal",
    storyIds: ["apple-ui-applemodal--default"],
    selectors: ['[class*="modal"]', '[class*="Modal"]'],
    themeProps: ["background-color", "color", "border-color"],
    status: "broken",
  },
  {
    name: "AppleBadge",
    storyIds: ["apple-ui-applebadge--new"],
    selectors: ['[class*="badge"]', '[class*="Badge"]'],
    themeProps: ["background-color", "color", "border-color"],
    status: "needs-css-fix",
  },
  {
    name: "AppleCard",
    storyIds: ["apple-ui-applecard--elevated"],
    selectors: ['[class*="card"]', '[class*="Card"]'],
    themeProps: ["background-color", "color", "border-color", "box-shadow"],
    status: "working",
  },
  {
    name: "ScrollToTop",
    storyIds: ["apple-ui-scrolltotop--default"],
    selectors: ["button"],
    themeProps: ["background-color", "color", "border-color"],
    status: "selector-issue",
  },
  {
    name: "AppleSearchField",
    storyIds: ["apple-ui-applesearchfield--default"],
    selectors: ["input"],
    themeProps: ["background-color", "color", "border-color"],
    status: "not-rendering",
  },
  {
    name: "AppleListItem",
    storyIds: ["apple-ui-applelistitem--default"],
    selectors: ['[class*="listItem"]', "li"],
    themeProps: ["background-color", "color", "border-color"],
    status: "error-state",
  },
  {
    name: "AppleDrawer",
    storyIds: ["apple-ui-appledrawer--default"],
    selectors: ['[class*="drawer"]', '[class*="Drawer"]'],
    themeProps: ["background-color", "color", "border-color"],
    status: "not-rendering",
  },
  {
    name: "AppleSheet",
    storyIds: ["apple-ui-applesheet--default"],
    selectors: ['[class*="sheet"]', '[class*="Sheet"]'],
    themeProps: ["background-color", "color", "border-color"],
    status: "not-rendering",
  },
  {
    name: "AppleTag",
    storyIds: ["apple-ui-appletag--new"],
    selectors: ['[class*="tag"]', '[class*="Tag"]'],
    themeProps: ["background-color", "color", "border-color"],
    status: "not-rendering",
  },
];

const PORTS = [6006];
const argv = process.argv.slice(2);
const headless = argv.includes("--headless");
const waitMs =
  Number((argv.find(a => a.startsWith("--wait-ms=")) || "").split("=")[1]) ||
  1000;

const sampleThemeStyles = async (page, selectors, themeProps) => {
  return await page.evaluate(
    ({ sels, props }) => {
      const results = {};

      for (const selector of sels) {
        const elements = Array.from(document.querySelectorAll(selector));
        if (elements.length === 0) continue;

        // For buttons, find the one with actual content
        let targetElement = elements[0];
        if (selector === "button" && elements.length > 1) {
          targetElement =
            elements.find(
              el =>
                el.textContent.includes("Primary") ||
                el.textContent.includes("Button") ||
                el.className.includes("button")
            ) || elements[0];
        }

        const computed = window.getComputedStyle(targetElement);
        const styles = {};

        for (const prop of props) {
          styles[prop] = computed.getPropertyValue(prop);
        }

        results[selector] = {
          styles,
          elementInfo: {
            tagName: targetElement.tagName,
            className: targetElement.className,
            textContent: targetElement.textContent?.substring(0, 30),
            id: targetElement.id,
          },
        };
        break; // Only take the first matching selector that finds elements
      }

      return results;
    },
    { sels: selectors, props: themeProps }
  );
};

const verifyComponent = async (browser, component) => {
  const results = {
    name: component.name,
    status: component.status,
    stories: [],
  };

  for (const storyId of component.storyIds) {
    console.log(`Testing ${component.name} - ${storyId} (${component.status})`);

    let context, page;
    try {
      context = await browser.newContext();
      page = await context.newPage();

      // Test light theme (default)
      await page.goto(
        `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`,
        {
          waitUntil: "networkidle",
          timeout: 30000,
        }
      );

      await page.waitForTimeout(2000); // Let component render
      const lightStyles = await sampleThemeStyles(
        page,
        component.selectors,
        component.themeProps
      );

      // Test dark theme by navigating with different globals
      await page.goto(
        `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story&globals=theme:dark`,
        {
          waitUntil: "networkidle",
          timeout: 30000,
        }
      );

      await page.waitForTimeout(2000); // Let component render with dark theme
      const darkStyles = await sampleThemeStyles(
        page,
        component.selectors,
        component.themeProps
      );

      // Check for common issues
      const lightKeys = Object.keys(lightStyles);
      const darkKeys = Object.keys(darkStyles);
      const hasContent = lightKeys.length > 0;
      const hasChanges =
        JSON.stringify(lightStyles) !== JSON.stringify(darkStyles);

      let issue = null;
      if (!hasContent) {
        issue = "Component not rendering in iframe";
      } else if (!hasChanges) {
        issue =
          "No theme differences detected - CSS may need theme-specific rules";
      }

      const passed = hasChanges && hasContent;

      results.stories.push({
        storyId,
        lightStyles,
        darkStyles,
        hasChanges,
        hasContent,
        passed,
        issue,
      });

      console.log(`  ${storyId}: ${passed ? "PASS" : "FAIL"}`);
      if (issue) {
        console.log(`    Issue: ${issue}`);
      }
    } catch (err) {
      console.log(`  Story failed: ${err.message}`);
      results.stories.push({
        storyId,
        error: err.message,
        passed: false,
        issue: "Runtime error during testing",
      });
    } finally {
      if (context) await context.close();
    }
  }

  return results;
};

const run = async () => {
  console.log("🔍 Phase 0 Apple UI Components - Final Theme Verification");
  console.log("=".repeat(60));
  console.log(`Mode: ${headless ? "Headless" : "Visible"}, Wait: ${waitMs}ms`);
  console.log("");

  const browser = await chromium.launch({ headless });
  const allResults = [];

  try {
    for (const component of COMPONENTS) {
      const result = await verifyComponent(browser, component);
      allResults.push(result);

      const passed = result.stories.filter(s => s.passed).length;
      const total = result.stories.length;
      console.log(
        `${component.name}: ${passed}/${total} passed [${component.status}]`
      );
      console.log("");
    }

    // Generate comprehensive summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalComponents: allResults.length,
      workingComponents: allResults.filter(r => r.status === "working").length,
      brokenComponents: allResults.filter(r => r.status !== "working").length,
      results: allResults.map(r => ({
        name: r.name,
        status: r.status,
        passed: r.stories.filter(s => s.passed).length,
        total: r.stories.length,
        stories: r.stories.map(s => ({
          storyId: s.storyId,
          passed: s.passed,
          hasChanges: s.hasChanges,
          hasContent: s.hasContent,
          issue: s.issue || s.error,
        })),
      })),
    };

    const totalPassed = summary.results.reduce((acc, r) => acc + r.passed, 0);
    const totalStories = summary.results.reduce((acc, r) => acc + r.total, 0);

    console.log("📊 FINAL SUMMARY");
    console.log("=".repeat(60));
    console.log(
      `Total: ${totalPassed}/${totalStories} components passed theme verification`
    );
    console.log(
      `Working: ${summary.workingComponents}/${summary.totalComponents}`
    );
    console.log(
      `Issues: ${summary.brokenComponents}/${summary.totalComponents}`
    );
    console.log("");

    // Categorize issues
    const issues = {
      working: summary.results.filter(r => r.status === "working"),
      needsCssFix: summary.results.filter(r => r.status === "needs-css-fix"),
      broken: summary.results.filter(r =>
        ["broken", "not-rendering", "error-state"].includes(r.status)
      ),
      selectorIssue: summary.results.filter(r => r.status === "selector-issue"),
    };

    console.log("🔧 COMPONENT STATUS BREAKDOWN:");
    console.log(
      "✅ Working Components:",
      issues.working.map(r => r.name).join(", ")
    );
    console.log(
      "🎨 Needs CSS Theme Fixes:",
      issues.needsCssFix.map(r => r.name).join(", ")
    );
    console.log(
      "🔨 Broken/Not Rendering:",
      issues.broken.map(r => r.name).join(", ")
    );
    console.log(
      "🔍 Selector Issues:",
      issues.selectorIssue.map(r => r.name).join(", ")
    );
    console.log("");

    // Save detailed results
    fs.mkdirSync("test-results/phase0-verification", { recursive: true });
    fs.writeFileSync(
      "test-results/phase0-verification/final-theme-verification.json",
      JSON.stringify(summary, null, 2)
    );

    console.log(
      "📄 Detailed results saved to: test-results/phase0-verification/final-theme-verification.json"
    );

    // Provide actionable next steps
    console.log("");
    console.log("🎯 NEXT STEPS TO ACHIEVE 11/11 PASS RATE:");
    console.log("1. Add theme-specific CSS rules for AppleBadge");
    console.log(
      "2. Fix AppleModal, AppleSearchField, AppleDrawer, AppleSheet, AppleTag rendering"
    );
    console.log("3. Fix AppleListItem error state");
    console.log("4. Improve ScrollToTop element selector");
    console.log("");
  } finally {
    await browser.close();
  }
};

run().catch(console.error);
