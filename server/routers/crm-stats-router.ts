import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { bookings, customerProfiles } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

/**
 * CRM Stats Router
 * - Dashboard statistics aggregations
 * - Customer metrics
 * - Revenue metrics
 * - Booking metrics
 */
export const crmStatsRouter = router({
  /**
   * Get CRM Dashboard Stats
   * Requirement 6: Display total/active/vip/at-risk customers, revenue, and bookings
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    // Customer metrics
    const customerMetrics = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        active: sql<number>`COUNT(CASE WHEN ${customerProfiles.status} = 'active' THEN 1 END)::int`,
        vip: sql<number>`COUNT(CASE WHEN ${customerProfiles.status} = 'vip' THEN 1 END)::int`,
        atRisk: sql<number>`COUNT(CASE WHEN ${customerProfiles.status} = 'at_risk' THEN 1 END)::int`,
      })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .execute();

    // Revenue metrics (sum of totalInvoiced, totalPaid, balance from all customers)
    const revenueMetrics = await db
      .select({
        total: sql<number>`COALESCE(SUM(${customerProfiles.totalInvoiced}), 0)::int`,
        paid: sql<number>`COALESCE(SUM(${customerProfiles.totalPaid}), 0)::int`,
        outstanding: sql<number>`COALESCE(SUM(${customerProfiles.balance}), 0)::int`,
      })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .execute();

    // Booking metrics
    const bookingMetrics = await db
      .select({
        planned: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'planned' THEN 1 END)::int`,
        inProgress: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'in_progress' THEN 1 END)::int`,
        completed: sql<number>`COUNT(CASE WHEN ${bookings.status} = 'completed' THEN 1 END)::int`,
      })
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .execute();

    return {
      customers: {
        total: customerMetrics[0]?.total || 0,
        active: customerMetrics[0]?.active || 0,
        vip: customerMetrics[0]?.vip || 0,
        atRisk: customerMetrics[0]?.atRisk || 0,
      },
      revenue: {
        total: revenueMetrics[0]?.total || 0,
        paid: revenueMetrics[0]?.paid || 0,
        outstanding: revenueMetrics[0]?.outstanding || 0,
      },
      bookings: {
        planned: bookingMetrics[0]?.planned || 0,
        inProgress: bookingMetrics[0]?.inProgress || 0,
        completed: bookingMetrics[0]?.completed || 0,
      },
    };
  }),
});
