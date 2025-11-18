import { z } from "zod";

import { protectedProcedure, router } from "../../_core/trpc";
import { trackEvent } from "../../db";
import {
  createLead,
  getLeadCalendarEvents,
  getUserLeads,
  updateLeadScore,
  updateLeadStatus,
} from "../../lead-db";

export const leadsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        source: z.string().optional(),
        searchQuery: z.string().optional(),
        hideBillyImport: z.boolean().optional(),
        sortBy: z.enum(["date", "score", "name"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => getUserLeads(ctx.user.id, input)),
  create: protectedProcedure
    .input(
      z.object({
        source: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        notes: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await createLead({
        userId: ctx.user.id,
        source: input.source,
        name: input.name || "",
        email: input.email,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
        metadata: input.metadata,
      });
      await trackEvent({
        userId: ctx.user.id,
        eventType: "lead_created",
        eventData: { leadId: lead.id, source: input.source },
      });
      return lead;
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        status: z.enum([
          "new",
          "contacted",
          "qualified",
          "proposal",
          "won",
          "lost",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      await updateLeadStatus(input.leadId, input.status);
      return { success: true };
    }),
  updateScore: protectedProcedure
    .input(z.object({ leadId: z.number(), score: z.number() }))
    .mutation(async ({ input }) => {
      await updateLeadScore(input.leadId, input.score);
      return { success: true };
    }),
  getCalendarEvents: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return getLeadCalendarEvents(input.leadId);
    }),
  importHistoricalData: protectedProcedure
    .input(
      z.object({
        fromDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { importHistoricalData } = await import(
        "../../import-historical-data"
      );
      const fromDate = input.fromDate
        ? new Date(input.fromDate)
        : new Date("2025-07-01");
      return await importHistoricalData(ctx.user.id, fromDate);
    }),
});
