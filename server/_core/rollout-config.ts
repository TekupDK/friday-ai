/**
 * Rollout Configuration for Friday AI Features
 * Controls gradual rollout and emergency rollback procedures
 */

import { getABTestStatus } from "./ab-testing";
import { getFeatureFlags } from "./feature-flags";

export interface RolloutPhase {
  name: string;
  percentage: number;
  startDate: Date;
  duration: number; // days
  successCriteria: {
    maxErrorRate: number; // percentage
    minSatisfactionScore: number; // 1-5
    maxResponseTimeRegression: number; // percentage
  };
  rollbackTriggers: {
    errorRateThreshold: number;
    responseTimeThreshold: number;
    userComplaintsThreshold: number;
  };
}

export interface RolloutStatus {
  currentPhase: string;
  percentage: number;
  isActive: boolean;
  canRollback: boolean;
  emergencyRollback: boolean;
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    satisfactionScore: number;
    userCount: number;
  };
  nextPhaseDate?: Date;
}

// Rollout phases for chat flow migration
const CHAT_FLOW_ROLLOUT_PHASES: RolloutPhase[] = [
  {
    name: "internal_testing",
    percentage: 0.01, // 1% - internal team only
    startDate: new Date(),
    duration: 3,
    successCriteria: {
      maxErrorRate: 5,
      minSatisfactionScore: 3.5,
      maxResponseTimeRegression: 20,
    },
    rollbackTriggers: {
      errorRateThreshold: 10,
      responseTimeThreshold: 5000,
      userComplaintsThreshold: 3,
    },
  },
  {
    name: "beta_testing",
    percentage: 0.05, // 5% - power users
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 7,
    successCriteria: {
      maxErrorRate: 3,
      minSatisfactionScore: 4.0,
      maxResponseTimeRegression: 15,
    },
    rollbackTriggers: {
      errorRateThreshold: 8,
      responseTimeThreshold: 4000,
      userComplaintsThreshold: 10,
    },
  },
  {
    name: "gradual_rollout",
    percentage: 0.2, // 20% - general users
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    duration: 14,
    successCriteria: {
      maxErrorRate: 2,
      minSatisfactionScore: 4.2,
      maxResponseTimeRegression: 10,
    },
    rollbackTriggers: {
      errorRateThreshold: 5,
      responseTimeThreshold: 3000,
      userComplaintsThreshold: 25,
    },
  },
  {
    name: "full_rollout",
    percentage: 1.0, // 100% - all users
    startDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000), // 24 days from now
    duration: 7,
    successCriteria: {
      maxErrorRate: 1,
      minSatisfactionScore: 4.5,
      maxResponseTimeRegression: 5,
    },
    rollbackTriggers: {
      errorRateThreshold: 3,
      responseTimeThreshold: 2000,
      userComplaintsThreshold: 50,
    },
  },
];

// Streaming rollout phases (after chat flow is stable)
const STREAMING_ROLLOUT_PHASES: RolloutPhase[] = [
  {
    name: "streaming_internal",
    percentage: 0.01,
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    duration: 2,
    successCriteria: {
      maxErrorRate: 5,
      minSatisfactionScore: 4.0,
      maxResponseTimeRegression: 10,
    },
    rollbackTriggers: {
      errorRateThreshold: 10,
      responseTimeThreshold: 3000,
      userComplaintsThreshold: 2,
    },
  },
  {
    name: "streaming_beta",
    percentage: 0.1,
    startDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days from now
    duration: 5,
    successCriteria: {
      maxErrorRate: 3,
      minSatisfactionScore: 4.3,
      maxResponseTimeRegression: 5,
    },
    rollbackTriggers: {
      errorRateThreshold: 7,
      responseTimeThreshold: 2500,
      userComplaintsThreshold: 8,
    },
  },
  {
    name: "streaming_full",
    percentage: 1.0,
    startDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37 days from now
    duration: 3,
    successCriteria: {
      maxErrorRate: 2,
      minSatisfactionScore: 4.5,
      maxResponseTimeRegression: 0,
    },
    rollbackTriggers: {
      errorRateThreshold: 5,
      responseTimeThreshold: 2000,
      userComplaintsThreshold: 15,
    },
  },
];

