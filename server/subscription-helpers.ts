/**
 * Subscription Helper Functions
 *
 * Business logic helpers for subscription calculations and analytics
 */

import { eq, and, sql, gte, lte } from "drizzle-orm";

import { subscriptions, subscriptionUsage } from "../drizzle/schema";

import { getDb } from "./db";
import {
  getActiveSubscriptions,
  getSubscriptionsByStatus,
  getAllSubscriptions,
} from "./subscription-db";

/**
 * Subscription Plan Configuration
 * Prices in øre (e.g., 120000 = 1,200 kr)
 */
export const SUBSCRIPTION_PLANS = {
  tier1: {
    name: "Basis Abonnement",
    monthlyPrice: 120000, // 1,200 kr
    includedHours: 3.0,
    description: "1x månedlig rengøring (3 timer)",
  },
  tier2: {
    name: "Premium Abonnement",
    monthlyPrice: 180000, // 1,800 kr
    includedHours: 4.0,
    description: "1x månedlig rengøring (4 timer) + Hovedrengøring",
  },
  tier3: {
    name: "VIP Abonnement",
    monthlyPrice: 250000, // 2,500 kr
    includedHours: 6.0, // 2x månedlig rengøring (3 timer hver)
    description: "2x månedlig rengøring (3 timer hver) + Hovedrengøring",
  },
  flex_basis: {
    name: "Flex Basis",
    monthlyPrice: 100000, // 1,000 kr
    includedHours: 2.5,
    description: "2.5 timer rengøring/måned (akkumuleres)",
  },
  flex_plus: {
    name: "Flex Plus",
    monthlyPrice: 150000, // 1,500 kr
    includedHours: 4.0,
    description: "4 timer rengøring/måned (akkumuleres)",
  },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Get plan configuration
 */
export function getPlanConfig(planType: SubscriptionPlanType) {
  return SUBSCRIPTION_PLANS[planType];
}

/**
 * Calculate Monthly Recurring Revenue (MRR)
 * Sum of all active subscription monthly prices
 */
export async function calculateMonthlyRevenue(userId: number): Promise<number> {
  const activeSubscriptions = await getActiveSubscriptions(userId);

  return activeSubscriptions.reduce((total, sub) => {
    return total + Number(sub.monthlyPrice);
  }, 0);
}

/**
 * Calculate Annual Recurring Revenue (ARR)
 * MRR × 12
 */
export async function calculateAnnualRevenue(userId: number): Promise<number> {
  const mrr = await calculateMonthlyRevenue(userId);
  return mrr * 12;
}

/**
 * Calculate Average Revenue Per User (ARPU)
 * MRR / number of active subscriptions
 */
export async function getARPU(userId: number): Promise<number> {
  const activeSubscriptions = await getActiveSubscriptions(userId);

  if (activeSubscriptions.length === 0) {
    return 0;
  }

  const mrr = await calculateMonthlyRevenue(userId);
  return Math.round(mrr / activeSubscriptions.length);
}

/**
 * Calculate churn rate
 * (Cancelled subscriptions in period / Active subscriptions at start) × 100
 */
export async function getChurnRate(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get active subscriptions at start of period
  const activeAtStart = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        lte(subscriptions.createdAt, startDate.toISOString())
      )
    );

  const activeCount = Number(activeAtStart[0]?.count || 0);

  if (activeCount === 0) {
    return 0;
  }

  // Get cancelled subscriptions in period
  // Note: cancelledAt can be null, so we filter for non-null values
  const cancelled = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "cancelled"),
        sql`${subscriptions.cancelledAt} IS NOT NULL`,
        gte(subscriptions.cancelledAt, startDate.toISOString()),
        lte(subscriptions.cancelledAt, endDate.toISOString())
      )
    );

  const cancelledCount = Number(cancelled[0]?.count || 0);

  return (cancelledCount / activeCount) * 100;
}

/**
 * Check if subscription has exceeded included hours
 * Returns true if hours used > included hours
 */
export async function checkOverage(
  subscriptionId: number,
  year: number,
  month: number,
  userId: number
): Promise<{
  hasOverage: boolean;
  hoursUsed: number;
  includedHours: number;
  overageHours: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get subscription
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.userId, userId)
      )
    )
    .limit(1);

  if (subscription.length === 0) {
    throw new Error("Subscription not found");
  }

  const sub = subscription[0];
  const includedHours = Number(sub.includedHours);

  // Get total usage for month
  const usageResult = await db
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

  const hoursUsed = Number(usageResult[0]?.total || 0);
  const overageHours = Math.max(0, hoursUsed - includedHours);
  const hasOverage = hoursUsed > includedHours;

  return {
    hasOverage,
    hoursUsed,
    includedHours,
    overageHours,
  };
}

/**
 * Calculate total hours used across all subscriptions for a month
 */
export async function getTotalHoursUsed(
  userId: number,
  year: number,
  month: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get all active subscriptions for user
  const userSubscriptions = await getActiveSubscriptions(userId);
  const subscriptionIds = userSubscriptions.map(s => s.id);

  if (subscriptionIds.length === 0) {
    return 0;
  }

  // Sum usage across all subscriptions
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${subscriptionUsage.hoursUsed}), 0)`,
    })
    .from(subscriptionUsage)
    .where(
      and(
        sql`${subscriptionUsage.subscriptionId} = ANY(${subscriptionIds})`,
        eq(subscriptionUsage.year, year),
        eq(subscriptionUsage.month, month)
      )
    );

  return Number(result[0]?.total || 0);
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(userId: number) {
  const active = await getActiveSubscriptions(userId);
  const paused = await getSubscriptionsByStatus(userId, "paused");
  const cancelled = await getSubscriptionsByStatus(userId, "cancelled");
  const expired = await getSubscriptionsByStatus(userId, "expired");

  const mrr = await calculateMonthlyRevenue(userId);
  const arpu = await getARPU(userId);

  return {
    active: active.length,
    paused: paused.length,
    cancelled: cancelled.length,
    expired: expired.length,
    total: active.length + paused.length + cancelled.length + expired.length,
    mrr, // Monthly Recurring Revenue in øre
    arr: mrr * 12, // Annual Recurring Revenue in øre
    arpu, // Average Revenue Per User in øre
  };
}
