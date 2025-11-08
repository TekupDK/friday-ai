/**
 * Enhanced Chat Router with Streaming Support
 * Replaces direct OpenRouter calls with server-side routeAI
 */

import { protectedProcedure, router } from "../_core/trpc";
import { routeAI, type AIRouterOptions } from "../ai-router";
import { streamResponse } from "../_core/llm";
import { getFeatureFlags } from "../_core/feature-flags";
import { z } from "zod";
import { EventEmitter } from "events";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  pendingAction?: any;
}

export interface StreamingChatResponse {
  type: "start" | "chunk" | "complete" | "error" | "action";
  data: any;
}

export const chatStreamingRouter = router({
  // New streaming chat endpoint
  sendMessageStreaming: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string(),
      context: z.object({
        selectedEmails: z.array(z.string()).optional(),
        calendarEvents: z.array(z.any()).optional(),
        searchQuery: z.string().optional(),
        hasEmails: z.boolean().optional(),
        hasCalendar: z.boolean().optional(),
        hasInvoices: z.boolean().optional(),
        page: z.string().optional(),
        folder: z.string().optional(),
        viewMode: z.string().optional(),
        selectedThreads: z.array(z.string()).optional(),
        openThreadId: z.string().optional(),
        selectedLabels: z.array(z.string()).optional(),
        openDrafts: z.number().optional(),
        previewThreadId: z.string().optional(),
      }).optional(),
    }))
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
        console.error("Chat streaming error:", error);
        throw new Error(`Failed to process message: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Streaming endpoint using tRPC subscriptions (alternative)
  sendMessageStream: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string(),
      context: z.object({
        selectedEmails: z.array(z.string()).optional(),
        calendarEvents: z.array(z.any()).optional(),
        searchQuery: z.string().optional(),
        hasEmails: z.boolean().optional(),
        hasCalendar: z.boolean().optional(),
        hasInvoices: z.boolean().optional(),
      }).optional(),
    }))
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
            .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
            .map(([key, value]) => `${key.toUpperCase()}: ${JSON.stringify(value)}`)
            .join('\n');
          
          if (contextString) {
            messages.unshift({
              role: "system",
              content: `<CONTEXT>\n${contextString}\n</CONTEXT>`
            });
          }
        }

        // Stream response
        const stream = await streamResponse({
          model: "gemma-3-27b-free", // Will be enhanced with model routing
        });

        for await (const chunk of stream) {
          yield { type: "chunk", data: { content: chunk } };
        }

        yield { type: "complete", data: { message: "Response complete" } };
      } catch (error) {
        yield { 
          type: "error", 
          data: { error: error instanceof Error ? error.message : "Unknown error" } 
        };
      }
    }),

  // Get feature flags for current user
  getFeatureFlags: protectedProcedure
    .query(async ({ ctx }) => {
      return getFeatureFlags(ctx.user.id);
    }),
});
