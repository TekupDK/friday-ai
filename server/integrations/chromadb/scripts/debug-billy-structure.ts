/**
 * Debug Billy API Structure
 * Check what fields are actually available
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.dev") });

import { getCustomers } from "../../../billy";

async function debugBilly() {
  console.log("🔍 Debugging Billy API Structure\n");

  const customers = await getCustomers();

  console.log(`Found ${customers.length} customers\n`);

  // Sample first 5 customers
  console.log("📋 SAMPLE CUSTOMERS (First 5):");
  console.log("=".repeat(70));

  customers.slice(0, 5).forEach((customer, i) => {
    console.log(`\n${i + 1}. ${customer.name}`);
    console.log(`   ID: ${customer.id}`);
    console.log(`   Email: ${customer.email || "N/A"}`);
    console.log(`   Phone: ${customer.phone || "N/A"}`);
    console.log(`   Country: ${customer.countryId || "N/A"}`);
    console.log("\n   Full structure:");
    console.log(JSON.stringify(customer, null, 2));
    console.log("-".repeat(70));
  });

  // Count customers with email
  const withEmail = customers.filter(c => c.email && c.email.trim()).length;
  const withPhone = customers.filter(c => c.phone && c.phone.trim()).length;

  console.log("\n📊 STATISTICS:");
  console.log("=".repeat(70));
  console.log(`Total customers: ${customers.length}`);
  console.log(
    `With email: ${withEmail} (${Math.round((withEmail / customers.length) * 100)}%)`
  );
  console.log(
    `With phone: ${withPhone} (${Math.round((withPhone / customers.length) * 100)}%)`
  );

  if (withEmail > 0) {
    console.log("\n✅ CUSTOMERS WITH EMAIL (First 10):");
    console.log("-".repeat(70));
    customers
      .filter(c => c.email && c.email.trim())
      .slice(0, 10)
      .forEach((customer, i) => {
        console.log(`${i + 1}. ${customer.name}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Phone: ${customer.phone || "N/A"}`);
        console.log("");
      });
  }

  process.exit(0);
}

debugBilly().catch(console.error);
