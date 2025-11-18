# Fix Database Query Issues

You are a senior backend engineer fixing database query issues in Friday AI Chat. You use Drizzle ORM patterns correctly.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **ORM:** Drizzle ORM with PostgreSQL
- **Common Issues:** N+1 queries, missing indexes, type errors, performance
- **Patterns:** User-scoped queries, proper error handling

## TASK

Fix database query issues including N+1 queries, missing indexes, and type errors.

## COMMON DATABASE ISSUES

### Issue 1: N+1 Queries

```typescript
// ❌ Bad: N+1 queries
const customers = await getCustomers();
for (const customer of customers) {
  const invoices = await getCustomerInvoices(customer.id); // N+1!
}

// ✅ Good: Batch query
const customers = await getCustomers();
const customerIds = customers.map(c => c.id);
const allInvoices = await db
  .select()
  .from(invoices)
  .where(inArray(invoices.customerId, customerIds)); // Single query
```

### Issue 2: Missing Indexes

```typescript
// ❌ Bad: Slow query without index
const result = await db
  .select()
  .from(customers)
  .where(eq(customers.email, email)); // Slow if no index

// ✅ Good: Add index in schema
export const customersInFridayAi = fridayAi.table(
  "customers",
  {
    // ... columns
  },
  table => [
    index("customers_email_idx").on(table.email), // ✅ Index added
  ]
);
```

### Issue 3: Type Errors

```typescript
// ❌ Bad: Type mismatch
const result = await db
  .select()
  .from(customers)
  .where(eq(customers.id, input.id)); // input.id is string, id is number

// ✅ Good: Convert type
const result = await db
  .select()
  .from(customers)
  .where(eq(customers.id, parseInt(input.id, 10))); // ✅ Converted
```

### Issue 4: Missing User Ownership Check

```typescript
// ❌ Bad: No ownership check
const result = await db
  .select()
  .from(customers)
  .where(eq(customers.id, customerId));

// ✅ Good: Always check ownership
const result = await db
  .select()
  .from(customers)
  .where(
    and(
      eq(customers.id, customerId),
      eq(customers.userId, userId) // ✅ Ownership check
    )
  );
```

## IMPLEMENTATION STEPS

1. **Identify issues:**
   - Check for N+1 queries
   - Check for missing indexes
   - Check for type errors
   - Check for missing ownership checks

2. **Fix N+1 queries:**
   - Batch queries
   - Use joins where appropriate
   - Load related data in one query

3. **Add indexes:**
   - Identify slow queries
   - Add indexes in schema
   - Create migration

4. **Fix type errors:**
   - Convert types properly
   - Use Drizzle type inference
   - Fix type mismatches

5. **Add ownership checks:**
   - Always filter by userId
   - Verify ownership before operations
   - Throw NOT_FOUND if not owned

6. **Verify:**
   - Queries work correctly
   - Performance improved
   - Typecheck passes

## OUTPUT FORMAT

```markdown
### Database Query Fixes

**Issues Fixed:**

- N+1 queries: [count] fixed
- Missing indexes: [count] added
- Type errors: [count] fixed
- Ownership checks: [count] added

**Files Modified:**

- [list]

**Migrations Created:**

- [list if any]

**Verification:**

- ✅ Queries: WORKING
- ✅ Performance: IMPROVED
- ✅ Typecheck: PASSED
```
