import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { leads, customerProfiles } from "../../drizzle/schema";
import { and, desc, eq } from "drizzle-orm";

/**
 * CRM Lead Router
 * - List/get leads
 * - Update lead status
 * - Convert lead to customer profile
 */
export const crmLeadRouter = router({
  listLeads: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
          .optional(),
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;
      const rows = await db
        .select()
        .from(leads)
        .where(
          input.status
            ? and(eq(leads.userId, userId), eq(leads.status, input.status))
            : eq(leads.userId, userId)
        )
        .orderBy(desc(leads.updatedAt))
        .limit(input.limit)
        .offset(input.offset);
      return rows;
    }),

  getLead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;
      const rows = await db
        .select()
        .from(leads)
        .where(and(eq(leads.userId, userId), eq(leads.id, input.id)))
        .limit(1);
      if (rows.length === 0)
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      return rows[0];
    }),

  updateLeadStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
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
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Validate ownership
      const userId = ctx.user.id;
      const rows = await db
        .select()
        .from(leads)
        .where(and(eq(leads.userId, userId), eq(leads.id, input.id)))
        .limit(1);
      if (rows.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Lead not accessible",
        });

      await db
        .update(leads)
        .set({ status: input.status, updatedAt: new Date().toISOString() })
        .where(eq(leads.id, input.id));
      return { success: true };
    }),

  convertLeadToCustomer: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;
      const leadRows = await db
        .select()
        .from(leads)
        .where(and(eq(leads.userId, userId), eq(leads.id, input.id)))
        .limit(1);
      const lead = leadRows[0];
      if (!lead)
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });

      if (!lead.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lead must have an email to convert",
        });
      }

      // Check if profile already exists
      const existing = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, userId),
            eq(customerProfiles.email, lead.email)
          )
        )
        .limit(1);
      if (existing[0]) {
        return {
          success: true,
          customerProfileId: existing[0].id,
          created: false,
        };
      }

      const [created] = await db
        .insert(customerProfiles)
        .values({
          userId,
          leadId: lead.id,
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          status: "new",
          tags: [],
          customerType: "private",
          totalInvoiced: 0,
          totalPaid: 0,
          balance: 0,
          invoiceCount: 0,
          emailCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return { success: true, customerProfileId: created.id, created: true };
    }),
});
