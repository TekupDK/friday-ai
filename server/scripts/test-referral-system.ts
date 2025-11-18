/**
 * Test Referral System
 *
 * Tests referral code generation, validation, and reward tracking
 *
 * Usage:
 *   npm run test:referral
 *   or
 *   dotenv -e .env.dev -- tsx server/scripts/test-referral-system.ts
 */

import { logger } from "../_core/logger";
import { getDb } from "../db";
import {
  createReferralCode,
  applyReferralCode,
  getUserReferralCodes,
  getUserReferralRewards,
} from "../referral-actions";
import {
  validateReferralCode,
  getReferralStats,
  getReferralConversionRate,
  calculateReferralROI,
  REFERRAL_CONFIG,
} from "../referral-helpers";

async function testReferralSystem() {
  logger.info("[Referral Test] Starting referral system tests");

  const db = await getDb();
  if (!db) {
    logger.error("[Referral Test] Database connection failed");
    process.exit(1);
  }

  logger.info(
    {
      config: REFERRAL_CONFIG,
    },
    "[Referral Test] Referral configuration loaded"
  );

  // Test user IDs (use existing or create test users)
  const testUserId = 1; // Referrer
  const testCustomerId = 2; // Referred customer

  let testCodeId: number;
  let testCode: string;

  // Test 1: Create referral code
  logger.info("[Referral Test] Test 1: Creating referral code");

  try {
    const result = await createReferralCode({
      userId: testUserId,
      discountAmount: REFERRAL_CONFIG.defaultReferredReward,
      discountType: "fixed",
      validityDays: 365,
    });

    if (result.success && result.referralCode) {
      testCodeId = result.referralCode.id;
      testCode = result.referralCode.code;
      logger.info(
        {
          code: testCode,
          discountAmount: result.referralCode.discountAmount,
        },
        "[Referral Test] ✅ Test 1 PASSED: Referral code created successfully"
      );
    } else {
      logger.error(
        { error: result.error },
        "[Referral Test] ❌ Test 1 FAILED: Failed to create referral code"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 1 FAILED: Exception during code creation"
    );
    process.exit(1);
  }

  // Test 2: Create custom referral code
  logger.info("[Referral Test] Test 2: Creating custom referral code");

  try {
    const customCode = `TEST${Date.now().toString().slice(-6)}`;
    const result = await createReferralCode({
      userId: testUserId,
      customCode,
      discountAmount: 10000, // 100 kr
      discountType: "fixed",
    });

    if (result.success && result.referralCode) {
      logger.info(
        {
          code: result.referralCode.code,
          customCode,
        },
        "[Referral Test] ✅ Test 2 PASSED: Custom referral code created"
      );
    } else {
      logger.error(
        { error: result.error },
        "[Referral Test] ❌ Test 2 FAILED: Failed to create custom code"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 2 FAILED: Exception during custom code creation"
    );
    process.exit(1);
  }

  // Test 3: Validate referral code
  logger.info("[Referral Test] Test 3: Validating referral code");

  try {
    const validation = await validateReferralCode(testCode);

    if (validation.valid && validation.referralCode) {
      logger.info(
        {
          code: testCode,
          isActive: validation.referralCode.isActive,
          currentUses: validation.referralCode.currentUses,
        },
        "[Referral Test] ✅ Test 3 PASSED: Referral code validated successfully"
      );
    } else {
      logger.error(
        { reason: validation.reason },
        "[Referral Test] ❌ Test 3 FAILED: Code validation failed"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 3 FAILED: Exception during validation"
    );
    process.exit(1);
  }

  // Test 4: Validate invalid code
  logger.info("[Referral Test] Test 4: Validating invalid referral code");

  try {
    const validation = await validateReferralCode("INVALID123");

    if (!validation.valid) {
      logger.info(
        {
          reason: validation.reason,
        },
        "[Referral Test] ✅ Test 4 PASSED: Invalid code correctly rejected"
      );
    } else {
      logger.error(
        "[Referral Test] ❌ Test 4 FAILED: Invalid code was accepted"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 4 FAILED: Exception during validation"
    );
    process.exit(1);
  }

  // Test 5: Apply referral code (simulation - requires subscription)
  logger.info(
    "[Referral Test] Test 5: Simulating referral code application"
  );

  try {
    // Note: This test requires an actual customer and subscription
    // In production, this happens during subscription creation
    logger.info(
      "[Referral Test] ⚠️  Test 5 SKIPPED: Requires active subscription (tested in subscription flow)"
    );
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 5 FAILED: Exception during application"
    );
  }

  // Test 6: Get user referral codes
  logger.info("[Referral Test] Test 6: Fetching user referral codes");

  try {
    const codes = await getUserReferralCodes(testUserId);

    if (codes.length >= 2) {
      // Should have at least the 2 codes we created
      logger.info(
        {
          count: codes.length,
          codes: codes.map((c) => c.code),
        },
        "[Referral Test] ✅ Test 6 PASSED: User referral codes retrieved"
      );
    } else {
      logger.error(
        { count: codes.length },
        "[Referral Test] ❌ Test 6 FAILED: Expected at least 2 codes"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 6 FAILED: Exception during code retrieval"
    );
    process.exit(1);
  }

  // Test 7: Get referral statistics
  logger.info("[Referral Test] Test 7: Fetching referral statistics");

  try {
    const stats = await getReferralStats(testUserId);

    logger.info(
      {
        totalReferrals: stats.totalReferrals,
        completedReferrals: stats.completedReferrals,
        pendingReferrals: stats.pendingReferrals,
        totalRewardsEarned: stats.totalRewardsEarned,
      },
      "[Referral Test] ✅ Test 7 PASSED: Referral statistics retrieved"
    );
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 7 FAILED: Exception during stats retrieval"
    );
    process.exit(1);
  }

  // Test 8: Get conversion rate
  logger.info("[Referral Test] Test 8: Calculating conversion rate");

  try {
    const conversionRate = await getReferralConversionRate(testUserId);

    logger.info(
      {
        conversionRate: `${conversionRate.toFixed(2)}%`,
      },
      "[Referral Test] ✅ Test 8 PASSED: Conversion rate calculated"
    );
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 8 FAILED: Exception during conversion calculation"
    );
    process.exit(1);
  }

  // Test 9: Calculate ROI
  logger.info("[Referral Test] Test 9: Calculating referral ROI");

  try {
    const roi = await calculateReferralROI();

    logger.info(
      {
        totalRewardsPaid: `${(roi.totalRewardsPaid / 100).toFixed(2)} kr`,
        totalRevenueGenerated: `${(roi.totalRevenueGenerated / 100).toFixed(
          2
        )} kr`,
        roi: `${roi.roi.toFixed(2)}%`,
      },
      "[Referral Test] ✅ Test 9 PASSED: ROI calculated"
    );
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 9 FAILED: Exception during ROI calculation"
    );
    process.exit(1);
  }

  // Test 10: Get user rewards
  logger.info("[Referral Test] Test 10: Fetching user referral rewards");

  try {
    const rewards = await getUserReferralRewards(testUserId);

    logger.info(
      {
        count: rewards.length,
      },
      "[Referral Test] ✅ Test 10 PASSED: User rewards retrieved"
    );
  } catch (error) {
    logger.error(
      { error },
      "[Referral Test] ❌ Test 10 FAILED: Exception during rewards retrieval"
    );
    process.exit(1);
  }

  // Summary
  logger.info("[Referral Test] ==========================================");
  logger.info("[Referral Test] 🎉 ALL TESTS PASSED!");
  logger.info("[Referral Test] ==========================================");
  logger.info("[Referral Test] Test Summary:");
  logger.info("[Referral Test] ✅ Referral code generation (auto + custom)");
  logger.info("[Referral Test] ✅ Code validation (valid + invalid)");
  logger.info("[Referral Test] ✅ User code listing");
  logger.info("[Referral Test] ✅ Statistics calculation");
  logger.info("[Referral Test] ✅ Conversion rate calculation");
  logger.info("[Referral Test] ✅ ROI calculation");
  logger.info("[Referral Test] ✅ User rewards retrieval");
  logger.info("[Referral Test] ==========================================");
  logger.info(
    "[Referral Test] Note: Full referral flow tested during subscription creation"
  );
  logger.info("[Referral Test] Test codes created:", {
    testCode,
    userId: testUserId,
  });

  process.exit(0);
}

// Run tests
testReferralSystem().catch((error) => {
  logger.error({ error }, "[Referral Test] Test suite failed with exception");
  process.exit(1);
});
