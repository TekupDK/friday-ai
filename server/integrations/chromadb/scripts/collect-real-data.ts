/**
 * Collect Real Data for ChromaDB Testing
 *
 * Collects data from:
 * - Google Calendar (RenOS Booking Calendar) - July 1 to Dec 31, 2025
 * - Email threads (Gmail)
 * - Billy customer database
 *
 * Purpose: Create test dataset for ChromaDB threshold tuning
 *
 * Run with: npx tsx server/integrations/chromadb/scripts/collect-real-data.ts
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env.dev") });

import { getCustomers } from "../../../billy";
import { getHistoricalCalendarEvents, getUserEmailThreads } from "../../../db";

console.log("📊 Collecting Real Data for ChromaDB Testing\n");
console.log("=".repeat(60));

interface CollectedLead {
  source: "calendar" | "email" | "billy";
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  rawData: any;
}

async function collectRealData() {
  const userId = 1; // RenDetalje user
  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  console.log("\n📋 Collection Parameters:");
  console.log("-".repeat(60));
  console.log(`User ID: ${userId}`);
  console.log(`Start Date: ${startDate.toISOString()}`);
  console.log(`End Date: ${endDate.toISOString()}`);
  console.log(`Duration: 6 months (July - December 2025)`);

  const collectedLeads: CollectedLead[] = [];

  // Step 1: Collect from Google Calendar
  console.log("\n📅 Step 1: Collecting from Google Calendar...");
  console.log("-".repeat(60));

  try {
    const calendarEvents = await getHistoricalCalendarEvents(userId, startDate);

    console.log(`✅ Found ${calendarEvents.length} calendar events`);

    // Extract customer names from event titles and descriptions
    for (const event of calendarEvents) {
      // Try to extract names from title (e.g., "Meeting with John Doe")
      const title = event.title || "";
      const description = event.description || "";

      // Simple name extraction from title
      const namePatterns = [
        /(?:møde med|meeting with|aftale med)\s+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)/gi,
        /([A-ZÆØÅ][a-zæøå]+\s+[A-ZÆØÅ][a-zæøå]+)/g, // Just "Name Lastname"
      ];

      for (const pattern of namePatterns) {
        const matches = title.matchAll(pattern);
        for (const match of matches) {
          const name = match[1] || match[0];
          if (name && name.length > 3 && name.split(" ").length >= 2) {
            collectedLeads.push({
              source: "calendar",
              name: name.trim(),
              email: null,
              phone: null,
              company: null,
              rawData: {
                eventTitle: title,
                eventDate: event.startTime,
                location: event.location,
              },
            });
          }
        }
      }
    }

    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "calendar").length} leads from calendar`
    );
  } catch (error) {
    console.log("⚠️  Calendar collection failed:", error);
  }

  // Step 2: Collect from Email Threads
  console.log("\n📧 Step 2: Collecting from Email Threads...");
  console.log("-".repeat(60));

  try {
    const emailThreads = await getUserEmailThreads(userId);

    // Filter by date range
    const relevantThreads = emailThreads.filter(thread => {
      if (!thread.lastMessageAt) return false;
      const threadDate = new Date(thread.lastMessageAt);
      return threadDate >= startDate && threadDate <= endDate;
    });

    console.log(
      `✅ Found ${relevantThreads.length} email threads in date range`
    );

    for (const thread of relevantThreads) {
      // participants is JSONB - parse it
      if (thread.participants) {
        let participants: string[] = [];

        try {
          // participants is already parsed from jsonb
          if (Array.isArray(thread.participants)) {
            participants = thread.participants as string[];
          } else if (typeof thread.participants === "string") {
            participants = JSON.parse(thread.participants);
          }
        } catch (e) {
          continue;
        }

        for (const participant of participants) {
          if (!participant || typeof participant !== "string") continue;

          // Parse email from participant
          const emailMatch =
            participant.match(/([^<]+)<([^>]+)>/) ||
            participant.match(/^([^@]+@[^@]+\.[^@]+)$/);

          if (emailMatch) {
            const name = emailMatch[1] ? emailMatch[1].trim() : null;
            const email = emailMatch[2]
              ? emailMatch[2].trim()
              : emailMatch[1].trim();

            // Skip if it's the user's own email
            if (email.toLowerCase().includes("rendetalje.dk")) continue;

            collectedLeads.push({
              source: "email",
              name: name || email.split("@")[0],
              email,
              phone: null,
              company: email.split("@")[1] || null,
              rawData: {
                threadSubject: thread.subject,
                threadDate: thread.lastMessageAt,
                participant,
              },
            });
          }
        }
      }
    }

    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "email").length} leads from emails`
    );
  } catch (error) {
    console.log("⚠️  Email collection failed:", error);
  }

  // Step 3: Collect from Billy
  console.log("\n💰 Step 3: Collecting from Billy Customer Database...");
  console.log("-".repeat(60));

  try {
    const billyCustomers = await getCustomers();

    console.log(`✅ Found ${billyCustomers.length} Billy customers`);

    for (const customer of billyCustomers) {
      // Extract contact info
      const contactName =
        customer.contacts?.[0]?.name || customer.name || "Unknown";
      const contactEmail = customer.contacts?.[0]?.email || null;
      const contactPhone =
        customer.contacts?.[0]?.phone || customer.phone || null;

      collectedLeads.push({
        source: "billy",
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        company: customer.name || null,
        rawData: {
          billyId: customer.id,
          organizationNo: customer.registrationNo,
          customerData: customer,
        },
      });
    }

    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "billy").length} leads from Billy`
    );
  } catch (error) {
    console.log("⚠️  Billy collection failed:", error);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 COLLECTION SUMMARY");
  console.log("=".repeat(60));
  console.log(`\nTotal Leads Collected: ${collectedLeads.length}`);
  console.log(
    `• From Calendar: ${collectedLeads.filter(l => l.source === "calendar").length}`
  );
  console.log(
    `• From Email: ${collectedLeads.filter(l => l.source === "email").length}`
  );
  console.log(
    `• From Billy: ${collectedLeads.filter(l => l.source === "billy").length}`
  );

  // Deduplicate by email
  const uniqueLeads = new Map<string, CollectedLead>();
  for (const lead of collectedLeads) {
    const key = lead.email?.toLowerCase() || lead.name.toLowerCase();
    if (!uniqueLeads.has(key)) {
      uniqueLeads.set(key, lead);
    }
  }

  console.log(`\nUnique Leads (by email/name): ${uniqueLeads.size}`);

  // Save to file
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/real-leads.json"
  );
  const output = {
    metadata: {
      collected: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalLeads: collectedLeads.length,
      uniqueLeads: uniqueLeads.size,
      sources: {
        calendar: collectedLeads.filter(l => l.source === "calendar").length,
        email: collectedLeads.filter(l => l.source === "email").length,
        billy: collectedLeads.filter(l => l.source === "billy").length,
      },
    },
    leads: Array.from(uniqueLeads.values()),
  };

  try {
    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Saved to: ${outputPath}`);
  } catch (error) {
    console.log("\n⚠️  Failed to save file:", error);
  }

  // Sample output
  console.log("\n📋 Sample Leads (first 5):");
  console.log("-".repeat(60));
  Array.from(uniqueLeads.values())
    .slice(0, 5)
    .forEach((lead, i) => {
      console.log(`\n${i + 1}. ${lead.name}`);
      console.log(`   Email: ${lead.email || "N/A"}`);
      console.log(`   Source: ${lead.source}`);
      console.log(`   Company: ${lead.company || "N/A"}`);
    });

  console.log("\n✅ Data collection complete!");
  console.log("\n💡 Next Steps:");
  console.log(
    "   1. Review: server/integrations/chromadb/test-data/real-leads.json"
  );
  console.log(
    "   2. Run threshold tuning: npx tsx server/integrations/chromadb/scripts/tune-threshold.ts"
  );
  console.log("   3. Test duplicate detection accuracy");

  process.exit(0);
}

// Run collection
collectRealData().catch(error => {
  console.error("\n❌ Collection failed:", error);
  process.exit(1);
});
