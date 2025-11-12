/**
 * Build ENRICHED Customer Profiles V2
 *
 * Parse EVERYTHING from calendar descriptions:
 * - Address details
 * - Service type (Flytterengøring, Hovedrengøring, etc.)
 * - Property size (m²)
 * - Time estimates
 * - Price info
 * - Access codes
 * - Special instructions
 *
 * Use this rich data for better matching!
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🏗️  BUILDING ENRICHED CUSTOMER PROFILES V2\n");
console.log("=".repeat(70));

interface ServiceDetails {
  type?: string; // Flytterengøring, Hovedrengøring, Fast rengøring
  propertySize?: string; // m²
  timeEstimate?: string; // hours
  price?: string; // kr.
  rooms?: string;
  services?: string[]; // vinduespu dsning, gulvvask, etc.
  accessCode?: string;
  specialInstructions?: string;
}

interface EnrichedCalendarEvent {
  eventId: string;
  title: string;
  date: string;
  location?: string;
  fullAddress?: string; // Parsed from description
  serviceDetails: ServiceDetails;
  rawDescription?: string;
}

interface EnrichedCustomerProfile {
  id: string;
  name: string;
  normalizedName: string;

  // Contact
  emails: string[];
  phones: string[];
  addresses: string[];
  companies: string[];

  // References
  billyCustomerId?: string;
  calendarEvents: EnrichedCalendarEvent[];
  gmailThreads: Array<{
    threadId: string;
    subject: string;
    snippet?: string;
    email?: string;
  }>;

  // Service summary
  totalBookings: number;
  serviceTypes: string[];
  totalRevenue?: string;

  // Metadata
  sources: ("billy" | "calendar" | "gmail")[];
  confidence: number;
  lastActivity?: string;

  rawData: {
    billy?: any;
    calendar?: any[];
    gmail?: any[];
  };
}

// Parse service details from description
function parseServiceDetails(description: string): ServiceDetails {
  const details: ServiceDetails = {
    services: [],
  };

  const lower = description.toLowerCase();

  // Service type
  if (lower.includes("flytterengøring")) details.type = "Flytterengøring";
  else if (lower.includes("hovedrengøring")) details.type = "Hovedrengøring";
  else if (lower.includes("fast rengøring")) details.type = "Fast Rengøring";
  else if (lower.includes("restaur ant")) details.type = "Restaurant Rengøring";
  else if (lower.includes("erhverv")) details.type = "Erhvervsrengøring";

  // Property size
  const m2Match = description.match(/(\d+)\s*m²/i);
  if (m2Match) details.propertySize = m2Match[1] + " m²";

  // Time estimate
  const timeMatch = description.match(/(\d+(?:-\d+)?)\s*timer/i);
  if (timeMatch) details.timeEstimate = timeMatch[1] + " timer";

  // Price
  const priceMatch = description.match(/(\d+[.,]?\d*)\s*kr/i);
  if (priceMatch) details.price = priceMatch[1] + " kr";

  // Rooms
  const roomMatch = description.match(/(\d+)\s*rum/i);
  if (roomMatch) details.rooms = roomMatch[1] + " rum";

  // Services
  if (lower.includes("vindues")) details.services!.push("Vinduespudsning");
  if (lower.includes("gulvvask") || lower.includes("gulv"))
    details.services!.push("Gulvvask");
  if (lower.includes("køkken")) details.services!.push("Køkken");
  if (lower.includes("bad")) details.services!.push("Badeværelse");
  if (lower.includes("støvsug")) details.services!.push("Støvsugning");

  // Access code
  const codeMatch = description.match(/kode[:\s]*(\d+)/i);
  if (codeMatch) details.accessCode = codeMatch[1];

  // Special instructions
  if (lower.includes("ingen sulfo")) {
    details.specialInstructions = "Ingen sulfo på trægulve";
  } else if (lower.includes("svanemærket")) {
    details.specialInstructions = "Svanemærkede produkter";
  }

  return details;
}

// Extract full address from description
function extractAddress(description: string): string | undefined {
  // Look for patterns like "Adr-", "Adresse:", "Lokation:"
  const patterns = [
    /(?:Adr|Adresse|Lokation)[:-]?\s*([^\n]+)/i,
    /([A-ZÆØÅ][\wæøå]+(?:vej|gade|alle|plads|vænget|stræde|bro)[^\n,]{0,30})/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, " ");
    }
  }

  return undefined;
}

// Fuzzy name matching
function normalizeNameForMatching(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\wæøå\s]/g, "");
}

function namesMatch(name1: string, name2: string): number {
  const norm1 = normalizeNameForMatching(name1);
  const norm2 = normalizeNameForMatching(name2);

  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return (
      Math.min(norm1.length, norm2.length) /
      Math.max(norm1.length, norm2.length)
    );
  }

  const words1 = norm1.split(" ");
  const words2 = norm2.split(" ");
  const commonWords = words1.filter(w => words2.includes(w) && w.length > 2);

  if (commonWords.length > 0) {
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  return 0;
}

// Normalize address for matching
function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/[,\.]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\d{4}\s+/g, "") // Remove postal codes
    .trim();
}

function addressesMatch(addr1: string, addr2: string): number {
  const norm1 = normalizeAddress(addr1);
  const norm2 = normalizeAddress(addr2);

  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;

  // Check if street names match
  const street1 = norm1.split(" ")[0];
  const street2 = norm2.split(" ")[0];

  if (street1 && street2 && street1 === street2) return 0.6;

  return 0;
}

function buildEnrichedProfiles() {
  // Load data
  const calendarPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/calendar-enriched.json"
  );
  const googlePath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/google-leads.json"
  );
  const billyPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/real-leads.json"
  );

  const calendarData = JSON.parse(readFileSync(calendarPath, "utf-8"));
  const googleData = JSON.parse(readFileSync(googlePath, "utf-8"));
  const billyData = JSON.parse(readFileSync(billyPath, "utf-8"));

  const gmailLeads = googleData.leads.filter((l: any) => l.source === "gmail");

  console.log("\n📦 DATA LOADED:");
  console.log("-".repeat(70));
  console.log(`Billy: ${billyData.leads.length} customers`);
  console.log(`Calendar: ${calendarData.leads.length} events`);
  console.log(`Gmail: ${gmailLeads.length} threads`);

  // Build profiles
  const profiles = new Map<string, EnrichedCustomerProfile>();
  let profileIdCounter = 1;

  // Lookup maps
  const emailToProfile = new Map<string, string>();
  const phoneToProfile = new Map<string, string>();
  const addressToProfile = new Map<string, string>();

  console.log("\n🔨 STEP 1: Creating base profiles from Billy...");
  console.log("-".repeat(70));

  billyData.leads.forEach((billy: any) => {
    const profileId = `PROFILE_${String(profileIdCounter++).padStart(4, "0")}`;

    const phone = billy.phone?.replace(/\s/g, "");

    profiles.set(profileId, {
      id: profileId,
      name: billy.name,
      normalizedName: normalizeNameForMatching(billy.name),
      emails: [],
      phones: phone ? [phone] : [],
      addresses: [],
      companies: [billy.company].filter(Boolean),
      billyCustomerId: billy.rawData.billyId,
      calendarEvents: [],
      gmailThreads: [],
      totalBookings: 0,
      serviceTypes: [],
      sources: ["billy"],
      confidence: 1.0,
      rawData: {
        billy: billy.rawData.customerData,
        calendar: [],
        gmail: [],
      },
    });

    if (phone) phoneToProfile.set(phone, profileId);
  });

  console.log(`✅ Created ${profiles.size} base profiles`);

  console.log("\n🔨 STEP 2: Enriching with Calendar (with full parsing)...");
  console.log("-".repeat(70));

  let calendarMatches = 0;
  let calendarNewProfiles = 0;

  calendarData.leads.forEach((calEvent: any) => {
    const email = calEvent.email?.toLowerCase();
    const phone = calEvent.phone?.replace(/\s/g, "");
    const name = calEvent.name;
    const description = calEvent.rawData.description || "";
    const location = calEvent.rawData.eventLocation || "";

    // Parse service details
    const serviceDetails = parseServiceDetails(description);
    const fullAddress = extractAddress(description) || location;

    // Try to match
    let matchedProfileId: string | null = null;
    let matchScore = 0;

    // 1. Email match (highest priority)
    if (email && emailToProfile.has(email)) {
      matchedProfileId = emailToProfile.get(email)!;
      matchScore = 1.0;
    }

    // 2. Phone match (very high priority)
    if (!matchedProfileId && phone && phoneToProfile.has(phone)) {
      matchedProfileId = phoneToProfile.get(phone)!;
      matchScore = 0.95;
    }

    // 3. Address match (medium priority)
    if (!matchedProfileId && fullAddress) {
      const normAddr = normalizeAddress(fullAddress);
      for (const [addr, profId] of addressToProfile.entries()) {
        const score = addressesMatch(normAddr, addr);
        if (score > 0.7 && score > matchScore) {
          matchScore = score;
          matchedProfileId = profId;
        }
      }
    }

    // 4. Name fuzzy match (lower priority)
    if (!matchedProfileId) {
      for (const [profileId, profile] of profiles.entries()) {
        const score = namesMatch(name, profile.name);
        if (score >= 0.75 && score > matchScore) {
          matchScore = score;
          matchedProfileId = profileId;
        }
      }
    }

    // Create enriched calendar event
    const enrichedEvent: EnrichedCalendarEvent = {
      eventId: `CAL_${calEvent.rawData.eventStart}`,
      title: calEvent.rawData.eventTitle,
      date: calEvent.rawData.eventStart,
      location,
      fullAddress,
      serviceDetails,
      rawDescription: description.substring(0, 500),
    };

    // Match found
    if (matchedProfileId && matchScore >= 0.7) {
      const profile = profiles.get(matchedProfileId)!;

      if (email && !profile.emails.includes(email)) {
        profile.emails.push(email);
        emailToProfile.set(email, matchedProfileId);
      }

      if (phone && !profile.phones.includes(phone)) {
        profile.phones.push(phone);
        phoneToProfile.set(phone, matchedProfileId);
      }

      if (fullAddress && !profile.addresses.includes(fullAddress)) {
        profile.addresses.push(fullAddress);
        addressToProfile.set(normalizeAddress(fullAddress), matchedProfileId);
      }

      profile.calendarEvents.push(enrichedEvent);
      profile.totalBookings++;

      if (
        serviceDetails.type &&
        !profile.serviceTypes.includes(serviceDetails.type)
      ) {
        profile.serviceTypes.push(serviceDetails.type);
      }

      if (!profile.sources.includes("calendar")) {
        profile.sources.push("calendar");
      }

      profile.rawData.calendar = profile.rawData.calendar || [];
      profile.rawData.calendar.push(calEvent.rawData);

      profile.confidence = Math.min(1.0, profile.confidence + 0.05);
      profile.lastActivity = calEvent.rawData.eventStart;

      calendarMatches++;
    } else {
      // Create new profile
      const profileId = `PROFILE_${String(profileIdCounter++).padStart(4, "0")}`;

      profiles.set(profileId, {
        id: profileId,
        name,
        normalizedName: normalizeNameForMatching(name),
        emails: email ? [email] : [],
        phones: phone ? [phone] : [],
        addresses: fullAddress ? [fullAddress] : [],
        companies: calEvent.company ? [calEvent.company] : [],
        calendarEvents: [enrichedEvent],
        gmailThreads: [],
        totalBookings: 1,
        serviceTypes: serviceDetails.type ? [serviceDetails.type] : [],
        sources: ["calendar"],
        confidence: 0.8,
        lastActivity: calEvent.rawData.eventStart,
        rawData: {
          calendar: [calEvent.rawData],
          gmail: [],
        },
      });

      if (email) emailToProfile.set(email, profileId);
      if (phone) phoneToProfile.set(phone, profileId);
      if (fullAddress)
        addressToProfile.set(normalizeAddress(fullAddress), profileId);

      calendarNewProfiles++;
    }
  });

  console.log(
    `✅ Matched ${calendarMatches} calendar events to existing profiles`
  );
  console.log(`✅ Created ${calendarNewProfiles} new profiles`);

  console.log("\n🔨 STEP 3: Enriching with Gmail...");
  console.log("-".repeat(70));

  let gmailMatches = 0;
  let gmailNewProfiles = 0;

  gmailLeads.forEach((gmail: any) => {
    const email = gmail.email?.toLowerCase();

    let matchedProfileId: string | null = null;

    if (email && emailToProfile.has(email)) {
      matchedProfileId = emailToProfile.get(email)!;
    }

    if (matchedProfileId) {
      const profile = profiles.get(matchedProfileId)!;

      if (email && !profile.emails.includes(email)) {
        profile.emails.push(email);
      }

      profile.gmailThreads.push({
        threadId: gmail.rawData.threadId,
        subject: gmail.rawData.subject,
        snippet: gmail.rawData.snippet,
        email,
      });

      if (!profile.sources.includes("gmail")) {
        profile.sources.push("gmail");
      }

      profile.rawData.gmail = profile.rawData.gmail || [];
      profile.rawData.gmail.push(gmail.rawData);

      profile.confidence = Math.min(1.0, profile.confidence + 0.05);

      gmailMatches++;
    } else {
      const profileId = `PROFILE_${String(profileIdCounter++).padStart(4, "0")}`;

      profiles.set(profileId, {
        id: profileId,
        name: gmail.name,
        normalizedName: normalizeNameForMatching(gmail.name),
        emails: email ? [email] : [],
        phones: [],
        addresses: [],
        companies: gmail.company ? [gmail.company] : [],
        calendarEvents: [],
        gmailThreads: [
          {
            threadId: gmail.rawData.threadId,
            subject: gmail.rawData.subject,
            snippet: gmail.rawData.snippet,
            email,
          },
        ],
        totalBookings: 0,
        serviceTypes: [],
        sources: ["gmail"],
        confidence: 0.7,
        rawData: {
          gmail: [gmail.rawData],
          calendar: [],
        },
      });

      if (email) emailToProfile.set(email, profileId);

      gmailNewProfiles++;
    }
  });

  console.log(`✅ Matched ${gmailMatches} Gmail threads`);
  console.log(`✅ Created ${gmailNewProfiles} new profiles`);

  // Analysis
  console.log("\n📊 PROFILE ANALYSIS:");
  console.log("=".repeat(70));

  const profileArray = Array.from(profiles.values());

  const completeProfiles = profileArray.filter(p => p.sources.length === 3);
  const twoSourceProfiles = profileArray.filter(p => p.sources.length === 2);
  const oneSourceProfiles = profileArray.filter(p => p.sources.length === 1);

  console.log(`Total profiles: ${profileArray.length}`);
  console.log(`  • Complete (3 sources): ${completeProfiles.length}`);
  console.log(`  • Partial (2 sources): ${twoSourceProfiles.length}`);
  console.log(`  • Single source: ${oneSourceProfiles.length}`);

  const withEmail = profileArray.filter(p => p.emails.length > 0);
  const withPhone = profileArray.filter(p => p.phones.length > 0);
  const withAddress = profileArray.filter(p => p.addresses.length > 0);
  const withBoth = profileArray.filter(
    p => p.emails.length > 0 && p.phones.length > 0
  );

  console.log(`\nContact coverage:`);
  console.log(
    `  • With email: ${withEmail.length} (${Math.round((withEmail.length / profileArray.length) * 100)}%)`
  );
  console.log(
    `  • With phone: ${withPhone.length} (${Math.round((withPhone.length / profileArray.length) * 100)}%)`
  );
  console.log(
    `  • With address: ${withAddress.length} (${Math.round((withAddress.length / profileArray.length) * 100)}%)`
  );
  console.log(
    `  • With email+phone: ${withBoth.length} (${Math.round((withBoth.length / profileArray.length) * 100)}%)`
  );

  // Show samples
  console.log("\n📋 SAMPLE COMPLETE PROFILES (showing 10):");
  console.log("=".repeat(70));

  completeProfiles.slice(0, 10).forEach((profile, i) => {
    console.log(`\n${i + 1}. 👤 ${profile.name} (ID: ${profile.id})`);
    console.log(
      `   Confidence: ${(profile.confidence * 100).toFixed(0)}% | Sources: ${profile.sources.join(", ")}`
    );
    console.log(`   📧 Emails: ${profile.emails.join(", ") || "N/A"}`);
    console.log(`   📱 Phones: ${profile.phones.join(", ") || "N/A"}`);
    console.log(
      `   📍 Addresses: ${profile.addresses.slice(0, 2).join("; ") || "N/A"}`
    );
    console.log(`   🏢 Billy ID: ${profile.billyCustomerId || "N/A"}`);
    console.log(
      `   📅 Bookings: ${profile.totalBookings} (${profile.serviceTypes.join(", ")})`
    );
    console.log(`   💬 Gmail threads: ${profile.gmailThreads.length}`);

    if (profile.calendarEvents.length > 0) {
      const lastEvent =
        profile.calendarEvents[profile.calendarEvents.length - 1];
      console.log(`   🗓️  Last: ${lastEvent.title}`);
      if (lastEvent.serviceDetails.propertySize) {
        console.log(
          `      Size: ${lastEvent.serviceDetails.propertySize}, Time: ${lastEvent.serviceDetails.timeEstimate || "N/A"}`
        );
      }
    }
  });

  // Save
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/enriched-customer-profiles-v2.json"
  );
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      totalProfiles: profileArray.length,
      completeProfiles: completeProfiles.length,
      partialProfiles: twoSourceProfiles.length,
      singleSourceProfiles: oneSourceProfiles.length,
      coverage: {
        withEmail: withEmail.length,
        withPhone: withPhone.length,
        withAddress: withAddress.length,
        withBoth: withBoth.length,
      },
      dataSources: {
        billy: billyData.leads.length,
        calendar: calendarData.leads.length,
        gmail: gmailLeads.length,
      },
    },
    profiles: profileArray.sort((a, b) => {
      // Sort by: sources DESC, bookings DESC, confidence DESC
      if (a.sources.length !== b.sources.length)
        return b.sources.length - a.sources.length;
      if (a.totalBookings !== b.totalBookings)
        return b.totalBookings - a.totalBookings;
      return b.confidence - a.confidence;
    }),
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎯 FINAL SUMMARY - ENRICHED V2");
  console.log("=".repeat(70));

  console.log(`\n✅ PROFILES:`);
  console.log(`  • Total unique: ${profileArray.length}`);
  console.log(`  • Complete (3 sources): ${completeProfiles.length}`);
  console.log(
    `  • High confidence (≥90%): ${profileArray.filter(p => p.confidence >= 0.9).length}`
  );

  console.log(`\n✅ ENRICHMENT:`);
  console.log(
    `  • Billy enriched with email: ${profileArray.filter(p => p.billyCustomerId && p.emails.length > 0).length}`
  );
  console.log(
    `  • Billy enriched with address: ${profileArray.filter(p => p.billyCustomerId && p.addresses.length > 0).length}`
  );
  console.log(
    `  • Total bookings tracked: ${profileArray.reduce((sum, p) => sum + p.totalBookings, 0)}`
  );
  console.log(
    `  • Total Gmail threads: ${profileArray.reduce((sum, p) => sum + p.gmailThreads.length, 0)}`
  );

  console.log(`\n🎯 FOR CHROMADB:`);
  console.log(
    `  • Verified duplicates (3 sources): ${completeProfiles.length}`
  );
  console.log(
    `  • Partial duplicates (2 sources): ${twoSourceProfiles.length}`
  );
  console.log(`  • Total test data points: ${profileArray.length}`);
  console.log(
    `  • High-quality leads (email+phone+address): ${profileArray.filter(p => p.emails.length > 0 && p.phones.length > 0 && p.addresses.length > 0).length}`
  );

  console.log("\n🎉 Enriched customer database V2 is COMPLETE!\n");

  process.exit(0);
}

buildEnrichedProfiles();
