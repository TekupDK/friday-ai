import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );
  await page.waitForTimeout(500);

  // specifically wait for the story button that includes 'primary' in its class name
  await page.waitForSelector('button[class*="primary"]', { timeout: 5000 });
  const info = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    const cs = window.getComputedStyle(btn);
    const color = cs.backgroundColor;
    const classes = Array.from(btn.classList);
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (!rule.selectorText) continue;
          for (const cls of classes) {
            if (rule.selectorText.includes("." + cls)) {
              rules.push({
                href: sheet.href || "inline",
                selectorText: rule.selectorText,
                cssText: rule.cssText,
              });
              break;
            }
          }
        }
      } catch (e) {
        // cross-origin stylesheet; ignore
      }
    }
    const primaryClass = classes.find(c => c.includes("primary")) || classes[0];
    const matchingBase = rules
      .filter(r => !r.selectorText.includes("[data-theme"))
      .find(r => r.selectorText.includes("." + primaryClass));
    const matchingDark = rules.find(
      r =>
        r.selectorText.includes('[data-theme="dark"]') &&
        r.selectorText.includes("." + primaryClass)
    );
    const matchingLight = rules.find(
      r =>
        r.selectorText.includes('[data-theme="light"]') &&
        r.selectorText.includes("." + primaryClass)
    );
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      backgroundColor: color,
      classList: classes,
      rulesCount: rules.length,
      matchingBase,
      matchingDark,
      matchingLight,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
