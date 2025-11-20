/**
 * Follow-up Reminders Service
 * Auto-detects important emails and creates reminders for follow-up
 */

import { and, desc, eq, gte, lte, or } from "drizzle-orm";

import {
  emailFollowups,
  emails,
  InsertEmailFollowup,
  type EmailFollowup,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { getGmailThread } from "../google-api";
import { logger } from "../_core/logger";

export interface FollowupReminderConfig {
  daysUntilReminder: number; // Default days before creating reminder
  autoDetectLeads: boolean;
  autoDetectQuotes: boolean;
  autoDetectInvoices: boolean;
}

const DEFAULT_CONFIG: FollowupReminderConfig = {
  daysUntilReminder: 3,
  autoDetectLeads: true,
  autoDetectQuotes: true,
  autoDetectInvoices: true,
};

/**
 * Auto-detect if an email requires follow-up
 */
export async function shouldCreateFollowup(
  threadId: string,
  userId: number,
  emailSubject?: string,
  emailBody?: string
): Promise<boolean> {
  try {
    // Get thread details
    const thread = await getGmailThread(threadId);
    if (!thread || !thread.messages || thread.messages.length === 0) {
      return false;
    }

    const lastMessage = thread.messages[thread.messages.length - 1];
    const subject = emailSubject || thread.subject || "";
    const body = emailBody || lastMessage.body || "";

    // Check if we already have a follow-up for this thread
    const db = await getDb();
    if (db) {
      const existing = await db
        .select()
        .from(emailFollowups)
        .where(
          and(
            eq(emailFollowups.threadId, threadId),
            eq(emailFollowups.userId, userId),
            or(
              eq(emailFollowups.status, "pending"),
              eq(emailFollowups.status, "overdue")
            )
          )
        )
        .limit(1)
        .execute();

      if (existing.length > 0) {
        return false; // Already has a pending follow-up
      }
    }

    // Check if last message is from user (sent email) - no follow-up needed
    const userEmail = await getUserEmail(userId);
    if (userEmail && lastMessage.from?.includes(userEmail)) {
      return false; // User sent the last message
    }

    // Auto-detect patterns
    const lowerSubject = subject.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Lead indicators
    const leadKeywords = [
      "tilbud",
      "forespørgsel",
      "henvendelse",
      "pris",
      "kostpris",
      "budget",
      "anbefaling",
      "reference",
    ];
    const hasLeadKeywords =
      leadKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Quote/Proposal indicators
    const quoteKeywords = [
      "tilbud",
      "offerte",
      "prisoverslag",
      "faktura",
      "invoice",
      "betaling",
      "payment",
    ];
    const hasQuoteKeywords =
      quoteKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Invoice indicators
    const invoiceKeywords = [
      "faktura",
      "invoice",
      "betaling",
      "payment",
      "regning",
      "betalingsfrist",
      "due date",
    ];
    const hasInvoiceKeywords =
      invoiceKeywords.some(kw => lowerSubject.includes(kw) || lowerBody.includes(kw));

    // Question indicators (requires response)
    const questionPatterns = [
      /\?/g, // Contains question mark
      /hvornår/i,
      /hvordan/i,
      /hvorfor/i,
      /kan du/i,
      /vil du/i,
      /må jeg/i,
    ];
    const hasQuestions = questionPatterns.some(pattern => pattern.test(body));

    // If email contains questions, it likely needs a response
    if (hasQuestions) {
      return true;
    }

    // Check for lead/quote/invoice keywords
    if (hasLeadKeywords || hasQuoteKeywords || hasInvoiceKeywords) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error(
      { err: error, threadId, userId },
      "[FollowupReminders] Error checking if follow-up needed"
    );
    return false;
  }
}

/**
 * Create a follow-up reminder (manual or auto)
 */
export async function createFollowupReminder(
  userId: number,
  input: {
    threadId: string;
    emailId?: number;
    reminderDate: string; // ISO timestamp
    priority?: "low" | "normal" | "high" | "urgent";
    notes?: string;
    autoCreated?: boolean;
  }
): Promise<EmailFollowup> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get email/thread details for metadata
  let subject: string | undefined;
  let fromEmail: string | undefined;
  let sentAt: string | undefined;

  try {
    const thread = await getGmailThread(input.threadId);
    if (thread) {
      subject = thread.subject;
      if (thread.messages && thread.messages.length > 0) {
        const lastMessage = thread.messages[thread.messages.length - 1];
        fromEmail = lastMessage.from;
        sentAt = lastMessage.date;
      }
    }
  } catch (error) {
    logger.warn(
      { err: error, threadId: input.threadId },
      "[FollowupReminders] Could not fetch thread details"
    );
  }

  // If emailId provided, get sentAt from email record
  if (input.emailId && !sentAt) {
    try {
      const [email] = await db
        .select({ sentAt: emails.sentAt, receivedAt: emails.receivedAt })
        .from(emails)
        .where(
          and(eq(emails.id, input.emailId), eq(emails.userId, userId))
        )
        .limit(1)
        .execute();

      if (email) {
        sentAt = email.sentAt || email.receivedAt || undefined;
      }
    } catch (error) {
      logger.warn(
        { err: error, emailId: input.emailId },
        "[FollowupReminders] Could not fetch email details"
      );
    }
  }

  const followupData: InsertEmailFollowup = {
    userId,
    threadId: input.threadId,
    emailId: input.emailId,
    sentAt: sentAt || new Date().toISOString(),
    reminderDate: input.reminderDate,
    status: "pending",
    priority: input.priority || "normal",
    subject: subject || undefined,
    fromEmail: fromEmail || undefined,
    notes: input.notes || undefined,
    autoCreated: input.autoCreated ?? false,
  };

  const [followup] = await db
    .insert(emailFollowups)
    .values(followupData)
    .returning()
    .execute();

  logger.info(
    {
      followupId: followup.id,
      threadId: input.threadId,
      userId,
      reminderDate: input.reminderDate,
    },
    "[FollowupReminders] Created follow-up reminder"
  );

  return followup;
}

