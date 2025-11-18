# TODOs Genereret fra Chat - January 28, 2025

**Dato:** 2025-01-28  
**Chat Kontekst:** Codebase review, subscription features, test fixes, HMR optimizations, TODO organization

---

## ✅ Completed Tasks (Fra Chat)

### Subscription Features
- ✅ Subscription AI features implemented (recommend, churn, optimize, upsell)
- ✅ Subscription unit tests (20/20 passing)
- ✅ Subscription integration tests (8/8 passing)
- ✅ HMR optimizations completed
- ✅ TODO cleanup and organization
- ✅ Codebase review completed

---

## 🔴 High Priority (P1) - Fra Chat

### Test Fixes (Fra Codebase Review)

1. **`server/__tests__/admin-user-router.test.ts`** - Fix pagination edge case test
   - **Action:** Debug and fix failing pagination test
   - **Context:** From codebase review - 7 tests failing
   - **Priority:** P1 (blocks test reliability)
   - **Estimated:** 30 min

2. **`server/__tests__/crm-smoke.test.ts`** - Fix cross-user lead status update test
   - **Action:** Fix authorization check in test
   - **Context:** From codebase review - CRM smoke test failing
   - **Priority:** P1 (security-related)
   - **Estimated:** 30 min

3. **`tests/integration/e2e-email-to-lead.test.ts`** - Fix name extraction from email test
   - **Action:** Debug email parsing logic
   - **Context:** From codebase review - E2E test failing
   - **Priority:** P1 (core functionality)
   - **Estimated:** 1 hour

4. **`tests/integration/cors.test.ts`** - Fix OAuth callback CORS test
   - **Action:** Fix CORS configuration for OAuth callback
   - **Context:** From codebase review - Production-like environment test failing
   - **Priority:** P1 (security/authentication)
   - **Estimated:** 30 min

### Security Audit (Fra Codebase Review)

5. **Security Audit - Environment Variables**
   - **Action:** Review environment variable handling and secrets management
   - **Context:** From codebase review recommendations
   - **Priority:** P1 (security critical)
   - **Estimated:** 2-3 hours

6. **Security Audit - CSRF Protection**
   - **Action:** Verify CSRF protection coverage across all endpoints
   - **Context:** From codebase review - verify coverage
   - **Priority:** P1 (security critical)
   - **Estimated:** 2-3 hours

7. **Security Audit - SQL Injection**
   - **Action:** Review SQL injection protection (verify no raw queries)
   - **Context:** From codebase review - Drizzle ORM protects, but review raw queries
   - **Priority:** P1 (security critical)
   - **Estimated:** 1-2 hours

### Frontend Subscription (Fra Subscription TODOs)

8. **`client/src/components/subscription/SubscriptionPlanSelector.tsx`** - Build component
   - **Action:** Create subscription plan selector component
   - **Context:** From subscription implementation TODOs - Frontend development
   - **Priority:** P1 (MVP requirement)
   - **Estimated:** 4-6 hours

9. **`client/src/components/subscription/SubscriptionManagement.tsx`** - Build component
   - **Action:** Create subscription management component
   - **Context:** From subscription implementation TODOs - Frontend development
   - **Priority:** P1 (MVP requirement)
   - **Estimated:** 4-6 hours

10. **`client/src/pages/subscription/SubscriptionPage.tsx`** - Create page
    - **Action:** Create subscription management page
    - **Context:** From subscription implementation TODOs - Frontend development
    - **Priority:** P1 (MVP requirement)
    - **Estimated:** 2-4 hours

### Background Jobs (Fra Subscription TODOs)

11. **`server/subscription-jobs.ts`** - Monthly billing job
    - **Action:** Create monthly billing job scheduler (runs on 1st of each month)
    - **Context:** From subscription implementation TODOs - Background jobs
    - **Priority:** P1 (core functionality)
    - **Estimated:** 4-6 hours

12. **`server/subscription-usage-tracker.ts`** - Usage tracking job
    - **Action:** Create usage tracking job scheduler
    - **Context:** From subscription implementation TODOs - Background jobs
    - **Priority:** P1 (core functionality)
    - **Estimated:** 2-4 hours

