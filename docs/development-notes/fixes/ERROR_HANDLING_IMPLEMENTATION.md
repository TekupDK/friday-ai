# Error Handling Implementation

**Date:** 2025-01-28  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Usage Examples](#usage-examples)
5. [Implementation Details](#implementation-details)
6. [Error Codes](#error-codes)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)
9. [Testing](#testing)
10. [Monitoring](#monitoring)

---

## Overview

### What This Is

The Error Handling System provides comprehensive error handling utilities for Friday AI Chat, including:

- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Circuit Breakers**: Prevent cascading failures in external services
- **Database Error Handling**: Graceful handling of database connection and query errors
- **API Error Handling**: Retry logic and proper error codes for external API calls
- **Error Sanitization**: Production-safe error messages that don't leak sensitive information

### Why It Exists

Before this implementation:
- Database errors could crash the application
- External API failures had no retry logic
- Error messages could leak sensitive information
- No protection against cascading failures

After this implementation:
- ✅ Automatic recovery from transient failures
- ✅ User-friendly error messages
- ✅ Protection against information leakage
- ✅ Circuit breakers prevent service overload
- ✅ Comprehensive logging for debugging

### Key Concepts

- **Retryable Errors**: Errors that are likely to succeed on retry (network timeouts, rate limits)
- **Circuit Breaker**: Pattern that stops calling a failing service after threshold failures
- **Error Sanitization**: Removing sensitive information from error messages in production
- **Exponential Backoff**: Increasing delay between retry attempts

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Retry Logic     │  │ Circuit Breaker  │                │
│  │  - Exponential   │  │ - Failure Track │                │
│  │    Backoff       │  │ - State Mgmt    │                │
│  │  - Configurable  │  │ - Auto Recovery│                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Database Wrapper │  │  API Wrapper     │                │
│  │ - Connection     │  │ - Retry Logic    │                │
│  │   Errors         │  │ - Error Codes    │                │
│  │ - Query Errors   │  │ - Rate Limiting  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Error Sanitization Layer                  │   │
│  │  - Production: Generic messages                      │   │
│  │  - Development: Full error details                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Request
    ↓
tRPC Procedure
    ↓
Error Handling Wrapper
    ↓
┌─────────────────┐
│  Operation      │
│  (DB/API/etc)   │
└─────────────────┘
    ↓
┌─────────────────┐
│  Error?         │
└─────────────────┘
    ↓ Yes
┌─────────────────┐
│  Retryable?     │ → Yes → Retry with Backoff
└─────────────────┘
    ↓ No
┌─────────────────┐
│  Sanitize Error │
└─────────────────┘
    ↓
┌─────────────────┐
│  Return TRPCError│
└─────────────────┘
    ↓
User Response
```

---

## API Reference

### `retryWithBackoff<T>(fn, config?)`

Retries a function with exponential backoff for transient failures.

#### Signature

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T>
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fn` | `() => Promise<T>` | Yes | - | Function to retry |
| `config` | `RetryConfig` | No | See below | Retry configuration |

#### RetryConfig

```typescript
interface RetryConfig {
  maxAttempts?: number;        // Default: 3
  initialDelayMs?: number;     // Default: 1000
  maxDelayMs?: number;         // Default: 10000
  backoffMultiplier?: number;  // Default: 2
  retryableErrors?: string[];  // Default: common network errors
}
```

#### Returns

- `Promise<T>`: Result of the function if successful
- Throws: Last error if all retries fail

#### Retryable Errors (Default)

- Network errors: `ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND`, `ECONNREFUSED`
- HTTP errors: `429` (rate limit), `503` (service unavailable), `502` (bad gateway)
- Generic: `timeout`, `network`, `rate limit`

#### Example

```typescript
import { retryWithBackoff } from "../_core/error-handling";

const result = await retryWithBackoff(
  async () => {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
    retryableErrors: ["429", "503", "timeout"],
  }
);
```

---

### `createCircuitBreaker(config?)`

Creates a circuit breaker to prevent cascading failures.

#### Signature

```typescript
export function createCircuitBreaker(
  config?: CircuitBreakerConfig
): CircuitBreaker
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `config` | `CircuitBreakerConfig` | No | See below | Circuit breaker configuration |

#### CircuitBreakerConfig

```typescript
interface CircuitBreakerConfig {
  failureThreshold?: number;  // Default: 5
  successThreshold?: number;   // Default: 2
  timeoutMs?: number;          // Default: 5000
  resetTimeoutMs?: number;    // Default: 60000
}
```

#### CircuitBreaker Methods

- `execute<T>(fn: () => Promise<T>): Promise<T>` - Execute operation through circuit breaker
- `getState(): CircuitState` - Get current circuit state
- `reset(): void` - Manually reset circuit breaker

#### Circuit States

- **Closed**: Normal operation, requests pass through
- **Open**: Too many failures, requests rejected immediately
- **Half-Open**: Testing if service recovered, allows limited requests

#### Example

```typescript
import { createCircuitBreaker } from "../_core/error-handling";

const breaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 60000,
});

try {
  const result = await breaker.execute(() => callExternalService());
} catch (error) {
  // Circuit is open - service unavailable
  if (breaker.getState() === "open") {
    console.log("Service is down, circuit is open");
  }
}
```

---

### `withDatabaseErrorHandling<T>(operation, errorMessage?)`

Wraps database operations with comprehensive error handling.

#### Signature

```typescript
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T>
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `operation` | `() => Promise<T>` | Yes | - | Database operation to execute |
| `errorMessage` | `string` | No | `"Database operation failed"` | Custom error message for logging |

#### Returns

- `Promise<T>`: Result of the database operation
- Throws: `TRPCError` with appropriate error code

#### Error Handling

| Error Type | Detection | Error Code | Message |
|------------|-----------|------------|---------|
| Connection Error | `connection`, `ECONNREFUSED`, `ETIMEDOUT` | `INTERNAL_SERVER_ERROR` | "Database connection failed. Please try again later." |
| Query Error | `syntax`, `SQL`, `query` | `INTERNAL_SERVER_ERROR` | Sanitized error message |
| Constraint Violation | `constraint`, `unique`, `duplicate` | `CONFLICT` | "A record with this information already exists." |
| Generic Error | Other | `INTERNAL_SERVER_ERROR` | Sanitized error message |

#### Example

```typescript
import { withDatabaseErrorHandling } from "../_core/error-handling";

const users = await withDatabaseErrorHandling(
  async () => {
    return await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
  },
  "Failed to fetch user"
);
```

---

### `withApiErrorHandling<T>(operation, config?)`

Wraps external API calls with retry logic and error handling.

#### Signature

```typescript
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  config?: RetryConfig
): Promise<T>
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `operation` | `() => Promise<T>` | Yes | - | API call to execute |
| `config` | `RetryConfig` | No | Default retry config | Retry configuration |

#### Returns

- `Promise<T>`: Result of the API call
- Throws: `TRPCError` with appropriate error code

#### Error Handling

| HTTP Status | Error Code | Message |
|-------------|------------|---------|
| 429 | `TOO_MANY_REQUESTS` | "Rate limit exceeded. Please try again later." |
| 503, 502 | `SERVICE_UNAVAILABLE` | "External service is temporarily unavailable. Please try again later." |
| 401, 403 | `UNAUTHORIZED` | "Authentication failed with external service." |
| Other | `INTERNAL_SERVER_ERROR` | Sanitized error message |

#### Example

```typescript
import { withApiErrorHandling } from "../_core/error-handling";

const data = await withApiErrorHandling(
  async () => {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return response.json();
  },
  { maxAttempts: 3 }
);
```

---

### `safeAsync<T>(operation, defaultCode?)`

Safe wrapper that catches all errors and converts to TRPCError.

#### Signature

```typescript
export async function safeAsync<T>(
  operation: () => Promise<T>,
  defaultCode?: TRPCError["code"]
): Promise<T>
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `operation` | `() => Promise<T>` | Yes | - | Operation to execute |
| `defaultCode` | `TRPCError["code"]` | No | `"INTERNAL_SERVER_ERROR"` | Default error code |

#### Returns

- `Promise<T>`: Result of the operation
- Throws: `TRPCError` (preserves existing TRPCError, converts others)

#### Example

```typescript
import { safeAsync } from "../_core/error-handling";

const result = await safeAsync(
  () => riskyOperation(),
  "INTERNAL_SERVER_ERROR"
);
```

---

## Usage Examples

### Database Operations

#### Before (No Error Handling)

```typescript
const db = await getDb();
if (!db) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database connection failed",
  });
}

const users = await db.select().from(users);
// ❌ No error handling for query failures
```

#### After (With Error Handling)

```typescript
const db = await getDb();
if (!db) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Database connection failed",
  });
}

// ✅ Comprehensive error handling
const users = await withDatabaseErrorHandling(
  async () => {
    return await db.select().from(users);
  },
  "Failed to fetch users"
);
```

---

### External API Calls

#### Before (No Retry Logic)

```typescript
const response = await fetch("https://api.example.com/data");
if (!response.ok) {
  throw new Error(`API call failed: ${response.status}`);
}
// ❌ No retry on transient failures
```

#### After (With Retry Logic)

```typescript
// ✅ Automatic retry with exponential backoff
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

#### Implementation

```typescript
// server/_core/llm.ts
import { retryWithBackoff } from "./error-handling";

const response = await retryWithBackoff(
  async () => {
    const res = await fetch(resolveApiUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `LLM invoke failed: ${res.status} ${res.statusText} – ${errorText}`
      );
    }

    return res;
  },
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
    retryableErrors: ["429", "503", "502", "timeout", "ECONNRESET", "ETIMEDOUT"],
  }
);
```

---

### Circuit Breaker Pattern

```typescript
import { createCircuitBreaker } from "../_core/error-handling";

// Create circuit breaker for external service
const externalServiceBreaker = createCircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 60000,
});

