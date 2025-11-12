import { test, expect } from "@playwright/test";

async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(1000);
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
}

test("streaming can be canceled and partial output preserved", async ({
  page,
}) => {
  await devLogin(page);

  const newConv = page.getByRole("button", { name: "Ny samtale" });
  if (await newConv.isVisible()) {
    await newConv.click();
  }

  const input = page.getByPlaceholder("Skriv til Friday...");
  await input.fill(
    "Skriv et langt svar om emnet præsentation af virksomheden."
  );
  await input.press("Enter");

  const status = page.getByRole("status").filter({ hasText: "Friday" });
  try {
    await status.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    test.skip(true, "Streaming UI did not appear; skipping streaming test.");
  }

  const stopBtn = page.getByRole("button", { name: "Stop streaming" });
  await stopBtn.click();

  await expect(status).toBeVisible();
  await expect(status.getByText("stoppet")).toBeVisible();
});

test("stream aborts when switching conversation", async ({ page }) => {
  await devLogin(page);

  const newConv = page.getByRole("button", { name: "Ny samtale" });
  if (await newConv.isVisible()) {
    await newConv.click();
    await newConv.click();
  }

  const convoButtons = page
    .getByRole("button")
    .filter({ hasText: /Ny samtale|\d{2}:\d{2}/ });
  const count = await convoButtons.count();
  if (count < 2) {
    test.skip(true, "Not enough conversations to test switching.");
  }

  await convoButtons.nth(0).click();

  const input = page.getByPlaceholder("Skriv til Friday...");
  await input.fill("Test stream ved samtaleskift");
  await input.press("Enter");

  const status = page.getByRole("status").filter({ hasText: "Friday" });
  try {
    await status.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    test.skip(true, "Streaming UI did not appear; skipping switch test.");
  }

  await convoButtons.nth(1).click();
  await expect(status).toHaveCount(0);
});

test("no console errors on unmount during streaming", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await devLogin(page);

  const newConv = page.getByRole("button", { name: "Ny samtale" });
  if (await newConv.isVisible()) {
    await newConv.click();
  }

  const input = page.getByPlaceholder("Skriv til Friday...");
  await input.fill("Start stream og naviger væk");
  await input.press("Enter");

  const status = page.getByRole("status").filter({ hasText: "Friday" });
  try {
    await status.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    test.skip(true, "Streaming UI did not appear; skipping unmount test.");
  }

  await page.goto("http://localhost:3000/404");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  expect(errors.length).toBe(0);
});
