import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { serviceTemplates } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

/**
 * CRM Service Template Router
 * - CRUD operations for service templates (Grundrengøring, Flytterengøring, etc.)
 * - Used by BookingForm to select predefined services
 */
export const crmServiceTemplateRouter = router({
  // List all service templates (optionally filter by category or active status)
  list: protectedProcedure
    .input(
      z.object({
        category: z
          .enum([
            "general",
            "vinduespolering",
            "facaderens",
            "tagrens",
            "graffiti",
            "other",
          ])
          .optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
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

      let where = eq(serviceTemplates.userId, userId);
      if (input.category !== undefined) {
        where = and(where, eq(serviceTemplates.category, input.category))!;
      }
      if (input.isActive !== undefined) {
        where = and(where, eq(serviceTemplates.isActive, input.isActive))!;
      }

      const rows = await db
        .select()
        .from(serviceTemplates)
        .where(where)
        .orderBy(desc(serviceTemplates.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return rows;
    }),

  // Get a single service template by id
  get: protectedProcedure
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
        .from(serviceTemplates)
        .where(
          and(
            eq(serviceTemplates.userId, userId),
            eq(serviceTemplates.id, input.id)
          )
        )
        .limit(1);
      if (rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service template not found",
        });
      }
      return rows[0];
    }),

  // Create a new service template
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().optional(),
        category: z
          .enum([
            "general",
            "vinduespolering",
            "facaderens",
            "tagrens",
            "graffiti",
            "other",
          ])
          .default("general"),
        durationMinutes: z.number().min(15).max(1440).optional(), // 15min - 24h
        priceDkk: z.number().min(0).optional(),
        isActive: z.boolean().optional().default(true),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const [created] = await db
        .insert(serviceTemplates)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          durationMinutes: input.durationMinutes,
          priceDkk: input.priceDkk,
          isActive: input.isActive ?? true,
          metadata: input.metadata ?? {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      return created;
    }),

  // Update an existing service template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).max(100).optional(),
        description: z.string().optional(),
        category: z
          .enum([
            "general",
            "vinduespolering",
            "facaderens",
            "tagrens",
            "graffiti",
            "other",
          ])
          .optional(),
        durationMinutes: z.number().min(15).max(1440).optional(),
        priceDkk: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
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

      // Verify ownership
      const rows = await db
        .select()
        .from(serviceTemplates)
        .where(
          and(
            eq(serviceTemplates.userId, userId),
            eq(serviceTemplates.id, input.id)
          )
        )
        .limit(1);
      if (rows.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service template not found",
        });

      const updates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined)
        updates.description = input.description;
      if (input.category !== undefined) updates.category = input.category;
      if (input.durationMinutes !== undefined)
        updates.durationMinutes = input.durationMinutes;
      if (input.priceDkk !== undefined) updates.priceDkk = input.priceDkk;
      if (input.isActive !== undefined) updates.isActive = input.isActive;
      if (input.metadata !== undefined) updates.metadata = input.metadata;

      const updated = await db
        .update(serviceTemplates)
        .set(updates)
        .where(eq(serviceTemplates.id, input.id))
        .returning();
      return updated[0];
    }),

  // Soft delete (set isActive to false)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;
      const rows = await db
        .select()
        .from(serviceTemplates)
        .where(
          and(
            eq(serviceTemplates.userId, userId),
            eq(serviceTemplates.id, input.id)
          )
        )
        .limit(1);
      if (rows.length === 0) return { success: true };

      // Soft delete - set isActive to false instead of deleting
      await db
        .update(serviceTemplates)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(serviceTemplates.id, input.id));
      return { success: true };
    }),
});
