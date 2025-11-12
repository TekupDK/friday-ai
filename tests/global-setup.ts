/**
 * Global Setup for Friday AI Testing
 *
 * Prepares test environment:
 * - Start dev server
 * - Setup test data
 * - Configure AI test environment
 */

import { chromium, FullConfig } from "@playwright/test";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Setting up Friday AI Test Environment...");

  // Check if dev server is running
  try {
    await fetch("http://localhost:3000");
    console.log("✅ Dev server is already running");
  } catch {
    console.log("🔄 Starting dev server...");
    // Start dev server in background using spawn instead of execSync for detached process
    const { spawn } = await import("child_process");

    spawn("pnpm", ["dev"], {
      stdio: "pipe",
      detached: true,
      shell: true,
    }).unref();

    // Wait for server to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        await fetch("http://localhost:3000");
        console.log("✅ Dev server started successfully");
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
    }

    if (retries === 0) {
      throw new Error("❌ Failed to start dev server");
    }
  }

  // Setup test environment variables
  process.env.AI_TEST_MODE = "true";
  process.env.FRIDAY_TEST_ENV = "playwright";

  // Create test data directories
  const testDirs = [
    "test-results",
    "test-results/ai-screenshots",
    "test-results/ai-videos",
    "test-results/ai-traces",
  ];

  testDirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created test directory: ${dir}`);
    }
  });

  console.log("✅ Friday AI Test Environment Ready!");
}

export default globalSetup;
