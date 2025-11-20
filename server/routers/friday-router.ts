import { z } from "zod";

import { protectedProcedure, router } from "../_core/trpc";
import { getCustomers, searchCustomerByEmail } from "../modules/billing/billy";
import { searchGmailThreads } from "../google-api";

/**
 * Friday Router
 *
 * Legacy Friday AI helper endpoints for lead discovery and customer search.
 * These endpoints are kept for backward compatibility.
 */
export const fridayRouter = router({
  findRecentLeads: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);
      const query = `after:${daysAgo.toISOString().split("T")[0]}`;
      return searchGmailThreads({ query, maxResults: 100 });
    }),
  getCustomers: protectedProcedure.query(async () => getCustomers()),
  searchCustomer: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => searchCustomerByEmail(input.email)),
});
