# Test Mapping: Session Changes 2025-11-17

**Date:** 2025-11-17  
**Changes Analyzed:** Login JSON parsing fix, CRM Standalone Debug Mode  
**Status:** ⚠️ Tests Required Before Merge

## Executive Summary

**Critical Changes:**

- ✅ Login JSON parsing error fix (`client/src/main.tsx`)
- ✅ CRM Standalone Debug Mode (`client/src/pages/crm/CRMStandalone.tsx`)
- ✅ Route registration (`client/src/App.tsx`)
- ✅ Navigation updates (`client/src/components/crm/CRMLayout.tsx`)

**Test Coverage Status:**

- ⚠️ **Auth refresh fix:** No existing tests - **NEW TESTS REQUIRED**
- ⚠️ **CRM Standalone:** No existing tests - **NEW TESTS REQUIRED**
- ⚠️ **Route registration:** No existing tests - **NEW TESTS REQUIRED**
- ⚠️ **Navigation updates:** No existing tests - **NEW TESTS REQUIRED**

---

## 1. Changed Functions & Components

### 1.1 Authentication Refresh (`client/src/main.tsx`)

**Function:** `redirectToLoginIfUnauthorized`

- **Lines Changed:** 117-137
- **Change Type:** Bug fix (JSON parsing error handling)
- **Impact:** Critical - Affects user login flow

**Changed Logic:**

```typescript
// OLD: Direct JSON parsing (could fail)
const refreshData = await refreshResponse.json();

// NEW: Safe JSON parsing with validation
const contentType = refreshResponse.headers.get("content-type");
if (!contentType || !contentType.includes("application/json")) {
  console.warn("[Auth] Refresh response is not JSON, skipping");
  return;
}
const text = await refreshResponse.text();
if (!text || text.trim().length === 0) {
  console.warn("[Auth] Refresh response is empty, skipping");
  return;
}
let refreshData;
try {
  refreshData = JSON.parse(text);
} catch (parseError) {
  console.error("[Auth] Failed to parse refresh response:", parseError);
  return;
}
```

### 1.2 CRM Standalone Page (`client/src/pages/crm/CRMStandalone.tsx`)

**Component:** `CRMStandalone`

- **Lines:** 1-207 (new file)
- **Change Type:** New feature
- **Impact:** High - New debugging capability

**Key Components:**

- `ErrorBoundary` class component
- `ErrorFallback` functional component
- `StandaloneCRMRouter` component
- Lazy-loaded CRM page components

### 1.3 Route Registration (`client/src/App.tsx`)

**Routes Added:**

- `/crm-standalone` → `CRMStandalone`
- `/crm-standalone/:path*` → `CRMStandalone`
- `/crm/debug` → `CRMStandalone`

**Change Type:** New routes
**Impact:** Medium - New navigation paths

### 1.4 Navigation Updates (`client/src/components/crm/CRMLayout.tsx`)

**Function:** `CRMLayout` component

- **Lines Changed:** 34-85
- **Change Type:** Feature enhancement
- **Impact:** Medium - Navigation behavior

**Changed Logic:**

- Standalone mode detection
- Path adjustment for standalone routes
- Button text switching ("CRM Home" vs "Workspace")

### 1.5 tRPC Client Export (`client/src/lib/trpc-client.ts`)

**File:** New file

- **Lines:** 1-45
- **Change Type:** Infrastructure
- **Impact:** Low - Internal refactoring

---

## 2. Existing Test Coverage

### 2.1 Authentication Tests

**Existing Tests:**

- ✅ `client/src/pages/__tests__/LoginPage.test.tsx` - Login page UI tests
- ✅ `client/src/__tests__/accessibility/LoginPage.a11y.test.tsx` - Accessibility tests
- ✅ `client/src/__tests__/auth-helper.ts` - Test helper for login
- ✅ `server/_core/oauth.ts` - Backend auth endpoint (has test mode)

**Coverage Gaps:**

- ❌ **No tests for `redirectToLoginIfUnauthorized` function**
- ❌ **No tests for auth refresh JSON parsing**
- ❌ **No tests for error handling in refresh flow**

### 2.2 CRM Tests

**Existing Tests:**

