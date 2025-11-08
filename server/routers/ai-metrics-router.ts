/**
 * AI Metrics Router
 * API endpoints for monitoring OpenRouter models performance
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { 
  getMetricsSummary, 
  checkHealthThresholds, 
  getRolloutRecommendation,
  logMetricsSummary 
} from "../ai-metrics";
import { getFeatureFlags } from "../_core/feature-flags";

export const aiMetricsRouter = router({
  /**
   * Get metrics summary for dashboard
   */
  getSummary: protectedProcedure
    .input(
      z.object({
        lastMinutes: z.number().optional().default(60),
      })
    )
    .query(async ({ input }) => {
      const summary = getMetricsSummary(input.lastMinutes);
      const health = checkHealthThresholds(summary);
      
      return {
        ...summary,
        health,
      };
    }),

  /**
   * Get current rollout status
   */
  getRolloutStatus: protectedProcedure.query(async ({ ctx }) => {
    const flags = getFeatureFlags(ctx.user.id);
    const summary = getMetricsSummary(60);
    const recommendation = getRolloutRecommendation(flags.openRouterRolloutPercentage);

    return {
      currentPercentage: flags.openRouterRolloutPercentage,
      enabled: flags.enableOpenRouterModels,
      totalRequests: summary.totalRequests,
      errorRate: summary.errorRate,
      avgResponseTime: summary.avgResponseTime,
      recommendation,
    };
  }),

  /**
   * Get detailed model breakdown
   */
  getModelBreakdown: protectedProcedure.query(async () => {
    const summary = getMetricsSummary(60);
    return {
      models: summary.modelBreakdown,
      timestamp: new Date(),
    };
  }),

  /**
   * Check if system is healthy enough for rollout
   */
  checkRolloutHealth: protectedProcedure.query(async () => {
    const summary = getMetricsSummary(60);
    const health = checkHealthThresholds(summary);
    const recommendation = getRolloutRecommendation(
      parseInt(process.env.OPENROUTER_ROLLOUT_PERCENTAGE || '0', 10)
    );

    return {
      healthy: health.healthy,
      warnings: health.warnings,
      critical: health.critical,
      canProceed: recommendation.shouldProceed,
      recommendation: recommendation.reason,
      metrics: {
        totalRequests: summary.totalRequests,
        errorRate: summary.errorRate,
        avgResponseTime: summary.avgResponseTime,
        p95ResponseTime: summary.p95ResponseTime,
      },
    };
  }),

  /**
   * Force log metrics summary (admin only)
   */
  logSummary: protectedProcedure.mutation(async () => {
    logMetricsSummary();
    return { success: true };
  }),
});
