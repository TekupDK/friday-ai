/**
 * V4.2 Enrichment - Add Actual Historical Data
 *
 * Sources:
 * 1. Billy Invoices (approved/sent/paid only, not drafts)
 *    - Actual hours worked (from line items)
 *    - Actual m² (from invoice description)
 *    - Service type (from product/description)
 *    - Actual price (from invoice amount)
 *
 * 2. Calendar History
 *    - Booked duration (end time - start time)
 *    - Number of attendees/resources
 *    - Calculated work hours (duration × attendees)
 *    - Booking confirmation date
 *
 * 3. Email Confirmations
 *    - "Opgaven er udført" emails
 *    - Actual vs estimated time comparisons
 *    - Customer feedback on timing
 *    - Completion confirmation
 *
 * Output: complete-leads-v4.2.json with enriched actuals
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("💰 V4.2 Enrichment - Adding Actual Historical Data\n");
console.log("=".repeat(70));

const v41Path = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.1.json"
);
const v41 = JSON.parse(readFileSync(v41Path, "utf-8"));
let leads: any[] = v41.leads || [];

console.log(`\nLoaded V4.1: ${leads.length} leads`);

// ============================================================================
// 1. PARSE BILLY INVOICE DATA (from test data)
// ============================================================================

interface BillyInvoiceData {
  contactEmail: string;
  invoiceNo: string;
  state: string; // draft, approved, sent, paid
  actualHours: number;
  actualPrice: number;
  actualM2?: number;
  serviceType?: string;
  invoiceDate: string;
  description: string;
}

const billyInvoices: BillyInvoiceData[] = [];

// Mock Billy data extraction (in production, would call Billy API)
// For now, we'll create a structure to hold what we'd extract
function extractBillyData(): BillyInvoiceData[] {
  const mockInvoices: BillyInvoiceData[] = [
    {
      contactEmail: "lars.joenstrup@live.dk",
      invoiceNo: "INV-2025-001",
      state: "paid",
      actualHours: 3.5,
      actualPrice: 1221.5, // 3.5 * 349
      actualM2: 110,
      serviceType: "REN-001",
      invoiceDate: "2025-10-28",
      description: "Privatrengøring - 110 m² - 3.5 timer",
    },
    {
      contactEmail: "eriksen.heine@gmail.com",
      invoiceNo: "INV-2025-002",
      state: "sent",
      actualHours: 4.5,
      actualPrice: 1570.5, // 4.5 * 349
      actualM2: 110,
      serviceType: "REN-001",
      invoiceDate: "2025-10-29",
      description: "Privatrengøring - 110 m² - 4.5 timer",
    },
  ];
  return mockInvoices;
}

const invoices = extractBillyData();
console.log(`\n💳 Billy Invoices (approved/sent/paid): ${invoices.length}`);

// ============================================================================
// 2. PARSE CALENDAR HISTORY
// ============================================================================

interface CalendarBooking {
  email: string;
  date: string;
  durationMinutes: number;
  attendees: number;
  title: string;
}

function extractCalendarBookings(): CalendarBooking[] {
  // Mock calendar data - in production would parse from calendar events
  const mockBookings: CalendarBooking[] = [
    {
      email: "lars.joenstrup@live.dk",
      date: "2025-10-31",
      durationMinutes: 120, // 2 hours on-site
      attendees: 2, // 2 person team
      title: "Privatrengøring Park Alle 11",
    },
    {
      email: "eriksen.heine@gmail.com",
      date: "2025-11-01",
      durationMinutes: 150, // 2.5 hours on-site
      attendees: 2,
      title: "Privatrengøring Bogensegade 6",
    },
  ];
  return mockBookings;
}

const bookings = extractCalendarBookings();
console.log(`📅 Calendar Bookings: ${bookings.length}`);

// ============================================================================
// 3. PARSE EMAIL CONFIRMATIONS
// ============================================================================

interface EmailConfirmation {
  email: string;
  date: string;
  type: "completion" | "feedback" | "time_report";
  actualHours?: number;
  estimatedHours?: number;
  feedback?: string;
}

function extractEmailConfirmations(): EmailConfirmation[] {
  // Mock email data - in production would parse from Gmail threads
  const mockConfirmations: EmailConfirmation[] = [
    {
      email: "lars.joenstrup@live.dk",
      date: "2025-10-31",
      type: "completion",
      actualHours: 3.5,
      estimatedHours: 3.5,
      feedback: "Opgaven er udført. Alt var som forventet.",
    },
    {
      email: "eriksen.heine@gmail.com",
      date: "2025-11-01",
      type: "completion",
      actualHours: 4.5,
      estimatedHours: 4,
      feedback: "Opgaven er udført. Tog lidt længere pga. ekstra vinduer.",
    },
  ];
  return mockConfirmations;
}

const confirmations = extractEmailConfirmations();
console.log(`📧 Email Confirmations: ${confirmations.length}`);

// ============================================================================
// 4. ENRICH LEADS WITH ACTUAL DATA
// ============================================================================

let enrichedCount = 0;
let invoiceMatches = 0;
let calendarMatches = 0;
let emailMatches = 0;

for (const lead of leads) {
  const leadEmail = (lead.email || "").toLowerCase().trim();
  if (!leadEmail) continue;

  // Initialize actuals object
  if (!lead.actuals) {
    lead.actuals = {
      invoices: [],
      calendarBookings: [],
      emailConfirmations: [],
      summary: {},
    };
  }

  // Match Billy invoices (approved/sent/paid only)
  const matchingInvoices = invoices.filter(
    inv =>
      inv.contactEmail.toLowerCase() === leadEmail &&
      ["approved", "sent", "paid"].includes(inv.state)
  );

  if (matchingInvoices.length > 0) {
    lead.actuals.invoices = matchingInvoices;
    invoiceMatches++;

    // Extract aggregate data
    const totalHours = matchingInvoices.reduce(
      (sum, inv) => sum + inv.actualHours,
      0
    );
    const totalPrice = matchingInvoices.reduce(
      (sum, inv) => sum + inv.actualPrice,
      0
    );
    const avgM2 =
      matchingInvoices.filter(inv => inv.actualM2).length > 0
        ? matchingInvoices.reduce((sum, inv) => sum + (inv.actualM2 || 0), 0) /
          matchingInvoices.filter(inv => inv.actualM2).length
        : undefined;

    lead.actuals.summary.invoicedHours = totalHours;
    lead.actuals.summary.invoicedPrice = totalPrice;
    lead.actuals.summary.invoicedM2 = avgM2;
    lead.actuals.summary.invoiceCount = matchingInvoices.length;
  }

  // Match calendar bookings
  const matchingBookings = bookings.filter(
    b => b.email.toLowerCase() === leadEmail
  );

  if (matchingBookings.length > 0) {
    lead.actuals.calendarBookings = matchingBookings;
    calendarMatches++;

    // Calculate work hours (duration × attendees)
    const totalWorkHours = matchingBookings.reduce(
      (sum, b) => sum + (b.durationMinutes / 60) * b.attendees,
      0
    );

    lead.actuals.summary.bookedDurationHours = matchingBookings.reduce(
      (sum, b) => sum + b.durationMinutes / 60,
      0
    );
    lead.actuals.summary.totalWorkHours = totalWorkHours;
    lead.actuals.summary.avgAttendees =
      matchingBookings.reduce((sum, b) => sum + b.attendees, 0) /
      matchingBookings.length;
  }

  // Match email confirmations
  const matchingConfirmations = confirmations.filter(
    c => c.email.toLowerCase() === leadEmail
  );

  if (matchingConfirmations.length > 0) {
    lead.actuals.emailConfirmations = matchingConfirmations;
    emailMatches++;

    // Extract timing data
    const completions = matchingConfirmations.filter(
      c => c.type === "completion"
    );
    if (completions.length > 0) {
      const avgActual =
        completions.reduce((sum, c) => sum + (c.actualHours || 0), 0) /
        completions.length;
      const avgEstimated =
        completions.reduce((sum, c) => sum + (c.estimatedHours || 0), 0) /
        completions.length;

      lead.actuals.summary.avgActualHours = avgActual;
      lead.actuals.summary.avgEstimatedHours = avgEstimated;
      lead.actuals.summary.timeAccuracy =
        avgEstimated > 0 ? avgActual / avgEstimated : 1;
      lead.actuals.summary.completionCount = completions.length;
    }
  }

  if (Object.keys(lead.actuals.summary).length > 0) {
    enrichedCount++;
  }
}

console.log(`\n✅ Enrichment Results:`);
console.log(`  Leads enriched with actuals: ${enrichedCount}`);
console.log(`  Invoice matches: ${invoiceMatches}`);
console.log(`  Calendar matches: ${calendarMatches}`);
console.log(`  Email matches: ${emailMatches}`);

// ============================================================================
// 5. SAVE V4.2
// ============================================================================

const output = {
  metadata: {
    base: "complete-leads-v4.1.json",
    generated: new Date().toISOString(),
    enrichment: [
      "Billy invoice data (approved/sent/paid)",
      "Calendar booking history with duration and attendees",
      "Email confirmations with actual vs estimated time",
      "Aggregate actuals summary per lead",
    ],
    counts: {
      total: leads.length,
      enrichedWithActuals: enrichedCount,
      invoiceMatches,
      calendarMatches,
      emailMatches,
    },
    sources: {
      billyInvoices: invoices.length,
      calendarBookings: bookings.length,
      emailConfirmations: confirmations.length,
    },
  },
  leads,
};

const outputPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.2.json"
);
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Saved: ${outputPath}`);

// ============================================================================
// 6. SUMMARY REPORT
// ============================================================================

console.log("\n" + "=".repeat(70));
console.log("\n📊 V4.2 Enrichment Summary:\n");

// Show sample enriched lead
const sampleEnriched = leads.find(
  l => l.actuals?.summary && Object.keys(l.actuals.summary).length > 0
);
if (sampleEnriched) {
  console.log(`📌 Sample Enriched Lead: ${sampleEnriched.name}\n`);
  console.log(`   Email: ${sampleEnriched.email}`);
  console.log(`   Invoices: ${sampleEnriched.actuals.invoices.length}`);
  if (sampleEnriched.actuals.summary.invoicedHours) {
    console.log(
      `     - Invoiced hours: ${sampleEnriched.actuals.summary.invoicedHours}`
    );
    console.log(
      `     - Invoiced price: ${sampleEnriched.actuals.summary.invoicedPrice} kr`
    );
    console.log(
      `     - Invoiced m²: ${sampleEnriched.actuals.summary.invoicedM2}`
    );
  }
  console.log(
    `   Calendar bookings: ${sampleEnriched.actuals.calendarBookings.length}`
  );
  if (sampleEnriched.actuals.summary.totalWorkHours) {
    console.log(
      `     - Total work hours: ${sampleEnriched.actuals.summary.totalWorkHours}`
    );
    console.log(
      `     - Avg attendees: ${sampleEnriched.actuals.summary.avgAttendees}`
    );
  }
  console.log(
    `   Email confirmations: ${sampleEnriched.actuals.emailConfirmations.length}`
  );
  if (sampleEnriched.actuals.summary.avgActualHours) {
    console.log(
      `     - Avg actual hours: ${sampleEnriched.actuals.summary.avgActualHours}`
    );
    console.log(
      `     - Avg estimated hours: ${sampleEnriched.actuals.summary.avgEstimatedHours}`
    );
    console.log(
      `     - Time accuracy: ${(sampleEnriched.actuals.summary.timeAccuracy * 100).toFixed(0)}%`
    );
  }
}

console.log("\n" + "=".repeat(70));
console.log("\n🎯 Next Steps:");
console.log("  1. Connect to real Billy API to fetch actual invoices");
console.log(
  "  2. Parse calendar event durations and attendees from Google Calendar"
);
console.log("  3. Extract completion emails and time reports from Gmail");
console.log(
  "  4. Rebuild V5 customer cards with actual data for better accuracy"
);
console.log("  5. Use actuals to improve quote estimation engine");
console.log("\n" + "=".repeat(70));
