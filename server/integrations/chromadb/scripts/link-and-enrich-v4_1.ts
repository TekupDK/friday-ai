/**
 * V4.1 Linking & Partner Enrichment
 *
 * - Load V4 dataset (complete-leads-v4.json)
 * - Link Calendar events ↔ Gmail threads (email → phone → fuzzy name+date+address)
 * - Partner-specific parsing for Gmail (Leadpoint, Rengøring.nu, AdHelp)
 * - Enrich missing fields on both sides
 * - Save V4.1 dataset (complete-leads-v4.1.json) with metrics
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🔗 V4.1 Linking & Partner Enrichment\n");
console.log("=".repeat(70));

const v4Path = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.json"
);
const v4 = JSON.parse(readFileSync(v4Path, "utf-8"));
const leads: any[] = v4.leads || [];

const gmailLeads = leads.filter(l => l.source === "gmail");
const calendarLeads = leads.filter(l => l.source === "calendar");
const billyLeads = leads.filter(l => l.source === "billy");

function norm(str?: string | null) {
  return (str || "").toLowerCase().trim();
}

function normalizeName(name: string) {
  return norm(name)
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 æøå]/g, "");
}

function namesSimilar(a: string, b: string) {
  const A = normalizeName(a);
  const B = normalizeName(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A))
    return Math.min(A.length, B.length) / Math.max(A.length, B.length);
  const wa = new Set(A.split(" "));
  const wb = new Set(B.split(" "));
  const common = [...wa].filter(w => w.length > 2 && wb.has(w)).length;
  return common / Math.max(wa.size, wb.size);
}

function dateDiffDays(a?: string, b?: string) {
  if (!a || !b) return 999;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2)) return 999;
  return Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

function addressSimilar(a?: string | null, b?: string | null) {
  if (!a || !b) return 0;
  const A = norm(a).replace(/[,\.]/g, "").split(/\s+/);
  const B = norm(b).replace(/[,\.]/g, "").split(/\s+/);
  const setA = new Set(A);
  const common = B.filter(w => w.length > 2 && setA.has(w)).length;
  return common / Math.max(A.length, B.length);
}

// Partner-specific Gmail parsing
function parseLeadpoint(text: string) {
  const out: any = {};
  const lines = (text || "").split(/\n|\r/);
  for (const line of lines) {
    const l = line.trim();
    if (/^navn[:\-]/i.test(l)) out.name = l.replace(/^[^:]+:/i, "").trim();
    if (/^email[:\-]/i.test(l)) out.email = l.replace(/^[^:]+:/i, "").trim();
    if (/^adresse[:\-]/i.test(l))
      out.address = l.replace(/^[^:]+:/i, "").trim();
    if (/^(type|rengøringstype)[:\-]/i.test(l))
      out.serviceType = l.replace(/^[^:]+:/i, "").trim();
    if (/^(m2|m²|kvm)[:\-]/i.test(l))
      out.propertySize = l
        .replace(/^[^:]+:/i, "")
        .trim()
        .replace(/kvm/i, "m²");
    if (/^(deadline|senest)[:\-]/i.test(l))
      out.deadline = l.replace(/^[^:]+:/i, "").trim();
    if (/^(telefon|tlf)[:\-]/i.test(l))
      out.phone = l
        .replace(/^[^:]+:/i, "")
        .replace(/\s+/g, "")
        .trim();
    if (/kr\b/i.test(l) && out.price == null) {
      const m = l.match(/(\d+[.,]?\d*)\s*kr/i);
      if (m) out.price = parseFloat(m[1].replace(",", "."));
    }
  }
  return out;
}

function parseRengoeringNu(text: string) {
  const out: any = {};
  const lines = (text || "").split(/\n|\r/);
  for (const line of lines) {
    const l = line.trim();
    if (/e-?post|email/i.test(l)) {
      const m = l.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (m) out.email = m[1];
    }
    if (/telefon|tlf/i.test(l)) {
      const m = l.match(/(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/);
      if (m) out.phone = m[0].replace(/\s/g, "");
    }
    if (/postnr|by|adresse|address/i.test(l)) {
      const m = l.match(/(?:adr|adresse|address)[:\-]?\s*([^\n]+)/i);
      if (m) out.address = m[1].trim();
    }
    if (/m2|m²|kvm/i.test(l)) {
      const m = l.match(/(\d+)\s*(?:m²|kvm)/i);
      if (m) out.propertySize = `${m[1]} m²`;
    }
    if (/kr\b/i.test(l) && out.price == null) {
      const m = l.match(/(\d+[.,]?\d*)\s*kr/i);
      if (m) out.price = parseFloat(m[1].replace(",", "."));
    }
  }
  return out;
}

function parseAdHelp(text: string) {
  const out: any = {};
  const lines = (text || "").split(/\n|\r/);
  for (const line of lines) {
    const l = line.trim();
    if (/rengøringstype|type/i.test(l))
      out.serviceType = l.replace(/^[^:]+:/, "").trim();
    if (/m2|m²|kvm/i.test(l)) {
      const m = l.match(/(\d+)\s*(?:m²|kvm)/i);
      if (m) out.propertySize = `${m[1]} m²`;
    }
    if (/adresse|address/i.test(l))
      out.address = l.replace(/^[^:]+:/, "").trim();
    if (/deadline|senest/i.test(l))
      out.deadline = l.replace(/^[^:]+:/, "").trim();
  }
  return out;
}

function enrichFromPartner(lead: any) {
  if (!lead || lead.source !== "gmail") return {};
  const thread = lead.rawData || {};
  const messages: any[] = Array.isArray(thread.messages) ? thread.messages : [];
  // Combine first + last + concatenated bodies for max signal
  let body = "";
  if (messages.length > 0) {
    body += (messages[0].bodyText || messages[0].body || "") + "\n";
    body +=
      (messages[messages.length - 1].bodyText ||
        messages[messages.length - 1].body ||
        "") + "\n";
    for (let i = 1; i < Math.min(messages.length - 1, 3); i++)
      body += (messages[i].bodyText || messages[i].body || "") + "\n";
  }

  if (lead.leadSource?.includes("Leadpoint")) return parseLeadpoint(body);
  if (lead.leadSource?.includes("Rengøring.nu")) return parseRengoeringNu(body);
  if (lead.leadSource?.includes("AdHelp")) return parseAdHelp(body);
  return {};
}

// Build indices for linking
const gmailByEmail = new Map<string, any[]>();
for (const g of gmailLeads) {
  const em = norm(g.email);
  if (!em) continue;
  if (!gmailByEmail.has(em)) gmailByEmail.set(em, []);
  gmailByEmail.get(em)!.push(g);
}

const gmailByPhone = new Map<string, any[]>();
for (const g of gmailLeads) {
  const ph = (g.phone || "").replace(/\s/g, "");
  if (!ph) continue;
  if (!gmailByPhone.has(ph)) gmailByPhone.set(ph, []);
  gmailByPhone.get(ph)!.push(g);
}

const links: Array<{
  calendarId: string;
  gmailId: string;
  score: number;
  reason: string;
}> = [];
let emailMatches = 0,
  phoneMatches = 0,
  fuzzyMatches = 0;

for (const c of calendarLeads) {
  const cem = norm(c.email);
  const cph = (c.phone || "").replace(/\s/g, "");
  let linked: any[] | null = null;
  let reason = "";

  if (cem && gmailByEmail.has(cem)) {
    linked = gmailByEmail.get(cem)!;
    reason = "email";
    emailMatches++;
  } else if (cph && gmailByPhone.has(cph)) {
    linked = gmailByPhone.get(cph)!;
    reason = "phone";
    phoneMatches++;
  } else {
    // Fuzzy: name + date +-1d + address similarity
    const candidates = gmailLeads.filter(
      g => dateDiffDays(c.calendarDate, g.gmailDate) <= 1
    );
    let best: { g: any; score: number } | null = null;
    for (const g of candidates) {
      const ns = namesSimilar(c.name, g.name);
      const as = addressSimilar(c.address, g.address);
      const score = ns * 0.7 + as * 0.3;
      if (!best || score > best.score) best = { g, score };
    }
    if (best && best.score >= 0.65) {
      linked = [best.g];
      reason = `fuzzy:${best.score.toFixed(2)}`;
      fuzzyMatches++;
    }
  }

  if (linked && linked.length > 0) {
    for (const g of linked) {
      links.push({
        calendarId: c.id || c.calendarEventId || "",
        gmailId: g.gmailThreadId || g.id || "",
        score: 1,
        reason,
      });
      // Enrich both sides: fill missing fields
      c.email = c.email || g.email;
      c.phone = c.phone || g.phone;
      c.address = c.address || g.address;
      c.serviceType = c.serviceType || g.serviceType;
      c.propertySize = c.propertySize || g.propertySize;
      c.price = c.price ?? g.price ?? null;
      c.timeEstimate = c.timeEstimate || g.timeEstimate;

      g.email = g.email || c.email;
      g.phone = g.phone || c.phone;
      g.address = g.address || c.address;
      g.serviceType = g.serviceType || c.serviceType;
      g.propertySize = g.propertySize || c.propertySize;
      g.price = g.price ?? c.price ?? null;
      g.timeEstimate = g.timeEstimate || c.timeEstimate;

      // Partner parsing enrich
      const p = enrichFromPartner(g);
      g.name = g.name || p.name || g.name;
      g.email = g.email || p.email || g.email;
      g.phone = g.phone || p.phone || g.phone;
      g.address = g.address || p.address || g.address;
      g.serviceType = g.serviceType || p.serviceType || g.serviceType;
      g.propertySize = g.propertySize || p.propertySize || g.propertySize;
      g.deadline = g.deadline || p.deadline || g.deadline;
      g.price = g.price ?? p.price ?? g.price;
      if (p.timeEstimate) g.timeEstimate = g.timeEstimate || p.timeEstimate;

      (c as any).gmailThreadId = g.gmailThreadId || g.id;
      (g as any).linkedCalendarId = c.calendarEventId || c.id;
    }
  }
}

console.log("\n📊 LINKING RESULTS:");
console.log("=".repeat(70));
console.log(`Email matches: ${emailMatches}`);
console.log(`Phone matches: ${phoneMatches}`);
console.log(`Fuzzy matches: ${fuzzyMatches}`);
console.log(`Total links: ${links.length}`);

// Save V4.1
const outPath = resolve(
  process.cwd(),
  "server/integrations/chromadb/test-data/complete-leads-v4.1.json"
);
const output = {
  metadata: {
    base: "complete-leads-v4.json",
    generated: new Date().toISOString(),
    counts: {
      total: leads.length,
      gmail: gmailLeads.length,
      calendar: calendarLeads.length,
      billy: billyLeads.length,
    },
    links: {
      total: links.length,
      emailMatches,
      phoneMatches,
      fuzzyMatches,
    },
  },
  leads,
  links,
};

writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\n✅ Saved V4.1 dataset to: ${outPath}`);
console.log("");
