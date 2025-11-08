/**
 * AI Metrics Tracking
 * Monitors OpenRouter model performance, errors, and usage
 */

export interface AIMetric {
  timestamp: Date;
  userId?: number;
  modelId: string;
  taskType: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIMetricsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  avgResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  modelBreakdown: Record<string, {
    requests: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
}

// In-memory metrics store (in production, use database or Redis)
const metrics: AIMetric[] = [];
const MAX_METRICS_IN_MEMORY = 10000; // Keep last 10k metrics

/**
 * Track an AI request metric
 */
export function trackAIMetric(metric: Omit<AIMetric, 'timestamp'>): void {
  const fullMetric: AIMetric = {
    ...metric,
    timestamp: new Date(),
  };

  metrics.push(fullMetric);

  // Keep only last N metrics to prevent memory issues
  if (metrics.length > MAX_METRICS_IN_MEMORY) {
    metrics.shift();
  }

  // Log errors immediately
  if (!metric.success) {
    console.error(`[AI Metrics] Error: Model=${metric.modelId}, Task=${metric.taskType}, Error=${metric.errorMessage}`);
  }

  // Log slow responses (>5s)
  if (metric.responseTime > 5000) {
    console.warn(`[AI Metrics] Slow response: ${metric.responseTime}ms, Model=${metric.modelId}, Task=${metric.taskType}`);
  }
}

/**
 * Get metrics summary for the last N minutes
 */
export function getMetricsSummary(lastMinutes: number = 60): AIMetricsSummary {
  const cutoffTime = new Date(Date.now() - lastMinutes * 60 * 1000);
  const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      avgResponseTime: 0,
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      modelBreakdown: {},
    };
  }

  const successfulRequests = recentMetrics.filter(m => m.success).length;
  const failedRequests = recentMetrics.length - successfulRequests;
  const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);

  // Calculate percentiles
  const p50Index = Math.floor(responseTimes.length * 0.5);
  const p95Index = Math.floor(responseTimes.length * 0.95);
  const p99Index = Math.floor(responseTimes.length * 0.99);

  // Model breakdown
  const modelBreakdown: Record<string, {
    requests: number;
    avgResponseTime: number;
    errorRate: number;
  }> = {};

  recentMetrics.forEach(metric => {
    if (!modelBreakdown[metric.modelId]) {
      modelBreakdown[metric.modelId] = {
        requests: 0,
        avgResponseTime: 0,
        errorRate: 0,
      };
    }
    modelBreakdown[metric.modelId].requests++;
  });

  // Calculate per-model stats
  Object.keys(modelBreakdown).forEach(modelId => {
    const modelMetrics = recentMetrics.filter(m => m.modelId === modelId);
    const modelSuccesses = modelMetrics.filter(m => m.success).length;
    const avgTime = modelMetrics.reduce((sum, m) => sum + m.responseTime, 0) / modelMetrics.length;
    
    modelBreakdown[modelId].avgResponseTime = Math.round(avgTime);
    modelBreakdown[modelId].errorRate = ((modelMetrics.length - modelSuccesses) / modelMetrics.length) * 100;
  });

  return {
    totalRequests: recentMetrics.length,
    successfulRequests,
    failedRequests,
    errorRate: (failedRequests / recentMetrics.length) * 100,
    avgResponseTime: Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length),
    p50ResponseTime: responseTimes[p50Index] || 0,
    p95ResponseTime: responseTimes[p95Index] || 0,
    p99ResponseTime: responseTimes[p99Index] || 0,
    modelBreakdown,
  };
}

/**
 * Check if metrics are within acceptable thresholds
 */
export function checkHealthThresholds(summary: AIMetricsSummary): {
  healthy: boolean;
  warnings: string[];
  critical: string[];
} {
  const warnings: string[] = [];
  const critical: string[] = [];

  // Error rate thresholds
  if (summary.errorRate > 5) {
    critical.push(`Error rate too high: ${summary.errorRate.toFixed(1)}% (threshold: 5%)`);
  } else if (summary.errorRate > 1) {
    warnings.push(`Error rate elevated: ${summary.errorRate.toFixed(1)}% (threshold: 1%)`);
  }

  // Response time thresholds
  if (summary.p95ResponseTime > 10000) {
    critical.push(`P95 response time too high: ${summary.p95ResponseTime}ms (threshold: 10s)`);
  } else if (summary.p95ResponseTime > 5000) {
    warnings.push(`P95 response time elevated: ${summary.p95ResponseTime}ms (threshold: 5s)`);
  }

  if (summary.avgResponseTime > 5000) {
    critical.push(`Average response time too high: ${summary.avgResponseTime}ms (threshold: 5s)`);
  } else if (summary.avgResponseTime > 3000) {
    warnings.push(`Average response time elevated: ${summary.avgResponseTime}ms (threshold: 3s)`);
  }

  return {
    healthy: critical.length === 0,
    warnings,
    critical,
  };
}

