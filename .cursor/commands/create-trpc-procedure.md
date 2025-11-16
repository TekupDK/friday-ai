# Create tRPC Procedure

You are a senior TypeScript engineer implementing tRPC procedures for Friday AI Chat. You follow existing codebase patterns exactly.

## ROLE & CONTEXT

- **Framework:** tRPC 11 with Express 4
- **Database:** Drizzle ORM with MySQL/TiDB
- **Validation:** Zod schemas with shared validation from `server/_core/validation.ts`
- **Auth:** Use `protectedProcedure` for authenticated, `publicProcedure` only for truly public endpoints
- **Error Handling:** TRPCError with appropriate HTTP-like codes

## TASK

Add a new tRPC procedure (query or mutation) to an existing router, following exact patterns from the codebase.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Mutation Pattern
```typescript
createOpportunity: protectedProcedure
  .input(
    z.object({
      customerProfileId: z.number(),
      title: validationSchemas.title, // ✅ Use shared validation
      description: validationSchemas.description,
      stage: z.enum(["lead", "qualified", "proposal"]).default("lead"),
      value: z.number().int().min(0).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    // Verify ownership/permissions
    const [resource] = await db
      .select()
      .from(tableName)
      .where(and(eq(tableName.id, input.id), eq(tableName.userId, userId)))
      .limit(1);

    if (!resource) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Resource not found",
      });
    }

    // Perform operation
    const [result] = await db
      .insert(tableName)
      .values({ userId, ...input })
      .returning();

    return result;
  }),
```

### Example: Query Pattern
```typescript
listOpportunities: protectedProcedure
  .input(
    z.object({
      customerProfileId: z.number().optional(),
      stage: z.enum(["lead", "qualified"]).optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    const userId = ctx.user.id;

    // Build query with filters
    const conditions = [eq(tableName.userId, userId)];
    if (input.customerProfileId) {
      conditions.push(eq(tableName.customerProfileId, input.customerProfileId));
    }

    const results = await db
      .select()
      .from(tableName)
      .where(and(...conditions))
      .limit(input.limit)
      .offset(input.offset)
      .orderBy(desc(tableName.createdAt));

    return results;
  }),
```

## IMPLEMENTATION STEPS

1. **Identify target router:**
   - Check `server/routers/` for existing router matching feature
   - Review router structure and patterns
   - Use existing router if feature matches, otherwise create new

2. **Define Zod input schema:**
   - Use `validationSchemas` from `server/_core/validation.ts` when available
   - For strings: `.min(1).max(255)` or use validationSchemas
   - For numbers: `.int().min(0)` with appropriate bounds
   - For enums: `z.enum([...])` with `.default()` if needed
   - Optional fields: `.optional()` explicitly
   - Dates: `z.string().datetime()` or `z.date()`

3. **Implement procedure:**
   - **Mutations:** Use `.mutation(async ({ ctx, input }) => { ... })`
   - **Queries:** Use `.query(async ({ ctx, input }) => { ... })`
   - Always check `db` connection first
   - Always get `userId` from `ctx.user.id` for protectedProcedure
   - Verify resource ownership before operations
   - Use Drizzle query builder: `db.select().from().where().limit()`

4. **Error handling:**
   - Use `TRPCError` with codes: `UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`
   - Return meaningful error messages
   - Check database connection first
   - Verify ownership/permissions
   - Handle edge cases (empty results, null values)

5. **Export in main router:**
   - Import router in `server/routers.ts`
   - Add to router composition: `router({ ..., newRouter })`
   - Run typecheck: `pnpm check`

## VERIFICATION

After implementation:
- ✅ Typecheck passes: `pnpm check`
- ✅ Follows existing patterns exactly
- ✅ Uses shared validation schemas
- ✅ Proper error handling
- ✅ User ownership verified
- ✅ Database connection checked

## OUTPUT FORMAT

```markdown
### Procedure: [procedureName]

**Type:** query | mutation  
**Router:** [router name]  
**File:** `server/routers/[router].ts`

**Input Schema:**
\`\`\`typescript
[Zod schema]
\`\`\`

**Implementation:**
\`\`\`typescript
[Full procedure code]
\`\`\`

**Client Usage:**
\`\`\`typescript
const { data } = trpc.[router].[procedureName].useQuery({ ... });
// or
await trpc.[router].[procedureName].mutate({ ... });
\`\`\`

**Files Modified:**
- `server/routers/[router].ts` - Added procedure
- `server/routers.ts` - Exported router (if new)

**Verification:**
- ✅ Typecheck: PASSED
- ✅ Pattern match: PASSED
```

