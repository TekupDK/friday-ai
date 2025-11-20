/**
 * Subscription Background Jobs
 * 
 * Handles automated subscription tasks like monthly renewals
 */

import { logger } from "./_core/logger";
import { processRenewal } from "./subscription-actions";
import { getSubscriptionsDueForBilling } from "./subscription-db";
import { sendSubscriptionEmail } from "./subscription-email";

export interface JobResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ subscriptionId: number; error: string }>;
}

/**
 * Process all subscriptions due for billing
 * This should be called daily (e.g., via cron job or scheduled task)
 */
export async function processMonthlyRenewals(
  userId?: number
): Promise<JobResult> {
  const result: JobResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: [],
  };

  try {
    logger.info(
      { userId },
      "[Subscription Jobs] Starting monthly renewal processing"
    );

    const subscriptionsDue = await getSubscriptionsDueForBilling(userId);

    if (subscriptionsDue.length === 0) {
      logger.info(
        { userId },
        "[Subscription Jobs] No subscriptions due for billing"
      );
      return result;
    }

    logger.info(
      { userId, count: subscriptionsDue.length },
      "[Subscription Jobs] Found subscriptions due for billing"
    );

    // Process each subscription
    for (const subscription of subscriptionsDue) {
      try {
        const renewalResult = await processRenewal(
          subscription.id,
          subscription.userId
        );

        if (renewalResult.success) {
          result.processed++;
          logger.info(
            {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              invoiceId: renewalResult.invoiceId,
            },
            "[Subscription Jobs] Successfully processed renewal"
          );

          // Send renewal email
          try {
            await sendSubscriptionEmail({
              type: "renewal",
              subscriptionId: subscription.id,
              userId: subscription.userId,
            });
          } catch (emailError) {
            logger.error(
              {
                subscriptionId: subscription.id,
                error: emailError instanceof Error ? emailError.message : String(emailError),
              },
              "[Subscription Jobs] Failed to send renewal email"
            );
            // Don't fail renewal if email fails
          }
        } else {
          result.failed++;
          result.errors.push({
            subscriptionId: subscription.id,
            error: renewalResult.error || "Unknown error",
          });
          logger.error(
            {
              subscriptionId: subscription.id,
              error: renewalResult.error,
            },
            "[Subscription Jobs] Failed to process renewal"
          );
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        logger.error(
          {
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          },
          "[Subscription Jobs] Error processing renewal"
        );
      }
    }

    result.success = result.failed === 0;

    logger.info(
      {
        userId,
        processed: result.processed,
        failed: result.failed,
      },
      "[Subscription Jobs] Completed monthly renewal processing"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Jobs] Fatal error in monthly renewal processing"
    );
    result.success = false;
    return result;
  }
}

/**
 * Process renewals for a specific user
 * Useful for testing or manual triggers
 */
export async function processUserRenewals(userId: number): Promise<JobResult> {
  return await processMonthlyRenewals(userId);
}