/**
 * Get rollout recommendation based on current metrics
 */
export function getRolloutRecommendation(currentPercentage: number): {
  shouldProceed: boolean;
  recommendedPercentage: number;
  reason: string;
} {
  const summary = getMetricsSummary(60); // Last hour
  const health = checkHealthThresholds(summary);

  // Need minimum data to make decision
  if (summary.totalRequests < 10) {
    return {
      shouldProceed: false,
      recommendedPercentage: currentPercentage,
      reason: "Not enough data yet (need 10+ requests)",
    };
  }

  // Critical issues - rollback
  if (health.critical.length > 0) {
    return {
      shouldProceed: false,
      recommendedPercentage: Math.max(0, currentPercentage - 10),
      reason: `Critical issues detected: ${health.critical.join(", ")}. Recommend rollback.`,
    };
  }

  // Warnings - hold current level
  if (health.warnings.length > 0) {
    return {
      shouldProceed: false,
      recommendedPercentage: currentPercentage,
      reason: `Warnings detected: ${health.warnings.join(", ")}. Monitor before proceeding.`,
    };
  }

  // All good - can proceed
  if (currentPercentage < 10) {
    return {
      shouldProceed: true,
      recommendedPercentage: 10,
      reason: "Metrics healthy. Proceed to 10% rollout.",
    };
  } else if (currentPercentage < 50) {
    return {
      shouldProceed: true,
      recommendedPercentage: 50,
      reason: "Metrics healthy. Proceed to 50% rollout.",
    };
  } else if (currentPercentage < 100) {
    return {
      shouldProceed: true,
      recommendedPercentage: 100,
      reason: "Metrics healthy. Proceed to 100% rollout.",
    };
  }

  return {
    shouldProceed: false,
    recommendedPercentage: 100,
    reason: "Already at 100% rollout.",
  };
}

/**
 * Log metrics summary (call periodically, e.g., every 5 minutes)
 */
export function logMetricsSummary(): void {
  const summary = getMetricsSummary(60);
  const health = checkHealthThresholds(summary);

  console.log('\n' + '='.repeat(70));
  console.log('📊 AI METRICS SUMMARY (Last 60 minutes)');
  console.log('='.repeat(70));
  console.log(`Total Requests:     ${summary.totalRequests}`);
  console.log(`Successful:         ${summary.successfulRequests} (${((summary.successfulRequests/summary.totalRequests)*100).toFixed(1)}%)`);
  console.log(`Failed:             ${summary.failedRequests} (${summary.errorRate.toFixed(1)}%)`);
  console.log(`\nResponse Times:`);
  console.log(`  Average:          ${summary.avgResponseTime}ms`);
  console.log(`  P50 (median):     ${summary.p50ResponseTime}ms`);
  console.log(`  P95:              ${summary.p95ResponseTime}ms`);
  console.log(`  P99:              ${summary.p99ResponseTime}ms`);
  
  console.log(`\nModel Breakdown:`);
  Object.entries(summary.modelBreakdown).forEach(([modelId, stats]) => {
    console.log(`  ${modelId}:`);
    console.log(`    Requests:       ${stats.requests}`);
    console.log(`    Avg Time:       ${stats.avgResponseTime}ms`);
    console.log(`    Error Rate:     ${stats.errorRate.toFixed(1)}%`);
  });

  console.log(`\nHealth Status: ${health.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  if (health.warnings.length > 0) {
    console.log(`⚠️  Warnings:`);
    health.warnings.forEach(w => console.log(`   - ${w}`));
  }
  if (health.critical.length > 0) {
    console.log(`🚨 Critical Issues:`);
    health.critical.forEach(c => console.log(`   - ${c}`));
  }
  console.log('='.repeat(70) + '\n');
}
