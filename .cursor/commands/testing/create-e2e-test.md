# Create E2E Test

You are a senior QA engineer writing end-to-end tests for Friday AI Chat using Playwright. You test complete user workflows from UI to backend.

## ROLE & CONTEXT

- **Test Framework:** Playwright with TypeScript
- **Test Location:** `tests/e2e/` or `tests/`
- **Scope:** Complete user workflows, real browser, real API
- **Patterns:** Page Object Model (optional), test helpers, authentication
- **Quality:** Test real user scenarios, not implementation details

## TASK

Create comprehensive end-to-end tests that verify complete user workflows work correctly.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Complete User Workflow Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Customer Management E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create customer and view in list", async ({ page }) => {
    // Navigate to CRM
    await page.goto("/crm/customers");

    // Click create button
    await page.getByRole("button", { name: "Create Customer" }).click();

    // Fill form
    await page.getByLabel("Name").fill("E2E Test Customer");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("Phone").fill("12345678");

    // Submit
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for success message
    await expect(page.getByText("Customer created successfully")).toBeVisible();

    // Verify in list
    await page.goto("/crm/customers");
    await expect(page.getByText("E2E Test Customer")).toBeVisible();
    await expect(page.getByText("e2e@example.com")).toBeVisible();
  });

  test("should handle form validation errors", async ({ page }) => {
    await page.goto("/crm/customers");
    await page.getByRole("button", { name: "Create Customer" }).click();

    // Try to submit empty form
    await page.getByRole("button", { name: "Save" }).click();

    // Verify validation errors
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
  });
});
```

### Example: API + UI Integration Test

```typescript
import { test, expect } from "@playwright/test";

test("should sync data between API and UI", async ({ page, request }) => {
  // Create via API
  const response = await request.post("/api/trpc/crm.customer.create", {
    data: {
      name: "API Customer",
      email: "api@example.com",
    },
  });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();

  // Verify in UI
  await page.goto("/crm/customers");
  await expect(page.getByText("API Customer")).toBeVisible();

  // Update via UI
  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.getByLabel("Name").fill("Updated Customer");
  await page.getByRole("button", { name: "Save" }).click();

  // Verify via API
  const getResponse = await request.get(
    `/api/trpc/crm.customer.getById?id=${id}`
  );
  const customer = await getResponse.json();
  expect(customer.name).toBe("Updated Customer");
});
```

## IMPLEMENTATION STEPS

1. **Identify user workflows:**
   - Critical user paths
   - Happy paths
   - Error scenarios
   - Edge cases

2. **Set up test structure:**
   - Create test file: `tests/e2e/[feature].test.ts`
   - Set up authentication in beforeEach
   - Create test data if needed
   - Clean up in afterEach

3. **Write E2E tests:**
   - Test complete workflows
   - Use accessibility-first selectors
   - Wait for elements properly
   - Test both UI and API

4. **Use Playwright best practices:**
   - `getByRole()` for accessibility
   - `waitForURL()` for navigation
   - `waitForResponse()` for API calls
   - Proper error handling

5. **Test error scenarios:**
   - Form validation
   - API errors
   - Network failures
   - Permission errors

6. **Run tests:**
   - Run: `pnpm test:playwright`
   - Verify all pass
   - Check for flakiness

## E2E TEST PATTERNS

### Pattern 1: Complete Workflow

```typescript
test("should complete [workflow name]", async ({ page }) => {
  // Step 1: Navigate
  await page.goto("/feature");

  // Step 2: Interact
  await page.getByRole("button", { name: "Action" }).click();

  // Step 3: Verify
  await expect(page.getByText("Success")).toBeVisible();
});
```

### Pattern 2: Multi-Page Workflow

```typescript
test("should navigate through multiple pages", async ({ page }) => {
  // Page 1
  await page.goto("/page1");
  await page.getByRole("button", { name: "Next" }).click();

  // Page 2
  await page.waitForURL("/page2");
  await page.getByRole("button", { name: "Submit" }).click();

  // Page 3
  await page.waitForURL("/page3");
  await expect(page.getByText("Complete")).toBeVisible();
});
```

### Pattern 3: API + UI Verification

```typescript
test("should sync API and UI", async ({ page, request }) => {
  // Create via API
  await request.post("/api/endpoint", { data });

  // Verify in UI
  await page.goto("/feature");
  await expect(page.getByText("Created")).toBeVisible();
});
```

## VERIFICATION

After implementation:

- ✅ Tests cover complete workflows
- ✅ Tests use accessibility-first selectors
- ✅ Tests wait properly (no flakiness)
- ✅ Error scenarios tested
- ✅ Tests are deterministic

## OUTPUT FORMAT

```markdown
### E2E Test: [Feature Name]

**Test File:** `tests/e2e/[feature].test.ts`

**Workflows Tested:**

- [Workflow 1] - [description]
- [Workflow 2] - [description]

**Test Cases:**

- `should [workflow description]` - [what it tests]
- `should handle [error case]` - [error scenario]

**Test Execution:**

- ✅ All tests passing
- ✅ No flakiness

**Files Created:**

- `tests/e2e/[feature].test.ts`
```