- ✅ `server/__tests__/crm-workflow.test.ts` - Backend CRM workflow tests
- ✅ `server/__tests__/crm-smoke.test.ts` - Backend CRM smoke tests
- ✅ `server/__tests__/crm-status.test.ts` - Backend CRM status tests

**Coverage Gaps:**

- ❌ **No frontend CRM component tests**
- ❌ **No CRM route tests**
- ❌ **No CRM navigation tests**
- ❌ **No CRM Standalone mode tests**

### 2.3 Routing Tests

**Existing Tests:**

- ❌ **No route registration tests**
- ❌ **No route navigation tests**
- ❌ **No lazy loading tests**

---

## 3. Tests That MUST Be Run

### 3.1 Existing Tests to Re-run

#### ✅ **MUST RUN: Authentication Tests**

```bash
# Run all login-related tests
pnpm test client/src/pages/__tests__/LoginPage.test.tsx
pnpm test client/src/__tests__/accessibility/LoginPage.a11y.test.tsx
```

**Reason:** Verify login flow still works after JSON parsing fix

#### ✅ **MUST RUN: Backend CRM Tests**

```bash
# Run backend CRM tests
pnpm test server/__tests__/crm-workflow.test.ts
pnpm test server/__tests__/crm-smoke.test.ts
```

**Reason:** Ensure backend CRM endpoints still work with new frontend routes

---

## 4. Missing Tests - MUST ADD

### 4.1 Critical: Auth Refresh JSON Parsing

**Priority:** 🔴 **CRITICAL**  
**File:** `client/src/__tests__/auth-refresh.test.ts`  
**Estimated Time:** 2 hours

**Test Cases Required:**

1. **Test: Valid JSON Response**

   ```typescript
   it("should parse valid JSON response from refresh endpoint", async () => {
     // Mock fetch to return valid JSON
     // Verify refreshData is parsed correctly
     // Verify no errors thrown
   });
   ```

2. **Test: Non-JSON Response**

   ```typescript
   it("should handle non-JSON response gracefully", async () => {
     // Mock fetch to return HTML/text response
     // Verify warning is logged
     // Verify function returns early
     // Verify no JSON parsing errors
   });
   ```

3. **Test: Empty Response**

   ```typescript
   it("should handle empty response gracefully", async () => {
     // Mock fetch to return empty response
     // Verify warning is logged
     // Verify function returns early
   });
   ```

4. **Test: Invalid JSON Response**

   ```typescript
   it("should handle invalid JSON gracefully", async () => {
     // Mock fetch to return invalid JSON
     // Verify error is logged
     // Verify function returns early
     // Verify no uncaught exceptions
   });
   ```

5. **Test: Network Error**

   ```typescript
   it("should handle network errors gracefully", async () => {
     // Mock fetch to throw network error
     // Verify error is caught
     // Verify login redirect still happens
   });
   ```

6. **Test: Successful Refresh**
   ```typescript
   it("should successfully refresh session when valid", async () => {
     // Mock successful refresh response
     // Verify cache invalidation is called
     // Verify no redirect happens
   });
   ```

### 4.2 High Priority: CRM Standalone Mode

**Priority:** 🟠 **HIGH**  
**File:** `client/src/pages/crm/__tests__/CRMStandalone.test.tsx`  
**Estimated Time:** 4 hours

**Test Cases Required:**

1. **Test: ErrorBoundary Catches Errors**

   ```typescript
   it("should catch and display errors in ErrorBoundary", () => {
     // Render component that throws error
     // Verify ErrorFallback is displayed
     // Verify error message is shown
   });
   ```

2. **Test: ErrorBoundary Reset**

   ```typescript
   it("should reset error boundary when resetErrorBoundary is called", () => {
     // Trigger error
     // Call resetErrorBoundary
     // Verify component re-renders
   });
   ```

3. **Test: Standalone Routes Load**

   ```typescript
   it("should load all standalone CRM routes", () => {
     // Test each route:
     // - /crm-standalone/dashboard
     // - /crm-standalone/customers
     // - /crm-standalone/leads
     // - /crm-standalone/opportunities
     // - /crm-standalone/segments
     // - /crm-standalone/bookings
   });
   ```

