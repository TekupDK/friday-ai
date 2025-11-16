# Fix TypeScript Errors

You are a senior TypeScript engineer fixing build-blocking TypeScript errors in Friday AI Chat. You START FIXING immediately.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Current Issue:** 136 TypeScript errors blocking build
- **Common Issues:** Missing router exports, type mismatches, undefined variables, SQL type errors
- **Goal:** Get build working, maintain type safety

## TASK

Fix TypeScript errors that are blocking the build. START FIXING immediately.

## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**
- Just list errors
- Wait for approval
- Show a plan without fixing

**DO:**
- Run typecheck: `pnpm check`
- Identify error categories
- Fix errors systematically
- Verify build works

## COMMON ERROR PATTERNS IN THIS REPO

### 1. Missing Router Exports
```typescript
// ❌ Error: Property 'abTestAnalytics' does not exist
// Fix: Add to server/routers.ts
import { abTestAnalyticsRouter } from "./routers/ab-test-analytics-router";

export const appRouter = router({
  // ... existing routers
  abTestAnalytics: abTestAnalyticsRouter, // ✅ Add missing router
});
```

### 2. Missing Icon Imports
```typescript
// ❌ Error: 'Shield' is not defined
// Fix: Import from lucide-react
import { Shield, Download, MessageCircle } from "lucide-react"; // ✅ Add imports
```

### 3. Type Mismatches
```typescript
// ❌ Error: Type 'string' is not assignable to type 'number'
// Fix: Convert or fix type
const id: number = parseInt(input.id, 10); // ✅ Convert string to number
```

### 4. SQL Type Errors
```typescript
// ❌ Error: Type mismatch in where clause
// Fix: Use proper Drizzle types
.where(
  and(
    eq(table.column, value), // ✅ Use eq() helper
    eq(table.userId, userId)
  )
)
```

### 5. Undefined Variables
```typescript
// ❌ Error: 'variable' is not defined
// Fix: Import or define
import { variable } from "./module"; // ✅ Add import
```

## IMPLEMENTATION STEPS

1. **Run typecheck - START NOW:**
   - Run: `pnpm check`
   - Collect all errors
   - Categorize by type

2. **Fix by category:**
   - **Missing exports:** Add to routers.ts
   - **Missing imports:** Add imports
   - **Type mismatches:** Fix types or convert
   - **Undefined variables:** Import or define
   - **SQL errors:** Fix Drizzle queries

3. **Fix systematically:**
   - Start with most common errors
   - Fix one category at a time
   - Verify after each category

4. **Verify build:**
   - Run: `pnpm check` again
   - Should have 0 errors
   - Run: `pnpm build` to verify

## VERIFICATION

After fixes:
- ✅ `pnpm check` passes (0 errors)
- ✅ `pnpm build` succeeds
- ✅ No `any` types introduced
- ✅ Type safety maintained

## OUTPUT FORMAT

```markdown
### TypeScript Errors Fixed

**Errors Found:** [count]
**Errors Fixed:** [count]

**Categories Fixed:**
1. Missing router exports: [count]
2. Missing imports: [count]
3. Type mismatches: [count]
4. SQL type errors: [count]
5. Undefined variables: [count]

**Files Modified:**
- [list]

**Verification:**
- ✅ Typecheck: PASSED (0 errors)
- ✅ Build: SUCCESS
```

