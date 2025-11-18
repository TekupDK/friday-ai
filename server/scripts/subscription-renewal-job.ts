/**
 * Subscription Renewal Job
 * 
 * Script to run subscription renewals (called by scheduled task)
 */

import { logger } from "../_core/logger";
import { processMonthlyRenewals } from "../subscription-jobs";

async function runRenewalJob() {
  try {
    logger.info({}, "[Subscription Renewal Job] Starting renewal processing");

    const result = await processMonthlyRenewals();

    logger.info(
      {
        processed: result.processed,
        failed: result.failed,
        errors: result.errors,
      },
      "[Subscription Renewal Job] Renewal processing completed"
    );

    if (result.failed > 0) {
      logger.warn(
        { failed: result.failed, errors: result.errors },
        "[Subscription Renewal Job] Some renewals failed"
      );
    }

    console.log(`✅ Processed: ${result.processed}`);
    console.log(`❌ Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((err) => {
        console.log(`  - Subscription ${err.subscriptionId}: ${err.error}`);
      });
    }

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error(
      { err: error },
      "[Subscription Renewal Job] Fatal error during renewal processing"
    );
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

runRenewalJob();