4. **Test: Lazy Loading Works**

   ```typescript
   it("should lazy load CRM components", async () => {
     // Verify components are lazy loaded
     // Verify Suspense fallback is shown
     // Verify components load correctly
   });
   ```

5. **Test: Development Banner**

   ```typescript
   it("should show development banner in dev mode", () => {
     // Set NODE_ENV to development
     // Verify banner is displayed
   });
   ```

6. **Test: QueryClient Isolation**
   ```typescript
   it("should use dedicated QueryClient for standalone mode", () => {
     // Verify standalone QueryClient is used
     // Verify it's separate from main app QueryClient
   });
   ```

### 4.3 High Priority: Route Registration

**Priority:** 🟠 **HIGH**  
**File:** `client/src/__tests__/routing.test.tsx`  
**Estimated Time:** 2 hours

**Test Cases Required:**

1. **Test: Standalone Routes Registered**

   ```typescript
   it("should register /crm-standalone route", () => {
     // Navigate to /crm-standalone
     // Verify CRMStandalone component renders
   });
   ```

2. **Test: Standalone Catch-All Route**

   ```typescript
   it("should handle /crm-standalone/:path* routes", () => {
     // Navigate to /crm-standalone/customers
     // Verify correct component renders
   });
   ```

3. **Test: Debug Route**
   ```typescript
   it("should register /crm/debug route", () => {
     // Navigate to /crm/debug
     // Verify CRMStandalone component renders
   });
   ```

### 4.4 Medium Priority: Navigation Updates

**Priority:** 🟡 **MEDIUM**  
**File:** `client/src/components/crm/__tests__/CRMLayout.test.tsx`  
**Estimated Time:** 2 hours

**Test Cases Required:**

1. **Test: Standalone Mode Detection**

   ```typescript
   it("should detect standalone mode from pathname", () => {
     // Set pathname to /crm-standalone/dashboard
     // Verify isStandalone is true
   });
   ```

2. **Test: Path Adjustment**

   ```typescript
   it("should adjust paths for standalone mode", () => {
     // In standalone mode, verify /crm/customers → /crm-standalone/customers
   });
   ```

3. **Test: Button Text Switching**

   ```typescript
   it("should show 'CRM Home' in standalone mode", () => {
     // In standalone mode, verify button text is "CRM Home"
   });

   it("should show 'Workspace' in normal mode", () => {
     // In normal mode, verify button text is "Workspace"
   });
   ```

4. **Test: Navigation Between Modes**
   ```typescript
   it("should navigate correctly between standalone and normal modes", () => {
     // Test navigation from standalone to normal
     // Test navigation from normal to standalone
   });
   ```

### 4.5 Low Priority: tRPC Client Export

**Priority:** 🟢 **LOW**  
**File:** `client/src/lib/__tests__/trpc-client.test.ts`  
**Estimated Time:** 1 hour

**Test Cases Required:**

1. **Test: Client Export**

   ```typescript
   it("should export trpcClient", () => {
     // Verify trpcClient is exported
     // Verify it's a valid tRPC client
   });
   ```

2. **Test: Client Configuration**
   ```typescript
   it("should have correct client configuration", () => {
     // Verify links are configured
     // Verify transformer is set
   });
   ```

---

## 5. Test Execution Checklist

### Before Merge - MUST Complete

- [ ] **Run existing login tests**

  ```bash
  pnpm test client/src/pages/__tests__/LoginPage.test.tsx
  pnpm test client/src/__tests__/accessibility/LoginPage.a11y.test.tsx
  ```

- [ ] **Run existing CRM backend tests**

  ```bash
  pnpm test server/__tests__/crm-workflow.test.ts
  pnpm test server/__tests__/crm-smoke.test.ts
  ```

- [ ] **Write and run auth refresh tests** (NEW - CRITICAL)

  ```bash
  # Create: client/src/__tests__/auth-refresh.test.ts
  pnpm test client/src/__tests__/auth-refresh.test.ts
  ```

- [ ] **Write and run CRM Standalone tests** (NEW - HIGH)

  ```bash
  # Create: client/src/pages/crm/__tests__/CRMStandalone.test.tsx
  pnpm test client/src/pages/crm/__tests__/CRMStandalone.test.tsx
  ```

