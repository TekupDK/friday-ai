/**
 * Subscription Router
 * 
 * tRPC endpoints for subscription management
 */

import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { subscriptions, customerProfiles } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  createSubscription,
  processRenewal,
  processCancellation,
  applyDiscount,
  calculateNextBillingDate,
} from "../subscription-actions";
import {
  getSubscriptionById,
  getSubscriptionByCustomerId,
  getActiveSubscriptions,
  getSubscriptionsByStatus,
  getAllSubscriptions,
  getSubscriptionUsageForMonth,
  getTotalUsageForMonth,
  getSubscriptionHistory,
} from "../subscription-db";
import {
  getPlanConfig,
  calculateMonthlyRevenue,
  getChurnRate,
  getARPU,
  checkOverage,
  getSubscriptionStats,
  type SubscriptionPlanType,
} from "../subscription-helpers";

export const subscriptionRouter = router({
  /**
   * Create a new subscription
   */
  create: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive(),
        planType: z.enum([
          "tier1",
          "tier2",
          "tier3",
          "flex_basis",
          "flex_plus",
        ]),
        startDate: z.string().optional(),
        autoRenew: z.boolean().default(true),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createSubscription(
        ctx.user.id,
        input.customerProfileId,
        input.planType,
        {
          startDate: input.startDate,
          autoRenew: input.autoRenew,
          metadata: input.metadata,
        }
      );
    }),

  /**
   * List subscriptions with optional filters
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "cancelled", "expired", "all"]).optional(),
        customerProfileId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(subscriptions.userId, ctx.user.id)];

      if (input?.status && input.status !== "all") {
        conditions.push(eq(subscriptions.status, input.status));
      }

      if (input?.customerProfileId) {
        conditions.push(
          eq(subscriptions.customerProfileId, input.customerProfileId)
        );
      }

      return await db
        .select()
        .from(subscriptions)
        .where(and(...conditions))
        .orderBy(desc(subscriptions.createdAt));
    }),

  /**
   * Get single subscription by ID
   */
  get: protectedProcedure
    .input(z.object({ subscriptionId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const subscription = await getSubscriptionById(
        input.subscriptionId,
        ctx.user.id
      );

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return subscription;
    }),

  /**
   * Get subscription by customer ID
   */
  getByCustomer: protectedProcedure
    .input(z.object({ customerProfileId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const { getSubscriptionByCustomerId } = await import("../subscription-db");
      const subscription = await getSubscriptionByCustomerId(
        input.customerProfileId,
        ctx.user.id
      );

      return subscription || null;
    }),

  /**
   * Update subscription (plan change, pause, etc.)
   */
  update: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        planType: z
          .enum(["tier1", "tier2", "tier3", "flex_basis", "flex_plus"])
          .optional(),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
        autoRenew: z.boolean().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const subscription = await getSubscriptionById(
        input.subscriptionId,
        ctx.user.id
      );

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const updateData: Partial<typeof subscriptions.$inferInsert> = {
        updatedAt: new Date().toISOString(),
      };

      // If plan type changed, update price and hours
      if (input.planType && input.planType !== subscription.planType) {
        const planConfig = getPlanConfig(input.planType);
        updateData.planType = input.planType;
        updateData.monthlyPrice = planConfig.monthlyPrice;
        updateData.includedHours = planConfig.includedHours.toString();
      }

      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      if (input.autoRenew !== undefined) {
        updateData.autoRenew = input.autoRenew;
      }

      if (input.metadata !== undefined) {
        updateData.metadata = {
          ...((subscription.metadata as Record<string, any>) || {}),
          ...input.metadata,
        };
      }

      const [updated] = await db
        .update(subscriptions)
        .set(updateData)
        .where(eq(subscriptions.id, input.subscriptionId))
        .returning();

      return updated;
    }),

  /**
   * Cancel subscription
   */
  cancel: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        reason: z.string().optional(),
        effectiveDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await processCancellation(
        input.subscriptionId,
        ctx.user.id,
        input.reason,
        input.effectiveDate
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to cancel subscription",
        });
      }

      return { success: true };
    }),

  /**
   * Get usage statistics for a subscription
   */
  getUsage: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        year: z.number().int().min(2020).max(2100).optional(),
        month: z.number().int().min(1).max(12).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const subscription = await getSubscriptionById(
        input.subscriptionId,
        ctx.user.id
      );

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const now = new Date();
      const year = input.year || now.getFullYear();
      const month = input.month || now.getMonth() + 1;

      const usage = await getSubscriptionUsageForMonth(
        input.subscriptionId,
        year,
        month,
        ctx.user.id
      );

      const totalUsage = await getTotalUsageForMonth(
        input.subscriptionId,
        year,
        month,
        ctx.user.id
      );

      const overage = await checkOverage(
        input.subscriptionId,
        year,
        month,
        ctx.user.id
      );

      return {
        subscription,
        usage,
        totalUsage,
        includedHours: Number(subscription.includedHours),
        overage,
      };
    }),

  /**
   * Get subscription history (audit trail)
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const subscription = await getSubscriptionById(
        input.subscriptionId,
        ctx.user.id
      );

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return await getSubscriptionHistory(
        input.subscriptionId,
        ctx.user.id,
        input.limit
      );
    }),

  /**
   * Get subscription statistics
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscriptionStats(ctx.user.id);
  }),

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  getMRR: protectedProcedure.query(async ({ ctx }) => {
    const mrr = await calculateMonthlyRevenue(ctx.user.id);
    return {
      mrr, // in øre
      mrrDkk: mrr / 100, // in DKK
      arr: mrr * 12, // Annual Recurring Revenue in øre
      arrDkk: (mrr * 12) / 100, // in DKK
    };
  }),

  /**
   * Calculate churn rate for a period
   */
  getChurnRate: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const rate = await getChurnRate(
        ctx.user.id,
        new Date(input.startDate),
        new Date(input.endDate)
      );
      return { churnRate: rate };
    }),

  /**
   * Get Average Revenue Per User (ARPU)
   */
  getARPU: protectedProcedure.query(async ({ ctx }) => {
    const arpu = await getARPU(ctx.user.id);
    return {
      arpu, // in øre
      arpuDkk: arpu / 100, // in DKK
    };
  }),

  /**
   * Apply discount to subscription
   */
  applyDiscount: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        discount: z.object({
          type: z.enum(["percentage", "fixed"]),
          value: z.number().min(0),
          reason: z.string(),
          validUntil: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await applyDiscount(
        input.subscriptionId,
        ctx.user.id,
        input.discount
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to apply discount",
        });
      }

      return { success: true };
    }),

  /**
   * Get AI-powered subscription plan recommendation
   */
  getRecommendation: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive(),
        includeReasoning: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { recommendSubscriptionPlan } = await import("../subscription-ai");
      return await recommendSubscriptionPlan(
        input.customerProfileId,
        ctx.user.id,
        input.includeReasoning
      );
    }),

  /**
   * Predict churn risk for a customer
   */
  predictChurnRisk: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive(),
        lookbackDays: z.number().int().min(1).max(365).optional().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      const { predictChurnRisk } = await import("../subscription-ai");
      return await predictChurnRisk(
        input.customerProfileId,
        ctx.user.id,
        input.lookbackDays
      );
    }),

  /**
   * Optimize subscription usage
   */
  optimizeUsage: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        optimizeFor: z.enum(["value", "convenience", "efficiency"]).optional().default("value"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { optimizeSubscriptionUsage } = await import("../subscription-ai");
      return await optimizeSubscriptionUsage(
        input.subscriptionId,
        ctx.user.id,
        input.optimizeFor
      );
    }),

  /**
   * Generate upsell opportunities
   */
  getUpsellOpportunities: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive(),
        includeCrossSell: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { generateUpsellOpportunities } = await import("../subscription-ai");
      return await generateUpsellOpportunities(
        input.customerProfileId,
        ctx.user.id,
        input.includeCrossSell
      );
    }),

  /**
   * Manually trigger renewal (for testing/admin)
   */
  renew: protectedProcedure
    .input(z.object({ subscriptionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await processRenewal(input.subscriptionId, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to renew subscription",
        });
      }

      return {
        success: true,
        invoiceId: result.invoiceId,
      };
    }),

  /**
   * Process monthly renewals (background job)
   * Can be called manually or via cron/scheduler
   */
  processRenewals: protectedProcedure
    .input(
      z.object({
        userId: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { processMonthlyRenewals } = await import("../subscription-jobs");
      return await processMonthlyRenewals(input.userId || ctx.user.id);
    }),
});