### Integration (Fra Manglende Dele Analyse)

13. **SMTP Inbound Email Server** - Gmail rate limit workaround
    - **Action:** Setup SMTP inbound email server (clone github.com/sendbetter/inbound-email)
    - **Context:** From manglende dele analyse - Critical missing feature
    - **Priority:** P1 (blocks email operations)
    - **Estimated:** 1-2 days
    - **Dependencies:** Docker setup, DNS configuration, Google Workspace forwarding

---

## 🟡 Medium Priority (P2) - Fra Chat

### Security Audit (Fra Codebase Review)

14. **Security Audit - XSS Protection**
    - **Action:** Review XSS protection in markdown rendering (DOMPurify usage)
    - **Context:** From codebase review - verify DOMPurify is used correctly
    - **Priority:** P2 (security important)
    - **Estimated:** 1-2 hours

### Performance Optimization (Fra Codebase Review)

15. **Performance - Bundle Size**
    - **Action:** Review and optimize bundle size
    - **Context:** From codebase review recommendations
    - **Priority:** P2 (performance important)
    - **Estimated:** 2-4 hours

16. **Performance - Slow API Endpoints**
    - **Action:** Identify and fix slow API endpoints
    - **Context:** From codebase review - monitor and optimize
    - **Priority:** P2 (performance important)
    - **Estimated:** 1-2 days

17. **Performance - Database Queries**
    - **Action:** Review database query patterns for N+1 issues
    - **Context:** From codebase review - review N+1 query patterns
    - **Priority:** P2 (performance important)
    - **Estimated:** 1-2 days

### Test Coverage (Fra Codebase Review)

18. **Test Coverage - Unit Tests**
    - **Action:** Increase test coverage to 80%+ - Add missing unit tests
    - **Context:** From codebase review recommendations
    - **Priority:** P2 (quality important)
    - **Estimated:** 3-5 days

19. **Test Coverage - E2E Tests**
    - **Action:** Add more E2E tests for critical user flows
    - **Context:** From codebase review recommendations
    - **Priority:** P2 (quality important)
    - **Estimated:** 2-3 days

20. **Test Coverage - Performance Tests**
    - **Action:** Add performance tests for high-volume scenarios
    - **Context:** From codebase review recommendations
    - **Priority:** P2 (quality important)
    - **Estimated:** 1-2 days

### Code Documentation (Fra Codebase Review)

21. **Code Documentation - JSDoc**
    - **Action:** Add JSDoc comments to complex functions and business logic
    - **Context:** From codebase review - some areas lack inline documentation
    - **Priority:** P2 (maintainability)
    - **Estimated:** 2-3 days

22. **Code Documentation - Inline Comments**
    - **Action:** Improve inline code comments for better maintainability
    - **Context:** From codebase review - improve inline comments
    - **Priority:** P2 (maintainability)
    - **Estimated:** 1-2 days

### Frontend Subscription (Fra Subscription TODOs)

23. **`client/src/components/subscription/SubscriptionCard.tsx`** - Enhance component
    - **Action:** Enhance existing SubscriptionCard component
    - **Context:** From subscription implementation TODOs - Frontend development
    - **Priority:** P2 (enhancement)
    - **Estimated:** 2-4 hours

24. **`client/src/pages/crm/CustomerProfile.tsx`** - Add subscription tab
    - **Action:** Add subscription tab in customer profile
    - **Context:** From subscription implementation TODOs - Frontend development
    - **Priority:** P2 (enhancement)
    - **Estimated:** 2-4 hours

### Background Jobs (Fra Subscription TODOs)

25. **`server/subscription-jobs.ts`** - Renewal reminder job
    - **Action:** Create renewal reminder job (7 days before renewal)
    - **Context:** From subscription implementation TODOs - Background jobs
    - **Priority:** P2 (nice-to-have)
    - **Estimated:** 2-3 hours

### Integration (Fra Subscription TODOs)

26. **Billy.dk Integration - Product IDs**
    - **Action:** Add subscription product IDs to Billy.dk
    - **Context:** From subscription implementation TODOs - Integration
    - **Priority:** P2 (integration important)
    - **Estimated:** 1-2 hours

