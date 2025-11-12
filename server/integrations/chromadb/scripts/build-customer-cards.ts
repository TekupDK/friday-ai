/**
 * Build Complete Customer Cards
 *
 * Parse EVERYTHING and create production-ready customer cards:
 * - Service history with pricing
 * - Service type classification (REN-001 to REN-005)
 * - Fast rengøring: første gang vs vedligeholdelse
 * - Next booking prediction
 * - Revenue tracking
 * - Notes & flags from descriptions
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

console.log("🏗️  BUILDING COMPLETE CUSTOMER CARDS\n");
console.log("=".repeat(70));

// Service type classification
enum ServiceType {
  PRIVAT = "REN-001", // Privatrengøring
  HOVED = "REN-002", // Hovedrengøring
  FLYT = "REN-003", // Flytterengøring
  ERHVERV = "REN-004", // Erhvervsrengøring
  FAST = "REN-005", // Fast rengøring
}

interface ServiceEvent {
  id: string;
  date: string;
  title: string;
  serviceType: ServiceType;
  serviceName: string;
  isFirstTime?: boolean; // For fast rengøring

  // Parsed details
  propertySize?: string; // m²
  timeEstimate?: string; // timer
  timeActual?: string; // faktisk tid
  priceEstimate?: number; // kr
  priceActual?: number; // kr
  hourlyRate: number; // 349 kr/t

  // Location
  address?: string;
  accessCode?: string;

  // Services included
  services: string[];
  windowCleaning?: boolean;

  // Status
  status: "planned" | "completed" | "cancelled" | "rebooked";

  // Notes
  notes?: string;
  specialInstructions?: string;
  conflicts?: string; // Kunde var sur, rabat givet, etc.
  discount?: string;

  // Raw
  rawDescription?: string;
}

interface CustomerCard {
  // Core identity
  profileId: string;
  name: string;

  // Contact
  emails: string[];
  phones: string[];
  addresses: string[];
  primaryEmail?: string;
  primaryPhone?: string;
  primaryAddress?: string;

  // Billy integration
  billyCustomerId?: string;
  billyCompany?: string;

  // Service history
  serviceHistory: ServiceEvent[];
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;

  // Service breakdown
  serviceBreakdown: {
    [ServiceType.PRIVAT]: number;
    [ServiceType.HOVED]: number;
    [ServiceType.FLYT]: number;
    [ServiceType.ERHVERV]: number;
    [ServiceType.FAST]: number;
  };

  // Fast rengøring tracking
  isFastCustomer: boolean;
  fastRengøringCount?: number;
  fastRengøringFrequency?: string; // "hver 3. uge", "månedlig", etc.
  nextScheduledCleaning?: string;

  // Financial
  totalRevenue: number;
  averageBookingValue: number;
  lifetimeValue: number;

  // Gmail threads
  gmailThreads: Array<{
    threadId: string;
    subject: string;
    date?: string;
  }>;

  // Flags & notes
  hasConflicts: boolean;
  conflictNotes: string[];
  discountHistory: string[];
  preferences: string[];

  // Next action
  nextAction?: string;
  nextActionDue?: string;

  // Metadata
  sources: string[];
  confidence: number;
  firstSeen?: string;
  lastActivity?: string;

  // Raw data
  rawData: any;
}

// Classify service type from event title/description
function classifyServiceType(
  title: string,
  description: string
): { type: ServiceType; name: string; isFirstTime?: boolean } {
  const combined = (title + " " + description).toLowerCase();

  // Fast rengøring (check for counter/number)
  if (combined.includes("fast rengøring")) {
    const firstTimeMatch = combined.match(/#1|første gang|first time|grundig/i);
    const isFirstTime = !!firstTimeMatch;

    return {
      type: ServiceType.FAST,
      name: "Fast Rengøring",
      isFirstTime,
    };
  }

  // Flytterengøring
  if (combined.includes("flytte")) {
    return { type: ServiceType.FLYT, name: "Flytterengøring" };
  }

  // Hovedrengøring
  if (combined.includes("hoved")) {
    return { type: ServiceType.HOVED, name: "Hovedrengøring" };
  }

  // Erhverv (restaurant, kontor, etc.)
  if (
    combined.includes("restaurant") ||
    combined.includes("erhverv") ||
    combined.includes("kontor") ||
    combined.includes("forretning")
  ) {
    return { type: ServiceType.ERHVERV, name: "Erhvervsrengøring" };
  }

  // Default: Privatrengøring
  return { type: ServiceType.PRIVAT, name: "Privatrengøring" };
}

// Parse service event from calendar event
function parseServiceEvent(calEvent: any): ServiceEvent {
  const title = calEvent.rawData.eventTitle || "";
  const description = calEvent.rawData.description || "";
  const date = calEvent.rawData.eventStart;

  const { type, name, isFirstTime } = classifyServiceType(title, description);

  // Parse property size
  const m2Match = description.match(/(\d+)\s*m²/i);
  const propertySize = m2Match ? m2Match[1] + " m²" : undefined;

  // Parse time estimate
  const timeMatch = description.match(/(\d+(?:-\d+)?)\s*timer/i);
  const timeEstimate = timeMatch ? timeMatch[1] + " timer" : undefined;

  // Parse actual time (if mentioned)
  const actualTimeMatch = description.match(/(\d+)\s*arbejdstimer/i);
  const timeActual = actualTimeMatch
    ? actualTimeMatch[1] + " timer"
    : undefined;

  // Parse price
  const priceMatch = description.match(/(\d+[.,]?\d*)\s*kr/i);
  const priceEstimate = priceMatch
    ? parseFloat(priceMatch[1].replace(",", "."))
    : undefined;

  // Calculate estimated price from time if not explicit
  let calculatedPrice = priceEstimate;
  if (!calculatedPrice && timeEstimate) {
    const hours = parseFloat(timeEstimate.split("-")[0]);
    if (!isNaN(hours)) {
      calculatedPrice = hours * 349;
    }
  }

  // Parse address
  const addrPatterns = [
    /(?:Adr|Adresse|Lokation)[:-]?\s*([^\n]+)/i,
    /([A-ZÆØÅ][\wæøå]+(?:vej|gade|alle|plads|vænget)[^\n,]{0,40})/i,
  ];
  let address = calEvent.rawData.eventLocation;
  if (!address) {
    for (const pattern of addrPatterns) {
      const match = description.match(pattern);
      if (match) {
        address = match[1].trim();
        break;
      }
    }
  }

  // Parse access code
  const codeMatch = description.match(/(?:kode|code)[:\s]*(\d+)/i);
  const accessCode = codeMatch ? codeMatch[1] : undefined;

  // Parse services
  const services: string[] = [];
  if (description.toLowerCase().includes("vindues"))
    services.push("Vinduespudsning");
  if (description.toLowerCase().includes("gulv")) services.push("Gulvvask");
  if (description.toLowerCase().includes("køkken")) services.push("Køkken");
  if (description.toLowerCase().includes("bad")) services.push("Badeværelse");
  if (description.toLowerCase().includes("støvsug"))
    services.push("Støvsugning");

  const windowCleaning = services.includes("Vinduespudsning");

  // Parse status
  let status: ServiceEvent["status"] = "planned";
  if (title.includes("✅") || title.includes("UDFØRT")) status = "completed";
  else if (title.includes("❌") || title.includes("AFLYST"))
    status = "cancelled";
  else if (title.includes("AFLYST") || description.includes("Rebook"))
    status = "rebooked";
  else if (date < new Date().toISOString()) status = "completed"; // Past date

  // Parse conflicts/notes
  let conflicts: string | undefined;
  let discount: string | undefined;

  if (
    description.toLowerCase().includes("sur") ||
    description.toLowerCase().includes("klage")
  ) {
    const conflictMatch = description.match(/"([^"]+)"/);
    if (conflictMatch) {
      conflicts = conflictMatch[1];
    }
  }

  if (description.toLowerCase().includes("rabat")) {
    const discountMatch = description.match(/rabat[^\n.]*/i);
    if (discountMatch) {
      discount = discountMatch[0];
    }
  }

  // Special instructions
  let specialInstructions: string | undefined;
  if (description.includes("Ingen sulfo"))
    specialInstructions = "Ingen sulfo på trægulve";
  else if (description.includes("svanemærket"))
    specialInstructions = "Svanemærkede produkter";
  else if (description.includes("nøgle"))
    specialInstructions = description.match(/nøgle[^\n.]*/i)?.[0];

  return {
    id: `EVENT_${date}_${type}`,
    date,
    title,
    serviceType: type,
    serviceName: name,
    isFirstTime,
    propertySize,
    timeEstimate,
    timeActual,
    priceEstimate: calculatedPrice,
    hourlyRate: 349,
    address,
    accessCode,
    services,
    windowCleaning,
    status,
    conflicts,
    discount,
    specialInstructions,
    rawDescription: description.substring(0, 300),
  };
}

