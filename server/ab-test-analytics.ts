/**
 * A/B Test Analytics Endpoints
 * TRPC routes for A/B test metrics and analysis
 */

import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";

import {
  recordTestMetrics,
  calculateTestResults,
  getABTestStatus,
  getTestGroup,
  type TestMetrics,
} from "./_core/ab-testing";
import { publicProcedure, router } from "./_core/trpc";
import { abTestMetricsInFridayAi } from "../drizzle/schema";
import { getDb } from "./db";

export const abTestAnalyticsRouter = router({
  /**
   * Record a new A/B test metric
   */
  recordMetric: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        testGroup: z.enum(["control", "variant"]),
        responseTime: z.number(),
        errorCount: z.number().default(0),
        messageCount: z.number().default(1),
        completionRate: z.number().min(0).max(1).default(1),
        userSatisfaction: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const metrics: TestMetrics = {
        ...input,
        timestamp: new Date(),
      };

      const db = await getDb();
      await recordTestMetrics(metrics, db);

      return {
        success: true,
        message: "Metric recorded successfully",
      };
    }),

  /**
   * Get test results with statistical analysis
   */
  getTestResults: publicProcedure
    .input(
      z.object({
        testName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const results = await calculateTestResults(input.testName, db);

      if (!results) {
        throw new Error(`Test not found: ${input.testName}`);
      }

      return {
        testName: results.testName,
        controlSampleSize: results.controlMetrics.length,
        variantSampleSize: results.variantMetrics.length,
        controlAvgResponseTime:
          results.controlMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
          (results.controlMetrics.length || 1),
        variantAvgResponseTime:
          results.variantMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
          (results.variantMetrics.length || 1),
        controlErrorRate:
          results.controlMetrics.reduce((sum, m) => sum + m.errorCount, 0) /
          (results.controlMetrics.length || 1),
        variantErrorRate:
          results.variantMetrics.reduce((sum, m) => sum + m.errorCount, 0) /
          (results.variantMetrics.length || 1),
        statisticalSignificance: results.statisticalSignificance,
        recommendation: results.recommendation,
        improvementPercent: calculateImprovement(
          results.controlMetrics.map(m => m.responseTime),
          results.variantMetrics.map(m => m.responseTime)
        ),
      };
    }),

  /**
   * Get all active A/B tests
   */
  getActiveTests: publicProcedure.query(async () => {
    const tests = getABTestStatus();
    return tests.filter(t => t.enabled);
  }),

  /**
   * Get user's test group assignment
   */
  getUserTestGroup: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        testName: z.string(),
      })
    )
    .query(({ input }) => {
      const group = getTestGroup(input.userId, input.testName);
      return {
        userId: input.userId,
        testName: input.testName,
        testGroup: group,
      };
    }),

  /**
   * Get metrics dashboard data
   */
  getMetricsDashboard: publicProcedure
    .input(
      z.object({
        testName: z.string(),
        days: z.number().default(7),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      // Query metrics from the last N days
      const metrics = await db
        .select()
        .from(abTestMetricsInFridayAi)
        .where(
          and(
            eq(abTestMetricsInFridayAi.testName, input.testName),
            gte(abTestMetricsInFridayAi.timestamp, cutoffDate.toISOString())
          )
        )
        .orderBy(abTestMetricsInFridayAi.timestamp);

      return {
        testName: input.testName,
        metrics: metrics.map(m => ({
          timestamp: m.timestamp,
          testGroup: m.testGroup,
          responseTime: m.responseTime,
          errorCount: m.errorCount,
          messageCount: m.messageCount,
          completionRate: m.completionRate,
          userSatisfaction: m.userSatisfaction,
        })),
      };
    }),

  /**
   * Get hourly metrics for real-time monitoring
   */
  getHourlyMetrics: publicProcedure
    .input(
      z.object({
        testName: z.string(),
        hours: z.number().default(24),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Calculate the cutoff time
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - input.hours);

      // Query metrics from the last N hours
      const metrics = await db
        .select()
        .from(abTestMetricsInFridayAi)
        .where(
          and(
            eq(abTestMetricsInFridayAi.testName, input.testName),
            gte(abTestMetricsInFridayAi.timestamp, cutoffTime.toISOString())
          )
        )
        .orderBy(abTestMetricsInFridayAi.timestamp);

      return {
        testName: input.testName,
        metrics: metrics.map(m => ({
          timestamp: m.timestamp,
          testGroup: m.testGroup,
          responseTime: m.responseTime,
          errorCount: m.errorCount,
          messageCount: m.messageCount,
          completionRate: m.completionRate,
          userSatisfaction: m.userSatisfaction,
        })),
      };
    }),
});

/**
 * Calculate improvement percentage
 */
function calculateImprovement(control: number[], variant: number[]): number {
  if (control.length === 0 || variant.length === 0) return 0;

  const controlAvg = control.reduce((a, b) => a + b, 0) / control.length;
  const variantAvg = variant.reduce((a, b) => a + b, 0) / variant.length;

  if (controlAvg === 0) return 0;

  return ((controlAvg - variantAvg) / controlAvg) * 100;
}
