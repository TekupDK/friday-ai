/**
 * Follow-up Reminders Helper Functions
 */

import { eq } from "drizzle-orm";

import { users } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { logger } from "../../_core/logger";

/**
 * Get user's email address
 */
export async function getUserEmail(userId: number): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

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
