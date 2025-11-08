/**
 * Playwright Config - AI Enhanced Testing
 * 
 * Optimized for Friday AI testing with:
 * - AI-powered test execution
 * - Visual regression testing
 * - Performance monitoring
 * - Accessibility testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Show test progress in console
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // AI Test specific settings
    actionTimeout: 15000, // Longer for AI responses
    navigationTimeout: 10000,
    
    // Viewport for 20% panel testing
    viewport: { width: 1920, height: 1080 },
    
    // Network conditions for testing
    offline: false,
    
    // Geolocation and permissions
    geolocation: { latitude: 55.6761, longitude: 12.5683 }, // Copenhagen
    permissions: ['clipboard-read', 'clipboard-write'],
    launchOptions: {
      args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // AI-specific test project with slower timeouts
    {
      name: 'ai-tests',
      testMatch: '**/ai/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: 30000, // 30s for AI responses
        trace: 'on', // Always trace AI tests
        screenshot: 'on',
        video: 'on',
      },
    },
  ],

  // Global setup for AI testing
  globalSetup: './tests/global-setup.ts',
  
  // Test timeout configuration
  timeout: 60000, // 60s total test timeout
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Output folder
  outputDir: 'test-results/',
  
  // Web server (if needed)
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});