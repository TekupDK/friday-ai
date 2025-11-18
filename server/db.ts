import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  analyticsEvents,
  calendarEvents,
  conversations,
  emailPipelineState,
  emailPipelineTransitions,
  emailThreads,
  InsertUser,
  invoices,
  leads,
  messages,
  tasks,
  userPreferences,
  users,
  type CalendarEvent,
  type Conversation,
  type EmailPipelineState,
  type EmailPipelineTransition,
  type EmailThread,
  type InsertAnalyticsEvent,
  type InsertCalendarEvent,
  type InsertConversation,
  type InsertEmailThread,
  type InsertInvoice,
  type InsertLead,
  type InsertMessage,
  type InsertTask,
  type InsertUserPreferences,
  type Invoice,
  type Lead,
  type Message,
  type Task,
  type UserPreferences,
} from "../drizzle/schema";

import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse DATABASE_URL to extract schema parameter (PostgreSQL doesn't accept schema in connection string)
      const dbUrl = new URL(process.env.DATABASE_URL);
      const schema = dbUrl.searchParams.get("schema");

      // Remove schema from URL as postgres.js doesn't support it as query parameter
      if (schema) {
        dbUrl.searchParams.delete("schema");
      }

      // Create client without schema in connection string
      const connectionString = dbUrl.toString();
      const client = postgres(connectionString);

      // If schema is specified, set search_path after connection
      if (schema) {
        await client`SET search_path TO ${client(schema)}`;
      }

      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= Conversation Functions =============

export async function createConversation(
  data: InsertConversation
): Promise<Conversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values(data).returning();
  return result[0];
}

export async function getUserConversations(
  userId: number
): Promise<(Conversation & { lastMessage?: string })[]> {
  const db = await getDb();
  if (!db) return [];

  const conversationsList = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));

  // Fetch last message for each conversation
  const conversationsWithLastMessage = await Promise.all(
    conversationsList.map(async conv => {
      const lastMsg = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        ...conv,
        lastMessage: lastMsg[0]?.content?.substring(0, 40) || undefined,
      };
    })
  );

  return conversationsWithLastMessage;
}

export async function getConversation(
  id: number
): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return result[0];
}

export async function updateConversationTitle(
  id: number,
  title: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(conversations).set({ title }).where(eq(conversations.id, id));
}

export async function deleteConversation(id: number): Promise<void> {
  const { withTransaction } = await import("./db/transaction-utils");
  const db = await getDb();
  if (!db) return;

  // Execute deletion in transaction to ensure atomicity
  await withTransaction(async (tx) => {
    // Delete all messages first (cascade)
    await tx.delete(messages).where(eq(messages.conversationId, id));

    // Then delete the conversation
    await tx.delete(conversations).where(eq(conversations.id, id));
  }, "Delete Conversation");
}

// ============= Message Functions =============

export async function createMessage(data: InsertMessage): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data).returning();
  return result[0];
}

export async function getConversationMessages(
  conversationId: number
): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

// ============= Email Thread Functions =============

export async function createEmailThread(
  data: InsertEmailThread
): Promise<EmailThread> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailThreads).values(data).returning();
  const newThread = result[0];

  // Index email in ChromaDB for context retrieval
  if (ENV.chromaEnabled && newThread) {
    try {
      const { addDocuments, formatEmailForEmbedding } = await import(
        "./integrations/chromadb"
      );

      // Extract first participant as 'from'
      const participants = (newThread.participants as any) || [];
      const fromEmail =
        Array.isArray(participants) && participants.length > 0
          ? participants[0].email || ""
          : "";

      const emailText = formatEmailForEmbedding({
        from: fromEmail,
        subject: newThread.subject || "",
        body: newThread.snippet || "", // Use snippet as body
      });

      await addDocuments("friday_emails", [
        {
          id: `email-${newThread.id}`,
          text: emailText,
          metadata: {
            emailId: newThread.id,
            userId: newThread.userId,
            from: fromEmail,
            subject: newThread.subject || "",
            threadId: newThread.gmailThreadId || "",
            lastMessageAt: newThread.lastMessageAt,
          },
        },
      ]);

      console.log(`[ChromaDB] Indexed email thread #${newThread.id}`);
    } catch (error) {
      console.error("[ChromaDB] Failed to index email:", error);
      // Don't fail the entire operation if indexing fails
    }
  }

  return newThread;
}

/**
 * Get related email threads using semantic search
 * Useful for providing context to AI responses
 */
