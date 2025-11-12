/**
 * AI Docs Generator - Data Collector
 *
 * Collects data from multiple sources:
 * - Leads from database
 * - Email threads from Gmail
 * - Calendar events
 * - Chat conversations
 */

import { getDb } from "../../db";
import { leads, emailThreads, conversations } from "../../../drizzle/schema";
import { eq, or, like, and, gte, sql } from "drizzle-orm";
// Calendar integration will be added when getCalendarClient is available
// import { getCalendarClient } from "../../google-api";
import { logger } from "../../_core/logger";

export interface LeadData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailThreadData {
  id: number;
  subject: string | null;
  snippet: string | null;
  participants: any;
  lastMessageAt: string | null;
  gmailThreadId: string;
}

export interface CalendarEventData {
  id: string;
  summary: string;
  description: string | null;
  start: string;
  end: string;
  attendees: string[];
}

export interface ChatMessageData {
  id: number;
  content: string;
  timestamp: string;
  userId: number;
}

export interface CollectedData {
  lead: LeadData;
  emailThreads: EmailThreadData[];
  calendarEvents: CalendarEventData[];
  chatMessages: ChatMessageData[];
}

/**
 * Collect all data related to a lead
 */
export async function collectLeadData(
  leadId: number
): Promise<CollectedData | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 1. Fetch lead
    const leadResults = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const lead = leadResults[0];

    if (!lead) {
      logger.warn({ leadId }, "[AI Collector] Lead not found");
      return null;
    }

    // 2. Fetch email threads (search in participants jsonb field)
    const threads = await db
      .select()
      .from(emailThreads)
      .where(sql`${emailThreads.participants}::text ILIKE ${`%${lead.email}%`}`)
      .orderBy(sql`${emailThreads.lastMessageAt} DESC NULLS LAST`)
      .limit(50);

    // 3. Calendar events - temporarily disabled until getCalendarClient is available
    const calendarEvents: CalendarEventData[] = [];
    logger.info(
      { leadId },
      "[AI Collector] Calendar integration disabled - will be added in future"
    );

    // 4. Fetch conversations related to this lead (by userId matching lead)
    const chatMessages = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, lead.id))
      .orderBy(sql`${conversations.createdAt} DESC`)
      .limit(20);

    const result: CollectedData = {
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        createdAt: lead.createdAt || new Date().toISOString(),
        updatedAt: lead.updatedAt || new Date().toISOString(),
      },
      emailThreads: threads.map(thread => ({
        id: thread.id,
        subject: thread.subject || "No subject",
        snippet: thread.snippet || "",
        participants: thread.participants,
        lastMessageAt: thread.lastMessageAt || new Date().toISOString(),
        gmailThreadId: thread.gmailThreadId,
      })),
      calendarEvents,
      chatMessages: chatMessages.map(msg => ({
        id: msg.id,
        content: msg.title || "Conversation",
        timestamp: msg.createdAt,
        userId: msg.userId,
      })),
    };

    logger.info(
      {
        leadId,
        emailCount: result.emailThreads.length,
        calendarCount: result.calendarEvents.length,
        chatCount: result.chatMessages.length,
      },
      "[AI Collector] Data collected successfully"
    );

    return result;
  } catch (error) {
    logger.error({ error, leadId }, "[AI Collector] Failed to collect data");
    throw error;
  }
}

/**
 * Collect data for weekly digest
 */
export async function collectWeeklyData(): Promise<{
  leads: LeadData[];
  emailThreads: EmailThreadData[];
  calendarEvents: CalendarEventData[];
  recentConversations: ChatMessageData[];
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Recent leads
    const recentLeads = await db
      .select()
      .from(leads)
      .where(sql`${leads.createdAt} >= ${oneWeekAgo}`)
      .limit(50);

    // Recent email threads
    const recentEmails = await db
      .select()
      .from(emailThreads)
      .where(sql`${emailThreads.lastMessageAt} >= ${oneWeekAgo}`)
      .limit(100);

    // Recent conversations
    const recentConvs = await db
      .select()
      .from(conversations)
      .where(sql`${conversations.createdAt} >= ${oneWeekAgo}`)
      .limit(50);

    // Calendar events - temporarily disabled
    const calendarEvents: CalendarEventData[] = [];
    logger.info(
      "[AI Collector] Calendar integration for weekly digest disabled - will be added in future"
    );

    return {
      leads: recentLeads.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        status: l.status,
        createdAt: l.createdAt || new Date().toISOString(),
        updatedAt: l.updatedAt || new Date().toISOString(),
      })),
      emailThreads: recentEmails.map(thread => ({
        id: thread.id,
        subject: thread.subject || "No subject",
        snippet: thread.snippet || "",
        participants: thread.participants,
        lastMessageAt: thread.lastMessageAt || new Date().toISOString(),
        gmailThreadId: thread.gmailThreadId,
      })),
      calendarEvents,
      recentConversations: recentConvs.map(msg => ({
        id: msg.id,
        content: msg.title || "Conversation",
        timestamp: msg.createdAt,
        userId: msg.userId,
      })),
    };
  } catch (error) {
    logger.error({ error }, "[AI Collector] Failed to collect weekly data");
    throw error;
  }
}
