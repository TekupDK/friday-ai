import { chromium } from "playwright";

(async () => {
  const url = process.argv[2];
  const targetColor = process.argv[3];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForTimeout(1000);

  const matches = await page.evaluate(color => {
    const nodes = Array.from(document.querySelectorAll("*"));
    const found = nodes
      .map(n => ({
        tag: n.tagName,
        classList: Array.from(n.classList),
        bg: getComputedStyle(n).backgroundColor,
        outer: n.outerHTML ? n.outerHTML.slice(0, 200) : "",
      }))
      .filter(n => n.bg === color);
    return found.slice(0, 10);
  }, targetColor);

  console.log(JSON.stringify(matches, null, 2));
  await browser.close();
})();
