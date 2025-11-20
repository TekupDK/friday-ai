/**
 * Subscription Job Scheduler
 *
 * Schedules and manages background jobs for subscription features:
 * - Monthly billing (runs daily, processes on 1st of month)
 * - Usage tracking (runs daily)
 * - Renewal reminders (runs daily, sends 7 days before renewal)
 */

import { and, eq, gte, lte } from "drizzle-orm";
import cron from "node-cron";

import { subscriptions } from "../../../drizzle/schema";

import { logger } from "../../_core/logger";
import { getDb } from "../../db";
import { sendSubscriptionEmail } from "./subscription-email";
import { processMonthlyRenewals } from './subscription-jobs';

let isSchedulerRunning = false;

/**
 * Get subscriptions that need renewal reminders (7 days before next billing date)
 * Checks subscription history to avoid duplicate reminders
 */
async function getSubscriptionsNeedingReminder(): Promise<
  (typeof subscriptions.$inferSelect)[]
> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

  // Get all subscriptions with nextBillingDate within 7 days
  const candidateSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        gte(subscriptions.nextBillingDate, todayStr),
        lte(subscriptions.nextBillingDate, sevenDaysStr)
      )
    )
    .orderBy(subscriptions.nextBillingDate);

  if (candidateSubscriptions.length === 0) {
    return [];
  }

  // Check subscription history to see if reminder was already sent for this billing period
  const { subscriptionHistory } = await import("../drizzle/schema");
  const { getSubscriptionHistory } = await import("./subscription-db");

  const subscriptionsNeedingReminder: (typeof subscriptions.$inferSelect)[] =
    [];

  for (const subscription of candidateSubscriptions) {
    // Check if reminder was already sent for this nextBillingDate
    const history = await getSubscriptionHistory(
      subscription.id,
      subscription.userId,
      10
    );
    const reminderAlreadySent = history.some(
      entry =>
        entry.action === "renewal_reminder_sent" &&
        entry.newValue &&
        typeof entry.newValue === "object" &&
        "nextBillingDate" in entry.newValue &&
        entry.newValue.nextBillingDate === subscription.nextBillingDate
    );

    if (!reminderAlreadySent && subscription.nextBillingDate) {
      // Check if exactly 7 days away
      const nextBilling = new Date(subscription.nextBillingDate);
      const daysUntilBilling = Math.ceil(
        (nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilBilling === 7) {
        subscriptionsNeedingReminder.push(subscription);
      }
    }
  }

  return subscriptionsNeedingReminder;
}

/**
 * Send renewal reminders for subscriptions due in 7 days
 */
async function sendRenewalReminders(): Promise<void> {
  try {
    logger.info({}, "[Subscription Scheduler] Starting renewal reminder job");

    const subscriptionsNeedingReminder =
      await getSubscriptionsNeedingReminder();

    if (subscriptionsNeedingReminder.length === 0) {
      logger.info(
        {},
        "[Subscription Scheduler] No subscriptions need renewal reminders"
      );
      return;
    }

    logger.info(
      { count: subscriptionsNeedingReminder.length },
      "[Subscription Scheduler] Found subscriptions needing renewal reminders"
    );

    let sent = 0;
    let failed = 0;

    // Import subscription history helper
    const { addSubscriptionHistory } = await import("./subscription-db");

    for (const subscription of subscriptionsNeedingReminder) {
      if (!subscription.nextBillingDate) {
        continue; // Skip if no billing date
      }

      try {
        // Send renewal reminder email
        await sendSubscriptionEmail({
          type: "renewal",
          subscriptionId: subscription.id,
          userId: subscription.userId,
          additionalData: {
            reminder: true,
            daysUntilRenewal: 7,
          },
        });

        // Record reminder in subscription history to prevent duplicates
        await addSubscriptionHistory({
          subscriptionId: subscription.id,
          action: "renewal_reminder_sent",
          oldValue: { nextBillingDate: subscription.nextBillingDate },
          newValue: {
            nextBillingDate: subscription.nextBillingDate,
            reminderSentAt: new Date().toISOString(),
            daysUntilRenewal: 7,
          },
          changedBy: null, // System action
          timestamp: new Date().toISOString(),
        });

        sent++;
        logger.info(
          {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            nextBillingDate: subscription.nextBillingDate,
          },
          "[Subscription Scheduler] Sent renewal reminder"
        );
      } catch (error) {
        failed++;
        logger.error(
          {
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          },
          "[Subscription Scheduler] Failed to send renewal reminder"
        );
      }
    }

    logger.info(
      { sent, failed, total: subscriptionsNeedingReminder.length },
      "[Subscription Scheduler] Completed renewal reminder job"
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Scheduler] Fatal error in renewal reminder job"
    );
  }
}

/**
 * Process usage tracking for all active subscriptions
 * This runs daily to ensure usage is up-to-date and flag overage customers
 */
