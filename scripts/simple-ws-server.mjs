#!/usr/bin/env node
/**
 * Simple WebSocket server test på port 3002
 */
import { WebSocketServer } from "ws";

console.log("🧪 Starting test WebSocket server on port 3002...");

try {
  const wss = new WebSocketServer({ port: 3002 });

  wss.on("listening", () => {
    console.log("✅ WebSocket server listening on port 3002");
    console.log("   Test: ws://localhost:3002");
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId") || "anonymous";

    console.log(`👤 Client connected: ${userId}`);

    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Welcome to docs WebSocket",
      })
    );

    ws.on("message", data => {
      console.log("📨 Received:", data.toString());
    });

    ws.on("close", () => {
      console.log("👋 Client disconnected");
    });
  });

  wss.on("error", err => {
    console.error("❌ Server error:", err.message);
    if (err.code === "EADDRINUSE") {
      console.error("⚠️  Port 3002 is already in use!");
    }
  });

  console.log("");
  console.log("Press Ctrl+C to stop");
  console.log("");
} catch (error) {
  console.error("❌ Failed to start:", error.message);
  process.exit(1);
}
