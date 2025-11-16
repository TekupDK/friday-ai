import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import {
  auditLog,
  customerDocuments,
  customerProfiles,
  customerRelationships,
  customerSegmentMembers,
  customerSegments,
  opportunities,
} from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { validationSchemas } from "../_core/validation";

/**
 * CRM Extensions Router - Phase 2-6
 *
 * Advanced CRM features:
 * - Opportunities/Deals Pipeline (6 endpoints)
 * - Customer Segmentation (5 endpoints)
 * - Documents & File Uploads (3 endpoints)
 * - Audit Log for GDPR (2 endpoints)
 * - Relationship Mapping (3 endpoints)
 *
 * Total: 20 endpoints
 */
export const crmExtensionsRouter = router({
  // =============================================================================
  // PHASE 2: OPPORTUNITIES/DEALS PIPELINE (6 endpoints)
  // =============================================================================

  /**
   * Create a new opportunity/deal
   */
  createOpportunity: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        title: validationSchemas.title, // ✅ SECURITY FIX: Use shared validation
        description: validationSchemas.description, // ✅ SECURITY FIX: Added max length
        stage: z
          .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
          .default("lead"),
        value: z.number().int().min(0).optional(),
        probability: z.number().int().min(0).max(100).optional(),
        expectedCloseDate: z.string().datetime().optional(),
        nextSteps: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
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
        // Verify customer belongs to user
        const [customer] = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.id, input.customerProfileId),
              eq(customerProfiles.userId, userId)
            )
          )
          .limit(1);

        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer profile not found",
          });
        }

        const [opportunity] = await db
          .insert(opportunities)
          .values({
            userId,
            customerProfileId: input.customerProfileId,
            title: input.title,
            description: input.description ?? null,
            stage: input.stage,
            value: input.value ?? null,
            probability: input.probability ?? null,
            expectedCloseDate: input.expectedCloseDate ?? null,
            nextSteps: input.nextSteps ?? null,
            metadata: input.metadata ?? null,
          })
          .returning();

        return opportunity;
      }, "Failed to create opportunity");
    }),

  /**
   * List opportunities with filtering
   */
  listOpportunities: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().optional(),
        stage: z
          .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
          .optional(),
        minValue: z.number().int().optional(),
        maxValue: z.number().int().optional(),
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

      const conditions = [eq(opportunities.userId, userId)];

      if (input.customerProfileId !== undefined) {
        conditions.push(eq(opportunities.customerProfileId, input.customerProfileId));
      }

      if (input.stage !== undefined) {
        conditions.push(eq(opportunities.stage, input.stage));
      }

      if (input.minValue !== undefined) {
        conditions.push(gte(opportunities.value, input.minValue));
      }

      if (input.maxValue !== undefined) {
        conditions.push(lte(opportunities.value, input.maxValue));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      // ✅ ERROR HANDLING: Wrap database query with error handling
      return await withDatabaseErrorHandling(
        async () => {
          return await db
            .select()
            .from(opportunities)
            .where(whereClause)
            .orderBy(desc(opportunities.updatedAt))
            .limit(input.limit)
            .offset(input.offset);
        },
        "Failed to list opportunities"
      );
    }),

  /**
   * Update opportunity (auto-sets actualCloseDate if stage is won/lost)
   */
  updateOpportunity: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().optional(),
        stage: z
          .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
          .optional(),
        value: z.number().int().min(0).optional(),
        probability: z.number().int().min(0).max(100).optional(),
        expectedCloseDate: z.string().datetime().optional(),
        actualCloseDate: z.string().datetime().optional(),
        wonReason: z.string().optional(),
        lostReason: z.string().optional(),
        nextSteps: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
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
      const { id, ...updates } = input;

      // Verify ownership
      const [existing] = await db
        .select()
        .from(opportunities)
        .where(and(eq(opportunities.id, id), eq(opportunities.userId, userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity not found",
        });
      }

      // Auto-set actualCloseDate if stage changed to won/lost
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (input.stage === "won" || input.stage === "lost") {
        if (!updates.actualCloseDate && !existing.actualCloseDate) {
          updateData.actualCloseDate = new Date().toISOString();
        }
      }

      const [updated] = await db
        .update(opportunities)
        .set(updateData)
        .where(eq(opportunities.id, id))
        .returning();

      return updated;
    }),

  /**
   * Delete opportunity
   */
  deleteOpportunity: protectedProcedure
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
      return await withDatabaseErrorHandling(
        async () => {
          // Verify ownership
          const [existing] = await db
            .select()
            .from(opportunities)
            .where(and(eq(opportunities.id, input.id), eq(opportunities.userId, userId)))
            .limit(1);

          if (!existing) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Opportunity not found",
            });
          }

          await db.delete(opportunities).where(eq(opportunities.id, input.id));

          return { success: true };
        },
        "Failed to delete opportunity"
      );
    }),

  /**
   * Get pipeline statistics by stage
   */
  getPipelineStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    // ✅ ERROR HANDLING: Wrap database query with error handling
    return await withDatabaseErrorHandling(
      async () => {
        return await db
          .select({
            stage: opportunities.stage,
            count: sql<number>`cast(count(*) as integer)`,
            totalValue: sql<number>`cast(sum(coalesce(${opportunities.value}, 0)) as integer)`,
            avgProbability: sql<number>`cast(avg(coalesce(${opportunities.probability}, 0)) as integer)`,
          })
          .from(opportunities)
          .where(eq(opportunities.userId, userId))
          .groupBy(opportunities.stage);
      },
      "Failed to get pipeline statistics"
    );
  }),

  /**
   * Get revenue forecast (total and weighted by probability)
   */
  getRevenueForecast: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    // ✅ ERROR HANDLING: Wrap database query with error handling
    const forecast = await withDatabaseErrorHandling(
      async () => {
        const [result] = await db
          .select({
            totalValue: sql<number>`cast(sum(coalesce(${opportunities.value}, 0)) as integer)`,
            weightedValue: sql<number>`cast(sum(coalesce(${opportunities.value}, 0) * coalesce(${opportunities.probability}, 0) / 100.0) as integer)`,
            count: sql<number>`cast(count(*) as integer)`,
          })
          .from(opportunities)
          .where(
            and(
              eq(opportunities.userId, userId),
              sql`${opportunities.stage} NOT IN ('won', 'lost')`
            )
          );
        return result;
      },
      "Failed to get revenue forecast"
    );

    return {
      totalValue: forecast?.totalValue || 0,
      weightedValue: forecast?.weightedValue || 0,
      count: forecast?.count || 0,
    };
  }),

  // =============================================================================
  // PHASE 3: CUSTOMER SEGMENTATION (5 endpoints)
  // =============================================================================

  /**
   * Create a segment (manual or automatic with rules)
   */
  createSegment: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["manual", "automatic"]).default("manual"),
        rules: z.record(z.string(), z.any()).optional(), // For automatic: { healthScore: { lt: 50 } }
        color: z.string().optional(), // UI color hex
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

      const [segment] = await db
        .insert(customerSegments)
        .values({
          userId,
          name: input.name,
          description: input.description ?? null,
          type: input.type,
          rules: input.rules ?? null,
          color: input.color ?? null,
        })
        .returning();

      return segment;
    }),

  /**
   * List all segments for user
   */
  listSegments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    const segments = await db
      .select()
      .from(customerSegments)
      .where(eq(customerSegments.userId, userId))
      .orderBy(desc(customerSegments.createdAt));

    // Get member counts for each segment
    const segmentsWithCounts = await Promise.all(
      segments.map(async (segment) => {
        const [countResult] = await db
          .select({
            count: sql<number>`cast(count(*) as integer)`,
          })
          .from(customerSegmentMembers)
          .where(eq(customerSegmentMembers.segmentId, segment.id));

        return {
          ...segment,
          memberCount: countResult?.count || 0,
        };
      })
    );

    return segmentsWithCounts;
  }),

  /**
   * Add customers to segment (batch operation)
   */
  addToSegment: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
        customerProfileIds: z.array(z.number()).min(1),
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

      // Verify segment ownership
      const [segment] = await db
        .select()
        .from(customerSegments)
        .where(
          and(
            eq(customerSegments.id, input.segmentId),
            eq(customerSegments.userId, userId)
          )
        )
        .limit(1);

      if (!segment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Segment not found",
        });
      }

      // Verify all customers belong to user
      const customers = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, userId),
            inArray(customerProfiles.id, input.customerProfileIds)
          )
        );

      if (customers.length !== input.customerProfileIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some customer profiles not found or don't belong to user",
        });
      }

      // Insert members (ignore duplicates)
      const members = input.customerProfileIds.map((customerId) => ({
        segmentId: input.segmentId,
        customerProfileId: customerId,
      }));

      // Check existing members to avoid duplicates
      const existing = await db
        .select()
        .from(customerSegmentMembers)
        .where(
          and(
            eq(customerSegmentMembers.segmentId, input.segmentId),
            inArray(customerSegmentMembers.customerProfileId, input.customerProfileIds)
          )
        );

      const existingIds = new Set(
        existing.map((e) => `${e.segmentId}-${e.customerProfileId}`)
      );

      const newMembers = members.filter(
        (m) => !existingIds.has(`${m.segmentId}-${m.customerProfileId}`)
      );

      if (newMembers.length > 0) {
        await db.insert(customerSegmentMembers).values(newMembers);
      }

      return {
        success: true,
        added: newMembers.length,
        skipped: members.length - newMembers.length,
      };
    }),

  /**
   * Remove customers from segment
   */
  removeFromSegment: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
        customerProfileIds: z.array(z.number()).min(1),
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

      // Verify segment ownership
      const [segment] = await db
        .select()
        .from(customerSegments)
        .where(
          and(
            eq(customerSegments.id, input.segmentId),
            eq(customerSegments.userId, userId)
          )
        )
        .limit(1);

      if (!segment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Segment not found",
        });
      }

      await db
        .delete(customerSegmentMembers)
        .where(
          and(
            eq(customerSegmentMembers.segmentId, input.segmentId),
            inArray(customerSegmentMembers.customerProfileId, input.customerProfileIds)
          )
        );

      return { success: true };
    }),

  /**
   * Get segment members with pagination
   */
  getSegmentMembers: protectedProcedure
    .input(
      z.object({
        segmentId: z.number(),
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

      // Verify segment ownership
      const [segment] = await db
        .select()
        .from(customerSegments)
        .where(
          and(
            eq(customerSegments.id, input.segmentId),
            eq(customerSegments.userId, userId)
          )
        )
        .limit(1);

      if (!segment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Segment not found",
        });
      }

      const members = await db
        .select({
          id: customerSegmentMembers.id,
          segmentId: customerSegmentMembers.segmentId,
          customerProfileId: customerSegmentMembers.customerProfileId,
          addedAt: customerSegmentMembers.addedAt,
          customer: customerProfiles,
        })
        .from(customerSegmentMembers)
        .innerJoin(
          customerProfiles,
          eq(customerSegmentMembers.customerProfileId, customerProfiles.id)
        )
        .where(eq(customerSegmentMembers.segmentId, input.segmentId))
        .orderBy(desc(customerSegmentMembers.addedAt))
        .limit(input.limit)
        .offset(input.offset);

      return members;
    }),

  // =============================================================================
  // PHASE 4: DOCUMENTS & FILE UPLOADS (3 endpoints)
  // =============================================================================

  /**
   * Create document metadata (file should be uploaded to Supabase Storage first)
   */
  createDocument: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        filename: z.string().min(1),
        storageUrl: z.string().url(),
        filesize: z.number().int().min(0).optional(),
        mimeType: z.string().optional(),
        category: z.string().optional(), // contract, invoice, photo, other
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        version: z.number().int().min(1).optional().default(1),
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

      // Verify customer belongs to user
      const [customer] = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      const [document] = await db
        .insert(customerDocuments)
        .values({
          userId,
          customerProfileId: input.customerProfileId,
          filename: input.filename,
          storageUrl: input.storageUrl,
          filesize: input.filesize ?? null,
          mimeType: input.mimeType ?? null,
          category: input.category ?? null,
          description: input.description ?? null,
          tags: input.tags ?? null,
          version: input.version,
        })
        .returning();

      return document;
    }),

  /**
   * List documents for a customer
   */
  listDocuments: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        category: z.string().optional(),
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

      // Verify customer belongs to user
      const [customer] = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      const conditions = [
        eq(customerDocuments.customerProfileId, input.customerProfileId),
        eq(customerDocuments.userId, userId),
      ];

      if (input.category) {
        conditions.push(eq(customerDocuments.category, input.category));
      }

      const documents = await db
        .select()
        .from(customerDocuments)
        .where(and(...conditions))
        .orderBy(desc(customerDocuments.uploadedAt))
        .limit(input.limit)
        .offset(input.offset);

      return documents;
    }),

  /**
   * Delete document (metadata only - file deletion in Supabase Storage should be handled separately)
   */
  deleteDocument: protectedProcedure
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

      // Verify ownership
      const [existing] = await db
        .select()
        .from(customerDocuments)
        .where(
          and(eq(customerDocuments.id, input.id), eq(customerDocuments.userId, userId))
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await db.delete(customerDocuments).where(eq(customerDocuments.id, input.id));

      return { success: true, storageUrl: existing.storageUrl };
    }),

  // =============================================================================
  // PHASE 5: AUDIT LOG FOR GDPR (2 endpoints)
  // =============================================================================

  /**
   * Log an audit action
   */
  logAudit: protectedProcedure
    .input(
      z.object({
        entityType: z.string().min(1), // customer, opportunity, document, etc.
        entityId: z.number(),
        action: z.string().min(1), // created, updated, deleted, exported, consent_given, consent_revoked
        changes: z.record(z.string(), z.any()).optional(), // { field: { old: "value1", new: "value2" } }
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
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

      const [auditEntry] = await db
        .insert(auditLog)
        .values({
          userId,
          entityType: input.entityType,
          entityId: input.entityId,
          action: input.action,
          changes: input.changes ?? null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        })
        .returning();

      return auditEntry;
    }),

  /**
   * Get audit log with filtering
   */
  getAuditLog: protectedProcedure
    .input(
      z.object({
        entityType: z.string().optional(),
        entityId: z.number().optional(),
        action: z.string().optional(),
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

      const conditions = [eq(auditLog.userId, userId)];

      if (input.entityType) {
        conditions.push(eq(auditLog.entityType, input.entityType));
      }

      if (input.entityId !== undefined) {
        conditions.push(eq(auditLog.entityId, input.entityId));
      }

      if (input.action) {
        conditions.push(eq(auditLog.action, input.action));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const entries = await db
        .select()
        .from(auditLog)
        .where(whereClause)
        .orderBy(desc(auditLog.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return entries;
    }),

  // =============================================================================
  // PHASE 6: RELATIONSHIP MAPPING (3 endpoints)
  // =============================================================================

  /**
   * Create a customer relationship
   */
  createRelationship: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        relatedCustomerProfileId: z.number(),
        relationshipType: z.string().min(1), // parent_company, subsidiary, referrer, referred_by, partner, competitor
        description: z.string().optional(),
        strength: z.number().int().min(1).max(10).optional(),
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

      // Verify both customers belong to user
      const customers = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.userId, userId),
            inArray(customerProfiles.id, [
              input.customerProfileId,
              input.relatedCustomerProfileId,
            ])
          )
        );

      if (customers.length !== 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Both customer profiles must exist and belong to user",
        });
      }

      if (input.customerProfileId === input.relatedCustomerProfileId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Customer cannot have relationship with itself",
        });
      }

      const [relationship] = await db
        .insert(customerRelationships)
        .values({
          userId,
          customerProfileId: input.customerProfileId,
          relatedCustomerProfileId: input.relatedCustomerProfileId,
          relationshipType: input.relationshipType,
          description: input.description ?? null,
          strength: input.strength ?? null,
        })
        .returning();

      return relationship;
    }),

  /**
   * Get relationships for a customer
   */
  getRelationships: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number(),
        relationshipType: z.string().optional(),
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

      // Verify customer belongs to user
      const [customer] = await db
        .select()
        .from(customerProfiles)
        .where(
          and(
            eq(customerProfiles.id, input.customerProfileId),
            eq(customerProfiles.userId, userId)
          )
        )
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      const conditions = [
        eq(customerRelationships.customerProfileId, input.customerProfileId),
        eq(customerRelationships.userId, userId),
      ];

      if (input.relationshipType) {
        conditions.push(eq(customerRelationships.relationshipType, input.relationshipType));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const relationships = await db
        .select({
          relationship: customerRelationships,
          relatedCustomer: customerProfiles,
        })
        .from(customerRelationships)
        .innerJoin(
          customerProfiles,
          eq(
            customerRelationships.relatedCustomerProfileId,
            customerProfiles.id
          )
        )
        .where(whereClause)
        .orderBy(desc(customerRelationships.createdAt));

      return relationships;
    }),

  /**
   * Delete a relationship
   */
  deleteRelationship: protectedProcedure
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

      // Verify ownership
      const [existing] = await db
        .select()
        .from(customerRelationships)
        .where(
          and(
            eq(customerRelationships.id, input.id),
            eq(customerRelationships.userId, userId)
          )
        )
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Relationship not found",
        });
      }

      await db
        .delete(customerRelationships)
        .where(eq(customerRelationships.id, input.id));

      return { success: true };
    }),
});