### Documentation (Fra Subscription TODOs)

27. **`docs/user-guides/subscription-guide.md`** - User guide
    - **Action:** Create subscription user guide (how to subscribe, manage, cancel, FAQ)
    - **Context:** From subscription implementation TODOs - Documentation
    - **Priority:** P2 (documentation important)
    - **Estimated:** 2-4 hours

### Integration Email (Fra Manglende Dele Analyse)

28. **DNS Configuration - MX Records**
    - **Action:** Configure DNS MX records for parse.tekup.dk
    - **Context:** From manglende dele analyse - SMTP inbound email server
    - **Priority:** P2 (dependency for P1 task)
    - **Estimated:** 1-2 hours

29. **Google Workspace - Auto-forward**
    - **Action:** Setup Google Workspace auto-forward for inbound emails
    - **Context:** From manglende dele analyse - SMTP inbound email server
    - **Priority:** P2 (dependency for P1 task)
    - **Estimated:** 1-2 hours

30. **`server/api/inbound-email.ts`** - Webhook endpoint
    - **Action:** Implement webhook endpoint /api/inbound/email
    - **Context:** From manglende dele analyse - SMTP inbound email server
    - **Priority:** P2 (dependency for P1 task)
    - **Estimated:** 2-4 hours

---

## 🟢 Low Priority (P3) - Fra Chat

### Technical Debt (Fra Codebase Review)

31. **TODO Cleanup - Server**
    - **Action:** Review and prioritize 480 TODO/FIXME comments in server codebase
    - **Context:** From codebase review - technical debt
    - **Priority:** P3 (technical debt)
    - **Estimated:** 1-2 days

32. **TODO Cleanup - Client**
    - **Action:** Review and prioritize 127 TODO/FIXME comments in client codebase
    - **Context:** From codebase review - technical debt
    - **Priority:** P3 (technical debt)
    - **Estimated:** 1 day

### Beta Testing (Fra Subscription TODOs)

33. **Beta Testing - Select Customers**
    - **Action:** Select 5-10 test customers for subscription feature
    - **Context:** From subscription implementation TODOs - Beta testing
    - **Priority:** P3 (external testing)
    - **Estimated:** 1-2 hours

34. **Beta Testing - Onboard Customers**
    - **Action:** Onboard test customers to subscription
    - **Context:** From subscription implementation TODOs - Beta testing
    - **Priority:** P3 (external testing)
    - **Estimated:** 2-4 hours

35. **Beta Testing - Collect Feedback**
    - **Action:** Collect feedback and iterate based on results
    - **Context:** From subscription implementation TODOs - Beta testing
    - **Priority:** P3 (external testing)
    - **Estimated:** Ongoing

---

## 📊 Summary

### Total Opgaver: 35

| Priority | Count | Estimated Time |
|----------|-------|----------------|
| **P1 - High** | 13 | ~15-20 dage |
| **P2 - Medium** | 18 | ~20-30 dage |
| **P3 - Low** | 4 | ~3-5 dage |
| **Total** | **35** | **~38-55 dage** |

### Kategorier

| Kategori | Count |
|----------|-------|
| Test Fixes | 4 |
| Security Audit | 4 |
| Frontend Subscription | 5 |
| Background Jobs | 3 |
| Integration | 5 |
| Performance | 3 |
| Test Coverage | 3 |
| Code Documentation | 2 |
| Documentation | 1 |
| Technical Debt | 2 |
| Beta Testing | 3 |

---

## 🎯 Næste Skridt

### Immediate (Denne Uge)
1. Fix 4 failing tests (P1)
2. Start security audit (P1)
3. Begin frontend subscription components (P1)

### Næste Uge
4. Complete security audit (P1)
5. Continue frontend subscription development (P1)
6. Start background jobs implementation (P1)

### Næste Måned
7. Performance optimization (P2)
8. Test coverage improvements (P2)
9. Code documentation (P2)

---

**Genereret:** January 28, 2025  
**Baseret på:** Chat session fra start til nu  
**Næste Review:** February 4, 2025

