# Fix Rate Limiting Issues

You are a senior backend engineer fixing rate limiting issues in Friday AI Chat. You address race conditions, memory leaks, and fallback bugs.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Rate Limiter:** Redis-based with in-memory fallback
- **Known Issues:** Race conditions, memory leaks, fallback bugs
- **Files:** `server/rate-limiter-redis.ts`, `server/rate-limiter.ts`

## TASK

Fix rate limiting issues including race conditions, memory leaks, and fallback bugs.

## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**

- Just describe the problem
- Wait for approval
- Show a plan without fixing

**DO:**

- Start investigating immediately
- Fix race conditions
- Fix memory leaks
- Fix fallback bugs
- Add tests

## KNOWN ISSUES IN THIS REPO

### Issue 1: Race Condition in Redis Operations

**File:** `server/rate-limiter-redis.ts`
**Problem:** Non-atomic check-then-act pattern

```typescript
// ❌ Current: Race condition
const count = await client.zcard(key);
if (count >= config.limit) {
  return { success: false };
}
await client.zadd(key, { score: now, member: requestId });
// Another request can add here!

// ✅ Fix: Use Lua script for atomicity
const script = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowMs = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local windowStart = now - windowMs
  
  redis.call('zremrangebyscore', key, 0, windowStart)
  local count = redis.call('zcard', key)
  
  if count >= limit then
    return {0, count}
  end
  
  redis.call('zadd', key, now, requestId)
  return {1, count + 1}
`;
```

### Issue 2: Memory Leak in Fallback

**File:** `server/rate-limiter.ts`
**Problem:** No cleanup of old entries

```typescript
// ❌ Current: Memory leak
const requests = rateLimitMap.get(userId) || [];
requests.push(Date.now());
rateLimitMap.set(userId, requests);
// Never cleaned up!

// ✅ Fix: Cleanup old entries
const requests = rateLimitMap.get(userId) || [];
const now = Date.now();
const windowStart = now - windowMs;
const filtered = requests.filter(time => time > windowStart);
filtered.push(now);
rateLimitMap.set(userId, filtered);
```

### Issue 3: Fallback Bug

**File:** `server/rate-limiter-redis.ts`
**Problem:** Different limits for different operations

```typescript
// ❌ Current: "delete" operation blocked by "create" limit
// ✅ Fix: Separate limits per operation type
const key = `rate-limit:${userId}:${operationType}`;
```

## IMPLEMENTATION STEPS

1. **Identify issues - START NOW:**
   - Review `rate-limiter-redis.ts`
   - Review `rate-limiter.ts`
   - Check for race conditions
   - Check for memory leaks

2. **Fix race condition:**
   - Implement Lua script for atomic operations
   - Test with concurrent requests
   - Verify no limit bypass

3. **Fix memory leak:**
   - Add cleanup of old entries
   - Add periodic cleanup task
   - Test memory doesn't grow

4. **Fix fallback bug:**
   - Separate limits per operation
   - Test fallback behavior
   - Verify correct limits applied

5. **Add tests:**
   - Test race condition fix
   - Test memory leak fix
   - Test fallback behavior

6. **Verify:**
   - Run existing tests
   - Test with concurrent load
   - Check memory usage

## VERIFICATION

After fixes:

- ✅ Race condition fixed (Lua script)
- ✅ Memory leak fixed (cleanup)
- ✅ Fallback bug fixed (separate limits)
- ✅ Tests pass
- ✅ No regressions

## OUTPUT FORMAT

```markdown
### Rate Limiting Fixes

**Issues Fixed:**

1. Race condition: [fix applied]
2. Memory leak: [fix applied]
3. Fallback bug: [fix applied]

**Files Modified:**

- `server/rate-limiter-redis.ts` - [changes]
- `server/rate-limiter.ts` - [changes]

**Tests Added:**

- [test file] - [what it tests]

**Verification:**

- ✅ Race condition: FIXED
- ✅ Memory leak: FIXED
- ✅ Fallback bug: FIXED
- ✅ Tests: PASSING
```
