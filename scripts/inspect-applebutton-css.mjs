import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );
  await page.waitForTimeout(800);

  const info = await page.evaluate(() => {
    const btn = document.querySelector("button");
    const cs = window.getComputedStyle(btn);
    const color = cs.backgroundColor;

    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (!rule.selectorText) continue;
          if (
            rule.selectorText.includes(".primary") ||
            rule.selectorText.includes('[data-theme="dark"]') ||
            rule.selectorText.includes('[data-theme="light"]')
          ) {
            rules.push({
              href: sheet.href || "inline",
              selectorText: rule.selectorText,
              cssText: rule.cssText,
            });
          }
        }
      } catch (e) {
        // cross-origin sheet or other.
      }
    }

    return {
      theme: document.documentElement.getAttribute("data-theme"),
      backgroundColor: color,
      rules,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
