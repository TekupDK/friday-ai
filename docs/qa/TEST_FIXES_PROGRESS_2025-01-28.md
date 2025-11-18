# Test Fixes Progress - January 28, 2025

**Status:** ✅ 2/4 Tests Fixed  
**Started:** 2025-01-28  
**Priority:** P1 - High

---

## ✅ Completed Fixes

### 1. admin-user-router.test.ts - ✅ FIXED

- **Status:** 22/22 tests passing
- **Issue:** Mock structure for Drizzle ORM query chain incorrect
- **Fix:** Updated count query mock to return thenable Promise, fixed `orderBy` chain structure
- **Files Modified:** `server/__tests__/admin-user-router.test.ts`

### 2. crm-smoke.test.ts - ✅ FIXED

- **Status:** 14/14 tests passing
- **Issue:** Test expected error message didn't match actual error message
- **Fix:** Updated test expectation from `/Lead not accessible/i` to `/don't have permission to access this lead/i`
- **Files Modified:** `server/__tests__/crm-smoke.test.ts`

---

## ⏳ Remaining Fixes

### 3. e2e-email-to-lead.test.ts - ⏳ PENDING

- **Issue:** Name extraction from email test failing
- **Status:** File location needs to be found

### 4. cors.test.ts - ⏳ PENDING

- **Issue:** Production-like environment OAuth callback test failing
- **Status:** File location needs to be found

---

## Summary

- **Total Tests Fixed:** 2/4
- **Tests Now Passing:** 36 additional tests
- **Next Steps:** Locate and fix remaining 2 test files

---

**Last Updated:** 2025-01-28 01:45 UTC
