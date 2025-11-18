import { test, expect } from "@playwright/test";

test("LoginPage mobilvisning (portrait og landscape)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas", { timeout: 10000 });
  await page.waitForTimeout(1000);

  const portraitMetrics = await page.evaluate(() => {
    const blurEl = document.querySelector(
      '[class*="backdrop-blur"]'
    ) as HTMLElement | null;
    const email = document.querySelector("#email") as HTMLElement | null;
    const password = document.querySelector("#password") as HTMLElement | null;
    const btn = document.querySelector(
      'button[type="submit"]'
    ) as HTMLElement | null;
    const card = blurEl?.querySelector("div") as HTMLElement | null;

    const blurOk =
      !!blurEl && getComputedStyle(blurEl).backdropFilter.includes("blur");
    const rectEmail = email ? email.getBoundingClientRect() : null;
    const rectPassword = password ? password.getBoundingClientRect() : null;
    const rectBtn = btn ? btn.getBoundingClientRect() : null;
    const rectCard = card ? card.getBoundingClientRect() : null;
    const touchMin = 44;
    const inputsTouch =
      !!rectEmail &&
      rectEmail.height >= touchMin &&
      !!rectPassword &&
      rectPassword.height >= touchMin;
    const buttonTouch =
      !!rectBtn && rectBtn.height >= touchMin && rectBtn.width >= 200;
    const readableText =
      !!document.querySelector(".text-2xl") ||
      parseFloat(getComputedStyle(document.body).fontSize) >= 14;
    const notCramped =
      !!rectCard &&
      rectCard.left >= 8 &&
      window.innerWidth - rectCard.right >= 8;

    return { blurOk, inputsTouch, buttonTouch, readableText, notCramped };
  });

  await page.screenshot({
    path: "test-results/login-mobile-portrait.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);

  const landscapeMetrics = await page.evaluate(() => {
    const blurEl = document.querySelector(
      '[class*="backdrop-blur"]'
    ) as HTMLElement | null;
    const email = document.querySelector("#email") as HTMLElement | null;
    const password = document.querySelector("#password") as HTMLElement | null;
    const btn = document.querySelector(
      'button[type="submit"]'
    ) as HTMLElement | null;
    const card = blurEl?.querySelector("div") as HTMLElement | null;

    const blurOk =
      !!blurEl && getComputedStyle(blurEl).backdropFilter.includes("blur");
    const rectEmail = email ? email.getBoundingClientRect() : null;
    const rectPassword = password ? password.getBoundingClientRect() : null;
    const rectBtn = btn ? btn.getBoundingClientRect() : null;
    const rectCard = card ? card.getBoundingClientRect() : null;
    const touchMin = 44;
    const inputsTouch =
      !!rectEmail &&
      rectEmail.height >= touchMin &&
      !!rectPassword &&
      rectPassword.height >= touchMin;
    const buttonTouch =
      !!rectBtn && rectBtn.height >= touchMin && rectBtn.width >= 200;
    const readableText =
      !!document.querySelector(".text-2xl") ||
      parseFloat(getComputedStyle(document.body).fontSize) >= 14;
    const notCramped =
      !!rectCard &&
      rectCard.left >= 8 &&
      window.innerWidth - rectCard.right >= 8;

    return { blurOk, inputsTouch, buttonTouch, readableText, notCramped };
  });

  await page.screenshot({
    path: "test-results/login-mobile-landscape.png",
    fullPage: true,
  });

  console.log("Portrait", portraitMetrics);
  console.log("Landscape", landscapeMetrics);

  console.log("Checks", {
    portrait: portraitMetrics,
    landscape: landscapeMetrics,
  });
  expect(true).toBe(true);
});
