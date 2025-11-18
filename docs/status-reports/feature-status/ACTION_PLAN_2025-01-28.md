# Action Plan - Engineering TODOs

**Date:** 2025-01-28  
**Status:** Active Execution Plan  
**Based on:** `docs/ENGINEERING_TODOS_2025-01-28.md`

---

## Task Execution Plan

| Area                         | Task                                         | Priority | Size | Dependencies                                        | Status             | Notes                                                   |
| ---------------------------- | -------------------------------------------- | -------- | ---- | --------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| **Backend - Security**       |
| backend                      | Fix weak authentication (demo mode)          | P1       | M    | None                                                | ✅ **COMPLETED**   | Rate limiting, DB validation, production blocking added |
| backend                      | Remove test bypass from production           | P1       | S    | None                                                | ✅ **COMPLETED**   | Test mode only, requires TEST_SECRET                    |
| backend                      | Fix CORS no-origin allowance                 | P1       | S    | None                                                | ✅ **COMPLETED**   | Blocked in production                                   |
| backend                      | Add input length limits                      | P1       | M    | None                                                | ✅ **COMPLETED**   | Validation helper created, message max reduced          |
| backend                      | Implement log redaction for sensitive data   | P1       | M    | None                                                | 🔄 **IN PROGRESS** | Create redact.ts, update logger.ts, replace console.log |
| backend                      | Fix CSP unsafe-eval in production            | P1       | S    | None                                                | ⏳ **PENDING**     | Remove unsafe-eval from CSP in production               |
| backend                      | Implement CSRF protection                    | P2       | L    | sec-log-redaction                                   | ⏳ **PENDING**     | Create csrf.ts, add middleware, frontend integration    |
| backend                      | Fix session cookie security                  | P2       | S    | None                                                | ⏳ **PENDING**     | Reduce expiry, use strict sameSite, enforce HTTPS       |
| backend                      | Add authorization ownership checks           | P2       | M    | None                                                | ⏳ **PENDING**     | Create requireOwnership helper, apply to all endpoints  |
| backend                      | Implement secret rotation mechanism          | P2       | XL   | None                                                | ⏳ **PENDING**     | Integrate AWS Secrets Manager, add rotation logic       |
| backend                      | Add data encryption at rest                  | P3       | XL   | sec-secret-rotation                                 | ⏳ **PENDING**     | Encrypt PII fields before DB storage                    |
| backend                      | Improve error message sanitization           | P3       | S    | sec-log-redaction                                   | ⏳ **PENDING**     | Create sanitizeError utility                            |
| backend                      | Verify SQL queries use parameterized queries | P2       | M    | None                                                | ⏳ **PENDING**     | Audit all sql template literals                         |
| backend                      | Verify rate limiter fallback fix             | P3       | S    | None                                                | ⏳ **PENDING**     | Run regression tests                                    |
| **Frontend - Security**      |
| frontend                     | Sanitize HTML output (XSS prevention)        | P2       | M    | None                                                | ⏳ **PENDING**     | Install DOMPurify, sanitize RichTextEditor              |
| frontend                     | Add CSRF token to mutation requests          | P2       | M    | backend:sec-csrf                                    | ⏳ **PENDING**     | Update trpc client, add token to headers                |
| **Frontend - Accessibility** |
| frontend                     | Add skip links to main layout                | P1       | S    | None                                                | ⏳ **PENDING**     | Integrate SkipLinks component                           |
| frontend                     | Implement page title management              | P1       | M    | None                                                | ⏳ **PENDING**     | Add usePageTitle to all pages                           |
| frontend                     | Fix heading hierarchy (SettingsDialog)       | P1       | S    | None                                                | ⏳ **PENDING**     | Replace h3 with h2                                      |
| frontend                     | Fix heading hierarchy (ContextAwareness)     | P1       | S    | None                                                | ⏳ **PENDING**     | Fix h1→h2→h3 structure                                  |
| frontend                     | Add ARIA labels to icon-only buttons         | P1       | M    | None                                                | ⏳ **PENDING**     | Add aria-label, sr-only spans                           |
| frontend                     | Add visible focus indicators (EmailListV2)   | P1       | S    | None                                                | ⏳ **PENDING**     | Add focus:ring classes                                  |
| frontend                     | Improve image alt text                       | P1       | S    | None                                                | ⏳ **PENDING**     | Replace generic alt text                                |
| frontend                     | Add ARIA descriptions to form controls       | P2       | S    | None                                                | ⏳ **PENDING**     | Add aria-labelledby/describedby                         |
| frontend                     | Enhance EmailListV2 with listbox ARIA        | P2       | M    | None                                                | ⏳ **PENDING**     | Add role="listbox", aria-label                          |
| frontend                     | Improve loading state announcements          | P2       | S    | None                                                | ⏳ **PENDING**     | Add aria-atomic, status messages                        |
| frontend                     | Fix color contrast issues                    | P2       | M    | None                                                | ⏳ **PENDING**     | Review contrast ratios                                  |
| frontend                     | Add focus indicators (DashboardLayout)       | P2       | S    | None                                                | ⏳ **PENDING**     | Add focus styles to sidebar                             |
| frontend                     | Fix touch target sizes (44x44px)             | P2       | S    | None                                                | ⏳ **PENDING**     | Add padding to small elements                           |
| frontend                     | Convert div/span buttons to semantic buttons | P2       | S    | None                                                | ⏳ **PENDING**     | Replace with <button> elements                          |
| frontend                     | Add reduced motion support                   | P3       | S    | None                                                | ⏳ **PENDING**     | Add prefers-reduced-motion queries                      |
| **Infrastructure**           |
| infra                        | Add missing security headers                 | P3       | S    | None                                                | ⏳ **PENDING**     | Configure via Helmet                                    |
| infra                        | Set up dependency vulnerability scanning     | P2       | M    | None                                                | ⏳ **PENDING**     | Add npm audit, Snyk to CI/CD                            |
| infra                        | Migrate secrets to secret management         | P2       | XL   | None                                                | ⏳ **PENDING**     | Integrate AWS Secrets Manager                           |
| **Testing**                  |
| tests                        | Add security regression tests                | P2       | L    | sec-log-redaction, sec-csrf                         | ⏳ **PENDING**     | Test auth bypass, CSRF, input validation                |
| tests                        | Add rate limiter fallback regression tests   | P3       | S    | None                                                | ⏳ **PENDING**     | Verify operation-specific limits                        |
| tests                        | Test CORS in production-like environment     | P3       | M    | backend:sec-cors-fix                                | ⏳ **PENDING**     | Verify origin blocking                                  |
| tests                        | Set up automated accessibility testing       | P2       | M    | None                                                | ⏳ **PENDING**     | Install jest-axe, create test utilities                 |
| tests                        | Manual screen reader testing                 | P3       | L    | frontend:a11y-skip-links, frontend:a11y-aria-labels | ⏳ **PENDING**     | Test with NVDA, VoiceOver                               |
| tests                        | Run Lighthouse accessibility audit           | P3       | M    | frontend:a11y-fixes                                 | ⏳ **PENDING**     | Audit all pages, document scores                        |
| **Documentation**            |
| docs                         | Review auto-generated API documentation      | P3       | S    | None                                                | ⏳ **PENDING**     | Review API_REFERENCE_AUTO.md                            |
| docs                         | Create security remediation plan             | P2       | M    | None                                                | ⏳ **PENDING**     | Break down into sprint tasks                            |
| docs                         | Schedule regular status report updates       | P3       | S    | None                                                | ⏳ **PENDING**     | Set up monthly updates                                  |
| docs                         | Review documentation organization plan       | P3       | S    | None                                                | ⏳ **PENDING**     | Review DOCS_CLEANUP_PLAN.md                             |
| docs                         | Organize root-level documentation files      | P3       | L    | docs:review-org-plan                                | ⏳ **PENDING**     | Move 83 files to docs/                                  |
| docs                         | Create accessibility testing guide           | P2       | M    | tests:a11y-automated                                | ⏳ **PENDING**     | Document testing procedures                             |
| docs                         | Create accessibility statement page          | P3       | M    | frontend:a11y-fixes                                 | ⏳ **PENDING**     | Public-facing compliance page                           |
| **Version Management**       |
| version                      | Prepare for version bump to 2.0.1            | P3       | S    | docs:org-files, backend:sec-p1-all                  | ⏳ **PENDING**     | Complete cleanup before bump                            |

