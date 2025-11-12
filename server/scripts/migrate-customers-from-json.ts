/**
 * migrate-customers-from-json.ts
 *
 * Migrates 257 customer profiles from enriched-customer-profiles-v2.json
 * into PostgreSQL database (customer_profiles + customer_properties tables).
 *
 * Run with: pnpm run migrate:customers
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import postgres from "postgres";
import { fileURLToPath } from "url";
import {
  customerProfilesInFridayAi,
  customerPropertiesInFridayAi,
} from "../../drizzle/schema";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../../.env.dev") });

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log(`🔗 Connecting to database...`);
console.log(`   Host: ${new URL(connectionString).host}`);
console.log(`   Database: ${new URL(connectionString).pathname.slice(1)}\n`);

// Remove schema param from connection string if present
const cleanConnectionString =
  connectionString.split("?")[0] + "?sslmode=require";

const client = postgres(cleanConnectionString, {
  max: 1,
  onnotice: () => {}, // Suppress notices
});
const db = drizzle(client);

// Types for JSON structure
interface CustomerProfile {
  id: string;
  name: string;
  normalizedName: string;
  emails: string[];
  phones: string[];
  addresses: string[];
  companies: string[];
  billyCustomerId?: string;
  calendarEvents?: any[];
  gmailThreads?: any[];
  sources: string[];
  createdAt: string;
}

interface EnrichedData {
  metadata: {
    generated: string;
    totalProfiles: number;
    completeProfiles: number;
    partialProfiles: number;
    singleSourceProfiles: number;
    coverage: {
      withEmail: number;
      withPhone: number;
      withAddress: number;
      withBoth: number;
    };
    dataSources: {
      billy: number;
      calendar: number;
      gmail: number;
    };
  };
  profiles: CustomerProfile[];
}

/**
 * Clean address string (remove HTML tags from scraped data)
 */
function cleanAddress(address: string): string {
  return address
    .replace(/esse:<\/strong>\s*/g, "")
    .replace(/esse:\s*/g, "")
    .trim();
}

/**
 * Extract city and postal code from address string
 */
function parseAddress(address: string): {
  address: string;
  city: string | null;
  postalCode: string | null;
} {
  const clean = cleanAddress(address);

  // Danish address format: "Street, PostalCode City"
  const match = clean.match(/^(.+?),\s*(\d{4})\s+(.+)$/);

  if (match) {
    return {
      address: clean,
      city: match[3].trim(),
      postalCode: match[2],
    };
  }

  return {
    address: clean,
    city: null,
    postalCode: null,
  };
}

/**
 * Determine customer status based on data sources and activity
 */
function determineStatus(
  profile: CustomerProfile
): "new" | "active" | "inactive" | "vip" | "at_risk" {
  const hasRecentActivity =
    profile.calendarEvents && profile.calendarEvents.length > 0;
  const hasBillyId = !!profile.billyCustomerId;
  const hasMultipleSources = profile.sources.length > 1;

  if (hasBillyId && hasRecentActivity && hasMultipleSources) {
    return "vip"; // Complete profile with billing + activity
  }

  if (hasRecentActivity) {
    return "active"; // Has calendar bookings
  }

  if (hasBillyId) {
    return "inactive"; // Has billing history but no recent bookings
  }

  return "new"; // New lead from single source
}

/**
 * Generate relevant tags based on profile data
 */
function generateTags(profile: CustomerProfile): string[] {
  const tags: string[] = [];

  // Source tags
  if (profile.sources.includes("billy")) tags.push("billy-kunde");
  if (profile.sources.includes("calendar")) tags.push("kalender-booking");
  if (profile.sources.includes("gmail")) tags.push("email-kontakt");

  // Data completeness
  if (profile.sources.length === 3) tags.push("komplet-profil");
  if (profile.sources.length === 1) tags.push("enkelt-kilde");

  // Service history
  if (profile.calendarEvents && profile.calendarEvents.length > 5) {
    tags.push("fast-kunde");
  }

  // Company vs private
  if (profile.companies && profile.companies.length > 0) {
    tags.push("erhverv");
  } else {
    tags.push("privat");
  }

  return tags;
}

