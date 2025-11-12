/**
 * Autonomous Action Handler
 *
 * Automatically processes actionable insights from the lead pipeline:
 * - Missing bookings: sends reminder emails/notifications
 * - At-risk customers: creates follow-up tasks
 * - Upsell opportunities: flags for sales review
 *
 * Can be triggered manually or via scheduled task.
 *
 * Usage:
 *   npx tsx server/scripts/action-handler.ts [--dry-run]
 */

import * as dotenv from "dotenv";
import { getDb, getUserByOpenId } from "../db";
import {
  customerProfiles,
  customerInvoices,
  tasks,
} from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

dotenv.config({ path: ".env.supabase" });
dotenv.config();

interface ActionResult {
  type: "missing_booking" | "at_risk" | "upsell";
  customerId: number;
  customerName: string;
  action: string;
  success: boolean;
  message: string;
}

interface ActionStats {
  totalInsights: number;
  actionsCreated: number;
  actionsFailed: number;
  byType: Record<string, number>;
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log(`🤖 Autonomous Action Handler ${isDryRun ? "(DRY RUN)" : ""}`);
  console.log("=".repeat(60));

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const ownerOpenId = process.env.OWNER_OPEN_ID || "";
  if (!ownerOpenId) {
    throw new Error("OWNER_OPEN_ID missing");
  }

  const ownerUser = await getUserByOpenId(ownerOpenId);
  if (!ownerUser) {
    throw new Error(`Owner user not found: ${ownerOpenId}`);
  }

  const userId = ownerUser.id;

  const stats: ActionStats = {
    totalInsights: 0,
    actionsCreated: 0,
    actionsFailed: 0,
    byType: {},
  };

  const results: ActionResult[] = [];

