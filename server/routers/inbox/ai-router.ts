import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { emailsInFridayAi } from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import {
  batchGenerateSummaries,
  getEmailSummary,
} from "../../ai-email-summary";
import {
  applyLabelSuggestion,
  autoApplyHighConfidenceLabels,
  batchGenerateLabelSuggestions,
  getEmailLabelSuggestions,
  type LabelCategory,
} from "../../ai-label-suggestions";
import { getDb } from "../../db";

export const aiRouter = router({
  // AI Features - Email Summaries
  getEmailSummary: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getEmailSummary(input.emailId, ctx.user.id);
    }),
  generateEmailSummary: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return getEmailSummary(input.emailId, ctx.user.id);
    }),
  batchGenerateSummaries: protectedProcedure
    .input(
      z.object({
        emailIds: z.array(z.number()),
        maxConcurrent: z.number().optional().default(5),
        skipCached: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return batchGenerateSummaries(input.emailIds, ctx.user.id, {
        maxConcurrent: input.maxConcurrent,
        skipCached: input.skipCached,
      });
    }),
  // AI Features - Smart Label Suggestions
  getLabelSuggestions: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getEmailLabelSuggestions(input.emailId, ctx.user.id);
    }),
  generateLabelSuggestions: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        autoApply: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await getEmailLabelSuggestions(input.emailId, ctx.user.id);

      // Auto-apply high-confidence labels if requested
      if (input.autoApply && result.suggestions.length > 0) {
        const appliedLabels = await autoApplyHighConfidenceLabels(
          input.emailId,
          ctx.user.id,
          result.suggestions
        );
        return {
          ...result,
          autoApplied: appliedLabels,
        };
      }

      return result;
    }),
  applyLabel: protectedProcedure
    .input(
      z.object({
        emailId: z.number(),
        label: z.enum(["Lead", "Booking", "Finance", "Support", "Newsletter"]),
        confidence: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return applyLabelSuggestion(
        input.emailId,
        ctx.user.id,
        input.label as LabelCategory,
        input.confidence
      );
    }),
  batchGenerateLabelSuggestions: protectedProcedure
    .input(
      z.object({
        emailIds: z.array(z.number()),
        maxConcurrent: z.number().optional().default(5),
        skipCached: z.boolean().optional().default(true),
        autoApply: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return batchGenerateLabelSuggestions(input.emailIds, ctx.user.id, {
        maxConcurrent: input.maxConcurrent,
        skipCached: input.skipCached,
        autoApply: input.autoApply,
      });
    }),
  // Batch remove DB-stored labels (undo support for auto-apply)
  batchRemoveDbLabels: protectedProcedure
    .input(
      z.object({
        ops: z.array(
          z.object({
            emailId: z.number(),
            label: z.enum([
              "Lead",
              "Booking",
              "Finance",
              "Support",
              "Newsletter",
            ]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      let removed = 0;
      const failures: Array<{
        emailId: number;
        label: string;
        error: string;
      }> = [];

      for (const op of input.ops) {
        try {
          const [email] = await db
            .select({
              id: emailsInFridayAi.id,
              labels: emailsInFridayAi.labels,
              userId: emailsInFridayAi.userId,
            })
            .from(emailsInFridayAi)
            .where(
              and(
                eq(emailsInFridayAi.id, op.emailId),
                eq(emailsInFridayAi.userId, ctx.user.id)
              )
            )
            .limit(1);

          if (!email) {
            failures.push({
              emailId: op.emailId,
              label: op.label,
              error: "Email not found",
            });
            continue;
          }

          const current = (email.labels || "")
            .split(",")
            .map(l => l.trim())
            .filter(Boolean);
          const next = current.filter(l => l !== op.label);

          // Only update if changed
          if (next.length !== current.length) {
            await db
              .update(emailsInFridayAi)
              .set({ labels: next.join(", ") })
              .where(eq(emailsInFridayAi.id, op.emailId));
            removed += 1;
          }
        } catch (e: any) {
          failures.push({
            emailId: op.emailId,
            label: op.label,
            error: e?.message || "Unknown error",
          });
        }
      }

      return {
        success: failures.length === 0,
        removed,
        failed: failures.length,
        failures,
      } as const;
    }),
});
