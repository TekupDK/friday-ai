import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";

import { attachments, emails, emailThreads } from "../../../drizzle/schema";
import { logger } from "../../_core/logger";
import {
  permissionProcedure,
  protectedProcedure,
  rateLimitedProcedure,
  router,
} from "../../_core/trpc";
import { validationSchemas } from "../../_core/validation";
import { searchCustomerByEmail } from "../../billy";
import { createOrUpdateCustomerProfile } from "../../customer-db";
import {
  getDb,
  getPipelineState,
  getPipelineTransitions,
  getUserPipelineStates,
  trackEvent,
  updatePipelineStage,
} from "../../db";
import {
  addLabelToThread,
  archiveThread,
  getGmailLabels,
  removeLabelFromThread,
} from "../../gmail-labels";
import {
  getGmailThread,
  markGmailMessageAsRead as googleMarkAsRead,
  starGmailMessage as googleStarMessage,
  listCalendarEvents,
  modifyGmailThread,
  searchGmailThreads,
  sendGmailMessage,
} from "../../google-api";
import { createLead, getUserLeads } from "../../lead-db";
import {
  createRateLimitMiddleware,
  INBOX_CRM_RATE_LIMIT,
} from "../../rate-limit-middleware";

export const emailRouter = router({
  // Map Gmail thread IDs to internal email IDs for current user
  mapThreadsToEmailIds: protectedProcedure
    .input(
      z.object({
        threadIds: z.array(z.string().max(100)).min(1).max(100), // ✅ SECURITY: Limit array size and string length
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [] as number[];

      // Prefer direct mapping via emails.threadId (Gmail thread id)
      const rows = await db
        .select({ id: emails.id })
        .from(emails)
        .where(
          and(
            eq(emails.userId, ctx.user.id),
            inArray(emails.threadId, input.threadIds)
          )
        )
        .execute();

      // Return unique email IDs
      const unique = Array.from(
        new Set(rows.map(r => r.id as unknown as number))
      );
      return unique;
    }),
  list: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().optional(),
        query: z.string().max(500).optional(), // ✅ SECURITY: Max length to prevent DoS
      })
    )
    .query(async ({ ctx, input }) => {
      // SKIP DATABASE CACHE when query includes Gmail-specific filters (in:inbox, label:, etc.)
      // Database doesn't store Gmail labels/folders, so we can't filter correctly
      const hasGmailQuery =
        input.query &&
        (input.query.includes("in:") ||
          input.query.includes("label:") ||
          input.query.includes("is:") ||
          input.query.includes("-in:"));

      // DATABASE-FIRST STRATEGY: Try database first, only fallback if empty
      // BUT: Skip database if query has Gmail-specific filters
      const db = await getDb();
      if (db && !hasGmailQuery) {
        try {
          // Query from database (simple implementation - can be enhanced with full search)
          const emailRecords = await db
            .select({
              id: emails.id,
              userId: emails.userId,
              gmailId: emails.gmailId,
              threadKey: emails.threadKey,
              subject: emails.subject,
              fromEmail: emails.fromEmail,
              toEmail: emails.toEmail,
              text: emails.text,
              html: emails.html,
              providerId: emails.providerId,
              emailThreadId: emails.emailThreadId,
              receivedAt: emails.receivedAt,
              hasAttachments: emails.hasAttachments,
              // AI fields for preloading
              aiSummary: emails.aiSummary,
              aiSummaryGeneratedAt: emails.aiSummaryGeneratedAt,
              aiLabelSuggestions: emails.aiLabelSuggestions,
              aiLabelsGeneratedAt: emails.aiLabelsGeneratedAt,
            })
            .from(emails)
            .where(eq(emails.userId, ctx.user.id))
            .orderBy(desc(emails.receivedAt))
            .limit(input.maxResults || 50)
            .execute();

          if (emailRecords.length > 0) {
            // Join emails -> emailThreads to get real Gmail thread IDs
            const emailThreadIds = Array.from(
              new Set(
                emailRecords
                  .map((e: any) => e.emailThreadId)
                  .filter((id: any) => id != null)
              )
            );

            let threadIdMap: Record<number, string> = {};
            if (emailThreadIds.length > 0) {
              const threadRows = await db
                .select({
                  id: emailThreads.id,
                  gmailThreadId: emailThreads.gmailThreadId,
                })
                .from(emailThreads)
                .where(inArray(emailThreads.id, emailThreadIds))
                .execute();
              threadIdMap = Object.fromEntries(
                threadRows.map((r: any) => [r.id, r.gmailThreadId])
              );
            }

            // Map DB rows to GmailThread shape, using gmailThreadId when available
            return emailRecords.map((email: any) => {
              const gmailThreadId =
                (email.emailThreadId != null
                  ? threadIdMap[email.emailThreadId]
                  : undefined) ||
                email.threadKey ||
                undefined;

              const threadId =
                gmailThreadId ||
                String(email.emailThreadId || email.providerId);

              return {
                id: threadId, // Real Gmail thread ID if available
                snippet: email.text?.substring(0, 200) || email.subject || "",
                subject: email.subject,
                from: email.fromEmail,
                date:
                  typeof email.receivedAt === "string"
                    ? email.receivedAt
                    : new Date(email.receivedAt as any).toISOString(),
                labels: [],
                unread: true,
                hasAttachments: !!email.hasAttachments,
                // AI data preloaded from DB
                aiSummary: email.aiSummary || undefined,
                aiSummaryGeneratedAt: email.aiSummaryGeneratedAt || undefined,
                aiLabelSuggestions: email.aiLabelSuggestions || undefined,
                aiLabelsGeneratedAt: email.aiLabelsGeneratedAt || undefined,
                messages: [
                  {
                    id: email.providerId, // message id
                    threadId, // ensure messages reference the correct Gmail thread id
                    from: email.fromEmail,
                    to: email.toEmail,
                    subject: email.subject || "",
                    body: email.text || email.html || "",
                    date:
                      typeof email.receivedAt === "string"
                        ? email.receivedAt
                        : new Date(email.receivedAt as any).toISOString(),
                  },
                ],
              };
            });
          }

          // Database is empty - fetch from Gmail API and cache to database
          logger.info(
            "[Email List] Database empty, fetching from Gmail API and caching..."
          );
        } catch (error) {
          logger.warn(
            { err: error },
            "[Email List] Database query failed, falling back to Gmail API"
          );
        }
      } else if (hasGmailQuery) {
        logger.info(
          "[Email List] Query has Gmail filters (in:/label:/is:), skipping database cache and using Gmail API directly"
        );
      }

      // Fallback to Gmail API (direkte Google API, ikke MCP)
      const { searchGmailThreads } = await import("../../google-api");
      let threads;
      try {
        threads = await searchGmailThreads({
          query: input.query || "in:inbox",
          maxResults: input.maxResults || 20,
        });
      } catch (error: any) {
        logger.error({ err: error }, "[Email List] Gmail API error");
        // Provide helpful error message instead of raw error
        const isRateLimit =
          error?.message?.includes("429") ||
          error?.message?.includes("rate limit");
        const isAuthError =
          error?.message?.includes("401") ||
          error?.message?.includes("403") ||
          error?.message?.includes("authentication");

        if (isRateLimit) {
          throw new Error(
            "Gmail API rate limit nået. Prøv igen om et øjeblik."
          );
        } else if (isAuthError) {
          throw new Error(
            "Gmail authentication fejl. Prøv at genindlæse siden."
          );
        } else {
          throw new Error(
            `Kunne ikke hente emails: ${error?.message || "Ukendt fejl"}`
          );
        }
      }

      // Cache to database in background (don't await to speed up response)
      if (db && threads.length > 0) {
        const { cacheEmailsToDatabase } = await import("../../email-cache");
        cacheEmailsToDatabase(threads, ctx.user.id, db).catch(error => {
          logger.error({ err: error }, "[Email List] Background cache failed");
        });
      }

      return threads;
    }),

  // Paginated list endpoint for infinite scroll
  listPaged: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().optional(),
        query: z.string().max(500).optional(), // ✅ SECURITY: Max length to prevent DoS
        pageToken: z.string().max(500).optional(), // ✅ SECURITY: Max length to prevent DoS
      })
    )
    .query(async ({ ctx, input }) => {
      const hasGmailQuery =
        input.query &&
        (input.query.includes("in:") ||
          input.query.includes("label:") ||
          input.query.includes("is:") ||
          input.query.includes("-in:"));

      // If first page and no Gmail-specific filters, try DB first
      if (!input.pageToken && !hasGmailQuery) {
        const db = await getDb();
        if (db) {
          try {
            const emailRecords = await db
              .select({
                id: emails.id,
                userId: emails.userId,
                gmailId: emails.gmailId,
                threadKey: emails.threadKey,
                subject: emails.subject,
                fromEmail: emails.fromEmail,
                toEmail: emails.toEmail,
                text: emails.text,
                html: emails.html,
                providerId: emails.providerId,
                emailThreadId: emails.emailThreadId,
                receivedAt: emails.receivedAt,
                hasAttachments: emails.hasAttachments,
                aiSummary: emails.aiSummary,
                aiSummaryGeneratedAt: emails.aiSummaryGeneratedAt,
                aiLabelSuggestions: emails.aiLabelSuggestions,
                aiLabelsGeneratedAt: emails.aiLabelsGeneratedAt,
              })
              .from(emails)
              .where(eq(emails.userId, ctx.user.id))
              .orderBy(desc(emails.receivedAt))
              .limit(input.maxResults || 25)
              .execute();

            if (emailRecords.length > 0) {
              const emailThreadIds = Array.from(
                new Set(
                  emailRecords
                    .map((e: any) => e.emailThreadId)
                    .filter((id: any) => id != null)
                )
              );

              let threadIdMap: Record<number, string> = {};
              if (emailThreadIds.length > 0) {
                const threadRows = await db
                  .select({
                    id: emailThreads.id,
                    gmailThreadId: emailThreads.gmailThreadId,
                  })
                  .from(emailThreads)
                  .where(inArray(emailThreads.id, emailThreadIds))
                  .execute();
                threadIdMap = Object.fromEntries(
                  threadRows.map((r: any) => [r.id, r.gmailThreadId])
                );
              }

              const threads = emailRecords.map((email: any) => {
                const gmailThreadId =
                  (email.emailThreadId != null
                    ? threadIdMap[email.emailThreadId]
                    : undefined) ||
                  email.threadKey ||
                  undefined;
                const threadId =
                  gmailThreadId ||
                  String(email.emailThreadId || email.providerId);

                return {
                  id: threadId,
                  snippet: email.text?.substring(0, 200) || email.subject || "",
                  subject: email.subject,
                  from: email.fromEmail,
                  date:
                    typeof email.receivedAt === "string"
                      ? email.receivedAt
                      : new Date(email.receivedAt as any).toISOString(),
                  labels: [],
                  unread: true,
                  hasAttachments: !!email.hasAttachments,
                  aiSummary: email.aiSummary || undefined,
                  aiSummaryGeneratedAt: email.aiSummaryGeneratedAt || undefined,
                  aiLabelSuggestions: email.aiLabelSuggestions || undefined,
                  aiLabelsGeneratedAt: email.aiLabelsGeneratedAt || undefined,
                  messages: [
                    {
                      id: email.providerId,
                      threadId,
                      from: email.fromEmail,
                      to: email.toEmail,
                      subject: email.subject || "",
                      body: email.text || email.html || "",
                      date:
                        typeof email.receivedAt === "string"
                          ? email.receivedAt
                          : new Date(email.receivedAt as any).toISOString(),
                    },
                  ],
                } as any;
              });

              return {
                threads,
                nextPageToken: undefined as string | undefined,
              };
            }
          } catch (error) {
            logger.warn(
              { err: error },
              "[Email ListPaged] DB path failed, using Gmail API"
            );
          }
        }
      }

      // Gmail paginated API
      const { searchGmailThreadsPaged } = await import("../../google-api");
      const result = await searchGmailThreadsPaged({
        query: input.query || "in:inbox",
        maxResults: input.maxResults || 25,
        pageToken: input.pageToken,
      });
      return result;
    }),
  get: protectedProcedure
    .input(z.object({ threadId: validationSchemas.threadId }))
    .query(async ({ input }) => getGmailThread(input.threadId)),
  getThread: protectedProcedure
    .input(z.object({ threadId: validationSchemas.threadId }))
    .query(async ({ input }) => getGmailThread(input.threadId)),
  search: protectedProcedure
    .input(z.object({ query: validationSchemas.searchQuery }))
    .query(async ({ input }) =>
      searchGmailThreads({ query: input.query, maxResults: 50 })
    ),
  createDraft: protectedProcedure
    .input(
      z.object({
        to: validationSchemas.emailAddressList,
        subject: validationSchemas.subject,
        body: validationSchemas.body,
        cc: validationSchemas.emailAddressList.optional(),
        bcc: validationSchemas.emailAddressList.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { createGmailDraft } = await import("../../google-api");
      return createGmailDraft(input);
    }),
  send: protectedProcedure
    .input(
      z.object({
        to: validationSchemas.emailAddressList,
        subject: validationSchemas.subject,
        body: validationSchemas.body,
        cc: validationSchemas.emailAddressList.optional(),
        bcc: validationSchemas.emailAddressList.optional(),
        replyToMessageId: validationSchemas.messageId.optional(),
        replyToThreadId: validationSchemas.threadId.optional(),
      })
    )
    .mutation(async ({ input }) => sendGmailMessage(input)),
  reply: protectedProcedure
    .input(
      z.object({
        threadId: validationSchemas.threadId,
        messageId: validationSchemas.messageId,
        to: validationSchemas.emailAddressList,
        subject: validationSchemas.subject,
        body: validationSchemas.body,
        cc: validationSchemas.emailAddressList.optional(),
        bcc: validationSchemas.emailAddressList.optional(),
      })
    )
    .mutation(async ({ input }) =>
      sendGmailMessage({
        to: input.to,
        subject: input.subject.startsWith("Re:")
          ? input.subject
          : `Re: ${input.subject}`,
        body: input.body,
        cc: input.cc,
        bcc: input.bcc,
        replyToMessageId: input.messageId,
        replyToThreadId: input.threadId,
      })
    ),
  forward: protectedProcedure
    .input(
      z.object({
        to: validationSchemas.emailAddressList,
        subject: validationSchemas.subject,
        body: validationSchemas.body,
        cc: validationSchemas.emailAddressList.optional(),
        bcc: validationSchemas.emailAddressList.optional(),
      })
    )
    .mutation(async ({ input }) =>
      sendGmailMessage({
        to: input.to,
        subject: input.subject.startsWith("Fwd:")
          ? input.subject
          : `Fwd: ${input.subject}`,
        body: input.body,
        cc: input.cc,
        bcc: input.bcc,
      })
    ),
  archive: rateLimitedProcedure
    .input(z.object({ threadId: validationSchemas.threadId }))
    .mutation(async ({ input }) => {
      await archiveThread(input.threadId);
      return { success: true };
    }),
  delete: rateLimitedProcedure
    .input(z.object({ threadId: validationSchemas.threadId }))
    .mutation(async ({ input }) => {
      // Safer default: move to TRASH instead of permanent delete
      // Some environments/scopes block permanent delete with 403
      await modifyGmailThread({
        threadId: input.threadId,
        addLabelIds: ["TRASH"],
      });
      return { success: true, trashed: true } as const;
    }),
  addLabel: rateLimitedProcedure
    .input(
      z.object({
        threadId: validationSchemas.threadId,
        labelName: validationSchemas.labelName,
      })
    )
    .mutation(async ({ input }) => {
      await addLabelToThread(input.threadId, input.labelName);
      return { success: true };
    }),
  removeLabel: rateLimitedProcedure
    .input(
      z.object({
        threadId: validationSchemas.threadId,
        labelName: validationSchemas.labelName,
      })
    )
    .mutation(async ({ input }) => {
      await removeLabelFromThread(input.threadId, input.labelName);
      return { success: true };
    }),
  star: rateLimitedProcedure
    .input(z.object({ messageId: validationSchemas.messageId }))
    .mutation(async ({ input }) => {
      await googleStarMessage(input.messageId, true);
      return { success: true };
    }),
  unstar: rateLimitedProcedure
    .input(z.object({ messageId: validationSchemas.messageId }))
    .mutation(async ({ input }) => {
      await googleStarMessage(input.messageId, false);
      return { success: true };
    }),
  markAsRead: rateLimitedProcedure
    .input(z.object({ messageId: validationSchemas.messageId }))
    .mutation(async ({ input }) => {
      await googleMarkAsRead(input.messageId, true);
      return { success: true };
    }),
  markAsUnread: rateLimitedProcedure
    .input(z.object({ messageId: validationSchemas.messageId }))
    .mutation(async ({ input }) => {
      await googleMarkAsRead(input.messageId, false);
      return { success: true };
    }),
  // Bulk operations
  bulkMarkAsRead: rateLimitedProcedure
    .input(
      z.object({
        threadIds: z.array(validationSchemas.threadId).min(1).max(100), // ✅ SECURITY: Limit batch size
      })
    )
    .mutation(async ({ input }) => {
      logger.info(
        { threadCount: input.threadIds.length },
        "[Bulk Email] Marking threads as read"
      );

      const results = await Promise.allSettled(
        input.threadIds.map(threadId =>
          modifyGmailThread({
            threadId,
            removeLabelIds: ["UNREAD"],
          })
        )
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      logger.info(
        { successful, failed, total: input.threadIds.length },
        "[Bulk Email] Mark as read completed"
      );

      return {
        success: true,
        processed: successful,
        failed,
        total: input.threadIds.length,
      };
    }),
  bulkMarkAsUnread: rateLimitedProcedure
    .input(
      z.object({
        threadIds: z.array(validationSchemas.threadId).min(1).max(100), // ✅ SECURITY: Limit batch size
      })
    )
    .mutation(async ({ input }) => {
      logger.info(
        { threadCount: input.threadIds.length },
        "[Bulk Email] Marking threads as unread"
      );

      const results = await Promise.allSettled(
        input.threadIds.map(threadId =>
          modifyGmailThread({
            threadId,
            addLabelIds: ["UNREAD"],
          })
        )
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      logger.info(
        { successful, failed, total: input.threadIds.length },
        "[Bulk Email] Mark as unread completed"
      );

      return {
        success: true,
        processed: successful,
        failed,
        total: input.threadIds.length,
      };
    }),
  bulkArchive: rateLimitedProcedure
    .input(
      z.object({
        threadIds: z.array(validationSchemas.threadId).min(1).max(100), // ✅ SECURITY: Limit batch size
      })
    )
    .mutation(async ({ input }) => {
      logger.info(
        { threadCount: input.threadIds.length },
        "[Bulk Email] Archiving threads"
      );

      const results = await Promise.allSettled(
        input.threadIds.map(threadId => archiveThread(threadId))
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      logger.info(
        { successful, failed, total: input.threadIds.length },
        "[Bulk Email] Archive completed"
      );

      return {
        success: true,
        processed: successful,
        failed,
        total: input.threadIds.length,
      };
    }),
  bulkDelete: permissionProcedure("delete_email")
    .use(
      // ✅ RBAC: Add rate limiting on top of permission check (admin-only but still rate limited)
      createRateLimitMiddleware(INBOX_CRM_RATE_LIMIT, "email-delete")
    )
    .input(
      z.object({
        threadIds: z.array(validationSchemas.threadId).min(1).max(100), // ✅ SECURITY: Limit batch size
      })
    )
    .mutation(async ({ input }) => {
      logger.info(
        { threadCount: input.threadIds.length },
        "[Bulk Email] Deleting threads"
      );

      // Safer default: move to TRASH instead of permanent delete
      const results = await Promise.allSettled(
        input.threadIds.map(threadId =>
          modifyGmailThread({
            threadId,
            addLabelIds: ["TRASH"],
          })
        )
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      logger.info(
        { successful, failed, total: input.threadIds.length },
        "[Bulk Email] Delete completed"
      );

      return {
        success: true,
        processed: successful,
        failed,
        total: input.threadIds.length,
        trashed: true, // Indicates moved to trash, not permanently deleted
      };
    }),
  getLabels: protectedProcedure.query(async () => getGmailLabels()),
  getUnreadCounts: protectedProcedure.query(async () => {
    // Get unread counts for folders using Gmail API
    // We only need count, so maxResults=100 is sufficient for accurate counts
    const inboxUnread = await searchGmailThreads({
      query: "in:inbox is:unread",
      maxResults: 100,
    });
    const sentUnread = await searchGmailThreads({
      query: "in:sent is:unread",
      maxResults: 100,
    });
    const starredUnread = await searchGmailThreads({
      query: "is:starred is:unread",
      maxResults: 100,
    });

    // Get all labels with their unread counts
    const labels = await getGmailLabels();
    const labelCounts = await Promise.all(
      labels.map(async label => {
        const unreadThreads = await searchGmailThreads({
          query: `label:${label.name} is:unread`,
          maxResults: 100,
        });
        return {
          labelId: label.id,
          labelName: label.name,
          unreadCount: unreadThreads.length,
        };
      })
    );

    return {
      folders: {
        inbox: inboxUnread.length,
        sent: sentUnread.length,
        starred: starredUnread.length,
        archive: 0, // Archive doesn't have unread concept
      },
      labels: labelCounts,
    };
  }),
  listByLabel: protectedProcedure
    .input(
      z.object({
        labelName: z.string(),
        maxResults: z.number().optional(),
      })
    )
    .query(async ({ input }) =>
      searchGmailThreads({
        query: `label:${input.labelName}`,
        maxResults: input.maxResults || 20,
      })
    ),
  getRelatedLead: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        createIfMissing: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const leads = await getUserLeads(ctx.user.id);
      const existingLead = leads.find(
        lead => lead.email?.toLowerCase() === input.email.toLowerCase()
      );

      if (existingLead) {
        return existingLead;
      }

      // Create lead and customer profile if requested
      if (input.createIfMissing) {
        // Extract name from email (everything before @)
        const emailParts = input.email.split("@");
        const defaultName = emailParts[0]
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

        // Create lead
        const lead = await createLead({
          userId: ctx.user.id,
          source: "email",
          name: defaultName,
          email: input.email,
          status: "new",
        });

        // Create or update customer profile
        await createOrUpdateCustomerProfile({
          userId: ctx.user.id,
          leadId: lead.id,
          email: input.email,
          name: defaultName,
        });

        await trackEvent({
          userId: ctx.user.id,
          eventType: "lead_created_from_email",
          eventData: { leadId: lead.id, email: input.email },
        });

        return lead;
      }

      return null;
    }),
  getRelatedInvoices: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      // Use customer search to find invoices
      const customer = await searchCustomerByEmail(input.email);
      if (!customer) return [];
      // Get invoices for this customer - would need Billy API integration
      // For now, return empty array
      return [];
    }),
  getRelatedEvents: protectedProcedure
    .input(z.object({ email: z.string(), subject: z.string().optional() }))
    .query(async ({ input }) => {
      // Search calendar events - simplified: search by subject/keywords
      // In a full implementation, would search by participant email
      const events = await listCalendarEvents({
        maxResults: 50,
      });
      // Filter by subject keywords if provided
      if (input.subject) {
        const keywords = input.subject.toLowerCase().split(" ");
        return events.filter(event =>
          keywords.some(kw => event.summary?.toLowerCase().includes(kw))
        );
      }
      return events.slice(0, 10); // Return first 10
    }),
  // Resolve inline CID images to data URLs for rendering newsletters
  getAttachmentByCid: protectedProcedure
    .input(z.object({ messageId: z.string(), cid: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { getGmailAttachmentByCid } = await import("../../google-api");
      const res = await getGmailAttachmentByCid(input);
      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attachment not found",
        });
      }
      return res;
    }),
  // New endpoints for SMTP-based email ingestion
  getInboundEmails: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().optional().default(50),
        stage: z
          .enum([
            "needs_action",
            "venter_pa_svar",
            "i_kalender",
            "finance",
            "afsluttet",
          ])
          .optional(),
        source: z.string().optional(),
        customerId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        // Fallback to Gmail API if database not available
        return searchGmailThreads({
          query: "in:inbox",
          maxResults: input.maxResults,
        });
      }

      // Query emails from database
      let query = db
        .select()
        .from(emails)
        .where(eq(emails.userId, ctx.user.id))
        .orderBy(desc(emails.receivedAt))
        .limit(input.maxResults);

      // Apply filters
      const conditions = [];
      if (input.customerId) {
        conditions.push(eq(emails.customerId, input.customerId));
      }

      if (conditions.length > 0) {
        query = db
          .select()
          .from(emails)
          .where(and(eq(emails.userId, ctx.user.id), ...conditions))
          .orderBy(desc(emails.receivedAt))
          .limit(input.maxResults);
      }

      const emailRecords = await query.execute();

      // Transform to GmailThread-like format for compatibility
      return emailRecords.map(email => ({
        id: email.emailThreadId
          ? String(email.emailThreadId)
          : email.threadKey || email.providerId,
        snippet: email.text?.substring(0, 200) || email.subject || "",
        subject: email.subject,
        from: email.fromEmail,
        date:
          typeof email.receivedAt === "string"
            ? email.receivedAt
            : new Date(email.receivedAt as any).toISOString(),
        labels: [],
        unread: true,
        messages: [
          {
            id: email.providerId,
            threadId: email.emailThreadId
              ? String(email.emailThreadId)
              : email.threadKey || email.providerId,
            from: email.fromEmail,
            to: email.toEmail,
            subject: email.subject || "",
            body: email.text || email.html || "",
            date:
              typeof email.receivedAt === "string"
                ? email.receivedAt
                : new Date(email.receivedAt as any).toISOString(),
          },
        ],
      }));
    }),
  getEmailById: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const [email] = await db
        .select()
        .from(emails)
        .where(
          and(eq(emails.id, input.emailId), eq(emails.userId, ctx.user.id))
        )
        .limit(1)
        .execute();

      if (!email) {
        throw new Error("Email not found");
      }

      // Get attachments
      const emailAttachments = await db
        .select()
        .from(attachments)
        .where(eq(attachments.emailId, input.emailId))
        .execute();

      return {
        ...email,
        attachments: emailAttachments,
      };
    }),
  getEmailThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        // Fallback to Gmail API
        return getGmailThread(input.threadId);
      }

      // Try to find thread by gmailThreadId or threadKey
      const [thread] = await db
        .select()
        .from(emailThreads)
        .where(
          and(
            or(
              eq(emailThreads.gmailThreadId, input.threadId),
              eq(emailThreads.id, parseInt(input.threadId) || 0)
            ),
            eq(emailThreads.userId, ctx.user.id)
          )
        )
        .limit(1)
        .execute();

      if (!thread) {
        // Fallback to Gmail API if not found in database
        return getGmailThread(input.threadId);
      }

      // Get all emails in this thread
      const threadEmails = await db
        .select()
        .from(emails)
        .where(eq(emails.emailThreadId, thread.id))
        .orderBy(asc(emails.receivedAt))
        .execute();

      // Get attachments for all emails
      const emailIds = threadEmails.map(e => e.id);
      const allAttachments =
        emailIds.length > 0
          ? await db
              .select()
              .from(attachments)
              .where(inArray(attachments.emailId, emailIds))
              .execute()
          : [];

      return {
        id: thread.gmailThreadId,
        subject: thread.subject,
        snippet: thread.snippet,
        messages: threadEmails.map(email => ({
          id: email.providerId,
          threadId: thread.gmailThreadId,
          from: email.fromEmail,
          to: email.toEmail,
          subject: email.subject || "",
          body: email.text || email.html || "",
          date:
            typeof email.receivedAt === "string"
              ? email.receivedAt
              : new Date(email.receivedAt as any).toISOString(),
          attachments: allAttachments.filter(a => a.emailId === email.id),
        })),
        labels: (thread.labels as string[]) || [],
        unread: !thread.isRead,
      };
    }),
  createLeadFromEmail: rateLimitedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional().default("email"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if lead already exists
      const leads = await getUserLeads(ctx.user.id);
      const existingLead = leads.find(
        lead => lead.email?.toLowerCase() === input.email.toLowerCase()
      );

      if (existingLead) {
        return { lead: existingLead, created: false };
      }

      // Extract name from email if not provided
      const name =
        input.name ||
        (() => {
          const emailParts = input.email.split("@");
          return emailParts[0]
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
        })();

      // Create lead
      const lead = await createLead({
        userId: ctx.user.id,
        source: input.source,
        name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        status: "new",
      });

      // Create or update customer profile
      await createOrUpdateCustomerProfile({
        userId: ctx.user.id,
        leadId: lead.id,
        email: input.email,
        name,
        phone: input.phone,
      });

      await trackEvent({
        userId: ctx.user.id,
        eventType: "lead_created_from_email",
        eventData: {
          leadId: lead.id,
          email: input.email,
          source: input.source,
        },
      });

      return { lead, created: true };
    }),
  // Pipeline endpoints
  getPipelineState: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getPipelineState(ctx.user.id, input.threadId);
    }),
  updatePipelineStage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        stage: z.enum([
          "needs_action",
          "venter_pa_svar",
          "i_kalender",
          "finance",
          "afsluttet",
        ]),
        triggeredBy: z.string().optional().default("user"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const state = await updatePipelineStage(
        ctx.user.id,
        input.threadId,
        input.stage,
        input.triggeredBy || `user:${ctx.user.id}`
      );
      await trackEvent({
        userId: ctx.user.id,
        eventType: "pipeline_stage_updated",
        eventData: {
          threadId: input.threadId,
          stage: input.stage,
        },
      });
      return state;
    }),
  getPipelineTransitions: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getPipelineTransitions(ctx.user.id, input.threadId);
    }),
  getPipelineStates: protectedProcedure
    .input(
      z.object({
        stage: z
          .enum([
            "needs_action",
            "venter_pa_svar",
            "i_kalender",
            "finance",
            "afsluttet",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getUserPipelineStates(ctx.user.id, input.stage);
    }),
  // Follow-up Reminders Endpoints
  createFollowupReminder: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        emailId: z.number().optional(),
        reminderDate: z.string(), // ISO timestamp
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { createFollowupReminder } = await import(
        "../../email-intelligence/followup-reminders"
      );
      return createFollowupReminder(ctx.user.id, {
        threadId: input.threadId,
        emailId: input.emailId,
        reminderDate: input.reminderDate,
        priority: input.priority,
        notes: input.notes,
        autoCreated: false,
      });
    }),
  listFollowupReminders: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "completed", "cancelled", "overdue"])
          .optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { listFollowupReminders } = await import(
        "../../email-intelligence/followup-reminders"
      );
      return listFollowupReminders(ctx.user.id, {
        status: input.status,
        priority: input.priority,
        limit: input.limit,
      });
    }),
  markFollowupComplete: protectedProcedure
    .input(z.object({ followupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { markFollowupComplete } = await import(
        "../../email-intelligence/followup-reminders"
      );
      return markFollowupComplete(ctx.user.id, input.followupId);
    }),
  updateFollowupDate: protectedProcedure
    .input(
      z.object({
        followupId: z.number(),
        reminderDate: z.string(), // ISO timestamp
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { updateFollowupDate } = await import(
        "../../email-intelligence/followup-reminders"
      );
      return updateFollowupDate(
        ctx.user.id,
        input.followupId,
        input.reminderDate
      );
    }),
  cancelFollowup: protectedProcedure
    .input(z.object({ followupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { cancelFollowup } = await import(
        "../../email-intelligence/followup-reminders"
      );
      return cancelFollowup(ctx.user.id, input.followupId);
    }),
  // Ghostwriter Endpoints
  generateGhostwriterReply: protectedProcedure
    .input(
      z.object({
        threadId: z.string().min(1),
        subject: z.string(),
        from: z.string(),
        body: z.string(),
        previousMessages: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { generateGhostwriterReply } = await import(
        "../../email-intelligence/ghostwriter"
      );
      return generateGhostwriterReply(ctx.user.id, {
        threadId: input.threadId,
        subject: input.subject,
        from: input.from,
        body: input.body,
        previousMessages: input.previousMessages,
      });
    }),
  getWritingStyle: protectedProcedure.query(async ({ ctx }) => {
    const { getWritingStyle } = await import(
      "../../email-intelligence/ghostwriter"
    );
    return getWritingStyle(ctx.user.id);
  }),
  analyzeWritingStyle: protectedProcedure
    .input(z.object({ sampleSize: z.number().optional().default(20) }))
    .mutation(async ({ ctx, input }) => {
      const { analyzeWritingStyle } = await import(
        "../../email-intelligence/ghostwriter"
      );
      return analyzeWritingStyle(ctx.user.id, input.sampleSize);
    }),
  updateWritingStyleFromFeedback: protectedProcedure
    .input(
      z.object({
        originalSuggestion: z.string(),
        editedResponse: z.string(),
        threadId: z.string(),
        suggestionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { learnFromFeedback } = await import(
        "../../email-intelligence/ghostwriter"
      );
      await learnFromFeedback(ctx.user.id, {
        originalSuggestion: input.originalSuggestion,
        editedResponse: input.editedResponse,
        threadId: input.threadId,
        suggestionId: input.suggestionId,
      });
      return { success: true };
    }),
});
