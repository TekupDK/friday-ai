/**
 * A/B Test Analytics Endpoints
 * TRPC routes for A/B test metrics and analysis
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { 
  recordTestMetrics, 
  calculateTestResults, 
  getABTestStatus,
  getTestGroup,
  type TestMetrics 
} from "./_core/ab-testing";
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
      if (!db) throw new Error("Database not available");
      const result = await db.query(
        `SELECT 
          test_group,
          DATE(timestamp) as date,
          COUNT(*) as sample_count,
          AVG(response_time) as avg_response_time,
          SUM(error_count)::float / COUNT(*) as error_rate,
          AVG(completion_rate) as completion_rate,
          AVG(user_satisfaction) as avg_satisfaction
        FROM ab_test_metrics
        WHERE test_name = $1 
        AND timestamp >= NOW() - INTERVAL '$2 days'
        GROUP BY test_group, DATE(timestamp)
        ORDER BY date DESC`,
        [input.testName, input.days]
      );

      return {
        testName: input.testName,
        metrics: result.rows.map((row: any) => ({
          testGroup: row.test_group,
          date: row.date,
          sampleCount: parseInt(row.sample_count),
          avgResponseTime: parseFloat(row.avg_response_time),
          errorRate: parseFloat(row.error_rate),
          completionRate: parseFloat(row.completion_rate),
          avgSatisfaction: row.avg_satisfaction ? parseFloat(row.avg_satisfaction) : null,
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
      if (!db) throw new Error("Database not available");
      const result = await db.query(
        `SELECT 
          test_group,
          DATE_TRUNC('hour', timestamp) as hour,
          COUNT(*) as sample_count,
          AVG(response_time) as avg_response_time,
          SUM(error_count)::float / COUNT(*) as error_rate
        FROM ab_test_metrics
        WHERE test_name = $1 
        AND timestamp >= NOW() - INTERVAL '$2 hours'
        GROUP BY test_group, DATE_TRUNC('hour', timestamp)
        ORDER BY hour DESC`,
        [input.testName, input.hours]
      );

      return {
        testName: input.testName,
        metrics: result.rows.map((row: any) => ({
          testGroup: row.test_group,
          hour: row.hour,
          sampleCount: parseInt(row.sample_count),
          avgResponseTime: parseFloat(row.avg_response_time),
          errorRate: parseFloat(row.error_rate),
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
