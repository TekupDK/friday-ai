# 🐛 AI Bug Hunter Report - Rate Limiting System

**Dato:** 28. januar 2025  
**Analyserede Filer:** `server/rate-limiter-redis.ts`, `server/rate-limit-middleware.ts`, `server/rate-limiter.ts`  
**Status:** 🔴 **5 Kritiske Bugs Identificeret**

---

## 📊 Executive Summary

**Systemlag Analyseret:**
- ✅ **API Layer:** tRPC middleware (`rate-limit-middleware.ts`)
- ✅ **Logic Layer:** Rate limiting logic (`rate-limiter-redis.ts`, `rate-limiter.ts`)
- ✅ **Data Layer:** Redis + In-memory fallback

**Bugs Fundet:** 5 kritiske bugs identificeret  
**Prioritet:** 🔴 HIGH - Kan forårsage production issues

---

## 🔍 Identificerede Bugs

### **BUG #1: Race Condition i Redis Operations** 🔴 CRITICAL

**Systemlag:** Logic Layer (Redis Operations)  
**Fil:** `server/rate-limiter-redis.ts:230-250`

**Problem:**
```typescript
// Lines 230-250
await client.zremrangebyscore(key, 0, windowStart);
const count = await client.zcard(key);

if (count >= config.limit) {
  // ... return blocked
}

// ⚠️ RACE CONDITION: Another request can add entries here!
const requestId = `${now}:${Math.random()}`;
await client.zadd(key, { score: now, member: requestId });
```

**Forklaring:**
1. Request A tjekker count (f.eks. 9/10)
2. Request B tjekker count (også 9/10) - **BEGGE ser count < limit**
3. Request A tilføjer entry → count = 10
4. Request B tilføjer entry → count = 11 ⚠️ **OVERSKRIDER LIMIT**

**Root Causes:**
1. **Non-atomic operations:** `zcard` + `zadd` er ikke atomiske
2. **No locking mechanism:** Ingen distributed lock
3. **Check-then-act pattern:** Klassisk race condition mønster

**Impact:**
- 🔴 **HIGH:** Rate limits kan overskrides under concurrent load
- 🔴 **HIGH:** Flere requests kan slippe igennem end tilladt
- 🟡 **MEDIUM:** Inconsistent behavior under high traffic

**Evidence:**
- Pattern: Check-then-act uden locking
- Historical: Dette er en kendt race condition i distributed systems
- Code review: Ingen atomic operations eller locks

---

### **BUG #2: Memory Leak i In-Memory Fallback** 🔴 CRITICAL

**Systemlag:** Data Layer (In-Memory Storage)  
**Fil:** `server/rate-limiter-redis.ts:168`

**Problem:**
```typescript
// Line 168
const inMemoryLimits = new Map<string, number[]>();

// ⚠️ NO CLEANUP MECHANISM!
// Map vokser ubegrænset hvis Redis ikke er tilgængelig
```

**Forklaring:**
1. Hver request tilføjer entries til `inMemoryLimits` Map
2. Gamle entries fjernes kun hvis de er udenfor window
3. Men hvis Redis er nede i længere tid, vokser Map'en ubegrænset
4. Ingen cleanup mechanism eksisterer

**Root Causes:**
1. **No cleanup interval:** Ingen periodisk cleanup
2. **No size limit:** Ingen max size check
3. **No TTL mechanism:** Entries forbliver for evigt hvis ikke accessed

**Impact:**
- 🔴 **HIGH:** Memory leak kan crashe serveren
- 🔴 **HIGH:** Performance degradation over tid
- 🟡 **MEDIUM:** Server restart nødvendig for at rydde op

**Evidence:**
- Code review: Ingen cleanup mechanism
- Pattern: Global Map uden lifecycle management
- Historical: Memory leaks er en kendt issue i long-running Node.js apps

---

### **BUG #3: Negative Remaining Count Calculation** 🟡 HIGH

