import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { customerProfiles, leads, type Lead } from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { verifyResourceOwnership } from "../rbac";

/**
 * CRM Lead Router
 * - List/get leads
 * - Update lead status
 * - Convert lead to customer profile
 */
export const crmLeadRouter = router({
  // Create lead
  createLead: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().optional(),
        phone: z.string().max(50).optional(),
        company: z.string().max(255).optional(),
        source: z.string().max(100).optional(),
        notes: z.string().optional(),
        status: z
          .enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
          .optional()
          .default("new"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      const [created] = await db
        .insert(leads)
        .values({
          userId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          source: input.source || "manual",
          notes: input.notes,
          status: input.status,
          score: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return created;
    }),

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
      // ✅ ERROR HANDLING: Wrap database query with error handling
      return await withDatabaseErrorHandling(async () => {
        return await db
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
      }, "Failed to list leads");
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

      // ✅ RBAC: Verify lead ownership
      return await verifyResourceOwnership<Lead>(
        db,
        leads,
        input.id,
        ctx.user.id,
        "lead"
      );
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

      // ✅ RBAC: Verify lead ownership
      await verifyResourceOwnership(db, leads, input.id, ctx.user.id, "lead");

      // Update lead status
      await withDatabaseErrorHandling(async () => {
        await db
          .update(leads)
          .set({ status: input.status, updatedAt: new Date().toISOString() })
          .where(eq(leads.id, input.id));
      }, "Failed to update lead status");
      return { success: true };
    }),

  convertLeadToCustomer: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { withTransaction } = await import("../db/transaction-utils");
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;

      // ✅ Execute conversion in a transaction to ensure atomicity
      return await withTransaction(async (tx) => {
        // ✅ RBAC: Verify lead ownership and get full lead data
        const leadRows = await tx
          .select()
          .from(leads)
          .where(and(eq(leads.id, input.id), eq(leads.userId, userId)))
          .limit(1);

        if (leadRows.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found or access denied",
          });
        }

        const lead = leadRows[0];

        if (!lead.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Lead must have an email to convert",
          });
        }

        // Check if profile already exists
        const existing = await tx
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

        // Create customer profile
        const [created] = await tx
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

        // Update lead status to converted
        await tx
          .update(leads)
          .set({
            status: "won",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(leads.id, lead.id));

        return { success: true, customerProfileId: created.id, created: true };
      }, "Convert Lead to Customer");
    }),
});
