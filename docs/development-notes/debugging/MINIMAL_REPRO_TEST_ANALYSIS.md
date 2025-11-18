# 🔍 Minimal Reproducible Test Analysis - Rate Limiter Fallback Bug

**Dato:** 28. januar 2025  
**Status:** ✅ Bug Identified and Reproduced

---

## 1. Minimal Test der Udløser Fejlen

### **Test Fil:** `server/__tests__/rate-limiter-fallback-bug.test.ts`

**Test Case:**
```typescript
it("should maintain separate rate limits per operation when Redis unavailable", async () => {
  const userId = 1;
  const config = { limit: 5, windowMs: 60000 };

  // Make 5 "archive" requests - should all be allowed
  for (let i = 0; i < 5; i++) {
    const result = await checkRateLimitUnified(userId, config, "archive");
    expect(result.success).toBe(true);
  }

  // 6th "archive" request should be blocked
  const archiveBlocked = await checkRateLimitUnified(userId, config, "archive");
  expect(archiveBlocked.success).toBe(false); // ✅ PASSES

  // BUG: "delete" operation should have separate limit, but it's blocked!
  const deleteResult = await checkRateLimitUnified(userId, config, "delete");
  expect(deleteResult.success).toBe(true); // ❌ FAILS - returns false
});
```

**Test Result:**
```
❌ FAIL: expected false to be true
Archive blocked: false ✅ (correct)
Delete allowed: false ❌ (should be true - separate operation)
Delete remaining: 0 ❌ (should be 4)
```

---

## 2. Trin-for-Trin Gennemgang af Fejlen

### **Trin 1: Redis Unavailable**
```typescript
// checkRateLimitUnified tries Redis first
try {
  const client = getRedisClient(); // ❌ Throws error (Redis not configured)
} catch (error) {
  // Falls back to in-memory
  return checkRateLimitInMemory(userId, config); // ⚠️ keySuffix is LOST!
}
```

**Problem:** `keySuffix` parameter bliver ikke sendt videre til `checkRateLimitInMemory`.

### **Trin 2: In-Memory Fallback**
```typescript
// server/rate-limiter-redis.ts:169
export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
  // ⚠️ NO keySuffix parameter!
): RateLimitResult {
  const userRequests = inMemoryLimits.get(userId) || [];
  // Uses ONLY userId as key - ignores operation type
}
```

**Problem:** Funktionen accepterer ikke `keySuffix`, så alle operationer deler samme Map entry.

### **Trin 3: Key Generation**
```typescript
// Current implementation
const userRequests = inMemoryLimits.get(userId); // Key: userId only
// Should be: userId + operationName
```

**Problem:** Map key er kun `userId`, ikke `userId:operationName`.

### **Trin 4: Rate Limit Check**
```typescript
// Scenario:
// 1. User makes 5 "archive" requests → stored in inMemoryLimits.get(1)
// 2. User makes 1 "delete" request → ALSO stored in inMemoryLimits.get(1)
// 3. Both operations share the same counter!

// Archive: 5 requests → blocked ✅
// Delete: 1 request → should be allowed, but blocked ❌
// Because inMemoryLimits.get(1) already has 5 entries
```

**Resultat:** Alle operationer deler samme rate limit counter.

---

## 3. Realistiske Løsninger

### **Løsning 1: Tilføj keySuffix til checkRateLimitInMemory** ✅ RECOMMENDED

**Implementering:**
```typescript
export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string // ADD parameter
): RateLimitResult {
  // Create composite key
  const key = keySuffix ? `${userId}:${keySuffix}` : userId.toString();
  const userRequests = inMemoryLimits.get(key) || [];
  // ... rest of logic
}
```

**Fordele:**
- ✅ Konsistent med Redis implementation
- ✅ Operation-specifikke limits virker i fallback
- ✅ Minimal code change
- ✅ Backward compatible (keySuffix optional)

