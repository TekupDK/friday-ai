# Feature Development Guide - Friday AI Chat

**Date:** 2025-01-28  
**Version:** 1.0.0  
**Purpose:** Step-by-step guide for building features in Friday AI Chat

---

## Overview

This guide provides a systematic approach to building features in Friday AI Chat, following established patterns and best practices. All features follow the same structure: **Database → Backend → Frontend → Testing**.

---

## Development Workflow

### Standard Feature Development Flow

```
1. Planning & Design
   ↓
2. Database Layer (Schema + Helpers)
   ↓
3. Backend Layer (tRPC Routers + Business Logic)
   ↓
4. Frontend Layer (Components + Pages)
   ↓
5. Testing (Unit + Integration + E2E)
   ↓
6. Documentation
```

---

## Step 1: Planning & Design

### Tasks

- [ ] Define feature requirements
- [ ] Identify database tables needed
- [ ] Plan API endpoints
- [ ] Design UI/UX (if frontend)
- [ ] Check dependencies

### Example: Subscription Recommendation Feature

**Requirements:**
- Analyze customer invoice history
- Recommend subscription plan (tier1-3, flex_basis, flex_plus)
- Return confidence score and reasoning

**Database Tables:**
- `customer_profiles` (existing)
- `customer_invoices` (existing)
- `subscriptions` (existing)

**API Endpoints:**
- `GET subscriptions.getRecommendation` - Get plan recommendation
- `GET subscriptions.predictChurnRisk` - Get churn prediction

**Dependencies:**
- None (uses existing tables)

---

## Step 2: Database Layer

### 2.1 Schema Changes (if needed)

**File:** `drizzle/schema.ts`

**Pattern:**
```typescript
export const myTableInFridayAi = fridayAi.table("my_table", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  // ... other fields
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

// Export
export const myTable = myTableInFridayAi;
export type MyTable = typeof myTableInFridayAi.$inferSelect;
export type InsertMyTable = typeof myTableInFridayAi.$inferInsert;
```

**Best Practices:**
- Always include `id`, `userId`, `createdAt`, `updatedAt`
- Use camelCase for column names
- Add indexes for foreign keys and frequently queried fields
- Use appropriate types (varchar, integer, text, jsonb, timestamp)

**Verification:**
```bash
pnpm db:push:dev  # Push schema changes
```

### 2.2 Database Helpers

**File:** `server/*-db.ts` (e.g., `server/subscription-db.ts`)

**Pattern:**
```typescript
import { getDb } from "./db";
import { myTable, type MyTable, type InsertMyTable } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all items for a user
 */
export async function getUserItems(
  userId: number,
  options?: { limit?: number; offset?: number }
): Promise<MyTable[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(myTable)
    .where(eq(myTable.userId, userId))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0);
}

/**
 * Create new item
 */
export async function createItem(
  data: InsertMyTable
): Promise<MyTable> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(myTable).values(data).returning();
  return result[0];
}

/**
 * Update item
 */
export async function updateItem(
  id: number,
  userId: number,
  data: Partial<InsertMyTable>
): Promise<MyTable> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(myTable)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(and(eq(myTable.id, id), eq(myTable.userId, userId)))
    .returning();

  if (result.length === 0) {
    throw new Error("Item not found");
  }

  return result[0];
}

/**
 * Delete item
 */
export async function deleteItem(
  id: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(myTable)
    .where(and(eq(myTable.id, id), eq(myTable.userId, userId)));
}
```

**Best Practices:**
- Always check `getDb()` returns valid connection
- Always filter by `userId` for user-scoped queries
- Use `returning()` for INSERT/UPDATE to get created/updated record
- Throw descriptive errors
- Use Drizzle ORM query builder (not raw SQL unless necessary)

**Verification:**
- Test queries manually or write unit tests
- Check TypeScript types are correct

---

## Step 3: Backend Layer

### 3.1 tRPC Router

**File:** `server/routers/*-router.ts` (e.g., `server/routers/subscription-router.ts`)

**Pattern:**
```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { createItem, getUserItems, updateItem, deleteItem } from "../my-db";

export const myRouter = router({
  /**
   * List all items for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).optional().default(20),
        offset: z.number().int().nonnegative().optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getUserItems(ctx.user.id, input);
    }),

  /**
   * Get single item
   */
  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const items = await getUserItems(ctx.user.id, { limit: 1 });
      const item = items.find(i => i.id === input.id);
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }
      return item;
    }),

  /**
   * Create new item
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createItem({
        ...input,
        userId: ctx.user.id,
      });
    }),

  /**
   * Update item
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await updateItem(id, ctx.user.id, data);
    }),

  /**
   * Delete item
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteItem(input.id, ctx.user.id);
      return { success: true };
    }),
});
```