// Predict next cleaning for fast customers
function predictNextCleaning(
  serviceHistory: ServiceEvent[]
): string | undefined {
  const fastEvents = serviceHistory
    .filter(e => e.serviceType === ServiceType.FAST && e.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (fastEvents.length < 2) return undefined;

  // Calculate average interval
  const intervals: number[] = [];
  for (let i = 0; i < fastEvents.length - 1; i++) {
    const days = Math.abs(
      (new Date(fastEvents[i].date).getTime() -
        new Date(fastEvents[i + 1].date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    intervals.push(days);
  }

  const avgInterval =
    intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

  // Add interval to last cleaning
  const lastCleaning = new Date(fastEvents[0].date);
  const nextDate = new Date(
    lastCleaning.getTime() + avgInterval * 24 * 60 * 60 * 1000
  );

  return nextDate.toISOString().split("T")[0];
}

function buildCustomerCards() {
  // Load enriched profiles
  const profilesPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/enriched-customer-profiles-v2.json"
  );
  const profilesData = JSON.parse(readFileSync(profilesPath, "utf-8"));

  console.log("\n📦 DATA LOADED:");
  console.log("-".repeat(70));
  console.log(`Profiles: ${profilesData.profiles.length}`);

  const customerCards: CustomerCard[] = [];

  console.log("\n🔨 BUILDING CUSTOMER CARDS...");
  console.log("-".repeat(70));

  profilesData.profiles.forEach((profile: any) => {
    // Parse all service events
    const serviceHistory: ServiceEvent[] = profile.calendarEvents.map(
      (event: any) => {
        // Reconstruct full event data
        const fullEvent = {
          rawData: {
            eventTitle: event.title,
            eventStart: event.date,
            eventLocation: event.location || event.fullAddress,
            description: event.rawDescription || "",
          },
        };
        return parseServiceEvent(fullEvent);
      }
    );

    // Sort by date
    serviceHistory.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate stats
    const totalBookings = serviceHistory.length;
    const completedBookings = serviceHistory.filter(
      e => e.status === "completed"
    ).length;
    const cancelledBookings = serviceHistory.filter(
      e => e.status === "cancelled"
    ).length;

    // Service breakdown
    const serviceBreakdown = {
      [ServiceType.PRIVAT]: serviceHistory.filter(
        e => e.serviceType === ServiceType.PRIVAT
      ).length,
      [ServiceType.HOVED]: serviceHistory.filter(
        e => e.serviceType === ServiceType.HOVED
      ).length,
      [ServiceType.FLYT]: serviceHistory.filter(
        e => e.serviceType === ServiceType.FLYT
      ).length,
      [ServiceType.ERHVERV]: serviceHistory.filter(
        e => e.serviceType === ServiceType.ERHVERV
      ).length,
      [ServiceType.FAST]: serviceHistory.filter(
        e => e.serviceType === ServiceType.FAST
      ).length,
    };

    // Fast customer?
    const isFastCustomer = serviceBreakdown[ServiceType.FAST] > 0;
    const fastRengøringCount = serviceBreakdown[ServiceType.FAST];

    // Revenue
    const totalRevenue = serviceHistory
      .filter(e => e.status === "completed")
      .reduce((sum, e) => sum + (e.priceEstimate || 0), 0);

    const averageBookingValue =
      completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Conflicts & notes
    const hasConflicts = serviceHistory.some(e => e.conflicts);
    const conflictNotes = serviceHistory
      .filter(e => e.conflicts)
      .map(e => `${e.date}: ${e.conflicts}`);

    const discountHistory = serviceHistory
      .filter(e => e.discount)
      .map(e => `${e.date}: ${e.discount}`);

    const preferences: string[] = [];
    const uniqueInstructions = new Set(
      serviceHistory
        .filter(e => e.specialInstructions)
        .map(e => e.specialInstructions!)
    );
    preferences.push(...Array.from(uniqueInstructions));

    // Next action
    let nextAction: string | undefined;
    let nextActionDue: string | undefined;
    let nextScheduledCleaning: string | undefined;

    if (isFastCustomer) {
      nextScheduledCleaning = predictNextCleaning(serviceHistory);
      if (nextScheduledCleaning) {
        nextAction = "Book næste fast rengøring";
        nextActionDue = nextScheduledCleaning;
      }
    }

    // Build card
    const card: CustomerCard = {
      profileId: profile.id,
      name: profile.name,
      emails: profile.emails,
      phones: profile.phones,
      addresses: profile.addresses,
      primaryEmail: profile.emails[0],
      primaryPhone: profile.phones[0],
      primaryAddress: profile.addresses[0],
      billyCustomerId: profile.billyCustomerId,
      billyCompany: profile.companies[0],
      serviceHistory,
      totalBookings,
      completedBookings,
      cancelledBookings,
      serviceBreakdown,
      isFastCustomer,
      fastRengøringCount: isFastCustomer ? fastRengøringCount : undefined,
      nextScheduledCleaning,
      totalRevenue,
      averageBookingValue,
      lifetimeValue: totalRevenue,
      gmailThreads: profile.gmailThreads,
      hasConflicts,
      conflictNotes,
      discountHistory,
      preferences,
      nextAction,
      nextActionDue,
      sources: profile.sources,
      confidence: profile.confidence,
      firstSeen: serviceHistory[serviceHistory.length - 1]?.date,
      lastActivity: serviceHistory[0]?.date,
      rawData: profile.rawData,
    };

    customerCards.push(card);
  });

  // Sort by lifetime value
  customerCards.sort((a, b) => b.lifetimeValue - a.lifetimeValue);

  // Analysis
  console.log("\n📊 CUSTOMER CARD ANALYSIS:");
  console.log("=".repeat(70));

  console.log(`Total customer cards: ${customerCards.length}`);
  console.log(
    `Fast customers: ${customerCards.filter(c => c.isFastCustomer).length}`
  );
  console.log(
    `With conflicts: ${customerCards.filter(c => c.hasConflicts).length}`
  );
  console.log(
    `With discounts: ${customerCards.filter(c => c.discountHistory.length > 0).length}`
  );

  const totalRevenue = customerCards.reduce(
    (sum, c) => sum + c.totalRevenue,
    0
  );
  console.log(`\nTotal revenue tracked: ${totalRevenue.toFixed(0)} kr`);
  console.log(
    `Average customer value: ${(totalRevenue / customerCards.length).toFixed(0)} kr`
  );

  console.log(`\nService breakdown:`);
  const allServices = customerCards.reduce(
    (acc, c) => ({
      [ServiceType.PRIVAT]:
        acc[ServiceType.PRIVAT] + c.serviceBreakdown[ServiceType.PRIVAT],
      [ServiceType.HOVED]:
        acc[ServiceType.HOVED] + c.serviceBreakdown[ServiceType.HOVED],
      [ServiceType.FLYT]:
        acc[ServiceType.FLYT] + c.serviceBreakdown[ServiceType.FLYT],
      [ServiceType.ERHVERV]:
        acc[ServiceType.ERHVERV] + c.serviceBreakdown[ServiceType.ERHVERV],
      [ServiceType.FAST]:
        acc[ServiceType.FAST] + c.serviceBreakdown[ServiceType.FAST],
    }),
    {
      [ServiceType.PRIVAT]: 0,
      [ServiceType.HOVED]: 0,
      [ServiceType.FLYT]: 0,
      [ServiceType.ERHVERV]: 0,
      [ServiceType.FAST]: 0,
    }
  );

  console.log(
    `  • Privatrengøring (REN-001): ${allServices[ServiceType.PRIVAT]}`
  );
  console.log(
    `  • Hovedrengøring (REN-002): ${allServices[ServiceType.HOVED]}`
  );
  console.log(
    `  • Flytterengøring (REN-003): ${allServices[ServiceType.FLYT]}`
  );
  console.log(
    `  • Erhvervsrengøring (REN-004): ${allServices[ServiceType.ERHVERV]}`
  );
  console.log(`  • Fast rengøring (REN-005): ${allServices[ServiceType.FAST]}`);

  // Show top customers
  console.log("\n💎 TOP 10 CUSTOMERS BY VALUE:");
  console.log("=".repeat(70));

  customerCards.slice(0, 10).forEach((card, i) => {
    console.log(`\n${i + 1}. 👤 ${card.name}`);
    console.log(`   💰 Lifetime value: ${card.lifetimeValue.toFixed(0)} kr`);
    console.log(
      `   📅 Bookings: ${card.totalBookings} (${card.completedBookings} completed)`
    );
    console.log(
      `   🔄 Fast kunde: ${card.isFastCustomer ? `Ja (${card.fastRengøringCount}x)` : "Nej"}`
    );
    console.log(`   📧 Email: ${card.primaryEmail || "N/A"}`);
    console.log(`   📱 Phone: ${card.primaryPhone || "N/A"}`);
    console.log(`   🏢 Billy: ${card.billyCustomerId || "N/A"}`);

    if (card.nextScheduledCleaning) {
      console.log(`   📆 Næste rengøring: ${card.nextScheduledCleaning}`);
    }

    if (card.hasConflicts) {
      console.log(`   ⚠️  Konflikt: ${card.conflictNotes[0]}`);
    }
  });

  // Show fast customers with next cleaning
  const fastWithNext = customerCards.filter(
    c => c.isFastCustomer && c.nextScheduledCleaning
  );
  console.log(
    `\n\n🔄 FAST CUSTOMERS WITH PREDICTED NEXT CLEANING (${fastWithNext.length}):`
  );
  console.log("=".repeat(70));

  fastWithNext.slice(0, 10).forEach((card, i) => {
    console.log(`\n${i + 1}. ${card.name}`);
    console.log(`   📆 Næste: ${card.nextScheduledCleaning}`);
    console.log(`   📊 Count: ${card.fastRengøringCount}x fast rengøring`);
    console.log(`   💰 Value: ${card.lifetimeValue.toFixed(0)} kr`);
  });

  // Save
  const outputPath = resolve(
    process.cwd(),
    "server/integrations/chromadb/test-data/customer-cards.json"
  );
  const output = {
    metadata: {
      generated: new Date().toISOString(),
      totalCards: customerCards.length,
      fastCustomers: customerCards.filter(c => c.isFastCustomer).length,
      totalRevenue,
      averageCustomerValue: totalRevenue / customerCards.length,
      serviceBreakdown: allServices,
    },
    customerCards,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(
    `\n\n✅ Saved ${customerCards.length} customer cards to: ${outputPath}`
  );

  console.log("\n" + "=".repeat(70));
  console.log("🎉 CUSTOMER CARDS COMPLETE!");
  console.log("=".repeat(70));
  console.log("");

  process.exit(0);
}

buildCustomerCards();
