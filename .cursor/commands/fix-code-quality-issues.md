# Fix Code Quality Issues

You are a senior engineer improving code quality in Friday AI Chat. You fix common issues like `any` types, console.logs, and inconsistent patterns.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Issues:** `any` types, console.log statements, inconsistent error handling
- **Goal:** Improve code quality, maintainability, type safety

## TASK

Identify and fix code quality issues systematically.

## CODE QUALITY ISSUES TO FIX

### 1. Remove `any` Types
```typescript
// ❌ Bad: Using any
function process(data: any) {
  return data.value;
}

// ✅ Good: Proper types
function process(data: { value: string }) {
  return data.value;
}
```

### 2. Replace console.log with Logger
```typescript
// ❌ Bad: console.log
console.log("Processing:", data);
console.error("Error:", error);

// ✅ Good: Use logger
import { logger } from "./logger";
logger.info({ data }, "Processing");
logger.error({ err: error }, "Error occurred");
```

### 3. Standardize Error Handling
```typescript
// ❌ Bad: Inconsistent patterns
try {
  await operation();
} catch (error) {
  // Silent failure
}

// ✅ Good: Standardized pattern
try {
  await operation();
} catch (error) {
  logger.error({ err: error }, "Operation failed");
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
  });
}
```

### 4. Remove @ts-ignore/@ts-expect-error
```typescript
// ❌ Bad: Suppressing errors
// @ts-ignore
const value = problematicCode();

// ✅ Good: Fix the type issue
const value = problematicCode() as ProperType;
// Or better: Fix the root cause
```

## IMPLEMENTATION STEPS

1. **Scan for issues:**
   - Find `any` types: `grep -r ": any" server client`
   - Find console.log: `grep -r "console\\.log" server client`
   - Find @ts-ignore: `grep -r "@ts-ignore" server client`
   - Find inconsistent error handling

2. **Fix systematically:**
   - Replace `any` with proper types
   - Replace console.log with logger
   - Standardize error handling
   - Remove @ts-ignore comments

3. **Verify:**
   - Run typecheck: `pnpm check`
   - Run tests: `pnpm test`
   - Verify no regressions

## OUTPUT FORMAT

```markdown
### Code Quality Improvements

**Issues Fixed:**
- `any` types: [count] replaced
- console.log: [count] replaced with logger
- Error handling: [count] standardized
- @ts-ignore: [count] removed

**Files Modified:**
- [list]

**Verification:**
- ✅ Typecheck: PASSED
- ✅ Tests: PASSED
- ✅ Code quality: IMPROVED
```

