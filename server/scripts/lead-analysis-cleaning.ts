import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.dev") });

import { searchGmailThreads, type GmailThread } from "../google-api";

type LeadType = "Fast rengøring" | "Hovedrengøring" | "Begge" | "Ukendt";
type LeadStatus =
  | "Afventer svar fra kunde"
  | "Afventer svar fra os"
  | "Inaktiv"
  | "Afvist/Ikke interesseret";

type OutputRow = {
  name: string;
  email: string;
  type: LeadType;
  lastContact: string;
  daysSince: number;
  keyInfo?: string;
  offerInfo?: string;
  recommendation?: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result: { months?: number; start?: Date; end?: Date; csv?: boolean } = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--months" && args[i + 1]) {
      result.months = parseInt(args[i + 1], 10);
      i++;
    } else if (a === "--start" && args[i + 1]) {
      result.start = new Date(args[i + 1]);
      i++;
    } else if (a === "--end" && args[i + 1]) {
      result.end = new Date(args[i + 1]);
      i++;
    } else if (a === "--csv") {
      result.csv = true;
    }
  }

  if (!result.start || !result.end) {
    const end = new Date();
    const months = result.months && result.months > 0 ? result.months : 3;
    const start = new Date(end);
    start.setMonth(end.getMonth() - months);
    result.start = start;
    result.end = end;
  }
  return result as { start: Date; end: Date; csv?: boolean };
}

function unixSeconds(d: Date): number {
  return Math.floor(d.getTime() / 1000);
}

function isOurAddress(addr: string): boolean {
  const lower = addr.toLowerCase();
  return (
    lower.includes("@rendetalje.dk") ||
    lower.includes("info@rendetalje.dk") ||
    lower.includes((process.env.GOOGLE_IMPERSONATED_USER || "info@rendetalje.dk").toLowerCase())
  );
}

function isAutomated(addr: string): boolean {
  const lower = addr.toLowerCase();
  return (
    lower.includes("no-reply") ||
    lower.includes("mailer-daemon") ||
    lower.includes("bounce") ||
    lower.includes("noreply")
  );
}

function extractLeadEmail(thread: GmailThread): string {
  // Prefer last non-our sender
  const messages = thread.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const from = messages[i].from || "";
    if (!isOurAddress(from) && !isAutomated(from)) {
      const match = from.match(/<([^>]+)>/);
      return match ? match[1] : from;
    }
  }
  // Fallback to first non-our recipient
  for (let i = messages.length - 1; i >= 0; i--) {
    const to = messages[i].to || "";
    if (!isOurAddress(to)) {
      const match = to.match(/<([^>]+)>/);
      if (match) return match[1];
      const emails = to.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
      if (emails && emails.length) return emails[0];
    }
  }
  return "";
}

function extractLeadNameFromHeader(header: string): string {
  const match = header.match(/^\s*"?([^"<]+)"?\s*<[^>]+>$/);
  if (match) return match[1].trim();
  const beforeAt = header.split("@")[0];
  return beforeAt
    .split(/[._-]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function extractPhone(text: string): string | undefined {
  const m = text.match(/\b(?:\+?45\s*)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})\b/);
  return m ? m[0].replace(/\s+/g, "") : undefined;
}

function extractAddress(text: string): string | undefined {
  const m = text.match(/\b(?:Adresse|address|addresse)\s*[:\-]?\s*([^\n]+)\b/i);
  return m ? m[1].trim() : undefined;
}

function extractSquareMeters(text: string): string | undefined {
  const m = text.match(/(\d{2,4})\s*(?:m2|m²|kvadratmeter)/i);
  return m ? `${m[1]} m²` : undefined;
}

function extractFrequency(text: string): string | undefined {
  const patterns = [
    { re: /(hver\s*uge|ugentlig)/i, val: "Ugentlig" },
    { re: /(hver\s*14\s*dage|hver anden uge|biugentlig)/i, val: "Hver 14. dag" },
    { re: /(månedlig|hver\s*måned)/i, val: "Månedlig" },
    { re: /(engangs|one\-off|hovedrengøring)/i, val: "Engangs/Hovedrengøring" },
  ];
  for (const p of patterns) {
    if (p.re.test(text)) return p.val;
  }
  return undefined;
}

