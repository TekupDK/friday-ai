import { chromium } from "playwright";

(async () => {
  const story = process.argv[2] || "crm-apple-ui-applebutton--primary";
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://localhost:6006/iframe.html?id=${story}`);
  await page.waitForTimeout(800);

  const root = await page.evaluate(
    () =>
      document.querySelector("#storybook-root") ||
      document.getElementById("root") ||
      document.body
  );
  const samples = await page.evaluate(() => {
    const root =
      document.querySelector("#storybook-root") ||
      document.getElementById("root") ||
      document.body;
    const children = root.children.length
      ? Array.from(root.children)
      : Array.from(root.querySelectorAll("*"));
    return children.slice(0, 20).map(el => ({
      tag: el.tagName,
      classList: Array.from(el.classList),
      rect: el.getBoundingClientRect ? el.getBoundingClientRect() : null,
      background: getComputedStyle(el).backgroundColor,
      color: getComputedStyle(el).color,
    }));
  });
  console.log(JSON.stringify(samples, null, 2));
  await browser.close();
})();
