# Test Fixes In Progress - January 28, 2025

**Status:** 🔄 In Progress  
**Started:** 2025-01-28  
**Priority:** P1 - High

---

## Current Issue

### admin-user-router.test.ts - 4 Tests Failing

**Error:** `db.select(...).from(...).orderBy is not a function`

**Root Cause:**  
Mock structure for Drizzle ORM query chain is incorrect. The `from()` method should return an object with `orderBy()` method, but the current mock structure doesn't properly chain the methods.

**Affected Tests:**

1. `should allow admin to list users` - Timeout (5000ms)
2. `should allow owner to list users` - Timeout (5000ms)
3. `should handle search with empty string` - `orderBy is not a function`
4. `should handle pagination correctly` - `orderBy is not a function`

**Drizzle Query Chain Pattern:**

```typescript
db.select()
  .from(users)
  .orderBy(orderFn(orderColumn))
  .limit(input.limit)
  .offset(input.offset);
```

**Current Mock Structure:**

```typescript
const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
const mockFromResult = {
  where: mockWhere,
  orderBy: mockOrderBy, // This should be a function
};
const mockFrom = vi.fn().mockReturnValue(mockFromResult);
```

**Problem:**  
`mockOrderBy` is a function, but when accessed as `mockFromResult.orderBy`, it should be callable. The issue is that `mockFromResult.orderBy` is set to `mockOrderBy` (a function), but when Drizzle calls `.orderBy()`, it expects the function to be directly accessible.

**Solution Needed:**

- Ensure `mockFromResult.orderBy` is a callable function
- Verify the chain: `from()` → object with `orderBy()` → object with `limit()` → object with `offset()` → Promise

---

## Next Steps

1. ✅ Fix mock structure for `orderBy` chain
2. ⏳ Fix timeout issues (increase timeout or fix async issues)
3. ⏳ Test all 4 failing tests
4. ⏳ Move to next failing test (crm-smoke.test.ts)

---

**Last Updated:** 2025-01-28 01:40 UTC
