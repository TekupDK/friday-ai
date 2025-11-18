/**
 * Subscription Actions
 * 
 * Business logic for subscription operations including creation, renewal, cancellation,
 * and integration with Billy.dk and Google Calendar.
 */

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  subscriptions,
  customerProfiles,
  InsertSubscription,
  InsertSubscriptionHistory,
  type Subscription,
} from "../drizzle/schema";

import { createInvoice } from "./billy";
import { getDb } from "./db";
import { createCalendarEvent } from "./google-api";
import {
  getSubscriptionById,
  getSubscriptionByCustomerId,
  addSubscriptionHistory,
} from "./subscription-db";
import { getPlanConfig, type SubscriptionPlanType } from "./subscription-helpers";

/**
 * Calculate next billing date (1 month from start date or last billing)
 */
export function calculateNextBillingDate(startDate: string): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

/**
 * Calculate period end date (end of current billing period)
 */
export function calculatePeriodEnd(startDate: string): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0); // Last day of current month
  return date.toISOString();
}

/**
 * Create subscription with all related resources
 */
export async function createSubscription(
  userId: number,
  customerProfileId: number,
  planType: SubscriptionPlanType,
  options?: {
    startDate?: string;
    autoRenew?: boolean;
    metadata?: Record<string, any>;
    referralCode?: string;
  }
): Promise<Subscription> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // Get customer profile
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerProfileId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer profile not found",
    });
  }

  // Check if customer already has active subscription
  const existing = await getSubscriptionByCustomerId(customerProfileId, userId);
  if (existing && existing.status === "active") {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Customer already has an active subscription",
    });
  }

  // Get plan configuration
  const planConfig = getPlanConfig(planType);
  const startDate = options?.startDate || new Date().toISOString();
  const nextBillingDate = calculateNextBillingDate(startDate);

  // Handle referral code if provided
  let referralInfo: {
    referralCodeId?: number;
    referralRewardId?: number;
    discountAmount?: number;
    originalPrice?: number;
  } | null = null;

  let finalMonthlyPrice: number = planConfig.monthlyPrice;

  if (options?.referralCode) {
    const { validateReferralCode, calculateReferralDiscount } = await import("./referral-helpers");
    const { applyReferralCode } = await import("./referral-actions");

    // Validate referral code
    const validation = await validateReferralCode(options.referralCode);
    if (!validation.valid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: validation.reason || "Invalid referral code",
      });
    }

    // Calculate discount
    const discountAmount = calculateReferralDiscount(
      validation.referralCode,
      planConfig.monthlyPrice
    );

    // Apply discounted price
    finalMonthlyPrice = Math.max(0, planConfig.monthlyPrice - discountAmount);

    // Store referral info for later (after subscription is created)
    referralInfo = {
      referralCodeId: validation.referralCode.id,
      discountAmount,
      originalPrice: planConfig.monthlyPrice,
    };
  }

  // Create subscription
  const metadata = options?.metadata || {};
  if (referralInfo) {
    metadata.referral = {
      codeId: referralInfo.referralCodeId,
      discountAmount: referralInfo.discountAmount,
      originalPrice: referralInfo.originalPrice,
      appliedAt: new Date().toISOString(),
    };
  }

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId,
      customerProfileId,
      planType,
      monthlyPrice: finalMonthlyPrice,
      includedHours: planConfig.includedHours.toString(),
      startDate,
      status: "active",
      autoRenew: options?.autoRenew ?? true,
      nextBillingDate,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  // Add history entry
  await addSubscriptionHistory({
    subscriptionId: subscription.id,
    action: "created",
    oldValue: null,
    newValue: subscription,
    changedBy: userId,
    timestamp: new Date().toISOString(),
  });

  // Apply referral code if provided
  if (options?.referralCode && referralInfo) {
    const { applyReferralCode } = await import("./referral-actions");

    try {
      const result = await applyReferralCode({
        code: options.referralCode,
        referredCustomerId: customerProfileId,
        referredSubscriptionId: subscription.id,
      });

      if (result.success && result.reward) {
        // Update referral info with reward ID
        referralInfo.referralRewardId = result.reward.id;

        // Update subscription metadata with reward ID
        await db
          .update(subscriptions)
          .set({
            metadata: {
              ...metadata,
              referral: {
                ...metadata.referral,
                rewardId: result.reward.id,
              },
            },
          })
          .where(eq(subscriptions.id, subscription.id));
      }
    } catch (error) {
      console.error("Error applying referral code:", error);
      // Don't fail subscription creation if referral fails
    }
  }

  // Create recurring calendar events (async, don't wait)
  createRecurringBookings(subscription.id, planConfig, customer.name || customer.email).catch(
    (error) => {
      console.error("Error creating recurring bookings:", error);
      // Don't fail subscription creation if calendar fails
    }
  );

  // Send welcome email (async, don't wait)
  import("./subscription-email")
    .then(({ sendSubscriptionEmail }) =>
      sendSubscriptionEmail({
        type: "welcome",
        subscriptionId: subscription.id,
        userId,
      })
    )
    .catch((error) => {
      console.error("Error sending welcome email:", error);
      // Don't fail subscription creation if email fails
    });

  return subscription;
}

/**
 * Create recurring calendar bookings for subscription
 */
