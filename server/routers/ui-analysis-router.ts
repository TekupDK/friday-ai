/**
 * UI Analysis Router
 * AI-powered analysis of UI designs and user experience
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { analyzeUIWithAI } from "../modules/ui-analysis";

export const uiAnalysisRouter = router({
  /**
   * Analyze UI design concepts with AI
   */
  analyzeDesign: protectedProcedure
    .input(
      z.object({
        uiConcept: z.string(),
        context: z.string().optional(),
        targetAudience: z.string().optional(),
        model: z.string().optional(), // Specify which model to use
      })
    )
    .mutation(async ({ input }) => {
      const analysis = await analyzeUIWithAI({
        uiConcept: input.uiConcept,
        context: input.context,
        targetAudience: input.targetAudience,
        model: input.model,
      });

      return {
        analysis,
        timestamp: new Date(),
        model: input.model || "auto-selected",
      };
    }),

  /**
   * Compare multiple UI approaches
   */
  compareUIApproaches: protectedProcedure
    .input(
      z.object({
        approaches: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            targetUseCase: z.string().optional(),
          })
        ),
        criteria: z.array(z.string()).optional(), // e.g., ["usability", "accessibility", "performance"]
      })
    )
    .mutation(async ({ input }) => {
      const comparison = await analyzeUIWithAI({
        uiConcept: `Compare these UI approaches: ${input.approaches.map(a => `${a.name}: ${a.description}`).join("; ")}`,
        context: `Comparison criteria: ${input.criteria?.join(", ") || "usability, accessibility, performance, user experience"}`,
        targetAudience: "UI/UX designers and developers",
      });

      return {
        comparison,
        approaches: input.approaches,
        criteria: input.criteria,
        timestamp: new Date(),
      };
    }),

  /**
   * Get UI design recommendations for specific use cases
   */
  getUIDesignRecommendations: protectedProcedure
    .input(
      z.object({
        useCase: z.string(), // e.g., "CRM dashboard for cleaning company"
        constraints: z.array(z.string()).optional(),
        existingPatterns: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const recommendations = await analyzeUIWithAI({
        uiConcept: `Design recommendations for: ${input.useCase}`,
        context: `Constraints: ${input.constraints?.join(", ") || "none"}; Existing patterns: ${input.existingPatterns?.join(", ") || "none"}`,
        targetAudience: "UI designers and developers",
      });

      return {
        recommendations,
        useCase: input.useCase,
        constraints: input.constraints,
        existingPatterns: input.existingPatterns,
        timestamp: new Date(),
      };
    }),
});
