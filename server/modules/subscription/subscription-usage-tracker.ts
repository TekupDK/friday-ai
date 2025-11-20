/**
 * Subscription Usage Tracker
 * 
 * Automatically tracks subscription usage from bookings
 */

import { eq, and, gte, lte } from "drizzle-orm";

import { bookings, subscriptions, subscriptionUsage } from "../../../drizzle/schema";

import { logger } from "../../_core/logger";
import { getDb } from "../../db";
import { getSubscriptionByCustomerId, createSubscriptionUsage } from './subscription-db';

/**
 * Track usage from a booking
 * Should be called when a booking is completed
 */
export async function trackBookingUsage(
  bookingId: number,
  userId: number,
  hoursWorked: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.userId, userId)
        )
      )
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!booking.customerProfileId) {
      // No customer = no subscription tracking
      return { success: true };
    }

    // Get active subscription for customer
    const subscription = await getSubscriptionByCustomerId(
      booking.customerProfileId,
      userId
    );

    if (!subscription) {
      // No subscription = no tracking needed
      return { success: true };
    }

    // Calculate date components
    const bookingDate = new Date(booking.scheduledStart || booking.createdAt);
    const year = bookingDate.getFullYear();
    const month = bookingDate.getMonth() + 1;

    // Create usage entry
    await createSubscriptionUsage({
      subscriptionId: subscription.id,
      bookingId: booking.id,
      hoursUsed: hoursWorked.toString(),
      date: bookingDate.toISOString(),
      month,
      year,
      metadata: {
        bookingTitle: booking.title,
        bookingNotes: booking.notes,
        trackedAt: new Date().toISOString(),
      },
    });

    logger.info(
      {
        subscriptionId: subscription.id,
        bookingId: booking.id,
        hoursWorked,
        year,
        month,
      },
      "[Subscription Usage] Tracked booking usage"
    );

    return { success: true };
  } catch (error) {
    logger.error(
      {
        bookingId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Usage] Failed to track booking usage"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate hours from booking scheduled time
 * Falls back to estimated hours if actual hours not available
 */
export function calculateBookingHours(booking: {
  scheduledStart: string;
  scheduledEnd?: string | null;
  actualStart?: string | null;
  actualEnd?: string | null;
}): number {
  // Try actual hours first
  if (booking.actualStart && booking.actualEnd) {
    const start = new Date(booking.actualStart);
    const end = new Date(booking.actualEnd);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, hours);
  }

  // Fallback to scheduled hours
  if (booking.scheduledStart && booking.scheduledEnd) {
    const start = new Date(booking.scheduledStart);
    const end = new Date(booking.scheduledEnd);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, hours);
  }

  // Default: 3 hours if no time specified
  return 3.0;
}

/**
 * Sync all bookings for a subscription (backfill usage)
 * Useful for initial setup or data migration
 */
export async function syncSubscriptionUsage(
  subscriptionId: number,
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  synced: number;
  errors: Array<{ bookingId: number; error: string }>;
}> {
  const result = {
    success: true,
    synced: 0,
    errors: [] as Array<{ bookingId: number; error: string }>,
  };

  try {
    const db = await getDb();
    if (!db) {
      return { ...result, success: false };
    }

    // Get subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      )
      .limit(1);

    if (!subscription) {
      return { ...result, success: false };
    }

    // Get bookings for customer
    const conditions = [
      eq(bookings.customerProfileId, subscription.customerProfileId),
      eq(bookings.userId, userId),
    ];

    if (startDate) {
      conditions.push(gte(bookings.scheduledStart, startDate));
    }

    if (endDate) {
      conditions.push(lte(bookings.scheduledStart, endDate));
    }

    const customerBookings = await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(bookings.scheduledStart);

    // Track usage for each booking
    for (const booking of customerBookings) {
      try {
        const hoursWorked = calculateBookingHours(booking);
        const trackResult = await trackBookingUsage(
          booking.id,
          userId,
          hoursWorked
        );

        if (trackResult.success) {
          result.synced++;
        } else {
          result.errors.push({
            bookingId: booking.id,
            error: trackResult.error || "Unknown error",
          });
        }
      } catch (error) {
        result.errors.push({
          bookingId: booking.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    result.success = result.errors.length === 0;

    logger.info(
      {
        subscriptionId,
        userId,
        synced: result.synced,
        errors: result.errors.length,
      },
      "[Subscription Usage] Completed usage sync"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        subscriptionId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Usage] Failed to sync usage"
    );

    return { ...result, success: false };
  }
}

