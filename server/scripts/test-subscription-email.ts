/**
 * Subscription Email Test Script
 *
 * Tests email delivery for subscription events
 * Run with: pnpm exec dotenv -e .env.dev -- tsx server/scripts/test-subscription-email.ts
 */

import { eq, and } from "drizzle-orm";

import { customerProfiles, subscriptions } from "../../drizzle/schema";
import { logger } from "../_core/logger";
import { getDb } from "../db";
import { createSubscription } from "../subscription-actions";
import { sendSubscriptionEmail } from "../subscription-email";

async function testSubscriptionEmails() {
  console.log("🧪 Starting Subscription Email Tests...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }

  // Get test user ID (use first user or set in env)
  const userId = parseInt(process.env.TEST_USER_ID || "1", 10);

  try {
    // Find or create test customer
    let [customer] = await db
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, userId),
          eq(customerProfiles.email, "test-subscription@example.com")
        )
      )
      .limit(1);

    if (!customer) {
      console.log("📝 Creating test customer...");
      [customer] = await db
        .insert(customerProfiles)
        .values({
          userId,
          name: "Test Subscription Customer",
          email: "test-subscription@example.com",
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

    // Find or create test subscription
    let subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.customerProfileId, customer.id),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!subscription) {
      console.log("📝 Creating test subscription...");
      subscription = await createSubscription(userId, customer.id, "tier1", {
        autoRenew: true,
      });
      console.log(`✅ Created subscription: ${subscription.id}\n`);
    } else {
      console.log(`✅ Using existing subscription: ${subscription.id}\n`);
    }

    // Test 1: Welcome Email
    console.log("📧 Test 1: Welcome Email");
    const welcomeResult = await sendSubscriptionEmail({
      type: "welcome",
      subscriptionId: subscription.id,
      userId,
    });
    if (welcomeResult.success) {
      console.log("✅ Welcome email sent successfully\n");
    } else {
      console.error(`❌ Welcome email failed: ${welcomeResult.error}\n`);
    }

    // Test 2: Renewal Email
    console.log("📧 Test 2: Renewal Email");
    const renewalResult = await sendSubscriptionEmail({
      type: "renewal",
      subscriptionId: subscription.id,
      userId,
    });
    if (renewalResult.success) {
      console.log("✅ Renewal email sent successfully\n");
    } else {
      console.error(`❌ Renewal email failed: ${renewalResult.error}\n`);
    }

    // Test 3: Cancellation Email
    console.log("📧 Test 3: Cancellation Email");
    const cancellationResult = await sendSubscriptionEmail({
      type: "cancellation",
      subscriptionId: subscription.id,
      userId,
    });
    if (cancellationResult.success) {
      console.log("✅ Cancellation email sent successfully\n");
    } else {
      console.error(
        `❌ Cancellation email failed: ${cancellationResult.error}\n`
      );
    }

    // Test 4: Overage Warning Email
    console.log("📧 Test 4: Overage Warning Email");
    const overageResult = await sendSubscriptionEmail({
      type: "overage_warning",
      subscriptionId: subscription.id,
      userId,
      additionalData: {
        totalUsage: 4.5,
        includedHours: 3.0,
        overageHours: 1.5,
        overageCost: 523.5,
      },
    });
    if (overageResult.success) {
      console.log("✅ Overage warning email sent successfully\n");
    } else {
      console.error(
        `❌ Overage warning email failed: ${overageResult.error}\n`
      );
    }

    console.log("✅ All email tests completed!");
    console.log("\n📋 Check Gmail inbox for test emails:");
    console.log(`   To: ${customer.email}`);
    console.log(`   Subject: [Subscription Test] ...\n`);

    process.exit(0);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Subscription Email Test] Failed"
    );
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSubscriptionEmails();