---

## Task Size Definitions

- **S (Small):** 1-2 hours - Simple fixes, single file changes
- **M (Medium):** 2-4 hours - Multiple files, moderate complexity
- **L (Large):** 4-8 hours - Significant changes, multiple components
- **XL (Extra Large):** 8+ hours - Major features, infrastructure changes

---

## Recommended Execution Order

### Week 1: Critical Security Fixes (P1)

**Day 1-2:**

1. ✅ Fix weak authentication (COMPLETED)
2. ✅ Remove test bypass (COMPLETED)
3. ✅ Fix CORS no-origin (COMPLETED)
4. ✅ Add input limits (COMPLETED)
5. 🔄 Implement log redaction (IN PROGRESS)
6. ⏳ Fix CSP unsafe-eval

**Day 3-4:** 7. ⏳ Fix session cookie security 8. ⏳ Add authorization ownership checks 9. ⏳ Verify SQL queries

### Week 2: High Priority Security (P2)

**Day 1-2:** 10. ⏳ Implement CSRF protection (backend + frontend) 11. ⏳ Sanitize HTML output (XSS prevention)

**Day 3-4:** 12. ⏳ Set up dependency scanning 13. ⏳ Add security regression tests

### Week 3: Accessibility Critical (P1)

**Day 1-2:** 14. ⏳ Add skip links 15. ⏳ Implement page title management 16. ⏳ Fix heading hierarchies (2 tasks)

**Day 3-4:** 17. ⏳ Add ARIA labels to icon buttons 18. ⏳ Add focus indicators (2 tasks) 19. ⏳ Improve image alt text

### Week 4: Accessibility High Priority (P2)

