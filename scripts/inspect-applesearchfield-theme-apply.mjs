import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applesearchfield--default"
  );
  await page.waitForSelector('[class*="searchWrapper"]', { timeout: 5000 });

  const initial = await page.evaluate(() => {
    const el = document.querySelector('[class*="searchWrapper"]');
    return {
      background: getComputedStyle(el).backgroundColor,
      classList: Array.from(el.classList),
    };
  });
  console.log("initial:", initial);

  await page.evaluate(() => {
    const container = document.querySelector("[data-theme]");
    if (container) container.setAttribute("data-theme", "dark");
    else document.documentElement.setAttribute("data-theme", "dark");
  });
  await page.waitForTimeout(200);
  const dark = await page.evaluate(() => {
    const el = document.querySelector('[class*="searchWrapper"]');
    return {
      background: getComputedStyle(el).backgroundColor,
      classList: Array.from(el.classList),
    };
  });
  console.log("after dark:", dark);

  await page.evaluate(() => {
    const container = document.querySelector("[data-theme]");
    if (container) container.setAttribute("data-theme", "light");
    else document.documentElement.setAttribute("data-theme", "light");
  });
  await page.waitForTimeout(200);
  const light = await page.evaluate(() => {
    const el = document.querySelector('[class*="searchWrapper"]');
    return {
      background: getComputedStyle(el).backgroundColor,
      classList: Array.from(el.classList),
    };
  });
  console.log("after light:", light);

  await browser.close();
})();
