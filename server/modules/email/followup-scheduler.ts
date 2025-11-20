/**
 * Follow-up Reminder Scheduler
 * Background job that checks for emails needing follow-up and sends notifications
 */

import { and, eq, lte, or } from "drizzle-orm";

import { emailFollowups, notifications } from "../../../drizzle/schema";
import { getDb } from "../../db";
import {
  autoCreateFollowups,
  listFollowupReminders,
  markFollowupComplete,
} from "../../email-intelligence/followup";
import { logger } from "../../_core/logger";

/**
 * Check for due follow-up reminders and send notifications
 */
export async function checkAndNotifyFollowups(): Promise<{
  checked: number;
  notified: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    logger.warn("[FollowupScheduler] Database not available");
    return { checked: 0, notified: 0, errors: 0 };
  }

  const now = new Date().toISOString();
  let checked = 0;
  let notified = 0;
  let errors = 0;

  try {
    // Find all pending/overdue reminders that are due
    const dueReminders = await db
      .select()
      .from(emailFollowups)
      .where(
        and(
          or(
            eq(emailFollowups.status, "pending"),
            eq(emailFollowups.status, "overdue")
          ),
          lte(emailFollowups.reminderDate, now)
        )
      )
      .execute();

    checked = dueReminders.length;

    logger.info(
      { count: dueReminders.length },
      "[FollowupScheduler] Found due follow-up reminders"
    );

    // Group by user to batch notifications
    const remindersByUser = new Map<number, typeof dueReminders>();
    for (const reminder of dueReminders) {
      const userReminders = remindersByUser.get(reminder.userId) || [];
      userReminders.push(reminder);
      remindersByUser.set(reminder.userId, userReminders);
    }

    // Send notifications for each user
    for (const [userId, reminders] of remindersByUser.entries()) {
      try {
        await sendFollowupNotifications(userId, reminders);
        notified += reminders.length;
      } catch (error) {
        logger.error(
          { err: error, userId, reminderCount: reminders.length },
          "[FollowupScheduler] Failed to send notifications"
        );
        errors += reminders.length;
      }
    }

    // Mark overdue reminders
    const overdueIds = dueReminders
      .filter(r => r.status === "pending")
      .map(r => r.id);

    if (overdueIds.length > 0) {
      await db
        .update(emailFollowups)
        .set({
          status: "overdue",
          updatedAt: now,
        })
        .where(
          or(...overdueIds.map(id => eq(emailFollowups.id, id)))
        )
        .execute();
    }
  } catch (error) {
    logger.error(
      { err: error },
      "[FollowupScheduler] Error checking follow-up reminders"
    );
    errors = checked;
  }

  return { checked, notified, errors };
}

/**
 * Send notifications for follow-up reminders
 */
async function sendFollowupNotifications(
  userId: number,
  reminders: typeof emailFollowups.$inferSelect[]
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Create in-app notifications
  const notificationPromises = reminders.map(reminder => {
    const subject = reminder.subject || "Email follow-up";
    const fromEmail = reminder.fromEmail || "ukendt afsender";
    const message = `Du har en follow-up reminder for: "${subject}" fra ${fromEmail}`;

    return db
      .insert(notifications)
      .values({
        userId,
        type: "followup_reminder",
        title: "Follow-up påkrævet",
        message,
        actionUrl: `/inbox?threadId=${reminder.threadId}`,
        metadata: {
          followupId: reminder.id,
          threadId: reminder.threadId,
          priority: reminder.priority,
        },
        isRead: false,
      })
      .execute();
  });

  await Promise.all(notificationPromises);

  logger.info(
    { userId, reminderCount: reminders.length },
    "[FollowupScheduler] Sent follow-up notifications"
  );
}

/**
 * Auto-create follow-up reminders for recent emails
 * This runs daily to catch emails that need follow-up
 */
export async function autoCreateFollowupReminders(): Promise<{
  created: number;
  errors: number;
}> {
  let totalCreated = 0;
  let totalErrors = 0;

  try {
    const db = await getDb();
    if (!db) {
      logger.warn("[FollowupScheduler] Database not available");
      return { created: 0, errors: 0 };
    }

    // Get all active users
    const { users } = await import("../../../drizzle/schema");
    const allUsers = await db.select({ id: users.id }).from(users).execute();

    logger.info(
      { userCount: allUsers.length },
      "[FollowupScheduler] Auto-creating follow-ups for users"
    );

    // Process each user
    for (const user of allUsers) {
      try {
        const created = await autoCreateFollowups(user.id);
        totalCreated += created;
      } catch (error) {
        logger.error(
          { err: error, userId: user.id },
          "[FollowupScheduler] Failed to auto-create follow-ups for user"
        );
        totalErrors++;
      }
    }
  } catch (error) {
    logger.error(
      { err: error },
      "[FollowupScheduler] Error in auto-create follow-ups job"
    );
    totalErrors++;
  }

  logger.info(
    { totalCreated, totalErrors },
    "[FollowupScheduler] Completed auto-create follow-ups job"
  );

  return { created: totalCreated, errors: totalErrors };
}

/**
 * Clean up old completed/cancelled follow-ups (older than 90 days)
 */
export async function cleanupOldFollowups(): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const result = await db
      .delete(emailFollowups)
      .where(
        and(
          or(
            eq(emailFollowups.status, "completed"),
            eq(emailFollowups.status, "cancelled")
          ),
          lte(emailFollowups.updatedAt, ninetyDaysAgo.toISOString())
        )
      )
      .execute();

    const deletedCount = Array.isArray(result) ? result.length : 0;

    logger.info(
      { deletedCount },
      "[FollowupScheduler] Cleaned up old follow-ups"
    );

    return deletedCount;
  } catch (error) {
    logger.error(
      { err: error },
      "[FollowupScheduler] Error cleaning up old follow-ups"
    );
    return 0;
  }
}

/**
 * Main scheduler function - runs daily
 * Should be called from a cron job or scheduled task
 */
export async function runFollowupScheduler(): Promise<void> {
  logger.info("[FollowupScheduler] Starting follow-up reminder scheduler");

  // 1. Check for due reminders and send notifications
  const checkResult = await checkAndNotifyFollowups();
  logger.info(
    checkResult,
    "[FollowupScheduler] Completed check and notify step"
  );

  // 2. Auto-create follow-ups for recent emails
  const createResult = await autoCreateFollowupReminders();
  logger.info(
    createResult,
    "[FollowupScheduler] Completed auto-create step"
  );

  // 3. Clean up old follow-ups (run less frequently, maybe weekly)
  // Only run cleanup on certain days to reduce load
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    // Sunday - run cleanup
    const cleanupCount = await cleanupOldFollowups();
    logger.info(
      { cleanupCount },
      "[FollowupScheduler] Completed cleanup step"
    );
  }

  logger.info("[FollowupScheduler] Completed follow-up reminder scheduler");
}
