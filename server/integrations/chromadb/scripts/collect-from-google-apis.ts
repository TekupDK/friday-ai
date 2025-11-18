/**
 * Collect Data Directly from Google APIs
 *
 * Fetches data directly from Google Calendar and Gmail APIs with smart rate limiting
 *
 * Features:
 * - Direct API access (no database dependency)
 * - Smart rate limiting (respects Google quotas)
 * - Exponential backoff on errors
 * - Batch requests where possible
 * - Progress tracking
 * - Data caching
 *
 * Run with: npx tsx server/integrations/chromadb/scripts/collect-from-google-apis.ts
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env.dev") });

import { JWT } from "google-auth-library";
import { google } from "googleapis";

console.log("📊 Collecting Data from Google APIs\n");
console.log("=".repeat(60));

interface CollectedLead {
  source: "calendar" | "gmail";
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  rawData: any;
}

// Rate limiting configuration
const RATE_LIMIT = {
  calendar: {
    requestsPerSecond: 10, // Google Calendar: 1000 req/100s = 10/s safe
    batchSize: 100,
  },
  gmail: {
    requestsPerSecond: 5, // Gmail: 250 req/100s = 2.5/s, we use 5/s with backoff
    batchSize: 100,
  },
};

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff helper
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      // Check for rate limit errors
      if (error.code === 429 || error.message?.includes("rate limit")) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`   ⚠️  Rate limit hit, waiting ${delay}ms...`);
        await sleep(delay);
      } else if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`   ⚠️  Connection error, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error; // Don't retry on other errors
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// Initialize Google Auth - use existing working setup
async function getGoogleAuth() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const impersonatedUser =
    process.env.GOOGLE_IMPERSONATED_USER || "info@rendetalje.dk";

  if (!serviceAccountKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set in environment");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }

  const auth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    subject: impersonatedUser,
  });

  // Test auth
  try {
    await auth.authorize();
    console.log("✅ Google OAuth successful");
  } catch (error: any) {
    console.error("❌ Google OAuth failed:", error.message);
    throw new Error(
      "Google authentication failed. Check service account has domain-wide delegation enabled."
    );
  }

  return auth;
}

async function collectFromGoogleAPIs() {
  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  console.log("\n📋 Collection Parameters:");
  console.log("-".repeat(60));
  console.log(
    `Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );
  console.log(`Duration: 6 months (July - December 2025)`);
  console.log(
    `Impersonated User: ${process.env.GOOGLE_IMPERSONATED_USER || "info@rendetalje.dk"}`
  );

  const collectedLeads: CollectedLead[] = [];

  // Initialize Auth
  console.log("\n🔐 Authenticating with Google...");
  const auth = await getGoogleAuth();

  // Step 1: Collect from Google Calendar
  console.log("\n📅 Step 1: Google Calendar API");
  console.log("-".repeat(60));

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const calendarId =
      process.env.GOOGLE_CALENDAR_ID ||
      "c_39570a852bf141658572fa37bb229c7246564a6cca47560bc66a4f9e4fec67ff@group.calendar.google.com";

    console.log(`Calendar ID: ${calendarId}`);
    console.log("Fetching events...");

    let pageToken: string | undefined;
    let totalEvents = 0;
    let requestCount = 0;

    do {
      // Rate limiting - wait between requests
      if (requestCount > 0) {
        await sleep(1000 / RATE_LIMIT.calendar.requestsPerSecond);
      }

      const response = await withRetry(async () => {
        return calendar.events.list({
          calendarId,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          maxResults: RATE_LIMIT.calendar.batchSize,
          singleEvents: true,
          orderBy: "startTime",
          pageToken,
        });
      });

      requestCount++;
      const events = response.data.items || [];
      totalEvents += events.length;

      console.log(
        `   Fetched ${events.length} events (total: ${totalEvents}, requests: ${requestCount})`
      );

      // Extract leads from events
      for (const event of events) {
        // Extract from attendees
        if (event.attendees && event.attendees.length > 0) {
          for (const attendee of event.attendees) {
            if (attendee.email && !attendee.email.includes("rendetalje.dk")) {
              collectedLeads.push({
                source: "calendar",
                name:
                  attendee.displayName ||
                  attendee.email.split("@")[0] ||
                  "Unknown",
                email: attendee.email,
                phone: null,
                company: attendee.email.split("@")[1] || null,
                rawData: {
                  eventTitle: event.summary,
                  eventStart: event.start?.dateTime || event.start?.date,
                  eventLocation: event.location,
                  attendeeStatus: attendee.responseStatus,
                },
              });
            }
          }
        }

        // Extract from event description/summary
        const summary = event.summary || "";
        const description = event.description || "";

        // Try to extract names from text
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
                  eventStart: event.start?.dateTime || event.start?.date,
                  eventLocation: event.location,
                },
              });
            }
          }
        }
      }

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    console.log(`✅ Collected ${totalEvents} calendar events`);
    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "calendar").length} leads from calendar`
    );
  } catch (error) {
    console.log("❌ Calendar collection failed:", error);
  }

  // Step 2: Collect from Gmail
  console.log("\n📧 Step 2: Gmail API");
  console.log("-".repeat(60));

  try {
    const gmail = google.gmail({ version: "v1", auth });

    console.log("Fetching email threads...");

    // Build query for date range
    const query = `after:${Math.floor(startDate.getTime() / 1000)} before:${Math.floor(endDate.getTime() / 1000)}`;

    let pageToken: string | undefined;
    let totalThreads = 0;
    let requestCount = 0;

    do {
      // Rate limiting
      if (requestCount > 0) {
        await sleep(1000 / RATE_LIMIT.gmail.requestsPerSecond);
      }

      // List threads
      const threadsResponse = await withRetry(async () => {
        return gmail.users.threads.list({
          userId: "me",
          q: query,
          maxResults: 100,
          pageToken,
        });
      });

      requestCount++;
      const threads = threadsResponse.data.threads || [];
      totalThreads += threads.length;

      console.log(
        `   Fetched ${threads.length} threads (total: ${totalThreads}, requests: ${requestCount})`
      );

      // Fetch thread details (batched with rate limiting)
      for (const thread of threads) {
        await sleep(1000 / RATE_LIMIT.gmail.requestsPerSecond);

        try {
          const threadDetail = await withRetry(async () => {
            return gmail.users.threads.get({
              userId: "me",
              id: thread.id!,
              format: "metadata",
              metadataHeaders: ["From", "To", "Subject"],
            });
          });

          requestCount++;

          // Extract emails from thread
          const messages = threadDetail.data.messages || [];

          for (const message of messages) {
            const headers = message.payload?.headers || [];

            const fromHeader = headers.find(
              h => h.name?.toLowerCase() === "from"
            );
            const toHeader = headers.find(h => h.name?.toLowerCase() === "to");
            const subjectHeader = headers.find(
              h => h.name?.toLowerCase() === "subject"
            );

            // Extract from "From" header
            if (fromHeader?.value) {
              const emailMatch = fromHeader.value.match(
                /([^<]+)?<?([^>@]+@[^>]+)>?/
              );
              if (emailMatch) {
                const name =
                  emailMatch[1]?.trim() || emailMatch[2].split("@")[0];
                const email = emailMatch[2].trim();

                if (!email.includes("rendetalje.dk")) {
                  collectedLeads.push({
                    source: "gmail",
                    name,
                    email,
                    phone: null,
                    company: email.split("@")[1] || null,
                    rawData: {
                      threadId: thread.id,
                      subject: subjectHeader?.value,
                      date: message.internalDate,
                    },
                  });
                }
              }
            }

            // Extract from "To" header
            if (toHeader?.value) {
              const toEmails = toHeader.value.split(",");
              for (const toEmail of toEmails) {
                const emailMatch = toEmail.match(/([^<]+)?<?([^>@]+@[^>]+)>?/);
                if (emailMatch) {
                  const name =
                    emailMatch[1]?.trim() || emailMatch[2].split("@")[0];
                  const email = emailMatch[2].trim();

                  if (!email.includes("rendetalje.dk")) {
                    collectedLeads.push({
                      source: "gmail",
                      name,
                      email,
                      phone: null,
                      company: email.split("@")[1] || null,
                      rawData: {
                        threadId: thread.id,
                        subject: subjectHeader?.value,
                        date: message.internalDate,
                      },
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Failed to fetch thread ${thread.id}:`, error);
        }

        // Progress update every 10 threads
        if (requestCount % 10 === 0) {
          console.log(`   Progress: ${requestCount} API requests made`);
        }
      }

      pageToken = threadsResponse.data.nextPageToken || undefined;

      // Don't overwhelm API - break after reasonable amount
      if (totalThreads >= 500) {
        console.log(`   ⚠️  Limiting to 500 threads to avoid quota exhaustion`);
        break;
      }
    } while (pageToken);

    console.log(`✅ Processed ${totalThreads} email threads`);
    console.log(
      `✅ Extracted ${collectedLeads.filter(l => l.source === "gmail").length} leads from Gmail`
    );
    console.log(`✅ Total API requests: ${requestCount}`);
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

  // Save to file
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/google-api-leads.json"
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
  console.log(
    "   1. Merge with Billy data: npx tsx server/integrations/chromadb/scripts/merge-all-data.ts"
  );
  console.log("   2. Run threshold tuning with combined data");

  process.exit(0);
}

// Run collection
collectFromGoogleAPIs().catch(error => {
  console.error("\n❌ Collection failed:", error);
  process.exit(1);
});