// Use in procedure
export const myProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  try {
    const result = await externalServiceBreaker.execute(() =>
      callExternalService()
    );
    return result;
  } catch (error) {
    if (externalServiceBreaker.getState() === "open") {
      // Service is down, return cached data or error
      return { error: "Service temporarily unavailable" };
    }
    throw error;
  }
});
```

---

## Implementation Details

### Retry Logic Algorithm

```
1. Execute function
2. If success → return result
3. If error:
   a. Check if error is retryable
   b. If not retryable → throw immediately
   c. If retryable:
      - Check if max attempts reached
      - If yes → throw last error
      - If no:
        - Wait (exponential backoff)
        - Increment attempt counter
        - Retry from step 1
```

### Circuit Breaker State Machine

```
CLOSED (Normal)
  ↓ (failures >= threshold)
OPEN (Rejecting requests)
  ↓ (resetTimeoutMs elapsed)
HALF-OPEN (Testing)
  ↓ (successes >= successThreshold)
CLOSED (Recovered)
```

### Error Sanitization

Error messages are sanitized based on environment:

- **Production**: Generic messages to prevent information leakage
- **Development**: Full error messages for debugging

Sanitization is handled by `sanitizeError()` from `server/_core/errors.ts`.

---

## Error Codes

### TRPC Error Codes

| Code | HTTP Status | Use Case | Example |
|------|-------------|----------|---------|
| `BAD_REQUEST` | 400 | Invalid input | Missing required field |
| `UNAUTHORIZED` | 401 | Authentication required | Invalid credentials |
| `FORBIDDEN` | 403 | Insufficient permissions | User not authorized |
| `NOT_FOUND` | 404 | Resource not found | User ID doesn't exist |
| `CONFLICT` | 409 | Resource conflict | Duplicate email |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded | Too many API calls |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Database connection failed |
| `SERVICE_UNAVAILABLE` | 503 | External service down | Circuit breaker open |

---

## Best Practices

### 1. Always Use Error Handling Wrappers

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

## Migration Guide

### Step 1: Import Error Handling Utilities

```typescript
import {
  withDatabaseErrorHandling,
  withApiErrorHandling,
  retryWithBackoff,
  createCircuitBreaker,
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

## Testing

### Unit Tests

```typescript
import { retryWithBackoff } from "../_core/error-handling";

describe("retryWithBackoff", () => {
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

  it("should not retry non-retryable errors", async () => {
    await expect(
      retryWithBackoff(
        async () => {
          throw new Error("Authentication failed");
        },
        { retryableErrors: ["ECONNRESET"] }
      )
    ).rejects.toThrow("Authentication failed");
  });
});
```

### Integration Tests

```typescript
it("should handle database connection failures", async () => {
  // Mock database failure
  const result = await trpc.crm.opportunities.create.mutate({
    customerProfileId: 1,
    title: "Test",
  });
  // Should return user-friendly error
  expect(result).toHaveProperty("error");
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

### Metrics to Track

- Error count by type
- Retry attempt counts
- Circuit breaker state changes
- Response times
- Success/failure rates

### Example Log Output

```
[Retry] Retrying after error
  err: Error: ECONNRESET
  attempt: 1
  maxAttempts: 3
  delay: 1000
  nextAttempt: 2

[CircuitBreaker] Opening circuit due to too many failures
  err: Error: Service unavailable
  failures: 5
  threshold: 5
```

---

## Dependencies

### Internal Dependencies

- `server/_core/errors.ts` - Error sanitization
- `server/_core/logger.ts` - Logging

### External Dependencies

- `@trpc/server` - TRPCError class
- No additional npm packages required

---

## Files Modified

### Core Files

- `server/_core/error-handling.ts` - Main error handling utilities (NEW)
- `server/_core/errors.ts` - Error sanitization (existing)
- `server/_core/llm.ts` - Added retry logic to LLM calls

### Router Files

- `server/routers/crm-extensions-router.ts` - Added database error handling
- `server/routers/crm-customer-router.ts` - Added database error handling
- `server/routers/friday-leads-router.ts` - Added database error handling

### Documentation

- `docs/ERROR_HANDLING_GUIDE.md` - Usage guide (existing)
- `docs/ERROR_HANDLING_IMPLEMENTATION.md` - This document (NEW)

---

## Future Work

### Planned Enhancements

1. **Metrics Collection**: Add Prometheus metrics for error rates
2. **Distributed Circuit Breakers**: Redis-based circuit breakers for multi-instance deployments
3. **Adaptive Retry**: Adjust retry delays based on error patterns
4. **Error Recovery Strategies**: Automatic fallback mechanisms
5. **Frontend Error Boundaries**: React error boundaries for UI error handling

### Known Limitations

- Circuit breakers are in-memory (not shared across instances)
- Retry configuration is static (not adaptive)
- No automatic fallback mechanisms

---

## Related Documentation

- [Error Sanitization Guide](./ERROR_SANITIZATION_GUIDE.md)
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [Security Review](../../devops-deploy/security/SECURITY_REVIEW_2025-01-28.md)
- [API Reference](../../API_REFERENCE.md)

---

## Support

For questions or issues:

1. Check this documentation
2. Review error handling utilities in `server/_core/error-handling.ts`
3. Check error logs for specific error patterns
4. Contact the development team

---

**Last Updated:** 2025-01-28  
**Maintained by:** TekupDK Development Team

