/**
 * A/B Test for Chat Flow Migration
 * Tests both old and new chat flows for performance and reliability
 */

import { test, expect } from "@playwright/test";

test.describe("Chat Flow A/B Test", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat interface
    await page.goto("/chat");

    // Wait for page to load
    await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
  });

  test("Control Group - Direct OpenRouter Flow", async ({ page }) => {
    // Force control group (old flow)
    await page.addInitScript(() => {
      window.localStorage.setItem("ab_test_force_group", "control");
    });

    await page.reload();

    // Send test message
    const testMessage =
      "Hej Friday, kan du hjælpe mig med at oprette et nyt lead?";
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="send-button"]');

    // Verify old flow behavior
    await expect(
      page.locator('[data-testid="loading-indicator"]')
    ).toBeVisible();

    // Should receive response (non-streaming)
    const response = page.locator('[data-testid="ai-response"]').nth(-1);
    await expect(response).toBeVisible({ timeout: 10000 });

    // Verify no streaming indicators
    await expect(
      page.locator('[data-testid="streaming-chunk"]')
    ).not.toBeVisible();

    // Measure response time
    const startTime = Date.now();
    await expect(response).toContainText("lead");
    const responseTime = Date.now() - startTime;

    console.log(`Control group response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(5000); // Should be under 5 seconds
  });

  test("Variant Group - Server-side Flow with Streaming", async ({ page }) => {
    // Force variant group (new flow)
    await page.addInitScript(() => {
      window.localStorage.setItem("ab_test_force_group", "variant");
      window.localStorage.setItem(
        "feature_flags",
        JSON.stringify({
          useServerSideChat: true,
          enableStreaming: true,
          enableModelRouting: false,
        })
      );
    });

    await page.reload();

    // Send test message
    const testMessage = "Hej Friday, tjek min kalender for i dag";
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="send-button"]');

    // Verify new flow behavior
    await expect(
      page.locator('[data-testid="streaming-indicator"]')
    ).toBeVisible();

    // Should see streaming chunks
    await expect(page.locator('[data-testid="streaming-chunk"]')).toBeVisible();

    // Verify streaming response accumulation
    const streamingContent = page.locator('[data-testid="streaming-content"]');
    await expect(streamingContent).toBeVisible();

    // Wait for streaming to complete
    await expect(
      page.locator('[data-testid="streaming-complete"]')
    ).toBeVisible({ timeout: 10000 });

    // Verify final response contains calendar information
    const finalResponse = page.locator('[data-testid="ai-response"]').nth(-1);
    await expect(finalResponse).toContainText("kalender");
  });

  test("Error Handling - Server-side Flow", async ({ page }) => {
    // Force variant with simulated error
    await page.addInitScript(() => {
      window.localStorage.setItem("ab_test_force_group", "variant");
      window.localStorage.setItem("simulate_error", "true");
    });

    await page.reload();

    // Send test message
    await page.fill('[data-testid="chat-input"]', "Test message");
    await page.click('[data-testid="send-button"]');

    // Should show error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 5000,
    });

    // Should have retry option
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Verify fallback behavior
    await page.click('[data-testid="retry-button"]');
    await expect(
      page.locator('[data-testid="fallback-indicator"]')
    ).toBeVisible();
  });

  test("Performance Comparison", async ({ page }) => {
    const results: {
      group: string;
      responseTime: number;
      errorCount: number;
    }[] = [];

    // Test control group
    for (let i = 0; i < 5; i++) {
      await page.addInitScript(() => {
        window.localStorage.setItem("ab_test_force_group", "control");
      });
      await page.reload();

      const startTime = Date.now();
      await page.fill('[data-testid="chat-input"]', `Test message ${i}`);
      await page.click('[data-testid="send-button"]');

      try {
        await expect(
          page.locator('[data-testid="ai-response"]').nth(-1)
        ).toBeVisible({ timeout: 10000 });
        results.push({
          group: "control",
          responseTime: Date.now() - startTime,
          errorCount: 0,
        });
      } catch (error) {
        results.push({
          group: "control",
          responseTime: 10000,
          errorCount: 1,
        });
      }
    }

    // Test variant group
    for (let i = 0; i < 5; i++) {
      await page.addInitScript(() => {
        window.localStorage.setItem("ab_test_force_group", "variant");
        window.localStorage.setItem(
          "feature_flags",
          JSON.stringify({
            useServerSideChat: true,
            enableStreaming: true,
          })
        );
      });
      await page.reload();

      const startTime = Date.now();
      await page.fill('[data-testid="chat-input"]', `Test message ${i}`);
      await page.click('[data-testid="send-button"]');

      try {
        await expect(
          page.locator('[data-testid="streaming-complete"]')
        ).toBeVisible({ timeout: 10000 });
        results.push({
          group: "variant",
          responseTime: Date.now() - startTime,
          errorCount: 0,
        });
      } catch (error) {
        results.push({
          group: "variant",
          responseTime: 10000,
          errorCount: 1,
        });
      }
    }

    // Calculate and log results
    const controlResults = results.filter(r => r.group === "control");
    const variantResults = results.filter(r => r.group === "variant");

    const avgControlTime =
      controlResults.reduce((sum, r) => sum + r.responseTime, 0) /
      controlResults.length;
    const avgVariantTime =
      variantResults.reduce((sum, r) => sum + r.responseTime, 0) /
      variantResults.length;

    const controlErrors = controlResults.reduce(
      (sum, r) => sum + r.errorCount,
      0
    );
    const variantErrors = variantResults.reduce(
      (sum, r) => sum + r.errorCount,
      0
    );

    console.log("Performance Comparison Results:");
    console.log(
      `Control Group - Avg Response Time: ${avgControlTime}ms, Errors: ${controlErrors}`
    );
    console.log(
      `Variant Group - Avg Response Time: ${avgVariantTime}ms, Errors: ${variantErrors}`
    );
    console.log(
      `Performance Improvement: ${(((avgControlTime - avgVariantTime) / avgControlTime) * 100).toFixed(1)}%`
    );

    // Assertions for performance regression
    expect(avgVariantTime).toBeLessThan(avgControlTime * 1.2); // No more than 20% slower
    expect(variantErrors).toBeLessThanOrEqual(controlErrors + 1); // No more than 1 additional error
  });

  test("Feature Flag Integration", async ({ page }) => {
    // Test feature flag override
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "feature_flags",
        JSON.stringify({
          useServerSideChat: true,
          enableStreaming: false, // Streaming disabled
          enableModelRouting: false,
        })
      );
    });

    await page.reload();

    // Send message
    await page.fill('[data-testid="chat-input"]', "Test feature flags");
    await page.click('[data-testid="send-button"]');

    // Should use server-side but no streaming
    await expect(
      page.locator('[data-testid="server-side-indicator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="streaming-indicator"]')
    ).not.toBeVisible();

    // Should still get response
    await expect(
      page.locator('[data-testid="ai-response"]').nth(-1)
    ).toBeVisible({ timeout: 10000 });
  });

  test("Gradual Rollout Simulation", async ({ page }) => {
    // Simulate different rollout percentages
    const rolloutPercentages = [0.1, 0.3, 0.5, 0.8, 1.0];

    for (const percentage of rolloutPercentages) {
      await page.addInitScript(rollout => {
        window.localStorage.setItem(
          "ab_test_rollback_percentage",
          rollout.toString()
        );
      }, percentage);

      await page.reload();

      // Check if user is in variant group based on rollout
      const isInVariant = await page.evaluate(() => {
        const userId = Math.floor(Math.random() * 1000); // Simulate user ID
        const rollout = parseFloat(
          window.localStorage.getItem("ab_test_rollback_percentage") || "0"
        );
        return userId % 100 < rollout * 100;
      });

      console.log(
        `Rollout ${percentage * 100}%: User in variant: ${isInVariant}`
      );

      // Verify appropriate behavior based on group
      if (isInVariant) {
        await expect(
          page.locator('[data-testid="variant-indicator"]')
        ).toBeVisible();
      } else {
        await expect(
          page.locator('[data-testid="control-indicator"]')
        ).toBeVisible();
      }
    }
  });
});
