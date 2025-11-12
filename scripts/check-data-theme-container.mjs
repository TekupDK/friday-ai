import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const dt = document.querySelector("[data-theme]");
    const btn = document.querySelector('button[class*="primary"]');
    return {
      dtExists: !!dt,
      dtTag: dt ? dt.tagName : null,
      dtTheme: dt ? dt.getAttribute("data-theme") : null,
      dtContainsBtn: dt ? dt.contains(btn) : null,
      btnOuterHTML: btn ? btn.outerHTML.slice(0, 200) : null,
    };
  });

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
