/**
 * Rollback Monitoring Service
 * Automatically monitors A/B tests and triggers rollback if metrics degrade
 */

import { 
  calculateTestResults, 
  getABTestStatus, 
  type ABTestResult 
} from "./_core/ab-testing";
import { 
  shouldTriggerRollback, 
  executeRollback, 
  getCurrentRolloutPhase,
  type RolloutPhase 
} from "./_core/rollout-config";
import { getDb } from "./db";

/**
 * Monitoring thresholds for automatic rollback
 */
const ROLLBACK_THRESHOLDS = {
  // Error rate increase threshold (e.g., 2x = 200%)
  maxErrorRateIncrease: 2.0,
  
  // Response time increase threshold (e.g., 1.5x = 150%)
  maxResponseTimeIncrease: 1.5,
  
  // Minimum sample size before considering rollback
  minSampleSize: 100,
  
  // Statistical significance required for rollback decision
  minSignificance: 0.90, // 90% confidence
  
  // Time window for monitoring (hours)
  monitoringWindowHours: 1,
};

/**
 * Rollback reasons for logging and alerts
 */
export type RollbackReason = 
  | "error_rate_spike"
  | "response_time_degradation"
  | "low_statistical_significance"
  | "manual_trigger"
  | "emergency_stop";

/**
 * Rollback event for logging
 */
export interface RollbackEvent {
  timestamp: Date;
  testName: string;
  reason: RollbackReason;
  metrics: {
    controlErrorRate: number;
    variantErrorRate: number;
    controlResponseTime: number;
    variantResponseTime: number;
    sampleSize: number;
  };
  autoTriggered: boolean;
}

/**
 * Monitor service state
 */
let monitoringInterval: NodeJS.Timeout | null = null;
let rollbackHistory: RollbackEvent[] = [];

/**
 * Start automatic monitoring
 */
export function startRollbackMonitoring(intervalMs: number = 60000) {
  if (monitoringInterval) {
    console.log("[RollbackMonitor] Already running");
    return;
  }

  console.log(`[RollbackMonitor] 🚀 Starting monitoring (interval: ${intervalMs}ms)`);

  monitoringInterval = setInterval(async () => {
    await checkAllTestsForRollback();
  }, intervalMs);

  // Run initial check immediately
  checkAllTestsForRollback();
}

/**
 * Stop automatic monitoring
 */
export function stopRollbackMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log("[RollbackMonitor] ⏹️ Stopped monitoring");
  }
}

/**
 * Check all active tests for rollback conditions
 */
async function checkAllTestsForRollback() {
  try {
    const activeTests = getABTestStatus().filter(t => t.enabled);
    const db = await getDb();

    for (const test of activeTests) {
      const results = await calculateTestResults(test.name, db);
      
      if (results) {
        const shouldRollback = await evaluateRollbackConditions(results);
        
        if (shouldRollback.should && shouldRollback.reason) {
          console.warn(`[RollbackMonitor] 🚨 Triggering rollback for ${test.name}: ${shouldRollback.reason}`);
          await triggerRollback(test.name, shouldRollback.reason, results);
        }
      }
    }
  } catch (error) {
    console.error("[RollbackMonitor] Error during monitoring:", error);
  }
}

/**
 * Evaluate if a test should be rolled back
 */
async function evaluateRollbackConditions(
  results: ABTestResult
): Promise<{ should: boolean; reason?: RollbackReason }> {
  const controlSampleSize = results.controlMetrics.length;
  const variantSampleSize = results.variantMetrics.length;

  // Need sufficient samples to make decision
  if (variantSampleSize < ROLLBACK_THRESHOLDS.minSampleSize) {
    return { should: false };
  }

  // Calculate average metrics
  const controlAvgResponseTime = 
    results.controlMetrics.reduce((sum, m) => sum + m.responseTime, 0) / controlSampleSize;
  const variantAvgResponseTime = 
    results.variantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / variantSampleSize;

  const controlErrorRate = 
    results.controlMetrics.reduce((sum, m) => sum + m.errorCount, 0) / controlSampleSize;
  const variantErrorRate = 
    results.variantMetrics.reduce((sum, m) => sum + m.errorCount, 0) / variantSampleSize;

  // Check for error rate spike
  if (variantErrorRate > controlErrorRate * ROLLBACK_THRESHOLDS.maxErrorRateIncrease) {
    // Need statistical significance to confirm it's not random
    if (results.statisticalSignificance >= ROLLBACK_THRESHOLDS.minSignificance) {
      return { should: true, reason: "error_rate_spike" };
    }
  }

  // Check for response time degradation
  if (variantAvgResponseTime > controlAvgResponseTime * ROLLBACK_THRESHOLDS.maxResponseTimeIncrease) {
    if (results.statisticalSignificance >= ROLLBACK_THRESHOLDS.minSignificance) {
      return { should: true, reason: "response_time_degradation" };
    }
  }

  // Check rollout config thresholds
  const chatPhase = getCurrentRolloutPhase("chat_flow");
  if (chatPhase && shouldTriggerRollback("chat_flow")) {
    return { should: true, reason: "manual_trigger" };
  }

  return { should: false };
}

/**
 * Trigger rollback for a test
 */
async function triggerRollback(
  testName: string,
  reason: RollbackReason,
  results: ABTestResult
) {
  const event: RollbackEvent = {
    timestamp: new Date(),
    testName,
    reason,
    metrics: {
      controlErrorRate: results.controlMetrics.reduce((sum, m) => sum + m.errorCount, 0) / results.controlMetrics.length,
      variantErrorRate: results.variantMetrics.reduce((sum, m) => sum + m.errorCount, 0) / results.variantMetrics.length,
      controlResponseTime: results.controlMetrics.reduce((sum, m) => sum + m.responseTime, 0) / results.controlMetrics.length,
      variantResponseTime: results.variantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / results.variantMetrics.length,
      sampleSize: results.variantMetrics.length,
    },
    autoTriggered: true,
  };

  // Log rollback event
  rollbackHistory.push(event);
  console.log("[RollbackMonitor] 🔄 Rollback event:", event);

  // Execute rollback
  await executeRollback("chat_flow");

  // TODO: Send alerts
  // - Email to team
  // - Slack notification
  // - PagerDuty alert (if critical)
  
  // TODO: Store in database
  // await db.insert(rollbackEvents).values(event);
}

/**
 * Get rollback history
 */
export function getRollbackHistory(): RollbackEvent[] {
  return [...rollbackHistory];
}

/**
 * Clear rollback history (for testing)
 */
export function clearRollbackHistory() {
  rollbackHistory = [];
}

/**
 * Manual rollback trigger
 */
export async function manualRollback(testName: string) {
  console.log(`[RollbackMonitor] 🔧 Manual rollback triggered for ${testName}`);
  
  const db = await getDb();
  const results = await calculateTestResults(testName, db);
  
  if (results) {
    await triggerRollback(testName, "manual_trigger", results);
  }
}

/**
 * Get current monitoring status
 */
export function getMonitoringStatus() {
  return {
    isRunning: monitoringInterval !== null,
    thresholds: ROLLBACK_THRESHOLDS,
    rollbackCount: rollbackHistory.length,
    lastCheck: rollbackHistory.length > 0 ? rollbackHistory[rollbackHistory.length - 1].timestamp : null,
  };
}
