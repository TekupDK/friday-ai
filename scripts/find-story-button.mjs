import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "http://localhost:6006/iframe.html?id=apple-ui-applebutton--primary"
  );

  // Wait up to 5 seconds for a button with a primary-like class to appear
  try {
    await page.waitForSelector(
      'button[class*="primary"], [data-test-id="storybook-preview"] button',
      { timeout: 5000 }
    );
  } catch (e) {
    // fallback: wait a bit more
    await page.waitForTimeout(2000);
  }

  const info = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button")); // get all buttons
    // find button descendant inside a story preview (sb-preview or sb-show-main)
    const preview = document.querySelector(
      ".sb-show-main, .sb-preview__story, #root"
    );
    const btn = preview
      ? preview.querySelector("button") || buttons[0]
      : buttons[0];
    if (!btn) return { found: false };
    return {
      found: true,
      tag: btn.tagName,
      text: btn.textContent,
      classList: Array.from(btn.classList),
      outerHTML: btn.outerHTML.slice(0, 500),
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
