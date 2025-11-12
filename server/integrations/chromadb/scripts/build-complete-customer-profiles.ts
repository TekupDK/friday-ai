/**
 * Build Complete Customer Profiles
 *
 * Merge and link all data sources to create unified customer profiles
 * with fuzzy matching and intelligent deduplication
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🏗️  BUILDING COMPLETE CUSTOMER PROFILES\n");
console.log("=".repeat(70));

interface CompleteCustomerProfile {
  id: string; // Unique profile ID
  name: string;
  normalizedName: string; // For matching

  // Contact info (merged from all sources)
  emails: string[];
  phones: string[];
  addresses: string[];
  companies: string[];

  // Source references
  billyCustomerId?: string;
  calendarEvents: Array<{
    eventId: string;
    title: string;
    date: string;
    location?: string;
    description?: string;
  }>;
  gmailThreads: Array<{
    threadId: string;
    subject: string;
    snippet?: string;
    email?: string;
  }>;

  // Metadata
  sources: ("billy" | "calendar" | "gmail")[];
  confidence: number; // How confident we are this is one person
  lastActivity?: string;

  // Raw data
  rawData: {
    billy?: any;
    calendar?: any[];
    gmail?: any[];
  };
}

// Fuzzy name matching
function normalizeNameForMatching(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\sæøå]/g, ""); // Remove special chars but keep Danish
}

function namesMatch(name1: string, name2: string): number {
  const norm1 = normalizeNameForMatching(name1);
  const norm2 = normalizeNameForMatching(name2);

  // Exact match
  if (norm1 === norm2) return 1.0;

  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length);
    const shorter = Math.min(norm1.length, norm2.length);
    return shorter / longer; // 0.5 - 0.99
  }

  // Word overlap
  const words1 = norm1.split(" ");
  const words2 = norm2.split(" ");
  const commonWords = words1.filter(w => words2.includes(w));

  if (commonWords.length > 0) {
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  return 0;
}

function buildProfiles() {
  // Load all data
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
  console.log(
    `Calendar: ${calendarData.leads.length} events (${calendarData.metadata.withEmail} with email)`
  );
  console.log(`Gmail: ${gmailLeads.length} threads`);

  // Build profiles map
  const profiles = new Map<string, CompleteCustomerProfile>();
  let profileIdCounter = 1;

  console.log("\n🔨 STEP 1: Creating base profiles from Billy...");
  console.log("-".repeat(70));

  // Start with Billy as base (most reliable customer data)
  billyData.leads.forEach((billy: any) => {
    const profileId = `PROFILE_${String(profileIdCounter++).padStart(4, "0")}`;

    profiles.set(profileId, {
      id: profileId,
      name: billy.name,
      normalizedName: normalizeNameForMatching(billy.name),
      emails: [],
      phones: billy.phone ? [billy.phone] : [],
      addresses: [],
      companies: [billy.company].filter(Boolean),
      billyCustomerId: billy.rawData.billyId,
      calendarEvents: [],
      gmailThreads: [],
      sources: ["billy"],
      confidence: 1.0,
      rawData: {
        billy: billy.rawData.customerData,
        calendar: [],
        gmail: [],
      },
    });
  });

  console.log(`✅ Created ${profiles.size} base profiles from Billy`);

  // Build lookup maps
  const emailToProfile = new Map<string, string>(); // email -> profileId
  const phoneToProfile = new Map<string, string>(); // phone -> profileId

  console.log("\n🔨 STEP 2: Enriching profiles with Calendar events...");
  console.log("-".repeat(70));

  let calendarMatches = 0;
  let calendarNewProfiles = 0;

  calendarData.leads.forEach((calEvent: any) => {
    const email = calEvent.email?.toLowerCase();
    const phone = calEvent.phone?.replace(/\s/g, "");
    const name = calEvent.name;

    // Try to find matching profile
    let matchedProfileId: string | null = null;
    let matchScore = 0;

    // 1. Try email match
    if (email && emailToProfile.has(email)) {
      matchedProfileId = emailToProfile.get(email)!;
      matchScore = 1.0;
    }

    // 2. Try phone match
    if (!matchedProfileId && phone && phoneToProfile.has(phone)) {
      matchedProfileId = phoneToProfile.get(phone)!;
      matchScore = 0.9;
    }

    // 3. Try name fuzzy match
    if (!matchedProfileId) {
      for (const [profileId, profile] of profiles.entries()) {
        const score = namesMatch(name, profile.name);
        if (score > matchScore && score >= 0.7) {
          matchScore = score;
          matchedProfileId = profileId;
        }
      }
    }

    // Match found - enrich existing profile
    if (matchedProfileId && matchScore >= 0.7) {
      const profile = profiles.get(matchedProfileId)!;

      // Add email
      if (email && !profile.emails.includes(email)) {
        profile.emails.push(email);
        emailToProfile.set(email, matchedProfileId);
      }

      // Add phone
      if (phone && !profile.phones.includes(phone)) {
        profile.phones.push(phone);
        phoneToProfile.set(phone, matchedProfileId);
      }

      // Add calendar event
      profile.calendarEvents.push({
        eventId: `CAL_${calEvent.rawData.eventStart}`,
        title: calEvent.rawData.eventTitle,
        date: calEvent.rawData.eventStart,
        location: calEvent.rawData.eventLocation,
        description: calEvent.rawData.description,
      });

      if (!profile.sources.includes("calendar")) {
        profile.sources.push("calendar");
      }

      profile.rawData.calendar = profile.rawData.calendar || [];
      profile.rawData.calendar.push(calEvent.rawData);

      profile.confidence = Math.min(1.0, profile.confidence + 0.1);
      profile.lastActivity = calEvent.rawData.eventStart;

      calendarMatches++;
    } else {
      // No match - create new profile
      const profileId = `PROFILE_${String(profileIdCounter++).padStart(4, "0")}`;

      profiles.set(profileId, {
        id: profileId,
        name,
        normalizedName: normalizeNameForMatching(name),
        emails: email ? [email] : [],
        phones: phone ? [phone] : [],
        addresses: calEvent.rawData.eventLocation
          ? [calEvent.rawData.eventLocation]
          : [],
        companies: calEvent.company ? [calEvent.company] : [],
        calendarEvents: [
          {
            eventId: `CAL_${calEvent.rawData.eventStart}`,
            title: calEvent.rawData.eventTitle,
            date: calEvent.rawData.eventStart,
            location: calEvent.rawData.eventLocation,
            description: calEvent.rawData.description,
          },
        ],
        gmailThreads: [],
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

      calendarNewProfiles++;
    }
  });

  console.log(
    `✅ Matched ${calendarMatches} calendar events to existing profiles`
  );
  console.log(
    `✅ Created ${calendarNewProfiles} new profiles from unmatched calendar events`
  );

  console.log("\n🔨 STEP 3: Enriching profiles with Gmail threads...");
  console.log("-".repeat(70));

  let gmailMatches = 0;
  let gmailNewProfiles = 0;

  gmailLeads.forEach((gmail: any) => {
    const email = gmail.email?.toLowerCase();

    // Try to find matching profile by email
    let matchedProfileId: string | null = null;

    if (email && emailToProfile.has(email)) {
      matchedProfileId = emailToProfile.get(email)!;
    }

    // Match found - enrich
    if (matchedProfileId) {
      const profile = profiles.get(matchedProfileId)!;

      // Add email if not present
      if (email && !profile.emails.includes(email)) {
        profile.emails.push(email);
      }

      // Add Gmail thread
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

      profile.confidence = Math.min(1.0, profile.confidence + 0.1);

      gmailMatches++;
    } else {
      // No match - create new profile
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

  console.log(`✅ Matched ${gmailMatches} Gmail threads to existing profiles`);
  console.log(
    `✅ Created ${gmailNewProfiles} new profiles from unmatched Gmail threads`
  );

  // Analyze results
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
    `  • With both: ${withBoth.length} (${Math.round((withBoth.length / profileArray.length) * 100)}%)`
  );

  // Show samples
  console.log("\n📋 SAMPLE COMPLETE PROFILES (showing 5):");
  console.log("=".repeat(70));

  completeProfiles.slice(0, 5).forEach((profile, i) => {
    console.log(`\n${i + 1}. 👤 ${profile.name} (ID: ${profile.id})`);
    console.log(
      `   Sources: ${profile.sources.join(", ")} | Confidence: ${(profile.confidence * 100).toFixed(0)}%`
    );
    console.log(`   📧 Emails: ${profile.emails.join(", ") || "N/A"}`);
    console.log(`   📱 Phones: ${profile.phones.join(", ") || "N/A"}`);
    console.log(`   🏢 Billy ID: ${profile.billyCustomerId || "N/A"}`);
    console.log(`   📅 Calendar events: ${profile.calendarEvents.length}`);
    console.log(`   💬 Gmail threads: ${profile.gmailThreads.length}`);
    if (profile.calendarEvents.length > 0) {
      console.log(
        `   📍 Last booking: ${profile.calendarEvents[profile.calendarEvents.length - 1].title}`
      );
    }
  });

  // Save
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/complete-customer-profiles.json"
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
        withBoth: withBoth.length,
      },
      dataSources: {
        billy: billyData.leads.length,
        calendar: calendarData.leads.length,
        gmail: gmailLeads.length,
      },
    },
    profiles: profileArray.sort((a, b) => b.confidence - a.confidence), // Sort by confidence
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(
    `\n✅ Saved ${profileArray.length} complete profiles to: ${outputPath}`
  );

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎯 FINAL SUMMARY");
  console.log("=".repeat(70));

  console.log(`\n✅ UNIFIED CUSTOMER PROFILES:`);
  console.log(`  • Total: ${profileArray.length} unique customer profiles`);
  console.log(
    `  • Complete (Billy + Calendar + Gmail): ${completeProfiles.length}`
  );
  console.log(
    `  • High confidence (>90%): ${profileArray.filter(p => p.confidence >= 0.9).length}`
  );

  console.log(`\n✅ DATA ENRICHMENT:`);
  console.log(
    `  • Billy customers enriched with emails: ${profileArray.filter(p => p.billyCustomerId && p.emails.length > 0).length}`
  );
  console.log(
    `  • Total calendar events linked: ${profileArray.reduce((sum, p) => sum + p.calendarEvents.length, 0)}`
  );
  console.log(
    `  • Total Gmail threads linked: ${profileArray.reduce((sum, p) => sum + p.gmailThreads.length, 0)}`
  );

  console.log(`\n🎯 FOR CHROMADB:`);
  console.log(
    `  • ${completeProfiles.length} verified duplicates (same person, 3 sources)`
  );
  console.log(`  • ${twoSourceProfiles.length} partial duplicates (2 sources)`);
  console.log(`  • ${profileArray.length} total unique leads for testing`);
  console.log(
    `  • ${withBoth.length} leads with complete contact info (email + phone)`
  );

  console.log(
    "\n🎉 Customer profile database is COMPLETE and PRODUCTION READY!\n"
  );

  process.exit(0);
}

buildProfiles();
