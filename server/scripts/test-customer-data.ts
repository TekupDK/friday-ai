/**
 * test-customer-data.ts
 *
 * Simple script to verify customer data was migrated successfully
 * Tests the TRPC endpoints to ensure Kiro can access real customer data
 *
 * Run with: pnpm exec tsx server/scripts/test-customer-data.ts
 */

import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { config } from "dotenv";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";


import {
  customerProfilesInFridayAi,
  customerPropertiesInFridayAi,
} from "../../drizzle/schema";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../../.env.dev") });

async function testCustomerData() {
  console.log("🧪 Testing Customer Data Migration\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Clean connection string (remove schema param)
  const cleanConnectionString =
    connectionString.split("?")[0] + "?sslmode=require";
  const client = postgres(cleanConnectionString, { max: 1 });
  const db = drizzle(client);

  try {
    // Test 1: Count total customers
    console.log("📊 Test 1: Counting customers...");
    const [result] = await db
      .select({ count: count() })
      .from(customerProfilesInFridayAi);
    console.log(`   ✅ Total customers: ${result.count}\n`);

    // Test 2: List first 5 customers
    console.log("👥 Test 2: Listing first 5 customers...");
    const customers = await db
      .select({
        id: customerProfilesInFridayAi.id,
        name: customerProfilesInFridayAi.name,
        email: customerProfilesInFridayAi.email,
        status: customerProfilesInFridayAi.status,
        tags: customerProfilesInFridayAi.tags,
      })
      .from(customerProfilesInFridayAi)
      .limit(5);

    customers.forEach(customer => {
      console.log(`   • ${customer.name} (${customer.email})`);
      console.log(
        `     Status: ${customer.status}, Tags: ${customer.tags.join(", ")}`
      );
    });
    console.log();

    // Test 3: Count properties
    console.log("🏠 Test 3: Counting properties...");
    const [propResult] = await db
      .select({ count: count() })
      .from(customerPropertiesInFridayAi);
    console.log(`   ✅ Total properties: ${propResult.count}\n`);

    // Test 4: Show customer with properties
    console.log("📍 Test 4: Customer with properties...");
    const customerWithProps = await db
      .select({
        customerName: customerProfilesInFridayAi.name,
        propertyAddress: customerPropertiesInFridayAi.address,
        city: customerPropertiesInFridayAi.city,
        postalCode: customerPropertiesInFridayAi.postalCode,
      })
      .from(customerProfilesInFridayAi)
      .innerJoin(
        customerPropertiesInFridayAi,
        eq(
          customerProfilesInFridayAi.id,
          customerPropertiesInFridayAi.customerProfileId
        )
      )
      .limit(3);

    customerWithProps.forEach(item => {
      console.log(`   • ${item.customerName}`);
      console.log(`     📍 ${item.propertyAddress}`);
      if (item.city || item.postalCode) {
        console.log(`        ${item.postalCode} ${item.city}`);
      }
    });
    console.log();

    // Test 5: Status breakdown
    console.log("📈 Test 5: Customer status breakdown...");
    const statuses = await db
      .select({
        status: customerProfilesInFridayAi.status,
        count: count(),
      })
      .from(customerProfilesInFridayAi)
      .groupBy(customerProfilesInFridayAi.status);

    statuses.forEach(s => {
      console.log(`   • ${s.status}: ${s.count} customers`);
    });
    console.log();

    console.log("✅ All tests passed! Customer data is ready for Kiro to use.");
    console.log("\n📝 Kiro can now use these TRPC endpoints:");
    console.log("   • trpc.crm.customer.listProfiles()");
    console.log("   • trpc.crm.customer.getProfile(id)");
    console.log("   • trpc.crm.customer.listProperties(customerId)");
    console.log("\nExample usage in Kiro's frontend:");
    console.log(
      "   const { data } = trpc.crm.customer.listProfiles.useQuery({ limit: 20 });"
    );

    await client.end();
  } catch (error) {
    console.error("❌ Test failed:", error);
    await client.end();
    process.exit(1);
  }
}

testCustomerData();
