# Error Sanitization Guide

**Author:** TekupDK Development Team  
**Last Updated:** 2025-01-28  
**Version:** 1.0.0

## Overview

The Error Sanitization utility (`server/_core/errors.ts`) prevents information leakage in production error messages. It ensures that sensitive internal details, stack traces, database errors, file paths, and API keys are never exposed to clients in production environments.

### Purpose

- **Security:** Prevents information leakage that could aid attackers
- **Privacy:** Protects internal system details from being exposed
- **User Experience:** Provides consistent, user-friendly error messages
- **Debugging:** Maintains full error details in development for troubleshooting

### Key Concepts

- **Sanitization:** The process of removing or masking sensitive information from error messages
- **Production Mode:** Environment where generic error messages are returned
- **Development Mode:** Environment where full error details are available for debugging
- **TRPCError:** User-facing errors that are already safe to return

---

## API Documentation

### `sanitizeError(error: unknown): string`

Sanitizes error messages to prevent information leakage in production.

#### Parameters

- `error` (unknown): The error to sanitize. Can be:
  - `TRPCError`: Already user-facing, returned as-is
  - `Error`: Standard JavaScript error object
  - `string`: String error message
  - `unknown`: Any other error type

#### Returns

- `string`: Sanitized error message safe to return to clients

#### Behavior

**Production Mode:**
- Returns generic message: `"An error occurred. Please try again later."`
- Detects sensitive patterns (passwords, secrets, keys, database errors, etc.)
- Never exposes internal implementation details

**Development Mode:**
- Returns full error message for debugging
- Preserves all error details for troubleshooting

#### Example Usage

```typescript
import { sanitizeError } from "../_core/errors";
import { TRPCError } from "@trpc/server";

try {
  // Operation that might fail
  await someOperation();
} catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: sanitizeError(error), // ✅ Sanitized
  });
}
```

#### Error Handling

The function handles multiple error types gracefully:

1. **TRPCError**: Returns message directly (already user-facing)
2. **Error**: Sanitizes based on environment (production vs development)
3. **string**: Returns generic message in production, original string in development
4. **unknown**: Returns fallback message: `"An unexpected error occurred"`

---

### `createSafeTRPCError(error: unknown, code?: TRPCError["code"]): TRPCError`

Convenience function that sanitizes an error and creates a TRPCError with appropriate error code.

#### Parameters

- `error` (unknown): The error to convert
- `code` (TRPCError["code"], optional): TRPC error code. Defaults to `"INTERNAL_SERVER_ERROR"`

#### Returns

- `TRPCError`: TRPCError instance with sanitized message

#### Features

- Automatically sanitizes error message
- Preserves original error as `cause` for logging
- Allows custom error codes

#### Example Usage

```typescript
import { createSafeTRPCError } from "../_core/errors";

try {
  // Operation that might fail
  await databaseOperation();
} catch (error) {
  // ✅ One-liner: sanitizes and creates TRPCError
  throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
}
```

#### Error Codes

Common TRPC error codes:
- `"INTERNAL_SERVER_ERROR"`: Generic server error (default)
- `"BAD_REQUEST"`: Invalid input
- `"UNAUTHORIZED"`: Authentication required
- `"FORBIDDEN"`: Insufficient permissions
- `"NOT_FOUND"`: Resource not found
- `"TOO_MANY_REQUESTS"`: Rate limit exceeded

---

## Implementation Details

### Architecture

The error sanitization utility is a lightweight, pure function module with no external dependencies beyond:
- `@trpc/server`: For TRPCError type
- `./env`: For environment detection (ENV.isProduction)

### Design Decisions

1. **Environment-Based Behavior**
   - Production: Always returns generic messages
   - Development: Returns full error details for debugging
   - Rationale: Balances security with developer productivity

2. **Sensitive Pattern Detection**
   - Uses regex patterns to detect sensitive information
   - Patterns include: passwords, secrets, keys, tokens, database errors, file paths, stack traces
   - Rationale: Provides defense-in-depth even if error messages are accidentally detailed

3. **TRPCError Preservation**
   - TRPCError messages are returned as-is
   - Rationale: TRPCError messages are already designed to be user-facing