/**
 * List follow-up reminders for a user
 */
export async function listFollowupReminders(
  userId: number,
  options?: {
    status?: "pending" | "completed" | "cancelled" | "overdue";
    priority?: "low" | "normal" | "high" | "urgent";
    limit?: number;
  }
): Promise<EmailFollowup[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const conditions = [eq(emailFollowups.userId, userId)];

  if (options?.status) {
    conditions.push(eq(emailFollowups.status, options.status));
  }

  if (options?.priority) {
    conditions.push(eq(emailFollowups.priority, options.priority));
  }

  let query = db
    .select()
    .from(emailFollowups)
    .where(and(...conditions))
    .orderBy(desc(emailFollowups.reminderDate));

  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }

  const reminders = await query.execute();

  // Mark overdue reminders
  const now = new Date();
  const overdueReminders = reminders.filter(
    r => r.status === "pending" && new Date(r.reminderDate) < now
  );

  if (overdueReminders.length > 0) {
    // Update status to overdue in batch
    const overdueIds = overdueReminders.map(r => r.id);
    await db
      .update(emailFollowups)
      .set({ status: "overdue", updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(emailFollowups.userId, userId),
          or(...overdueIds.map(id => eq(emailFollowups.id, id)))
        )
      )
      .execute();

    // Update local results
    overdueReminders.forEach(r => {
      r.status = "overdue";
    });
  }

  return reminders;
}

/**
 * Mark follow-up as completed
 */
export async function markFollowupComplete(
  userId: number,
  followupId: number
): Promise<EmailFollowup> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [followup] = await db
    .update(emailFollowups)
    .set({
      status: "completed",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(emailFollowups.id, followupId), eq(emailFollowups.userId, userId))
    )
    .returning()
    .execute();

  if (!followup) {
    throw new Error("Follow-up reminder not found");
  }

  logger.info(
    { followupId, userId },
    "[FollowupReminders] Marked follow-up as completed"
  );

  return followup;
}