**Ulemper:**
- ⚠️ Kræver ændring af Map key type (number → string)
- ⚠️ Eksisterende entries skal migreres (hvis nogen)

**Risici:**
- 🟡 **LOW:** Type change er safe (TypeScript compiler catches issues)
- 🟡 **LOW:** Migration needed for existing in-memory entries (kun ved runtime)

**Kompleksitet:** 🟢 LOW

---

### **Løsning 2: Separate Map per Operation Type**

**Implementering:**
```typescript
const inMemoryLimits = new Map<string, number[]>();

export function checkRateLimitInMemory(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): RateLimitResult {
  const key = keySuffix 
    ? `user:${userId}:${keySuffix}` 
    : `user:${userId}`;
  const userRequests = inMemoryLimits.get(key) || [];
  // ... rest of logic
}
```

**Fordele:**
- ✅ Simple implementation
- ✅ Operation-specifikke limits
- ✅ Ingen migration needed (Map already uses string keys)

**Ulemper:**
- ⚠️ Key format ændres (fra number til string)

**Risici:**
- 🟢 **VERY LOW:** Map already uses string keys internally

**Kompleksitet:** 🟢 VERY LOW

---

### **Løsning 3: Wrapper Function**

**Implementering:**
```typescript
export async function checkRateLimitUnified(
  userId: number,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 },
  keySuffix?: string
): Promise<RateLimitResult> {
  try {
    // Redis implementation (already handles keySuffix)
    // ...
  } catch (error) {
    // Create wrapper that includes keySuffix
    return checkRateLimitInMemoryWithSuffix(userId, config, keySuffix);
  }
}

function checkRateLimitInMemoryWithSuffix(
  userId: number,
  config: RateLimitConfig,
  keySuffix?: string
): RateLimitResult {
  const key = keySuffix ? `${userId}:${keySuffix}` : userId;
  // ... implementation
}
```

**Fordele:**
- ✅ Ingen breaking changes til checkRateLimitInMemory
- ✅ Isoleret fix

**Ulemper:**
- ⚠️ Duplikeret logik
- ⚠️ Mere kompleks

**Risici:**
- 🟡 **MEDIUM:** Code duplication

**Kompleksitet:** 🟡 MEDIUM

---

### **Løsning 4: Ignore Problem (Accept Limitation)**

**Implementering:**
- Ingen ændringer
- Dokumenter at fallback ikke understøtter operation-specifikke limits

**Fordele:**
- ✅ Ingen code changes
- ✅ Ingen risiko

**Ulemper:**
- ❌ Inconsistent behavior (Redis vs fallback)
- ❌ Poor user experience (unexpected rate limiting)
- ❌ Bug remains

**Risici:**
- 🔴 **HIGH:** User confusion, potential security issues

**Kompleksitet:** 🟢 NONE (but bad solution)

---

## 4. Anbefalet Løsning

### **✅ Løsning 1: Tilføj keySuffix til checkRateLimitInMemory**

**Rationale:**
- Konsistent med Redis implementation
- Minimal code change
- Backward compatible
- Fixer buggen korrekt

**Implementering:**
1. Tilføj `keySuffix?: string` parameter til `checkRateLimitInMemory`
2. Brug composite key: `keySuffix ? \`${userId}:${keySuffix}\` : userId.toString()`
3. Opdater Map key type fra `number` til `string`
4. Opdater `checkRateLimitUnified` til at sende `keySuffix` videre

---

## 5. Test Plan

### **Tests der skal bestå:**

1. ✅ **Operation-specific limits work in fallback**
   - Archive: 5 requests → blocked
   - Delete: 1 request → allowed (separate limit)

2. ✅ **Backward compatibility**
   - Calls without keySuffix still work

3. ✅ **Redis still works**
   - Existing Redis functionality unchanged

4. ✅ **Existing tests still pass**
   - All 7 existing rate limiter tests

---

## 6. Implementering

Se næste sektion for implementering og verificering.

