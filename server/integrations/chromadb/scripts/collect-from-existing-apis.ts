/**
 * Collect Data Using Existing Working APIs
 *
 * Uses your existing working Google API functions (already have proper auth!)
 * No OAuth setup needed - just works!
 *
 * Run with: npx tsx server/integrations/chromadb/scripts/collect-from-existing-apis.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
config({ path: resolve(process.cwd(), ".env.dev") });

import {
  listCalendarEvents,
  searchGmailThreads,
  getGmailThread,
} from "../../../google-api";

console.log("📊 Collecting Data from Google APIs (Using Existing Functions)\n");
console.log("=".repeat(60));

interface CollectedLead {
  source: "calendar" | "gmail";
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  rawData: any;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function collectFromExistingAPIs() {
  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  console.log("\n📋 Collection Parameters:");
  console.log("-".repeat(60));
  console.log(
    `Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );
  console.log(`Duration: 6 months (July - December 2025)`);

  const collectedLeads: CollectedLead[] = [];

  // Step 1: Google Calendar
  console.log("\n📅 Step 1: Google Calendar");
  console.log("-".repeat(60));

  try {
    console.log("Fetching calendar events...");

    const events = await listCalendarEvents({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 500,
    });

    console.log(`✅ Found ${events.length} calendar events`);

    for (const event of events) {
      // Extract from attendees
      if (event.attendees && event.attendees.length > 0) {
        for (const attendee of event.attendees) {
          if (attendee.email && !attendee.email.includes("rendetalje.dk")) {
            collectedLeads.push({
              source: "calendar",
              name: attendee.displayName || attendee.email.split("@")[0],
              email: attendee.email,
              phone: null,
              company: attendee.email.split("@")[1] || null,
              rawData: {
                eventTitle: event.summary,
                eventStart: event.start,
                eventLocation: event.location,
                attendeeStatus: attendee.responseStatus,
              },
            });
          }
        }
      }

      // Extract names from event titles
      const summary = event.summary || "";
      const namePatterns = [
        /(?:møde med|meeting with|aftale med)\s+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/gi,
        /([A-ZÆØÅ][a-zæøå]+\s+[A-ZÆØÅ][a-zæøå]+)/g,
      ];

      for (const pattern of namePatterns) {
        const matches = summary.matchAll(pattern);
        for (const match of matches) {
          const name = (match[1] || match[0]).trim();
          if (name && name.length > 3 && name.split(" ").length >= 2) {
            collectedLeads.push({
              source: "calendar",
              name,
              email: null,
              phone: null,
              company: null,
              rawData: {
                eventTitle: summary,
                eventStart: event.start,
                eventLocation: event.location,
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
    console.log("❌ Calendar collection failed:", error);
  }

  // Step 2: Gmail
  console.log("\n📧 Step 2: Gmail");
  console.log("-".repeat(60));

  try {
    console.log("Searching Gmail threads...");

    // Build query for date range
    const afterTimestamp = Math.floor(startDate.getTime() / 1000);
    const beforeTimestamp = Math.floor(endDate.getTime() / 1000);
    const query = `after:${afterTimestamp} before:${beforeTimestamp}`;

    const threads = await searchGmailThreads({
      query,
      maxResults: 500,
    });

    console.log(`✅ Found ${threads.length} Gmail threads`);
    console.log("Extracting contact info...");

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];

      // Rate limiting - small delay between requests
      if (i > 0 && i % 10 === 0) {
        await sleep(200); // 200ms = 5 requests/second
        console.log(`   Progress: ${i}/${threads.length} threads processed`);
      }

      try {
        const threadDetail = await getGmailThread(thread.id);

        if (!threadDetail) {
          continue;
        }

        // Gmail thread has 'from' and 'subject' directly on thread level
        const threadData = threadDetail as any;

        // Extract from "From" field
        if (threadData.from) {
          const emailMatch = threadData.from.match(
            /([^<]+)?<?([^>@]+@[^>]+)>?/
          );
          if (emailMatch) {
            const name = emailMatch[1]?.trim() || emailMatch[2].split("@")[0];
            const email = emailMatch[2].trim();

            if (
              !email.includes("rendetalje.dk") &&
              !email.includes("aliexpress") &&
              !email.includes("noreply")
            ) {
              collectedLeads.push({
                source: "gmail",
                name,
                email,
                phone: null,
                company: email.split("@")[1] || null,
                rawData: {
                  threadId: thread.id,
                  subject: threadData.subject,
                  snippet: threadData.snippet || thread.snippet,
                },
              });
            }
          }
        }

        // Also check messages array if available
        if (threadData.messages && Array.isArray(threadData.messages)) {
          for (const message of threadData.messages) {
            if (message.from) {
              const emailMatch = message.from.match(
                /([^<]+)?<?([^>@]+@[^>]+)>?/
              );
              if (emailMatch) {
                const name =
                  emailMatch[1]?.trim() || emailMatch[2].split("@")[0];
                const email = emailMatch[2].trim();

                if (
                  !email.includes("rendetalje.dk") &&
                  !email.includes("aliexpress") &&
                  !email.includes("noreply")
                ) {
                  collectedLeads.push({
                    source: "gmail",
                    name,
                    email,
                    phone: null,
                    company: email.split("@")[1] || null,
                    rawData: {
                      threadId: thread.id,
                      subject: message.subject || threadData.subject,
                      snippet: threadData.snippet || thread.snippet,
                      date: message.date,
                    },
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Failed to get thread ${thread.id}:`, error);
      }
    }

    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "gmail").length} leads from Gmail`
    );
  } catch (error) {
    console.log("❌ Gmail collection failed:", error);
  }

  // Deduplicate
  console.log("\n🔄 Deduplicating leads...");
  const uniqueLeads = new Map<string, CollectedLead>();

  for (const lead of collectedLeads) {
    const key = lead.email?.toLowerCase() || lead.name.toLowerCase();
    if (!uniqueLeads.has(key)) {
      uniqueLeads.set(key, lead);
    }
  }

  console.log(
    `✅ ${collectedLeads.length} total → ${uniqueLeads.size} unique leads`
  );

  // Save
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/google-leads.json"
  );
  const output = {
    metadata: {
      collected: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      sources: {
        calendar: collectedLeads.filter(l => l.source === "calendar").length,
        gmail: collectedLeads.filter(l => l.source === "gmail").length,
      },
      totalLeads: collectedLeads.length,
      uniqueLeads: uniqueLeads.size,
    },
    leads: Array.from(uniqueLeads.values()),
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 COLLECTION SUMMARY");
  console.log("=".repeat(60));
  console.log(`\nTotal Leads: ${collectedLeads.length}`);
  console.log(`Unique Leads: ${uniqueLeads.size}`);
  console.log(
    `• From Calendar: ${collectedLeads.filter(l => l.source === "calendar").length}`
  );
  console.log(
    `• From Gmail: ${collectedLeads.filter(l => l.source === "gmail").length}`
  );

  // Sample
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

  console.log("\n✅ Collection complete!");
  console.log("\n💡 Next Steps:");
  console.log("   1. Combine with Billy data");
  console.log("   2. Run threshold tuning with all real data");

  process.exit(0);
}

// Run
collectFromExistingAPIs().catch(error => {
  console.error("\n❌ Collection failed:", error);
  process.exit(1);
});
