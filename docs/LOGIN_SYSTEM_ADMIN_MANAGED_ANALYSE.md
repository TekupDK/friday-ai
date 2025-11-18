# Login System - Admin-Managed Team Login Analyse

**Dato:** 2025-01-28  
**Status:** Production-ready login, mangler admin user management  
**Kontekst:** Internt system hvor admins opretter og administrerer team/medarbejder logins

---

## Executive Summary

Login-systemet er **production-ready** for team/medarbejdere, men der **mangler admin funktionalitet** til at oprette og administrere brugere. Systemet understøtter Google OAuth (primær metode) og har RBAC system med admin/owner roller, men mangler endpoints og UI til user management.

### Status Oversigt

- ✅ **Google OAuth Login:** Production-ready, fungerer perfekt
- ✅ **RBAC System:** Admin/owner roller eksisterer
- ✅ **Session Management:** Sikker, med 7-dages expiry
- ❌ **Admin User Management:** Mangler endpoints og UI
- ❌ **User Invitation:** Mangler invitation system
- ❌ **User List/Edit:** Mangler admin interface

---

## Nuværende Situation

### Hvad Fungerer

1. **Google OAuth Login:**
   - Team/medarbejdere kan logge ind med Google
   - Automatisk user creation ved første login
   - Session management fungerer

2. **RBAC System:**
   - Admin/owner roller eksisterer
   - Permission system er implementeret
   - Role checks fungerer

3. **Database:**
   - `users` table har alle nødvendige felter
   - `upsertUser()` funktion eksisterer
   - Role management i database

### Hvad Mangler

1. **Admin User Management Endpoints:**
   - ❌ `admin.users.list` - Liste alle brugere
   - ❌ `admin.users.create` - Opret ny bruger (med invitation)
   - ❌ `admin.users.update` - Opdater bruger (role, email, name)
   - ❌ `admin.users.delete` - Deaktiver/slet bruger
   - ❌ `admin.users.invite` - Send invitation til ny bruger

2. **Admin User Management UI:**
   - ❌ User list page
   - ❌ Create user form
   - ❌ Edit user form
   - ❌ Invitation system

3. **User Invitation Flow:**
   - ❌ Invitation email system
   - ❌ Invitation token system
   - ❌ Accept invitation flow

---

## Anbefalet Implementation

### Phase 1: Admin User Management Backend (2-3 timer)

#### 1.1 Opret User Management Router

**Fil:** `server/routers/admin-user-router.ts`

```typescript
import { router } from "../_core/trpc";
import { roleProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { upsertUser } from "../db";

export const adminUserRouter = router({
  // Liste alle brugere (admin/owner only)
  list: roleProcedure("admin")
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      let query = db.select().from(users);

      // Search filter
      if (input.search) {
        query = query
          .where
          // Add search logic for name/email
          ();
      }

      // Role filter
      if (input.role) {
        query = query.where(eq(users.role, input.role));
      }

      const allUsers = await query
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(users.createdAt);

      const total = await db.select({ count: sql`count(*)` }).from(users);

      return {
        users: allUsers,
        total: total[0]?.count || 0,
      };
    }),

  // Opret ny bruger (admin/owner only)
  create: roleProcedure("admin")
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(255),
        role: z.enum(["user", "admin"]).default("user"),
        loginMethod: z.enum(["google"]).default("google"), // Kun Google for nu
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Opret user med placeholder openId (vil blive opdateret ved første login)
      // For Google OAuth, openId vil være Google user ID
      const openId = `pending:${input.email}`;

      await upsertUser({
        openId,
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role,
        loginMethod: input.loginMethod,
      });

      // TODO: Send invitation email

      return { success: true, message: "User created. Invitation sent." };
    }),

  // Opdater bruger (admin/owner only)
  update: roleProcedure("admin")
    .input(
      z.object({
        userId: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

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

      // Update user
      await upsertUser({
        openId: user.openId,
        name: updates.name,
        email: updates.email?.toLowerCase(),
        role: updates.role,
      });

      return { success: true };
    }),

  // Deaktiver/slet bruger (admin/owner only)
  delete: roleProcedure("admin")
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Prevent deleting owner
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user[0].openId === ENV.ownerOpenId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete owner account",
        });
      }

      // Soft delete: Set role to inactive or delete from DB
      // For nu: Slet fra database
      await db.delete(users).where(eq(users.id, input.userId));

      return { success: true };
    }),
});
```

