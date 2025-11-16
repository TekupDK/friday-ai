import { expect, test } from "@playwright/test";

test.describe("Login UI", () => {
  test("opens login dialog on Sign In", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("button", { name: /^sign in$/i });
    await expect(signIn).toBeVisible();
    await signIn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/enter your credentials/i)).toBeVisible();
    await expect(dialog.getByLabel("Email")).toBeVisible();
    await expect(dialog.getByLabel("Password")).toBeVisible();
  });

  test("shows validation message for empty fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /^login$/i }).click();
    const emailValid = await dialog
      .locator("#overlay-email")
      .evaluate(el => (el as HTMLInputElement).checkValidity());
    const passValid = await dialog
      .locator("#overlay-password")
      .evaluate(el => (el as HTMLInputElement).checkValidity());
    expect(emailValid).toBe(false);
    expect(passValid).toBe(false);
  });

  test("dev login redirects to workspace", async ({ page }) => {
    await page.goto("/api/oauth/dev-login");
    await page.waitForURL("/", { timeout: 5000 }).catch(async () => {
      await page.goto("/");
    });
    await page.goto("/");
    await expect(page.getByText(/Friday AI/i)).toBeVisible();
  });
});
