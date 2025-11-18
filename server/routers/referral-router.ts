/**
 * Referral Router
 *
 * tRPC endpoints for referral program management
 */

import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { referralCodes, referralRewards } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  createReferralCode,
  applyReferralCode,
  completeReferral,
  giveReferralReward,
  getUserReferralCodes,
  getUserReferralRewards,
  deactivateReferralCode,
} from "../referral-actions";
import {
  validateReferralCode,
  getReferralStats,
  getTopReferrers,
  getReferralConversionRate,
  calculateReferralROI,
  REFERRAL_CONFIG,
} from "../referral-helpers";

export const referralRouter = router({
  /**
   * Create a new referral code
   */
  createCode: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive().optional(),
        customCode: z.string().max(50).optional(),
        discountAmount: z.number().int().positive().optional(),
        discountType: z.enum(["fixed", "percentage"]).default("fixed"),
        maxUses: z.number().int().positive().optional(),
        validityDays: z.number().int().positive().default(365),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createReferralCode({
        userId: ctx.user.id,
        customerProfileId: input.customerProfileId,
        customCode: input.customCode,
        discountAmount: input.discountAmount,
        discountType: input.discountType,
        maxUses: input.maxUses,
        validityDays: input.validityDays,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to create referral code",
        });
      }

      return result.referralCode;
    }),

  /**
   * Validate referral code
   */
  validateCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const validation = await validateReferralCode(input.code);

      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.reason || "Invalid referral code",
        });
      }

      return {
        valid: true,
        code: validation.referralCode,
      };
    }),

  /**
   * Apply referral code (used during signup/subscription creation)
   */
  applyCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        referredCustomerId: z.number().int().positive(),
        referredSubscriptionId: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await applyReferralCode({
        code: input.code,
        referredCustomerId: input.referredCustomerId,
        referredSubscriptionId: input.referredSubscriptionId,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to apply referral code",
        });
      }

      return {
        reward: result.reward,
        discountAmount: result.discountAmount,
      };
    }),

  /**
   * Get all referral codes for current user
   */
  listCodes: protectedProcedure.query(async ({ ctx }) => {
    return await getUserReferralCodes(ctx.user.id);
  }),

  /**
   * Get all referral rewards for current user (as referrer)
   */
  listRewards: protectedProcedure.query(async ({ ctx }) => {
    return await getUserReferralRewards(ctx.user.id);
  }),

  /**
   * Get referral statistics for current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return await getReferralStats(ctx.user.id);
  }),

  /**
   * Get top referrers (admin only or public leaderboard)
   */
  getTopReferrers: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      return await getTopReferrers(input.limit);
    }),

  /**
   * Get referral conversion rate
   */
  getConversionRate: protectedProcedure
    .input(
      z.object({
        userId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only allow users to see their own conversion rate (unless admin)
      const userId = input?.userId === ctx.user.id ? ctx.user.id : undefined;

      const rate = await getReferralConversionRate(userId);

      return {
        conversionRate: rate,
        userId: userId || "global",
      };
    }),

  /**
   * Get referral ROI (admin only - would need admin check)
   */
  getReferralROI: protectedProcedure.query(async () => {
    return await calculateReferralROI();
  }),

  /**
   * Deactivate referral code
   */
  deactivateCode: protectedProcedure
    .input(
      z.object({
        referralCodeId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await deactivateReferralCode({
        referralCodeId: input.referralCodeId,
        userId: ctx.user.id,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to deactivate referral code",
        });
      }

      return { success: true };
    }),

  /**
   * Complete referral (called when referred customer meets requirements)
   * This should be called by a background job or webhook
   */
  completeReferral: protectedProcedure
    .input(
      z.object({
        referralRewardId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await completeReferral({
        referralRewardId: input.referralRewardId,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to complete referral",
        });
      }

      return { success: true };
    }),

  /**
   * Give reward to referrer
   * This should be called after referral is completed
   */
  giveReward: protectedProcedure
    .input(
      z.object({
        referralRewardId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await giveReferralReward({
        referralRewardId: input.referralRewardId,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to give reward",
        });
      }

      return { success: true };
    }),

  /**
   * Get referral configuration
   */
  getConfig: protectedProcedure.query(() => {
    return {
      defaultReferrerReward: REFERRAL_CONFIG.defaultReferrerReward,
      defaultReferredReward: REFERRAL_CONFIG.defaultReferredReward,
      codeLength: REFERRAL_CONFIG.codeLength,
      codePrefix: REFERRAL_CONFIG.codePrefix,
      validityDays: REFERRAL_CONFIG.validityDays,
      minSubscriptionMonthsForReward:
        REFERRAL_CONFIG.minSubscriptionMonthsForReward,
    };
  }),
});
