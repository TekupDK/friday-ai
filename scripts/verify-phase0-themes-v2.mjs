import { chromium } from "playwright";
import fs from "node:fs";

const COMPONENTS = [
  {
    name: "AppleButton",
    storyIds: ["apple-ui-applebutton--primary"],
    selectors: ["button"], // Use generic button selector and find the right one
    themeProps: ["background-color", "color", "border-color", "box-shadow"],
  },
  {
    name: "AppleInput",
    storyIds: ["apple-ui-appleinput--default"],
    selectors: ["input"],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleModal",
    storyIds: ["apple-ui-applemodal--default"],
    selectors: ['[class*="modal"]', '[class*="Modal"]'],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleBadge",
    storyIds: ["apple-ui-applebadge--new"],
    selectors: ['[class*="badge"]', '[class*="Badge"]'],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleCard",
    storyIds: ["apple-ui-applecard--elevated"],
    selectors: ['[class*="card"]', '[class*="Card"]'],
    themeProps: ["background-color", "color", "border-color", "box-shadow"],
  },
  {
    name: "ScrollToTop",
    storyIds: ["apple-ui-scrolltotop--default"],
    selectors: ["button"],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleSearchField",
    storyIds: ["apple-ui-applesearchfield--default"],
    selectors: ["input"],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleListItem",
    storyIds: ["apple-ui-applelistitem--default"],
    selectors: ['[class*="listItem"]', "li"],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleDrawer",
    storyIds: ["apple-ui-appledrawer--default"],
    selectors: ['[class*="drawer"]', '[class*="Drawer"]'],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleSheet",
    storyIds: ["apple-ui-applesheet--default"],
    selectors: ['[class*="sheet"]', '[class*="Sheet"]'],
    themeProps: ["background-color", "color", "border-color"],
  },
  {
    name: "AppleTag",
    storyIds: ["apple-ui-appletag--new"],
    selectors: ['[class*="tag"]', '[class*="Tag"]'],
    themeProps: ["background-color", "color", "border-color"],
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

        // For AppleButton, find the button with the right text content
        let targetElement = elements[0];
        if (selector === "button" && elements.length > 1) {
          targetElement =
            elements.find(el => el.textContent.includes("Primary")) ||
            elements[0];
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
            textContent: targetElement.textContent?.substring(0, 50),
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

const setTheme = async (page, theme) => {
  await page.evaluate(t => {
    document.documentElement.setAttribute("data-theme", t);
    const root = document.querySelector("#storybook-root");
    if (root) root.setAttribute("data-theme", t);
  }, theme);
};

const verifyComponent = async (browser, component) => {
  const results = {
    name: component.name,
    stories: [],
  };

  for (const storyId of component.storyIds) {
    console.log(`Testing ${component.name} - ${storyId}`);

    let context, page;
    try {
      context = await browser.newContext();
      page = await context.newPage();

      await page.goto(
        `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`,
        {
          waitUntil: "networkidle",
          timeout: 30000,
        }
      );

      await page.waitForTimeout(2000); // Let component render

      // Test light theme
      await setTheme(page, "light");
      await page.waitForTimeout(waitMs);
      const lightStyles = await sampleThemeStyles(
        page,
        component.selectors,
        component.themeProps
      );

      // Test dark theme
      await setTheme(page, "dark");
      await page.waitForTimeout(waitMs);
      const darkStyles = await sampleThemeStyles(
        page,
        component.selectors,
        component.themeProps
      );

      // Compare styles
      const hasChanges =
        JSON.stringify(lightStyles) !== JSON.stringify(darkStyles);

      results.stories.push({
        storyId,
        lightStyles,
        darkStyles,
        hasChanges,
        passed: hasChanges && Object.keys(lightStyles).length > 0,
      });

      console.log(`  ${storyId}: ${hasChanges ? "PASS" : "FAIL"}`);
      if (!hasChanges) {
        console.log("    Light styles:", JSON.stringify(lightStyles, null, 2));
        console.log("    Dark styles:", JSON.stringify(darkStyles, null, 2));
      }
    } catch (err) {
      console.log(`  Story failed: ${err.message}`);
      results.stories.push({
        storyId,
        error: err.message,
        passed: false,
      });
    } finally {
      if (context) await context.close();
    }
  }

  return results;
};

const run = async () => {
  console.log("Starting Phase 0 Theme Verification...");
  console.log(`Headless: ${headless}, Wait: ${waitMs}ms`);

  const browser = await chromium.launch({ headless });
  const allResults = [];

  try {
    for (const component of COMPONENTS) {
      const result = await verifyComponent(browser, component);
      allResults.push(result);

      const passed = result.stories.filter(s => s.passed).length;
      const total = result.stories.length;
      console.log(`${component.name}: ${passed}/${total} passed`);
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalComponents: allResults.length,
      results: allResults.map(r => ({
        name: r.name,
        passed: r.stories.filter(s => s.passed).length,
        total: r.stories.length,
        stories: r.stories.map(s => ({
          storyId: s.storyId,
          passed: s.passed,
          hasChanges: s.hasChanges,
          error: s.error,
        })),
      })),
    };

    const totalPassed = summary.results.reduce((acc, r) => acc + r.passed, 0);
    const totalStories = summary.results.reduce((acc, r) => acc + r.total, 0);

    console.log(
      `\nSUMMARY: ${totalPassed}/${totalStories} stories passed theme verification`
    );

    // Save detailed results
    fs.mkdirSync("test-results/phase0-verification", { recursive: true });
    fs.writeFileSync(
      "test-results/phase0-verification/theme-verification.json",
      JSON.stringify(summary, null, 2)
    );
  } finally {
    await browser.close();
  }
};

run().catch(console.error);
