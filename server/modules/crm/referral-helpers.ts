/**
 * Referral Program Helper Functions
 *
 * Business logic helpers for referral code generation,
 * reward calculations, and analytics
 */

import { eq, and, sql, gte, lte, count, sum } from "drizzle-orm";

import { referralCodes, referralRewards, referralHistory } from "../../../drizzle/schema";

import { logger } from "../../_core/logger";
import { getDb } from "../../db";

/**
 * Referral Program Configuration
 * Amounts in øre (e.g., 20000 = 200 kr)
 */
export const REFERRAL_CONFIG = {
  defaultReferrerReward: 20000, // 200 kr discount for referrer
  defaultReferredReward: 20000, // 200 kr discount for referred customer
  codeLength: 8, // Length of generated referral codes
  codePrefix: "REF", // Prefix for referral codes
  maxUsesDefault: null, // null = unlimited uses
  validityDays: 365, // Days until referral code expires
  minSubscriptionMonthsForReward: 1, // Months subscription must be active before reward
} as const;

/**
 * Generate a unique referral code
 */
export async function generateReferralCode(
  userId: number,
  customCode?: string
): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // If custom code provided, validate and use it
  if (customCode) {
    const cleanCode = customCode.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Check if code already exists
    const [existing] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, cleanCode))
      .limit(1);

    if (existing) {
      throw new Error(`Referral code "${cleanCode}" is already in use`);
    }

    return cleanCode;
  }

  // Generate random code
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 2 + REFERRAL_CONFIG.codeLength)
      .toUpperCase();

    const code = `${REFERRAL_CONFIG.codePrefix}${randomPart}`;

    // Check if code already exists
    const [existing] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!existing) {
      return code;
    }

    attempts++;
  }

  // Fallback: use timestamp-based code
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${REFERRAL_CONFIG.codePrefix}${timestamp}`;
}

/**
 * Validate referral code
 * Returns code object if valid, null if invalid
 */
export async function validateReferralCode(
  code: string
): Promise<{
  valid: boolean;
  referralCode?: any;
  reason?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { valid: false, reason: "Database connection failed" };
  }

  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Get referral code
  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, cleanCode))
    .limit(1);

  if (!referralCode) {
    return { valid: false, reason: "Referral code not found" };
  }

  // Check if active
  if (!referralCode.isActive) {
    return { valid: false, reason: "Referral code is inactive" };
  }

  // Check validity period
  const now = new Date();
  const validFrom = new Date(referralCode.validFrom);

  if (now < validFrom) {
    return { valid: false, reason: "Referral code not yet valid" };
  }

  if (referralCode.validUntil) {
    const validUntil = new Date(referralCode.validUntil);
    if (now > validUntil) {
      return { valid: false, reason: "Referral code has expired" };
    }
  }

  // Check max uses
  if (referralCode.maxUses !== null) {
    if (referralCode.currentUses >= referralCode.maxUses) {
      return { valid: false, reason: "Referral code has reached maximum uses" };
    }
  }

  return { valid: true, referralCode };
}

/**
 * Apply referral code discount
 * Returns discount amount in øre
 */
export function calculateReferralDiscount(
  referralCode: any,
  originalAmount: number
): number {
  if (referralCode.discountType === "percentage") {
    // Percentage discount (e.g., 10% = 1000 in discountAmount)
    const percentageDecimal = Number(referralCode.discountAmount) / 10000;
    return Math.floor(originalAmount * percentageDecimal);
  } else {
    // Fixed discount
    return Number(referralCode.discountAmount);
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: number): Promise<{
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number; // In øre
  totalRewardsPaid: number; // In øre
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalRewardsEarned: 0,
      totalRewardsPaid: 0,
    };
  }

  // Get all referral rewards where user is the referrer
  const rewards = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.referrerId, userId));

  const totalReferrals = rewards.length;
  const completedReferrals = rewards.filter(r => r.status === "completed" || r.status === "rewarded").length;
  const pendingReferrals = rewards.filter(r => r.status === "pending").length;
  const totalRewardsEarned = rewards.reduce((sum, r) => sum + Number(r.rewardAmount), 0);
  const totalRewardsPaid = rewards
    .filter(r => r.status === "rewarded")
    .reduce((sum, r) => sum + Number(r.rewardAmount), 0);

  return {
    totalReferrals,
    completedReferrals,
    pendingReferrals,
    totalRewardsEarned,
    totalRewardsPaid,
  };
}

/**
 * Get top referrers
 */
export async function getTopReferrers(limit: number = 10): Promise<
  Array<{
    userId: number;
    referralCount: number;
    totalRewardsEarned: number;
  }>
> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      userId: referralRewards.referrerId,
      referralCount: count(referralRewards.id),
      totalRewardsEarned: sum(referralRewards.rewardAmount),
    })
    .from(referralRewards)
    .where(eq(referralRewards.status, "rewarded"))
    .groupBy(referralRewards.referrerId)
    .orderBy(sql`count(${referralRewards.id}) DESC`)
    .limit(limit);

  return results.map(r => ({
    userId: r.userId,
    referralCount: Number(r.referralCount),
    totalRewardsEarned: Number(r.totalRewardsEarned || 0),
  }));
}

/**
 * Get referral conversion rate
 * Percentage of pending referrals that become completed
 */
export async function getReferralConversionRate(userId?: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const where = userId ? eq(referralRewards.referrerId, userId) : undefined;

  const [total] = await db
    .select({ count: count() })
    .from(referralRewards)
    .where(where);

  const [completed] = await db
    .select({ count: count() })
    .from(referralRewards)
    .where(
      and(
        where,
        sql`${referralRewards.status} IN ('completed', 'rewarded')`
      )
    );

  const totalCount = Number(total.count);
  const completedCount = Number(completed.count);

  if (totalCount === 0) {
    return 0;
  }

  return (completedCount / totalCount) * 100;
}

/**
 * Log referral history event
 */
export async function logReferralHistory(params: {
  referralCodeId: number;
  referralRewardId?: number;
  action: string;
  oldValue?: any;
  newValue?: any;
  performedBy?: number;
  metadata?: any;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    logger.error("[Referral] Failed to log history: DB connection failed");
    return;
  }

  try {
    await db.insert(referralHistory).values({
      referralCodeId: params.referralCodeId,
      referralRewardId: params.referralRewardId,
      action: params.action,
      oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
      newValue: params.newValue ? JSON.stringify(params.newValue) : null,
      performedBy: params.performedBy,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    });

    logger.info(
      {
        referralCodeId: params.referralCodeId,
        action: params.action,
      },
      "[Referral] History logged successfully"
    );
  } catch (error) {
    logger.error(
      { error, params },
      "[Referral] Failed to log history"
    );
  }
}

/**
 * Calculate referral ROI
 * Return on investment for referral program
 */
export async function calculateReferralROI(): Promise<{
  totalRewardsPaid: number; // In øre
  totalRevenueGenerated: number; // In øre
  roi: number; // Percentage
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalRewardsPaid: 0,
      totalRevenueGenerated: 0,
      roi: 0,
    };
  }

  // Get total rewards paid
  const [rewardsPaid] = await db
    .select({ total: sum(referralRewards.rewardAmount) })
    .from(referralRewards)
    .where(eq(referralRewards.status, "rewarded"));

  const totalRewardsPaid = Number(rewardsPaid.total || 0);

  // Get total revenue from referred subscriptions
  // This would require joining with subscriptions table
  // For now, estimate based on average subscription value
  const [referredSubscriptions] = await db
    .select({ count: count() })
    .from(referralRewards)
    .where(sql`${referralRewards.status} IN ('completed', 'rewarded')`);

  const avgSubscriptionValue = 150000; // 1,500 kr average
  const totalRevenueGenerated =
    Number(referredSubscriptions.count) * avgSubscriptionValue * 12; // Annual value

  const roi = totalRewardsPaid > 0
    ? ((totalRevenueGenerated - totalRewardsPaid) / totalRewardsPaid) * 100
    : 0;

  return {
    totalRewardsPaid,
    totalRevenueGenerated,
    roi,
  };
}
