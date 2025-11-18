import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import {
  bookings,
  customerProfiles,
  customerProperties,
} from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { router, protectedProcedure } from "../_core/trpc";
import { validationSchemas } from "../_core/validation";
import { getDb } from "../db";


/**
 * CRM Booking Router
 * - List bookings by profile/date range
 * - Create booking
 * - Update booking status
 * - Delete booking
 */
export const crmBookingRouter = router({
  listBookings: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().optional(),
        start: validationSchemas.dateTime.optional(),
        end: validationSchemas.dateTime.optional(),
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

      const conditions = [eq(bookings.userId, userId)];
      if (input.customerProfileId !== undefined) {
        conditions.push(eq(bookings.customerProfileId, input.customerProfileId));
      }
      if (input.start) {
        conditions.push(gte(bookings.scheduledStart, input.start));
      }
      if (input.end) {
        conditions.push(lte(bookings.scheduledStart, input.end));
      }

      // ✅ ERROR HANDLING: Wrap database query with error handling
      return await withDatabaseErrorHandling(
        async () => {
          return await db
            .select()
            .from(bookings)
            .where(and(...conditions))
            .orderBy(desc(bookings.scheduledStart))
            .limit(input.limit)
            .offset(input.offset);
        },
        "Failed to list bookings"
      );
    }),

  createBooking: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        propertyId: z.number().optional(),
        serviceTemplateId: z.number().optional(),
        title: validationSchemas.shortTitle.optional(),
        notes: validationSchemas.notes,
        scheduledStart: validationSchemas.dateTime,
        scheduledEnd: validationSchemas.dateTime.optional(),
        assigneeUserId: z.number().optional(),
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

      // ✅ ERROR HANDLING: Wrap all database operations with error handling
      return await withDatabaseErrorHandling(
        async () => {
          // Verify profile ownership
          const profileRows = await db
            .select()
            .from(customerProfiles)
            .where(
              and(
                eq(customerProfiles.userId, userId),
                eq(customerProfiles.id, input.customerProfileId)
              )
            )
            .limit(1);
          if (profileRows.length === 0)
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Profile not accessible",
            });

          // If propertyId provided, ensure it belongs to the same profile
          if (input.propertyId) {
            const propRows = await db
              .select()
              .from(customerProperties)
              .where(
                and(
                  eq(customerProperties.id, input.propertyId),
                  eq(customerProperties.customerProfileId, input.customerProfileId)
                )
              )
              .limit(1);
            if (propRows.length === 0)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Property does not belong to profile",
              });
          }

          const [created] = await db
            .insert(bookings)
            .values({
              userId,
              customerProfileId: input.customerProfileId,
              propertyId: input.propertyId,
              serviceTemplateId: input.serviceTemplateId,
              title: input.title,
              notes: input.notes,
              scheduledStart: input.scheduledStart,
              scheduledEnd: input.scheduledEnd,
              status: "planned",
              assigneeUserId: input.assigneeUserId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              metadata: {},
            })
            .returning();

          // Track subscription usage if booking is for subscription customer (async)
          if (created.status === "completed" || created.status === "in_progress") {
            import("../subscription-usage-tracker")
              .then(({ trackBookingUsage, calculateBookingHours }) => {
                const hoursWorked = calculateBookingHours(created);
                return trackBookingUsage(created.id, userId, hoursWorked);
              })
              .catch((error) => {
                console.error("Error tracking subscription usage:", error);
                // Don't fail booking creation if usage tracking fails
              });
          }

          return created;
        },
        "Failed to create booking"
      );
    }),

  updateBookingStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
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

      // Track subscription usage when booking is completed (before status update)
      if (input.status === "completed") {
        const [booking] = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.id, input.id),
              eq(bookings.userId, userId)
            )
          )
          .limit(1);

        if (booking && booking.customerProfileId) {
          // Track usage asynchronously (don't block status update)
          import("../subscription-usage-tracker")
            .then(({ trackBookingUsage, calculateBookingHours }) => {
              const hoursWorked = calculateBookingHours(booking);
              return trackBookingUsage(booking.id, userId, hoursWorked);
            })
            .catch((error) => {
              console.error("Error tracking subscription usage:", error);
              // Don't fail status update if usage tracking fails
            });
        }
      }

      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(
        async () => {
          const rows = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, input.id))
            .limit(1);
          const booking = rows[0];
          if (!booking)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Booking not found",
            });
          if (booking.userId !== userId)
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Booking not accessible",
            });

          const updated = await db
            .update(bookings)
            .set({ status: input.status, updatedAt: new Date().toISOString() })
            .where(eq(bookings.id, input.id))
            .returning();
          return updated[0];
        },
        "Failed to update booking status"
      );
    }),

  deleteBooking: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;
      // ✅ ERROR HANDLING: Wrap database operations with error handling
      return await withDatabaseErrorHandling(
        async () => {
          const rows = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, input.id))
            .limit(1);
          const booking = rows[0];
          if (!booking) return { success: true };
          if (booking.userId !== userId)
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Booking not accessible",
            });

          await db.delete(bookings).where(eq(bookings.id, input.id));
          return { success: true };
        },
        "Failed to delete booking"
      );
    }),
});