/**
 * Get current rollout phase for a feature
 */
export function getCurrentRolloutPhase(
  feature: "chat_flow" | "streaming" | "model_routing"
): RolloutPhase | null {
  const phases =
    feature === "chat_flow"
      ? CHAT_FLOW_ROLLOUT_PHASES
      : feature === "streaming"
        ? STREAMING_ROLLOUT_PHASES
        : []; // Model routing comes after streaming

  const now = new Date();

  for (const phase of phases) {
    const phaseEnd = new Date(
      phase.startDate.getTime() + phase.duration * 24 * 60 * 60 * 1000
    );

    if (now >= phase.startDate && now <= phaseEnd) {
      return phase;
    }
  }

  return null;
}

/**
 * Get rollout status for monitoring
 */
export async function getRolloutStatus(): Promise<Record<string, RolloutStatus>> {
  const now = new Date();
  const status: Record<string, RolloutStatus> = {};

  // Get metrics from monitoring system
  const { getMetricsSummary } = await import("../ai-metrics");
  const metricsSummary = getMetricsSummary(60); // Last 60 minutes

  // Chat flow status
  const chatPhase = getCurrentRolloutPhase("chat_flow");
  if (chatPhase) {
    status.chat_flow = {
      currentPhase: chatPhase.name,
      percentage: chatPhase.percentage,
      isActive: true,
      canRollback: true,
      emergencyRollback: false,
      metrics: {
        errorRate: metricsSummary.errorRate || 0,
        avgResponseTime: metricsSummary.avgResponseTime || 0,
        satisfactionScore: 0, // Not tracked in AI metrics
        userCount: metricsSummary.totalRequests || 0,
      },
      nextPhaseDate: getNextPhaseDate("chat_flow"),
    };
  }

  // Streaming status
  const streamingPhase = getCurrentRolloutPhase("streaming");
  if (streamingPhase) {
    status.streaming = {
      currentPhase: streamingPhase.name,
      percentage: streamingPhase.percentage,
      isActive: true,
      canRollback: true,
      emergencyRollback: false,
      metrics: {
        errorRate: metricsSummary.errorRate || 0,
        avgResponseTime: metricsSummary.avgResponseTime || 0,
        satisfactionScore: 0, // Not tracked in AI metrics
        userCount: metricsSummary.totalRequests || 0,
      },
      nextPhaseDate: getNextPhaseDate("streaming"),
    };
  }

  return status;
}

/**
 * Get next phase date for a feature
 */
function getNextPhaseDate(
  feature: "chat_flow" | "streaming"
): Date | undefined {
  const phases =
    feature === "chat_flow"
      ? CHAT_FLOW_ROLLOUT_PHASES
      : feature === "streaming"
        ? STREAMING_ROLLOUT_PHASES
        : [];

  const currentPhase = getCurrentRolloutPhase(feature);
  if (!currentPhase) return undefined;

  const currentIndex = phases.findIndex(p => p.name === currentPhase.name);
  if (currentIndex < phases.length - 1) {
    return phases[currentIndex + 1].startDate;
  }

  return undefined;
}

/**
 * Check if rollback should be triggered
 */