function determineType(thread: GmailThread): LeadType {
  const text = (thread.messages || [])
    .map(m => (m.bodyText || m.body || "").toLowerCase())
    .join("\n");
  const hasFast = /fast\s*rengøring|løbende\s*rengøring|ugentlig/i.test(text);
  const hasMain = /hovedrengøring|engangs\s*rengøring/i.test(text);
  if (hasFast && hasMain) return "Begge";
  if (hasFast) return "Fast rengøring";
  if (hasMain) return "Hovedrengøring";
  return "Ukendt";
}

function determineStatus(thread: GmailThread): LeadStatus {
  const messages = thread.messages || [];
  if (messages.length === 0) return "Inaktiv";
  const last = messages[messages.length - 1];
  const lastFromUs = isOurAddress(last.from || "");
  const days = daysSince(last.date || new Date().toISOString());
  const text = (last.bodyText || last.body || "").toLowerCase();
  const declined = /(ikke\s*interesseret|nej\s*tak|afviser)/i.test(text);
  if (declined) return "Afvist/Ikke interesseret";
  if (!lastFromUs) {
    return days > 14 ? "Inaktiv" : "Afventer svar fra os";
  }
  return days > 14 ? "Inaktiv" : "Afventer svar fra kunde";
}

function daysSince(dateIso: string): number {
  const d = new Date(dateIso);
  const ms = Date.now() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function buildKeyInfo(thread: GmailThread): string {
  const texts = (thread.messages || [])
    .map(m => (m.bodyText || m.body || ""))
    .join("\n");
  const addr = extractAddress(texts);
  const m2 = extractSquareMeters(texts);
  const freq = extractFrequency(texts);
  const phone = extractPhone(texts);
  const parts = [
    addr ? `Adresse: ${addr}` : undefined,
    m2 ? `Areal: ${m2}` : undefined,
    freq ? `Frekvens: ${freq}` : undefined,
    phone ? `Telefon: ${phone}` : undefined,
  ].filter(Boolean) as string[];
  return parts.join("; ");
}

function buildOfferInfo(thread: GmailThread): string | undefined {
  // Scan our last message for price/offer details
  const messages = thread.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (isOurAddress(m.from || "")) {
      const txt = (m.bodyText || m.body || "").toLowerCase();
      const price = txt.match(/(\d+[\.,]?\d*)\s*(kr|dkk)/i)?.[0];
      const freq = extractFrequency(txt);
      if (price || freq) {
        return [price ? `Pris: ${price}` : undefined, freq ? `Frekvens: ${freq}` : undefined]
          .filter(Boolean)
          .join("; ");
      }
    }
  }
  return undefined;
}

function extractName(thread: GmailThread): string {
  const messages = thread.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const from = messages[i].from || "";
    if (!isOurAddress(from) && !isAutomated(from)) {
      return extractLeadNameFromHeader(from);
    }
  }
  return "";
}

function toRow(thread: GmailThread): OutputRow {
  const last = (thread.messages || [])[thread.messages.length - 1];
  const lastDate = last?.date || thread.date || new Date().toISOString();
  const email = extractLeadEmail(thread);
  const name = extractName(thread);
  return {
    name: name || "(Ukendt)",
    email: email || "",
    type: ((t => (t === "Ukendt" ? ("Ukendt" as LeadType) : t))(determineType(thread))),
    lastContact: lastDate,
    daysSince: daysSince(lastDate),
    keyInfo: buildKeyInfo(thread) || undefined,
    offerInfo: buildOfferInfo(thread),
    recommendation: undefined,
  };
}

