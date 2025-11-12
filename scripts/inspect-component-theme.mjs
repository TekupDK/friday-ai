import { chromium } from "playwright";

async function inspect(story, classSubstring) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = `http://localhost:6006/iframe.html?id=${story}`;
  await page.goto(url);
  await page.waitForTimeout(800);

  // If there's an 'Open' button, click it to reveal modals/drawers
  await page.evaluate(() => {
    const root =
      document.querySelector("#storybook-root") ||
      document.getElementById("root") ||
      document.body;
    const openBtn = Array.from(root.querySelectorAll("button")).find(b =>
      /open/i.test(b.textContent || "")
    );
    if (openBtn) openBtn.click();
  });
  await page.waitForTimeout(300);

  const res = await page.evaluate(clsSub => {
    const root =
      document.getElementById("root") ||
      document.querySelector("#storybook-root") ||
      document.body;
    const el =
      root.querySelector('[class*="' + clsSub + '"]') ||
      root.querySelector('[class*="' + clsSub.toLowerCase() + '"]') ||
      root.querySelector(":scope > *");
    if (!el) return { found: false };
    const bg = getComputedStyle(el).backgroundColor;
    const cs = getComputedStyle(el);
    const classes = Array.from(el.classList);
    // find rules for those classes
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (let r = 0; r < sheet.cssRules.length; r++) {
          const rule = sheet.cssRules[r];
          if (
            rule.selectorText &&
            classes.some(c => rule.selectorText.includes("." + c))
          ) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText,
              index: r,
              href: sheet.href || "inline",
            });
          }
        }
      } catch (e) {}
    }
    return {
      found: true,
      tag: el.tagName,
      classList: classes,
      background: bg,
      color: cs.color,
      rules,
    };
  }, classSubstring);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

const story = process.argv[2] || "apple-ui-appledrawer--default";
const cls = process.argv[3] || "drawer";
inspect(story, cls).catch(err => {
  console.error(err);
  process.exit(1);
});