async function createRecurringBookings(
  subscriptionId: number,
  planConfig: ReturnType<typeof getPlanConfig>,
  customerName: string
): Promise<void> {
  // Calculate booking dates for next 12 months
  const dates: Date[] = [];
  const startDate = new Date();
  
  // Determine frequency based on plan
  const isBiweekly = planConfig.name.includes("VIP") || planConfig.includedHours >= 6;
  const frequency = isBiweekly ? "biweekly" : "monthly";
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    if (frequency === "biweekly") {
      date.setDate(date.getDate() + i * 14);
    } else {
      date.setMonth(date.getMonth() + i);
    }
    dates.push(date);
  }

  // Create calendar events
  for (const date of dates) {
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Default: 9:00 AM
    
    const endTime = new Date(startTime);
    endTime.setHours(
      startTime.getHours() + Math.ceil(planConfig.includedHours / (isBiweekly ? 2 : 1))
    );

    try {
      await createCalendarEvent({
        summary: `🏠 ${planConfig.name} - ${customerName}`,
        description: `Abonnement rengøring\nPlan: ${planConfig.name}\nInkluderet timer: ${planConfig.includedHours}`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      });
    } catch (error) {
      console.error(`Error creating calendar event for ${date.toISOString()}:`, error);
      // Continue with next date
    }
  }
}

/**
 * Process subscription renewal
 * Called monthly to renew active subscriptions
 */
export async function processRenewal(
  subscriptionId: number,
  userId: number
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database connection failed" };
  }

  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }

  if (subscription.status !== "active") {
    return { success: false, error: "Subscription is not active" };
  }

  // Get customer
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.id, subscription.customerProfileId))
    .limit(1);

  if (!customer) {
    return { success: false, error: "Customer not found" };
  }

  // Create invoice via Billy.dk
  try {
    const billyContactId = customer.billyCustomerId || customer.billyOrganizationId;
    if (!billyContactId) {
      return { success: false, error: "Customer has no Billy contact ID" };
    }

    const planConfig = getPlanConfig(subscription.planType as SubscriptionPlanType);
    const monthName = new Date().toLocaleDateString("da-DK", {
      month: "long",
      year: "numeric",
    });

    const invoice = await createInvoice({
      contactId: billyContactId,
      entryDate: new Date().toISOString().split("T")[0],
      paymentTermsDays: 14,
      lines: [
        {
          description: `${planConfig.name} - ${monthName}`,
          quantity: 1,
          unitPrice: subscription.monthlyPrice / 100, // Convert from øre to DKK
          productId: `SUB-${subscription.planType.toUpperCase().replace("_", "-")}`,
        },
      ],
    });

    // Update next billing date
    const nextBillingDate = calculateNextBillingDate(
      subscription.nextBillingDate || subscription.startDate
    );

    await db
      .update(subscriptions)
      .set({
        nextBillingDate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.id, subscriptionId));

    // Add history entry
    await addSubscriptionHistory({
      subscriptionId,
      action: "renewed",
      oldValue: { nextBillingDate: subscription.nextBillingDate },
      newValue: { nextBillingDate, invoiceId: invoice.id },
      changedBy: null, // System action
      timestamp: new Date().toISOString(),
    });

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Error processing renewal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process subscription cancellation
 */
export async function processCancellation(
  subscriptionId: number,
  userId: number,
  reason?: string,
  effectiveDate?: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database connection failed" };
  }

  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }

  // Calculate end date (end of current billing period)
  const endDate = effectiveDate || calculatePeriodEnd(subscription.startDate);

  // Update subscription
  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      endDate,
      autoRenew: false,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, subscriptionId));

  // Add history entry
  await addSubscriptionHistory({
    subscriptionId,
    action: "cancelled",
    oldValue: {
      status: subscription.status,
      autoRenew: subscription.autoRenew,
    },
    newValue: {
      status: "cancelled",
      autoRenew: false,
      endDate,
      reason,
    },
    changedBy: userId,
    timestamp: new Date().toISOString(),
  });

  // Send cancellation email (async, don't wait)
  import("./subscription-email")
    .then(({ sendSubscriptionEmail }) =>
      sendSubscriptionEmail({
        type: "cancellation",
        subscriptionId,
        userId,
      })
    )
    .catch((error) => {
      console.error("Error sending cancellation email:", error);
      // Don't fail cancellation if email fails
    });

  return { success: true };
}

/**
 * Apply discount to subscription (for referrals, promotions, etc.)
 */
export async function applyDiscount(
  subscriptionId: number,
  userId: number,
  discount: {
    type: "percentage" | "fixed";
    value: number; // Percentage (0-100) or fixed amount in øre
    reason: string;
    validUntil?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }

  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database connection failed" };
  }

  // Calculate discounted price
  let discountedPrice = subscription.monthlyPrice;
  if (discount.type === "percentage") {
    discountedPrice = Math.round(
      subscription.monthlyPrice * (1 - discount.value / 100)
    );
  } else {
    discountedPrice = Math.max(0, subscription.monthlyPrice - discount.value);
  }

  // Update metadata with discount info
  const metadata = (subscription.metadata as Record<string, any>) || {};
  metadata.discount = {
    ...discount,
    originalPrice: subscription.monthlyPrice,
    discountedPrice,
    appliedAt: new Date().toISOString(),
  };

  await db
    .update(subscriptions)
    .set({
      monthlyPrice: discountedPrice,
      metadata,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, subscriptionId));

  // Add history entry
  await addSubscriptionHistory({
    subscriptionId,
    action: "discount_applied",
    oldValue: { monthlyPrice: subscription.monthlyPrice },
    newValue: { monthlyPrice: discountedPrice, discount },
    changedBy: userId,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