/**
 * Update follow-up reminder date
 */
export async function updateFollowupDate(
  userId: number,
  followupId: number,
  newReminderDate: string
): Promise<EmailFollowup> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [followup] = await db
    .update(emailFollowups)
    .set({
      reminderDate: newReminderDate,
      updatedAt: new Date().toISOString(),
      // Reset status if it was overdue
      status: new Date(newReminderDate) >= new Date() ? "pending" : undefined,
    })
    .where(
      and(eq(emailFollowups.id, followupId), eq(emailFollowups.userId, userId))
    )
    .returning()
    .execute();

  if (!followup) {
    throw new Error("Follow-up reminder not found");
  }

  logger.info(
    { followupId, userId, newReminderDate },
    "[FollowupReminders] Updated follow-up reminder date"
  );

  return followup;
}

/**
 * Cancel a follow-up reminder
 */
export async function cancelFollowup(
  userId: number,
  followupId: number
): Promise<EmailFollowup> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [followup] = await db
    .update(emailFollowups)
    .set({
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(emailFollowups.id, followupId), eq(emailFollowups.userId, userId))
    )
    .returning()
    .execute();

  if (!followup) {
    throw new Error("Follow-up reminder not found");
  }

  logger.info(
    { followupId, userId },
    "[FollowupReminders] Cancelled follow-up reminder"
  );

  return followup;
}

/**
 * Get user's email address (helper function)
 */
async function getUserEmail(userId: number): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const { users } = await import("../../drizzle/schema");
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    return user?.email || null;
  } catch (error) {
    logger.warn({ err: error, userId }, "[FollowupReminders] Could not get user email");
    return null;
  }
}

/**
 * Auto-create follow-up reminders for emails that need responses
 */
export async function autoCreateFollowups(
  userId: number,
  config: FollowupReminderConfig = DEFAULT_CONFIG
): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  // Get recent emails that might need follow-up
  // Look for emails from last 7 days that don't have follow-ups yet
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentEmails = await db
    .select({
      id: emails.id,
      threadId: emails.threadId,
      subject: emails.subject,
      body: emails.text,
      receivedAt: emails.receivedAt,
      fromEmail: emails.fromEmail,
    })
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        gte(emails.receivedAt, sevenDaysAgo.toISOString())
      )
    )
    .orderBy(desc(emails.receivedAt))
    .limit(100) // Process up to 100 recent emails
    .execute();

  let createdCount = 0;

  for (const email of recentEmails) {
    if (!email.threadId) continue;

    // Check if follow-up already exists
    const existing = await db
      .select()
      .from(emailFollowups)
      .where(
        and(
          eq(emailFollowups.threadId, email.threadId),
          eq(emailFollowups.userId, userId),
          or(
            eq(emailFollowups.status, "pending"),
            eq(emailFollowups.status, "overdue")
          )
        )
      )
      .limit(1)
      .execute();

    if (existing.length > 0) {
      continue; // Already has follow-up
    }

    // Check if email needs follow-up
    const needsFollowup = await shouldCreateFollowup(
      email.threadId,
      userId,
      email.subject || undefined,
      email.body || undefined
    );

    if (needsFollowup) {
      // Calculate reminder date (X days from now)
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + config.daysUntilReminder);

      try {
        await createFollowupReminder(userId, {
          threadId: email.threadId,
          emailId: email.id,
          reminderDate: reminderDate.toISOString(),
          priority: "normal",
          autoCreated: true,
        });
        createdCount++;
      } catch (error) {
        logger.warn(
          { err: error, threadId: email.threadId },
          "[FollowupReminders] Failed to auto-create follow-up"
        );
      }
    }
  }

  logger.info(
    { userId, createdCount, totalChecked: recentEmails.length },
    "[FollowupReminders] Auto-created follow-up reminders"
  );

  return createdCount;
}