function printTable(title: string, rows: OutputRow[], columns: (keyof OutputRow)[], extraNote?: string) {
  console.log(`\n## ${title}`);
  const header = `| ${columns.map(c => formatHeader(c)).join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  console.log(header);
  console.log(sep);
  for (const r of rows) {
    const line = `| ${columns.map(c => formatCell(r[c])).join(" | ")} |`;
    console.log(line);
  }
  console.log(`\nTotal: ${rows.length}`);
  if (extraNote) console.log(extraNote);
}

function formatHeader(key: keyof OutputRow): string {
  switch (key) {
    case "name": return "Navn";
    case "email": return "Email";
    case "type": return "Type";
    case "lastContact": return "Sidste kontakt";
    case "daysSince": return "Dage siden";
    case "keyInfo": return "Nøgleinfo";
    case "offerInfo": return "Hvad vi tilbød";
    case "recommendation": return "Anbefaling";
    default: return String(key);
  }
}

function formatCell(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v.replace(/\r?\n/g, " ").trim();
  if (typeof v === "number") return String(v);
  return String(v);
}

async function main() {
  const { start, end, csv } = parseArgs();
  console.log("🔍 OPGAVE: Lead-analyse for rengøringskunder");
  console.log(
    `📅 Periode: ${start.toISOString().split("T")[0]} → ${end.toISOString().split("T")[0]}`
  );

  const keywords = [
    "rengøring",
    '"fast rengøring"',
    "hovedrengøring",
    "tilbud",
    "pris",
  ];
  const query = `in:anywhere (${keywords.join(" OR ")}) after:${unixSeconds(start)} before:${unixSeconds(end)}`;

  const threads = await searchGmailThreads({ query, maxResults: 200 });

  const rows = threads.map(toRow);

  const p1 = rows
    .filter(r => r.email && r.daysSince >= 0)
    .filter((_, idx) => {
      const t = threads[idx];
      const last = t.messages[t.messages.length - 1];
      return !isOurAddress(last.from || "");
    })
    .sort((a, b) => b.daysSince - a.daysSince);

  const p2 = rows
    .filter(r => r.email && r.daysSince >= 0)
    .filter((_, idx) => {
      const t = threads[idx];
      const last = t.messages[t.messages.length - 1];
      return isOurAddress(last.from || "");
    })
    .sort((a, b) => b.daysSince - a.daysSince);

  const p3 = rows
    .filter(r => r.daysSince > 14)
    .sort((a, b) => b.daysSince - a.daysSince)
    .map(r => ({ ...r, recommendation: "Send høflig opfølgning eller arkiver" }));

  printTable("🔥 PRIORITET 1: Klar til opfølgning (de har skrevet sidst)", p1, [
    "name",
    "email",
    "type",
    "lastContact",
    "daysSince",
    "keyInfo",
  ]);

  printTable("⏳ PRIORITET 2: Afventer deres svar (vi har skrevet sidst)", p2, [
    "name",
    "email",
    "type",
    "lastContact",
    "daysSince",
    "offerInfo",
  ]);

  printTable("❄️ PRIORITET 3: Inaktive/kolde leads (>14 dage)", p3, [
    "name",
    "email",
    "type",
    "lastContact",
    "recommendation",
  ]);

  if (csv) {
    const { writeFileSync, mkdirSync, existsSync } = await import("fs");
    const outDir = "exports";
    if (!existsSync(outDir)) mkdirSync(outDir);
    const toCsv = (rows: any[], columns: (keyof OutputRow)[]) => {
      const header = columns.map(c => formatHeader(c)).join(",");
      const lines = rows.map(r =>
        columns
          .map(c => {
            const v = formatCell(r[c]);
            const escaped = v.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      );
      return [header, ...lines].join("\n");
    };
    writeFileSync(
      `${outDir}/lead-analysis-priority1.csv`,
      toCsv(p1, ["name", "email", "type", "lastContact", "daysSince", "keyInfo"]),
      "utf8"
    );
    writeFileSync(
      `${outDir}/lead-analysis-priority2.csv`,
      toCsv(p2, ["name", "email", "type", "lastContact", "daysSince", "offerInfo"]),
      "utf8"
    );
    writeFileSync(
      `${outDir}/lead-analysis-priority3.csv`,
      toCsv(p3, ["name", "email", "type", "lastContact", "recommendation"]),
      "utf8"
    );
    console.log("💾 CSV eksport gemt i ./exports/");
  }
}

// Only run main() and exit if this file is executed directly (not imported for tests)
// Check if running as script (not imported) by comparing import.meta.url with process.argv[1]
const isMainModule = import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") || "") || 
                     process.argv[1]?.includes("lead-analysis-cleaning");
if (isMainModule && !process.env.VITEST) {
  main().catch(err => {
    console.error("❌ Fejl i lead-analyse:", err?.message || err);
    process.exit(1);
  });
}

export {
  determineType,
  determineStatus,
  extractPhone,
  extractAddress,
  extractSquareMeters,
  extractFrequency,
};
