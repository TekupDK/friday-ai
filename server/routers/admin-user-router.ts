import { TRPCError } from "@trpc/server";
import { eq, or, like, sql, desc, asc, and } from "drizzle-orm";
import { z } from "zod";

import { users } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { router, roleProcedure } from "../_core/trpc";
import { getDb, upsertUser } from "../db";

import type { LoginMethod } from "@shared/types";

/**
 * Admin User Management Router
 * 
 * Allows admins to create, list, update, and delete team members.
 * All endpoints require admin or owner role.
 */
export const adminUserRouter = router({
  /**
   * List all users with optional search and filtering
   * Admin/Owner only
   */
  list: roleProcedure("admin")
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        orderBy: z.enum(["name", "email", "createdAt", "lastSignedIn"]).default("createdAt"),
        orderDirection: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Build query with filters
      const conditions = [];

      // Search filter (name or email)
      if (input.search && input.search.trim().length > 0) {
        const searchTerm = `%${input.search.trim().toLowerCase()}%`;
        conditions.push(
          or(
            like(sql`LOWER(${users.name})`, searchTerm),
            like(sql`LOWER(${users.email})`, searchTerm)
          )!
        );
      }

      // Role filter
      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }

      // Build where clause using and() if we have conditions
      const whereClause = conditions.length > 0 
        ? conditions.length === 1 
          ? conditions[0] 
          : and(...conditions)!
        : undefined;

      // Get total count
      const countResult = whereClause
        ? await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereClause)
        : await db
            .select({ count: sql<number>`count(*)` })
            .from(users);
      const total = Number(countResult[0]?.count || 0);

      // Order by
      const orderColumn = 
        input.orderBy === "name" ? users.name :
        input.orderBy === "email" ? users.email :
        input.orderBy === "lastSignedIn" ? users.lastSignedIn :
        users.createdAt;

      const orderFn = input.orderDirection === "asc" ? asc : desc;

      // Get users with pagination
      const allUsers = whereClause
        ? await db
            .select()
            .from(users)
            .where(whereClause)
            .orderBy(orderFn(orderColumn))
            .limit(input.limit)
            .offset(input.offset)
        : await db
            .select()
            .from(users)
            .orderBy(orderFn(orderColumn))
            .limit(input.limit)
            .offset(input.offset);

      return {
        users: allUsers,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get single user by ID
   * Admin/Owner only
   */
  get: roleProcedure("admin")
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (userRecords.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return userRecords[0];
    }),

  /**
   * Create new user
   * Admin/Owner only
   * 
   * Creates a user account that will be activated when they first log in with Google.
   * For Google OAuth, the openId will be updated to the actual Google user ID on first login.
   */
  create: roleProcedure("admin")
    .input(
      z.object({
        email: z.string().email().max(320),
        name: z.string().min(1).max(255),
        role: z.enum(["user", "admin"]).default("user"),
        loginMethod: z.enum(["google"]).default("google") as z.ZodType<LoginMethod | null>, // Only Google OAuth supported for now
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Prevent non-owner from creating admin users
      if (input.role === "admin" && ctx.userRole !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owner can create admin users",
        });
      }

      // Create placeholder openId - will be updated when user first logs in with Google
      // Format: "pending:email@example.com" - this allows us to track pre-created users
      const openId = `pending:${normalizedEmail}`;

      await upsertUser({
        openId,
        email: normalizedEmail,
        name: input.name.trim(),
        role: input.role,
        loginMethod: input.loginMethod,
      });

      // Get the created user to include in email metadata
      const createdUser = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);

      // Send invitation email to user
      if (normalizedEmail) {
        try {
          const { sendNotification } = await import("../notification-service");
          await sendNotification({
            channel: "email",
            priority: "normal",
            title: "Velkommen til Friday AI - Rendetalje.dk",
            message: `Hej ${input.name.trim()},

En administrator har oprettet en konto til dig i Friday AI systemet.

**Din konto:**
- Email: ${normalizedEmail}
- Rolle: ${input.role === "admin" ? "Administrator" : "Bruger"}

**Sådan logger du ind:**
1. Gå til login siden
2. Klik på "Log ind med Google"
3. Vælg din Google konto (${normalizedEmail})
4. Du vil automatisk blive logget ind

Hvis du har spørgsmål, kontakt din administrator.

Med venlig hilsen,
Friday AI Team - TekupDK`,
            recipients: [normalizedEmail],
            metadata: {
              userId: createdUser[0]?.id,
              role: input.role,
              invitationType: "user_created",
            },
          });
        } catch (error) {
          // Log error but don't fail user creation if email fails
          const { logger } = await import("../_core/logger");
          logger.warn(
            { err: error, email: normalizedEmail },
            "[Admin User] Failed to send invitation email, but user was created"
          );
        }
      }

      return {
        success: true,
        message: normalizedEmail
          ? "User created successfully. Invitation email sent."
          : "User created successfully. They can now log in with Google.",
      };
    }),

  /**
   * Update user
   * Admin/Owner only
   */
  update: roleProcedure("admin")
    .input(
      z.object({
        userId: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().max(320).optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const { userId, ...updates } = input;

      // Find user
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userRecords.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const user = userRecords[0];

      // Prevent deleting/editing owner
      if (user.openId === ENV.ownerOpenId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify owner account",
        });
      }

      // Prevent non-owner from promoting to admin
      if (updates.role === "admin" && ctx.userRole !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owner can promote users to admin",
        });
      }

      // Prevent self-demotion (check before other demotion checks)
      if (ctx.user.id === userId && updates.role === "user" && user.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove your own admin role",
        });
      }

      // Prevent non-owner from demoting admin
      if (user.role === "admin" && updates.role === "user" && ctx.userRole !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owner can demote admin users",
        });
      }

      // Check email uniqueness if email is being updated
      if (updates.email) {
        const normalizedEmail = updates.email.toLowerCase().trim();
        const emailCheck = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (emailCheck.length > 0 && emailCheck[0].id !== userId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another user",
          });
        }
      }

      // Update user
      await upsertUser({
        openId: user.openId,
        name: updates.name?.trim(),
        email: updates.email?.toLowerCase().trim(),
        role: updates.role,
      });

      return {
        success: true,
        message: "User updated successfully",
      };
    }),

  /**
   * Delete user
   * Admin/Owner only
   * 
   * Permanently deletes user from database.
   * Use with caution - this cannot be undone.
   */
  delete: roleProcedure("admin")
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Find user
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (userRecords.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const user = userRecords[0];

      // Prevent deleting owner
      if (user.openId === ENV.ownerOpenId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete owner account",
        });
      }

      // Prevent self-deletion
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete your own account",
        });
      }

      // Delete user
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }
      await dbInstance.delete(users).where(eq(users.id, input.userId));

      return {
        success: true,
        message: "User deleted successfully",
      };
    }),
});

