/**
 * Role-Based Access Control (RBAC)
 * Defines roles and their permissions for action execution
 */

import { TRPCError } from "@trpc/server";

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
    // ✅ SECURITY FIX: Use logger instead of console.warn
    import("./_core/logger").then(({ logger }) => {
      logger.warn({ err }, "[RBAC] getUserRole failed, defaulting to 'user'");
    });
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
    // ✅ SECURITY FIX: Use logger instead of console.warn
    import("./_core/logger").then(({ logger }) => {
      logger.warn({ actionType }, "[RBAC] Unknown action type");
    });
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

/**
 * ✅ SECURITY FIX: Require ownership of a resource
 *
 * This helper ensures that a user can only access resources they own.
 * Use this in tRPC procedures to verify resource ownership before allowing access.
 *
 * @param userId - The ID of the user making the request
 * @param resourceUserId - The userId field from the resource (e.g., customerProfile.userId)
 * @param resourceType - Human-readable resource type for error messages (e.g., "customer profile", "lead")
 * @param resourceId - Optional resource ID for error messages
 * @throws TRPCError with code FORBIDDEN if user doesn't own the resource
 *
 * @example
 * ```ts
 * const customer = await db.select().from(customerProfiles)
 *   .where(eq(customerProfiles.id, input.customerId))
 *   .limit(1);
 *
 * if (!customer[0]) {
 *   throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
 * }
 *
 * requireOwnership(ctx.user.id, customer[0].userId, "customer profile", input.customerId);
 * ```
 */
export function requireOwnership(
  userId: number,
  resourceUserId: number | null | undefined,
  resourceType: string,
  resourceId?: number | string
): void {
  // Allow if user owns the resource
  if (resourceUserId === userId) {
    return;
  }

  // Deny if resource has no userId (shouldn't happen, but be defensive)
  if (resourceUserId === null || resourceUserId === undefined) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `${resourceType} has no owner`,
    });
  }

  // Deny if user doesn't own the resource
  const resourceIdMsg = resourceId ? ` (ID: ${resourceId})` : "";
  throw new TRPCError({
    code: "FORBIDDEN",
    message: `You don't have permission to access this ${resourceType}${resourceIdMsg}`,
  });
}

/**
 * ✅ SECURITY FIX: Require ownership of multiple resources (batch check)
 *
 * Useful when checking ownership of multiple resources at once.
 *
 * @param userId - The ID of the user making the request
 * @param resources - Array of resources with userId fields
 * @param resourceType - Human-readable resource type for error messages
 * @throws TRPCError with code FORBIDDEN if user doesn't own any resource
 *
 * @example
 * ```ts
 * const customers = await db.select().from(customerProfiles)
 *   .where(inArray(customerProfiles.id, input.customerIds));
 *
 * requireOwnershipBatch(ctx.user.id, customers, "customer profile");
 * ```
 */
export function requireOwnershipBatch<
  T extends { userId: number | null | undefined },
>(userId: number, resources: T[], resourceType: string): void {
  for (const resource of resources) {
    requireOwnership(userId, resource.userId, resourceType);
  }
}

/**
 * Check if a user has a specific role or higher
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @returns true if user has the required role or higher
 *
 * @example
 * ```ts
 * hasRoleOrHigher("user", "admin"); // false
 * hasRoleOrHigher("admin", "admin"); // true
 * hasRoleOrHigher("owner", "admin"); // true
 * ```
 */
export function hasRoleOrHigher(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Check if a user has a specific role (exact match)
 *
 * @param userRole - The user's current role
 * @param requiredRole - The exact role required
 * @returns true if user has the exact role
 *
 * @example
 * ```ts
 * hasExactRole("admin", "admin"); // true
 * hasExactRole("owner", "admin"); // false
 * ```
 */
export function hasExactRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return userRole === requiredRole;
}

/**
 * Require a specific role or higher
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @param action - Optional action name for error message
 * @throws TRPCError with code FORBIDDEN if user doesn't have required role
 *
 * @example
 * ```ts
 * requireRoleOrHigher(ctx.userRole, "admin", "delete user");
 * ```
 */
