import { z } from "zod";

import { router } from "../_core/trpc";
import { protectedProcedure } from "../_core/trpc";
import { analyzeTeam2FbRengoring } from "../scripts/team2-fb-rengoring-report";

/**
 * Reports Router
 *
 * Provides endpoints for generating various business reports
 */
export const reportsRouter = router({
  /**
   * Generate Team 2 FB Rengøring report
   *
   * Analyzes Team 2's "fb rengøring" tasks and compares:
   * - Calendar time (from calendar events)
   * - Agreed time (from Gmail threads)
   * - Invoiced time (from invoices)
   * - Actual work time (from Gmail threads)
   *
   * Cost calculation: hours × number of people × 90 DKK/hour
   *
   * Supports both:
   * - daysBack: Number of days back from today (default: 14)
   * - dateRange: Specific date range (startDate and endDate in YYYY-MM-DD format)
   */
  team2FbRengoring: protectedProcedure
    .input(
      z.object({
        daysBack: z.number().min(1).max(365).optional(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // If date range provided, use it; otherwise use daysBack
      if (input.startDate && input.endDate) {
        const result = await analyzeTeam2FbRengoring(
          ctx.user.id,
          input.startDate,
          input.endDate
        );
        return result;
      } else if (input.startDate) {
        // Only start date provided, default to 14 days from start
        const result = await analyzeTeam2FbRengoring(
          ctx.user.id,
          input.startDate
        );
        return result;
      } else {
        // Use daysBack (default 14)
        const result = await analyzeTeam2FbRengoring(
          ctx.user.id,
          input.daysBack || 14
        );
        return result;
      }
    }),
});
