/**
 * A/B Testing Framework for Chat Flow Migration
 * Enables controlled rollout and comparison of old vs new flows
 */

import { and, desc, eq, gte } from "drizzle-orm";

import { abTestMetricsInFridayAi as abTestMetrics } from "../../drizzle/schema";

import { getFeatureFlags } from "./feature-flags";

export interface ABTestConfig {
  testName: string;
  enabled: boolean;
  trafficSplit: number; // 0-1, percentage using new flow
  startDate: Date;
  endDate?: Date;
  targetUsers?: number[]; // Specific user IDs for testing
  metrics: string[];
}

export interface TestMetrics {
  userId: number;
  testGroup: "control" | "variant";
  responseTime: number;
  userSatisfaction?: number; // 1-5 rating
  errorCount: number;
  messageCount: number;
  completionRate: number;
  timestamp: Date;
}

export interface ABTestResult {
  testName: string;
  controlMetrics: TestMetrics[];
  variantMetrics: TestMetrics[];
  statisticalSignificance: number;
  recommendation: "keep_control" | "deploy_variant" | "continue_test";
}

// A/B Test configurations
const AB_TESTS: Record<string, ABTestConfig> = {
  chat_flow_migration: {
    testName: "chat_flow_migration",
    enabled: true,
    trafficSplit: 0.1, // Start with 10% on new flow
    startDate: new Date(),
    metrics: [
      "response_time",
      "error_rate",
      "user_satisfaction",
      "completion_rate",
    ],
  },
  streaming_enabled: {
    testName: "streaming_enabled",
    enabled: false, // Will be enabled after chat flow migration
    trafficSplit: 0.05, // Start with 5% on streaming
    startDate: new Date(),
    metrics: ["perceived_response_time", "user_satisfaction", "engagement"],
  },
  model_routing: {
    testName: "model_routing",
    enabled: false, // Will be enabled after streaming
    trafficSplit: 0.2, // Start with 20% on model routing
    startDate: new Date(),
    metrics: ["response_quality", "cost_efficiency", "task_completion_rate"],
  },
};

/**
 * Determine which test group a user belongs to
 */
export function getTestGroup(
  userId: number,
  testName: string
): "control" | "variant" | "excluded" {
  const testConfig = AB_TESTS[testName];
  if (!testConfig || !testConfig.enabled) {
    return "excluded";
  }

  // Check if test is still active
  if (testConfig.endDate && new Date() > testConfig.endDate) {
    return "excluded";
  }

  // Check if user is specifically targeted
  if (testConfig.targetUsers && !testConfig.targetUsers.includes(userId)) {
    return "excluded";
  }

  // Use consistent hash for traffic splitting
  const hash = hashUserId(userId, testName);
  const threshold = testConfig.trafficSplit * 100;

  return hash < threshold ? "variant" : "control";
}

/**
 * Simple hash function for consistent user assignment
 */