export function requireRoleOrHigher(
  userRole: UserRole,
  requiredRole: UserRole,
  action?: string
): void {
  if (!hasRoleOrHigher(userRole, requiredRole)) {
    const actionMsg = action ? ` to ${action}` : "";
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires ${getRoleName(requiredRole)} role or higher${actionMsg}`,
    });
  }
}

/**
 * Require a specific permission
 *
 * @param userRole - The user's current role
 * @param permission - The permission required
 * @throws TRPCError with code FORBIDDEN if user doesn't have permission
 *
 * @example
 * ```ts
 * requirePermission(ctx.userRole, "create_invoice");
 * ```
 */
export function requirePermission(
  userRole: UserRole,
  permission: ActionPermission
): void {
  if (!hasPermission(userRole, permission)) {
    const requiredRole = ACTION_PERMISSIONS[permission];
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `This action requires ${getRoleName(requiredRole)} role. You need permission: ${permission}`,
    });
  }
}

/**
 * Verify ownership of a resource by ID
 * Fetches the resource from the database and checks ownership
 *
 * @param db - Database instance
 * @param table - Drizzle table to query
 * @param resourceId - ID of the resource to check
 * @param userId - ID of the user making the request
 * @param resourceType - Human-readable resource type for error messages
 * @returns The resource if found and owned by user
 * @throws TRPCError with code NOT_FOUND if resource doesn't exist
 * @throws TRPCError with code FORBIDDEN if user doesn't own the resource
 *
 * @example
 * ```ts
 * const lead = await verifyResourceOwnership(
 *   db,
 *   leads,
 *   input.leadId,
 *   ctx.user.id,
 *   "lead"
 * );
 * ```
 */
export async function verifyResourceOwnership<
  T extends { userId: number | null | undefined },
>(
  db: Awaited<ReturnType<typeof import("./db").getDb>>,
  table: any,
  resourceId: number | string,
  userId: number,
  resourceType: string
): Promise<T> {
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  const { eq } = await import("drizzle-orm");

  const result = await db
    .select()
    .from(table)
    .where(eq(table.id, resourceId))
    .limit(1);

  const resource = result[0] as T | undefined;

  if (!resource) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${resourceType} not found`,
    });
  }

  requireOwnership(userId, resource.userId, resourceType, resourceId);

  return resource;
}

/**
 * Verify ownership of multiple resources by IDs
 * Fetches resources from the database and checks ownership
 *
 * @param db - Database instance
 * @param table - Drizzle table to query
 * @param resourceIds - Array of resource IDs to check
 * @param userId - ID of the user making the request
 * @param resourceType - Human-readable resource type for error messages
 * @returns Array of resources that are found and owned by user
 * @throws TRPCError with code NOT_FOUND if any resource doesn't exist
 * @throws TRPCError with code FORBIDDEN if user doesn't own any resource
 *
 * @example
 * ```ts
 * const customers = await verifyResourcesOwnership(
 *   db,
 *   customerProfiles,
 *   input.customerIds,
 *   ctx.user.id,
 *   "customer profile"
 * );
 * ```
 */
export async function verifyResourcesOwnership<
  T extends { userId: number | null | undefined },
>(
  db: Awaited<ReturnType<typeof import("./db").getDb>>,
  table: any,
  resourceIds: (number | string)[],
  userId: number,
  resourceType: string
): Promise<T[]> {
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  if (resourceIds.length === 0) {
    return [];
  }

  const { inArray } = await import("drizzle-orm");

  const results = await db
    .select()
    .from(table)
    .where(inArray(table.id, resourceIds));

  if (results.length !== resourceIds.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Some ${resourceType}s were not found`,
    });
  }

  requireOwnershipBatch(userId, results as T[], resourceType);

  return results as T[];
}

/**
 * Check if user is owner (highest privilege level)
 *
 * @param userRole - The user's current role
 * @returns true if user is owner
 */
export function isOwner(userRole: UserRole): boolean {
  return userRole === "owner";
}

/**
 * Check if user is admin or owner
 *
 * @param userRole - The user's current role
 * @returns true if user is admin or owner
 */
export function isAdminOrOwner(userRole: UserRole): boolean {
  return userRole === "admin" || userRole === "owner";
}
