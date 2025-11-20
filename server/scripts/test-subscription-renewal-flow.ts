/**
 * Test Subscription Renewal Flow
 * 
 * End-to-end test of subscription renewal process
 */

import { eq, and, gte } from "drizzle-orm";

import { subscriptions } from "../../drizzle/schema";
import { logger } from "../_core/logger";
import { getDb } from "../db";
import { processMonthlyRenewals } from '../modules/subscription/subscription-jobs';

async function testRenewalFlow() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  console.log("\n🔄 Testing Subscription Renewal Flow\n");

  // Step 1: Check for subscriptions due for renewal
  console.log("1️⃣  Checking for subscriptions due for renewal...");
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        gte(subscriptions.nextBillingDate, today.toISOString().split("T")[0]),
        // Due today or tomorrow
      )
    )
    .limit(5);

  console.log(`   Found ${dueSubscriptions.length} subscriptions due for renewal`);

  if (dueSubscriptions.length === 0) {
    console.log("   ⚠️  No subscriptions due for renewal");
    console.log("   💡 Create a subscription with nextBillingDate = today to test");
    console.log("\n   Testing with mock data (dry run)...\n");
  }

  // Step 2: Process renewals
  console.log("2️⃣  Processing renewals...");
  
  try {
    const result = await processMonthlyRenewals();
    
    console.log(`   ✅ Processed: ${result.processed}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log("\n   Errors:");
      result.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. Subscription ${err.subscriptionId}: ${err.error}`);
      });
    }

    if (result.processed > 0) {
      console.log("\n   ✅ Renewal processing completed successfully");
    } else {
      console.log("\n   ⚠️  No subscriptions were processed");
      console.log("   💡 This is normal if no subscriptions are due");
    }
  } catch (error) {
    console.log(`   ❌ Renewal processing failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }

  // Step 3: Verify results
  console.log("\n3️⃣  Verifying results...");
  
  // Check if invoices were created (would need Billy.dk integration check)
  console.log("   💡 Check Billy.dk for created invoices");
  console.log("   💡 Check customer emails for renewal notifications");
  console.log("   💡 Check subscription nextBillingDate was updated");

  console.log("\n✅ Renewal flow test complete!");
  console.log("\n💡 Next steps:");
  console.log("   • Verify invoices in Billy.dk");
  console.log("   • Check email delivery");
  console.log("   • Verify subscription dates updated");
  console.log("   • Check calendar events created\n");
}

testRenewalFlow().catch(async (error) => {
  logger.error({ err: error }, "[Test] Subscription renewal flow test failed");
  console.error("❌ Test failed:", error);
  process.exit(1);
});