  // 1. Handle missing bookings (recurring customers without recent activity)
  console.log("\n🔍 Checking for missing bookings...");
  const recurringProfiles = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.userId, userId),
        sql`${customerProfiles.tags}::jsonb @> '["recurring"]'`
      )
    )
    .limit(50);

  for (const profile of recurringProfiles) {
    const recentInvoices = await db
      .select()
      .from(customerInvoices)
      .where(
        and(
          eq(customerInvoices.customerId, profile.id),
          sql`${customerInvoices.entryDate} > NOW() - INTERVAL '90 days'`
        )
      )
      .limit(1);

    if (recentInvoices.length === 0) {
      stats.totalInsights += 1;
      stats.byType["missing_booking"] =
        (stats.byType["missing_booking"] || 0) + 1;

      const result = await handleMissingBooking(db, userId, profile, isDryRun);
      results.push(result);

      if (result.success) {
        stats.actionsCreated += 1;
      } else {
        stats.actionsFailed += 1;
      }
    }
  }

  // 2. Handle at-risk customers
  console.log("\n⚠️  Checking at-risk customers...");
  const atRiskProfiles = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.userId, userId),
        eq(customerProfiles.status, "at_risk")
      )
    )
    .limit(50);

  for (const profile of atRiskProfiles) {
    stats.totalInsights += 1;
    stats.byType["at_risk"] = (stats.byType["at_risk"] || 0) + 1;

    const result = await handleAtRiskCustomer(db, userId, profile, isDryRun);
    results.push(result);

    if (result.success) {
      stats.actionsCreated += 1;
    } else {
      stats.actionsFailed += 1;
    }
  }

  // 3. Handle upsell opportunities
  console.log("\n💰 Checking upsell opportunities...");
  const vipProfiles = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.userId, userId),
        eq(customerProfiles.status, "vip")
      )
    )
    .orderBy(desc(customerProfiles.totalInvoiced))
    .limit(20);

  for (const profile of vipProfiles) {
    const lifetimeValue = (profile.totalInvoiced || 0) / 100;
    if (lifetimeValue > 10000) {
      stats.totalInsights += 1;
      stats.byType["upsell"] = (stats.byType["upsell"] || 0) + 1;

      const result = await handleUpsellOpportunity(
        db,
        userId,
        profile,
        isDryRun
      );
      results.push(result);

      if (result.success) {
        stats.actionsCreated += 1;
      } else {
        stats.actionsFailed += 1;
      }
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 ACTION HANDLER SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total insights:     ${stats.totalInsights}`);
  console.log(`Actions created:    ${stats.actionsCreated}`);
  console.log(`Actions failed:     ${stats.actionsFailed}`);
  console.log("\nBy Type:");
  for (const [type, count] of Object.entries(stats.byType)) {
    console.log(`   ${type.padEnd(20)}: ${count}`);
  }

  if (results.length > 0) {
    console.log("\n📋 Recent Actions:");
    results.slice(-10).forEach(r => {
      const icon = r.success ? "✅" : "❌";
      console.log(`   ${icon} ${r.type} • ${r.customerName}: ${r.message}`);
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");

  process.exit(0);
}

async function handleMissingBooking(
  db: any,
  userId: number,
  profile: any,
  isDryRun: boolean
): Promise<ActionResult> {
  const taskTitle = `📞 Follow-up: ${profile.name} (missing booking)`;
  const taskDescription = `Recurring customer has no bookings in 90+ days. Contact to schedule next appointment.`;

  if (isDryRun) {
    console.log(`   [DRY RUN] Would create task: ${taskTitle}`);
    return {
      type: "missing_booking",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Task would be created (dry run)",
    };
  }

  try {
    await db.insert(tasks).values({
      userId,
      title: taskTitle,
      description: taskDescription,
      status: "pending",
      priority: "high",
      metadata: {
        type: "missing_booking",
        customerId: profile.id,
        customerEmail: profile.email,
        customerPhone: profile.phone,
        generatedBy: "action_handler",
      },
    });

    console.log(`   ✅ Created task for ${profile.name}`);
    return {
      type: "missing_booking",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Follow-up task created",
    };
  } catch (error) {
    console.error(`   ❌ Failed to create task for ${profile.name}:`, error);
    return {
      type: "missing_booking",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleAtRiskCustomer(
  db: any,
  userId: number,
  profile: any,
  isDryRun: boolean
): Promise<ActionResult> {
  const taskTitle = `⚠️  Review: ${profile.name} (at-risk)`;
  const taskDescription = `Customer flagged as at-risk. Review account balance, complaints, and recent interactions.`;

  if (isDryRun) {
    console.log(`   [DRY RUN] Would create task: ${taskTitle}`);
    return {
      type: "at_risk",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Task would be created (dry run)",
    };
  }

  try {
    await db.insert(tasks).values({
      userId,
      title: taskTitle,
      description: taskDescription,
      status: "pending",
      priority: "high",
      metadata: {
        type: "at_risk",
        customerId: profile.id,
        customerEmail: profile.email,
        balance: profile.balance,
        tags: profile.tags,
        generatedBy: "action_handler",
      },
    });

    console.log(`   ✅ Created review task for ${profile.name}`);
    return {
      type: "at_risk",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Review task created",
    };
  } catch (error) {
    console.error(`   ❌ Failed to create task for ${profile.name}:`, error);
    return {
      type: "at_risk",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleUpsellOpportunity(
  db: any,
  userId: number,
  profile: any,
  isDryRun: boolean
): Promise<ActionResult> {
  const lifetimeValue = (profile.totalInvoiced || 0) / 100;
  const taskTitle = `💎 Upsell: ${profile.name} (${lifetimeValue.toLocaleString("da-DK")} kr)`;
  const taskDescription = `VIP customer with high lifetime value. Consider premium services or package deals.`;

  if (isDryRun) {
    console.log(`   [DRY RUN] Would create task: ${taskTitle}`);
    return {
      type: "upsell",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Task would be created (dry run)",
    };
  }

  try {
    await db.insert(tasks).values({
      userId,
      title: taskTitle,
      description: taskDescription,
      status: "pending",
      priority: "medium",
      metadata: {
        type: "upsell",
        customerId: profile.id,
        customerEmail: profile.email,
        lifetimeValue,
        invoiceCount: profile.invoiceCount,
        generatedBy: "action_handler",
      },
    });

    console.log(`   ✅ Created upsell task for ${profile.name}`);
    return {
      type: "upsell",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: true,
      message: "Upsell task created",
    };
  } catch (error) {
    console.error(`   ❌ Failed to create task for ${profile.name}:`, error);
    return {
      type: "upsell",
      customerId: profile.id,
      customerName: profile.name || "Unknown",
      action: "create_task",
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

void main().catch(error => {
  console.error("❌ Action handler failed:", error);
  process.exit(1);
});
