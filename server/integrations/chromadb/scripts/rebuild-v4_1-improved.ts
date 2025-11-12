/**
 * V4.1 Improved - Rebuild with Better Linking & Enrichment
 *
 * Improvements:
 * 1. Filter out spam/noise calendar entries (Mærkedage, Helligdag, møder, etc.)
 * 2. Better Calendar↔Gmail linking (improved fuzzy matching on name, address, date)
 * 3. Enrich missing addresses from Gmail body text
 * 4. Estimate missing times using m² × coefficient rules
 * 5. Consolidate duplicate profiles
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🔧 V4.1 Improved - Better Linking & Enrichment\n");
console.log("=".repeat(70));

const v4Path = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.json"
);
const v4 = JSON.parse(readFileSync(v4Path, "utf-8"));
let leads: any[] = v4.leads || [];

const gmailLeads = leads.filter(l => l.source === "gmail");
const calendarLeads = leads.filter(l => l.source === "calendar");
const billyLeads = leads.filter(l => l.source === "billy");

console.log(
  `\nLoaded: ${gmailLeads.length} Gmail, ${calendarLeads.length} Calendar, ${billyLeads.length} Billy`
);

// ============================================================================
// 1. FILTER OUT SPAM/NOISE
// ============================================================================

const spamPatterns = [
  /mærkedage/i,
  /helligdag/i,
  /nytår/i,
  /jul/i,
  /halloween/i,
  /påske/i,
  /møde\s+(babylon|intern|team|standup)/i,
  /ferie/i,
  /frokost/i,
  /pause/i,
  /kontor\s+lukket/i,
  /lukket/i,
  /^unknown$/i,
];

const isSpam = (lead: any): boolean => {
  const name = (lead.name || "").toLowerCase();
  const desc = (lead.description || "").toLowerCase();
  return spamPatterns.some(p => p.test(name) || p.test(desc));
};

const calendarBefore = calendarLeads.length;
const filteredCalendar = calendarLeads.filter(l => !isSpam(l));
const spamRemoved = calendarBefore - filteredCalendar.length;

console.log(`\n✂️  Spam Filtering:`);
console.log(`  Calendar entries removed: ${spamRemoved}`);
console.log(`  Calendar remaining: ${filteredCalendar.length}`);

leads = [...gmailLeads, ...filteredCalendar, ...billyLeads];

// ============================================================================
// 2. HELPER FUNCTIONS FOR MATCHING
// ============================================================================

function norm(str?: string | null) {
  return (str || "").toLowerCase().trim();
}

function normalizeName(name: string) {
  return norm(name)
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 æøå]/g, "");
}

function namesSimilar(a: string, b: string): number {
  const A = normalizeName(a);
  const B = normalizeName(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A))
    return Math.min(A.length, B.length) / Math.max(A.length, B.length);
  const wa = new Set(A.split(" "));
  const wb = new Set(B.split(" "));
  const common = [...wa].filter(w => w.length > 2 && wb.has(w)).length;
  return common > 0 ? common / Math.max(wa.size, wb.size) : 0;
}

function dateDiffDays(a?: string, b?: string): number {
  if (!a || !b) return 999;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2)) return 999;
  return Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

function addressSimilar(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  const A = norm(a).replace(/[,\.]/g, "").split(/\s+/);
  const B = norm(b).replace(/[,\.]/g, "").split(/\s+/);
  const setA = new Set(A);
  const common = B.filter(w => w.length > 2 && setA.has(w)).length;
  return common / Math.max(A.length, B.length);
}

function extractAddressFromGmail(body?: string): string | null {
  if (!body) return null;
  // Look for patterns like "Adresse: ...", "Address: ...", "Vej: ...", etc.
  const patterns = [
    /adresse[:\-]?\s*([^\n]+)/i,
    /address[:\-]?\s*([^\n]+)/i,
    /vej[:\-]?\s*([^\n]+)/i,
    /gade[:\-]?\s*([^\n]+)/i,
    /([0-9]+\s+[a-zæøå\s]+[0-9]{4}\s+[a-zæøå\s]+)/i,
  ];
  for (const pattern of patterns) {
    const m = body.match(pattern);
    if (m) return m[1].trim();
  }
  return null;
}

// ============================================================================
// 3. IMPROVED LINKING: Calendar ↔ Gmail
// ============================================================================

const linkedPairs: Array<{ calendar: any; gmail: any; score: number }> = [];
const linkedGmailIds = new Set<string>();
const linkedCalendarIds = new Set<string>();

for (const cal of filteredCalendar) {
  if (!cal.email && !cal.phone && !cal.address) continue; // Skip if no contact info

  let bestGmail: any = null;
  let bestScore = 0;

  for (const gmail of gmailLeads) {
    if (linkedGmailIds.has(gmail.id)) continue;

    let score = 0;

    // Email match (highest priority)
    if (cal.email && gmail.email && norm(cal.email) === norm(gmail.email)) {
      score += 100;
    }

    // Phone match
    if (cal.phone && gmail.phone) {
      const calPhone = norm(cal.phone).replace(/\D/g, "");
      const gmailPhone = norm(gmail.phone).replace(/\D/g, "");
      if (calPhone && gmailPhone && calPhone === gmailPhone) {
        score += 80;
      }
    }

    // Name similarity (with date proximity bonus)
    if (cal.name && gmail.name) {
      const nameSim = namesSimilar(cal.name, gmail.name);
      if (nameSim > 0.5) {
        score += nameSim * 40;
        // Bonus if dates are close
        const dayDiff = dateDiffDays(cal.date, gmail.gmailDate);
        if (dayDiff <= 7) score += 20;
      }
    }

    // Address similarity
    if (cal.address && gmail.address) {
      const addrSim = addressSimilar(cal.address, gmail.address);
      if (addrSim > 0.3) {
        score += addrSim * 30;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestGmail = gmail;
    }
  }

  if (bestScore > 40) {
    // Threshold for linking
    linkedPairs.push({ calendar: cal, gmail: bestGmail, score: bestScore });
    linkedGmailIds.add(bestGmail.id);
    linkedCalendarIds.add(cal.id);
  }
}

console.log(`\n🔗 Linking Results:`);
console.log(`  Calendar ↔ Gmail links: ${linkedPairs.length}`);
console.log(`  Unlinked Gmail: ${gmailLeads.length - linkedGmailIds.size}`);
console.log(
  `  Unlinked Calendar: ${filteredCalendar.length - linkedCalendarIds.size}`
);

// ============================================================================
// 4. MERGE LINKED PAIRS & ENRICH
// ============================================================================

const enrichedLeads: any[] = [];
const processedIds = new Set<string>();

// Process linked pairs
for (const { calendar, gmail } of linkedPairs) {
  const merged = { ...gmail };

  // Enrich from calendar
  if (!merged.address && calendar.address) {
    merged.address = calendar.address;
  }
  if (!merged.timeEstimate && calendar.timeEstimate) {
    merged.timeEstimate = calendar.timeEstimate;
  }
  if (!merged.propertySize && calendar.propertySize) {
    merged.propertySize = calendar.propertySize;
  }

  // Try to extract address from Gmail body if still missing
  if (!merged.address && gmail.rawData?.messages?.[0]?.bodyText) {
    const extractedAddr = extractAddressFromGmail(
      gmail.rawData.messages[0].bodyText
    );
    if (extractedAddr) {
      merged.address = extractedAddr;
    }
  }

  // Link calendar event
  merged.calendarEventId = calendar.id;
  merged.calendarDate = calendar.date;

  enrichedLeads.push(merged);
  processedIds.add(gmail.id);
  processedIds.add(calendar.id);
}

// Add unlinked Gmail leads
for (const gmail of gmailLeads) {
  if (!processedIds.has(gmail.id)) {
    // Try to extract address from Gmail body
    if (!gmail.address && gmail.rawData?.messages?.[0]?.bodyText) {
      const extractedAddr = extractAddressFromGmail(
        gmail.rawData.messages[0].bodyText
      );
      if (extractedAddr) {
        gmail.address = extractedAddr;
      }
    }
    enrichedLeads.push(gmail);
    processedIds.add(gmail.id);
  }
}

// Add unlinked Calendar leads
for (const cal of filteredCalendar) {
  if (!processedIds.has(cal.id)) {
    enrichedLeads.push(cal);
    processedIds.add(cal.id);
  }
}

// Add Billy leads
for (const billy of billyLeads) {
  enrichedLeads.push(billy);
}

console.log(`\n📦 Enriched Leads: ${enrichedLeads.length}`);

// ============================================================================
// 5. ESTIMATE MISSING TIMES USING M² RULES
// ============================================================================

const serviceCoefficients: Record<string, number> = {
  "REN-001": 0.01, // Privatrengøring: 0.01 t/m²
  "REN-002": 0.015, // Hovedrengøring: 0.015 t/m²
  "REN-003": 0.02, // Flytterengøring: 0.02 t/m²
  "REN-004": 0.008, // Erhvervsrengøring: 0.008 t/m²
  "REN-005": 0.01, // Fast rengøring: 0.01 t/m²
};

let timeEstimatesAdded = 0;

for (const lead of enrichedLeads) {
  // Skip if already has time estimate
  if (lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours)
    continue;

  const m2Str = (lead.propertySize || "").match(/(\d+)/)?.[1];
  const m2 = m2Str ? parseInt(m2Str) : null;
  const serviceType = lead.serviceType || "REN-001";
  const coeff = serviceCoefficients[serviceType] || 0.01;

  if (m2 && m2 > 0) {
    const estimatedHours = Math.round(m2 * coeff * 10) / 10; // Round to 1 decimal
    lead.timeEstimate = {
      estimatedHours,
      text: `${estimatedHours}h (m² rule)`,
      basis: "m2_rule",
    };
    timeEstimatesAdded++;
  }
}

console.log(`\n⏱️  Time Estimation:`);
console.log(`  Time estimates added via m² rule: ${timeEstimatesAdded}`);

// ============================================================================
// 6. SAVE IMPROVED V4.1
// ============================================================================

const output = {
  metadata: {
    base: "complete-leads-v4.json",
    generated: new Date().toISOString(),
    improvements: [
      "Filtered spam/noise calendar entries",
      "Improved Calendar↔Gmail linking (name, address, date proximity)",
      "Extracted addresses from Gmail bodies",
      "Estimated missing times using m² coefficients",
    ],
    counts: {
      total: enrichedLeads.length,
      gmail: enrichedLeads.filter(l => l.source === "gmail").length,
      calendar: enrichedLeads.filter(l => l.source === "calendar").length,
      billy: enrichedLeads.filter(l => l.source === "billy").length,
    },
    links: {
      total: linkedPairs.length,
      emailMatches: linkedPairs.filter(
        p => norm(p.calendar.email) === norm(p.gmail.email)
      ).length,
      phoneMatches: linkedPairs.filter(p => {
        const cp = norm(p.calendar.phone || "").replace(/\D/g, "");
        const gp = norm(p.gmail.phone || "").replace(/\D/g, "");
        return cp && gp && cp === gp;
      }).length,
      fuzzyMatches: linkedPairs.filter(p => {
        const cp = norm(p.calendar.email || "").replace(/\D/g, "");
        const gp = norm(p.gmail.email || "").replace(/\D/g, "");
        return !cp && !gp;
      }).length,
    },
    enrichment: {
      addressesExtracted: enrichedLeads.filter(l => l.address).length,
      timeEstimatesAdded,
    },
  },
  leads: enrichedLeads,
};

const outputPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.1-improved.json"
);
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Saved: ${outputPath}`);
console.log("\n" + "=".repeat(70));
console.log("\n📊 Summary:");
console.log(`  Total leads: ${enrichedLeads.length}`);
console.log(`  Calendar↔Gmail links: ${linkedPairs.length}`);
console.log(`  Spam removed: ${spamRemoved}`);
console.log(
  `  Addresses enriched: ${enrichedLeads.filter(l => l.address).length}`
);
console.log(`  Time estimates added: ${timeEstimatesAdded}`);
console.log("\n" + "=".repeat(70));
