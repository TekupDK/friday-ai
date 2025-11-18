# RBAC (Role-Based Access Control) System Guide

**Author:** TekupDK Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

## Overview

Friday AI Chat implements a comprehensive Role-Based Access Control (RBAC) system that provides fine-grained permission management for users, resources, and actions. The system supports role hierarchies, permission checks, and ownership verification.

## Architecture

### Roles

The system defines four roles in hierarchical order (from lowest to highest privilege):

1. **guest** - Unauthenticated or unknown users (lowest privilege)
2. **user** - Standard authenticated users
3. **admin** - Administrators with elevated privileges
4. **owner** - System owner with full access (highest privilege)

Higher roles inherit permissions from lower roles. For example, an `admin` can perform all actions available to `user`, and an `owner` can perform all actions.

### Permissions

Permissions are granular actions that can be performed in the system. Each permission is assigned to a minimum role level:

**User-level permissions:**

- `create_task` - Create tasks
- `create_lead` - Create sales leads
- `send_email` - Send emails
- `search_gmail` - Search Gmail
- `check_calendar` - View calendar events
- `list_leads` - List leads
- `list_tasks` - List tasks
- `archive_email` - Archive emails
- `snooze_email` - Snooze emails
- `mark_email_done` - Mark emails as done

**Admin-level permissions:**

- `book_meeting` - Schedule meetings
- `delete_email` - Delete emails

**Owner-level permissions:**

- `create_invoice` - Create invoices (critical financial action)

## Usage

### Basic Permission Checks

#### Check if user has permission

```typescript
import { getUserRole, hasPermission } from "../rbac";

const userRole = await getUserRole(ctx.user.id);
if (hasPermission(userRole, "create_invoice")) {
  // User can create invoices
}
```

#### Require permission

```typescript
import { getUserRole, requirePermission } from "../rbac";

const userRole = await getUserRole(ctx.user.id);
requirePermission(userRole, "create_invoice"); // Throws FORBIDDEN if not allowed
```

### Role Checks

#### Check if user has role or higher

```typescript
import { getUserRole, hasRoleOrHigher } from "@/server/rbac";

const userRole = await getUserRole(ctx.user.id);
if (hasRoleOrHigher(userRole, "admin")) {
  // User is admin or owner
}
```

#### Require role or higher

```typescript
import { getUserRole, requireRoleOrHigher } from "@/server/rbac";

const userRole = await getUserRole(ctx.user.id);
requireRoleOrHigher(userRole, "admin", "delete user"); // Throws FORBIDDEN if not admin/owner
```

### Ownership Verification

#### Verify single resource ownership

```typescript
import { requireOwnership } from "../rbac";

// After fetching resource from database
const lead = await db
  .select()
  .from(leads)
  .where(eq(leads.id, input.leadId))
  .limit(1);

if (!lead[0]) {
  throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
}

// Verify ownership
requireOwnership(ctx.user.id, lead[0].userId, "lead", input.leadId);
```

#### Verify multiple resources ownership

```typescript
import { requireOwnershipBatch } from "../rbac";

const customers = await db
  .select()
  .from(customerProfiles)
  .where(inArray(customerProfiles.id, input.customerIds));

requireOwnershipBatch(ctx.user.id, customers, "customer profile");
```

#### Verify resource ownership with automatic fetch

```typescript
import { verifyResourceOwnership } from "../rbac";
import { leads } from "../../drizzle/schema";

const db = await getDb();
const lead = await verifyResourceOwnership(
  db,
  leads,
  input.leadId,
  ctx.user.id,
  "lead"
);
// lead is guaranteed to exist and be owned by user
```

### tRPC Procedure Middleware

#### Role-based procedures

Use `roleProcedure` to require a minimum role level:

```typescript
import { router, roleProcedure } from "../_core/trpc";
import { z } from "zod";

export const appRouter = router({
  deleteUser: roleProcedure("admin")
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only admin or owner can access
      // ctx.userRole is available in context
      return await deleteUser(input.userId);
    }),
});
```

#### Permission-based procedures

Use `permissionProcedure` to require a specific permission:

```typescript
import { permissionProcedure } from "../_core/trpc";

export const appRouter = router({
  createInvoice: permissionProcedure("create_invoice")
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only users with create_invoice permission can access
      // ctx.userRole is available in context
      return await createInvoice(input);
    }),
});
```

#### Owner-only procedures

Use `ownerProcedure` for owner-only endpoints:

```typescript
import { ownerProcedure } from "../_core/trpc";

export const appRouter = router({
  systemSettings: ownerProcedure
    .input(z.object({ setting: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only owner can access
      return await updateSystemSettings(input);
    }),
});
```

#### Standard procedures

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication (any logged-in user)
- `adminProcedure` - Requires admin role (checks `ctx.user.role === "admin"`)

