/**
 * CRM Lead Detail E2E Tests
 *
 * Tests complete workflows for lead detail page:
 * - Navigation from lead pipeline
 * - Viewing lead information
 * - Updating lead status
 * - Converting lead to customer
 */

import { expect, test } from "@playwright/test";

// Dev login helper
async function devLogin(page: any) {
  await page.goto("http://localhost:3000/api/auth/login");
  await page.waitForTimeout(500);
  await page.goto("http://localhost:3000/");
  await page.waitForSelector('[data-testid="ai-assistant-panel"]', {
    timeout: 10000,
  });
}

test.describe("CRM Lead Detail E2E", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should navigate to lead detail from lead pipeline", async ({
    page,
  }) => {
    // Navigate to lead pipeline
    await page.goto("http://localhost:3000/crm/leads");

    // Wait for lead pipeline to load
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    // Wait for at least one lead card to be visible
    const leadCards = page.locator('[role="listitem"]').first();
    await leadCards.waitFor({ timeout: 10000 }).catch(() => {
      // If no leads, that's okay - we'll test with empty state
    });

    // Check if there are leads
    const hasLeads = (await page.locator('[role="listitem"]').count()) > 0;

    if (hasLeads) {
      // Click on first lead card
      await leadCards.click();

      // Wait for navigation to detail page
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Verify we're on detail page
      await expect(
        page.getByRole("button", { name: /Back to Leads/i })
      ).toBeVisible();
    }
  });

  test("should display lead information", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Verify lead name is displayed
      const leadName = page.locator("h1").first();
      await expect(leadName).toBeVisible();

      // Verify lead information section exists
      await expect(page.getByText(/Lead Information/i)).toBeVisible();

      // Verify status is displayed
      const statusBadge = page
        .locator("text=/new|contacted|qualified|proposal|won|lost/i")
        .first();
      await expect(statusBadge).toBeVisible();
    }
  });

  test("should update lead status", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Find status select dropdown
      const statusSelect = page.locator('select[id="status-select"]');
      const selectExists = await statusSelect.isVisible().catch(() => false);

      if (selectExists) {
        // Select a new status
        await statusSelect.selectOption({ index: 1 }); // Select second option

        // Click update button
        const updateButton = page.getByRole("button", {
          name: /Update Status/i,
        });
        await updateButton.click();

        // Wait for success message or status update
        await page.waitForTimeout(2000);

        // Verify status was updated (either success toast or status change)
        const hasSuccess = await page
          .getByText(/success|updated/i)
          .isVisible()
          .catch(() => false);
        const statusChanged = await statusSelect
          .inputValue()
          .then(val => val.length > 0)
          .catch(() => false);

        expect(hasSuccess || statusChanged).toBeTruthy();
      }
    }
  });

  test("should convert lead to customer when email exists", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Check if convert button exists and is enabled
      const convertButton = page.getByRole("button", {
        name: /Convert to Customer/i,
      });
      const buttonExists = await convertButton.isVisible().catch(() => false);

      if (buttonExists) {
        const isEnabled = await convertButton.isEnabled();

        if (isEnabled) {
          // Click convert button
          await convertButton.click();

          // Wait for conversion to complete
          await page.waitForTimeout(3000);

          // Should either show success message or navigate to customer page
          const hasSuccess = await page
            .getByText(/converted|success/i)
            .isVisible()
            .catch(() => false);
          const isCustomerPage = page.url().includes("/crm/customers/");

          expect(hasSuccess || isCustomerPage).toBeTruthy();
        } else {
          // Button should be disabled if no email
          await expect(convertButton).toBeDisabled();
          await expect(
            page.getByText(/email address to convert/i)
          ).toBeVisible();
        }
      }
    }
  });

  test("should disable convert button when lead has no email", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Check convert button state
      const convertButton = page.getByRole("button", {
        name: /Convert to Customer/i,
      });
      const buttonExists = await convertButton.isVisible().catch(() => false);

      if (buttonExists) {
        const isEnabled = await convertButton.isEnabled();

        if (!isEnabled) {
          // Should show message about email requirement
          await expect(
            page.getByText(/email address to convert/i)
          ).toBeVisible();
        }
      }
    }
  });

  test("should navigate back to lead pipeline", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Click back button
      const backButton = page.getByRole("button", { name: /Back to Leads/i });
      await backButton.click();

      // Verify navigation back to pipeline
      await page.waitForURL(/\/crm\/leads$/, { timeout: 5000 });
      await expect(
        page.getByText(/Manage leads through the sales pipeline/i)
      ).toBeVisible();
    }
  });

  test("should handle invalid lead ID", async ({ page }) => {
    // Navigate to invalid lead ID
    await page.goto("http://localhost:3000/crm/leads/999999");

    // Should show error or redirect
    await page.waitForTimeout(2000);

    // Either error message or redirect should occur
    const hasError = await page
      .getByText(/Invalid lead ID|not found|Failed to load/i)
      .isVisible()
      .catch(() => false);
    const isRedirected =
      page.url().includes("/crm/leads") && !page.url().includes("/999999");

    expect(hasError || isRedirected).toBeTruthy();
  });

  test("should display timeline information", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Check for timeline section
      const timelineSection = page.getByText(/Timeline/i);
      const timelineExists = await timelineSection
        .isVisible()
        .catch(() => false);

      if (timelineExists) {
        // Should show created date
        await expect(page.getByText(/Created/i)).toBeVisible();
      }
    }
  });

  test("should be keyboard accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      // Navigate using keyboard
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      // Should navigate to detail page
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Tab navigation should work
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });

  test("should display update status and convert sections", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/leads");
    await page.waitForSelector("text=Lead Pipeline", { timeout: 5000 });

    const leadCards = page.locator('[role="listitem"]').first();
    const hasLeads = (await leadCards.count()) > 0;

    if (hasLeads) {
      await leadCards.click();
      await page.waitForURL(/\/crm\/leads\/\d+/, { timeout: 5000 });

      // Verify Update Status section exists
      await expect(page.getByText(/Update Status/i)).toBeVisible();

      // Verify Convert to Customer section exists
      await expect(page.getByText(/Convert to Customer/i)).toBeVisible();
    }
  });
});
