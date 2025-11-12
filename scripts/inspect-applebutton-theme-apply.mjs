import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );
  await page.waitForSelector('button[class*="primary"]', { timeout: 5000 });

  const initial = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    return {
      background: getComputedStyle(btn).backgroundColor,
      classList: Array.from(btn.classList),
    };
  });
  console.log("initial:", initial);

  await page.evaluate(() => {
    const container = document.querySelector("[data-theme]");
    if (container) container.setAttribute("data-theme", "dark");
    else document.documentElement.setAttribute("data-theme", "dark");
  });
  await page.waitForTimeout(250);
  const dark = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    return {
      background: getComputedStyle(btn).backgroundColor,
      classList: Array.from(btn.classList),
      theme: document.documentElement.getAttribute("data-theme"),
    };
  });
  console.log("after dark:", dark);

  await page.evaluate(() => {
    const container = document.querySelector("[data-theme]");
    if (container) container.setAttribute("data-theme", "light");
    else document.documentElement.setAttribute("data-theme", "light");
  });
  await page.waitForTimeout(250);
  await page.waitForTimeout(250);
  const light = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    return {
      background: getComputedStyle(btn).backgroundColor,
      classList: Array.from(btn.classList),
      theme: document.documentElement.getAttribute("data-theme"),
    };
  });
  console.log("after light:", light);

  // Now check rule indices for the primary class
  const ruleInfo = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    const primaryClass = Array.from(btn.classList).find(c =>
      c.includes("primary")
    );
    const results = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        for (let r = 0; r < sheet.cssRules.length; r++) {
          const rule = sheet.cssRules[r];
          if (!rule.selectorText) continue;
          if (rule.selectorText.includes("." + primaryClass)) {
            results.push({
              sheetHref: sheet.href || "inline",
              index: r,
              selector: rule.selectorText,
              cssText: rule.cssText,
            });
          }
        }
      } catch (e) {
        // ignore cross-origin
      }
    }
    return results;
  });

  console.log("ruleInfo:", JSON.stringify(ruleInfo, null, 2));

  const matchingDark = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    const primaryClass = Array.from(btn.classList).find(c =>
      c.includes("primary")
    );
    const result = {
      match:
        document.querySelector('[data-theme="dark"] .' + primaryClass) === btn,
      rootTheme: document.documentElement.getAttribute("data-theme"),
    };
    return result;
  });
  console.log("match when dark set:", matchingDark);

  const matchingLightCheck = await page.evaluate(() => {
    const btn = document.querySelector('button[class*="primary"]');
    const primaryClass = Array.from(btn.classList).find(c =>
      c.includes("primary")
    );
    const result = {
      match:
        document.querySelector('[data-theme="light"] .' + primaryClass) === btn,
      rootTheme: document.documentElement.getAttribute("data-theme"),
    };
    return result;
  });
  console.log("match when light set:", matchingLightCheck);

  await browser.close();
})();
