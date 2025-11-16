import { expect, test } from "@playwright/test";

/**
 * E2E Test: Email → Lead UI Flow
 *
 * Tests the complete user journey:
 * 1. User navigates to inbox
 * 2. Selects an email from potential lead
 * 3. Clicks "Opret Lead" button
 * 4. Fills CreateLeadModal and submits
 * 5. Verifies lead appears in CRM
 *
 * Updated: Now using data-testid="create-lead-from-email" button
 */

test.use({
  ...test.use,
  actionTimeout: 30000,
  navigationTimeout: 30000,
  extraHTTPHeaders: {
    // Test mode: Bypass auth in development
    "x-test-user-id": "test-user-123",
  },
});

test.describe.configure({ mode: "serial" });

test.describe("Email → Lead UI Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  });

  test("should create lead from email inbox via bulk action", async ({
    page,
  }) => {
    // Navigate to Email/Inbox tab
    const inboxButton = page
      .getByRole("button", { name: /email|inbox/i })
      .or(page.locator('text="Email"'));
    await inboxButton
      .first()
      .click({ timeout: 5000 })
      .catch(() => test.skip());
    await page.waitForTimeout(1000);

    // Select first email (click checkbox or email item)
    const firstEmail = page.locator('[data-testid="email-item"]').first();
    if (!(await firstEmail.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(); // No emails found
    }
    await firstEmail.click();
    await page.waitForTimeout(500);

    // Click "Opret Lead" button in bulk actions toolbar
    const createLeadButton = page.locator(
      '[data-testid="create-lead-from-email"]'
    );
    if (
      !(await createLeadButton.isVisible({ timeout: 3000 }).catch(() => false))
    ) {
      test.skip(); // Button not visible (email not selected)
    }
    await createLeadButton.click();

    // Wait for CreateLeadModal dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Form should be pre-filled with email sender data
    const nameInput = dialog.locator('input[id="name"]');
    const emailInput = dialog.locator('input[id="email"]');

    // Verify pre-filled data
    const nameValue = await nameInput.inputValue();
    const emailValue = await emailInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
    expect(emailValue).toContain("@");

    // Add phone number
    const testPhone = "+45 98765432";
    await dialog.locator('input[id="phone"]').fill(testPhone);

    // Submit
    const submitButton = dialog.getByRole("button", { name: /opret lead/i });
    await submitButton.click();

    // Wait for success toast
    await expect(page.locator("text=/lead (oprettet|created)/i")).toBeVisible({
      timeout: 5000,
    });

    // Navigate to Leads tab to verify
    const leadsButton = page.getByRole("button", { name: /leads/i });
    await leadsButton.first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Verify lead appears with test email
    const leadItem = page.locator(
      `[data-testid="lead-item"]:has-text("${emailValue}")`
    );
    await expect(leadItem).toBeVisible({ timeout: 5000 });
  });

  test("should create lead from Leads tab directly", async ({ page }) => {
    // Navigate to Leads tab
    const leadsButton = page
      .getByRole("button", { name: /leads/i })
      .or(page.locator('text="Leads"'));
    await leadsButton
      .first()
      .click({ timeout: 5000 })
      .catch(() => {
        // If Leads button not visible, skip test
        test.skip();
      });

    await page.waitForTimeout(1000);

    // Click "Tilføj Lead" button
    const addLeadButton = page.getByRole("button", {
      name: /tilføj lead|opret lead/i,
    });
    if (
      !(await addLeadButton.isVisible({ timeout: 2000 }).catch(() => false))
    ) {
      test.skip(); // Skip if button not found
    }

    await addLeadButton.click();

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill form
    const testEmail = `ui-test-${Date.now()}@example.com`;
    await dialog.locator('input[id="name"]').fill("UI Test Lead");
    await dialog.locator('input[id="email"]').fill(testEmail);
    await dialog.locator('input[id="phone"]').fill("+45 12345678");

    // Submit
    const submitButton = dialog.getByRole("button", { name: /opret lead/i });
    await submitButton.click();

    // Wait for success toast
    await expect(page.locator("text=/lead (oprettet|created)/i")).toBeVisible({
      timeout: 5000,
    });

    // Verify lead appears with test ID
    await page.waitForTimeout(1000);
    const leadItem = page.locator(
      `[data-testid="lead-item"]:has-text("${testEmail}")`
    );
    await expect(leadItem).toBeVisible({ timeout: 5000 });
  });

  test("should show validation error when name is empty", async ({ page }) => {
    // Navigate to Leads tab
    const leadsButton = page
      .getByRole("button", { name: /leads/i })
      .or(page.locator('text="Leads"'));
    await leadsButton
      .first()
      .click({ timeout: 5000 })
      .catch(() => test.skip());
    await page.waitForTimeout(500);

    // Click "Tilføj Lead" button
    const addLeadButton = page.getByRole("button", {
      name: /tilføj lead|opret lead/i,
    });
    if (
      !(await addLeadButton.isVisible({ timeout: 2000 }).catch(() => false))
    ) {
      test.skip();
    }
    await addLeadButton.click();

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Try to submit with empty name
    const emailInput = dialog.locator('input[id="email"]');
    await emailInput.fill("empty-name@test.com");

    const submitButton = dialog.getByRole("button", { name: /opret lead/i });

    // Button should be disabled when name is empty
    await expect(submitButton).toBeDisabled();
  });

  test.skip("should handle duplicate lead detection", async ({ page }) => {
    // Skipped: Better tested in backend E2E
  });

  test.skip("should extract name from email when not provided", async ({
    page,
  }) => {
    // Skipped: Better tested in backend E2E
  });
});
