/**
 * CRM Customer Detail E2E Tests
 *
 * Tests complete workflows for customer detail page:
 * - Navigation from customer list
 * - Viewing customer information
 * - Switching between tabs (Overview, Properties, Notes, Activities)
 * - Data display and formatting
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

test.describe("CRM Customer Detail E2E", () => {
  test.beforeEach(async ({ page }) => {
    await devLogin(page);
  });

  test("should navigate to customer detail from customer list", async ({
    page,
  }) => {
    // Navigate to customer list
    await page.goto("http://localhost:3000/crm/customers");

    // Wait for customer list to load
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    // Wait for at least one customer card to be visible
    const customerCards = page.locator('[role="listitem"]').first();
    await customerCards.waitFor({ timeout: 10000 }).catch(() => {
      // If no customers, that's okay - we'll test with empty state
    });

    // Check if there are customers
    const hasCustomers = (await page.locator('[role="listitem"]').count()) > 0;

    if (hasCustomers) {
      // Click on first customer card
      await customerCards.click();

      // Wait for navigation to detail page
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Verify we're on detail page
      await expect(
        page.getByRole("button", { name: /Back to Customers/i })
      ).toBeVisible();
    } else {
      // Test empty state
      await expect(page.getByText(/No customers found/i)).toBeVisible();
    }
  });

  test("should display customer information in overview tab", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      await customerCards.click();
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Verify customer name is displayed
      const customerName = page.locator("h1").first();
      await expect(customerName).toBeVisible();

      // Verify overview tab is active by default
      const overviewTab = page.getByRole("tab", { name: /Overview/i });
      await expect(overviewTab).toHaveAttribute("aria-selected", "true");

      // Verify customer information section exists
      await expect(page.getByText(/Customer Information/i)).toBeVisible();

      // Verify financial summary section exists
      await expect(page.getByText(/Financial Summary/i)).toBeVisible();
    }
  });

  test("should switch between tabs", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      await customerCards.click();
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Test Properties tab
      const propertiesTab = page.getByRole("tab", { name: /Properties/i });
      await propertiesTab.click();
      await expect(propertiesTab).toHaveAttribute("aria-selected", "true");

      // Test Notes tab
      const notesTab = page.getByRole("tab", { name: /Notes/i });
      await notesTab.click();
      await expect(notesTab).toHaveAttribute("aria-selected", "true");

      // Test Activities tab
      const activitiesTab = page.getByRole("tab", { name: /Activities/i });
      await activitiesTab.click();
      await expect(activitiesTab).toHaveAttribute("aria-selected", "true");

      // Return to Overview
      const overviewTab = page.getByRole("tab", { name: /Overview/i });
      await overviewTab.click();
      await expect(overviewTab).toHaveAttribute("aria-selected", "true");
    }
  });

  test("should display empty states for tabs with no data", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      await customerCards.click();
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Check Properties empty state
      const propertiesTab = page.getByRole("tab", { name: /Properties/i });
      await propertiesTab.click();

      // Wait a moment for data to load or show empty state
      await page.waitForTimeout(1000);

      // Check if empty state is shown (if no properties)
      const hasProperties = await page
        .getByText(/No properties/i)
        .isVisible()
        .catch(() => false);
      const hasPropertyCards = await page
        .locator("text=/Primary/i")
        .isVisible()
        .catch(() => false);

      // Either empty state or properties should be visible
      expect(hasProperties || hasPropertyCards).toBeTruthy();
    }
  });

  test("should navigate back to customer list", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      await customerCards.click();
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Click back button
      const backButton = page.getByRole("button", {
        name: /Back to Customers/i,
      });
      await backButton.click();

      // Verify navigation back to list
      await page.waitForURL(/\/crm\/customers$/, { timeout: 5000 });
      await expect(
        page.getByText(/Manage your customer profiles/i)
      ).toBeVisible();
    }
  });

  test("should handle invalid customer ID", async ({ page }) => {
    // Navigate to invalid customer ID
    await page.goto("http://localhost:3000/crm/customers/999999");

    // Should show error or redirect
    await page.waitForTimeout(2000);

    // Either error message or redirect should occur
    const hasError = await page
      .getByText(/Invalid customer ID|not found|Failed to load/i)
      .isVisible()
      .catch(() => false);
    const isRedirected =
      page.url().includes("/crm/customers") && !page.url().includes("/999999");

    expect(hasError || isRedirected).toBeTruthy();
  });

  test("should display customer financial data correctly formatted", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      await customerCards.click();
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Check for financial summary section
      const financialSection = page.getByText(/Financial Summary/i);
      await expect(financialSection).toBeVisible();

      // Verify currency formatting (should contain DKK or kr)
      const totalInvoiced = page.getByText(/Total Invoiced/i);
      if (await totalInvoiced.isVisible()) {
        // Currency should be formatted
        const currencyText = await page
          .locator("text=/kr|DKK|0,00/")
          .first()
          .textContent()
          .catch(() => "");
        expect(currencyText.length).toBeGreaterThan(0);
      }
    }
  });

  test("should be keyboard accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/crm/customers");
    await page.waitForSelector("text=Customers", { timeout: 5000 });

    const customerCards = page.locator('[role="listitem"]').first();
    const hasCustomers = (await customerCards.count()) > 0;

    if (hasCustomers) {
      // Navigate using keyboard
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");

      // Should navigate to detail page
      await page.waitForURL(/\/crm\/customers\/\d+/, { timeout: 5000 });

      // Tab navigation should work
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });
});