export async function getRelatedEmailThreads(
  emailThread: EmailThread,
  limit: number = 5
): Promise<EmailThread[]> {
  if (!ENV.chromaEnabled) return [];

  try {
    const { searchSimilar, formatEmailForEmbedding } = await import(
      "./integrations/chromadb"
    );

    // Extract first participant as 'from'
    const participants = (emailThread.participants as any) || [];
    const fromEmail =
      Array.isArray(participants) && participants.length > 0
        ? participants[0].email || ""
        : "";

    const emailText = formatEmailForEmbedding({
      from: fromEmail,
      subject: emailThread.subject || "",
      body: emailThread.snippet || "",
    });

    const similar = await searchSimilar("friday_emails", emailText, limit + 1); // +1 because it might include itself

    if (!similar || similar.ids.length === 0) return [];

    // Get email IDs from metadata (exclude current email)
    const relatedIds = similar.metadatas
      .map(meta => meta?.emailId)
      .filter(
        (id): id is number =>
          id !== null && id !== undefined && id !== emailThread.id
      )
      .slice(0, limit);

    if (relatedIds.length === 0) return [];

    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(emailThreads)
      .where(inArray(emailThreads.id, relatedIds));
  } catch (error) {
    console.error("[ChromaDB] Failed to get related emails:", error);
    return [];
  }
}

export async function getUserEmailThreads(
  userId: number,
  limit = 50
): Promise<EmailThread[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(emailThreads)
    .where(eq(emailThreads.userId, userId))
    .orderBy(desc(emailThreads.lastMessageAt))
    .limit(limit);
}

export async function markEmailThreadRead(
  id: number,
  isRead: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(emailThreads).set({ isRead }).where(eq(emailThreads.id, id));
}

// ============= Invoice Functions =============

export async function createInvoice(data: InsertInvoice): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(invoices).values(data).returning();
  return result[0];
}

export async function getUserInvoices(userId: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function updateInvoiceStatus(
  id: number,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(invoices).set({ status }).where(eq(invoices.id, id));
}

// ============= Calendar Event Functions =============

export async function createCalendarEvent(
  data: InsertCalendarEvent
): Promise<CalendarEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(calendarEvents).values(data).returning();
  return result[0];
}

export async function getUserCalendarEvents(
  userId: number,
  startTime?: Date,
  endTime?: Date
): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(calendarEvents.userId, userId)];
  if (startTime && endTime) {
    conditions.push(
      and(
        gte(calendarEvents.startTime, startTime.toISOString()),
        lte(calendarEvents.endTime, endTime.toISOString())
      )!
    );
  }

  return db
    .select()
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.startTime);
}

// ============= Import Functions (Historical Data) =============

/**
 * Get all invoices from Billy API (for historical import)
 * Filters by date range (default: from July 2025)
 */
export async function getHistoricalBillyInvoices(
  userId: number,
  fromDate: Date = new Date("2025-07-01")
): Promise<
  Array<{
    billyInvoiceId?: string | null;
    customerId?: number | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    amount: number;
    entryDate: Date | null;
  }>
> {
  const db = await getDb();
  if (!db) return [];

  // Get all invoices from local database (synced from Billy)
  const localInvoices = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        gte(invoices.createdAt, fromDate.toISOString())
      )
    )
    .orderBy(desc(invoices.createdAt));

  // Transform to include customer info from invoices table
  return localInvoices.map(inv => ({
    billyInvoiceId: null,
    customerId: null,
    customerName: inv.customerName || null,
    customerEmail: null, // Email not stored in invoices table, will need to fetch from Billy
    customerPhone: null, // Phone not stored in invoices table
    amount: Number(inv.amount ?? 0),
    entryDate: inv.createdAt ? new Date(inv.createdAt) : null,
  }));
}

/**
 * Get all calendar events (for historical import)
 * Filters by date range (default: from July 2025)
 */
export async function getHistoricalCalendarEvents(
  userId: number,
  fromDate: Date = new Date("2025-07-01")
): Promise<
  Array<{
    googleEventId: string | null;
    title: string | null;
    description: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
  }>
> {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select({
      googleEventId: calendarEvents.googleEventId,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
      location: calendarEvents.location,
    })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.startTime, fromDate.toISOString())
      )
    )
    .orderBy(desc(calendarEvents.startTime));

  return events;
}

// ============= Task Functions =============

export async function createTask(data: InsertTask): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Determine next order index for this user if not provided
  let values = { ...data } as InsertTask & { orderIndex?: number };
  if (values.userId && (values as any).orderIndex == null) {
    const [last] = await db
      .select({ idx: tasks.orderIndex })
      .from(tasks)
      .where(eq(tasks.userId, values.userId as number))
      .orderBy(desc(tasks.orderIndex))
      .limit(1);
    const nextIndex = (last?.idx ?? -1) + 1;
    (values as any).orderIndex = nextIndex;
  }

  const result = await db.insert(tasks).values(values).returning();
  return result[0];
}

