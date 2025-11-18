/**
 * Subscription Database Helpers
 *
 * Handles subscription data operations with proper user scoping and RBAC
 */

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import {
  subscriptions,
  subscriptionUsage,
  subscriptionHistory,
  InsertSubscription,
  InsertSubscriptionUsage,
  InsertSubscriptionHistory,
} from "../drizzle/schema";

import { getDb } from "./db";

/**
 * Get subscription by customer profile ID
 */
export async function getSubscriptionByCustomerId(
  customerProfileId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.customerProfileId, customerProfileId),
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(
  subscriptionId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all active subscriptions for a user
 */
export async function getActiveSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
    )
    .orderBy(desc(subscriptions.createdAt));
}

/**
 * Get subscriptions by status
 */
export async function getSubscriptionsByStatus(
  userId: number,
  status: "active" | "paused" | "cancelled" | "expired"
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, status))
    )
    .orderBy(desc(subscriptions.createdAt));
}

/**
 * Get all subscriptions for a user (any status)
 */
export async function getAllSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
}

/**
 * Get subscriptions due for billing (nextBillingDate <= today)
 */
export async function getSubscriptionsDueForBilling(userId?: number) {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const conditions = [
    eq(subscriptions.status, "active"),
    lte(subscriptions.nextBillingDate, today),
  ];

  if (userId) {
    conditions.push(eq(subscriptions.userId, userId));
  }

  return await db
    .select()
    .from(subscriptions)
    .where(and(...conditions))
    .orderBy(subscriptions.nextBillingDate);
}

/**
 * Get subscription usage for a specific month
 */
export async function getSubscriptionUsageForMonth(
  subscriptionId: number,
  year: number,
  month: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return [];

  // Verify subscription belongs to user
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return await db
    .select()
    .from(subscriptionUsage)
    .where(
      and(
        eq(subscriptionUsage.subscriptionId, subscriptionId),
        eq(subscriptionUsage.year, year),
        eq(subscriptionUsage.month, month)
      )
    )
    .orderBy(desc(subscriptionUsage.date));
}

/**
 * Get total usage for a subscription in a specific month
 */
export async function getTotalUsageForMonth(
  subscriptionId: number,
  year: number,
  month: number,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Verify subscription belongs to user
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${subscriptionUsage.hoursUsed}), 0)`,
    })
    .from(subscriptionUsage)
    .where(
      and(
        eq(subscriptionUsage.subscriptionId, subscriptionId),
        eq(subscriptionUsage.year, year),
        eq(subscriptionUsage.month, month)
      )
    );

  return Number(result[0]?.total || 0);
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(
  subscriptionId: number,
  userId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  // Verify subscription belongs to user
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return await db
    .select()
    .from(subscriptionHistory)
    .where(eq(subscriptionHistory.subscriptionId, subscriptionId))
    .orderBy(desc(subscriptionHistory.timestamp))
    .limit(limit);
}

/**
 * Create subscription usage record
 */
export async function createSubscriptionUsage(
  data: InsertSubscriptionUsage
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [created] = await db.insert(subscriptionUsage).values(data).returning();

  return created.id;
}

/**
 * Add subscription history entry
 */
export async function addSubscriptionHistory(
  data: InsertSubscriptionHistory
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [created] = await db
    .insert(subscriptionHistory)
    .values(data)
    .returning();

  return created.id;
}
