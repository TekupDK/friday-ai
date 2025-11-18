import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import {
  customerNotesInFridayAi,
  customerProfiles,
  customerProperties,
} from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { protectedProcedure, router } from "../_core/trpc";
import { validationSchemas } from "../_core/validation";
import {
  getCustomerHealthScore,
  updateCustomerHealthScore,
} from "../customer-health-score";
import { getDb } from "../db";
import { getCachedQuery, invalidateCache } from "../db-cache";

/**
 * CRM Customer Router
 * - Customer Profiles: list/get
 * - Customer Properties (Ejendomme): list/create/update/delete
 */
export const crmCustomerRouter = router({
  // Create customer profile
  createProfile: protectedProcedure
    .input(
      z.object({
        name: validationSchemas.name,
        email: validationSchemas.email,
        phone: validationSchemas.phone.optional(),
        status: z
          .enum(["new", "active", "inactive", "vip", "at_risk"])
          .optional()
          .default("new"),
        customerType: z
          .enum(["private", "erhverv"])
          .optional()
          .default("private"),
        tags: z.array(z.string()).optional().default([]),
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

      // Check if profile already exists
      const existing = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, userId),
            eq(customerProfiles.email, input.email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Customer profile with this email already exists",
        });
      }

      const [created] = await db
        .insert(customerProfiles)
        .values({
          userId,
          email: input.email,
          name: input.name,
          phone: input.phone,
          status: input.status,
          customerType: input.customerType,
          tags: input.tags,
          totalInvoiced: 0,
          totalPaid: 0,
          balance: 0,
          invoiceCount: 0,
          emailCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      // Invalidate cache
      await invalidateCache("crm-customer-list").catch(() => {});

      return created;
    }),

  // List customer profiles with optional search and pagination
  listProfiles: protectedProcedure
    .input(
      z.object({
        search: validationSchemas.searchQuery.optional(),
        limit: z.number().min(1).max(100).optional().default(20),
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

      // ✅ PERFORMANCE: Cache customer list queries (5 minute TTL)
      // Cache key includes search, limit, offset to ensure correct results
      return await getCachedQuery(
        "crm-customer-list",
        async () => {
          // ✅ SECURITY FIX: Use parameterized queries with Drizzle's ilike for case-insensitive search
          // ilike properly parameterizes the search value, preventing SQL injection
          const whereClause = input.search
            ? and(
                eq(customerProfiles.userId, userId),
                or(
                  ilike(customerProfiles.name, `%${input.search}%`),
                  ilike(customerProfiles.email, `%${input.search}%`),
                  ilike(customerProfiles.phone, `%${input.search}%`)
                )!
              )
            : eq(customerProfiles.userId, userId);

          // ✅ ERROR HANDLING: Wrap database query with error handling
          return await withDatabaseErrorHandling(async () => {
            return await db
              .select()
              .from(customerProfiles)
              .where(whereClause)
              .orderBy(desc(customerProfiles.updatedAt))
              .limit(input.limit)
              .offset(input.offset);
          }, "Failed to list customer profiles");
        },
        {
          userId,
          search: input.search || "",
          limit: input.limit,
          offset: input.offset,
        },
        { ttl: 300 } // 5 minutes cache
      );
    }),

  // Get a single profile by id
  getProfile: protectedProcedure
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
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, userId),
            eq(customerProfiles.id, input.id)
          )
        )
        .limit(1);
      if (rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }
      return rows[0];
    }),

  // List properties for a profile
  listProperties: protectedProcedure
    .input(z.object({ customerProfileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // We do not check userId on properties directly (no column),
      // rely on profile ownership check for security-sensitive ops.
      const props = await db
        .select()
        .from(customerProperties)
        .where(
          eq(customerProperties.customerProfileId, input.customerProfileId)
        )
        .orderBy(desc(customerProperties.updatedAt));
      return props;
    }),

  // Create property
  createProperty: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        address: validationSchemas.address,
        city: validationSchemas.city.optional(),
        postalCode: validationSchemas.postalCode.optional(),
        isPrimary: z.boolean().optional().default(false),
        attributes: z.record(z.string().max(100), z.any()).optional(),
        notes: validationSchemas.notes,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Ensure profile belongs to user
      const owner = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, ctx.user.id),
            eq(customerProfiles.id, input.customerProfileId)
          )
        )
        .limit(1);
      if (owner.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Profile not accessible",
        });

      const [created] = await db
        .insert(customerProperties)
        .values({
          customerProfileId: input.customerProfileId,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          isPrimary: input.isPrimary ?? false,
          attributes: input.attributes ?? {},
          notes: input.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      // ✅ PERFORMANCE: Invalidate customer list cache when properties change
      await invalidateCache("crm-customer-list").catch(() => {
        // Ignore cache invalidation errors
      });

      return created;
    }),

  // Update property
  updateProperty: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        address: validationSchemas.address.optional(),
        city: validationSchemas.city.optional(),
        postalCode: validationSchemas.postalCode.optional(),
        isPrimary: z.boolean().optional(),
        attributes: z.record(z.string().max(100), z.any()).optional(),
        notes: validationSchemas.notes,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Load property and verify ownership via profile
      const propRows = await db
        .select()
        .from(customerProperties)
        .where(eq(customerProperties.id, input.id))
        .limit(1);
      const prop = propRows[0];
      if (!prop)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });

      const owner = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, ctx.user.id),
            eq(customerProfiles.id, prop.customerProfileId)
          )
        )
        .limit(1);
      if (owner.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Profile not accessible",
        });

      const updates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (input.address !== undefined) updates.address = input.address;
      if (input.city !== undefined) updates.city = input.city;
      if (input.postalCode !== undefined) updates.postalCode = input.postalCode;
      if (input.isPrimary !== undefined) updates.isPrimary = input.isPrimary;
      if (input.attributes !== undefined) updates.attributes = input.attributes;
      if (input.notes !== undefined) updates.notes = input.notes;

      const updated = await db
        .update(customerProperties)
        .set(updates)
        .where(eq(customerProperties.id, input.id))
        .returning();

      // ✅ PERFORMANCE: Invalidate customer list cache when properties change
      await invalidateCache("crm-customer-list").catch(() => {
        // Ignore cache invalidation errors
      });

      return updated[0];
    }),

  // Delete property
  deleteProperty: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const propRows = await db
        .select()
        .from(customerProperties)
        .where(eq(customerProperties.id, input.id))
        .limit(1);
      const prop = propRows[0];
      if (!prop) return { success: true };

      const owner = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, ctx.user.id),
            eq(customerProfiles.id, prop.customerProfileId)
          )
        )
        .limit(1);
      if (owner.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Profile not accessible",
        });

      await db
        .delete(customerProperties)
        .where(eq(customerProperties.id, input.id));

      // ✅ PERFORMANCE: Invalidate customer list cache when properties change
      await invalidateCache("crm-customer-list").catch(() => {
        // Ignore cache invalidation errors
      });

      return { success: true };
    }),

  // ==================== CUSTOMER NOTES ====================

  // Add note to customer
  addNote: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        content: validationSchemas.content.min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Verify customer exists and belongs to user
      const profile = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, ctx.user.id),
            eq(customerProfiles.id, input.customerProfileId)
          )
        )
        .limit(1);
      if (profile.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Profile not accessible",
        });

      const newNote = await db
        .insert(customerNotesInFridayAi)
        .values({
          customerId: input.customerProfileId,
          userId: ctx.user.id,
          note: input.content,
        })
        .returning();
      return newNote[0];
    }),

  // List notes for customer
  listNotes: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
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

      // Verify customer exists and belongs to user
      const profile = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, ctx.user.id),
            eq(customerProfiles.id, input.customerProfileId)
          )
        )
        .limit(1);
      if (profile.length === 0)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Profile not accessible",
        });

      const notes = await db
        .select()
        .from(customerNotesInFridayAi)
        .where(eq(customerNotesInFridayAi.customerId, input.customerProfileId))
        .orderBy(desc(customerNotesInFridayAi.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return notes;
    }),

  // Update note
  updateNote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: validationSchemas.content.min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Verify note exists and belongs to user
      const noteRows = await db
        .select()
        .from(customerNotesInFridayAi)
        .where(eq(customerNotesInFridayAi.id, input.id))
        .limit(1);
      const note = noteRows[0];
      if (!note)
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      if (note.userId !== ctx.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Note not accessible",
        });

      const updated = await db
        .update(customerNotesInFridayAi)
        .set({
          note: input.content,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(customerNotesInFridayAi.id, input.id))
        .returning();
      return updated[0];
    }),

  // Delete note
  deleteNote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      // Verify note exists and belongs to user
      const noteRows = await db
        .select()
        .from(customerNotesInFridayAi)
        .where(eq(customerNotesInFridayAi.id, input.id))
        .limit(1);
      const note = noteRows[0];
      if (!note) return { success: true };
      if (note.userId !== ctx.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Note not accessible",
        });

      await db
        .delete(customerNotesInFridayAi)
        .where(eq(customerNotesInFridayAi.id, input.id));
      return { success: true };
    }),

  // Get email history for a customer
  getEmailHistory: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
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

      // Verify customer belongs to user
      const customerRows = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (customerRows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      const customer = customerRows[0];

      // Get email threads for this customer's email address
      const { emailThreads } = await import("../../drizzle/schema");

      // ✅ SECURITY FIX: Use parameterized query - customer.email is from DB but still parameterize for safety
      // Note: participants is JSONB, so we use sql with proper parameterization
      const searchPattern = `%${customer.email?.toLowerCase() || ""}%`;
      const threads = await db
        .select()
        .from(emailThreads)
        .where(
          and(
            eq(emailThreads.userId, userId),
            sql`${emailThreads.participants}::text ILIKE ${searchPattern}`
          )
        )
        .orderBy(desc(emailThreads.lastMessageAt))
        .limit(input.limit)
        .offset(input.offset);

      return threads;
    }),

  // Link email thread to customer profile
  linkEmailToCustomer: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        threadId: validationSchemas.threadId,
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

      // Verify customer belongs to user
      const customerRows = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (customerRows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // For now, we'll just log this as an activity
      // In a full implementation, we might want a junction table
      const { customerActivities } = await import("../../drizzle/schema");

      const [activity] = await db
        .insert(customerActivities)
        .values({
          userId,
          customerProfileId: input.customerProfileId,
          activityType: "email_sent",
          subject: "Email thread linked to customer",
          metadata: { threadId: input.threadId },
        })
        .returning();

      return activity;
    }),

  // Get customer health score
  getHealthScore: protectedProcedure
    .input(z.object({ customerProfileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;

      // Verify customer belongs to user
      const customerRows = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (customerRows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get cached score or calculate new one
      let score = await getCustomerHealthScore(input.customerProfileId);

      if (!score) {
        // Calculate and cache
        await updateCustomerHealthScore(input.customerProfileId, userId);
        score = await getCustomerHealthScore(input.customerProfileId);
      }

      return score;
    }),

  // Recalculate customer health score
  recalculateHealthScore: protectedProcedure
    .input(z.object({ customerProfileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const userId = ctx.user.id;

      // Verify customer belongs to user
      const customerRows = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (customerRows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Recalculate
      await updateCustomerHealthScore(input.customerProfileId, userId);
      const score = await getCustomerHealthScore(input.customerProfileId);

      return score;
    }),
});
