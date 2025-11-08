import { router, protectedProcedure } from "../_core/trpc";

// Minimal workspace router used by BusinessDashboard and right-panel widgets
export const workspaceRouter = router({
  dashboard: router({
    overview: protectedProcedure.query(async () => {
      // Return safe defaults so UI can render while backend is evolving
      return {
        todayBookings: [],
        urgentActions: {
          unpaidInvoices: 0,
          leadsNeedingReply: 0,
          upcomingReminders: 0,
        },
        weekStats: {
          bookings: 0,
          revenue: 0,
          profit: 0,
          newLeads: 0,
          conversion: 0,
        },
      } as const;
    }),
  }),
});