## Best Practices

### 1. Always verify ownership for resource access

```typescript
// ✅ Good: Verify ownership
getLead: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input }) => {
    const lead = await db.select().from(leads)
      .where(eq(leads.id, input.id))
      .limit(1);

    if (!lead[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
    }

    requireOwnership(ctx.user.id, lead[0].userId, "lead", input.id);
    return lead[0];
  }),

// ❌ Bad: No ownership check
getLead: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input }) => {
    // Security vulnerability: user can access any lead
    return await db.select().from(leads)
      .where(eq(leads.id, input.id))
      .limit(1);
  }),
```

### 2. Use role-based middleware for role requirements

```typescript
// ✅ Good: Use roleProcedure middleware
deleteUser: roleProcedure("admin")
  .input(z.object({ userId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // Role check is automatic
    return await deleteUser(input.userId);
  }),

// ❌ Bad: Manual role check
deleteUser: protectedProcedure
  .input(z.object({ userId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const userRole = await getUserRole(ctx.user.id);
    if (!hasRoleOrHigher(userRole, "admin")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin required" });
    }
    return await deleteUser(input.userId);
  }),
```

### 3. Use permission-based middleware for action permissions

```typescript
// ✅ Good: Use permissionProcedure middleware
createInvoice: permissionProcedure("create_invoice")
  .input(z.object({ amount: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // Permission check is automatic
    return await createInvoice(input);
  }),

// ❌ Bad: Manual permission check
createInvoice: protectedProcedure
  .input(z.object({ amount: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const userRole = await getUserRole(ctx.user.id);
    if (!hasPermission(userRole, "create_invoice")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Permission denied" });
    }
    return await createInvoice(input);
  }),
```

### 4. Filter queries by userId when listing resources

```typescript
// ✅ Good: Filter by userId
listLeads: protectedProcedure.query(async ({ ctx }) => {
  return await db.select().from(leads)
    .where(eq(leads.userId, ctx.user.id))
    .orderBy(desc(leads.createdAt));
}),

// ❌ Bad: No userId filter
listLeads: protectedProcedure.query(async ({ ctx }) => {
  // Security vulnerability: returns all leads
  return await db.select().from(leads)
    .orderBy(desc(leads.createdAt));
}),
```

### 5. Use verifyResourceOwnership for convenience

```typescript
// ✅ Good: Use helper function
updateLead: protectedProcedure
  .input(z.object({ id: z.number(), name: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const lead = await verifyResourceOwnership(
      db,
      leads,
      input.id,
      ctx.user.id,
      "lead"
    );

    // lead is guaranteed to exist and be owned by user
    return await updateLead(input.id, input.name);
  }),

// ❌ Bad: Manual check
updateLead: protectedProcedure
  .input(z.object({ id: z.number(), name: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const lead = await db.select().from(leads)
      .where(eq(leads.id, input.id))
      .limit(1);

    if (!lead[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
    }

    requireOwnership(ctx.user.id, lead[0].userId, "lead", input.id);
    return await updateLead(input.id, input.name);
  }),
```

## API Reference

### Core Functions

#### `getUserRole(userId: number): Promise<UserRole>`

Determines the user's role based on database state and environment configuration.

- Returns `"owner"` if user's `openId` matches `ENV.ownerOpenId`
- Returns `"admin"` if user's `role` is `"admin"`
- Returns `"user"` for standard users
- Returns `"guest"` if user not found

#### `hasPermission(userRole: UserRole, actionType: string): boolean`

Checks if a user role has permission to execute an action.

#### `requirePermission(userRole: UserRole, permission: ActionPermission): void`

Throws `TRPCError` with code `FORBIDDEN` if user doesn't have permission.

#### `hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean`

Checks if user has the required role or higher.

#### `requireRoleOrHigher(userRole: UserRole, requiredRole: UserRole, action?: string): void`

Throws `TRPCError` with code `FORBIDDEN` if user doesn't have required role.

#### `requireOwnership(userId: number, resourceUserId: number | null | undefined, resourceType: string, resourceId?: number | string): void`

Verifies that a user owns a resource. Throws `TRPCError` with code `FORBIDDEN` if not.

#### `requireOwnershipBatch<T>(userId: number, resources: T[], resourceType: string): void`

Verifies ownership of multiple resources. Throws if any resource is not owned.

#### `verifyResourceOwnership<T>(db, table, resourceId, userId, resourceType): Promise<T>`

Fetches a resource from the database and verifies ownership. Throws `NOT_FOUND` if resource doesn't exist, `FORBIDDEN` if not owned.

#### `verifyResourcesOwnership<T>(db, table, resourceIds, userId, resourceType): Promise<T[]>`

Fetches multiple resources and verifies ownership. Throws if any resource is missing or not owned.

### Helper Functions

#### `isOwner(userRole: UserRole): boolean`

