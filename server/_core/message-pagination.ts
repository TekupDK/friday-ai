/**
 * Enhanced Message Pagination System
 * Provides efficient message loading with cursor-based pagination
 */

import { and, eq, lt, gt, desc, count } from "drizzle-orm";

import { messagesInFridayAi } from "../../drizzle/schema";
import { getDb } from "../db";

export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface PaginatedMessages {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: number;
  prevCursor?: number;
  totalCount: number;
}

export interface PaginationOptions {
  cursor?: number;
  limit?: number;
  direction?: "before" | "after";
  includeTotal?: boolean;
}

/**
 * Get paginated messages for a conversation
 */
export async function getMessagesPaginated(
  conversationId: number,
  options: PaginationOptions = {}
): Promise<PaginatedMessages> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const {
    cursor,
    limit = 20,
    direction = "before",
    includeTotal = false,
  } = options;

  // Build where conditions
  const conditions = [eq(messagesInFridayAi.conversationId, conversationId)];

  // Add cursor filtering
  if (cursor) {
    if (direction === "before") {
      conditions.push(lt(messagesInFridayAi.id, cursor));
    } else {
      conditions.push(gt(messagesInFridayAi.id, cursor));
    }
  }

  // Build base query
  const baseQuery = db
    .select()
    .from(messagesInFridayAi)
    .where(and(...conditions));

  // Get messages in reverse order to check for more
  const rawMessages = await baseQuery
    .orderBy(desc(messagesInFridayAi.createdAt))
    .limit(limit + 1); // +1 to check if there are more

  // Reverse to get chronological order
  const messages = rawMessages.reverse();

  const hasMore = messages.length > limit;
  const actualMessages = hasMore ? messages.slice(0, limit) : messages;

  let totalCount = 0;
  if (includeTotal) {
    const countResult = await db
      .select({ count: count() })
      .from(messagesInFridayAi)
      .where(eq(messagesInFridayAi.conversationId, conversationId));

    totalCount = Number(countResult[0]?.count || 0);
  }

  return {
    messages: actualMessages,
    hasMore,
    nextCursor: hasMore
      ? actualMessages[actualMessages.length - 1]?.id
      : undefined,
    prevCursor: actualMessages[0]?.id,
    totalCount,
  };
}

/**
 * Get recent messages efficiently
 */
export async function getRecentMessages(
  conversationId: number,
  limit: number = 20
): Promise<Message[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messagesInFridayAi)
    .where(eq(messagesInFridayAi.conversationId, conversationId))
    .orderBy(desc(messagesInFridayAi.createdAt))
    .limit(limit);
}

/**
 * Get message count for a conversation
 */
export async function getMessageCount(conversationId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: count() })
    .from(messagesInFridayAi)
    .where(eq(messagesInFridayAi.conversationId, conversationId));

  return Number(result[0]?.count || 0);
}

/**
 * Database indexes for performance
 */
export const messageIndexes = {
  conversationId: "idx_messages_conversation_id",
  createdAt: "idx_messages_created_at",
  conversationCreated: "idx_messages_conversation_created",
};