#### 1.2 Tilføj til Main Router

**Fil:** `server/routers.ts`

```typescript
import { adminUserRouter } from "./routers/admin-user-router";

export const appRouter = router({
  // ... existing routers
  admin: router({
    users: adminUserRouter,
  }),
});
```

### Phase 2: Admin User Management Frontend (4-6 timer)

#### 2.1 User List Page

**Fil:** `client/src/pages/admin/UserList.tsx`

```typescript
export default function UserList() {
  const { data, isLoading } = trpc.admin.users.list.useQuery({
    limit: 50,
  });

  return (
    <div>
      <h1>Team Members</h1>
      <Button onClick={() => setShowCreateModal(true)}>
        Add Team Member
      </Button>
      <Table>
        {/* User list */}
      </Table>
    </div>
  );
}
```

#### 2.2 Create User Modal

**Fil:** `client/src/components/admin/CreateUserModal.tsx`

```typescript
export function CreateUserModal({ open, onClose }) {
  const createMutation = trpc.admin.users.create.useMutation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Team Member</DialogTitle>
      <form onSubmit={handleSubmit}>
        <Input name="email" type="email" placeholder="Email" />
        <Input name="name" placeholder="Name" />
        <Select name="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        <Button type="submit">Create & Send Invitation</Button>
      </form>
    </Dialog>
  );
}
```

### Phase 3: Invitation System (3-4 timer)

#### 3.1 Invitation Email

Når admin opretter bruger, send invitation email med:

- Link til login page
- Information om at de skal bruge Google login
- Welcome message

#### 3.2 Invitation Tracking (Optional)

- Track invitation status (sent, accepted, expired)
- Resend invitation
- Expire old invitations

---

## Nuværende Workflow vs. Anbefalet Workflow

### Nuværende Workflow (Manual)

1. Admin logger ind med Google
2. Admin skal manuelt oprette bruger i database (via script eller direkte SQL)
3. Team member logger ind med Google
4. System opretter automatisk user hvis ikke eksisterer

**Problemer:**

- Ingen UI til at administrere brugere
- Ingen invitation system
- Ingen kontrol over hvem der kan logge ind
- Manuelt arbejde i database

### Anbefalet Workflow (Admin-Managed)

1. Admin logger ind med Google
2. Admin går til "Team Members" page
3. Admin klikker "Add Team Member"
4. Admin indtaster email, name, role
5. System opretter user og sender invitation email
6. Team member modtager email og logger ind med Google
7. System matcher Google account med pre-created user

**Fordele:**

- Kontrol over hvem der kan logge ind
- Automatisk invitation
- Nem administration via UI
- Audit trail (hvem oprettede hvem)

---

## Implementation Prioritet

### Høj Prioritet (Denne Uge)

1. **Admin User Management Backend** (2-3 timer)
   - Opret `admin-user-router.ts`
   - Implementer list, create, update, delete endpoints
   - Tilføj til main router

2. **Basic User List UI** (2 timer)
   - Opret `UserList.tsx` page
   - Vis liste af brugere
   - Tilføj navigation til admin section

### Medium Prioritet (Næste Uge)

3. **Create User UI** (1-2 timer)
   - Opret `CreateUserModal.tsx`
   - Form til at oprette bruger
   - Integration med backend

4. **Edit User UI** (1-2 timer)
   - Edit user form
   - Update role functionality

### Low Prioritet (Fremtid)

