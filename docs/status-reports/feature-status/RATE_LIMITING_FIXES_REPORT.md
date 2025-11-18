# Rate Limiting Fixes Report

**Generated:** November 16, 2025  
**Status:** ✅ All Issues Fixed

---

## Executive Summary

All rate limiting issues have been identified and fixed:

- ✅ Race conditions: Fixed with atomic Lua scripts
- ✅ Memory leaks: Fixed with cleanup mechanisms
- ✅ Fallback bugs: Fixed with operation-specific keys
- ✅ Email rate limits: Enhanced with retry logic
- ✅ AI rate limits: Enhanced with retry logic and better error handling

---

## 1. Rate Limiter Race Conditions

### Issue

Non-atomic check-then-act pattern in Redis operations allowed concurrent requests to bypass rate limits.

### Fix Applied

**File:** `server/rate-limiter-redis.ts`

Implemented atomic Lua script for all rate limit operations:

```typescript
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local windowMs = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requestId = ARGV[4]
  
  local windowStart = now - windowMs
  
  -- Remove old entries (atomic)
  redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
  
  -- Count current requests (atomic)
  local count = redis.call('ZCARD', key)
  
  if count >= limit then
    -- Get oldest request for reset time
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local resetTime = now + windowMs
    if #oldest > 0 then
      resetTime = tonumber(oldest[2]) + windowMs
    end
    return {0, limit, 0, math.floor(resetTime / 1000)}
  end
  
  -- Add current request (atomic)
  redis.call('ZADD', key, now, requestId)
  redis.call('EXPIRE', key, math.ceil(windowMs / 1000))
  
  return {1, limit, limit - count - 1, math.floor((now + windowMs) / 1000)}
`;
```

**Benefits:**

- All operations are atomic
- No race conditions possible
- Consistent rate limit enforcement

---

## 2. Memory Leak in Fallback

### Issue

In-memory fallback rate limiter never cleaned up old entries, causing unbounded memory growth.

### Fix Applied

**File:** `server/rate-limiter-redis.ts`

Added automatic cleanup mechanism:

```typescript
// Cleanup interval for in-memory limits
let cleanupInterval: NodeJS.Timeout | null = null;

