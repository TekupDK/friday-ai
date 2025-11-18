import { chromium } from "playwright";

const testStorybook = async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to Storybook...");
    await page.goto(
      "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary&viewMode=story"
    );

    console.log("Waiting for content...");
    await page.waitForTimeout(3000);

    // Check what's visible
    const content = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root");
      const body = document.body;
      return {
        root: root
          ? {
              innerHTML: root.innerHTML,
              style: root.getAttribute("style"),
              display: window.getComputedStyle(root).display,
              visibility: window.getComputedStyle(root).visibility,
            }
          : null,
        body: {
          innerHTML: body.innerHTML.substring(0, 500),
          hasStorybookRoot: !!root,
        },
      };
    });

    console.log("Content:", JSON.stringify(content, null, 2));

    // Try to find button elements
    const buttonInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.map(btn => ({
        text: btn.textContent,
        className: btn.className,
        style: {
          backgroundColor: window.getComputedStyle(btn).backgroundColor,
          color: window.getComputedStyle(btn).color,
        },
      }));
    });

    console.log("Buttons found:", buttonInfo);

    // Test theme switching
    console.log("Testing theme switching...");

    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document
        .querySelector("#storybook-root")
        ?.setAttribute("data-theme", "light");
    });

    await page.waitForTimeout(1000);

    const lightStyles = await page.evaluate(() => {
      const btn = document.querySelector("button");
      if (!btn) return null;
      return {
        backgroundColor: window.getComputedStyle(btn).backgroundColor,
        color: window.getComputedStyle(btn).color,
        borderColor: window.getComputedStyle(btn).borderColor,
        boxShadow: window.getComputedStyle(btn).boxShadow,
      };
    });

    console.log("Light theme styles:", lightStyles);

    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      document
        .querySelector("#storybook-root")
        ?.setAttribute("data-theme", "dark");
    });

    await page.waitForTimeout(1000);

    const darkStyles = await page.evaluate(() => {
      const btn = document.querySelector("button");
      if (!btn) return null;
      return {
        backgroundColor: window.getComputedStyle(btn).backgroundColor,
        color: window.getComputedStyle(btn).color,
        borderColor: window.getComputedStyle(btn).borderColor,
        boxShadow: window.getComputedStyle(btn).boxShadow,
      };
    });

    console.log("Dark theme styles:", darkStyles);
    console.log(
      "Theme switching works:",
      JSON.stringify(lightStyles) !== JSON.stringify(darkStyles)
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await context.close();
    await browser.close();
  }
};

testStorybook();
