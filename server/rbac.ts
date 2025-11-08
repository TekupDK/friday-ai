/**
 * Role-Based Access Control (RBAC)
 * Defines roles and their permissions for action execution
 */

export type UserRole = "owner" | "admin" | "user" | "guest";

export type ActionPermission =
  | "create_lead"
  | "create_task"
  | "book_meeting"
  | "create_invoice"
  | "search_gmail"
  | "search_email" // Intent-based email search
  | "check_calendar" // View calendar events
  | "list_leads" // List all leads
  | "list_tasks" // List all tasks
  | "request_flytter_photos"
  | "job_completion"
  | "send_email"
  | "delete_email"
  | "archive_email"
  | "snooze_email"
  | "mark_email_done";

/**
 * Role hierarchy (higher roles inherit permissions from lower roles)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  admin: 2,
  owner: 3,
};

/**
 * Define which roles can execute which actions
 * Lower-risk actions are available to all users
 * Higher-risk actions require elevated permissions
 */
const ACTION_PERMISSIONS: Record<ActionPermission, UserRole> = {
  // Low-risk actions - all users
  create_task: "user",
  snooze_email: "user",
  mark_email_done: "user",
  archive_email: "user",
  search_gmail: "user",
  search_email: "user", // FIX: Added missing search_email permission

  // Medium-risk actions - regular users
  create_lead: "user",
  send_email: "user",
  request_flytter_photos: "user",
  job_completion: "user",
  check_calendar: "user", // FIX: Added missing check_calendar permission
  list_leads: "user", // FIX: Added missing list_leads permission
  list_tasks: "user", // FIX: Added missing list_tasks permission

  // Higher-risk actions - admin only
  book_meeting: "admin",
  delete_email: "admin",

  // Critical actions - owner only
  create_invoice: "owner",
};

/**
 * Determine user role based on database state and OWNER_OPEN_ID
 * - owner: matches ENV.ownerOpenId
 * - admin: users.role === 'admin'
 * - user: default DB role or fallback
 * - guest: user not found (hardening)
 */
export async function getUserRole(userId: number): Promise<UserRole> {
  try {
    const [{ getDb }] = await Promise.all([import("./db")]);
    const [{ users }] = await Promise.all([import("../drizzle/schema")]);
    const [{ eq }] = await Promise.all([import("drizzle-orm")]);
    const [{ ENV }] = await Promise.all([import("./_core/env")]);

    const db = await getDb();

    // Fallback when DB isn't available (local tests or missing config)
    if (!db) {
      // Backward-compat: treat userId 1 as owner in dev
      return userId === 1 ? "owner" : "user";
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = result[0];
    if (!user) return "guest";

    // Owner check takes precedence
    if (user.openId && ENV.ownerOpenId && user.openId === ENV.ownerOpenId) {
      return "owner";
    }

    // Map DB role to RBAC role space
    if (user.role === "admin") return "admin";
    return "user";
  } catch (err) {
    // Defensive: never block on RBAC resolution, default conservatively
    console.warn("[RBAC] getUserRole failed, defaulting to 'user'", err);
    return userId === 1 ? "owner" : "user";
  }
}

/**
 * Check if a user has permission to execute an action
 */
export function hasPermission(userRole: UserRole, actionType: string): boolean {
  const requiredRole = ACTION_PERMISSIONS[actionType as ActionPermission];

  // If action not in permission list, deny by default
  if (!requiredRole) {
    console.warn(`[RBAC] Unknown action type: ${actionType}`);
    return false;
  }

  // Check if user's role is high enough
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  return userLevel >= requiredLevel;
}

/**
 * Get list of actions a user can perform
 */
export function getAllowedActions(userRole: UserRole): ActionPermission[] {
  const userLevel = ROLE_HIERARCHY[userRole];

  return Object.entries(ACTION_PERMISSIONS)
    .filter(([_, requiredRole]) => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole];
      return userLevel >= requiredLevel;
    })
    .map(([action]) => action as ActionPermission);
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    owner: "Owner",
    admin: "Administrator",
    user: "User",
    guest: "Guest",
  };
  return names[role];
}
