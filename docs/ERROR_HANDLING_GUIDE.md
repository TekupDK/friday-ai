# Error Handling Guide

**Date:** 2025-01-28  
**Status:** Active

---

## Overview

This guide documents the comprehensive error handling system implemented in Friday AI Chat. The system provides retry logic, circuit breakers, and graceful error handling for database operations, external API calls, and user-facing errors.

---

## Error Handling Utilities

### Location

All error handling utilities are located in `server/_core/error-handling.ts`.

### Available Functions

#### 1. `retryWithBackoff<T>(fn, config?)`

Retries a function with exponential backoff for transient failures.

**Parameters:**
- `fn: () => Promise<T>` - Function to retry
- `config?: RetryConfig` - Retry configuration

**RetryConfig:**
```typescript
{
  maxAttempts?: number;        // Default: 3
  initialDelayMs?: number;  // Default: 1000
  maxDelayMs?: number;      // Default: 10000
  backoffMultiplier?: number; // Default: 2
  retryableErrors?: string[]; // Default: common network errors
}
```

**Example:**
```typescript
import { retryWithBackoff } from "../_core/error-handling";

const result = await retryWithBackoff(
  async () => await fetchData(),
  { maxAttempts: 3, initialDelayMs: 1000 }
);
```

**Retryable Errors:**
- Network errors: `ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND`, `ECONNREFUSED`
- HTTP errors: `429` (rate limit), `503` (service unavailable), `502` (bad gateway)
- Generic: `timeout`, `network`

---

#### 2. `createCircuitBreaker(config?)`

Creates a circuit breaker to prevent cascading failures.

**Parameters:**
- `config?: CircuitBreakerConfig` - Circuit breaker configuration

**CircuitBreakerConfig:**
```typescript
{
  failureThreshold?: number;  // Default: 5
  successThreshold?: number;   // Default: 2
  timeoutMs?: number;          // Default: 5000
  resetTimeoutMs?: number;     // Default: 60000
}
```

**Example:**
```typescript
import { createCircuitBreaker } from "../_core/error-handling";

const breaker = createCircuitBreaker({ failureThreshold: 5 });

try {
  const result = await breaker.execute(() => callExternalService());
} catch (error) {
  // Circuit is open - service unavailable
}
```

**Circuit States:**
- **Closed:** Normal operation, requests pass through
- **Open:** Too many failures, requests are rejected immediately
- **Half-Open:** Testing if service recovered, allows limited requests

---

#### 3. `withDatabaseErrorHandling<T>(operation, errorMessage?)`

Wraps database operations with comprehensive error handling.

**Parameters:**
- `operation: () => Promise<T>` - Database operation
- `errorMessage?: string` - Custom error message

**Example:**
```typescript
import { withDatabaseErrorHandling } from "../_core/error-handling";

const users = await withDatabaseErrorHandling(
  () => db.select().from(users).where(eq(users.id, userId)),
  "Failed to fetch users"
);
```

**Error Handling:**
- Connection errors → `INTERNAL_SERVER_ERROR` with user-friendly message
- Query errors → Sanitized error message
- Constraint violations → `CONFLICT` error code
- Generic errors → Sanitized `INTERNAL_SERVER_ERROR`

---

#### 4. `withApiErrorHandling<T>(operation, config?)`

Wraps external API calls with retry logic and error handling.

**Parameters:**
- `operation: () => Promise<T>` - API call
- `config?: RetryConfig` - Retry configuration

**Example:**
```typescript
import { withApiErrorHandling } from "../_core/error-handling";

const data = await withApiErrorHandling(
  () => fetch("https://api.example.com/data"),
  { maxAttempts: 3 }
);
```

**Error Handling:**
- Rate limiting (429) → `TOO_MANY_REQUESTS`
- Service unavailable (503, 502) → `SERVICE_UNAVAILABLE`
- Authentication errors (401, 403) → `UNAUTHORIZED`
- Generic errors → Sanitized `INTERNAL_SERVER_ERROR`

---

#### 5. `safeAsync<T>(operation, defaultCode?)`

Safe wrapper that catches all errors and converts to TRPCError.

**Parameters:**
- `operation: () => Promise<T>` - Operation to execute
- `defaultCode?: TRPCError["code"]` - Default error code

**Example:**
```typescript
import { safeAsync } from "../_core/error-handling";

const result = await safeAsync(
  () => riskyOperation(),
  "INTERNAL_SERVER_ERROR"
);
```

---

## Usage Patterns

### Database Operations

**Before:**
```typescript
const db = await getDb();
if (!db) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database connection failed",
  });
}

const users = await db.select().from(users);
```

**After:**
```typescript
const db = await getDb();
if (!db) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database connection failed",
  });
}

const users = await withDatabaseErrorHandling(
  () => db.select().from(users),
  "Failed to fetch users"
);
```

---

### External API Calls

**Before:**
```typescript
const response = await fetch("https://api.example.com/data");
if (!response.ok) {
  throw new Error(`API call failed: ${response.status}`);
}
```

