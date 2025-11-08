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
import { leads, email_threads, conversations } from "../../../drizzle/schema";
import { eq, or, like, and, gte } from "drizzle-orm";
import { getCalendarClient } from "../../google-api";
import { logger } from "../../_core/logger";

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailThreadData {
  id: string;
  subject: string;
  snippet: string;
  from_email: string;
  to_email: string;
  date: string;
  body: string | null;
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
  id: string;
  content: string;
  timestamp: string;
  userId: string;
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
export async function collectLeadData(leadId: string): Promise<CollectedData | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 1. Fetch lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
    });

    if (!lead) {
      logger.warn({ leadId }, "[AI Collector] Lead not found");
      return null;
    }

    // 2. Fetch email threads
    const emailThreads = await db.query.email_threads.findMany({
      where: or(
        eq(email_threads.from_email, lead.email),
        like(email_threads.to_email, `%${lead.email}%`)
      ),
      limit: 50,
      orderBy: (threads, { desc }) => [desc(threads.date)],
    });

    // 3. Fetch calendar events (if Google Calendar configured)
    let calendarEvents: CalendarEventData[] = [];
    
    try {
      const calendar = await getCalendarClient();
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_ID || "primary",
        q: lead.email, // Search for email in events
        timeMin: sixMonthsAgo.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      calendarEvents = (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary || "Untitled Event",
        description: event.description || null,
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        attendees: (event.attendees || []).map(a => a.email!).filter(Boolean),
      }));
    } catch (error) {
      logger.warn({ error, leadId }, "[AI Collector] Failed to fetch calendar events");
      // Continue without calendar data
    }

    // 4. Fetch chat conversations (search in context field)
    const chatMessages = await db.query.conversations.findMany({
      where: or(
        like(conversations.context, `%${lead.email}%`),
        like(conversations.context, `%${lead.name}%`),
        like(conversations.context, `%${lead.company}%`)
      ),
      limit: 20,
      orderBy: (conv, { desc }) => [desc(conv.createdAt)],
    });

    const result: CollectedData = {
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
      emailThreads: emailThreads.map(thread => ({
        id: thread.id,
        subject: thread.subject,
        snippet: thread.snippet || "",
        from_email: thread.from_email,
        to_email: thread.to_email,
        date: thread.date,
        body: thread.body,
      })),
      calendarEvents,
      chatMessages: chatMessages.map(msg => ({
        id: msg.id,
        content: msg.context || "",
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

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Recent leads
    const recentLeads = await db.query.leads.findMany({
      where: gte(leads.createdAt, oneWeekAgo),
      limit: 50,
    });

    // Recent email threads
    const recentEmails = await db.query.email_threads.findMany({
      where: gte(email_threads.date, oneWeekAgo),
      limit: 100,
    });

    // Recent conversations
    const recentConvs = await db.query.conversations.findMany({
      where: gte(conversations.createdAt, oneWeekAgo),
      limit: 50,
    });

    // Calendar events (this week)
    let calendarEvents: CalendarEventData[] = [];
    
    try {
      const calendar = await getCalendarClient();
      const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_ID || "primary",
        timeMin: oneWeekAgo,
        timeMax: new Date().toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      calendarEvents = (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary || "Untitled Event",
        description: event.description || null,
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        attendees: (event.attendees || []).map(a => a.email!).filter(Boolean),
      }));
    } catch (error) {
      logger.warn({ error }, "[AI Collector] Failed to fetch calendar events for digest");
    }

    return {
      leads: recentLeads.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        status: l.status,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      emailThreads: recentEmails.map(thread => ({
        id: thread.id,
        subject: thread.subject,
        snippet: thread.snippet || "",
        from_email: thread.from_email,
        to_email: thread.to_email,
        date: thread.date,
        body: thread.body,
      })),
      calendarEvents,
      recentConversations: recentConvs.map(msg => ({
        id: msg.id,
        content: msg.context || "",
        timestamp: msg.createdAt,
        userId: msg.userId,
      })),
    };
  } catch (error) {
    logger.error({ error }, "[AI Collector] Failed to collect weekly data");
    throw error;
  }
}
