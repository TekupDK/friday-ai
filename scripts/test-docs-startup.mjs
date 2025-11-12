#!/usr/bin/env node
/**
 * Test docs service startup with full environment
 */
import dotenv from "dotenv";
import path from "path";

// Load .env.dev
dotenv.config({ path: ".env.dev" });

console.log("🧪 Testing docs service startup...\n");
console.log("Environment:");
console.log("  DOCS_ENABLE:", process.env.DOCS_ENABLE);
console.log("  DOCS_REPO_PATH:", process.env.DOCS_REPO_PATH);
console.log("  DOCS_PATH:", process.env.DOCS_PATH);
console.log("  DOCS_WS_PORT:", process.env.DOCS_WS_PORT);
console.log(
  "  DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"
);
console.log("");

try {
  // Mock logger with more details
  const logger = {
    info: (...args) => console.log("[INFO]", JSON.stringify(args, null, 2)),
    error: (...args) => console.error("[ERROR]", JSON.stringify(args, null, 2)),
    warn: (...args) => console.warn("[WARN]", JSON.stringify(args, null, 2)),
    debug: (...args) => console.log("[DEBUG]", JSON.stringify(args, null, 2)),
  };

  // Replace logger in modules
  const module = await import("../server/_core/logger.js");
  Object.assign(module.logger, logger);

  console.log("1. Importing startDocsService...");
  const { startDocsService } = await import("../server/docs/service.js");
  console.log("✅ Module imported\n");

  console.log("2. Starting docs service...");
  await startDocsService();
  console.log("✅ Docs service started!\n");

  console.log("3. Testing WebSocket...");
  const WebSocket = (await import("ws")).default;
  const ws = new WebSocket("ws://localhost:3002?userId=test");

  ws.on("open", () => {
    console.log("✅ WebSocket connected successfully!");
    console.log("\n🎉 ALL TESTS PASSED!");
    ws.close();
    process.exit(0);
  });

  ws.on("error", err => {
    console.error("❌ WebSocket error:", err.message);
    process.exit(1);
  });

  setTimeout(() => {
    console.error("⏱️ Timeout waiting for WebSocket");
    process.exit(1);
  }, 5000);
} catch (error) {
  console.error("\n❌ Failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
