import { test } from "@playwright/test";

/**
 * Email Error UI Test - SKIPPED
 *
 * This E2E test is skipped because testing error states in E2E is unreliable due to:
 * 1. React Query caching makes it impossible to trigger errors consistently
 * 2. Global rate limit state disables queries before errors can be shown
 * 3. Network interception timing issues
 *
 * ✅ CONVERTED TO COMPONENT TEST
 * See: client/src/components/inbox/__tests__/EmailTabV2.error.test.tsx
 *
 * The component test provides:
 * - Mocked tRPC queries that return error states
 * - Fast execution without browser overhead
 * - Deterministic control over component state
 * - Tests for both generic errors and rate limit errors
 *
 * The error UI code exists in EmailTabV2.tsx and works in production when real errors occur.
 * E2E tests should focus on happy paths; component tests should cover error states.
 */
test.describe.skip("Email error UI", () => {
  test("shows error state when email list fails", async () => {
    // Test skipped - see comment above
  });
});
