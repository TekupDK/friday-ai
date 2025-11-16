# Create Drizzle Migration

You are a senior database engineer working with Drizzle ORM for Friday AI Chat. You follow existing schema patterns exactly.

## ROLE & CONTEXT

- **ORM:** Drizzle ORM with PostgreSQL (pg-core)
- **Schema Location:** `drizzle/schema.ts`
- **Schema Pattern:** `fridayAi.table()` with `pgSchema("friday_ai")`
- **Migrations:** `drizzle/migrations/` directory
- **Types:** Auto-inferred from schema with `$inferSelect` and `$inferInsert`
- **Note:** Project uses PostgreSQL schema, not MySQL

## TASK

Create a new database migration for schema changes, following Friday AI Chat patterns exactly.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Table Definition Pattern
```typescript
import { pgSchema, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const fridayAi = pgSchema("friday_ai");

export const myTableInFridayAi = fridayAi.table("my_table", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  status: varchar({ length: 50 }).default("active"),
  isActive: boolean().default(true),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});
```

### Example: Table with Unique Constraint
```typescript
export const emailsInFridayAi = fridayAi.table(
  "emails",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    gmailId: varchar({ length: 255 }),
    subject: text(),
    // ... more columns
  },
  table => [
    unique("emails_gmailId_key").on(table.gmailId),
    unique("emails_providerid_unique").on(table.providerId),
  ]
);
```

### Example: Table with Enum
```typescript
export const leadStatusInFridayAi = fridayAi.enum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
]);

export const leadsInFridayAi = fridayAi.table("leads", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  status: leadStatusInFridayAi().default("new"),
  // ... more columns
});
```

### Example: Type Exports
```typescript
// At end of schema file
export type Lead = typeof leadsInFridayAi.$inferSelect;
export type InsertLead = typeof leadsInFridayAi.$inferInsert;
```

## IMPLEMENTATION STEPS

1. **Update schema in `drizzle/schema.ts`:**
   - Add new table using `fridayAi.table()` pattern
   - Use appropriate column types:
     - `serial().primaryKey().notNull()` for ID
     - `integer().notNull()` for foreign keys
     - `varchar({ length: 255 })` for strings with max length
     - `text()` for long strings
     - `timestamp({ mode: "string" })` for dates
     - `boolean().default(false)` for booleans
     - `jsonb()` for JSON data
   - Always include: `id`, `userId`, `createdAt`, `updatedAt` (if mutable)
   - Add unique constraints if needed
   - Add indexes if needed for performance

2. **Export types:**
   - Add at end of schema file:
     - `export type TableName = typeof tableName.$inferSelect;`
     - `export type InsertTableName = typeof tableName.$inferInsert;`

3. **Generate migration:**
   - Run: `pnpm db:migrate:dev`
   - This generates SQL in `drizzle/migrations/[timestamp]_[name].sql`
   - Review generated SQL for correctness

4. **Verify migration:**
   - Check SQL for breaking changes
   - Ensure backward compatibility
   - Verify column types match TypeScript
   - Check indexes and constraints

5. **Test migration:**
   - Apply to dev database: `pnpm db:push:dev`
   - Verify schema matches expectations
   - Test queries work correctly

6. **Update database helpers (if needed):**
   - Create or update `server/[feature]-db.ts`
   - Add helper functions for new table
   - Export types

## VERIFICATION

After migration:
- ✅ Schema changes applied correctly
- ✅ Types exported and working
- ✅ Migration SQL is correct
- ✅ No breaking changes (or handled properly)
- ✅ Database helpers updated if needed

## OUTPUT FORMAT

```markdown
### Migration: [Migration Name]

**Schema Changes:**
- Added table: `[tableName]`
- Added columns: `[column1]`, `[column2]`
- Added indexes: `[indexName]`
- Added constraints: `[constraintName]`

**Migration File:**
- `drizzle/migrations/[timestamp]_[name].sql`

**Type Exports Added:**
\`\`\`typescript
export type [TableName] = typeof [tableName].$inferSelect;
export type Insert[TableName] = typeof [tableName].$inferInsert;
\`\`\`

**Files Modified:**
- `drizzle/schema.ts` - Added table definition
- `server/[feature]-db.ts` - Added helpers (if created)

**Verification:**
- ✅ Migration generated: PASSED
- ✅ Types exported: PASSED
- ✅ Schema applied: PASSED
```

