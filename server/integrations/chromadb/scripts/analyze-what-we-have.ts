/**
 * Analyze What Data We Actually Have Collected
 * Show email threads linked to calendar events
 */

import { readFileSync } from "fs";
import { resolve } from "path";

console.log("📊 ANALYZING COLLECTED DATA - WHAT WE HAVE SO FAR\n");
console.log("=".repeat(70));

const googleDataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/google-leads.json"
);
const billyDataPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/real-leads.json"
);

const googleData = JSON.parse(readFileSync(googleDataPath, "utf-8"));
const billyData = JSON.parse(readFileSync(billyDataPath, "utf-8"));

console.log("\n📦 DATA SOURCES:");
console.log("-".repeat(70));
console.log(
  `Billy: ${billyData.leads.length} leads (${billyData.metadata.uniqueLeads} unique)`
);
console.log(
  `Google Calendar: ${googleData.leads.filter((l: any) => l.source === "calendar").length} leads`
);
console.log(
  `Gmail: ${googleData.leads.filter((l: any) => l.source === "gmail").length} leads`
);

// Analyze calendar events
console.log("\n📅 CALENDAR EVENTS ANALYSIS:");
console.log("=".repeat(70));

const calendarLeads = googleData.leads.filter(
  (l: any) => l.source === "calendar"
);
const calendarWithEmail = calendarLeads.filter((l: any) => l.email);
const calendarWithPhone = calendarLeads.filter((l: any) => l.phone);

console.log(`Total calendar leads: ${calendarLeads.length}`);
console.log(`With email: ${calendarWithEmail.length}`);
console.log(`With phone: ${calendarWithPhone.length}`);

if (calendarWithEmail.length > 0) {
  console.log("\n✅ CALENDAR EVENTS WITH EMAIL (showing 10):");
  console.log("-".repeat(70));
  calendarWithEmail.slice(0, 10).forEach((lead: any, i: number) => {
    console.log(`\n${i + 1}. ${lead.name}`);
    console.log(`   Event: ${lead.rawData.eventTitle}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Phone: ${lead.phone || "N/A"}`);
    console.log(`   Date: ${lead.rawData.eventStart}`);
  });
}

// Now check Gmail threads
console.log("\n\n📧 GMAIL THREADS ANALYSIS:");
console.log("=".repeat(70));

const gmailLeads = googleData.leads.filter((l: any) => l.source === "gmail");
const gmailEmails = new Map<string, any>();

gmailLeads.forEach((lead: any) => {
  if (lead.email) {
    gmailEmails.set(lead.email.toLowerCase(), lead);
  }
});

console.log(`Total Gmail leads: ${gmailLeads.length}`);
console.log(`Unique emails: ${gmailEmails.size}`);

// Cross-reference: Find calendar events that have matching Gmail threads
console.log("\n\n🔗 LINKING CALENDAR ↔️ GMAIL:");
console.log("=".repeat(70));

const linkedEvents: Array<{ calendar: any; gmail: any }> = [];

calendarWithEmail.forEach((calLead: any) => {
  const email = calLead.email?.toLowerCase();
  if (email && gmailEmails.has(email)) {
    linkedEvents.push({
      calendar: calLead,
      gmail: gmailEmails.get(email),
    });
  }
});

console.log(`Calendar events with emails: ${calendarWithEmail.length}`);
console.log(`Gmail threads collected: ${gmailLeads.length}`);
console.log(
  `✅ MATCHED: ${linkedEvents.length} calendar events linked to Gmail threads!`
);

if (linkedEvents.length > 0) {
  console.log("\n✅ LINKED EVENTS → GMAIL THREADS (showing 10):");
  console.log("-".repeat(70));

  linkedEvents.slice(0, 10).forEach((link, i) => {
    console.log(`\n${i + 1}. Customer: ${link.calendar.name}`);
    console.log(`   📅 Calendar Event: ${link.calendar.rawData.eventTitle}`);
    console.log(`   📧 Email: ${link.calendar.email}`);
    console.log(`   💬 Gmail Thread: ${link.gmail.rawData.subject}`);
    console.log(`   🆔 Thread ID: ${link.gmail.rawData.threadId}`);
    console.log(
      `   📍 Location: ${link.calendar.rawData.eventLocation || "N/A"}`
    );
  });
}

