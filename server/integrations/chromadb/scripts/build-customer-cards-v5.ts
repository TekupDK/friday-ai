/**
 * Build Customer Cards V5 with Quote Estimation
 *
 * Inputs: complete-leads-v4.1.json (linked Gmail↔Calendar + partner-enriched)
 * Output: customer-cards-v5.json with quoteRecommendation per profile
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🏗️  BUILDING CUSTOMER CARDS V5 (with quote engine)\n");
console.log("=".repeat(70));

// Constants
const HOURLY_RATE = 349; // kr per person-hour

// Service type coefficients (hours per m²)
const COEFF: Record<string, number> = {
  "REN-001": 0.03, // Privat
  "REN-002": 0.05, // Hoved
  "REN-003": 0.075, // Flytte
  "REN-004": 0.02, // Erhverv
  "REN-005_FIRST": 0.02, // Fast (første gang)
  "REN-005_MAINT": 0.01, // Fast (vedligehold)
};

function toNumber(n?: any): number | undefined {
  if (n == null) return undefined;
  const f = parseFloat(String(n));
  return isNaN(f) ? undefined : f;
}

function parseM2(s?: string | null): number | undefined {
  if (!s) return undefined;
  const m = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return undefined;
  return parseFloat(m[1].replace(",", "."));
}

function pick<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) if (v != null) return v as T;
  return undefined;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function hasWindows(text?: string): boolean {
  const t = (text || "").toLowerCase();
  return t.includes("vindues");
}

function svcName(code?: string): string {
  switch (code) {
    case "REN-001":
      return "Privatrengøring";
    case "REN-002":
      return "Hovedrengøring";
    case "REN-003":
      return "Flytterengøring";
    case "REN-004":
      return "Erhvervsrengøring";
    case "REN-005":
      return "Fast rengøring";
    default:
      return "Rengøring";
  }
}

// Load V4.1 dataset
const v41Path = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.1.json"
);
const v41 = JSON.parse(readFileSync(v41Path, "utf-8"));
const leads: any[] = v41.leads || [];

// Group into profiles (email → phone → name)
function keyForLead(l: any): string {
  const em = (l.email || "").toLowerCase();
  const ph = (l.phone || "").replace(/\s/g, "");
  if (em) return `E:${em}`;
  if (ph) return `P:${ph}`;
  return `N:${(l.name || "Unknown").toLowerCase()}`;
}

const profiles = new Map<string, any[]>();
for (const lead of leads) {
  const k = keyForLead(lead);
  if (!profiles.has(k)) profiles.set(k, []);
  profiles.get(k)!.push(lead);
}

interface QuoteRecommendation {
  basis: "actual_time" | "estimated_time" | "m2_rule" | "default";
  serviceType: string;
  isFastFirst: boolean;
  hours: number; // total person-hours
  hourlyRate: number; // kr/t
  price: number; // kr
  details: {
    coeff?: number;
    m2?: number;
    baseHours?: number;
    windowsExtra?: number; // percent
    notes?: string[];
  };
}

function buildQuote(profileLeads: any[]): QuoteRecommendation {
  // Choose the most recent calendar/gmail item with best info
  const sorted = [...profileLeads].sort(
    (a, b) =>
      new Date(b.calendarDate || b.gmailDate || 0).getTime() -
      new Date(a.calendarDate || a.gmailDate || 0).getTime()
  );
  const mostRecent = sorted[0] || {};

  // Aggregate clues
  const serviceType =
    pick<string>(
      mostRecent.serviceType,
      ...sorted.map(x => x.serviceType).filter(Boolean)
    ) || "REN-001";

  // Detect fast first vs maintenance
  const isFast = serviceType === "REN-005";
  const calendarHistory = profileLeads.filter(x => x.source === "calendar");
  const fastCount = calendarHistory.filter(
    x => x.serviceType === "REN-005"
  ).length;
  const isFastFirst = isFast && fastCount <= 1; // first booking (or single)

  const propertySizeStr = pick<string>(
    mostRecent.propertySize,
    ...sorted.map(x => x.propertySize).filter(Boolean)
  );
  const m2 = parseM2(propertySizeStr);

  // Time
  const actual = pick<number>(
    mostRecent.timeEstimate?.actualHours,
    ...sorted
      .map(x => x.timeEstimate?.actualHours)
      .filter((x: any) => x != null)
  );
  const estimated = pick<number>(
    mostRecent.timeEstimate?.estimatedHours,
    ...sorted
      .map(x => x.timeEstimate?.estimatedHours)
      .filter((x: any) => x != null)
  );

  // Windows present?
  const hasWnd = hasWindows(
    mostRecent.rawData?.description ||
      mostRecent.calendarTitle ||
      mostRecent.gmailSubject
  );

  const notes: string[] = [];
  let basis: QuoteRecommendation["basis"] = "default";
  let hours = 0;
  let coeff: number | undefined;

  if (actual != null) {
    basis = "actual_time";
    hours = actual;
    notes.push("Bruger faktisk tid fra historik (arbejdstimer)");
  } else if (estimated != null) {
    basis = "estimated_time";
    hours = estimated;
    notes.push("Bruger estimeret tid fra lead/kalender");
  } else if (m2 != null) {
    basis = "m2_rule";
    if (serviceType === "REN-005") {
      coeff = isFastFirst ? COEFF["REN-005_FIRST"] : COEFF["REN-005_MAINT"];
    } else {
      coeff = COEFF[serviceType] ?? COEFF["REN-001"];
    }
    hours = m2 * (coeff || 0.03);
    notes.push(`m²-regel: ${m2} m² × ${coeff} t/m²`);
  } else {
    basis = "default";
    // conservative defaults by service type
    hours =
      serviceType === "REN-003"
        ? 8 // Flytterengøring
        : serviceType === "REN-002"
          ? 6 // Hoved
          : serviceType === "REN-005"
            ? isFastFirst
              ? 4
              : 2.5 // Fast
            : 3; // Privat / Erhverv fallback
    notes.push("Standard default for service-type");
  }

  // Windows extra 20%
  let windowsExtra = 0;
  if (hasWnd) {
    windowsExtra = 0.2;
    hours = hours * (1 + windowsExtra);
    notes.push("Vinduespudsning: +20% tid");
  }

  // Min/max sanity bounds
  if (serviceType === "REN-003") {
    // Flytte
    if (hours < 5) hours = 5;
  }
  if (serviceType === "REN-005" && !isFastFirst) {
    if (hours < 2) hours = 2; // maintenance should not be below 2h total
  }

  const price = round2(hours * HOURLY_RATE);

  return {
    basis,
    serviceType,
    isFastFirst: !!isFastFirst,
    hours: round2(hours),
    hourlyRate: HOURLY_RATE,
    price,
    details: {
      coeff,
      m2,
      baseHours:
        basis === "default" || basis === "m2_rule" ? round2(hours) : undefined,
      windowsExtra: windowsExtra ? 20 : 0,
      notes,
    },
  };
}

// Build cards
interface CustomerCardV5 {
  profileKey: string;
  name: string;
  primaryEmail?: string;
  primaryPhone?: string;
  addresses: string[];
  serviceTypes: string[];
  leadSources: Record<string, number>;
  gmailThreads: string[];
  calendarEvents: number;
  quoteRecommendation: QuoteRecommendation;
}

const cards: CustomerCardV5[] = [];

for (const [key, group] of profiles.entries()) {
  const name = group[0]?.name || "Unknown";
  const emails = Array.from(
    new Set(group.map(g => (g.email || "").toLowerCase()).filter(Boolean))
  );
  const phones = Array.from(
    new Set(group.map(g => (g.phone || "").replace(/\s/g, "")).filter(Boolean))
  );
  const addresses = Array.from(
    new Set(group.map(g => g.address).filter(Boolean))
  );
  const serviceTypes = Array.from(
    new Set(group.map(g => g.serviceType).filter(Boolean))
  );
  const leadSources: Record<string, number> = {};
  for (const g of group) {
    const ls = g.leadSource || "Unknown";
    leadSources[ls] = (leadSources[ls] || 0) + 1;
  }
  const gmailThreads = Array.from(
    new Set(
      group
        .filter(g => g.source === "gmail")
        .map(g => g.gmailThreadId || g.id)
        .filter(Boolean)
    )
  );
  const calendarEvents = group.filter(g => g.source === "calendar").length;

  const quoteRecommendation = buildQuote(group);

  cards.push({
    profileKey: key,
    name,
    primaryEmail: emails[0],
    primaryPhone: phones[0],
    addresses,
    serviceTypes,
    leadSources,
    gmailThreads,
    calendarEvents,
    quoteRecommendation,
  });
}

// Sort by price desc
cards.sort((a, b) => b.quoteRecommendation.price - a.quoteRecommendation.price);

// Save
const outPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/customer-cards-v5.json"
);
writeFileSync(
  outPath,
  JSON.stringify(
    {
      metadata: {
        generated: new Date().toISOString(),
        totalProfiles: cards.length,
        avgQuotePrice: round2(
          cards.reduce((s, c) => s + c.quoteRecommendation.price, 0) /
            Math.max(1, cards.length)
        ),
      },
      cards,
    },
    null,
    2
  )
);

console.log(`\n✅ Saved Customer Cards V5 to: ${outPath}`);
console.log("");