export async function getUserTasks(userId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(asc(tasks.orderIndex), desc(tasks.createdAt));
}

export async function updateTaskStatus(
  id: number,
  status: "todo" | "in_progress" | "done" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(tasks).set({ status }).where(eq(tasks.id, id));
}

export async function updateTask(
  id: number,
  updates: Partial<Omit<InsertTask, "userId" | "createdAt">>
): Promise<Task | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tasks)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, id));

  const updated = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);
  return updated[0] || null;
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(tasks).where(eq(tasks.id, id));
}

export async function bulkDeleteTasks(ids: number[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return 0;

  await db.delete(tasks).where(inArray(tasks.id, ids));
  return ids.length;
}

export async function bulkUpdateTaskStatus(
  ids: number[],
  status: "todo" | "in_progress" | "done" | "cancelled"
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return 0;

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(inArray(tasks.id, ids));
  return ids.length;
}

export async function bulkUpdateTaskPriority(
  ids: number[],
  priority: "low" | "medium" | "high" | "urgent"
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return 0;

  await db
    .update(tasks)
    .set({ priority, updatedAt: new Date().toISOString() })
    .where(inArray(tasks.id, ids));
  return ids.length;
}

export async function updateTaskOrder(
  taskId: number,
  orderIndex: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tasks)
    .set({ orderIndex, updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, taskId));
}

export async function bulkUpdateTaskOrder(
  updates: Array<{ taskId: number; orderIndex: number }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (updates.length === 0) return;

  // Update each task's order index
  for (const update of updates) {
    await db
      .update(tasks)
      .set({
        orderIndex: update.orderIndex,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, update.taskId));
  }
}

// ============= Analytics Functions =============

export async function trackEvent(data: InsertAnalyticsEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(analyticsEvents).values(data);
}

export async function getAnalyticsEvents(
  userId: number,
  eventType?: string,
  startDate?: Date,
  endDate?: Date
): Promise<(typeof analyticsEvents.$inferSelect)[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(analyticsEvents.userId, userId)];
  if (eventType) {
    conditions.push(eq(analyticsEvents.eventType, eventType));
  }
  if (startDate && endDate) {
    const startIso =
      startDate instanceof Date ? startDate.toISOString() : String(startDate);
    const endIso =
      endDate instanceof Date ? endDate.toISOString() : String(endDate);
    conditions.push(
      and(
        gte(analyticsEvents.createdAt, startIso),
        lte(analyticsEvents.createdAt, endIso)
      )!
    );
  }

  return db
    .select()
    .from(analyticsEvents)
    .where(and(...conditions))
    .orderBy(desc(analyticsEvents.createdAt));
}

/**
 * Get user preferences, creating default if not exists
 */
export async function getUserPreferences(
  userId: number
): Promise<UserPreferences | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get user preferences: database not available"
    );
    return null;
  }

  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)
      .execute();

    if (prefs) {
      return prefs;
    }

    // Create default preferences if not exists
    await db
      .insert(userPreferences)
      .values({
        userId,
        theme: "dark",
        emailNotifications: true,
        desktopNotifications: false,
      })
      .execute();

    // Fetch the newly created preferences
    const [newPrefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)
      .execute();

    return newPrefs || null;
  } catch (error) {
    console.error("[Database] Failed to get user preferences:", error);
    return null;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: number,
  preferences: Partial<
    Omit<InsertUserPreferences, "userId" | "id" | "createdAt" | "updatedAt">
  >
): Promise<UserPreferences | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update user preferences: database not available"
    );
    return null;
  }

  try {
    // Check if preferences exist
    const existing = await getUserPreferences(userId);

    if (existing) {
      // Update existing
      await db
        .update(userPreferences)
        .set(preferences)
        .where(eq(userPreferences.userId, userId))
        .execute();

      // Fetch updated record
      const [result] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1)
        .execute();

      return result || null;
    } else {
      // Create new preferences
      await db
        .insert(userPreferences)
        .values({
          userId,
          theme: "dark",
          emailNotifications: true,
          desktopNotifications: false,
          ...preferences,
        })
        .execute();

      // Fetch the newly created preferences
      const [newPrefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1)
        .execute();

      return newPrefs || null;
    }
  } catch (error) {
    console.error("[Database] Failed to update user preferences:", error);
    return null;
  }
}

/**
 * Update user name
 */
