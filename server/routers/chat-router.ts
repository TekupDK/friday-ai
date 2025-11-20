import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../_core/trpc";
import { generateCorrelationId } from "../action-audit";
import { routeAI } from "../modules/ai/ai-router";
import {
  createConversation,
  createMessage,
  deleteConversation,
  getConversation,
  getConversationMessages,
  getUserConversations,
  trackEvent,
} from "../db";
import { FRIDAY_TOOLS } from "../modules/ai/friday-tools";
import { checkRateLimitUnified } from "../rate-limiter-redis";
import { requireOwnership } from "../rbac";

/**
 * Chat Router
 *
 * Handles all chat-related operations:
 * - Conversation management (list, create, delete)
 * - Message management (get, send)
 * - AI integration for chat responses
 */
export const chatRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return getUserConversations(ctx.user.id);
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // ✅ SECURITY FIX: Verify conversation ownership
      const conversation = await getConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      requireOwnership(
        ctx.user.id,
        conversation.userId,
        "conversation",
        input.conversationId
      );

      const allMessages = await getConversationMessages(input.conversationId);

      // Simple pagination: slice messages based on limit
      const startIndex = input.cursor || 0;
      const endIndex = startIndex + input.limit + 1;
      const slicedMessages = allMessages.slice(startIndex, endIndex);

      const hasMore = slicedMessages.length > input.limit;
      const messages = hasMore
        ? slicedMessages.slice(0, input.limit)
        : slicedMessages;

      return {
        messages,
        hasMore,
        nextCursor: hasMore ? endIndex - 1 : undefined,
      };
    }),

  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().max(255).optional(), // ✅ SECURITY FIX: Added max length
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createConversation({
        userId: ctx.user.id,
        title: input.title,
      });
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().int().positive(),
        content: z
          .string()
          .min(1, "Message cannot be empty")
          .max(5000, "Message too long (max 5,000 characters)") // ✅ SECURITY FIX: Reduced from 10,000
          .refine(
            val => val.trim().length > 0,
            "Message cannot be only whitespace"
          ),
        model: z.string().max(100).optional(), // ✅ SECURITY FIX: Added max length
        context: z
          .object({
            selectedEmails: z.array(z.string().max(100)).max(50).optional(), // ✅ SECURITY FIX: Limit array size and string length
            calendarEvents: z.array(z.any()).max(100).optional(), // ✅ SECURITY FIX: Limit array size
            searchQuery: z.string().max(500).optional(), // ✅ SECURITY FIX: Added max length
            hasEmails: z.boolean().optional(),
            hasCalendar: z.boolean().optional(),
            hasInvoices: z.boolean().optional(),
            page: z.string().max(100).optional(), // ✅ SECURITY FIX: Added max length
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const correlationId = generateCorrelationId();
      console.log("[DEBUG] [Chat] [sendMessage]: Entry", {
        userId: ctx.user.id,
        conversationId: input.conversationId,
        messageLength: input.content.length,
        hasContext: !!input.context,
        contextKeys: input.context ? Object.keys(input.context) : [],
        correlationId,
      });

      // ✅ SECURITY FIX: Verify conversation ownership
      console.log(
        "[DEBUG] [Chat] [sendMessage]: Checking conversation ownership",
        {
          conversationId: input.conversationId,
          userId: ctx.user.id,
        }
      );
      const conversation = await getConversation(input.conversationId);
      if (!conversation) {
        console.warn("[WARN] [Chat] [sendMessage]: Conversation not found", {
          conversationId: input.conversationId,
          userId: ctx.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      requireOwnership(
        ctx.user.id,
        conversation.userId,
        "conversation",
        input.conversationId
      );
      console.log("[DEBUG] [Chat] [sendMessage]: Ownership verified", {
        conversationId: input.conversationId,
      });

      // Rate limiting: 10 messages per minute (Redis-based)
      console.log("[DEBUG] [Chat] [sendMessage]: Checking rate limit", {
        userId: ctx.user.id,
      });
      const rateLimit = await checkRateLimitUnified(ctx.user.id, {
        limit: 10,
        windowMs: 60000, // 1 minute
      });

      if (!rateLimit.success) {
        console.warn("[WARN] [Chat] [sendMessage]: Rate limit exceeded", {
          userId: ctx.user.id,
          resetIn: Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000),
        });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)}s before sending more messages.`,
        });
      }
      console.log("[DEBUG] [Chat] [sendMessage]: Rate limit check passed", {
        userId: ctx.user.id,
      });

      const startTime = Date.now();

      // Save user message
      console.log("[DEBUG] [Chat] [sendMessage]: Saving user message", {
        conversationId: input.conversationId,
      });
      const message = await createMessage({
        conversationId: input.conversationId,
        content: input.content,
        role: "user",
      });
      console.log("[DEBUG] [Chat] [sendMessage]: User message saved", {
        messageId: message.id,
        conversationId: input.conversationId,
      });

      // Track message sent
      await trackEvent({
        userId: ctx.user.id,
        eventType: "chat_message_sent",
        eventData: {
          conversationId: input.conversationId,
          messageLength: input.content.length,
          hasContext: !!input.context,
          contextKeys: input.context ? Object.keys(input.context) : [],
        },
      });

      // Load conversation history for context
      console.log(
        "[DEBUG] [Chat] [sendMessage]: Loading conversation history",
        {
          conversationId: input.conversationId,
        }
      );
      const conversationHistory = await getConversationMessages(
        input.conversationId
      );
      console.log("[DEBUG] [Chat] [sendMessage]: Conversation history loaded", {
        conversationId: input.conversationId,
        messageCount: conversationHistory.length,
      });

      // Format messages for AI (include full conversation history)
      const messages = conversationHistory.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Generate AI response with full conversation context, tools, and email context
      console.log("[DEBUG] [Chat] [sendMessage]: Calling AI router", {
        conversationId: input.conversationId,
        messageCount: messages.length,
        hasTools: !!FRIDAY_TOOLS,
        toolCount: FRIDAY_TOOLS.length,
        correlationId,
      });
      const aiResponse = await routeAI({
        messages,
        taskType: "chat",
        userId: ctx.user.id,
        requireApproval: false,
        correlationId,
        tools: FRIDAY_TOOLS, // Enable function calling
        context: input.context, // Pass email/calendar context to AI
      });
      console.log("[INFO] [Chat] [sendMessage]: AI response received", {
        conversationId: input.conversationId,
        model: aiResponse.model,
        responseLength: aiResponse.content.length,
        hasPendingAction: !!aiResponse.pendingAction,
        correlationId,
      });

      // Save AI response
      console.log("[DEBUG] [Chat] [sendMessage]: Saving AI response", {
        conversationId: input.conversationId,
      });
      await createMessage({
        conversationId: input.conversationId,
        content: aiResponse.content,
        role: "assistant",
      });
      console.log("[DEBUG] [Chat] [sendMessage]: AI response saved", {
        conversationId: input.conversationId,
      });

      // Track AI response
      const duration = Date.now() - startTime;
      await trackEvent({
        userId: ctx.user.id,
        eventType: "chat_ai_response",
        eventData: {
          conversationId: input.conversationId,
          responseTime: duration,
          model: aiResponse.model || "gemma-3-27b",
          messageLength: aiResponse.content.length,
          toolsAvailable: FRIDAY_TOOLS.length,
        },
      });

      console.log("[DEBUG] [Chat] [sendMessage]: Complete", {
        conversationId: input.conversationId,
        duration,
        correlationId,
      });

      return message;
    }),

  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // ✅ SECURITY FIX: Verify conversation ownership
      const conversation = await getConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      requireOwnership(
        ctx.user.id,
        conversation.userId,
        "conversation",
        input.conversationId
      );

      await deleteConversation(input.conversationId);
      return { success: true };
    }),
});
