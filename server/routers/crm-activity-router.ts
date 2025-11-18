import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { customerActivities, customerProfiles } from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { protectedProcedure, router } from "../_core/trpc";
import { validationSchemas } from "../_core/validation";
import { getDb } from "../db";

/**
 * CRM Activity Router
 * - Track customer interactions: calls, meetings, emails, notes
 * - View activity history and statistics
 */
export const crmActivityRouter = router({
  // Log a new customer activity
  logActivity: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        activityType: z.enum([
          "call",
          "meeting",
          "email_sent",
          "note",
          "task_completed",
          "status_change",
          "property_added",
        ]),
        subject: validationSchemas.shortTitle,
        description: validationSchemas.description,
        durationMinutes: z.number().int().min(0).max(1440).optional(), // Max 24 hours
        outcome: validationSchemas.shortText.optional(),
        nextSteps: validationSchemas.shortText.optional(),
        relatedEmailId: z.number().optional(),
        relatedTaskId: z.number().optional(),
        relatedBookingId: z.number().optional(),
        metadata: z.record(z.string().max(100), z.any()).optional(),
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

      // ✅ ERROR HANDLING: Wrap all database operations with error handling
      return await withDatabaseErrorHandling(async () => {
        // Verify customer belongs to user
        const customer = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.id, input.customerProfileId),
              eq(customerProfiles.userId, userId)
            )
          )
          .limit(1);

        if (customer.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        const [activity] = await db
          .insert(customerActivities)
          .values({
            userId,
            customerProfileId: input.customerProfileId,
            activityType: input.activityType,
            subject: input.subject,
            description: input.description,
            durationMinutes: input.durationMinutes,
            outcome: input.outcome,
            nextSteps: input.nextSteps,
            relatedEmailId: input.relatedEmailId,
            relatedTaskId: input.relatedTaskId,
            relatedBookingId: input.relatedBookingId,
            metadata: input.metadata,
          })
          .returning();

        return activity;
      }, "Failed to log activity");
    }),

  // List activities for a customer
  listActivities: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        activityType: z
          .enum([
            "call",
            "meeting",
            "email_sent",
            "note",
            "task_completed",
            "status_change",
            "property_added",
          ])
          .optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(async () => {
        // Verify customer belongs to user
        const customer = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.id, input.customerProfileId),
              eq(customerProfiles.userId, userId)
            )
          )
          .limit(1);

        if (customer.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        const whereClause = input.activityType
          ? and(
              eq(customerActivities.customerProfileId, input.customerProfileId),
              eq(customerActivities.activityType, input.activityType)
            )
          : eq(customerActivities.customerProfileId, input.customerProfileId);

        return await db
          .select()
          .from(customerActivities)
          .where(whereClause)
          .orderBy(desc(customerActivities.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }, "Failed to list activities");
    }),

  // Get activity statistics for a customer
  getActivityStats: protectedProcedure
    .input(z.object({ customerProfileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(async () => {
        // Verify customer belongs to user
        const customer = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.id, input.customerProfileId),
              eq(customerProfiles.userId, userId)
            )
          )
          .limit(1);

        if (customer.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        // Get activity counts by type
        const stats = await db
          .select({
            activityType: customerActivities.activityType,
            count: sql<number>`count(*)::int`,
            totalDuration: sql<number>`sum(${customerActivities.durationMinutes})::int`,
          })
          .from(customerActivities)
          .where(
            eq(customerActivities.customerProfileId, input.customerProfileId)
          )
          .groupBy(customerActivities.activityType);

        // Get last activity date
        const [lastActivity] = await db
          .select({
            lastActivityDate: customerActivities.createdAt,
          })
          .from(customerActivities)
          .where(
            eq(customerActivities.customerProfileId, input.customerProfileId)
          )
          .orderBy(desc(customerActivities.createdAt))
          .limit(1);

        return {
          byType: stats,
          lastActivityDate: lastActivity?.lastActivityDate || null,
          totalActivities: stats.reduce((sum, s) => sum + s.count, 0),
        };
      }, "Failed to get activity statistics");
    }),

  // Delete an activity
  deleteActivity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const userId = ctx.user.id;

      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(async () => {
        // Verify activity belongs to user
        const [activity] = await db
          .select()
          .from(customerActivities)
          .where(
            and(
              eq(customerActivities.id, input.id),
              eq(customerActivities.userId, userId)
            )
          )
          .limit(1);

        if (!activity) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity not found",
          });
        }

        await db
          .delete(customerActivities)
          .where(eq(customerActivities.id, input.id));

        return { success: true };
      }, "Failed to delete activity");
    }),

  // Update an activity
  updateActivity: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        subject: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        outcome: z.string().optional(),
        nextSteps: z.string().optional(),
        durationMinutes: z.number().optional(),
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

      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(async () => {
        // Verify activity belongs to user
        const [activity] = await db
          .select()
          .from(customerActivities)
          .where(
            and(
              eq(customerActivities.id, input.id),
              eq(customerActivities.userId, userId)
            )
          )
          .limit(1);

        if (!activity) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity not found",
          });
        }

        const updateData: {
          updatedAt: string;
          subject?: string;
          description?: string | null;
          outcome?: string | null;
          nextSteps?: string | null;
          durationMinutes?: number | null;
        } = {
          updatedAt: new Date().toISOString(),
        };

        if (input.subject !== undefined) updateData.subject = input.subject;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.outcome !== undefined) updateData.outcome = input.outcome;
        if (input.nextSteps !== undefined)
          updateData.nextSteps = input.nextSteps;
        if (input.durationMinutes !== undefined)
          updateData.durationMinutes = input.durationMinutes;

        const [updated] = await db
          .update(customerActivities)
          .set(updateData)
          .where(eq(customerActivities.id, input.id))
          .returning();

        return updated;
      }, "Failed to update activity");
    }),
});
