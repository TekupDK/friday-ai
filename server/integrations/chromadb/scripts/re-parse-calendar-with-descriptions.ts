/**
 * Re-parse Calendar Events to Extract Emails from Descriptions
 * The calendar events were already fetched, just need to parse descriptions properly
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
config({ path: resolve(process.cwd(), ".env.dev") });

import { listCalendarEvents } from "../../../google-api";

console.log("🔍 RE-PARSING Calendar with Description Extraction\n");
console.log("=".repeat(70));

interface EnrichedCalendarLead {
  source: "calendar";
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  rawData: {
    eventTitle: string;
    eventStart: string;
    eventLocation?: string;
    description?: string;
    hasEmail: boolean;
    hasPhone: boolean;
  };
}

async function reparseCalendar() {
  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  console.log("📅 Fetching calendar events...");
  const events = await listCalendarEvents({
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    maxResults: 500,
  });

  console.log(`✅ Found ${events.length} events\n`);

  const enrichedLeads: EnrichedCalendarLead[] = [];
  let eventsWithEmail = 0;
  let eventsWithPhone = 0;

  console.log("🔍 Parsing descriptions...\n");

  for (const event of events) {
    const title = event.summary || "";
    const description = (event as any).description || "";
    const location = (event as any).location || "";

    // Extract emails from description
    const emailMatches = description.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    );
    const email =
      emailMatches && emailMatches.length > 0 ? emailMatches[0] : null;

    // Extract phone from description (Danish format)
    const phoneMatches = description.match(
      /(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g
    );
    const phone =
      phoneMatches && phoneMatches.length > 0
        ? phoneMatches[0].replace(/\s/g, "")
        : null;

    // Extract name from title
    const namePatterns = [/([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/g];

    let name = "Unknown";
    for (const pattern of namePatterns) {
      const matches = title.matchAll(pattern);
      for (const match of matches) {
        const extractedName = match[0].trim();
        if (extractedName.length > 3 && extractedName.split(" ").length >= 2) {
          name = extractedName;
          break;
        }
      }
      if (name !== "Unknown") break;
    }

    // If still unknown, try from email
    if (name === "Unknown" && email) {
      name = email.split("@")[0];
    }

    if (email) eventsWithEmail++;
    if (phone) eventsWithPhone++;

    enrichedLeads.push({
      source: "calendar",
      name,
      email,
      phone,
      company: email ? email.split("@")[1] : null,
      rawData: {
        eventTitle: title,
        eventStart: event.start || "",
        eventLocation: location,
        description: description.substring(0, 300), // Save snippet
        hasEmail: !!email,
        hasPhone: !!phone,
      },
    });
  }

  console.log("📊 PARSING RESULTS:");
  console.log("-".repeat(70));
  console.log(`Total events: ${events.length}`);
  console.log(
    `Events with email: ${eventsWithEmail} (${Math.round((eventsWithEmail / events.length) * 100)}%)`
  );
  console.log(
    `Events with phone: ${eventsWithPhone} (${Math.round((eventsWithPhone / events.length) * 100)}%)`
  );

  // Show samples
  console.log("\n📋 SAMPLE EVENTS WITH EMAIL (First 10):");
  console.log("-".repeat(70));

  enrichedLeads
    .filter(l => l.email)
    .slice(0, 10)
    .forEach((lead, i) => {
      console.log(`\n${i + 1}. ${lead.name}`);
      console.log(`   Event: ${lead.rawData.eventTitle}`);
      console.log(`   Email: ${lead.email}`);
      console.log(`   Phone: ${lead.phone || "N/A"}`);
      console.log(`   Location: ${lead.rawData.eventLocation || "N/A"}`);
    });

  // Save
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/calendar-enriched.json"
  );
  const output = {
    metadata: {
      collected: new Date().toISOString(),
      totalEvents: events.length,
      withEmail: eventsWithEmail,
      withPhone: eventsWithPhone,
    },
    leads: enrichedLeads,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);
  console.log("");

  process.exit(0);
}

reparseCalendar().catch(console.error);