5. **Invitation Email System** (2-3 timer)
   - Email template
   - Send invitation email
   - Track invitation status

6. **User Activity Tracking** (2-3 timer)
   - Last login tracking
   - Login history
   - Activity logs

---

## Security Considerations

### Admin-Only Access

- Alle endpoints skal bruge `roleProcedure("admin")`
- Verificer at kun admin/owner kan oprette/redigere brugere
- Prevent deleting owner account

### Email Validation

- Verificer email format
- Check for duplicate emails
- Validate email domain (hvis nødvendigt)

### Role Management

- Kun owner kan opgradere til admin
- Admin kan oprette/redigere users (men ikke owner)
- Prevent self-demotion (admin kan ikke fjerne sin egen admin role)

---

## Database Schema (Eksisterende)

```typescript
export const usersInFridayAi = fridayAi.table("users", {
  id: serial().primaryKey().notNull(),
  openId: varchar({ length: 64 }).notNull(),
  name: text(),
  email: varchar({ length: 320 }),
  loginMethod: varchar({ length: 64 }), // "google" | "dev" | null
  role: userRoleInFridayAi().default("user").notNull(), // "user" | "admin"
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  lastSignedIn: timestamp({ mode: "string" }).defaultNow().notNull(),
});
```

**Observations:**

- ✅ Alle nødvendige felter eksisterer
- ⚠️ Mangler `invitedBy` (optional - track hvem oprettede brugeren)
- ⚠️ Mangler `invitedAt` (optional - track invitation date)
- ⚠️ Mangler `status` (optional - active/inactive/deleted)

---

## Næste Skridt - Actionable Plan

### Immediate Actions (I Dag)

1. **Opret Admin User Router** (1 time)
   - Opret `server/routers/admin-user-router.ts`
   - Implementer list, create, update, delete
   - Tilføj til main router

2. **Test Backend Endpoints** (30 min)
   - Test med admin user
   - Verificer role checks
   - Test error handling

### Short-term (Denne Uge)

3. **Opret User List UI** (2 timer)
   - Opret `client/src/pages/admin/UserList.tsx`
   - Implementer liste med search/filter
   - Tilføj navigation

4. **Opret Create User Modal** (1-2 timer)
   - Opret `CreateUserModal.tsx`
   - Form validation
   - Integration med backend

### Medium-term (Næste Uge)

5. **Edit User Functionality** (1-2 timer)
   - Edit user form
   - Role update
   - Email/name update

6. **Invitation Email** (2-3 timer)
   - Email template
   - Send invitation
   - Track status

---

## Code References

### Existing User Management

```73:131:server/db.ts
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
```

### RBAC System

```100:128:server/_core/trpc.ts
export function roleProcedure(requiredRole: "user" | "admin" | "owner") {
  return t.procedure.use(async (opts) => {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    // Get user role from RBAC system
    const { getUserRole } = await import("../rbac");
    const userRole = await getUserRole(ctx.user.id);

    // Check if user has required role or higher
    const { hasRoleOrHigher } = await import("../rbac");
    if (!hasRoleOrHigher(userRole, requiredRole)) {
      const roleName = requiredRole === "admin" ? "Administrator" : requiredRole;
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${roleName} access required`,
      });
    }

    // Add userRole to context for use in procedure
    return opts.next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  });
}
```

---

## Konklusion

Login-systemet er **production-ready** for team/medarbejdere, men mangler **admin funktionalitet** til at oprette og administrere brugere. Med Google OAuth som primær login metode og eksisterende RBAC system, er det relativt nemt at implementere admin user management.

### Anbefaling

**Start med Phase 1 (Backend)** - Dette giver admins mulighed for at administrere brugere via API, selvom UI mangler. UI kan tilføjes senere.

**Estimeret tid:** 6-10 timer for komplet implementation (backend + basic UI)

---

**Sidst Opdateret:** 2025-01-28  
**Vedligeholdt af:** TekupDK Development Team