**Best Practices:**
- Always use `protectedProcedure` (requires authentication)
- Use Zod for input validation
- Use `.query()` for GET operations, `.mutation()` for POST/PUT/DELETE
- Always use `ctx.user.id` (never trust client-provided userId)
- Throw `TRPCError` with appropriate codes (`NOT_FOUND`, `BAD_REQUEST`, `UNAUTHORIZED`)
- Add JSDoc comments for each procedure
- Use descriptive procedure names (list, get, create, update, delete)

**Verification:**
```bash
pnpm check  # TypeScript check
```

### 3.2 Register Router

**File:** `server/routers.ts`

**Pattern:**
```typescript
import { myRouter } from "./routers/my-router";

export const appRouter = router({
  // ... existing routers
  my: myRouter,
});
```

### 3.3 Business Logic (if complex)

**File:** `server/*-actions.ts` or `server/*-ai.ts` (e.g., `server/subscription-ai.ts`)

**Pattern:**
```typescript
/**
 * Complex business logic function
 */
export async function complexBusinessLogic(
  customerId: number,
  userId: number,
  options?: { includeDetails?: boolean }
): Promise<ResultType> {
  // 1. Validate inputs
  if (!customerId || !userId) {
    throw new Error("Invalid inputs");
  }

  // 2. Fetch data
  const db = await getDb();
  const customer = await getCustomer(customerId, userId);

  // 3. Perform calculations/analysis
  const result = calculateSomething(customer);

  // 4. Return result
  return result;
}
```

**Best Practices:**
- Keep business logic separate from routers
- Make functions pure when possible
- Handle errors gracefully
- Add TypeScript types for all parameters and return values

---

## Step 4: Frontend Layer

### 4.1 tRPC Hooks Usage

**Pattern:**
```typescript
import { trpc } from "@/lib/trpc";

function MyComponent() {
  // Query (GET)
  const { data, isLoading, error } = trpc.my.list.useQuery({
    limit: 20,
    offset: 0,
  });

  // Mutation (POST/PUT/DELETE)
  const createMutation = trpc.my.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().my.list.invalidate();
      toast.success("Item created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: "New Item",
      description: "Description",
    });
  };

  // ... rest of component
}
```

**Best Practices:**
- Use `useQuery` for fetching data
- Use `useMutation` for creating/updating/deleting
- Always invalidate queries after mutations
- Show loading states
- Handle errors with toast notifications
- Use `useUtils()` for programmatic cache invalidation

### 4.2 Component Structure

**File:** `client/src/components/my/MyComponent.tsx`

**Pattern:**
```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MyComponentProps {
  userId: number;
  onItemSelect?: (item: Item) => void;
}

export default function MyComponent({ userId, onItemSelect }: MyComponentProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: items, isLoading, error } = trpc.my.list.useQuery({
    limit: 20,
  });

  const createMutation = trpc.my.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().my.list.invalidate();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2>My Items</h2>
      {items?.map((item) => (
        <Card key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <Button onClick={() => onItemSelect?.(item)}>
            Select
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

**Best Practices:**
- Use TypeScript interfaces for props
- Handle loading and error states
- Use shadcn/ui components
- Follow Tailwind CSS patterns
- Extract complex logic to custom hooks
- Make components reusable

### 4.3 Page Component

**File:** `client/src/pages/my/MyPage.tsx`

**Pattern:**
```typescript
import { useRoute } from "wouter";
import MyComponent from "@/components/my/MyComponent";

export default function MyPage() {
  const [match, params] = useRoute("/my/:id?");

  return (
    <div className="container mx-auto p-6">
      <h1>My Page</h1>
      <MyComponent userId={1} />
    </div>
  );
}
```

**Best Practices:**
- Use Wouter for routing
- Keep pages simple (delegate to components)
- Use consistent layout patterns

### 4.4 Add Route

**File:** `client/src/App.tsx`

**Pattern:**
```typescript
import MyPage from "./pages/my/MyPage";

// In routes array:
<Route path="/my" component={MyPage} />
```

---

## Step 5: Testing

### 5.1 Unit Tests

**File:** `server/__tests__/my-db.test.ts`

**Pattern:**
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createItem, getUserItems } from "../my-db";

describe("my-db", () => {
  beforeEach(async () => {
    // Setup test data
  });

  it("should create item", async () => {
    const item = await createItem({
      userId: 1,
      name: "Test Item",
    });

    expect(item.id).toBeDefined();
    expect(item.name).toBe("Test Item");
  });

  it("should get user items", async () => {
    const items = await getUserItems(1);
    expect(items.length).toBeGreaterThan(0);
  });
});
```

### 5.2 Integration Tests

**File:** `server/__tests__/my-router.test.ts`

**Pattern:**
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import { createTestContext } from "./test-utils";

