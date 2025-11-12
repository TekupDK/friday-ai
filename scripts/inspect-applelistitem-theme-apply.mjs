import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applelistitem--default"
  );
  await page.waitForTimeout(800);

  // find list item element
  const elInfo = await page.evaluate(() => {
    const el = document.querySelector(
      '[class*="listItem"], [class*="listitem"], .listItem, .listitem'
    );
    if (!el) return { found: false };
    const cs = window.getComputedStyle(el);
    return {
      found: true,
      tag: el.tagName,
      classList: Array.from(el.classList),
      background: cs.backgroundColor,
      color: cs.color,
    };
  });

  console.log("initial", elInfo);

  // set theme to dark on wrapper
  await page.evaluate(() => {
    const wrapper = document.querySelector("[data-theme]");
    if (wrapper) wrapper.setAttribute("data-theme", "dark");
    else document.documentElement.setAttribute("data-theme", "dark");
  });
  await page.waitForTimeout(200);

  const afterDark = await page.evaluate(() => {
    const el = document.querySelector(
      '[class*="listItem"], [class*="listitem"], .listItem, .listitem'
    );
    if (!el) return { found: false };
    const cs = window.getComputedStyle(el);
    const dt =
      document.querySelector("[data-theme]") || document.documentElement;
    return {
      found: true,
      tag: el.tagName,
      classList: Array.from(el.classList),
      background: cs.backgroundColor,
      color: cs.color,
      theme: dt.getAttribute("data-theme"),
    };
  });

  console.log("after dark", afterDark);

  // set theme to light
  await page.evaluate(() => {
    const wrapper = document.querySelector("[data-theme]");
    if (wrapper) wrapper.setAttribute("data-theme", "light");
    else document.documentElement.setAttribute("data-theme", "light");
  });
  await page.waitForTimeout(200);

  const afterLight = await page.evaluate(() => {
    const el = document.querySelector(
      '[class*="listItem"], [class*="listitem"], .listItem, .listitem'
    );
    if (!el) return { found: false };
    const cs = window.getComputedStyle(el);
    const dt =
      document.querySelector("[data-theme]") || document.documentElement;
    return {
      found: true,
      tag: el.tagName,
      classList: Array.from(el.classList),
      background: cs.backgroundColor,
      color: cs.color,
      theme: dt.getAttribute("data-theme"),
    };
  });

  console.log("after light", afterLight);

  await browser.close();
})();
