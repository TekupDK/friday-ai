# Improve Error Handling

You are a senior engineer standardizing error handling in Friday AI Chat. You replace inconsistent patterns with a standard approach.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Current State:** Inconsistent error handling patterns
- **Standard:** TRPCError with logger, proper error codes
- **Goal:** Consistent, helpful error handling

## TASK

Standardize error handling across the codebase using Friday AI Chat patterns.

## STANDARD ERROR HANDLING PATTERN

### Pattern to Use (Standard)
```typescript
import { TRPCError } from "@trpc/server";
import { logger } from "./logger";

try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error({ err: error, context }, "Operation failed");
  
  if (error instanceof TRPCError) {
    throw error; // Re-throw TRPC errors
  }
  
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
    cause: error,
  });
}
```

### Error Codes to Use
- `UNAUTHORIZED` - 401: Not authenticated
- `FORBIDDEN` - 403: Not authorized
- `NOT_FOUND` - 404: Resource not found
- `BAD_REQUEST` - 400: Invalid input
- `TOO_MANY_REQUESTS` - 429: Rate limited
- `INTERNAL_SERVER_ERROR` - 500: Server error

## INCONSISTENT PATTERNS TO REPLACE

### Pattern 1: Silent Failure
```typescript
// ❌ Bad: Silent failure
const result = await operation();
if (!result) {
  return; // No error, just returns
}

// ✅ Good: Explicit error
const result = await operation();
if (!result) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Resource not found",
  });
}
```

### Pattern 2: Return Error Object
```typescript
// ❌ Bad: Return error object
const result = await operation();
if (!result.success) {
  return { success: false, error: result.error };
}

// ✅ Good: Throw error
const result = await operation();
if (!result.success) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: result.error,
  });
}
```

### Pattern 3: Console.error
```typescript
// ❌ Bad: console.error
catch (error) {
  console.error("Error:", error);
  throw error;
}

// ✅ Good: Use logger
catch (error) {
  logger.error({ err: error }, "Operation failed");
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
  });
}
```

## IMPLEMENTATION STEPS

1. **Find inconsistent patterns:**
   - Search for silent failures
   - Search for return error objects
   - Search for console.error
   - Review error handling

2. **Standardize:**
   - Replace with standard pattern
   - Use TRPCError
   - Use logger
   - Add proper error codes

3. **Verify:**
   - Errors are handled consistently
   - Logging is proper
   - Error messages are helpful

## OUTPUT FORMAT

```markdown
### Error Handling Standardization

**Patterns Replaced:**
- Silent failures: [count]
- Return error objects: [count]
- console.error: [count]

**Files Modified:**
- [list]

**Standard Applied:**
- TRPCError with proper codes
- Logger for error tracking
- Helpful error messages

**Verification:**
- ✅ Consistent: PASSED
- ✅ Logging: IMPROVED
```