export async function updateUserName(
  userId: number,
  name: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user name: database not available");
    return;
  }

  try {
    await db.update(users).set({ name }).where(eq(users.id, userId)).execute();
  } catch (error) {
    console.error("[Database] Failed to update user name:", error);
    throw error;
  }
}

/**
 * Get pipeline state for a thread
 */
export async function getPipelineState(
  userId: number,
  threadId: string
): Promise<EmailPipelineState | null> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get pipeline state: database not available"
    );
    return null;
  }

  try {
    const [state] = await db
      .select()
      .from(emailPipelineState)
      .where(
        and(
          eq(emailPipelineState.threadId, threadId),
          eq(emailPipelineState.userId, userId)
        )
      )
      .limit(1)
      .execute();

    return state || null;
  } catch (error) {
    console.error("[Database] Failed to get pipeline state:", error);
    return null;
  }
}

/**
 * Update pipeline stage for a thread
 */
export async function updatePipelineStage(
  userId: number,
  threadId: string,
  stage:
    | "needs_action"
    | "venter_pa_svar"
    | "i_kalender"
    | "finance"
    | "afsluttet",
  triggeredBy: string = "user"
): Promise<EmailPipelineState | null> {
  const { withTransaction } = await import("./db/transaction-utils");
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot update pipeline stage: database not available"
    );
    return null;
  }

  try {
    let fromStage: string | null = null;

    // Execute pipeline update in transaction
    await withTransaction(async (tx) => {
      // Get current state to track transition
      const currentStateRows = await tx
        .select()
        .from(emailPipelineState)
        .where(
          and(
            eq(emailPipelineState.threadId, threadId),
            eq(emailPipelineState.userId, userId)
          )
        )
        .limit(1)
        .execute();

      const currentState = currentStateRows[0];
      fromStage = currentState?.stage || null;

      // Update or create pipeline state
      if (currentState) {
        await tx
          .update(emailPipelineState)
          .set({
            stage,
            transitionedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(emailPipelineState.threadId, threadId),
              eq(emailPipelineState.userId, userId)
            )
          )
          .execute();
      } else {
        await tx
          .insert(emailPipelineState)
          .values({
            userId,
            threadId,
            stage,
            transitionedAt: new Date().toISOString(),
          })
          .execute();
      }

      // Log transition
      await tx
        .insert(emailPipelineTransitions)
        .values({
          userId,
          threadId,
          fromStage,
          toStage: stage,
          transitionedBy: triggeredBy,
        })
        .execute();
    }, "Update Pipeline Stage");

    // Trigger workflow automation for stage transitions (outside transaction - async)
    if (fromStage !== stage) {
      const { handlePipelineTransition } = await import("./pipeline-workflows");
      handlePipelineTransition(userId, threadId, stage).catch(error => {
        console.error(
          `[Database] Failed to trigger pipeline workflow for thread ${threadId}:`,
          error
        );
      });
    }

    return await getPipelineState(userId, threadId);
  } catch (error) {
    console.error("[Database] Failed to update pipeline stage:", error);
    return null;
  }
}

/**
 * Get pipeline transitions for a thread
 */
export async function getPipelineTransitions(
  userId: number,
  threadId: string
): Promise<EmailPipelineTransition[]> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get pipeline transitions: database not available"
    );
    return [];
  }

  try {
    return await db
      .select()
      .from(emailPipelineTransitions)
      .where(
        and(
          eq(emailPipelineTransitions.threadId, threadId),
          eq(emailPipelineTransitions.userId, userId)
        )
      )
      .orderBy(desc(emailPipelineTransitions.createdAt))
      .execute();
  } catch (error) {
    console.error("[Database] Failed to get pipeline transitions:", error);
    return [];
  }
}

/**
 * Get all pipeline states for a user (filtered by stage)
 */
export async function getUserPipelineStates(
  userId: number,
  stage?:
    | "needs_action"
    | "venter_pa_svar"
    | "i_kalender"
    | "finance"
    | "afsluttet"
): Promise<EmailPipelineState[]> {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get user pipeline states: database not available"
    );
    return [];
  }

  try {
    if (stage) {
      return await db
        .select()
        .from(emailPipelineState)
        .where(
          and(
            eq(emailPipelineState.stage, stage),
            eq(emailPipelineState.userId, userId)
          )
        )
        .execute();
    }

    return await db
      .select()
      .from(emailPipelineState)
      .where(eq(emailPipelineState.userId, userId))
      .execute();
  } catch (error) {
    console.error("[Database] Failed to get user pipeline states:", error);
    return [];
  }
}
