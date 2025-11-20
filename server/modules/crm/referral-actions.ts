/**
 * Referral Program Actions
 *
 * Database operations for referral codes, rewards, and tracking
 */

import { eq, and, desc, sql, gte } from "drizzle-orm";

import {
  referralCodes,
  referralRewards,
  referralHistory,
  subscriptions,
  type ReferralCode,
  type InsertReferralCode,
  type ReferralReward,
  type InsertReferralReward,
} from "../../../drizzle/schema";

import { logger } from "../../_core/logger";
import { getDb } from "../../db";
import {
  generateReferralCode,
  validateReferralCode,
  calculateReferralDiscount,
  logReferralHistory,
  REFERRAL_CONFIG,
} from "../crm/referral-helpers";

/**
 * Create a new referral code for a user
 */
export async function createReferralCode(params: {
  userId: number;
  customerProfileId?: number;
  customCode?: string;
  discountAmount?: number;
  discountType?: "fixed" | "percentage";
  maxUses?: number;
  validityDays?: number;
}): Promise<{ success: boolean; referralCode?: ReferralCode; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Generate unique code
    const code = await generateReferralCode(params.userId, params.customCode);

    // Calculate validity period
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(
      validUntil.getDate() + (params.validityDays || REFERRAL_CONFIG.validityDays)
    );

    // Create referral code
    const [referralCode] = await db
      .insert(referralCodes)
      .values({
        userId: params.userId,
        customerProfileId: params.customerProfileId,
        code,
        discountAmount: params.discountAmount || REFERRAL_CONFIG.defaultReferredReward,
        discountType: params.discountType || "fixed",
        maxUses: params.maxUses ?? REFERRAL_CONFIG.maxUsesDefault,
        currentUses: 0,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        isActive: true,
        metadata: JSON.stringify({
          createdBySystem: true,
        }),
      })
      .returning();

    // Log history
    await logReferralHistory({
      referralCodeId: referralCode.id,
      action: "code_created",
      newValue: { code, discountAmount: referralCode.discountAmount },
      performedBy: params.userId,
    });

    logger.info(
      {
        userId: params.userId,
        code: referralCode.code,
        referralCodeId: referralCode.id,
      },
      "[Referral] Referral code created successfully"
    );

    return { success: true, referralCode };
  } catch (error) {
    logger.error(
      { error, userId: params.userId },
      "[Referral] Failed to create referral code"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Apply referral code when new customer signs up
 */
export async function applyReferralCode(params: {
  code: string;
  referredCustomerId: number;
  referredSubscriptionId?: number;
}): Promise<{
  success: boolean;
  reward?: ReferralReward;
  discountAmount?: number;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Validate referral code
    const validation = await validateReferralCode(params.code);

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    const referralCode = validation.referralCode!;

    // Increment usage count
    await db
      .update(referralCodes)
      .set({
        currentUses: sql`${referralCodes.currentUses} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(referralCodes.id, referralCode.id));

    // Create referral reward (pending until subscription is confirmed)
    const [reward] = await db
      .insert(referralRewards)
      .values({
        referralCodeId: referralCode.id,
        referrerId: referralCode.userId,
        referredCustomerId: params.referredCustomerId,
        referredSubscriptionId: params.referredSubscriptionId,
        status: "pending",
        rewardAmount: REFERRAL_CONFIG.defaultReferrerReward,
        rewardType: "discount",
        metadata: JSON.stringify({
          appliedAt: new Date().toISOString(),
        }),
      })
      .returning();

    // Log history
    await logReferralHistory({
      referralCodeId: referralCode.id,
      referralRewardId: reward.id,
      action: "code_used",
      oldValue: { currentUses: referralCode.currentUses },
      newValue: { currentUses: referralCode.currentUses + 1 },
      metadata: {
        referredCustomerId: params.referredCustomerId,
      },
    });

    // Calculate discount for referred customer
    const discountAmount = calculateReferralDiscount(
      referralCode,
      150000 // Assume average subscription price (will be calculated from actual subscription)
    );

    logger.info(
      {
        code: params.code,
        referredCustomerId: params.referredCustomerId,
        discountAmount,
      },
      "[Referral] Referral code applied successfully"
    );

    return { success: true, reward, discountAmount };
  } catch (error) {
    logger.error(
      { error, code: params.code },
      "[Referral] Failed to apply referral code"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Complete referral and give reward
 * Called when referred customer completes required action (e.g., 1 month subscription)
 */
export async function completeReferral(params: {
  referralRewardId: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get referral reward
    const [reward] = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.id, params.referralRewardId))
      .limit(1);

    if (!reward) {
      return { success: false, error: "Referral reward not found" };
    }

    if (reward.status !== "pending") {
      return { success: false, error: `Referral reward is already ${reward.status}` };
    }

    // Check if referred subscription is still active (if applicable)
    if (reward.referredSubscriptionId) {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, reward.referredSubscriptionId))
        .limit(1);

      if (!subscription) {
        return { success: false, error: "Referred subscription not found" };
      }

      if (subscription.status !== "active") {
        return {
          success: false,
          error: "Referred subscription is not active",
        };
      }

      // Check if subscription has been active for minimum required months
      const startDate = new Date(subscription.startDate);
      const now = new Date();
      const monthsActive =
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsActive < REFERRAL_CONFIG.minSubscriptionMonthsForReward) {
        return {
          success: false,
          error: `Subscription must be active for at least ${REFERRAL_CONFIG.minSubscriptionMonthsForReward} month(s)`,
        };
      }
    }

    // Update reward status to completed
    await db
      .update(referralRewards)
      .set({
        status: "completed",
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(referralRewards.id, params.referralRewardId));

    // Log history
    await logReferralHistory({
      referralCodeId: reward.referralCodeId,
      referralRewardId: reward.id,
      action: "referral_completed",
      oldValue: { status: "pending" },
      newValue: { status: "completed" },
    });

    logger.info(
      {
        referralRewardId: params.referralRewardId,
        referrerId: reward.referrerId,
        rewardAmount: reward.rewardAmount,
      },
      "[Referral] Referral completed successfully"
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { error, referralRewardId: params.referralRewardId },
      "[Referral] Failed to complete referral"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Give reward to referrer
 * Called after referral is completed
 */
export async function giveReferralReward(params: {
  referralRewardId: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get referral reward
    const [reward] = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.id, params.referralRewardId))
      .limit(1);

    if (!reward) {
      return { success: false, error: "Referral reward not found" };
    }

    if (reward.status !== "completed") {
      return {
        success: false,
        error: `Referral must be completed before giving reward (current status: ${reward.status})`,
      };
    }

    // Update reward status to rewarded
    await db
      .update(referralRewards)
      .set({
        status: "rewarded",
        rewardAppliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(referralRewards.id, params.referralRewardId));

    // Log history
    await logReferralHistory({
      referralCodeId: reward.referralCodeId,
      referralRewardId: reward.id,
      action: "reward_given",
      oldValue: { status: "completed" },
      newValue: { status: "rewarded", rewardAmount: reward.rewardAmount },
    });

    logger.info(
      {
        referralRewardId: params.referralRewardId,
        referrerId: reward.referrerId,
        rewardAmount: reward.rewardAmount,
      },
      "[Referral] Reward given successfully"
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { error, referralRewardId: params.referralRewardId },
      "[Referral] Failed to give reward"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all referral codes for a user
 */
export async function getUserReferralCodes(
  userId: number
): Promise<ReferralCode[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .orderBy(desc(referralCodes.createdAt));
}

/**
 * Get all referral rewards for a user (as referrer)
 */
export async function getUserReferralRewards(
  userId: number
): Promise<ReferralReward[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.referrerId, userId))
    .orderBy(desc(referralRewards.createdAt));
}

/**
 * Deactivate referral code
 */
export async function deactivateReferralCode(params: {
  referralCodeId: number;
  userId: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get referral code
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(
        and(
          eq(referralCodes.id, params.referralCodeId),
          eq(referralCodes.userId, params.userId)
        )
      )
      .limit(1);

    if (!referralCode) {
      return { success: false, error: "Referral code not found" };
    }

    // Deactivate
    await db
      .update(referralCodes)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(referralCodes.id, params.referralCodeId));

    // Log history
    await logReferralHistory({
      referralCodeId: referralCode.id,
      action: "code_deactivated",
      oldValue: { isActive: true },
      newValue: { isActive: false },
      performedBy: params.userId,
    });

    logger.info(
      {
        referralCodeId: params.referralCodeId,
        userId: params.userId,
      },
      "[Referral] Referral code deactivated"
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { error, referralCodeId: params.referralCodeId },
      "[Referral] Failed to deactivate referral code"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