4. **Cause Preservation**
   - `createSafeTRPCError` preserves original error as `cause`
   - Rationale: Allows logging systems to access full error details while keeping client messages safe

### Dependencies

```typescript
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";
```

### Sensitive Patterns Detected

The utility detects the following sensitive patterns in error messages:

- `password` (case-insensitive)
- `secret` (case-insensitive)
- `key` (case-insensitive)
- `token` (case-insensitive)
- `api[_-]?key` (API key variations)
- `database` (case-insensitive)
- `connection` (case-insensitive)
- `sql` (case-insensitive)
- `query` (case-insensitive)
- `file[_\s]?path` (file path variations)
- `stack[_\s]?trace` (stack trace variations)
- `at\s+\w+\.\w+` (stack trace format: "at function.name")

---

## Examples

### Example 1: Basic Error Handling

```typescript
import { sanitizeError } from "../_core/errors";
import { TRPCError } from "@trpc/server";

export const myProcedure = protectedProcedure
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await performOperation(input);
      return result;
    } catch (error) {
      // ✅ Sanitize error before returning to client
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: sanitizeError(error),
      });
    }
  });
```

### Example 2: Using Convenience Function

```typescript
import { createSafeTRPCError } from "../_core/errors";

export const myProcedure = protectedProcedure
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await performOperation(input);
      return result;
    } catch (error) {
      // ✅ One-liner: sanitizes and creates TRPCError
      throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
    }
  });
```

### Example 3: Custom Error Code

```typescript
import { createSafeTRPCError } from "../_core/errors";

export const myProcedure = protectedProcedure
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await databaseQuery(input.id);
      if (!result) {
        throw new Error("Record not found");
      }
      return result;
    } catch (error) {
      // ✅ Use appropriate error code
      if (error instanceof Error && error.message.includes("not found")) {
        throw createSafeTRPCError(error, "NOT_FOUND");
      }
      throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
    }
  });
```

### Example 4: Database Error Handling

```typescript
import { sanitizeError } from "../_core/errors";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

export const createRecord = protectedProcedure
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: sanitizeError(new Error("Database connection unavailable")),
      });
    }

    try {
      const result = await db.insert(records).values(input);
      return result;
    } catch (error) {
      // ✅ Database errors are sanitized in production
      // In production: "An error occurred. Please try again later."
      // In development: Full error message for debugging
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: sanitizeError(error),
      });
    }
  });
```

### Example 5: Error with Logging

```typescript
import { createSafeTRPCError } from "../_core/errors";
import { logger } from "./logger";

export const myProcedure = protectedProcedure
  .mutation(async ({ ctx, input }) => {
    try {
      const result = await performOperation(input);
      return result;
    } catch (error) {
      // ✅ Log full error details (for server logs)
      logger.error({ err: error }, "Operation failed");

      // ✅ Return sanitized error to client
      throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
    }
  });
```

---

## Best Practices

### ✅ DO

1. **Always sanitize errors before returning to clients**
   ```typescript
   catch (error) {
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: sanitizeError(error), // ✅
     });
   }
   ```

2. **Use `createSafeTRPCError` for convenience**
   ```typescript
   catch (error) {
     throw createSafeTRPCError(error); // ✅
   }
   ```

3. **Log full error details for server-side debugging**
   ```typescript
   catch (error) {
     logger.error({ err: error }, "Operation failed"); // ✅ Log full details
     throw createSafeTRPCError(error); // ✅ Return sanitized to client
   }
   ```

4. **Use appropriate error codes**
   ```typescript
   catch (error) {
     if (error instanceof NotFoundError) {
       throw createSafeTRPCError(error, "NOT_FOUND"); // ✅
     }
     throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
   }
   ```

### ❌ DON'T

1. **Don't expose raw error messages in production**
   ```typescript
   catch (error) {
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: error.message, // ❌ May leak sensitive info
     });
   }
   ```

2. **Don't return error objects directly**
   ```typescript
   catch (error) {
     return { error }; // ❌ Exposes full error object
   }
   ```

3. **Don't include stack traces in client responses**
   ```typescript
   catch (error) {
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: error.stack, // ❌ Exposes stack trace
     });
   }
   ```

4. **Don't skip error sanitization**
   ```typescript
   catch (error) {
     throw error; // ❌ May expose sensitive information
   }
   ```