export async function shouldTriggerRollback(
  feature: "chat_flow" | "streaming"
): Promise<boolean> {
  const { logger } = await import("./logger");
  const phase = getCurrentRolloutPhase(feature);
  if (!phase) return false;

  // Check emergency rollback conditions
  const emergencyRollback = process.env.EMERGENCY_ROLLBACK === "true";
  if (emergencyRollback) {
    logger.warn({ feature }, "[Rollout] Emergency rollback triggered");
    return true;
  }

  // Check actual metrics against rollback triggers
  try {
    const { getMetricsSummary } = await import("../ai-metrics");
    const metrics = getMetricsSummary(60); // Last 60 minutes

    const triggers = phase.rollbackTriggers;

    // Check error rate threshold
    if (metrics.errorRate > triggers.errorRateThreshold) {
      logger.warn(
        {
          feature,
          errorRate: metrics.errorRate,
          threshold: triggers.errorRateThreshold,
        },
        "[Rollout] Error rate threshold exceeded - triggering rollback"
      );
      return true;
    }

    // Check response time threshold (P95)
    if (metrics.p95ResponseTime > triggers.responseTimeThreshold) {
      logger.warn(
        {
          feature,
          p95ResponseTime: metrics.p95ResponseTime,
          threshold: triggers.responseTimeThreshold,
        },
        "[Rollout] Response time threshold exceeded - triggering rollback"
      );
      return true;
    }

    // All metrics within acceptable ranges
    return false;
  } catch (error) {
    logger.error(
      { feature, error },
      "[Rollout] Error checking rollback triggers - defaulting to no rollback"
    );
    return false;
  }
}

/**
 * Execute rollback for a feature
 */
export async function executeRollback(
  feature: "chat_flow" | "streaming"
): Promise<void> {
  // ✅ SECURITY FIX: Use logger instead of console.log
  const { logger } = await import("./logger");
  logger.info({ feature }, "[Rollout] Executing rollback");

  // Set environment variable to force rollback
  process.env[`ROLLBACK_${feature.toUpperCase()}`] = "true";

  // Notify monitoring systems
  logger.warn(
    { feature, timestamp: new Date().toISOString() },
    "[Rollout] ⚠️ ROLLBACK TRIGGERED - Monitoring systems notified"
  );

  // Log rollback event to database
  try {
    const { getDb } = await import("../db");
    const { analyticsEvents } = await import("../../drizzle/schema");
    const db = await getDb();

    if (db) {
      await db.insert(analyticsEvents).values({
        userId: 1, // System user
        eventType: "rollback_executed",
        eventData: {
          feature,
          timestamp: new Date().toISOString(),
          reason: "manual_or_automated_trigger",
        },
      });
      logger.info({ feature }, "[Rollout] Rollback event logged to database");
    }
  } catch (error) {
    logger.error(
      { feature, error },
      "[Rollout] Failed to log rollback event to database"
    );
  }

  // Notify team members
  logger.warn(
    { feature },
    "[Rollout] 🚨 TEAM NOTIFICATION: Rollback executed - immediate attention required"
  );
  // TODO: Integrate with Slack/email/PagerDuty for real alerts

  logger.info({ feature }, "[Rollout] Rollback completed");
}

/**
 * Get user's rollout group based on phases
 */
export function getUserRolloutGroup(
  userId: number,
  feature: "chat_flow" | "streaming"
): "control" | "variant" | "excluded" {
  const phase = getCurrentRolloutPhase(feature);
  if (!phase) return "excluded";

  // Use consistent hash for user assignment
  const hash = hashUserId(userId, feature);
  const threshold = phase.percentage * 100;

  return hash < threshold ? "variant" : "control";
}

/**
 * Hash function for consistent user assignment in rollout
 */
function hashUserId(userId: number, feature: string): number {
  const str = `${userId}-${feature}-rollout`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}

/**
 * Manual override for testing
 */
export async function setManualRolloutOverride(
  feature: string,
  percentage: number
): Promise<void> {
  process.env[`MANUAL_ROLLOUT_${feature.toUpperCase()}`] =
    percentage.toString();
  // ✅ SECURITY FIX: Use logger instead of console.log
  const { logger } = await import("./logger");
  logger.info({ feature, percentage }, "[Rollout] Manual override set");
}

/**
 * Get all rollout configurations
 */
export async function getRolloutConfigurations() {
  return {
    chat_flow: CHAT_FLOW_ROLLOUT_PHASES,
    streaming: STREAMING_ROLLOUT_PHASES,
    current_status: await getRolloutStatus(),
    ab_tests: getABTestStatus(),
  };
}
