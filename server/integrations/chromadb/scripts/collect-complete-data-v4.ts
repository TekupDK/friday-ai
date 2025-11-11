/**
 * COMPLETE DATA COLLECTION V4
 * 
 * Goals:
 * - Fetch ALL relevant Gmail threads in Jul–Dec 2025 via pagination
 * - Filter by labels and partner signals (Leadpoint, Rengøring.nu, AdHelp)
 * - Strong spam filtering
 * - Partner-specific parsing of email bodies to extract: name, email, phone, address, type, m², time estimate, deadline, price
 * - Parse Calendar descriptions for email/phone/address/time/price/service type
 * - Collect Billy customers
 * - Save consolidated dataset for downstream linking and customer cards
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
config({ path: resolve(process.cwd(), ".env.dev") });

import {
  searchGmailThreadsPaged,
  getGmailThread,
  listCalendarEvents,
} from "../../../google-api";
import { getCustomers } from "../../../billy";

console.log("📊 COMPLETE DATA COLLECTION V4\n");
console.log("=".repeat(70));

// Lead sources
enum LeadSource {
  LEADPOINT = "Leadpoint.dk (Rengøring Aarhus)",
  RENGORINGNU = "Rengøring.nu (Leadmail.no)",
  ADHELP = "AdHelp",
  DIRECT = "Direct",
  EXISTING = "Existing",
  UNKNOWN = "Unknown",
}

interface TimeEstimate {
  estimatedHours?: number;
  actualHours?: number;
  totalMinutes?: number;
  text?: string;
}

interface ParsedFields {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  propertySize?: string; // e.g., "150 m²" / "150 kvm"
  deadline?: string;
  price?: number;
  timeEstimate?: TimeEstimate;
}

interface Lead {
  id: string;
  source: "gmail" | "calendar" | "billy";
  leadSource?: LeadSource;
  leadSourceHint?: string; // subject/from/label used
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address?: string | null;
  serviceType?: string | null;
  propertySize?: string | null;
  deadline?: string | null;
  price?: number | null;
  timeEstimate?: TimeEstimate | null;

  // Gmail
  gmailThreadId?: string;
  gmailSubject?: string;
  gmailDate?: string;
  gmailLabels?: string[];

  // Calendar
  calendarEventId?: string;
  calendarTitle?: string;
  calendarDate?: string;
  calendarLocation?: string;

  // Billy
  billyCustomerId?: string;

  // Raw
  rawData: any;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Spam filter
const spamDomains = [
  "stripe.com",
  "google.com",
  "tasklet.com",
  "feedhive.com",
  "bubble.io",
  "lindy.ai",
  "wordpress.com",
  "airtable.com",
  "booking.com",
  "link.com",
  "linkedin.com",
  "facebook.com",
  "mail.bubble.io",
];
const spamKeywords = [
  "invoice",
  "subscription",
  "verification code",
  "password reset",
  "lifetime deal",
  "demo day",
  "newsletter",
  "wp statistics",
  "calendar",
  "hiring",
  "security",
];
function isSpam(email: string, subject: string): boolean {
  const e = (email || "").toLowerCase();
  const s = (subject || "").toLowerCase();
  if (spamDomains.some(d => e.includes(d))) return true;
  if (spamKeywords.some(k => s.includes(k))) return true;
  return false;
}

// Identify lead source from subject/from/labels
function identifyLeadSource(subject: string, from: string, labels: string[] = []): { source: LeadSource; hint: string } {
  const s = (subject || "").toLowerCase();
  const f = (from || "").toLowerCase();
  const lbl = (labels || []).map(l => l.toLowerCase());

  // Leadpoint / Rengøring Aarhus
  if (
    s.includes("rengøring aarhus") ||
    s.includes("formular via rengøring aarhus") ||
    s.includes("opkald via rengøring aarhus") ||
    f.includes("leadpoint.dk") ||
    f.includes("system@leadpoint.dk") ||
    f.includes("partner@leadpoint.dk") ||
    lbl.includes("rengøring århus") ||
    lbl.includes("rengøring aarhus") ||
    lbl.includes("leadpoint")
  ) {
    return { source: LeadSource.LEADPOINT, hint: "Leadpoint/Rengøring Aarhus" };
  }

  // Rengøring.nu (Leadmail.no / Nettbureau AS)
  if (
    s.includes("rengøring.nu - nettbureau") ||
    s.includes("rengøring.nu") ||
    s.includes("nettbureau as") ||
    f.includes("leadmail.no") ||
    f.includes("kontakt@leadmail.no") ||
    lbl.includes("rengøring.nu")
  ) {
    return { source: LeadSource.RENGORINGNU, hint: "Rengøring.nu/Leadmail.no" };
  }

  // AdHelp
  if (f.includes("adhelp.dk") || f.includes("mw@adhelp.dk") || f.includes("sp@adhelp.dk") || lbl.includes("adhelp")) {
    return { source: LeadSource.ADHELP, hint: "AdHelp" };
  }

  // Existing customer
  if (/^(re:|sv:)/i.test(subject) || s.includes("faktura nr")) {
    return { source: LeadSource.EXISTING, hint: "Existing (Re:/Faktura)" };
  }

  // Direct
  if (s.includes("rengøring") || s.includes("tilbud")) {
    return { source: LeadSource.DIRECT, hint: "Direct inquiry" };
  }

  return { source: LeadSource.UNKNOWN, hint: "Unknown" };
}

// Generic extractors
const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const phoneRegex = /(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g;
const addressLineRegex = /(?:Adr|Adresse|Lokation)[:\-]?\s*([^\n]+)/i;
const m2Regex = /(\d+)\s*(?:m²|kvm)/i;
const priceRegex = /(\d+[.,]?\d*)\s*kr/i;
const deadlineRegex = /(deadline|senest|hurtigst muligt)[:\-]?\s*([^\n]+)/i;

function parseTimeEstimate(text: string): TimeEstimate | undefined {
  const t = text || "";
  const out: TimeEstimate = {};

  // "X-Y timer" or "X timer"
  const hoursMatch = t.match(/(\d+(?:-\d+)?)\s*timer/i);
  if (hoursMatch) {
    const v = hoursMatch[1];
    if (v.includes("-")) {
      const [a, b] = v.split("-").map(Number);
      out.estimatedHours = (a + b) / 2;
    } else {
      out.estimatedHours = parseFloat(v);
    }
    out.text = hoursMatch[0];
  }

  // "X arbejdstimer"
  const actualMatch = t.match(/(\d+(?:[.,]\d+)?)\s*arbejdstimer/i);
  if (actualMatch) {
    out.actualHours = parseFloat(actualMatch[1].replace(",", "."));
  }

  // "N personer × M timer" / "3x2 personer"
  const personsTimes = t.match(/(\d+)\s*(?:personer|pers)\s*[×x*]\s*(\d+(?:[.,]\d+)?)\s*timer/i);
  if (personsTimes) {
    const persons = parseInt(personsTimes[1]);
    const hours = parseFloat(personsTimes[2].replace(",", "."));
    out.estimatedHours = persons * hours;
    out.text = personsTimes[0];
  }

  // HH:MM–HH:MM
  const range = t.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (range && !out.estimatedHours) {
    const sh = parseInt(range[1]);
    const sm = parseInt(range[2]);
    const eh = parseInt(range[3]);
    const em = parseInt(range[4]);
    const minutes = (eh * 60 + em) - (sh * 60 + sm);
    if (minutes > 0) {
      out.estimatedHours = minutes / 60;
      out.text = range[0];
    }
  }

  if (out.estimatedHours != null) out.totalMinutes = Math.round(out.estimatedHours * 60);
  return Object.keys(out).length > 0 ? out : undefined;
}

function extractParsedFields(text: string): ParsedFields {
  const p: ParsedFields = {};
  const t = text || "";

  const emails = t.match(emailRegex);
  if (emails && emails.length > 0) p.email = emails[0];

  const phoneMatch = t.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) p.phone = phoneMatch[0].replace(/\s/g, "");

  const addr = t.match(addressLineRegex);
  if (addr) p.address = addr[1].trim();

  const m2 = t.match(m2Regex);
  if (m2) p.propertySize = `${m2[1]} m²`;

  const price = t.match(priceRegex);
  if (price) p.price = parseFloat(price[1].replace(",", "."));

  const dl = t.match(deadlineRegex);
  if (dl) p.deadline = dl[2].trim();

  // Service type
  const lower = t.toLowerCase();
  if (lower.includes("fast rengøring")) p.serviceType = "REN-005";
  else if (lower.includes("flytte")) p.serviceType = "REN-003";
  else if (lower.includes("hoved")) p.serviceType = "REN-002";
  else if (lower.includes("erhverv") || lower.includes("restaurant")) p.serviceType = "REN-004";
  else if (!p.serviceType && (lower.includes("rengøring"))) p.serviceType = "REN-001";

  const te = parseTimeEstimate(t);
  if (te) p.timeEstimate = te;

  // Name heuristic (first capitalized sequence with 2+ words)
  const nameMatch = t.match(/([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/);
  if (nameMatch) p.name = nameMatch[1];

  return p;
}

function mergeParsedFields(base: ParsedFields, extra: ParsedFields): ParsedFields {
  return {
    name: base.name || extra.name,
    email: base.email || extra.email,
    phone: base.phone || extra.phone,
    address: base.address || extra.address,
    serviceType: base.serviceType || extra.serviceType,
    propertySize: base.propertySize || extra.propertySize,
    deadline: base.deadline || extra.deadline,
    price: base.price ?? extra.price,
    timeEstimate: base.timeEstimate || extra.timeEstimate,
  };
}

async function collectV4() {
  const startDate = new Date("2025-07-01T00:00:00Z");
  const endDate = new Date("2025-12-31T23:59:59Z");

  const leads: Lead[] = [];
  let spamFiltered = 0;

  console.log("\n📧 STEP 1: Gmail (pagination + partner filters)");
  console.log("-".repeat(70));

  // Gmail query including labels and partner hints
  const q = [
    `after:${Math.floor(startDate.getTime() / 1000)} before:${Math.floor(endDate.getTime() / 1000)}`,
    // Perspective: include both inbox and sent, and ensure it's our mailbox on both ends
    `(in:inbox OR in:sent)`,
    `(from:me OR to:me)`,
    // Labels
    `(label:Leads OR label:"Rengøring.nu" OR label:"Rengøring Århus" OR label:"Rengøring Aarhus")`,
    // Partners (subject/from hints)
    `("Formular via Rengøring Aarhus" OR "Opkald via Rengøring Aarhus" OR from:system@leadpoint.dk OR from:partner@leadpoint.dk OR subject:"Rengøring.nu - Nettbureau AS" OR from:kontakt@leadmail.no OR from:*@adhelp.dk OR subject:"Rengøring Aarhus")`,
    // Exclusions
    `-category:social -category:promotions -in:chats -in:drafts`,
  ].join(" ");

  let pageToken: string | undefined = undefined;
  let page = 0;
  const maxPages = 20; // safety cap

  do {
    page += 1;
    const paged = await searchGmailThreadsPaged({ query: q, maxResults: 100, pageToken });
    console.log(`   Page ${page}: ${paged.threads.length} threads`);

    for (const th of paged.threads) {
      const subject = th.subject || "";
      const from = th.from || "";
      const labels = th.labels || [];

      // Determine partner source
      const { source: leadSource, hint } = identifyLeadSource(subject, from, labels);

      // Evaluate spam
      const emailMatch = (from || "").match(/([^<]+)?<?([^>@]+@[^>]+)>?/);
      const email = emailMatch ? emailMatch[2] : "";
      if (isSpam(email, subject)) {
        spamFiltered++;
        continue;
      }

      // Parse bodies: prefer earliest meaningful external message
      let parsed: ParsedFields = {};
      if (th.messages && th.messages.length > 0) {
        // Combine earliest and last message body for maximum extraction
        const first = th.messages[0];
        const last = th.messages[th.messages.length - 1];
        parsed = mergeParsedFields(extractParsedFields(first.bodyText || first.body || ""), extractParsedFields(last.bodyText || last.body || ""));
      }

      const derivedName = parsed.name || (email ? email.split("@")[0] : "Unknown");

      leads.push({
        id: `GMAIL_${th.id}`,
        source: "gmail",
        leadSource,
        leadSourceHint: `${hint} | s:${subject}`,
        name: derivedName,
        email: parsed.email || email || null,
        phone: parsed.phone || null,
        company: (parsed.email || email) ? (parsed.email || email)!.split("@")[1] : null,
        address: parsed.address || null,
        serviceType: parsed.serviceType || null,
        propertySize: parsed.propertySize || null,
        deadline: parsed.deadline || null,
        price: parsed.price ?? null,
        timeEstimate: parsed.timeEstimate || null,
        gmailThreadId: th.id,
        gmailSubject: subject,
        gmailDate: th.date,
        gmailLabels: th.labels || [],
        rawData: th,
      });
    }

    pageToken = paged.nextPageToken;
    if (pageToken) await sleep(250); // rate-limit friendly
  } while (pageToken && page < maxPages);

  console.log(`✅ Gmail leads collected: ${leads.filter(l => l.source === "gmail").length} (spam filtered: ${spamFiltered})`);

  console.log("\n📅 STEP 2: Calendar (full parsing)");
  console.log("-".repeat(70));
  const events = await listCalendarEvents({
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    maxResults: 500,
  });
  console.log(`✅ Calendar events: ${events.length}`);

  for (const ev of events) {
    const title = ev.summary || "";
    const description = (ev as any).description || "";
    const location = (ev as any).location || "";
    const combinedText = `${title}\n${description}`;

    const p = extractParsedFields(combinedText);

    const name = p.name || (p.email ? p.email.split("@")[0] : "Unknown");

    leads.push({
      id: `CAL_${ev.id}`,
      source: "calendar",
      name,
      email: p.email || null,
      phone: p.phone || null,
      company: p.email ? p.email.split("@")[1] : null,
      address: p.address || (location || null),
      serviceType: p.serviceType || null,
      propertySize: p.propertySize || null,
      deadline: p.deadline || null,
      price: p.price ?? null,
      timeEstimate: p.timeEstimate || null,
      calendarEventId: ev.id,
      calendarTitle: title,
      calendarDate: ev.start,
      calendarLocation: location,
      rawData: ev,
    });
  }

  console.log("\n💰 STEP 3: Billy");
  console.log("-".repeat(70));
  try {
    const customers = await getCustomers();
    console.log(`✅ Billy customers: ${customers.length}`);
    for (const c of customers) {
      const name = (c as any).name || "Unknown";
      const phone = (c as any).phone || null;
      leads.push({
        id: `BILLY_${c.id}`,
        source: "billy",
        name,
        email: null,
        phone,
        company: name,
        billyCustomerId: c.id,
        rawData: c,
      } as Lead);
    }
  } catch (err) {
    console.log("❌ Billy fetch failed:", err);
  }

  // Save
  const outPath = resolve(process.cwd(), "server/integrations/chromadb/test-data/complete-leads-v4.json");
  const summary = {
    collected: new Date().toISOString(),
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    counts: {
      total: leads.length,
      gmail: leads.filter(l => l.source === "gmail").length,
      calendar: leads.filter(l => l.source === "calendar").length,
      billy: leads.filter(l => l.source === "billy").length,
      spamFiltered,
    },
    leadSources: Object.fromEntries(
      Object.values(LeadSource).map(ls => [ls, leads.filter(l => l.leadSource === ls).length])
    ),
    parsedFieldCoverage: {
      withEmail: leads.filter(l => !!l.email).length,
      withPhone: leads.filter(l => !!l.phone).length,
      withAddress: leads.filter(l => !!l.address).length,
      withServiceType: leads.filter(l => !!l.serviceType).length,
      withPropertySize: leads.filter(l => !!l.propertySize).length,
      withPrice: leads.filter(l => l.price != null).length,
      withTimeEstimate: leads.filter(l => !!l.timeEstimate).length,
    },
  };

  writeFileSync(
    outPath,
    JSON.stringify({ metadata: summary, leads }, null, 2)
  );
  console.log(`\n✅ Saved to: ${outPath}`);

  console.log("\n" + "=".repeat(70));
  console.log("📊 V4 COLLECTION SUMMARY");
  console.log("=".repeat(70));
  console.log(`\nTotal: ${summary.counts.total}`);
  console.log(`  • Gmail: ${summary.counts.gmail} (spam filtered: ${spamFiltered})`);
  console.log(`  • Calendar: ${summary.counts.calendar}`);
  console.log(`  • Billy: ${summary.counts.billy}`);
  console.log("\nLead sources:");
  for (const [k, v] of Object.entries(summary.leadSources)) {
    console.log(`  • ${k}: ${v}`);
  }
  console.log("\nParsed coverage:");
  for (const [k, v] of Object.entries(summary.parsedFieldCoverage)) {
    console.log(`  • ${k}: ${v}`);
  }

  console.log("\n✅ V4 collection complete!\n");
  process.exit(0);
}

collectV4().catch(err => {
  console.error("\n❌ V4 collection failed:", err);
  process.exit(1);
});