Checks if user is owner.

#### `isAdminOrOwner(userRole: UserRole): boolean`

Checks if user is admin or owner.

#### `getAllowedActions(userRole: UserRole): ActionPermission[]`

Returns list of actions a user can perform.

#### `getRoleName(role: UserRole): string`

Returns human-readable role name.

### tRPC Middleware

#### `roleProcedure(requiredRole: "user" | "admin" | "owner")`

Creates a procedure that requires a minimum role level. Adds `userRole` to context.

#### `permissionProcedure(permission: ActionPermission)`

Creates a procedure that requires a specific permission. Adds `userRole` to context.

#### `ownerProcedure`

Shorthand for `roleProcedure("owner")`.

## Examples

### Example 1: Protected endpoint with ownership check (Real Implementation)

From `server/customer-router.ts`:

```typescript
getInvoices: protectedProcedure
  .input(z.object({ customerId: z.number() }))
  .query(async ({ ctx, input }) => {
    // ✅ RBAC: Verify customer ownership
    const db = await getDb();
    await verifyResourceOwnership(
      db,
      customerProfiles,
      input.customerId,
      ctx.user.id,
      "customer profile"
    );
    return await getCustomerInvoices(input.customerId, ctx.user.id);
  }),
```

### Example 2: Lead endpoint with ownership verification (Real Implementation)

From `server/routers/crm-lead-router.ts`:

```typescript
getLead: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    // ✅ RBAC: Verify lead ownership
    return await verifyResourceOwnership(
      db,
      leads,
      input.id,
      ctx.user.id,
      "lead"
    );
  }),
```

### Example 3: Permission-based invoice creation (Real Implementation)

From `server/routers/inbox-router.ts`:

```typescript
invoices: router({
  create: permissionProcedure("create_invoice")
    .input(
      z.object({
        contactId: z.string(),
        entryDate: z.string(),
        paymentTermsDays: z.number().optional(),
        lines: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            productId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // ✅ RBAC: Only owner can create invoices (enforced by permissionProcedure)
      return createBillyInvoice(input);
    }),
}),
```

### Example 4: Admin-only email deletion (Real Implementation)

From `server/routers/inbox-router.ts`:

```typescript
email: router({
  bulkDelete: permissionProcedure("delete_email")
    .use(
      // ✅ RBAC: Add rate limiting on top of permission check (admin-only but still rate limited)
      createRateLimitMiddleware(INBOX_CRM_RATE_LIMIT, "email-delete")
    )
    .input(
      z.object({
        threadIds: z.array(validationSchemas.threadId).min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      // Only admin can delete emails
      // Implementation...
    }),
}),
```

### Example 5: List with ownership filtering

```typescript
listTasks: protectedProcedure.query(async ({ ctx }) => {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks)
    .where(eq(tasks.userId, ctx.user.id))
    .orderBy(desc(tasks.createdAt));
}),
```

## Security Considerations

1. **Always verify ownership** - Never trust client-provided IDs without verifying ownership
2. **Use middleware** - Prefer role/permission middleware over manual checks
3. **Filter by userId** - Always filter list queries by `userId` to prevent data leakage
4. **Default deny** - Unknown permissions are denied by default
5. **Role hierarchy** - Higher roles inherit permissions from lower roles
6. **Owner precedence** - Owner check takes precedence over database role

## Testing

See `server/__tests__/rbac.test.ts` for comprehensive test coverage of all RBAC functions.

Run tests with:

```bash
pnpm test server/__tests__/rbac.test.ts
```

## Troubleshooting

### Common Issues

#### Issue: "FORBIDDEN" error when accessing endpoint

**Symptoms:**

- Getting `FORBIDDEN` error on endpoints that should be accessible
- Error message: "This action requires [Role] role" or "You need permission: [permission]"

**Solutions:**

1. **Check user role:**

   ```typescript
   const userRole = await getUserRole(ctx.user.id);
   console.log("User role:", userRole);
   ```

2. **Verify permission:**

   ```typescript
   const hasPerm = hasPermission(userRole, "create_invoice");
   console.log("Has permission:", hasPerm);
   ```

3. **Check owner configuration:**
   - Verify `ENV.ownerOpenId` matches user's `openId`
   - Owner check takes precedence over database role

#### Issue: "Resource not found" when resource exists

**Symptoms:**

- Getting `NOT_FOUND` error even though resource exists
- May indicate ownership verification is failing

**Solutions:**

1. **Verify resource ownership:**

   ```typescript
   // Check if resource exists and get userId
   const resource = await db
     .select()
     .from(table)
     .where(eq(table.id, resourceId))
     .limit(1);

   console.log("Resource userId:", resource[0]?.userId);
   console.log("Current userId:", ctx.user.id);
   ```

