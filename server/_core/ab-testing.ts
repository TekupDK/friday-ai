/**
 * A/B Testing Framework for Chat Flow Migration
 * Enables controlled rollout and comparison of old vs new flows
 */

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
    metrics: ["response_time", "error_rate", "user_satisfaction", "completion_rate"],
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
export function getTestGroup(userId: number, testName: string): "control" | "variant" | "excluded" {
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
    hash = ((hash << 5) - hash) + char;
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
    enableModelRouting: modelRoutingGroup === "variant" || baseFlags.enableModelRouting,
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
export async function recordTestMetrics(metrics: TestMetrics): Promise<void> {
  try {
    console.log(`📊 A/B Test Metrics: ${metrics.testGroup}`, {
      userId: metrics.userId,
      responseTime: metrics.responseTime,
      errorCount: metrics.errorCount,
      completionRate: metrics.completionRate,
    });

    // TODO: Store metrics in database for analysis
    // For now, just log to console
  } catch (error) {
    console.error("Failed to record A/B test metrics:", error);
  }
}

/**
 * Calculate test results and recommendations
 */
export function calculateTestResults(testName: string): ABTestResult | null {
  const testConfig = AB_TESTS[testName];
  if (!testConfig) {
    return null;
  }

  // TODO: Fetch actual metrics from database
  const mockControlMetrics: TestMetrics[] = [];
  const mockVariantMetrics: TestMetrics[] = [];

  // Calculate basic statistics
  const controlAvgResponseTime = mockControlMetrics.reduce((sum, m) => sum + m.responseTime, 0) / mockControlMetrics.length || 0;
  const variantAvgResponseTime = mockVariantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / mockVariantMetrics.length || 0;

  const controlErrorRate = mockControlMetrics.reduce((sum, m) => sum + m.errorCount, 0) / mockControlMetrics.length || 0;
  const variantErrorRate = mockVariantMetrics.reduce((sum, m) => sum + m.errorCount, 0) / mockVariantMetrics.length || 0;

  // Simple recommendation logic
  let recommendation: "keep_control" | "deploy_variant" | "continue_test" = "continue_test";
  
  if (variantAvgResponseTime < controlAvgResponseTime * 0.8 && variantErrorRate <= controlErrorRate) {
    recommendation = "deploy_variant";
  } else if (variantErrorRate > controlErrorRate * 1.5) {
    recommendation = "keep_control";
  }

  return {
    testName,
    controlMetrics: mockControlMetrics,
    variantMetrics: mockVariantMetrics,
    statisticalSignificance: 0.95, // TODO: Calculate actual significance
    recommendation,
  };
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
    res.end = function(...args: any[]) {
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