/**
 * Main migration function
 */
async function migrateCustomers() {
  console.log("🚀 Starting customer migration from JSON to PostgreSQL...\n");

  // Load JSON data
  const jsonPath = join(
    __dirname,
    "../integrations/chromadb/test-data/enriched-customer-profiles-v2.json"
  );

  console.log(`📂 Loading data from: ${jsonPath}`);
  const fileContent = readFileSync(jsonPath, "utf-8");
  const data: EnrichedData = JSON.parse(fileContent);

  console.log(`\n📊 Data Summary:`);
  console.log(`   Total profiles: ${data.metadata.totalProfiles}`);
  console.log(`   Complete profiles: ${data.metadata.completeProfiles}`);
  console.log(`   Partial profiles: ${data.metadata.partialProfiles}`);
  console.log(
    `   Single-source profiles: ${data.metadata.singleSourceProfiles}`
  );
  console.log(`\n   Coverage:`);
  console.log(`   - With email: ${data.metadata.coverage.withEmail}`);
  console.log(`   - With phone: ${data.metadata.coverage.withPhone}`);
  console.log(`   - With address: ${data.metadata.coverage.withAddress}`);
  console.log(`   - With both: ${data.metadata.coverage.withBoth}\n`);

  let customersCreated = 0;
  let propertiesCreated = 0;
  let errors = 0;

  // Default userId (assuming admin user exists with id=1)
  const defaultUserId = 1;

  console.log("🔄 Processing profiles...\n");

  for (const profile of data.profiles) {
    try {
      // Skip profiles without email (required field)
      if (!profile.emails || profile.emails.length === 0) {
        console.log(`⏭️  Skipping ${profile.name} - no email`);
        continue;
      }

      const primaryEmail = profile.emails[0];
      const primaryPhone = profile.phones?.[0] || null;
      const status = determineStatus(profile);
      const tags = generateTags(profile);

      // Calculate metrics from calendar events
      const totalBookings = profile.calendarEvents?.length || 0;
      const emailThreads = profile.gmailThreads?.length || 0;

      // Insert customer profile
      const [customer] = await db
        .insert(customerProfilesInFridayAi)
        .values({
          userId: defaultUserId,
          billyCustomerId: profile.billyCustomerId || null,
          email: primaryEmail,
          name: profile.name,
          phone: primaryPhone,
          status,
          tags,
          customerType: profile.companies?.length > 0 ? "business" : "private",
          totalInvoiced: 0, // Will be updated when invoice data is migrated
          totalPaid: 0,
          balance: 0,
          invoiceCount: 0,
          emailCount: emailThreads,
          aiResume: `Customer from ${profile.sources.join(", ")}. ${totalBookings} bookings recorded.`,
          lastContactDate: profile.calendarEvents?.[0]?.date
            ? new Date(profile.calendarEvents[0].date).toISOString()
            : null,
          lastSyncDate: new Date().toISOString(),
        })
        .returning();

      customersCreated++;
      console.log(
        `✅ Created customer: ${customer.name} (${customer.email}) - ${status}`
      );

      // Insert properties (addresses)
      if (profile.addresses && profile.addresses.length > 0) {
        for (let i = 0; i < profile.addresses.length; i++) {
          const addressData = parseAddress(profile.addresses[i]);

          await db.insert(customerPropertiesInFridayAi).values({
            customerProfileId: customer.id,
            address: addressData.address,
            city: addressData.city,
            postalCode: addressData.postalCode,
            isPrimary: i === 0, // First address is primary
            attributes: {
              source: "migration",
              originalAddress: profile.addresses[i],
            },
            notes: null,
          });

          propertiesCreated++;
          console.log(`   🏠 Added property: ${addressData.address}`);
        }
      }
    } catch (error: any) {
      errors++;
      console.error(`❌ Error processing ${profile.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`   Customers created: ${customersCreated}`);
  console.log(`   Properties created: ${propertiesCreated}`);
  console.log(`   Errors: ${errors}`);

  await client.end();
}

// Run migration
migrateCustomers()
  .then(() => {
    console.log("\n🎉 Customer migration successful!");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
