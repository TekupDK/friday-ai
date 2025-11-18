import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import {
  createRateLimitMiddleware,
  INBOX_CRM_RATE_LIMIT,
  STATS_RATE_LIMIT,
  EXPORT_RATE_LIMIT,
  BULK_OPERATION_RATE_LIMIT,
} from "../rate-limit-middleware";

import type { TrpcContext } from "./context";

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Add rate limit information to error response
    if (
      error.code === "TOO_MANY_REQUESTS" ||
      error.code === "INTERNAL_SERVER_ERROR"
    ) {
      const message = error.message || "";
      if (message.includes("rate limit") || message.includes("429")) {
        // Try to extract retry-after from message or error data
        const retryAfterMatch = message.match(/retry after ([^,]+)/i);
        const retryAfter = retryAfterMatch?.[1] || (error as any).retryAfter;

        if (retryAfter) {
          return {
            ...shape,
            data: {
              ...shape.data,
              code: "RATE_LIMIT_EXCEEDED",
              retryAfter:
                retryAfter instanceof Date
                  ? retryAfter.toISOString()
                  : retryAfter,
            },
          };
        }
      }
    }

    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

/**
 * Role-based procedure middleware
 * Requires user to have a specific role or higher
 *
 * @param requiredRole - Minimum role required (user, admin, or owner)
 * @returns tRPC procedure middleware
 *
 * @example
 * ```ts
 * export const appRouter = router({
 *   deleteUser: roleProcedure("admin")
 *     .input(z.object({ userId: z.number() }))
 *     .mutation(async ({ ctx, input }) => {
 *       // Only admin or owner can access
 *     }),
 * });
 * ```
 */
export function roleProcedure(requiredRole: "user" | "admin" | "owner") {
  return protectedProcedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: UNAUTHED_ERR_MSG,
        });
      }

      // Get user role from RBAC system
      const { getUserRole, requireRoleOrHigher } = await import("../rbac");
      const userRole = await getUserRole(ctx.user.id);

      // Check if user has required role or higher
      requireRoleOrHigher(userRole, requiredRole);

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          userRole, // Add userRole to context for convenience
        },
      });
    })
  );
}

/**
 * Permission-based procedure middleware
 * Requires user to have a specific permission
 *
 * @param permission - Permission required (e.g., "create_invoice", "delete_email")
 * @returns tRPC procedure middleware
 *
 * @example
 * ```ts
 * export const appRouter = router({
 *   createInvoice: permissionProcedure("create_invoice")
 *     .input(z.object({ amount: z.number() }))
 *     .mutation(async ({ ctx, input }) => {
 *       // Only users with create_invoice permission can access
 *     }),
 * });
 * ```
 */
export function permissionProcedure(
  permission: import("../rbac").ActionPermission
) {
  return protectedProcedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: UNAUTHED_ERR_MSG,
        });
      }

      // Get user role and check permission
      const { getUserRole, requirePermission } = await import("../rbac");
      const userRole = await getUserRole(ctx.user.id);

      // Check if user has required permission
      requirePermission(userRole, permission);

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          userRole, // Add userRole to context for convenience
        },
      });
    })
  );
}

/**
 * Owner-only procedure middleware
 * Requires user to be the owner (highest privilege)
 *
 * @example
 * ```ts
 * export const appRouter = router({
 *   systemSettings: ownerProcedure
 *     .input(z.object({ setting: z.string() }))
 *     .mutation(async ({ ctx, input }) => {
 *       // Only owner can access
 *     }),
 * });
 * ```
 */
export const ownerProcedure = roleProcedure("owner");

/**
 * Rate-limited protected procedure for inbox/CRM operations
 * Limits: 10 requests per 30 seconds per user
 */
export const rateLimitedProcedure = protectedProcedure.use(
  createRateLimitMiddleware(INBOX_CRM_RATE_LIMIT, "inbox-crm")
);

/**
 * Rate-limited procedure for expensive stats/aggregation queries
 * Limits: 20 requests per 15 minutes per user
 */
export const statsRateLimitedProcedure = protectedProcedure.use(
  createRateLimitMiddleware(STATS_RATE_LIMIT, "crm-stats")
);

/**
 * Rate-limited procedure for export operations
 * Limits: 10 requests per 15 minutes per user
 */
export const exportRateLimitedProcedure = protectedProcedure.use(
  createRateLimitMiddleware(EXPORT_RATE_LIMIT, "crm-export")
);

/**
 * Rate-limited procedure for bulk/pipeline operations
 * Limits: 30 requests per 15 minutes per user
 */
export const bulkOperationRateLimitedProcedure = protectedProcedure.use(
  createRateLimitMiddleware(BULK_OPERATION_RATE_LIMIT, "crm-bulk")
);
