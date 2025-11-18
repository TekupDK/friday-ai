# Issues Fixed - January 28, 2025

**Date:** 2025-01-28  
**Status:** 🔧 In Progress  
**Session:** Comprehensive issue fixing

---

## ✅ FIXED: Security Vulnerabilities

### High Severity (2 → 0)

#### 1. glob - Command Injection ✅ FIXED

```
Package: glob
Severity: HIGH
CVE: GHSA-5j98-mcp5-4vw2
Status: ✅ FIXED

Fix Applied:
Added to package.json overrides:
"glob": "^11.1.0"

Verification:
pnpm audit shows 0 high vulnerabilities
```

### Moderate Severity (3 → 0)

#### 2. js-yaml - Prototype Pollution ✅ FIXED

```
Package: js-yaml (2 instances)
Severity: MODERATE
CVE: GHSA-mh29-5h37-fv8m
Status: ✅ FIXED

Fix Applied:
Added to package.json overrides:
"js-yaml": ">=4.1.1"

Verification:
pnpm audit shows 0 moderate vulnerabilities
```

#### 3. esbuild - CORS Bypass ✅ ALREADY FIXED

```
Package: esbuild
Severity: MODERATE
Status: ✅ Already at v0.25.12 (patched)

Override exists:
"esbuild": "^0.25.12"
```

---

## 🔄 IN PROGRESS: Test Failures

### Priority 1: Admin User Router (5 failures)

#### Issue 1: Test Timeouts (2 tests)

```
Tests:
- "should allow admin to list users"
- "should allow owner to list users"

Status: 🔍 INVESTIGATING
Problem: Database query timeout (5000ms)
Location: server/__tests__/admin-user-router.test.ts
```

#### Issue 2: Drizzle ORM Syntax Error (2 tests)

```
Tests:
- "should handle search with empty string"
- "should handle pagination correctly"

Status: 🔍 INVESTIGATING
Error: "db.select(...).from(...).orderBy is not a function"
Location: server/routers/admin-user-router.ts:99
```

### Priority 2: Sentry Integration Tests (6 failures)

```
Tests: All Sentry integration tests failing

Status: 🔍 INVESTIGATING
Error: "Cannot find module '../_core/index'"
Problem: Module imports after Sentry v10 migration
Location: server/__tests__/sentry-integration.test.ts
```

### Priority 3: Other Test Failures

#### CRM Access Control (1 failure)

```
Test: "forbids cross-user lead status update"

Status: 🔍 INVESTIGATING
Error: Error message mismatch
Expected: /Lead not accessible/i
Got: 'You don't have permission to access…'
Fix: Update test assertion
```

#### Email-to-Lead Name Extraction (1 failure)

```
Test: "should extract name from email when name not provided"

Status: 🔍 INVESTIGATING
Error: result.created = false (expected true)
Problem: Lead creation fails without name
Fix: Implement email → name extraction
```

#### CORS OAuth Callback (1 failure)

```
Test: "should allow no-origin for OAuth callback"

Status: 🔍 INVESTIGATING
Error: Returns 404 instead of 200/302/400/401
Problem: OAuth callback route not found
Fix: Verify OAuth route setup
```

#### Hook Loader (Full test suite fails)

```
Test Suite: .cursor/hooks/__tests__/loader.test.ts

Status: 🔍 INVESTIGATING
Error: No "default" export on "fs" mock
Problem: Vitest 4.0 mock syntax changed
Fix: Update vi.mock() syntax
```

---

## 📋 TODO: Configuration Issues

### 1. Google Service Account (CRITICAL)

```
Status: ⏳ PENDING
Missing: GOOGLE_SERVICE_ACCOUNT_KEY

Impact:
- ❌ Subscription emails fail
- ❌ Calendar integration fails
- ❌ Multiple tests fail

Action Required:
Add to .env.dev:
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 2. Redis Configuration

```
Status: ⏳ PENDING
Missing: REDIS_URL

Impact:
- ⚠️ Rate limiting only in-memory
- ⚠️ Multi-server deployment won't work
- 100+ test warnings

Action Required:
Add to .env.dev:
REDIS_URL=redis://localhost:6379
```

### 3. Billy API Test Data

```
Status: ⏳ PENDING
Problem: Test data uses non-existing Billy contactId

Impact:
- ❌ Subscription renewal tests fail

Action Required:
Update test data with valid Billy contactId
```

---

## 📊 Progress Summary

### Security ✅

- [x] High severity vulnerabilities (2) - FIXED
- [x] Moderate severity vulnerabilities (3) - FIXED

### Tests 🔄

- [ ] Admin router failures (5)
- [ ] Sentry test failures (6)
- [ ] CRM access control (1)
- [ ] Email-to-lead extraction (1)
- [ ] CORS OAuth (1)
- [ ] Hook loader (1 suite)

**Total:** 15 test issues to fix

### Configuration ⏳

- [ ] Google Service Account setup
- [ ] Redis configuration
- [ ] Billy API test data

**Total:** 3 config issues

### Code Quality 📝

- [ ] 112 Backend TODOs
- [ ] 27 Frontend TODOs

**Total:** 139 TODOs to review

---

## 🎯 Next Actions

### Immediate (Now)

1. ✅ Fix security vulnerabilities ← DONE
2. 🔄 Investigate admin router test failures
3. 🔄 Fix Drizzle ORM syntax error
4. 🔄 Update Sentry test imports

### Short-term (Today)

5. ⏳ Fix remaining test failures
6. ⏳ Setup Google Service Account
7. ⏳ Configure Redis

### Medium-term (This Week)

8. ⏳ Address high-priority TODOs (24)
9. ⏳ Fix database cache invalidation
10. ⏳ Optimize bundle sizes

---

**Last Updated:** 2025-01-28  
**Fixed By:** AI Assistant  
**Status:** In Progress