describe("my router", () => {
  const ctx = createTestContext();

  it("should list items", async () => {
    const caller = appRouter.createCaller(ctx);
    const items = await caller.my.list({ limit: 10 });
    expect(items).toBeDefined();
  });
});
```

### 5.3 E2E Tests

**File:** `tests/e2e/my-feature.spec.ts`

**Pattern:**
```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("should create item", async ({ page }) => {
    await page.goto("/my");
    await page.click("button:has-text('Create')");
    await page.fill('input[name="name"]', "Test Item");
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=Test Item")).toBeVisible();
  });
});
```

**Verification:**
```bash
pnpm test  # Run all tests
```

---

## Step 6: Documentation

### 6.1 API Documentation

**File:** `docs/api/MY_FEATURE.md`

**Pattern:**
```markdown
# My Feature API

## Endpoints

### `GET /api/trpc/my.list`
List all items for current user.

**Query Parameters:**
- `limit` (number, optional): Max items to return (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Item 1",
    "description": "Description"
  }
]
```

### `POST /api/trpc/my.create`
Create new item.

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "New Item",
  "description": "Description",
  "createdAt": "2025-01-28T10:00:00Z"
}
```
```

### 6.2 Component Documentation

**File:** `docs/components/MY_COMPONENT.md`

**Pattern:**
```markdown
# MyComponent

Component for displaying and managing items.

## Props

- `userId` (number, required): User ID
- `onItemSelect` (function, optional): Callback when item is selected

## Usage

```tsx
<MyComponent 
  userId={1} 
  onItemSelect={(item) => console.log(item)} 
/>
```
```

---

## Verification Checklist

After completing a feature, verify:

- [ ] Database schema is correct and migrated
- [ ] Database helpers work correctly
- [ ] tRPC router has all needed endpoints
- [ ] Input validation with Zod
- [ ] Error handling is proper
- [ ] Frontend components work
- [ ] Loading and error states handled
- [ ] TypeScript types are correct (`pnpm check`)
- [ ] Tests pass (`pnpm test`)
- [ ] No linter errors
- [ ] Documentation updated

---

## Common Patterns

### Pattern: List with Pagination

**Backend:**
```typescript
list: protectedProcedure
  .input(z.object({
    limit: z.number().int().positive().max(100).optional().default(20),
    offset: z.number().int().nonnegative().optional().default(0),
  }))
  .query(async ({ ctx, input }) => {
    return await getUserItems(ctx.user.id, input);
  }),
```

**Frontend:**
```typescript
const [page, setPage] = useState(0);
const limit = 20;

const { data } = trpc.my.list.useQuery({
  limit,
  offset: page * limit,
});
```

### Pattern: Create with Optimistic Update

**Frontend:**
```typescript
const createMutation = trpc.my.create.useMutation({
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await trpc.useUtils().my.list.cancel();
    
    // Snapshot previous value
    const previous = trpc.useUtils().my.list.getData();
    
    // Optimistically update
    trpc.useUtils().my.list.setData(undefined, (old) => [
      ...(old || []),
      { ...newItem, id: Date.now() }, // Temporary ID
    ]);
    
    return { previous };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    trpc.useUtils().my.list.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    trpc.useUtils().my.list.invalidate();
  },
});
```

### Pattern: Error Handling

**Backend:**
```typescript
import { TRPCError } from "@trpc/server";

if (!item) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Item not found",
  });
}
```

**Frontend:**
```typescript
const { error } = trpc.my.get.useQuery({ id: 1 });

if (error) {
  if (error.data?.code === "NOT_FOUND") {
    return <div>Item not found</div>;
  }
  return <div>Error: {error.message}</div>;
}
```

---

## Best Practices Summary

1. **Always filter by userId** - Never trust client-provided userId
2. **Use TypeScript strictly** - No `any` types
3. **Validate inputs** - Use Zod schemas
4. **Handle errors** - Show user-friendly messages
5. **Test thoroughly** - Unit, integration, and E2E tests
6. **Document everything** - API docs, component docs, code comments
7. **Follow patterns** - Use existing code as reference
8. **Keep it simple** - Don't over-engineer
9. **Type safety** - Use Drizzle inferred types
10. **Performance** - Add indexes, use pagination, cache when appropriate

---

## Quick Reference

### File Structure

```
server/
├── routers/
│   └── my-router.ts          # tRPC router
├── my-db.ts                  # Database helpers
├── my-actions.ts             # Business logic (optional)
└── __tests__/
    └── my-router.test.ts     # Tests

client/src/
├── components/
│   └── my/
│       └── MyComponent.tsx   # Reusable component
└── pages/
    └── my/
        └── MyPage.tsx        # Page component

drizzle/
└── schema.ts                 # Database schema
```

### Common Commands

```bash
# Type check
pnpm check

# Run tests
pnpm test

# Database migration
pnpm db:push:dev

# Start dev server
pnpm dev
```

---

**Last Updated:** 2025-01-28  
**Maintained by:** Friday AI Chat Development Team

