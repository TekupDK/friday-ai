import { chromium } from "playwright";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=crm-apple-ui-applebutton--primary"
  );
  await page.waitForTimeout(1000);
  const btn = await page.evaluate(() => {
    const b =
      document.querySelector('button[class*="primary"]') ||
      document.querySelector("button");
    if (!b) return null;
    const cs = window.getComputedStyle(b);
    return {
      text: b.textContent,
      classList: Array.from(b.classList),
      background: cs.backgroundColor,
      color: cs.color,
    };
  });
  console.log(JSON.stringify(btn, null, 2));
  await browser.close();
})();