2. **Check if using correct userId:**
   - Ensure `ctx.user.id` is the correct user ID
   - Verify resource's `userId` field matches

#### Issue: Permission check always returns false

**Symptoms:**

- `hasPermission()` always returns `false`
- Unknown action type warnings in logs

**Solutions:**

1. **Verify permission name:**

   ```typescript
   // Check if permission exists in ACTION_PERMISSIONS
   const permission: ActionPermission = "create_invoice";
   const requiredRole = ACTION_PERMISSIONS[permission];
   ```

2. **Check permission spelling:**
   - Ensure permission name matches exactly
   - Check `ActionPermission` type for valid values

#### Issue: Role always returns "user" even for admin

**Symptoms:**

- `getUserRole()` returns "user" for admin users
- Admin endpoints not accessible

**Solutions:**

1. **Check database role:**

   ```sql
   SELECT id, openId, role FROM users WHERE id = [userId];
   ```

   - Verify `role` column is set to `'admin'`

2. **Check owner configuration:**
   - Verify `ENV.ownerOpenId` is set correctly
   - Owner check takes precedence

3. **Verify user exists:**
   - Ensure user record exists in database
   - Check `openId` matches OAuth provider

### Debugging Tips

1. **Enable debug logging:**

   ```typescript
   const userRole = await getUserRole(ctx.user.id);
   logger.debug({ userId: ctx.user.id, userRole }, "[RBAC] User role resolved");
   ```

2. **Check context:**

   ```typescript
   // In tRPC procedure
   console.log("User ID:", ctx.user.id);
   console.log("User Role (if available):", ctx.userRole);
   ```

3. **Verify middleware execution:**
   - Check if middleware is being called
   - Verify `ctx.userRole` is available in context

### Error Codes Reference

| Error Code              | Meaning                             | Solution                             |
| ----------------------- | ----------------------------------- | ------------------------------------ |
| `UNAUTHORIZED`          | User not authenticated              | Ensure user is logged in             |
| `FORBIDDEN`             | User lacks required role/permission | Check user role and permissions      |
| `NOT_FOUND`             | Resource doesn't exist or not owned | Verify resource exists and ownership |
| `INTERNAL_SERVER_ERROR` | Database or system error            | Check logs for details               |

## Migration Guide

### Migrating from manual checks to middleware

**Before:**

```typescript
deleteUser: protectedProcedure
  .input(z.object({ userId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const userRole = await getUserRole(ctx.user.id);
    if (!hasRoleOrHigher(userRole, "admin")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin required" });
    }
    return await deleteUser(input.userId);
  }),
```

**After:**

```typescript
deleteUser: roleProcedure("admin")
  .input(z.object({ userId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // Role check is automatic, ctx.userRole is available
    return await deleteUser(input.userId);
  }),
```

## Implementation Status

### Currently Protected Endpoints

**Invoice Creation (Owner-only):**

- ✅ `inbox.invoices.create` - Uses `permissionProcedure("create_invoice")`
- ✅ `automation.createInvoiceFromJob` - Uses `permissionProcedure("create_invoice")`

**Email Management (Admin-only):**

- ✅ `inbox.email.bulkDelete` - Uses `permissionProcedure("delete_email")`

**Customer Operations (Ownership Verified):**

- ✅ `customer.getInvoices` - Uses `verifyResourceOwnership()`
- ✅ `customer.getEmails` - Uses `verifyResourceOwnership()`
- ✅ `customer.syncBillyInvoices` - Uses `verifyResourceOwnership()`
- ✅ `customer.syncGmailEmails` - Uses `verifyResourceOwnership()`
- ✅ `customer.generateResume` - Uses `verifyResourceOwnership()`
- ✅ `customer.updateProfile` - Uses `verifyResourceOwnership()`
- ✅ `customer.getNotes` - Uses `verifyResourceOwnership()`
- ✅ `customer.addNote` - Uses `verifyResourceOwnership()`

**Lead Operations (Ownership Verified):**

- ✅ `crm.lead.getLead` - Uses `verifyResourceOwnership()`
- ✅ `crm.lead.updateLeadStatus` - Uses `verifyResourceOwnership()`
- ✅ `crm.lead.convertLeadToCustomer` - Uses `verifyResourceOwnership()`

**Total Protected:** 14 endpoints

## See Also

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture overview
- [SECURITY_REVIEW_2025-01-28.md](../../devops-deploy/security/SECURITY_REVIEW_2025-01-28.md) - Security review and fixes
- [DEVELOPMENT_GUIDE.md](../../DEVELOPMENT_GUIDE.md) - Development workflow
- [DOCUMENTATION_ACCURACY_VERIFICATION_RBAC.md](../documentation/DOCUMENTATION_ACCURACY_VERIFICATION_RBAC.md) - Documentation verification report

---

**Document Version:** 1.0.0  
**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team