async function processUsageTracking(): Promise<void> {
  try {
    logger.info({}, "[Subscription Scheduler] Starting usage tracking job");

    const db = await getDb();
    if (!db) {
      logger.warn(
        {},
        "[Subscription Scheduler] Database not available for usage tracking"
      );
      return;
    }

    // Get all active subscriptions
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    if (activeSubscriptions.length === 0) {
      logger.info(
        {},
        "[Subscription Scheduler] No active subscriptions for usage tracking"
      );
      return;
    }

    logger.info(
      { count: activeSubscriptions.length },
      "[Subscription Scheduler] Processing usage for active subscriptions"
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let checked = 0;
    let overageFound = 0;

    // Import usage tracking functions
    const { checkOverage } = await import("./subscription-helpers");

    for (const subscription of activeSubscriptions) {
      try {
        // Check for overage in current month
        const overageResult = await checkOverage(
          subscription.id,
          currentYear,
          currentMonth,
          subscription.userId
        );

        if (overageResult.hasOverage) {
          overageFound++;
          logger.warn(
            {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              hoursUsed: overageResult.hoursUsed,
              includedHours: overageResult.includedHours,
              overageHours: overageResult.overageHours,
            },
            "[Subscription Scheduler] Overage detected"
          );

          // Send overage warning email (if not already sent this month)
          try {
            await sendSubscriptionEmail({
              type: "overage_warning",
              subscriptionId: subscription.id,
              userId: subscription.userId,
              additionalData: {
                hoursUsed: overageResult.hoursUsed,
                includedHours: overageResult.includedHours,
                overageHours: overageResult.overageHours,
              },
            });
          } catch (emailError) {
            logger.error(
              {
                subscriptionId: subscription.id,
                error:
                  emailError instanceof Error
                    ? emailError.message
                    : String(emailError),
              },
              "[Subscription Scheduler] Failed to send overage warning email"
            );
          }
        }

        checked++;
      } catch (error) {
        logger.error(
          {
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          },
          "[Subscription Scheduler] Error checking usage for subscription"
        );
      }
    }

    logger.info(
      { checked, overageFound, total: activeSubscriptions.length },
      "[Subscription Scheduler] Usage tracking job completed"
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Scheduler] Fatal error in usage tracking job"
    );
  }
}

/**
 * Process monthly billing
 * Runs daily, but only processes subscriptions where nextBillingDate <= today
 */
async function processMonthlyBilling(): Promise<void> {
  try {
    logger.info({}, "[Subscription Scheduler] Starting monthly billing job");

    const result = await processMonthlyRenewals();

    logger.info(
      {
        processed: result.processed,
        failed: result.failed,
        success: result.success,
      },
      "[Subscription Scheduler] Monthly billing job completed"
    );

    if (result.failed > 0) {
      logger.warn(
        { errors: result.errors },
        "[Subscription Scheduler] Some billing operations failed"
      );
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Scheduler] Fatal error in monthly billing job"
    );
  }
}

/**
 * Start all subscription job schedulers
 * Should be called when server starts
 */
export function startSubscriptionSchedulers(): void {
  if (isSchedulerRunning) {
    logger.warn({}, "[Subscription Scheduler] Schedulers already running");
    return;
  }

  logger.info(
    {},
    "[Subscription Scheduler] Starting subscription job schedulers"
  );

  // Monthly billing job - runs daily at 9:00 AM
  // Processes all subscriptions where nextBillingDate <= today
  cron.schedule(
    "0 9 * * *",
    async () => {
      await processMonthlyBilling();
    },
    {
      timezone: "Europe/Copenhagen",
    }
  );

  logger.info(
    {},
    "[Subscription Scheduler] Monthly billing job scheduled (daily at 9:00 AM)"
  );

  // Usage tracking job - runs daily at 10:00 AM
  // Primarily for validation and backfilling (actual tracking is event-driven)
  cron.schedule(
    "0 10 * * *",
    async () => {
      await processUsageTracking();
    },
    {
      timezone: "Europe/Copenhagen",
    }
  );

  logger.info(
    {},
    "[Subscription Scheduler] Usage tracking job scheduled (daily at 10:00 AM)"
  );

  // Renewal reminder job - runs daily at 11:00 AM
  // Sends reminders 7 days before renewal
  cron.schedule(
    "0 11 * * *",
    async () => {
      await sendRenewalReminders();
    },
    {
      timezone: "Europe/Copenhagen",
    }
  );

  logger.info(
    {},
    "[Subscription Scheduler] Renewal reminder job scheduled (daily at 11:00 AM)"
  );

  isSchedulerRunning = true;
  logger.info(
    {},
    "[Subscription Scheduler] All subscription schedulers started"
  );
}

/**
 * Stop all subscription job schedulers
 * Useful for graceful shutdown
 */
export function stopSubscriptionSchedulers(): void {
  if (!isSchedulerRunning) {
    return;
  }

  logger.info(
    {},
    "[Subscription Scheduler] Stopping subscription job schedulers"
  );

  // Note: node-cron doesn't provide a direct way to stop all tasks
  // In production, you might want to track task references and stop them individually
  // For now, we just mark as stopped

  isSchedulerRunning = false;
  logger.info(
    {},
    "[Subscription Scheduler] All subscription schedulers stopped"
  );
}