**Systemlag:** Logic Layer (Calculation)  
**Fil:** `server/rate-limiter-redis.ts:199`

**Problem:**
```typescript
// Line 199
const remaining = config.limit - recentRequests.length;
return {
  remaining: Math.max(0, remaining), // Defensive fix, men hvorfor kan det være negativt?
};
```

**Forklaring:**
1. Hvis `recentRequests.length > config.limit`, bliver `remaining` negativ
2. Dette burde ikke ske, men defensive fix antyder det kan
3. Root cause ikke adresseret - kun symptom fixet

**Root Causes:**
1. **Possible edge case:** Hvis filter ikke virker korrekt
2. **Concurrent modification:** Race condition kan forårsage dette
3. **Data corruption:** Hvis Map data er korrupt

**Impact:**
- 🟡 **MEDIUM:** Confusing user experience (negative remaining)
- 🟡 **MEDIUM:** Indikerer underliggende bug
- 🟢 **LOW:** Defensive fix forhindrer crash

**Evidence:**
- Code review: Defensive `Math.max(0, ...)` antyder problem
- Pattern: Defensive programming uden root cause fix

---

### **BUG #4: Clock Skew / Time Zone Issues** 🟡 MEDIUM

**Systemlag:** Logic Layer (Time Calculation)  
**Fil:** `server/rate-limiter-redis.ts:226`, `server/rate-limiter-redis.ts:181`

**Problem:**
```typescript
// Line 226
const now = Date.now();
const windowStart = now - config.windowMs;

// Line 181
const recentRequests = userRequests.filter(
  time => now - time < config.windowMs
);
```

**Forklaring:**
1. Hvis serverens klokke ændres (NTP sync, manual change), kan windows blive forkerte
2. Hvis serveren går tilbage i tid, kan gamle entries ikke blive fjernet
3. Hvis serveren går frem i tid, kan nye entries blive fjernet forkert

**Root Causes:**
1. **No monotonic clock:** Bruger `Date.now()` i stedet for monotonic clock
2. **No time validation:** Ingen check for clock jumps
3. **No timezone handling:** Antager system timezone er korrekt

**Impact:**
- 🟡 **MEDIUM:** Rate limits kan være forkerte efter clock changes
- 🟡 **MEDIUM:** Inconsistent behavior ved server restart
- 🟢 **LOW:** Sjælden edge case

**Evidence:**
- Pattern: Brug af `Date.now()` i distributed systems
- Historical: Clock skew er kendt issue i distributed rate limiting

---

### **BUG #5: Redis Key Injection / Collision** 🟡 MEDIUM

**Systemlag:** Data Layer (Key Generation)  
**Fil:** `server/rate-limiter-redis.ts:223-225`

**Problem:**
```typescript
// Lines 223-225
const key = keySuffix 
  ? `ratelimit:user:${userId}:${keySuffix}`
  : `ratelimit:user:${userId}`;

// ⚠️ keySuffix ikke sanitized!
// Hvis keySuffix = "archive:delete", bliver key = "ratelimit:user:1:archive:delete"
// Dette kan forårsage key collisions
```

**Forklaring:**
1. `keySuffix` kommer fra `operationName` parameter
2. Ingen validation eller sanitization
3. Hvis `operationName` indeholder special characters eller er for lang, kan det forårsage problemer
4. Key collisions mulige hvis `operationName` ikke er unik

**Root Causes:**
1. **No input validation:** `keySuffix` ikke valideret
2. **No sanitization:** Special characters ikke escaped
3. **No length limit:** Keys kan blive for lange

**Impact:**
- 🟡 **MEDIUM:** Key collisions kan forårsage shared limits
- 🟡 **MEDIUM:** Redis key length limits kan overskrides
- 🟢 **LOW:** Kun hvis operationName er malformed

**Evidence:**
- Code review: Ingen validation på `keySuffix`
- Pattern: User input bør altid valideres

---

## 📋 Handlingsplan for Systematisk Isolering

### **Phase 1: Race Condition Test** (Priority: 🔴 HIGH)

