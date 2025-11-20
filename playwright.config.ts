/**
 * Playwright Config - AI Enhanced Testing
 *
 * Optimized for Friday AI testing with:
 * - AI-powered test execution
 * - Visual regression testing
 * - Performance monitoring
 * - Accessibility testing
 */

import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ["html", { outputFolder: "tests/results/reports" }],
    ["json", { outputFile: "tests/results/playwright/results.json" }],
    ["junit", { outputFile: "tests/results/playwright/junit.xml" }],
    ["list"], // Show test progress in console
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // AI Test specific settings
    actionTimeout: 15000, // Longer for AI responses
    navigationTimeout: 10000,

    // Viewport for 20% panel testing
    viewport: { width: 1920, height: 1080 },

    // Network conditions for testing
    offline: false,

    // Geolocation (permission configuration moved to browser-specific projects)
    geolocation: { latitude: 55.6761, longitude: 12.5683 }, // Copenhagen
    launchOptions: {
      args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"],
    },
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Chromium supports clipboard-read permission reliably
        permissions: ["clipboard-read"],
      },
    },

    // Enable Firefox only when ALL_BROWSERS env is set due to unsupported permissions
    ...(process.env.ALL_BROWSERS
      ? ([
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
        ] as const)
      : []),

    // Enable WebKit only when ALL_BROWSERS env is set; some UI differences may require selectors tweaks
    ...(process.env.ALL_BROWSERS
      ? ([
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ] as const)
      : []),

    // Mobile testing
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        permissions: ["clipboard-read"],
      },
    },

    ...(process.env.ALL_BROWSERS
      ? ([
          {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
          },
        ] as const)
      : []),

    // AI-specific test project with slower timeouts
    {
      name: "ai-tests",
      testMatch: "**/ai/**/*.test.ts",
      use: {
        ...devices["Desktop Chrome"],
        actionTimeout: 30000, // 30s for AI responses
        trace: "on", // Always trace AI tests
        screenshot: "on",
        video: "on",
      },
    },
  ],

  // Global setup for AI testing
  globalSetup: "./tests/global-setup.ts",

  // Test timeout configuration
  timeout: 60000, // 60s total test timeout

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Output folder
  outputDir: "test-results/",

  // Web server (if needed)
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // Don't fail if server has import issues - allow manual start
    ignoreHTTPSErrors: true,
  },
});
