/**
 * Subscription Usage Tracking Test Script
 * 
 * Tests usage tracking from bookings
 * Run with: pnpm exec dotenv -e .env.dev -- tsx server/scripts/test-subscription-usage.ts
 */

import { getDb } from "../db";
import { customerProfiles, subscriptions, bookings, subscriptionUsage } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { createSubscription } from "../subscription-actions";
import { trackBookingUsage, calculateBookingHours, syncSubscriptionUsage } from "../subscription-usage-tracker";
import { getSubscriptionUsageForMonth } from "../subscription-db";
import { logger } from "../_core/logger";

async function testSubscriptionUsage() {
  console.log("🧪 Starting Subscription Usage Tracking Tests...\n");

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
          eq(customerProfiles.email, "test-usage@example.com")
        )
      )
      .limit(1);

    if (!customer) {
      console.log("📝 Creating test customer...");
      [customer] = await db
        .insert(customerProfiles)
        .values({
          userId,
          name: "Test Usage Customer",
          email: "test-usage@example.com",
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

    // Test 1: Calculate Booking Hours
    console.log("⏱️  Test 1: Calculate Booking Hours");
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    const mockBooking = {
      id: 999,
      scheduledStart: startDate.toISOString(),
      scheduledEnd: endDate.toISOString(),
    } as any;

    const hours = calculateBookingHours(mockBooking);
    console.log(`✅ Calculated hours: ${hours} (expected: ~3.0)\n`);

    // Test 2: Track Booking Usage
    console.log("📊 Test 2: Track Booking Usage");
    const [booking] = await db
      .insert(bookings)
      .values({
        userId,
        customerProfileId: customer.id,
        title: "Test Cleaning - Usage Tracking",
        notes: "Test booking for usage tracking",
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      })
      .returning();

    console.log(`✅ Created booking: ${booking.id}\n`);

    const hoursWorked = calculateBookingHours(booking);
    const trackResult = await trackBookingUsage(booking.id, userId, hoursWorked);

    if (trackResult.success) {
      console.log(`✅ Usage tracked successfully: ${hoursWorked} hours\n`);
    } else {
      console.error(`❌ Usage tracking failed: ${trackResult.error}\n`);
    }

    // Test 3: Verify Usage Recorded
    console.log("📋 Test 3: Verify Usage Recorded");
    const now = new Date();
    const usage = await getSubscriptionUsageForMonth(
      subscription.id,
      now.getFullYear(),
      now.getMonth() + 1,
      userId
    );

    console.log(`📊 Usage for current month:`);
    console.log(`   - Total hours: ${usage.totalUsage}`);
    console.log(`   - Records: ${usage.usage.length}\n`);

    if (usage.totalUsage > 0) {
      console.log("✅ Usage recorded correctly!\n");
    } else {
      console.error("❌ Usage not recorded\n");
    }

    // Test 4: Sync Historical Usage
    console.log("🔄 Test 4: Sync Historical Usage");
    const syncStart = new Date();
    syncStart.setMonth(syncStart.getMonth() - 1);
    const syncEnd = new Date();

    const syncResult = await syncSubscriptionUsage(
      userId,
      syncStart.toISOString(),
      syncEnd.toISOString()
    );

    console.log(`📊 Sync Result:`);
    console.log(`   - Processed bookings: ${syncResult.processedBookings}`);
    console.log(`   - Tracked usage: ${syncResult.trackedUsage}`);
    console.log(`   - Errors: ${syncResult.errors.length}\n`);

    if (syncResult.errors.length === 0) {
      console.log("✅ Historical sync successful!\n");
    } else {
      console.error(`❌ Sync errors: ${JSON.stringify(syncResult.errors, null, 2)}\n`);
    }

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    await db.delete(subscriptionUsage).where(eq(subscriptionUsage.subscriptionId, subscription.id));
    await db.delete(bookings).where(eq(bookings.id, booking.id));
    await db.delete(subscriptions).where(eq(subscriptions.id, subscription.id));
    await db.delete(customerProfiles).where(eq(customerProfiles.id, customer.id));
    console.log("✅ Cleanup complete\n");

    console.log("✅ All usage tracking tests completed!");

    process.exit(0);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Subscription Usage Test] Failed"
    );
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSubscriptionUsage();