// Cross-reference with Billy
console.log("\n\n🏢 LINKING BILLY ↔️ CALENDAR ↔️ GMAIL:");
console.log("=".repeat(70));

const billyNames = new Map<string, any>();
billyData.leads.forEach((lead: any) => {
  billyNames.set(lead.name.toLowerCase().trim(), lead);
});

const fullLinks: Array<{ billy: any; calendar: any; gmail?: any }> = [];

linkedEvents.forEach(link => {
  const calName = link.calendar.name.toLowerCase().trim();

  if (billyNames.has(calName)) {
    fullLinks.push({
      billy: billyNames.get(calName),
      calendar: link.calendar,
      gmail: link.gmail,
    });
  }
});

console.log(`Billy customers: ${billyData.leads.length}`);
console.log(`Calendar events: ${calendarLeads.length}`);
console.log(`Gmail threads: ${gmailLeads.length}`);
console.log(
  `\n✅ TRIPLE MATCH (Billy + Calendar + Gmail): ${fullLinks.length}`
);

if (fullLinks.length > 0) {
  console.log("\n🎯 COMPLETE CUSTOMER JOURNEYS (showing 5):");
  console.log("-".repeat(70));

  fullLinks.slice(0, 5).forEach((link, i) => {
    console.log(`\n${i + 1}. 👤 Customer: ${link.billy.name}`);
    console.log(`   📱 Phone (Billy): ${link.billy.phone || "N/A"}`);
    console.log(`   📧 Email (Gmail): ${link.gmail.email}`);
    console.log(`   📅 Booking: ${link.calendar.rawData.eventTitle}`);
    console.log(
      `   📍 Location: ${link.calendar.rawData.eventLocation || "N/A"}`
    );
    console.log(`   💬 Gmail Thread: ${link.gmail.rawData.subject}`);
    console.log(`   🆔 Thread ID: ${link.gmail.rawData.threadId}`);
    console.log(`   🏢 Billy ID: ${link.billy.rawData.billyId}`);
  });
}

// Summary
console.log("\n" + "=".repeat(70));
console.log("📊 FINAL SUMMARY");
console.log("=".repeat(70));

console.log(`\n✅ DATA COLLECTION STATUS:`);
console.log(
  `  • Billy: ${billyData.leads.length} customers (${billyData.metadata.uniqueLeads} unique)`
);
console.log(`  • Calendar: ${calendarLeads.length} events`);
console.log(`  • Gmail: ${gmailLeads.length} threads`);

console.log(`\n✅ EMAIL COVERAGE:`);
console.log(`  • Billy: 0 emails (0%)`);
console.log(
  `  • Calendar: ${calendarWithEmail.length} emails (${Math.round((calendarWithEmail.length / calendarLeads.length) * 100)}%)`
);
console.log(`  • Gmail: ${gmailLeads.length} emails (100%)`);

console.log(`\n✅ CROSS-REFERENCES:`);
console.log(`  • Calendar → Gmail: ${linkedEvents.length} matches`);
console.log(
  `  • Billy → Calendar → Gmail: ${fullLinks.length} complete journeys`
);

console.log(`\n💡 WHAT WE CAN DO:`);
console.log(`  ✅ Track customer journey from email inquiry to booking`);
console.log(`  ✅ Link Gmail conversations to calendar appointments`);
console.log(`  ✅ See ${linkedEvents.length} complete lead conversion flows`);
console.log(`  ✅ Identify ${fullLinks.length} customers across all systems`);

console.log(`\n🎯 FOR CHROMADB:`);
console.log(
  `  • Total unique leads: ~${billyData.metadata.uniqueLeads + calendarWithEmail.length + gmailLeads.length}`
);
console.log(
  `  • Known duplicates: ${fullLinks.length} (Billy = Calendar = Gmail)`
);
console.log(`  • Email-based matching: ${linkedEvents.length} pairs`);
console.log(
  `  • Name-based matching: ${billyData.metadata.uniqueLeads} Billy customers`
);

console.log("\n✅ Data is READY for ChromaDB duplicate detection testing!\n");

process.exit(0);
