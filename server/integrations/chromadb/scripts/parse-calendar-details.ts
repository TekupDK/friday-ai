/**
 * Parse Calendar Event Descriptions in Detail
 * Extract ALL information: address, price, time estimate, service type, etc.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

console.log("🔍 PARSING CALENDAR DESCRIPTIONS IN DETAIL\n");
console.log("=".repeat(70));

const calendarPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/calendar-enriched.json"
);
const calendarData = JSON.parse(readFileSync(calendarPath, "utf-8"));

console.log(`Total events: ${calendarData.leads.length}`);
console.log(`\nShowing first 20 events with descriptions:\n`);

calendarData.leads
  .filter(
    (l: any) => l.rawData.description && l.rawData.description.length > 50
  )
  .slice(0, 20)
  .forEach((lead: any, i: number) => {
    console.log("=".repeat(70));
    console.log(`\n${i + 1}. 📅 ${lead.rawData.eventTitle}`);
    console.log(`   Start: ${lead.rawData.eventStart}`);
    console.log(`   Location: ${lead.rawData.eventLocation || "N/A"}`);
    console.log(`   Name: ${lead.name}`);
    console.log(`   Email: ${lead.email || "N/A"}`);
    console.log(`   Phone: ${lead.phone || "N/A"}`);
    console.log(`\n   📝 FULL DESCRIPTION:`);
    console.log(`   ${"-".repeat(66)}`);

    const desc = lead.rawData.description;
    const lines = desc.split("\n");
    lines.forEach((line: string, idx: number) => {
      if (idx < 30) {
        // Show max 30 lines
        console.log(`   ${line}`);
      }
    });

    if (lines.length > 30) {
      console.log(`   ... (${lines.length - 30} more lines)`);
    }

    console.log("");
  });

console.log("\n" + "=".repeat(70));
console.log("✅ Done analyzing calendar descriptions\n");

process.exit(0);
