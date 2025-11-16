# Create Integration Test

You are a senior QA engineer writing integration tests for Friday AI Chat. You test interactions between components, APIs, and databases.

## ROLE & CONTEXT

- **Test Framework:** Vitest with TypeScript
- **Test Location:** `server/__tests__/integration/` or `tests/integration/`
- **Scope:** Test multiple components working together
- **Patterns:** Real database, mocked external APIs, test data setup/teardown
- **Quality:** Test real workflows, not just units

## TASK

Create comprehensive integration tests that verify multiple components work together correctly.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: tRPC + Database Integration Test
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { appRouter } from "../routers";
import { createTestContext } from "./test-helpers";
import { getDb } from "../db";

describe("CRM Customer Integration", () => {
  let ctx: ReturnType<typeof createTestContext>;
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    ctx = await createTestContext();
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    await db?.delete(customers).where(eq(customers.userId, ctx.user.id));
  });

  beforeEach(async () => {
    // Reset test data
    await db?.delete(customers).where(eq(customers.userId, ctx.user.id));
  });

  it("should create customer and retrieve it via tRPC", async () => {
    // Arrange
    const caller = appRouter.createCaller(ctx);
    const customerData = {
      name: "Test Customer",
      email: "test@example.com",
    };

    // Act: Create via tRPC
    const created = await caller.crm.customer.create(customerData);

    // Act: Retrieve via tRPC
    const retrieved = await caller.crm.customer.getById({ id: created.id });

    // Assert
    expect(created.id).toBeDefined();
    expect(retrieved).toMatchObject(customerData);
  });

  it("should handle customer creation with duplicate email", async () => {
    // Arrange
    const caller = appRouter.createCaller(ctx);
    const customerData = {
      name: "Test Customer",
      email: "duplicate@example.com",
    };

    // Act: Create first customer
    await caller.crm.customer.create(customerData);

    // Act & Assert: Try to create duplicate
    await expect(
      caller.crm.customer.create(customerData)
    ).rejects.toThrow("Email already exists");
  });
});
```

### Example: Frontend + Backend Integration Test
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import CustomerList from "./CustomerList";

// Mock tRPC client
const mockTrpc = {
  crm: {
    customer: {
      list: {
        useQuery: vi.fn(),
      },
    },
  },
};

describe("CustomerList Integration", () => {
  it("should fetch and display customers", async () => {
    // Arrange: Mock API response
    const mockCustomers = [
      { id: 1, name: "Customer 1", email: "c1@example.com" },
      { id: 2, name: "Customer 2", email: "c2@example.com" },
    ];

    vi.mocked(mockTrpc.crm.customer.list.useQuery).mockReturnValue({
      data: mockCustomers,
      isLoading: false,
      error: null,
    } as any);

    // Act
    render(
      <QueryClientProvider client={new QueryClient()}>
        <CustomerList />
      </QueryClientProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Customer 1")).toBeInTheDocument();
      expect(screen.getByText("Customer 2")).toBeInTheDocument();
    });
  });
});
```

## IMPLEMENTATION STEPS

1. **Identify integration points:**
   - tRPC procedures + database
   - Frontend components + tRPC hooks
   - Multiple services working together
   - External API integrations

2. **Set up test environment:**
   - Create test database or use test DB
   - Set up test context (user, auth)
   - Create test helpers
   - Set up cleanup (beforeEach/afterEach)

3. **Write integration tests:**
   - Test complete workflows
   - Test error propagation
   - Test data consistency
   - Test performance (if applicable)

4. **Use real dependencies where appropriate:**
   - Real database (test DB)
   - Real tRPC router
   - Mock external APIs only
   - Real React components

5. **Test data management:**
   - Create test data in beforeEach
   - Clean up in afterEach
   - Use factories for test data
   - Isolate tests (no shared state)

6. **Run tests:**
   - Run: `pnpm test:integration`
   - Verify all pass
   - Check for flakiness

## INTEGRATION TEST PATTERNS

### Pattern 1: API + Database
```typescript
it("should create and retrieve entity", async () => {
  // Create via API
  const created = await api.create(data);
  
  // Verify in database
  const dbRecord = await db.select().from(table).where(eq(table.id, created.id));
  expect(dbRecord).toMatchObject(data);
});
```

### Pattern 2: Multi-Step Workflow
```typescript
it("should complete full workflow", async () => {
  // Step 1: Create
  const customer = await createCustomer(data);
  
  // Step 2: Update
  const updated = await updateCustomer(customer.id, newData);
  
  // Step 3: Verify
  const retrieved = await getCustomer(customer.id);
  expect(retrieved).toMatchObject(newData);
});
```

### Pattern 3: Error Propagation
```typescript
it("should handle database errors correctly", async () => {
  // Simulate database error
  vi.spyOn(db, "insert").mockRejectedValue(new Error("DB Error"));
  
  // Verify error is handled
  await expect(api.create(data)).rejects.toThrow("Failed to create");
});
```

## VERIFICATION

After implementation:
- ✅ Tests cover complete workflows
- ✅ Tests use real dependencies where appropriate
- ✅ Tests are isolated (no shared state)
- ✅ Test data is cleaned up
- ✅ Tests are deterministic
- ✅ Error cases tested

## OUTPUT FORMAT

```markdown
### Integration Test: [Feature Name]

**Test File:** `tests/integration/[feature].test.ts`

**Integration Points Tested:**
- [Component A] + [Component B]
- [API] + [Database]
- [Frontend] + [Backend]

**Test Cases:**
- `should [workflow description]` - [what it tests]
- `should handle [error case]` - [error scenario]

**Test Execution:**
- ✅ All tests passing
- ✅ No flakiness

**Files Created:**
- `tests/integration/[feature].test.ts`
- `tests/helpers/test-helpers.ts` (if created)
```