**After:**
```typescript
const response = await withApiErrorHandling(
  async () => {
    const res = await fetch("https://api.example.com/data");
    if (!res.ok) {
      throw new Error(`API call failed: ${res.status}`);
    }
    return res;
  },
  { maxAttempts: 3 }
);
```

---

### LLM API Calls

**Before:**
```typescript
const response = await fetch(apiUrl, {
  method: "POST",
  body: JSON.stringify(payload),
});
```

**After:**
```typescript
const response = await retryWithBackoff(
  async () => {
    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`LLM call failed: ${res.status}`);
    }
    return res;
  },
  {
    maxAttempts: 3,
    retryableErrors: ["429", "503", "502", "timeout"],
  }
);
```

---

## Error Codes

### TRPC Error Codes

| Code | HTTP Status | Use Case |
|------|-------------|----------|
| `BAD_REQUEST` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

---

## Best Practices

### 1. Always Use Error Handling Utilities

✅ **Good:**
```typescript
const result = await withDatabaseErrorHandling(
  () => db.select().from(users),
  "Failed to fetch users"
);
```

❌ **Bad:**
```typescript
const result = await db.select().from(users);
```

---

### 2. Provide Meaningful Error Messages

✅ **Good:**
```typescript
await withDatabaseErrorHandling(
  () => db.insert(users).values(data),
  "Failed to create user account"
);
```

❌ **Bad:**
```typescript
await withDatabaseErrorHandling(
  () => db.insert(users).values(data),
  "Error"
);
```

---

### 3. Use Retry Logic for Transient Failures

✅ **Good:**
```typescript
const response = await retryWithBackoff(
  () => fetchExternalApi(),
  { maxAttempts: 3, retryableErrors: ["429", "503"] }
);
```

❌ **Bad:**
```typescript
const response = await fetchExternalApi();
```

---

### 4. Don't Retry Non-Retryable Errors

✅ **Good:**
```typescript
// Retry logic automatically skips non-retryable errors
const result = await retryWithBackoff(
  () => operation(),
  { retryableErrors: ["429", "503"] }
);
```

❌ **Bad:**
```typescript
// Don't retry authentication errors
for (let i = 0; i < 3; i++) {
  try {
    return await operation();
  } catch (error) {
    if (error.status === 401) throw error; // Still retries other errors
  }
}
```

---

### 5. Use Circuit Breakers for External Services

✅ **Good:**
```typescript
const breaker = createCircuitBreaker({ failureThreshold: 5 });

const result = await breaker.execute(() => callExternalService());
```

❌ **Bad:**
```typescript
// No protection against cascading failures
const result = await callExternalService();
```

---

## Error Sanitization

All errors are automatically sanitized using `sanitizeError()` from `server/_core/errors.ts`:

- **Production:** Generic error messages to prevent information leakage
- **Development:** Full error messages for debugging

**Example:**
```typescript
import { createSafeTRPCError } from "../_core/errors";

try {
  await operation();
} catch (error) {
  throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
}
```

---

## Testing

### Unit Tests

Test error handling utilities:

```typescript
import { retryWithBackoff } from "../_core/error-handling";

it("should retry on transient failures", async () => {
  let attempts = 0;
  const result = await retryWithBackoff(
    async () => {
      attempts++;
      if (attempts < 3) throw new Error("ECONNRESET");
      return "success";
    },
    { maxAttempts: 3 }
  );
  expect(result).toBe("success");
  expect(attempts).toBe(3);
});
```

### Integration Tests

Test error handling in real scenarios:

```typescript
it("should handle database connection failures", async () => {
  // Mock database failure
  const result = await trpc.crm.opportunities.create.mutate({
    customerProfileId: 1,
    title: "Test",
  });
  // Should return user-friendly error
});
```

---

## Monitoring

### Logging

All errors are logged using the logger:

```typescript
import { logger } from "./logger";

logger.error({ err: error }, "[Operation] Failed to execute");
```

### Metrics

Track error rates and retry attempts:

- Error count by type
- Retry attempt counts
- Circuit breaker state changes
- Response times

---

## Migration Guide

### Step 1: Import Error Handling Utilities

```typescript
import {
  withDatabaseErrorHandling,
  withApiErrorHandling,
  retryWithBackoff,
} from "../_core/error-handling";
```

### Step 2: Wrap Database Operations

```typescript
// Before
const result = await db.select().from(users);

// After
const result = await withDatabaseErrorHandling(
  () => db.select().from(users),
  "Failed to fetch users"
);
```

### Step 3: Wrap API Calls

```typescript
// Before
const response = await fetch(url);

// After
const response = await withApiErrorHandling(
  () => fetch(url),
  { maxAttempts: 3 }
);
```

### Step 4: Test Error Scenarios

- Test database connection failures
- Test API rate limiting
- Test network timeouts
- Test service unavailability

---

## Related Documentation

- [Error Sanitization Guide](./ERROR_SANITIZATION_GUIDE.md)
- [Security Review](./SECURITY_REVIEW_2025-01-28.md)
- [API Reference](./API_REFERENCE.md)

---

## Support

For questions or issues with error handling:

1. Check this guide
2. Review error handling utilities in `server/_core/error-handling.ts`
3. Check error logs for specific error patterns
4. Contact the development team

