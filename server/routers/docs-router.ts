import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { documents, documentComments, documentChanges, documentConflicts } from "../../drizzle/schema";
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { logger } from "../_core/logger";
import { nanoid } from "nanoid";

/**
 * Documentation System Router
 * Provides CRUD operations, search, comments, and conflict resolution for docs
 */
export const docsRouter = router({
  // List all documents with optional filtering
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.category) {
        conditions.push(eq(documents.category, input.category));
      }
      if (input.author) {
        conditions.push(eq(documents.author, input.author));
      }
      if (input.search) {
        conditions.push(
          or(
            like(documents.title, `%${input.search}%`),
            like(documents.content, `%${input.search}%`)
          )!
        );
      }
      if (input.tags && input.tags.length > 0) {
        conditions.push(
          sql`${documents.tags}::jsonb ?| array[${sql.join(
            input.tags.map(tag => sql`${tag}`),
            sql`, `
          )}]`
        );
      }

      const results = await db
        .select()
        .from(documents)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(documents.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(documents)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        documents: results,
        total: total[0]?.count ?? 0,
      };
    }),

  // Get a single document by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);

      if (!doc[0]) {
        throw new Error("Document not found");
      }

      return doc[0];
    }),

  // Create a new document
  create: protectedProcedure
    .input(
      z.object({
        path: z.string(),
        title: z.string().min(1).max(255),
        content: z.string(),
        category: z.string(),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const id = nanoid();

      const doc = await db
        .insert(documents)
        .values({
          id,
          path: input.path,
          title: input.title,
          content: input.content,
          category: input.category,
          tags: input.tags,
          author: ctx.user.openId,
          version: 1,
        })
        .returning();

      // Log the change
      await db.insert(documentChanges).values({
        id: nanoid(),
        documentId: id,
        userId: ctx.user.openId,
        operation: "create",
        diff: `Created document: ${input.title}`,
      });

      logger.info(
        { documentId: id, userId: ctx.user.openId },
        "[Docs] Document created"
      );

      return doc[0];
    }),

  // Update an existing document
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      // Get current version
      const current = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (!current[0]) {
        throw new Error("Document not found");
      }

      // Update document and increment version
      const updated = await db
        .update(documents)
        .set({
          ...updates,
          version: current[0].version + 1,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(documents.id, id))
        .returning();

      // Log the change
      await db.insert(documentChanges).values({
        id: nanoid(),
        documentId: id,
        userId: ctx.user.openId,
        operation: "update",
        diff: JSON.stringify({ before: current[0], after: updated[0] }),
      });

      logger.info(
        { documentId: id, userId: ctx.user.openId },
        "[Docs] Document updated"
      );

      return updated[0];
    }),

  // Delete a document
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Get document before deletion for audit log
      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);

      if (!doc[0]) {
        throw new Error("Document not found");
      }

      await db.delete(documents).where(eq(documents.id, input.id));

      // Log the deletion
      await db.insert(documentChanges).values({
        id: nanoid(),
        documentId: input.id,
        userId: ctx.user.openId,
        operation: "delete",
        diff: JSON.stringify(doc[0]),
      });

      logger.info(
        { documentId: input.id, userId: ctx.user.openId },
        "[Docs] Document deleted"
      );

      return { success: true };
    }),

  // Get document history/changes
  history: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(documentChanges)
        .where(eq(documentChanges.documentId, input.documentId))
        .orderBy(desc(documentChanges.timestamp));
    }),

  // Add a comment to a document
  addComment: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        content: z.string().min(1),
        lineNumber: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const comment = await db
        .insert(documentComments)
        .values({
          id: nanoid(),
          documentId: input.documentId,
          userId: ctx.user.openId,
          content: input.content,
          lineNumber: input.lineNumber,
          resolved: false,
        })
        .returning();

      logger.info(
        { documentId: input.documentId, userId: ctx.user.openId },
        "[Docs] Comment added"
      );

      return comment[0];
    }),

  // Get comments for a document
  getComments: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(documentComments)
        .where(eq(documentComments.documentId, input.documentId))
        .orderBy(desc(documentComments.createdAt));
    }),

  // Resolve a comment
  resolveComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const updated = await db
        .update(documentComments)
        .set({
          resolved: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(documentComments.id, input.commentId))
        .returning();

      logger.info({ commentId: input.commentId }, "[Docs] Comment resolved");

      return updated[0];
    }),

  // Get all conflicts
  getConflicts: protectedProcedure.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(documentConflicts)
      .orderBy(desc(documentConflicts.createdAt));
  }),

  // Resolve a conflict
  resolveConflict: protectedProcedure
    .input(
      z.object({
        conflictId: z.string(),
        resolution: z.enum(["accept_local", "accept_remote", "manual"]),
        mergedContent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const updated = await db
        .update(documentConflicts)
        .set({
          resolution: input.resolution,
          mergedContent: input.mergedContent,
          resolvedAt: new Date().toISOString(),
          resolvedBy: ctx.user.openId,
        })
        .where(eq(documentConflicts.id, input.conflictId))
        .returning();

      logger.info(
        { conflictId: input.conflictId, resolution: input.resolution },
        "[Docs] Conflict resolved"
      );

      return updated[0];
    }),

  // Search with facets (categories, tags, authors)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.query) {
        conditions.push(
          or(
            like(documents.title, `%${input.query}%`),
            like(documents.content, `%${input.query}%`)
          )!
        );
      }
      if (input.category) {
        conditions.push(eq(documents.category, input.category));
      }
      if (input.author) {
        conditions.push(eq(documents.author, input.author));
      }
      if (input.tags && input.tags.length > 0) {
        conditions.push(
          sql`${documents.tags}::jsonb ?| array[${sql.join(
            input.tags.map(tag => sql`${tag}`),
            sql`, `
          )}]`
        );
      }

      const results = await db
        .select()
        .from(documents)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(documents.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(documents)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get facets (categories, tags, authors counts)
      const categoryFacets = await db
        .select({
          category: documents.category,
          count: sql<number>`count(*)::int`,
        })
        .from(documents)
        .groupBy(documents.category);

      const authorFacets = await db
        .select({
          author: documents.author,
          count: sql<number>`count(*)::int`,
        })
        .from(documents)
        .groupBy(documents.author);

      return {
        documents: results,
        total: total[0]?.count ?? 0,
        facets: {
          categories: Object.fromEntries(
            categoryFacets.map(f => [f.category, f.count])
          ),
          tags: {}, // TODO: Extract from JSONB
          authors: Object.fromEntries(
            authorFacets.map(f => [f.author, f.count])
          ),
        },
      };
    }),
});