---

## Common Pitfalls

### Pitfall 1: Forgetting to Sanitize

**Problem:**
```typescript
catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message, // ❌ Not sanitized
  });
}
```

**Solution:**
```typescript
catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: sanitizeError(error), // ✅ Sanitized
  });
}
```

### Pitfall 2: Inconsistent Error Handling

**Problem:**
Some procedures sanitize errors, others don't, leading to inconsistent behavior.

**Solution:**
Always use `sanitizeError` or `createSafeTRPCError` in all catch blocks.

### Pitfall 3: Logging Sensitive Information

**Problem:**
Logging full error details without redaction can expose sensitive information in logs.

**Solution:**
Use the logger's redaction capabilities (see `server/_core/logger.ts` and `server/_core/redact.ts`).

### Pitfall 4: Assuming All Errors Are Safe

**Problem:**
Assuming that certain error types are always safe to return.

**Solution:**
Always sanitize, even if you think the error is safe. The sanitization function handles TRPCError correctly.

---

## Migration Guide

### Migrating Existing Code

To migrate existing error handling to use sanitization:

1. **Find all catch blocks that throw TRPCError**
   ```typescript
   // Before
   catch (error) {
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: error.message,
     });
   }
   ```

2. **Import sanitizeError or createSafeTRPCError**
   ```typescript
   import { sanitizeError } from "../_core/errors";
   // or
   import { createSafeTRPCError } from "../_core/errors";
   ```

3. **Update error handling**
   ```typescript
   // After (Option 1)
   catch (error) {
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: sanitizeError(error),
     });
   }

   // After (Option 2 - Recommended)
   catch (error) {
     throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
   }
   ```

### Finding All Error Handlers

Use grep to find all error handlers:

```bash
# Find all catch blocks
grep -r "catch.*error" server/routers

# Find all TRPCError usage
grep -r "new TRPCError" server/routers
```

---

## Testing

### Manual Testing

1. **Production Mode:**
   ```bash
   NODE_ENV=production pnpm dev
   ```
   - Trigger an error
   - Verify generic message is returned: `"An error occurred. Please try again later."`

2. **Development Mode:**
   ```bash
   NODE_ENV=development pnpm dev
   ```
   - Trigger an error
   - Verify full error message is returned for debugging

### Unit Testing

Example test cases:

```typescript
import { describe, it, expect, vi } from "vitest";
import { sanitizeError, createSafeTRPCError } from "../_core/errors";
import { TRPCError } from "@trpc/server";

describe("sanitizeError", () => {
  it("should return TRPCError message as-is", () => {
    const error = new TRPCError({
      code: "NOT_FOUND",
      message: "Resource not found",
    });
    expect(sanitizeError(error)).toBe("Resource not found");
  });

  it("should sanitize Error in production", () => {
    process.env.NODE_ENV = "production";
    const error = new Error("Database connection failed");
    expect(sanitizeError(error)).toBe("An error occurred. Please try again later.");
  });

  it("should return full Error message in development", () => {
    process.env.NODE_ENV = "development";
    const error = new Error("Database connection failed");
    expect(sanitizeError(error)).toBe("Database connection failed");
  });

  it("should detect sensitive patterns", () => {
    process.env.NODE_ENV = "production";
    const error = new Error("Invalid API key: abc123");
    expect(sanitizeError(error)).toBe("An error occurred. Please try again later.");
  });
});
```

---

## Related Documentation

- [Security Review](../../devops-deploy/security/SECURITY_REVIEW_2025-01-28.md) - Section on Information Leakage
- [API Reference](../../API_REFERENCE.md) - Error handling patterns
- [Development Guide](../../DEVELOPMENT_GUIDE.md) - Error handling best practices
- [Logger Documentation](../server/_core/logger.ts) - Error logging with redaction

---

## Changelog

### v1.0.0 (2025-01-28)
- Initial implementation
- Added `sanitizeError()` function
- Added `createSafeTRPCError()` convenience function
- Added sensitive pattern detection
- Added environment-based behavior (production vs development)

---

## Support

For questions or issues related to error sanitization:
- Check this guide first
- Review [Security Review](../../devops-deploy/security/SECURITY_REVIEW_2025-01-28.md)
- Contact the backend team

