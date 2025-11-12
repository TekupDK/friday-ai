/**
 * V4.3.2 Script 1: Collect & Link (Calendar Focused)
 *
 * V4.3.1 PLUS enhanced calendar parsing:
 * - Targeted Gmail search (536 threads)
 * - Calendar event filtering by calendarId
 * - Parse event description: address, m², hours, price, profit
 * - Extract customer name from title (🏠/🏢 Name pattern)
 * - Better calendar→gmail matching
 *
 * Time Window: July 1 - November 30, 2025
 *
 * Output: raw-leads-v4_3_2.json (higher calendar match rate)
 *
 * Run: npx tsx server/integrations/chromadb/scripts/1-collect-and-link-v4_3_2.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
config({ path: resolve(process.cwd(), ".env.dev") });

import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { V4_3_Lead, GmailData, CalendarData, BillyData } from "../v4_3-types";
import { V4_3_CONFIG, classifyLeadSource, isSpam } from "../v4_3-config";

console.log("📦 V4.3.2 Script 1: Collect & Link (Calendar Focused)\n");
console.log("=".repeat(70));
console.log(
  `Time Window: ${V4_3_CONFIG.timeWindow.start} → ${V4_3_CONFIG.timeWindow.end}`
);
console.log("=".repeat(70));

// ============================================================================
// TYPES
// ============================================================================

interface RawGmailThread {
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  labels: string[];
  bodySnippet: string;
  // Parsed from body
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  propertySize?: number;
  leadSource?: string;
}

interface RawCalendarEvent {
  eventId: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  attendees: Array<{ email: string; displayName?: string }>;
  location?: string;
  // V4.3.2: RenOS calendar format parsing
  customerName?: string; // Parsed from title: "🏠 RenOS Booking - Name"
  customerEmail?: string; // Parsed: 📧 Email: test@example.com
  customerPhone?: string; // Parsed: 📞 Telefon: +45 12345678
  serviceType?: string; // Parsed: 🏠 Service: Test Service
  price?: number; // Parsed: 💰 Pris: 500 DKK
  // Fields not in RenOS format (for future use)
  propertySize?: number;
  calendarHours?: number;
  actualHours?: number;
  profit?: number;
}

interface RawBillyInvoice {
  invoiceId: string;
  invoiceNo: string | null;
  state: string;
  isPaid: boolean;
  balance: number;
  entryDate: string;
  dueDate: string | null;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  grossAmount: number;
  lines: Array<{
    quantity: number;
    productId: string;
    description: string;
  }>;
}

// ============================================================================
// GOOGLE AUTH
// ============================================================================

async function getGoogleAuth(): Promise<JWT> {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const impersonatedUser =
    process.env.GOOGLE_IMPERSONATED_USER || "info@rendetalje.dk";

  if (!serviceAccountKey) {
    throw new Error("❌ GOOGLE_SERVICE_ACCOUNT_KEY not set in .env.dev");
  }

  console.log("🔐 Authenticating with Google...");
  console.log(
    `   Service Account: ${JSON.parse(serviceAccountKey).client_email}`
  );
  console.log(`   Impersonating: ${impersonatedUser}\n`);

  const serviceAccount = JSON.parse(serviceAccountKey);

  const auth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    subject: impersonatedUser,
  });

  try {
    await auth.authorize();
    console.log("✅ Google OAuth authenticated\n");
  } catch (error: any) {
    console.error("\n❌ Google OAuth Failed:\n");
    console.error(error.message);
    console.error("\n📋 Troubleshooting:");
    console.error(
      "   1. Verify domain-wide delegation is enabled for this service account"
    );
    console.error(
      "   2. Check that these scopes are authorized in Google Workspace Admin:"
    );
    console.error("      - https://www.googleapis.com/auth/calendar.readonly");
    console.error("      - https://www.googleapis.com/auth/gmail.readonly");
    console.error(`   3. Service Account: ${serviceAccount.client_email}`);
    console.error(`   4. Domain: ${impersonatedUser.split("@")[1]}\n`);
    throw error;
  }

  return auth;
}

// ============================================================================
// DATA COLLECTION
// ============================================================================

async function collectGmailThreads(auth: JWT): Promise<RawGmailThread[]> {
  console.log("📧 Collecting Gmail threads (targeted search)...");

  const gmail = google.gmail({ version: "v1", auth });
  const threads: RawGmailThread[] = [];

  const startDate = new Date(V4_3_CONFIG.timeWindow.start);
  const endDate = new Date(V4_3_CONFIG.timeWindow.end);

  // V4.3.1: Targeted lead search with multiple filters
  const queryParts = [
    // Date range
    `after:${Math.floor(startDate.getTime() / 1000)}`,
    `before:${Math.floor(endDate.getTime() / 1000)}`,

    // From: Known lead sources
    `(from:leadpoint OR from:leadmail OR from:adhelp OR from:system@leadpoint.dk OR from:kontakt@leadmail.no OR from:sp@adhelp.dk OR from:mw@adhelp.dk)`,

    // Subject: Lead identification patterns
    `(subject:"fra Rengøring.nu" OR subject:"via Rengøring Aarhus" OR subject:"Formular via" OR subject:"Email via" OR subject:"Opkald via")`,

    // To: Received by lead-handling addresses
    `to:(info@rendetalje.dk OR system@leadpoint.dk OR kontakt@leadmail.no OR sp@adhelp.dk OR mw@adhelp.dk)`,
  ];

  const query = queryParts.join(" ");

  let pageToken: string | undefined;
  let totalThreads = 0;

  do {
    const response = await gmail.users.threads.list({
      userId: "me",
      q: query,
      maxResults: 100,
      pageToken,
    });

    const threadList = response.data.threads || [];
    totalThreads += threadList.length;

    console.log(
      `   Fetched ${threadList.length} threads (total: ${totalThreads})`
    );

    // Fetch full thread details
    for (const thread of threadList) {
      try {
        const detail = await gmail.users.threads.get({
          userId: "me",
          id: thread.id!,
          format: "full",
        });

        const messages = detail.data.messages || [];
        if (messages.length === 0) continue;

        const firstMessage = messages[0];
        const headers = firstMessage.payload?.headers || [];

        const fromHeader =
          headers.find(h => h.name?.toLowerCase() === "from")?.value || "";
        const toHeader =
          headers.find(h => h.name?.toLowerCase() === "to")?.value || "";
        const subjectHeader =
          headers.find(h => h.name?.toLowerCase() === "subject")?.value || "";
        const dateHeader =
          headers.find(h => h.name?.toLowerCase() === "date")?.value || "";

        // Get labels
        const labelIds = firstMessage.labelIds || [];

        // Get body snippet
        const snippet = firstMessage.snippet || "";

        // Get full body text (for parsing customer email/phone)
        let bodyText = snippet;
        if (firstMessage.payload?.parts) {
          for (const part of firstMessage.payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
              bodyText = Buffer.from(part.body.data, "base64").toString(
                "utf-8"
              );
              break;
            }
          }
        } else if (firstMessage.payload?.body?.data) {
          bodyText = Buffer.from(
            firstMessage.payload.body.data,
            "base64"
          ).toString("utf-8");
        }

        // Parse customer email from body (for leadmails)
        const emailInBodyMatch = bodyText.match(
          /E-?mail:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
        );
        const customerEmailFromBody = emailInBodyMatch
          ? emailInBodyMatch[1].toLowerCase().trim()
          : null;

        // Parse customer phone from body
        const phoneInBodyMatch =
          bodyText.match(/Tlf\.?:?\s*([\d\s+()-]{8,})/i) ||
          bodyText.match(/Telefon:?\s*([\d\s+()-]{8,})/i) ||
          bodyText.match(/Mobil:?\s*([\d\s+()-]{8,})/i);
        const customerPhoneFromBody = phoneInBodyMatch
          ? phoneInBodyMatch[1].trim()
          : null;

        // Parse customer name from body
        const nameInBodyMatch = bodyText.match(/Navn:?\s*([^\n\r]+)/i);
        const customerNameFromBody = nameInBodyMatch
          ? nameInBodyMatch[1].trim()
          : null;

        // Parse address from body
        const addressInBodyMatch = bodyText.match(/Adresse:?\s*([^\n\r]+)/i);
        const addressFromBody = addressInBodyMatch
          ? addressInBodyMatch[1].trim()
          : null;

        // Parse property size from body
        const sizeInBodyMatch = bodyText.match(/(\d+)\s*m[²2]/i);
        const propertySizeFromBody = sizeInBodyMatch
          ? parseInt(sizeInBodyMatch[1])
          : undefined;

        // Parse email addresses
        const toEmails = toHeader
          .split(",")
          .map(e => {
            const match = e.match(/<?([^>@]+@[^>]+)>?/);
            return match ? match[1].trim() : "";
          })
          .filter(Boolean);

        threads.push({
          threadId: thread.id!,
          subject: subjectHeader,
          from: fromHeader,
          to: toEmails,
          date: dateHeader,
          labels: labelIds,
          bodySnippet: snippet,
          customerEmail: customerEmailFromBody || undefined,
          customerPhone: customerPhoneFromBody || undefined,
          customerName: customerNameFromBody || undefined,
          address: addressFromBody || undefined,
          propertySize: propertySizeFromBody,
        });
      } catch (error) {
        console.log(`   ⚠️  Failed to fetch thread ${thread.id}`);
      }
    }

    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  console.log(`✅ Collected ${threads.length} Gmail threads\n`);
  return threads;
}

async function collectCalendarEvents(auth: JWT): Promise<RawCalendarEvent[]> {
  console.log("📅 Collecting Calendar events (enhanced parsing)...");

  const calendar = google.calendar({ version: "v3", auth });
  const events: RawCalendarEvent[] = [];

  // V4.3.2: Target specific calendar with lead bookings
  const calendarId =
    process.env.GOOGLE_CALENDAR_ID ||
    "c_39570a852bf141658572fa37bb229c7246564a6cca47560bc66a4f9e4fec67ff@group.calendar.google.com";

  const startDate = new Date(V4_3_CONFIG.timeWindow.start);
  const endDate = new Date(V4_3_CONFIG.timeWindow.end);

  let pageToken: string | undefined;
  let totalEvents = 0;

  do {
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
      pageToken,
    });

    const eventList = response.data.items || [];
    totalEvents += eventList.length;

    console.log(
      `   Fetched ${eventList.length} events (total: ${totalEvents})`
    );

    for (const event of eventList) {
      // Filter spam/test events
      const summary = event.summary || "";
      if (isSpam(summary)) {
        continue;
      }

      // V4.3.2: Filter by emoji patterns (🏠 = private, 🏢 = business)
      const hasLeadEmoji = summary.match(/[🏠🏢]/);
      if (!hasLeadEmoji) {
        continue; // Skip events without lead emoji markers
      }

      const startTime = event.start?.dateTime || event.start?.date || "";
      const endTime = event.end?.dateTime || event.end?.date || "";

      // Calculate duration in minutes
      let duration = 0;
      if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }

      // V4.3.2: Parse ACTUAL RenOS calendar format
      const description = event.description || "";

      // Extract customer name from title: "🏠 RenOS Booking - Test Kunde"
      const customerNameMatch = summary.match(
        /[🏠🏢]\s*RenOS Booking\s*-\s*(.+)$/i
      );
      const customerName = customerNameMatch
        ? customerNameMatch[1].trim()
        : undefined;

      // Parse email: 📧 Email: test@example.com
      const emailMatch = description.match(/📧\s*Email:\s*([^\n\r]+)/i);
      const customerEmail = emailMatch ? emailMatch[1].trim() : undefined;

      // Parse phone: 📞 Telefon: +45 12 34 56 78
      const phoneMatch = description.match(/📞\s*Telefon:\s*([^\n\r]+)/i);
      const customerPhone = phoneMatch ? phoneMatch[1].trim() : undefined;

      // Parse address: 📍 Adresse: Test Adresse
      const addressMatch = description.match(/📍\s*Adresse:\s*([^\n\r]+)/i);
      const address = addressMatch ? addressMatch[1].trim() : undefined;

      // Parse service type: 🏠 Service: Test Service
      const serviceMatch = description.match(/🏠\s*Service:\s*([^\n\r]+)/i);
      const serviceType = serviceMatch ? serviceMatch[1].trim() : undefined;

      // Parse price: 💰 Pris: 500 DKK
      const priceMatch = description.match(/💰\s*Pris:\s*([\d.,]+)\s*DKK/i);
      const price = priceMatch
        ? parseFloat(priceMatch[1].replace(".", "").replace(",", "."))
        : undefined;

      // Fields NOT in RenOS format (set to undefined)
      const propertySize = undefined; // Not in format
      const calendarHours = undefined; // Not in format
      const actualHours = undefined; // Not in format
      const profit = undefined; // Not in format

      events.push({
        eventId: event.id!,
        summary,
        description,
        startTime,
        endTime,
        duration,
        attendees: (event.attendees || []).map(a => ({
          email: a.email || "",
          displayName: a.displayName || undefined,
        })),
        location: event.location || address || undefined,
        // RenOS format parsed fields
        customerName, // From title: "🏠 RenOS Booking - Name"
        customerEmail, // From description: 📧 Email
        customerPhone, // From description: 📞 Telefon
        serviceType, // From description: 🏠 Service
        price, // From description: 💰 Pris
        // Fields not in RenOS format
        propertySize,
        calendarHours,
        actualHours,
        profit,
      });
    }

    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  console.log(
    `✅ Collected ${events.length} Calendar events (after spam filter)\n`
  );
  return events;
}

async function collectBillyInvoices(): Promise<RawBillyInvoice[]> {
  console.log("💰 Collecting Billy invoices...");

  // Import Billy functions
  const billyModule = await import("../../../billy");
  const invoices = await billyModule.getInvoices();
  const contacts = await billyModule.getCustomers();

  const startDate = new Date(V4_3_CONFIG.timeWindow.start);
  const endDate = new Date(V4_3_CONFIG.timeWindow.end);

  const filtered: RawBillyInvoice[] = [];

  for (const invoice of invoices) {
    const entryDate = new Date(invoice.entryDate);

    // Filter by date range
    if (entryDate < startDate || entryDate > endDate) {
      continue;
    }

    // Only include approved/sent/paid invoices
    if (!["approved", "sent", "paid"].includes(invoice.state)) {
      continue;
    }

    // Find contact details
    const contact = contacts.find((c: any) => c.id === invoice.contactId);

    // Get invoice lines (if available)
    let lines: any[] = [];
    if (invoice.lines && invoice.lines.length > 0) {
      lines = invoice.lines.map(line => ({
        quantity: line.quantity,
        productId: line.productId || "",
        description: line.description,
      }));
    }

    filtered.push({
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      state: invoice.state,
      isPaid: invoice.isPaid,
      balance: invoice.balance,
      entryDate: invoice.entryDate,
      dueDate: invoice.dueDate || null,
      contactId: invoice.contactId,
      contactName: contact?.name || "",
      contactEmail: contact?.email || "",
      contactPhone: contact?.phone || "",
      grossAmount: invoice.grossAmount,
      lines,
    });
  }

  console.log(
    `✅ Collected ${filtered.length} Billy invoices (July-Nov 2025)\n`
  );
  return filtered;
}

// ============================================================================
// LINKING LOGIC
// ============================================================================

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Link Gmail, Calendar, and Billy data into unified leads
 */
