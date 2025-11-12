import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );
  await page.waitForTimeout(800);

  const colorTargets = ["rgb(0, 122, 255)", "rgb(10, 132, 255)"];
  const info = await page.evaluate(targets => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const matches = buttons
      .map(btn => ({
        text: btn.textContent,
        classList: Array.from(btn.classList),
        bg: window.getComputedStyle(btn).backgroundColor,
        outerHTML: btn.outerHTML.slice(0, 200),
      }))
      .filter(b => targets.includes(b.bg));
    return { matches };
  }, colorTargets);

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
