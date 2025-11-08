/**
 * Email Intelligence Router - TRPC API endpoints
 * Provides AI-powered email intelligence features
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  categorizeEmail,
  getCategoryStats,
  type EmailMessage,
} from "../email-intelligence/categorizer";
import {
  generateResponseSuggestions,
  generateQuickReplies,
} from "../email-intelligence/response-generator";
import {
  scorePriority,
  createSenderProfile,
} from "../email-intelligence/priority-scorer";
import { getDb } from "../db";
import { 
  emailCategoriesInFridayAi,
  emailPrioritiesInFridayAi,
  responseSuggestionsInFridayAi,
} from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const emailIntelligenceRouter = router({
  /**
   * Categorize an email thread
   */
  categorizeEmail: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        timestamp: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const email: EmailMessage = {
          id: input.threadId,
          from: input.from,
          to: input.to,
          subject: input.subject,
          body: input.body,
          timestamp: input.timestamp || new Date(),
        };

        // Categorize using AI
        const category = await categorizeEmail(email, ctx.user.id);

        // Save to database
        const db = await getDb();
        await db!.insert(emailCategoriesInFridayAi).values({
          threadId: input.threadId,
          category: category.category,
          subcategory: category.subcategory || null,
          confidence: category.confidence.toString(),
          reasoning: category.reasoning || null,
        });

        return category;
      } catch (error) {
        console.error('Error categorizing email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to categorize email',
        });
      }
    }),

  /**
   * Get category for a thread (from cache or generate new)
   */
  getEmailCategory: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      // Check if we have a recent categorization
      const cached = await db!
        .select()
        .from(emailCategoriesInFridayAi)
        .where(eq(emailCategoriesInFridayAi.threadId, input.threadId))
        .orderBy(desc(emailCategoriesInFridayAi.createdAt))
        .limit(1);

      if (cached.length > 0) {
        return {
          category: cached[0].category,
          subcategory: cached[0].subcategory,
          confidence: parseFloat(cached[0].confidence),
          reasoning: cached[0].reasoning,
          cached: true,
        };
      }

      return null;
    }),

  /**
   * Generate response suggestions for an email
   */
  generateResponses: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        senderRelationship: z
          .enum(['vip', 'customer', 'colleague', 'unknown'])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const email: EmailMessage = {
          id: input.threadId,
          from: input.from,
          to: input.to,
          subject: input.subject,
          body: input.body,
          timestamp: new Date(),
        };

        const context = input.senderRelationship
          ? { senderRelationship: input.senderRelationship }
          : undefined;

        // Generate suggestions using AI
        const suggestions = await generateResponseSuggestions(
          email,
          ctx.user.id,
          context
        );

        // Save to database
        const db = await getDb();
        await Promise.all(
          suggestions.map(suggestion =>
            db!.insert(responseSuggestionsInFridayAi).values({
              threadId: input.threadId,
              suggestionText: suggestion.text,
              suggestionType: suggestion.type,
              tone: suggestion.tone,
              confidence: suggestion.confidence.toString(),
              reasoning: suggestion.reasoning || null,
              used: false,
            })
          )
        );

        return suggestions;
      } catch (error) {
        console.error('Error generating responses:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate response suggestions',
        });
      }
    }),

  /**
   * Get response suggestions for a thread
   */
  getResponses: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const suggestions = await db!
        .select()
        .from(responseSuggestionsInFridayAi)
        .where(eq(responseSuggestionsInFridayAi.threadId, input.threadId))
        .orderBy(desc(responseSuggestionsInFridayAi.createdAt))
        .limit(5);

      return suggestions.map((s: any) => ({
        id: s.id.toString(),
        type: s.suggestionType,
        text: s.suggestionText,
        tone: s.tone,
        confidence: parseFloat(s.confidence),
        reasoning: s.reasoning,
        used: s.used,
      }));
    }),

  /**
   * Mark a suggestion as used
   */
  markSuggestionUsed: protectedProcedure
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db!
        .update(responseSuggestionsInFridayAi)
        .set({ used: true, usedAt: new Date().toISOString() })
        .where(eq(responseSuggestionsInFridayAi.id, input.suggestionId));

      return { success: true };
    }),

  /**
   * Score email priority
   */
  scorePriority: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const email: EmailMessage = {
          id: input.threadId,
          from: input.from,
          to: input.to,
          subject: input.subject,
          body: input.body,
          timestamp: new Date(),
        };

        // Score priority using AI
        const priority = await scorePriority(email, ctx.user.id);

        // Save to database
        const db = await getDb();
        await db!.insert(emailPrioritiesInFridayAi).values({
          threadId: input.threadId,
          priorityScore: priority.score,
          priorityLevel: priority.level,
          senderImportance: priority.factors.sender_importance.toString(),
          contentUrgency: priority.factors.content_urgency.toString(),
          deadlineMentioned: priority.factors.deadline_mentioned,
          requiresAction: priority.factors.requires_action,
          timeSensitive: priority.factors.time_sensitive,
          reasoning: priority.reasoning || null,
        });

        return priority;
      } catch (error) {
        console.error('Error scoring priority:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to score email priority',
        });
      }
    }),

  /**
   * Get priority for a thread
   */
  getEmailPriority: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      const cached = await db!
        .select()
        .from(emailPrioritiesInFridayAi)
        .where(eq(emailPrioritiesInFridayAi.threadId, input.threadId))
        .orderBy(desc(emailPrioritiesInFridayAi.createdAt))
        .limit(1);

      if (cached.length > 0) {
        const p = cached[0];
        return {
          score: p.priorityScore,
          level: p.priorityLevel,
          factors: {
            sender_importance: parseFloat(p.senderImportance || '0'),
            content_urgency: parseFloat(p.contentUrgency || '0'),
            deadline_mentioned: p.deadlineMentioned || false,
            requires_action: p.requiresAction || false,
            time_sensitive: p.timeSensitive || false,
          },
          reasoning: p.reasoning,
          cached: true,
        };
      }

      return null;
    }),

  /**
   * Get category statistics for user
   */
  getCategoryStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    
    // Get all categories for this user's emails
    const categories = await db!
      .select()
      .from(emailCategoriesInFridayAi)
      .orderBy(desc(emailCategoriesInFridayAi.createdAt))
      .limit(100);

    // Calculate distribution
    const distribution = {
      work: 0,
      personal: 0,
      finance: 0,
      marketing: 0,
      important: 0,
      other: 0,
    };

    let totalConfidence = 0;

    categories.forEach((cat: any) => {
      if (cat.category in distribution) {
        distribution[cat.category as keyof typeof distribution]++;
      }
      totalConfidence += parseFloat(cat.confidence);
    });

    return {
      distribution,
      total: categories.length,
      averageConfidence:
        categories.length > 0 ? totalConfidence / categories.length : 0,
    };
  }),

  /**
   * Get quick reply suggestions
   */
  getQuickReplies: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const email: EmailMessage = {
        id: input.threadId,
        from: input.from,
        to: input.to,
        subject: input.subject,
        body: input.body,
        timestamp: new Date(),
      };

      const quickReplies = await generateQuickReplies(email, ctx.user.id);
      return quickReplies;
    }),

  /**
   * Get batch intelligence data for multiple emails
   * Efficient endpoint for email list view
   */
  getBatchIntelligence: protectedProcedure
    .input(z.object({ 
      threadIds: z.array(z.string()).max(50) // Limit to 50 for performance
    }))
    .query(async ({ input }) => {
      if (input.threadIds.length === 0) {
        return {};
      }

      const db = await getDb();
      
      // Fetch all intelligence data in parallel
      const [categories, priorities] = await Promise.all([
        // Get categories for all threadIds
        db!
          .select()
          .from(emailCategoriesInFridayAi)
          .where(inArray(emailCategoriesInFridayAi.threadId, input.threadIds))
          .orderBy(desc(emailCategoriesInFridayAi.createdAt)),
        // Get priorities for all threadIds
        db!
          .select()
          .from(emailPrioritiesInFridayAi)
          .where(inArray(emailPrioritiesInFridayAi.threadId, input.threadIds))
          .orderBy(desc(emailPrioritiesInFridayAi.createdAt)),
      ]);

      // Build result map
      const result: Record<string, {
        category?: { category: string; subcategory: string | null; confidence: number };
        priority?: { level: string; score: number; reasoning: string | null };
      }> = {};

      // Group by threadId
      categories.forEach((cat: any) => {
        if (!result[cat.threadId]) result[cat.threadId] = {};
        result[cat.threadId].category = {
          category: cat.category,
          subcategory: cat.subcategory,
          confidence: parseFloat(cat.confidence),
        };
      });

      priorities.forEach((pri: any) => {
        if (!result[pri.threadId]) result[pri.threadId] = {};
        result[pri.threadId].priority = {
          level: pri.priorityLevel,
          score: pri.priorityScore,
          reasoning: pri.reasoning,
        };
      });

      return result;
    }),
});