function linkLeads(
  gmailThreads: RawGmailThread[],
  calendarEvents: RawCalendarEvent[],
  billyInvoices: RawBillyInvoice[]
): V4_3_Lead[] {
  console.log("🔗 Linking data sources...");

  const leads: V4_3_Lead[] = [];
  const linkedCalendarIds = new Set<string>();
  const linkedBillyIds = new Set<string>();

  // Strategy: Start with Gmail threads (all leads come from email)
  for (const gmailThread of gmailThreads) {
    // Use customer info parsed from Gmail body (for leadmails)
    // Fallback to "from" header for direct emails
    let customerEmail = "";
    if (gmailThread.customerEmail) {
      customerEmail = normalizeEmail(gmailThread.customerEmail);
    } else {
      const emailMatch = gmailThread.from.match(/<?([^>@]+@[^>]+)>?/);
      customerEmail = emailMatch ? normalizeEmail(emailMatch[1]) : "";
    }

    let customerName = "";
    if (gmailThread.customerName) {
      customerName = gmailThread.customerName;
    } else {
      const nameMatch = gmailThread.from.match(/^([^<]+)</);
      customerName = nameMatch
        ? nameMatch[1].trim()
        : customerEmail.split("@")[0];
    }

    const customerPhone: string | null = gmailThread.customerPhone || null;

    // Try to find matching Calendar event
    let matchedCalendar: RawCalendarEvent | null = null;
    for (const event of calendarEvents) {
      if (linkedCalendarIds.has(event.eventId)) continue;

      // Match by email
      const hasMatchingAttendee = event.attendees.some(
        a => normalizeEmail(a.email) === customerEmail
      );

      if (hasMatchingAttendee) {
        matchedCalendar = event;
        linkedCalendarIds.add(event.eventId);
        break;
      }

      // Match by name similarity (fuzzy)
      if (normalizeName(event.summary).includes(normalizeName(customerName))) {
        matchedCalendar = event;
        linkedCalendarIds.add(event.eventId);
        break;
      }
    }

    // Try to find matching Billy invoice
    let matchedBilly: RawBillyInvoice | null = null;
    let bestMatchScore = 0;

    for (const invoice of billyInvoices) {
      if (linkedBillyIds.has(invoice.invoiceId)) continue;

      let matchScore = 0;

      // Match 1: Email (exact match - rare for leadmails)
      if (
        invoice.contactEmail &&
        normalizeEmail(invoice.contactEmail) === customerEmail
      ) {
        matchScore += 100; // Strong match
      }

      // Match 2: Name similarity (fuzzy)
      const invoiceName = normalizeName(invoice.contactName);
      const leadName = normalizeName(customerName);

      if (invoiceName && leadName) {
        // Check if names overlap significantly
        const nameWords1 = invoiceName.split(" ");
        const nameWords2 = leadName.split(" ");

        const commonWords = nameWords1.filter(
          w =>
            w.length > 2 &&
            nameWords2.some(w2 => w2.includes(w) || w.includes(w2))
        );

        if (commonWords.length >= 2) {
          matchScore += 50; // Good name match
        } else if (commonWords.length === 1) {
          matchScore += 20; // Weak name match
        }
      }

      // Match 3: Phone number (if available in both)
      if (invoice.contactPhone && customerPhone) {
        const normalizedInvoicePhone = normalizePhone(invoice.contactPhone);
        const normalizedCustomerPhone = normalizePhone(customerPhone);
        if (normalizedInvoicePhone === normalizedCustomerPhone) {
          matchScore += 80; // Strong match
        }
      }

      // Match 4: Date proximity (invoice date should be after Gmail date)
      const gmailDate = new Date(gmailThread.date);
      const invoiceDate = new Date(invoice.entryDate);
      const daysDiff = Math.abs(
        (invoiceDate.getTime() - gmailDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 30 && invoiceDate >= gmailDate) {
        matchScore += 30; // Recent invoice after lead
      } else if (daysDiff <= 60) {
        matchScore += 10; // Somewhat recent
      }

      // Keep track of best match
      if (matchScore > bestMatchScore && matchScore >= 40) {
        // Threshold: 40 points minimum
        bestMatchScore = matchScore;
        matchedBilly = invoice;
      }
    }

    // Link the best Billy match if found
    if (matchedBilly) {
      linkedBillyIds.add(matchedBilly.invoiceId);
    }

    // Classify lead source
    const leadSource = classifyLeadSource(
      gmailThread.from,
      gmailThread.subject
    );

    // Create lead object
    const lead: V4_3_Lead = {
      id: `LEAD_${gmailThread.threadId}`,
      customerName,
      customerEmail,
      customerPhone: null, // TODO: Extract from Gmail body

      // Gmail data
      gmail: {
        threadId: gmailThread.threadId,
        subject: gmailThread.subject,
        from: gmailThread.from,
        to: gmailThread.to,
        date: gmailThread.date,
        labels: gmailThread.labels,
        estimatedHours: 0, // Will be calculated later
        propertySize: 0,
        quotedPrice: 0,
        leadSource,
        isLeadmail: leadSource !== "Direct",
      },

      // Calendar data (if matched)
      calendar: matchedCalendar
        ? {
            eventId: matchedCalendar.eventId,
            summary: matchedCalendar.summary,
            description: matchedCalendar.description,
            startTime: matchedCalendar.startTime,
            endTime: matchedCalendar.endTime,
            duration: matchedCalendar.duration,
            numberOfPeople: 1, // Default, will refine later
          }
        : null,

      // Billy data (if matched)
      billy: matchedBilly
        ? {
            invoiceId: matchedBilly.invoiceId,
            invoiceNo: matchedBilly.invoiceNo,
            state: matchedBilly.state,
            isPaid: matchedBilly.isPaid,
            balance: matchedBilly.balance,
            entryDate: matchedBilly.entryDate,
            dueDate: matchedBilly.dueDate,
            contactId: matchedBilly.contactId,
            invoicedHours: matchedBilly.lines.reduce(
              (sum, l) => sum + l.quantity,
              0
            ),
            invoicedPrice: matchedBilly.grossAmount,
            productId: matchedBilly.lines[0]?.productId || "",
            description: matchedBilly.lines.map(l => l.description).join("; "),
          }
        : null,

      // Placeholders (will be calculated in script 2)
      calculated: {
        property: {
          propertySize: 0,
          propertySizeSource: "unknown",
          serviceType: "",
          serviceTypeName: "",
        },
        financial: {
          quotedPrice: 0,
          invoicedPrice: 0,
          paidAmount: 0,
          priceVariance: 0,
          leadCost: 0,
          laborCost: 0,
          grossProfit: 0,
          netProfit: 0,
          grossMargin: 0,
          netMargin: 0,
        },
        time: {
          estimatedHours: 0,
          actualHours: 0,
          calendarWorkHours: 0,
          timeVariance: 0,
          timeAccuracy: 0,
          overtimeFlag: false,
        },
        timeline: {
          leadReceivedDate: null,
          firstReplyDate: null,
          bookingConfirmedDate: null,
          invoiceSentDate: null,
          paidDate: null,
          daysToBooking: null,
          daysToPayment: null,
        },
        quality: {
          hasGmail: true,
          hasCalendar: matchedCalendar !== null,
          hasBilly: matchedBilly !== null,
          dataCompleteness: 0,
          linkingConfidence: "high",
        },
      },

      pipeline: {
        stage: "inbox",
        substage: "new",
        status: "new",
      },

      customer: {
        isRepeatCustomer: false,
        totalBookings: 0,
        lifetimeValue: 0,
        averageBookingValue: 0,
        firstBookingDate: null,
        lastBookingDate: null,
        daysBetweenBookings: null,
      },

      quoteRecommendation: {
        estimatedHours: 0,
        estimatedPrice: 0,
        basis: "default",
        confidence: "low",
        breakdown: {
          hours: 0,
          hourlyRate: 349,
          subtotal: 0,
        },
      },
    };

    leads.push(lead);
  }

  console.log(`✅ Linked ${leads.length} leads`);
  console.log(`   • With Calendar: ${leads.filter(l => l.calendar).length}`);
  console.log(`   • With Billy: ${leads.filter(l => l.billy).length}`);
  console.log(
    `   • Gmail only: ${leads.filter(l => !l.calendar && !l.billy).length}\n`
  );

  return leads;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    // Authenticate
    const auth = await getGoogleAuth();

    // Collect data
    const gmailThreads = await collectGmailThreads(auth);
    const calendarEvents = await collectCalendarEvents(auth);
    const billyInvoices = await collectBillyInvoices();

    // Link data
    const leads = linkLeads(gmailThreads, calendarEvents, billyInvoices);

    // Save raw output
    const outputPath = resolve(
      process.cwd(),
      "server/integrations/chromadb/test-data/raw-leads-v4_3_2.json"
    );

    const output = {
      metadata: {
        version: "4.3.2",
        stage: "raw",
        generated: new Date().toISOString(),
        timeWindow: V4_3_CONFIG.timeWindow,
        counts: {
          total: leads.length,
          withGmail: leads.length,
          withCalendar: leads.filter(l => l.calendar).length,
          withBilly: leads.filter(l => l.billy).length,
        },
      },
      leads,
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log("=".repeat(70));
    console.log("✅ COLLECTION COMPLETE");
    console.log("=".repeat(70));
    console.log(`\nOutput: ${outputPath}`);
    console.log(`\nTotal Leads: ${leads.length}`);
    console.log(`• With Gmail: ${leads.length} (100%)`);
    console.log(
      `• With Calendar: ${leads.filter(l => l.calendar).length} (${Math.round((leads.filter(l => l.calendar).length / leads.length) * 100)}%)`
    );
    console.log(
      `• With Billy: ${leads.filter(l => l.billy).length} (${Math.round((leads.filter(l => l.billy).length / leads.length) * 100)}%)`
    );
    console.log("\n💡 Next Step: Run script 2 to calculate metrics");
    console.log(
      "   npx tsx server/integrations/chromadb/scripts/2-calculate-metrics-v4_3.ts"
    );
    console.log(
      "\n📌 Note: V4.3.2 adds calendar parsing (🏠🏢 emoji filter + description fields)\n"
    );
  } catch (error) {
    console.error("\n❌ Collection failed:", error);
    process.exit(1);
  }
}

main();