**Test Plan:**
```typescript
// server/__tests__/rate-limiter-race-condition.test.ts
describe("Race Condition in Redis Operations", () => {
  it("should not allow more requests than limit under concurrent load", async () => {
    const userId = 1;
    const config = { limit: 10, windowMs: 60000 };
    
    // Fire 20 concurrent requests
    const promises = Array.from({ length: 20 }, () =>
      checkRateLimitUnified(userId, config, "test")
    );
    
    const results = await Promise.all(promises);
    const allowed = results.filter(r => r.success).length;
    
    // Should only allow 10, not more
    expect(allowed).toBeLessThanOrEqual(10);
  });
});
```

**Isolation Strategy:**
1. Mock Redis client for predictable behavior
2. Simuler concurrent requests med `Promise.all`
3. Verificer at max `limit` requests er tilladt
4. Test med forskellige concurrency levels (10, 50, 100)

---

### **Phase 2: Memory Leak Test** (Priority: 🔴 HIGH)

**Test Plan:**
```typescript
// server/__tests__/rate-limiter-memory-leak.test.ts
describe("Memory Leak in In-Memory Fallback", () => {
  it("should cleanup old entries periodically", async () => {
    const config = { limit: 10, windowMs: 1000 };
    
    // Create 1000 different keys
    for (let i = 0; i < 1000; i++) {
      await checkRateLimitInMemory(i, config, `op${i}`);
    }
    
    // Wait for windows to expire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Access private Map to check size
    const inMemoryLimits = (checkRateLimitInMemory as any).inMemoryLimits;
    // Should be cleaned up, not 1000
    expect(inMemoryLimits.size).toBeLessThan(1000);
  });
});
```

**Isolation Strategy:**
1. Simuler Redis unavailable
2. Opret mange entries
3. Vent for window expiration
4. Verificer cleanup (kræver exposing internal state for test)

---

### **Phase 3: Edge Case Tests** (Priority: 🟡 MEDIUM)

**Test Plan:**
1. **Negative Remaining:** Test med corrupted data
2. **Clock Skew:** Test med mocked time changes
3. **Key Collision:** Test med malformed operationName

---

## 🔧 Foreslåede Fixes

### **Fix #1: Atomic Redis Operations** 🔴 CRITICAL

**Problem:** Race condition i check-then-act pattern

**Solution:** Brug Redis Lua script for atomicity

**Patch:**
```typescript
// server/rate-limiter-redis.ts
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local windowMs = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requestId = ARGV[4]
  
  local windowStart = now - windowMs
  
  -- Remove old entries
  redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
  
  -- Count current requests
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
  
  -- Add current request
  redis.call('ZADD', key, now, requestId)
  redis.call('EXPIRE', key, math.ceil(windowMs / 1000))
  
  return {1, limit, limit - count - 1, math.floor((now + windowMs) / 1000)}
`;

export async function checkRateLimitUnified(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): Promise<RateLimitResult> {
  try {
    const client = getRedisClient();
    const key = keySuffix 
      ? `ratelimit:user:${userId}:${keySuffix}`
      : `ratelimit:user:${userId}`;
    const now = Date.now();
    const requestId = `${now}:${Math.random()}`;
    
    // Use Lua script for atomicity
    const result = await client.eval(
      RATE_LIMIT_SCRIPT,
      [key],
      [config.windowMs, config.limit, now, requestId]
    ) as [number, number, number, number];
    
    return {
      success: result[0] === 1,
      limit: result[1],
      remaining: result[2],
      reset: result[3],
    };
  } catch (error) {
    console.warn("Redis rate limiting unavailable, using in-memory fallback");
    return checkRateLimitInMemory(userId, config, keySuffix);
  }
}
```

**Regression Test:**
```typescript
it("should handle concurrent requests atomically", async () => {
  // Test from Phase 1
});
```

---

### **Fix #2: Memory Leak Cleanup** 🔴 CRITICAL

**Problem:** In-memory Map vokser ubegrænset

**Solution:** Tilføj cleanup interval

**Patch:**
```typescript
// server/rate-limiter-redis.ts
const inMemoryLimits = new Map<string, number[]>();

// Cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null;

function startInMemoryCleanup() {
  if (cleanupInterval) return; // Already started
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    inMemoryLimits.forEach((requests, key) => {
      // Remove entries older than 2x window (safety margin)
      const recentRequests = requests.filter(
        time => now - time < 120000 // 2 minutes default
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

// Start cleanup on first use
export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): RateLimitResult {
  startInMemoryCleanup(); // Ensure cleanup is running
  
  // ... rest of existing code
}
```

**Regression Test:**
```typescript
it("should cleanup old entries periodically", async () => {
  // Test from Phase 2
});
```

---

### **Fix #3: Input Validation** 🟡 MEDIUM

**Problem:** keySuffix ikke valideret

**Solution:** Valider og sanitize input

**Patch:**
```typescript
// server/rate-limiter-redis.ts
function sanitizeKeySuffix(keySuffix: string): string {
  // Remove special characters, limit length
  return keySuffix
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with _
    .substring(0, 50); // Max 50 chars
}

export async function checkRateLimitUnified(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): Promise<RateLimitResult> {
  // Sanitize keySuffix if provided
  const sanitizedSuffix = keySuffix ? sanitizeKeySuffix(keySuffix) : undefined;
  
  // ... rest of code using sanitizedSuffix
}
```

---

## 📊 Læringspunkter til Udviklerteamet

### **1. Distributed Systems Best Practices**

**Problem:** Race conditions i distributed rate limiting

**Læring:**
- ✅ **Brug atomiske operationer** (Lua scripts, transactions)
- ✅ **Undgå check-then-act patterns** uden locking
- ✅ **Test concurrent scenarios** systematisk

**Action Items:**
- Review alle distributed operations for race conditions
- Implementer Lua scripts for atomic Redis operations
- Tilføj concurrent load tests til CI/CD

---

### **2. Memory Management**

**Problem:** Memory leaks i long-running processes

**Læring:**
- ✅ **Altid cleanup mechanism** for in-memory caches
- ✅ **Set size limits** for unbounded data structures
- ✅ **Monitor memory usage** i production

**Action Items:**
- Review alle global Maps/Sets for cleanup
- Implementer memory monitoring
- Tilføj memory leak tests

---

### **3. Input Validation**

**Problem:** User input ikke valideret

**Læring:**
- ✅ **Valider alt input** fra external sources
- ✅ **Sanitize data** før brug i keys/queries
- ✅ **Defensive programming** - antag altid worst case

**Action Items:**
- Review alle user inputs for validation
- Implementer input validation layer
- Tilføj fuzzing tests

---

### **4. Testing Strategy**

**Problem:** Edge cases ikke testet

**Læring:**
- ✅ **Test concurrent scenarios** systematisk
- ✅ **Test edge cases** (clock skew, memory limits, etc.)
- ✅ **Test failure modes** (Redis down, network issues)

**Action Items:**
- Tilføj concurrent load tests
- Tilføj edge case tests
- Tilføj chaos engineering tests

---

## 🎯 Prioriteret Action Plan

### **Immediate (This Week):**
1. ✅ Fix race condition (Bug #1) - **CRITICAL**
2. ✅ Fix memory leak (Bug #2) - **CRITICAL**
3. ✅ Implement regression tests

### **Short-term (This Month):**
4. ⚠️ Fix input validation (Bug #5) - **MEDIUM**
5. ⚠️ Add monitoring for memory usage
6. ⚠️ Add concurrent load tests to CI/CD

### **Long-term (Next Quarter):**
7. 💡 Address clock skew (Bug #4) - **LOW**
8. 💡 Add chaos engineering tests
9. 💡 Implement distributed locking for critical paths

---

**Rapport Genereret:** 28. januar 2025  
**Næste Review:** Efter fixes implementeret

