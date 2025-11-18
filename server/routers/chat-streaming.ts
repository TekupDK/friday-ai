/**
 * Enhanced Chat Router with Streaming Support
 * Replaces direct OpenRouter calls with server-side routeAI
 */

import { protectedProcedure, router } from "../_core/trpc";
import { routeAI, type AIRouterOptions, type PendingAction } from "../ai-router";
import { streamResponse } from "../_core/llm";
import { getFeatureFlags } from "../_core/feature-flags";
import { logger } from "../_core/logger";
import { z } from "zod";
import { EventEmitter } from "events";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  pendingAction?: PendingAction;
}

export interface StreamingChatResponse {
  type: "start" | "chunk" | "complete" | "error" | "action";
  data: string | { content?: string; pendingAction?: PendingAction; [key: string]: unknown };
}

export const chatStreamingRouter = router({
  // New streaming chat endpoint
  sendMessageStreaming: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(5000), // ✅ SECURITY: Max length to prevent DoS
        context: z
          .object({
            selectedEmails: z.array(z.string().max(100)).max(50).optional(), // ✅ SECURITY: Limit array and string length
            calendarEvents: z.array(z.any()).max(100).optional(), // ✅ SECURITY: Limit array size
            searchQuery: z.string().max(500).optional(), // ✅ SECURITY: Max length
            hasEmails: z.boolean().optional(),
            hasCalendar: z.boolean().optional(),
            hasInvoices: z.boolean().optional(),
            page: z.string().max(100).optional(), // ✅ SECURITY: Max length
            folder: z.string().max(100).optional(), // ✅ SECURITY: Max length
            viewMode: z.string().max(50).optional(), // ✅ SECURITY: Max length
            selectedThreads: z.array(z.string().max(100)).max(50).optional(), // ✅ SECURITY: Limit array and string length
            openThreadId: z.string().max(100).optional(), // ✅ SECURITY: Max length
            selectedLabels: z.array(z.string().max(100)).max(50).optional(), // ✅ SECURITY: Limit array and string length
            openDrafts: z.number().optional(),
            previewThreadId: z.string().max(100).optional(), // ✅ SECURITY: Max length
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const flags = getFeatureFlags(ctx.user.id);

      if (!flags.useServerSideChat) {
        throw new Error("Server-side chat is not enabled for this user");
      }

      try {
        // Route through AI router with full context
        const response = await routeAI({
          messages: [{ role: "user", content: input.content }],
          taskType: "chat",
          userId: ctx.user.id,
          requireApproval: true, // Enable approval flows
          context: input.context || {},
          correlationId: `chat-${ctx.user.id}-${Date.now()}`,
        });

        return {
          success: true,
          response: {
            content: response.content,
            model: response.model,
            usage: response.usage,
            pendingAction: response.pendingAction,
          },
        };
      } catch (error) {
        // ✅ SECURITY FIX: Use logger instead of console.error (redacts sensitive data)
        logger.error(
          { err: error },
          "[Chat Streaming] Failed to process message"
        );
        throw new Error(
          `Failed to process message: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // Streaming endpoint using tRPC subscriptions (alternative)
  sendMessageStream: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(5000), // ✅ SECURITY: Max length to prevent DoS
        context: z
          .object({
            selectedEmails: z.array(z.string().max(100)).max(50).optional(), // ✅ SECURITY: Limit array and string length
            calendarEvents: z.array(z.any()).max(100).optional(), // ✅ SECURITY: Limit array size
            searchQuery: z.string().max(500).optional(), // ✅ SECURITY: Max length
            hasEmails: z.boolean().optional(),
            hasCalendar: z.boolean().optional(),
            hasInvoices: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .subscription(async function* ({ ctx, input }) {
      const flags = getFeatureFlags(ctx.user.id);

      if (!flags.enableStreaming) {
        throw new Error("Streaming is not enabled for this user");
      }

      try {
        yield { type: "start", data: { message: "Starting response..." } };

        // Build messages with context
        const messages: any[] = [{ role: "user", content: input.content }];

        // Add context if provided
        if (input.context) {
          const contextString = Object.entries(input.context)
            .filter(
              ([_, value]) =>
                value && (Array.isArray(value) ? value.length > 0 : true)
            )
            .map(
              ([key, value]) => `${key.toUpperCase()}: ${JSON.stringify(value)}`
            )
            .join("\n");

          if (contextString) {
            messages.unshift({
              role: "system",
              content: `<CONTEXT>\n${contextString}\n</CONTEXT>`,
            });
          }
        }

        // Stream response
        const stream = await streamResponse(messages, {
          // model routing will be enhanced later
        });

        for await (const chunk of stream) {
          yield { type: "chunk", data: { content: chunk } };
        }

        yield { type: "complete", data: { message: "Response complete" } };
      } catch (error) {
        yield {
          type: "error",
          data: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    }),

  // Get feature flags for current user
  getFeatureFlags: protectedProcedure.query(async ({ ctx }) => {
    return getFeatureFlags(ctx.user.id);
  }),
});
