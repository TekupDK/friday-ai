import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { routeAI } from "./ai-router";
import { generateCorrelationId } from "./action-audit";
import { FRIDAY_TOOLS } from "./friday-tools";
import { TRPCError } from "@trpc/server";
import { checkRateLimitUnified } from "./rate-limiter-redis";
import { getCustomers, searchCustomerByEmail } from "./billy";
import { customerRouter } from "./customer-router";
import {
  createConversation,
  createMessage,
  deleteConversation,
  getConversation,
  getConversationMessages,
  getUserConversations,
  getUserPreferences,
  trackEvent,
  updateConversationTitle,
} from "./db";
import { getDb } from "./db";
import { executeAction } from "./intent-actions";
import { searchGmailThreads } from "./google-api";
import { inboxRouter } from "./routers/inbox-router";
import { automationRouter } from "./routers/automation-router";
import { authRouter } from './routers/auth-router';
import { workspaceRouter } from './routers/workspace-router';
import { chatStreamingRouter } from './routers/chat-streaming';
import { docsRouter } from './routers/docs-router';
import { aiMetricsRouter } from './routers/ai-metrics-router';
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  customer: customerRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  inbox: inboxRouter,
  docs: docsRouter,
  aiMetrics: aiMetricsRouter,
  chat: router({
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return getUserConversations(ctx.user.id);
    }),
    
    getMessages: protectedProcedure
      .input(z.object({ 
        conversationId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20)
      }))
      .query(async ({ ctx, input }) => {
        const allMessages = await getConversationMessages(input.conversationId);
        
        // Simple pagination: slice messages based on limit
        const startIndex = input.cursor || 0;
        const endIndex = startIndex + input.limit + 1;
        const slicedMessages = allMessages.slice(startIndex, endIndex);
        
        const hasMore = slicedMessages.length > input.limit;
        const messages = hasMore ? slicedMessages.slice(0, input.limit) : slicedMessages;
        
        return {
          messages,
          hasMore,
          nextCursor: hasMore ? endIndex - 1 : undefined
        };
      }),
    
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return createConversation({
          userId: ctx.user.id,
          title: input.title
        });
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({ 
        conversationId: z.number(), 
        content: z.string()
          .min(1, "Message cannot be empty")
          .max(10000, "Message too long (max 10,000 characters)"),
        model: z.string().optional(),
        context: z.object({
          selectedEmails: z.array(z.string()).optional(),
          calendarEvents: z.array(z.any()).optional(),
          searchQuery: z.string().optional(),
          hasEmails: z.boolean().optional(),
          hasCalendar: z.boolean().optional(),
          hasInvoices: z.boolean().optional(),
          page: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting: 10 messages per minute (Redis-based)
        const rateLimit = await checkRateLimitUnified(ctx.user.id, {
          limit: 10,
          windowMs: 60000, // 1 minute
        });
        
        if (!rateLimit.success) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)}s before sending more messages.`,
          });
        }
        
        const startTime = Date.now();
        
        // Save user message
        const message = await createMessage({
          conversationId: input.conversationId,
          content: input.content,
          role: "user"
        });
        
        // Track message sent
        await trackEvent({
          userId: ctx.user.id,
          eventType: 'chat_message_sent',
          eventData: {
            conversationId: input.conversationId,
            messageLength: input.content.length,
            hasContext: !!input.context,
            contextKeys: input.context ? Object.keys(input.context) : [],
          },
        });
        
        // Load conversation history for context
        const conversationHistory = await getConversationMessages(input.conversationId);
        
        // Format messages for AI (include full conversation history)
        const messages = conversationHistory.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        
        // Generate AI response with full conversation context, tools, and email context
        const aiResponse = await routeAI({
          messages,
          taskType: "chat",
          userId: ctx.user.id,
          requireApproval: false,
          correlationId: generateCorrelationId(),
          tools: FRIDAY_TOOLS, // Enable function calling
          context: input.context, // Pass email/calendar context to AI
        });
        
        // Save AI response
        await createMessage({
          conversationId: input.conversationId,
          content: aiResponse.content,
          role: "assistant"
        });
        
        // Track AI response
        const duration = Date.now() - startTime;
        await trackEvent({
          userId: ctx.user.id,
          eventType: 'chat_ai_response',
          eventData: {
            conversationId: input.conversationId,
            responseTime: duration,
            model: aiResponse.model || 'gemma-3-27b',
            messageLength: aiResponse.content.length,
            toolsAvailable: FRIDAY_TOOLS.length,
          },
        });
        
        return message;
      }),
    
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConversation(input.conversationId);
        return { success: true };
      }),
  }),
  
  friday: router({
    findRecentLeads: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ input }) => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - input.days);
        const query = `after:${daysAgo.toISOString().split("T")[0]}`;
        return searchGmailThreads({ query, maxResults: 100 });
      }),
    getCustomers: protectedProcedure.query(async () => getCustomers()),
    searchCustomer: protectedProcedure
      .input(z.object({ email: z.string() }))
      .query(async ({ input }) => searchCustomerByEmail(input.email)),
  }),

  automation: automationRouter,
  chatStreaming: chatStreamingRouter, // NEW: Enhanced chat with streaming and unified flow
});

export type AppRouter = typeof appRouter;