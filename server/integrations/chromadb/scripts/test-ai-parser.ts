/**
 * Test AI Calendar Parser
 */

import { readFileSync } from "fs";
import { resolve } from "path";

import { parseCalendarEventWithAI } from "./ai-calendar-parser";

async function testParser() {
  console.log("🤖 Testing AI Calendar Parser\n");
  console.log("=".repeat(70) + "\n");

  // Load sample events
  const rawData = JSON.parse(
    readFileSync(
      resolve(__dirname, "../test-data/raw-leads-v4_3_3.json"),
      "utf8"
    )
  );

  const sampleEvents = rawData.leads
    .filter((l: any) => l.calendar && l.calendar.description)
    .slice(0, 3); // Test first 3

  for (let i = 0; i < sampleEvents.length; i++) {
    const event = sampleEvents[i].calendar;

    console.log(`📅 Event ${i + 1}: ${event.summary}\n`);

    const parsed = await parseCalendarEventWithAI(
      event.summary,
      event.description
    );

    console.log("📊 Parsed Data:");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("\n" + "=".repeat(70) + "\n");
  }

  console.log("✅ AI Parsing Test Complete");
}

testParser().catch(console.error);