**Day 1-2:** 20. ⏳ Add ARIA descriptions 21. ⏳ Enhance EmailListV2 ARIA 22. ⏳ Improve loading announcements

**Day 3-4:** 23. ⏳ Fix color contrast 24. ⏳ Fix touch targets 25. ⏳ Convert div buttons to semantic

### Week 5+: Medium Priority & Infrastructure

26. ⏳ Secret management migration
27. ⏳ Data encryption at rest
28. ⏳ Documentation organization
29. ⏳ Additional testing
30. ⏳ Version bump preparation

---

## Summary

### Task Breakdown

- **Total Tasks:** 40
- **Completed:** 4 (10%)
- **In Progress:** 1 (2.5%)
- **Pending:** 35 (87.5%)

### By Priority

- **P1 (Critical):** 12 tasks - 4 completed, 1 in progress, 7 pending
- **P2 (High):** 16 tasks - All pending
- **P3 (Medium):** 12 tasks - All pending

### By Area

- **Backend:** 14 tasks (4 completed, 1 in progress)
- **Frontend:** 19 tasks (Security: 2, Accessibility: 17)
- **Infrastructure:** 3 tasks
- **Testing:** 6 tasks
- **Documentation:** 7 tasks
- **Version Management:** 1 task

### By Size

- **S (Small):** 20 tasks - Quick wins
- **M (Medium):** 13 tasks - Moderate effort
- **L (Large):** 4 tasks - Significant work
- **XL (Extra Large):** 3 tasks - Major infrastructure

---

## Dependencies Map

```
sec-log-redaction (P1)
  ├─> sec-csrf (P2) - Needs logger for CSRF token logging
  ├─> sec-error-sanitization (P3) - Uses redaction utility
  └─> tests:security (P2) - Needs logger for test assertions

sec-csrf (P2)
  └─> frontend:csrf-tokens (P2) - Backend must be ready first

frontend:a11y-skip-links (P1)
  └─> tests:screen-reader (P3) - Skip links needed for testing

frontend:a11y-aria-labels (P1)
  └─> tests:screen-reader (P3) - ARIA needed for testing

docs:org-files (P3)
  └─> version:bump-2.0.1 (P3) - Cleanup before version bump

backend:sec-p1-all (P1)
  └─> version:bump-2.0.1 (P3) - Security fixes before release
```

---

## Risks & Missing Information

### High Risk Items

1. **Secret Management Migration (XL)**
   - **Risk:** Breaking changes if not done carefully
   - **Mitigation:** Use feature flags, gradual rollout
   - **Missing:** AWS credentials, secret manager setup

2. **Data Encryption at Rest (XL)**
   - **Risk:** Data migration complexity, performance impact
   - **Mitigation:** Encrypt on write, gradual migration
   - **Missing:** Encryption key management strategy

3. **CSRF Protection (L)**
   - **Risk:** Breaking existing clients if not backward compatible
   - **Mitigation:** Make optional initially, add to new endpoints first
   - **Missing:** Frontend integration plan

### Missing Information

1. **Accessibility Testing Tools**
   - Need to decide: jest-axe vs @axe-core/react
   - Need CI/CD integration plan

2. **Secret Management Provider**
   - AWS Secrets Manager vs Azure Key Vault vs HashiCorp Vault
   - Need infrastructure decision

3. **Documentation Organization**
   - Need approval on folder structure
   - Need migration plan for 83 files

---

## Suggested Next Steps

### Immediate (Today)

1. ✅ Complete log redaction implementation
2. ⏳ Fix CSP unsafe-eval in production
3. ⏳ Start session cookie security fix

### This Week

4. ⏳ Complete all P1 security fixes
5. ⏳ Begin P1 accessibility fixes
6. ⏳ Set up dependency scanning

### This Month

7. ⏳ Complete all P2 security fixes
8. ⏳ Complete all P1 accessibility fixes
9. ⏳ Begin P2 accessibility improvements
10. ⏳ Set up automated testing

### Next Quarter

11. ⏳ Complete P3 tasks
12. ⏳ Infrastructure improvements
13. ⏳ Documentation organization
14. ⏳ Version bump to 2.0.1

---

## Execution Strategy

### Parallel Execution Opportunities

**Can run in parallel:**

- Frontend accessibility fixes (multiple developers)
- Documentation tasks (non-blocking)
- Testing setup (independent)

**Must be sequential:**

- Security fixes (P1 → P2 → P3)
- CSRF (backend → frontend)
- Version bump (after cleanup)

### Sprint Planning

**Sprint 1 (Week 1-2):** P1 Security + P1 Accessibility

- 12 P1 tasks
- Focus: Critical security and accessibility

**Sprint 2 (Week 3-4):** P2 Security + P2 Accessibility

- 16 P2 tasks
- Focus: High priority improvements

**Sprint 3 (Week 5-6):** P3 + Infrastructure

- 12 P3 tasks + infrastructure
- Focus: Polish and optimization

---

**Plan Generated:** 2025-01-28  
**Next Review:** After Sprint 1 completion  
**Owner:** Engineering Team Lead
