import { z } from "zod";

import { protectedProcedure, router } from "../../_core/trpc";
import {
  checkCalendarAvailability,
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from "../../google-api";

export const calendarRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
        maxResults: z.number().optional(),
      })
    )
    .query(async ({ input }) => listCalendarEvents(input)),
  create: protectedProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        start: z.string(),
        end: z.string(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => createCalendarEvent(input)),
  update: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateCalendarEvent(input);
        return result;
      } catch (error: any) {
        // Check if it's a rate limit error
        if (
          error.message?.includes("rate limit") ||
          error.message?.includes("429") ||
          error.message?.includes("too many requests")
        ) {
          const retryAfter = error.message.match(/retry after ([^,]+)/i)?.[1];
          throw new Error(
            `Rate limit exceeded. Retry after ${retryAfter || "later"}`
          );
        }
        // Re-throw other errors with better message
        throw new Error(
          `Failed to update calendar event: ${error.message || "Unknown error"}`
        );
      }
    }),
  delete: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteCalendarEvent(input);
        return { success: true };
      } catch (error: any) {
        // Check if it's a rate limit error
        if (
          error.message?.includes("rate limit") ||
          error.message?.includes("429") ||
          error.message?.includes("too many requests")
        ) {
          const retryAfter = error.message.match(/retry after ([^,]+)/i)?.[1];
          throw new Error(
            `Rate limit exceeded. Retry after ${retryAfter || "later"}`
          );
        }
        // Re-throw other errors with better message
        throw new Error(
          `Failed to delete calendar event: ${error.message || "Unknown error"}`
        );
      }
    }),
  checkAvailability: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ input }) => checkCalendarAvailability(input)),
  findFreeSlots: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        durationHours: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { findFreeSlots } = await import("../../google-api");
      return findFreeSlots({
        startDate: input.startDate,
        endDate: input.endDate,
        durationHours: input.durationHours,
      });
    }),
});