function startInMemoryCleanup(): void {
  if (cleanupInterval) return; // Already started

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    inMemoryLimits.forEach((requests, key) => {
      // Remove entries older than 2 minutes (safety margin for 60s windows)
      const recentRequests = requests.filter(
        time => now - time < 120000 // 2 minutes
      );

      if (recentRequests.length === 0) {
        keysToDelete.push(key);
      } else {
        inMemoryLimits.set(key, recentRequests);
      }
    });

    keysToDelete.forEach(key => inMemoryLimits.delete(key));
  }, 60000); // Every minute
}
```

**Also Fixed in:** `server/rate-limiter.ts`

- Added defensive cleanup on every request
- Maximum entries limit (10,000) with emergency cleanup
- Automatic cleanup interval

**Benefits:**

- Memory usage stays bounded
- Old entries automatically removed
- No memory leaks

---

## 3. Fallback Bug - Operation-Specific Limits

### Issue

When Redis was unavailable, fallback to in-memory limiter ignored `keySuffix`, causing all operations to share the same rate limit.

### Fix Applied

**File:** `server/rate-limiter-redis.ts`

Added operation-specific keys in fallback:

```typescript
export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): RateLimitResult {
  // Create composite key: userId:operationName or just userId
  const key = keySuffix ? `${userId}:${keySuffix}` : userId.toString();
  const userRequests = inMemoryLimits.get(key) || [];

  // ... rest of logic uses the composite key
}
```

**Also Added:**

- Input sanitization for `keySuffix` to prevent injection
- Proper key construction in unified function

**Benefits:**

- Separate limits per operation type
- Correct fallback behavior
- No cross-operation interference

---

## 4. Email Rate Limits

### Issue

Gmail API rate limits (429 errors) caused immediate failures with no retry logic.

### Fix Applied

**Files:**

- `server/google-api.ts`
- `server/email-monitor.ts`
- `server/customer-router.ts`

**Changes:**

1. Added retry logic with exponential backoff to all Gmail API calls
2. Enhanced error detection for rate limits
3. Improved error messages with retry-after information
4. Replaced console.log with structured logger

**Example:**

```typescript
const response = await retryWithBackoff(
  async () => {
    return await gmail.users.threads.list({...});
  },
  {
    maxAttempts: 3,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    retryableErrors: ["429", "rate limit", "RESOURCE_EXHAUSTED", "503", "502"],
  }
);
```

**Benefits:**

- Automatic retry on rate limits
- Better error messages
- Graceful degradation

---

## 5. AI Rate Limits

### Issue

AI/LLM API calls lacked proper rate limit handling in streaming responses.

### Fix Applied

**File:** `server/_core/llm.ts`

**Changes:**

1. Added retry logic to `streamResponse` function
2. Enhanced error detection for rate limits
3. Better error messages for users

**Example:**

```typescript
const response = await retryWithBackoff(
  async () => {
    const res = await fetch(resolveApiUrl(), {...});
    if (!res.ok) {
      const error = new Error(...);
      (error as any).status = res.status;
      throw error;
    }
    return res;
  },
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
    retryableErrors: ["429", "503", "502", "timeout", "ECONNRESET", "ETIMEDOUT"],
  }
).catch((error: any) => {
  const isRateLimit = error?.status === 429 ||
                     error?.message?.includes("429");

  if (isRateLimit) {
    logger.warn({ err: error }, "[LLM Stream] Rate limit exceeded");
    throw new Error("AI API rate limit exceeded. Please try again in a moment.");
  }
  throw error;
});
```

**Benefits:**

- Automatic retry for streaming requests
- User-friendly error messages
- Better logging

---

## 6. Security Fix - Email Monitor

### Issue

Email monitor used hardcoded userId fallback (userId: 1), which is a security risk.

### Fix Applied

**File:** `server/email-monitor.ts`

**Changes:**

1. Added `getUserIdFromEmail` method to resolve userId from Gmail email address
2. Replaced hardcoded fallback with proper user resolution
3. Added error handling for missing users

**Example:**

```typescript
private async getUserIdFromEmail(gmailEmail: string): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const userRows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, gmailEmail))
      .limit(1);

    return userRows.length > 0 ? userRows[0].id : null;
  } catch (error) {
    logger.error({ err: error, email: gmailEmail }, "[EmailMonitor] Failed to resolve userId from email");
    return null;
  }
}
```

**Benefits:**

- Proper user resolution
- No hardcoded fallbacks
- Better security

---

## Files Modified

### Core Rate Limiting

- ✅ `server/rate-limiter-redis.ts` - Fixed race conditions, memory leaks, fallback bugs
- ✅ `server/rate-limiter.ts` - Enhanced cleanup mechanism

### Email Rate Limits

- ✅ `server/google-api.ts` - Added retry logic and better error handling
- ✅ `server/email-monitor.ts` - Added retry logic, structured logging, security fix
- ✅ `server/customer-router.ts` - Enhanced error handling

### AI Rate Limits

- ✅ `server/_core/llm.ts` - Added retry logic to streaming responses

---

## Verification

### Tests

- ✅ Race condition tests pass
- ✅ Memory leak tests pass
- ✅ Fallback bug tests pass
- ✅ All linter checks pass

### Code Review

- ✅ All fixes follow project patterns
- ✅ Proper error handling throughout
- ✅ Structured logging used consistently
- ✅ Security improvements verified

---

## Prevention Measures

### 1. Atomic Operations

- Always use Lua scripts for Redis operations
- Never use check-then-act patterns
- Validate script results

### 2. Memory Management

- Always cleanup old entries
- Set maximum entry limits
- Use cleanup intervals

### 3. Retry Logic

- Always add retry logic for external APIs
- Use exponential backoff
- Detect rate limits properly

### 4. Error Handling

- Use structured logging
- Provide user-friendly error messages
- Log context for debugging

---

## Related Documentation

- [Email Sync Debug Report](../../email-system/email-center/EMAIL_SYNC_DEBUG_REPORT.md) - Email rate limit fixes
- [Error Handling Guide](../../development-notes/fixes/ERROR_HANDLING_GUIDE.md) - Error handling patterns
- [Rate Limiting Architecture](../../ARCHITECTURE.md) - Architecture details

---

**Report Generated:** November 16, 2025  
**Status:** ✅ All Issues Fixed  
**Next Review:** Monitor production for rate limit errors
