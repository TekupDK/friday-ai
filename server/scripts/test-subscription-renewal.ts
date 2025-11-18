/**
 * Subscription Renewal Test Script
 * 
 * Tests the renewal flow end-to-end
 * Run with: pnpm exec dotenv -e .env.dev -- tsx server/scripts/test-subscription-renewal.ts
 */

import { getDb } from "../db";
import { customerProfiles, subscriptions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { createSubscription, processRenewal } from "../subscription-actions";
import { processMonthlyRenewals } from "../subscription-jobs";
import { logger } from "../_core/logger";

async function testSubscriptionRenewal() {
  console.log("🧪 Starting Subscription Renewal Tests...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  const userId = parseInt(process.env.TEST_USER_ID || "1", 10);

  try {
    // Find or create test customer
    let [customer] = await db
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, userId),
          eq(customerProfiles.email, "test-renewal@example.com")
        )
      )
      .limit(1);

    if (!customer) {
      console.log("📝 Creating test customer...");
      [customer] = await db
        .insert(customerProfiles)
        .values({
          userId,
          name: "Test Renewal Customer",
          email: "test-renewal@example.com",
          phone: "+45 12 34 56 78",
          status: "active",
          customerType: "private",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      console.log(`✅ Created customer: ${customer.id}\n`);
    } else {
      console.log(`✅ Using existing customer: ${customer.id}\n`);
    }

    // Create test subscription
    console.log("📝 Creating test subscription...");
    const subscription = await createSubscription(userId, customer.id, "tier1", {
      autoRenew: true,
    });
    console.log(`✅ Created subscription: ${subscription.id}\n`);

    // Set nextBillingDate to past (1 day ago)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    await db
      .update(subscriptions)
      .set({ nextBillingDate: pastDate.toISOString() })
      .where(eq(subscriptions.id, subscription.id));

    console.log(`📅 Set nextBillingDate to: ${pastDate.toISOString()}\n`);

    // Test 1: Manual Renewal
    console.log("🔄 Test 1: Manual Renewal");
    const renewalResult = await processRenewal(subscription.id, userId);
    if (renewalResult.success) {
      console.log(`✅ Renewal successful! Invoice ID: ${renewalResult.invoiceId}\n`);

      // Verify nextBillingDate was updated
      const updated = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscription.id))
        .limit(1);

      console.log(`📅 New nextBillingDate: ${updated[0].nextBillingDate}\n`);
    } else {
      console.error(`❌ Renewal failed: ${renewalResult.error}\n`);
    }

    // Test 2: Background Job Renewal
    console.log("🔄 Test 2: Background Job Renewal");
    
    // Set nextBillingDate to past again
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 1);

    await db
      .update(subscriptions)
      .set({ nextBillingDate: pastDate2.toISOString() })
      .where(eq(subscriptions.id, subscription.id));

    const jobResult = await processMonthlyRenewals(userId);
    console.log(`📊 Job Result:`);
    console.log(`   - Success: ${jobResult.success}`);
    console.log(`   - Processed: ${jobResult.processed}`);
    console.log(`   - Failed: ${jobResult.failed}`);
    if (jobResult.errors.length > 0) {
      console.log(`   - Errors: ${JSON.stringify(jobResult.errors, null, 2)}`);
    }
    console.log();

    if (jobResult.success && jobResult.processed > 0) {
      console.log("✅ Background job renewal successful!\n");
    } else {
      console.error("❌ Background job renewal failed\n");
    }

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    await db.delete(subscriptions).where(eq(subscriptions.id, subscription.id));
    await db.delete(customerProfiles).where(eq(customerProfiles.id, customer.id));
    console.log("✅ Cleanup complete\n");

    console.log("✅ All renewal tests completed!");

    process.exit(0);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Subscription Renewal Test] Failed"
    );
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSubscriptionRenewal();