function hashUserId(userId: number, testName: string): number {
  const str = `${userId}-${testName}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Get feature flags with A/B test considerations
 */
export function getFeatureFlagsWithABTest(userId: number) {
  const baseFlags = getFeatureFlags(userId);
  const chatGroup = getTestGroup(userId, "chat_flow_migration");
  const streamingGroup = getTestGroup(userId, "streaming_enabled");
  const modelRoutingGroup = getTestGroup(userId, "model_routing");

  return {
    ...baseFlags,
    // Override based on A/B test groups
    useServerSideChat: chatGroup === "variant" || baseFlags.useServerSideChat,
    enableStreaming: streamingGroup === "variant" || baseFlags.enableStreaming,
    enableModelRouting:
      modelRoutingGroup === "variant" || baseFlags.enableModelRouting,
    // Test metadata
    abTestGroups: {
      chat_flow_migration: chatGroup,
      streaming_enabled: streamingGroup,
      model_routing: modelRoutingGroup,
    },
  };
}

/**
 * Record metrics for A/B testing
 */
export async function recordTestMetrics(
  metrics: TestMetrics,
  db?: Awaited<ReturnType<typeof import("../db").getDb>>
): Promise<void> {
  try {
    // ✅ SECURITY FIX: Use logger instead of console.log (redacts sensitive data)
    const { logger } = await import("../_core/logger");
    logger.info(
      {
        testGroup: metrics.testGroup,
        userId: metrics.userId,
        responseTime: metrics.responseTime,
        errorCount: metrics.errorCount,
        completionRate: metrics.completionRate,
      },
      "[A/B Testing] A/B Test Metrics"
    );

    // ✅ FIXED: Store metrics in database for analysis
    if (db) {
      try {
        await db.insert(abTestMetrics).values({
          testName: "chat_flow_migration", // Default test name, can be parameterized later
          userId: metrics.userId,
          testGroup: metrics.testGroup,
          responseTime: metrics.responseTime,
          userSatisfaction: metrics.userSatisfaction || null,
          errorCount: metrics.errorCount,
          messageCount: metrics.messageCount,
          completionRate: metrics.completionRate.toString(),
          metadata: null, // Can be extended later for test-specific data
          timestamp: metrics.timestamp.toISOString(),
        });

        logger.info(
          {
            testName: "chat_flow_migration",
            userId: metrics.userId,
            testGroup: metrics.testGroup,
            responseTime: metrics.responseTime,
          },
          "[A/B Testing] Metrics stored in database"
        );
      } catch (error) {
        logger.error(
          { err: error, userId: metrics.userId, testGroup: metrics.testGroup },
          "[A/B Testing] Failed to store metrics in database"
        );
        // Don't throw - metrics logging should not break the flow
      }
    }
  } catch (error) {
    // ✅ SECURITY FIX: Use logger instead of console.error
    const { logger } = await import("../_core/logger");
    logger.error(
      { err: error },
      "[A/B Testing] Failed to record A/B test metrics"
    );
  }
}

/**
 * Calculate test results and recommendations
 */
export async function calculateTestResults(
  testName: string,
  db?: Awaited<ReturnType<typeof import("../db").getDb>>
): Promise<ABTestResult | null> {
  const testConfig = AB_TESTS[testName];
  if (!testConfig) {
    return null;
  }

  // ✅ FIXED: Fetch actual metrics from database
  let controlMetrics: TestMetrics[] = [];
  let variantMetrics: TestMetrics[] = [];

  if (db) {
    try {
      const { logger } = await import("../_core/logger");

      // Fetch metrics from last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const metrics = await db
        .select()
        .from(abTestMetrics)
        .where(
          and(
            eq(abTestMetrics.testName, testName),
            gte(abTestMetrics.timestamp, sevenDaysAgo.toISOString())
          )
        )
        .orderBy(desc(abTestMetrics.timestamp));

      // Convert database records to TestMetrics format
      controlMetrics = metrics
        .filter(m => m.testGroup === "control")
        .map(m => ({
          userId: m.userId,
          testGroup: m.testGroup as "control" | "variant",
          responseTime: m.responseTime,
          userSatisfaction: m.userSatisfaction || undefined,
          errorCount: m.errorCount,
          messageCount: m.messageCount,
          completionRate: parseFloat(m.completionRate),
          timestamp: new Date(m.timestamp),
        }));

      variantMetrics = metrics
        .filter(m => m.testGroup === "variant")
        .map(m => ({
          userId: m.userId,
          testGroup: m.testGroup as "control" | "variant",
          responseTime: m.responseTime,
          userSatisfaction: m.userSatisfaction || undefined,
          errorCount: m.errorCount,
          messageCount: m.messageCount,
          completionRate: parseFloat(m.completionRate),
          timestamp: new Date(m.timestamp),
        }));

      logger.debug(
        {
          testName,
          controlCount: controlMetrics.length,
          variantCount: variantMetrics.length,
        },
        "[A/B Testing] Metrics fetched from database"
      );
    } catch (error) {
      const { logger } = await import("../_core/logger");
      logger.error(
        { err: error, testName },
        "[A/B Testing] Failed to fetch metrics from database"
      );
      // Return empty arrays if fetch fails - test will continue with no data
    }
  }

  if (controlMetrics.length === 0 || variantMetrics.length === 0) {
    return {
      testName,
      controlMetrics,
      variantMetrics,
      statisticalSignificance: 0,
      recommendation: "continue_test",
    };
  }

  // Calculate basic statistics
  const controlAvgResponseTime =
    controlMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
    controlMetrics.length;
  const variantAvgResponseTime =
    variantMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
    variantMetrics.length;

  const controlErrorRate =
    controlMetrics.reduce((sum, m) => sum + m.errorCount, 0) /
    controlMetrics.length;
  const variantErrorRate =
    variantMetrics.reduce((sum, m) => sum + m.errorCount, 0) /
    variantMetrics.length;

  // Calculate statistical significance using Welch's t-test approximation
  const significance = calculateStatisticalSignificance(
    controlMetrics.map(m => m.responseTime),
    variantMetrics.map(m => m.responseTime)
  );

  // Recommendation logic with statistical significance check
  let recommendation: "keep_control" | "deploy_variant" | "continue_test" =
    "continue_test";

  // Need at least 95% confidence to make a decision
  if (significance >= 0.95) {
    if (
      variantAvgResponseTime < controlAvgResponseTime * 0.8 &&
      variantErrorRate <= controlErrorRate
    ) {
      recommendation = "deploy_variant";
    } else if (
      variantErrorRate > controlErrorRate * 1.5 ||
      variantAvgResponseTime > controlAvgResponseTime * 1.2
    ) {
      recommendation = "keep_control";
    }
  }

  return {
    testName,
    controlMetrics,
    variantMetrics,
    statisticalSignificance: significance,
    recommendation,
  };
}

/**
 * Helper to convert database row to TestMetrics
 */
function rowToMetrics(row: any): TestMetrics {
  return {
    userId: row.user_id,
    testGroup: row.test_group,
    responseTime: row.response_time,
    userSatisfaction: row.user_satisfaction,
    errorCount: row.error_count,
    messageCount: row.message_count,
    completionRate: parseFloat(row.completion_rate),
    timestamp: new Date(row.timestamp),
  };
}

/**
 * Calculate statistical significance using Welch's t-test
 * Returns p-value (0-1, where closer to 1 means more significant)
 */
function calculateStatisticalSignificance(
  control: number[],
  variant: number[]
): number {
  if (control.length < 30 || variant.length < 30) {
    return 0; // Need sufficient sample size
  }

  // Calculate means
  const controlMean = control.reduce((a, b) => a + b, 0) / control.length;
  const variantMean = variant.reduce((a, b) => a + b, 0) / variant.length;

  // Calculate variances
  const controlVariance =
    control.reduce((sum, x) => sum + Math.pow(x - controlMean, 2), 0) /
    (control.length - 1);
  const variantVariance =
    variant.reduce((sum, x) => sum + Math.pow(x - variantMean, 2), 0) /
    (variant.length - 1);

  // Calculate standard error
  const se = Math.sqrt(
    controlVariance / control.length + variantVariance / variant.length
  );

  if (se === 0) return 0;

  // Calculate t-statistic
  const t = Math.abs(controlMean - variantMean) / se;

  // Approximate degrees of freedom (Welch-Satterthwaite equation)
  const df =
    Math.pow(
      controlVariance / control.length + variantVariance / variant.length,
      2
    ) /
    (Math.pow(controlVariance / control.length, 2) / (control.length - 1) +
      Math.pow(variantVariance / variant.length, 2) / (variant.length - 1));

  // Convert t-statistic to approximate confidence level
  // Using rough approximation: confidence ≈ 1 - 2 * P(T > |t|)
  // For t > 2, confidence is typically > 95%
  const confidence = Math.min(
    0.999,
    Math.max(0, 1 - 2 / (1 + Math.pow(t, 2) / df))
  );

  return confidence;
}

/**
 * Middleware to automatically track metrics
 */
export function createABTestMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const userId = req.user?.id;

    if (!userId) {
      return next();
    }

    // Override res.end to track metrics
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const responseTime = Date.now() - startTime;
      const testGroup = getTestGroup(userId, "chat_flow_migration");

      if (testGroup !== "excluded") {
        recordTestMetrics({
          userId,
          testGroup,
          responseTime,
          errorCount: res.statusCode >= 400 ? 1 : 0,
          messageCount: 1,
          completionRate: res.statusCode < 400 ? 1 : 0,
          timestamp: new Date(),
        });
      }

      originalEnd.apply(this, args);
    };

    next();
  };
}

/**
 * Get current A/B test status for monitoring
 */
export function getABTestStatus() {
  return Object.entries(AB_TESTS).map(([key, config]) => ({
    name: config.testName,
    enabled: config.enabled,
    trafficSplit: config.trafficSplit,
    startDate: config.startDate,
    endDate: config.endDate,
    metrics: config.metrics,
  }));
}
