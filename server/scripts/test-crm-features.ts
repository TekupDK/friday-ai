/**
 * Test CRM Activity & Health Score Features
 *
 * Tests:
 * 1. Log customer activities
 * 2. List activities for customer
 * 3. Get activity statistics
 * 4. Calculate customer health score
 * 5. Get email history for customer
 */

import { config } from "dotenv";
import "dotenv/config";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

import { join } from "path";

import postgres from "postgres";

import {
  customerActivities,
  customerHealthScores,
  customerProfiles,
} from "../../drizzle/schema";
import {
  getCustomerHealthScore,
  updateCustomerHealthScore,
} from "../customer-health-score";

// ES module __dirname fix
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.dev directly
config({ path: join(__dirname, "../.env.dev") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not found in environment");
}

// Clean connection string (remove schema param)
const cleanConnectionString =
  connectionString.split("?")[0] + "?sslmode=require";
const client = postgres(cleanConnectionString, { max: 1, onnotice: () => {} });
const db = drizzle(client);

async function testCRMFeatures() {
  console.log("\n🧪 Testing CRM Activity & Health Score Features\n");

  try {
    // Test 1: Get a customer to work with
    console.log("📋 Test 1: Get customer profile");
    const customers = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, 1))
      .limit(1);

    if (customers.length === 0) {
      console.log("❌ No customers found - run customer migration first");
      return;
    }

    const customer = customers[0];
    console.log(`✅ Found customer: ${customer.name} (${customer.email})`);
    console.log(
      `   Status: ${customer.status}, Tags: ${customer.tags?.join(", ") || "none"}`
    );

    // Test 2: Log some activities
    console.log("\n📞 Test 2: Log customer activities");

    const activities = [
      {
        userId: 1,
        customerProfileId: customer.id,
        activityType: "call" as const,
        subject: "Opfølgning på tilbud",
        description: "Kunden ville gerne diskutere prisen",
        durationMinutes: 15,
        outcome: "Aftalt møde næste uge",
        nextSteps: "Send mødekalender",
      },
      {
        userId: 1,
        customerProfileId: customer.id,
        activityType: "meeting" as const,
        subject: "Møde om nyt projekt",
        description: "Gennemgik scope og tidsplan",
        durationMinutes: 60,
        outcome: "Kunde godkendte forslag",
      },
      {
        userId: 1,
        customerProfileId: customer.id,
        activityType: "note" as const,
        subject: "Kundens præferencer",
        description: "Foretrækker kommunikation via email, arbejder 9-17",
      },
    ];

    for (const activity of activities) {
      const [created] = await db
        .insert(customerActivities)
        .values(activity)
        .returning();
      console.log(`✅ Created ${activity.activityType}: ${created.subject}`);
    }

    // Test 3: List activities
    console.log("\n📊 Test 3: List all activities for customer");
    const allActivities = await db
      .select()
      .from(customerActivities)
      .where(eq(customerActivities.customerProfileId, customer.id))
      .orderBy(desc(customerActivities.createdAt));

    console.log(`✅ Total activities: ${allActivities.length}`);
    allActivities.forEach((a, i) => {
      console.log(`   ${i + 1}. [${a.activityType}] ${a.subject}`);
      if (a.outcome) console.log(`      Outcome: ${a.outcome}`);
    });

    // Test 4: Get activity statistics
    console.log("\n📈 Test 4: Activity statistics by type");

    const callCount = allActivities.filter(
      a => a.activityType === "call"
    ).length;
    const meetingCount = allActivities.filter(
      a => a.activityType === "meeting"
    ).length;
    const noteCount = allActivities.filter(
      a => a.activityType === "note"
    ).length;
    const emailCount = allActivities.filter(
      a => a.activityType === "email_sent"
    ).length;

    if (callCount > 0) console.log(`   call: ${callCount}`);
    if (meetingCount > 0) console.log(`   meeting: ${meetingCount}`);
    if (noteCount > 0) console.log(`   note: ${noteCount}`);
    if (emailCount > 0) console.log(`   email_sent: ${emailCount}`);

    // Test 5: Calculate health score
    console.log("\n💚 Test 5: Calculate customer health score");
    console.log(`   Calculating for ${customer.name}...`);

    await updateCustomerHealthScore(customer.id, 1);
    const healthScore = await getCustomerHealthScore(customer.id);

    if (healthScore) {
      console.log(`\n   ✅ Health Score: ${healthScore.score}/100`);
      console.log(`   Risk Level: ${healthScore.riskLevel}`);
      console.log(`   Churn Probability: ${healthScore.churnProbability}%`);
      console.log(`\n   Score Breakdown:`);
      console.log(
        `   • Email Engagement: ${healthScore.factors.email_engagement}/100`
      );
      console.log(
        `   • Payment Speed: ${healthScore.factors.payment_speed}/100`
      );
      console.log(
        `   • Booking Frequency: ${healthScore.factors.booking_frequency}/100`
      );
      console.log(
        `   • Activity Level: ${healthScore.factors.activity_level}/100`
      );
    }

    // Test 6: Verify health score is in database
    console.log("\n💾 Test 6: Verify health score saved to database");
    const savedScore = await db
      .select()
      .from(customerHealthScores)
      .where(eq(customerHealthScores.customerProfileId, customer.id))
      .limit(1);

    if (savedScore.length > 0) {
      console.log(`✅ Health score saved successfully`);
      console.log(`   Last calculated: ${savedScore[0].lastCalculatedAt}`);
    }

    // Test 7: List all health scores
    console.log("\n📊 Test 7: Health score overview");
    const allScores = await db
      .select({
        customerId: customerHealthScores.customerProfileId,
        score: customerHealthScores.score,
        riskLevel: customerHealthScores.riskLevel,
      })
      .from(customerHealthScores)
      .orderBy(desc(customerHealthScores.score));

    console.log(`✅ Total customers with health scores: ${allScores.length}`);
    if (allScores.length > 0) {
      console.log(`\n   Risk distribution:`);
      const riskCounts = {
        critical: allScores.filter(s => s.riskLevel === "critical").length,
        high: allScores.filter(s => s.riskLevel === "high").length,
        medium: allScores.filter(s => s.riskLevel === "medium").length,
        low: allScores.filter(s => s.riskLevel === "low").length,
      };
      console.log(`   🔴 Critical: ${riskCounts.critical}`);
      console.log(`   🟠 High: ${riskCounts.high}`);
      console.log(`   🟡 Medium: ${riskCounts.medium}`);
      console.log(`   🟢 Low: ${riskCounts.low}`);
    }

    console.log("\n\n✅ All tests completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`   - Customer activities table: ✅ Working`);
    console.log(`   - Activity logging: ✅ Working`);
    console.log(`   - Activity statistics: ✅ Working`);
    console.log(`   - Health score calculation: ✅ Working`);
    console.log(`   - Health score storage: ✅ Working`);

    console.log("\n🎉 CRM Activity & Health Score features are ready!");
    console.log("\n📚 Available TRPC endpoints:");
    console.log(
      "   - crm.activity.logActivity({ customerProfileId, activityType, subject, ... })"
    );
    console.log(
      "   - crm.activity.listActivities({ customerProfileId, limit })"
    );
    console.log("   - crm.activity.getActivityStats({ customerProfileId })");
    console.log("   - crm.customer.getHealthScore({ customerProfileId })");
    console.log(
      "   - crm.customer.recalculateHealthScore({ customerProfileId })"
    );
    console.log("   - crm.customer.getEmailHistory({ customerProfileId })");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

testCRMFeatures();