- [ ] **Write and run route registration tests** (NEW - HIGH)

  ```bash
  # Create: client/src/__tests__/routing.test.tsx
  pnpm test client/src/__tests__/routing.test.tsx
  ```

- [ ] **Write and run navigation tests** (NEW - MEDIUM)
  ```bash
  # Create: client/src/components/crm/__tests__/CRMLayout.test.tsx
  pnpm test client/src/components/crm/__tests__/CRMLayout.test.tsx
  ```

### Manual Testing Checklist

- [ ] **Test login flow** - Verify JSON parsing fix works
- [ ] **Test auth refresh** - Verify refresh endpoint handles errors
- [ ] **Test CRM Standalone routes** - Verify all routes load
- [ ] **Test navigation** - Verify standalone/normal mode switching
- [ ] **Test error boundaries** - Verify errors are caught and displayed

---

## 6. Test Implementation Priority

### Phase 1: Critical (Before Merge)

1. ✅ Auth refresh JSON parsing tests
2. ✅ CRM Standalone basic tests
3. ✅ Route registration tests

### Phase 2: High Priority (Before Production)

4. ✅ Navigation tests
5. ✅ Error boundary tests
6. ✅ Lazy loading tests

### Phase 3: Nice to Have (Post-Merge)

7. ⏳ tRPC client export tests
8. ⏳ Performance tests
9. ⏳ E2E tests

---

## 7. Test Files to Create

### New Test Files Required

1. **`client/src/__tests__/auth-refresh.test.ts`**
   - Test auth refresh JSON parsing
   - Test error handling
   - Test edge cases

2. **`client/src/pages/crm/__tests__/CRMStandalone.test.tsx`**
   - Test ErrorBoundary
   - Test route loading
   - Test lazy loading
   - Test QueryClient isolation

3. **`client/src/__tests__/routing.test.tsx`**
   - Test route registration
   - Test route navigation
   - Test catch-all routes

4. **`client/src/components/crm/__tests__/CRMLayout.test.tsx`**
   - Test standalone mode detection
   - Test path adjustment
   - Test navigation

5. **`client/src/lib/__tests__/trpc-client.test.ts`** (Optional)
   - Test client export
   - Test configuration

---

## 8. Estimated Test Implementation Time

**Total Estimated Time:** ~11 hours

- **Critical Tests:** 6 hours
- **High Priority Tests:** 4 hours
- **Medium Priority Tests:** 1 hour

**Recommendation:** Implement critical tests before merge, others can be added incrementally.

---

## 9. Risk Assessment

### High Risk Areas (No Tests)

1. **Auth Refresh JSON Parsing** 🔴
   - **Risk:** Login failures if edge cases not handled
   - **Mitigation:** Implement all 6 test cases before merge

2. **CRM Standalone Error Handling** 🟠
   - **Risk:** Errors not caught, poor UX
   - **Mitigation:** Test ErrorBoundary thoroughly

3. **Route Registration** 🟠
   - **Risk:** Routes not accessible, broken navigation
   - **Mitigation:** Test all routes load correctly

### Medium Risk Areas

4. **Navigation Updates** 🟡
   - **Risk:** Navigation breaks between modes
   - **Mitigation:** Test mode detection and path adjustment

---

## 10. Recommendations

### Immediate Actions

1. **🔴 CRITICAL:** Write auth refresh tests before merge
2. **🟠 HIGH:** Write CRM Standalone basic tests
3. **🟠 HIGH:** Write route registration tests
4. **🟡 MEDIUM:** Write navigation tests (can be post-merge)

### Testing Strategy

1. **Unit Tests First:** Test individual functions/components
2. **Integration Tests Second:** Test component interactions
3. **E2E Tests Last:** Test full user flows

### Test Coverage Goals

- **Minimum:** 80% coverage for changed code
- **Target:** 90% coverage for critical paths
- **Ideal:** 100% coverage for auth refresh logic

---

## 11. Conclusion

**Status:** ⚠️ **TESTS REQUIRED BEFORE MERGE**

**Critical Path:**

1. Write auth refresh tests (2 hours)
2. Write CRM Standalone basic tests (2 hours)
3. Write route registration tests (2 hours)
4. Run all tests and verify passing

**Total Time to Test-Ready:** ~6 hours

**Recommendation:** Block merge until critical tests are implemented and passing.
