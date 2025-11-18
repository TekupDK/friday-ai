# Execution Plan - Engineering TODOs

**Generated:** 2025-01-28  
**Based on:** `docs/ENGINEERING_TODOS_2025-01-28.md`  
**Status:** Ready for Execution

---

## Actionable Work Plan

| Area | Task | Priority | Size | Dependencies | Notes |
|------|------|----------|------|--------------|-------|
| **Backend - Security (P1 Critical)** |
| backend | Fix weak authentication (demo mode) | P1 | M | None | Implement bcrypt password hashing, add rate limiting (5 attempts/15min) |
| backend | Remove test bypass from production | P1 | S | None | Add explicit test mode check with secret validation, fail closed in prod |
| backend | Fix CORS no-origin allowance | P1 | S | None | Block no-origin in production, allow only in dev or public endpoints |
| backend | Add input length limits and validation | P1 | M | None | Reduce message max to 5,000 chars, add Zod validation to all string inputs |
| backend | Implement log redaction for sensitive data | P1 | M | None | Create `redact.ts` utility, replace console.log with logger, redact cookies/tokens/passwords |
| backend | Fix CSP unsafe-eval in production | P1 | S | None | Remove 'unsafe-eval' from CSP header in production, keep only in development |
| **Backend - Security (P2 High)** |
| backend | Implement CSRF protection | P2 | L | None | Create `csrf.ts` middleware, generate/validate tokens, apply to state-changing operations |
| backend | Fix session cookie security | P2 | S | None | Reduce expiry to 7 days, set sameSite='strict' in prod, enforce HTTPS |
| backend | Add authorization ownership checks | P2 | M | None | Create `requireOwnership` helper in rbac.ts, apply to all resource endpoints |
| backend | Verify all SQL queries use parameterized queries | P2 | M | None | Audit crm-extensions-router.ts, ensure no user input in SQL template literals |
| backend | Implement secret rotation mechanism | P2 | L | Migrate secrets to secret management service | Integrate AWS Secrets Manager/Azure Key Vault, add rotation support |
| **Backend - Security (P3 Medium)** |
| backend | Add data encryption at rest | P3 | XL | None | Implement encryption for PII fields (email, phone) before DB storage |
| backend | Improve error message sanitization | P3 | M | None | Create sanitizeError utility, prevent info leakage in production errors |
| backend | Verify rate limiter fallback fix | P3 | S | None | Run regression tests for operation-specific rate limits in fallback mode |
| **Frontend - Security (P2 High)** |
| frontend | Sanitize HTML output to prevent XSS | P2 | M | None | Install DOMPurify, sanitize all content before dangerouslySetInnerHTML in RichTextEditor |
| frontend | Add CSRF token to mutation requests | P2 | S | Implement CSRF protection (backend) | Include CSRF token in headers for all POST/PUT/DELETE in trpc.ts |
| **Frontend - Accessibility (P1 Critical)** |
| frontend | Add skip links to main application layout | P1 | S | None | Integrate SkipLinks component (already created), add id="main-content" and id="navigation" |
| frontend | Implement page title management across all pages | P1 | M | None | Add usePageTitle hook (already created) to all page components |
| frontend | Fix heading hierarchy in SettingsDialog | P1 | S | None | Replace h3 with h2, ensure proper h1→h2→h3 structure |
| frontend | Fix heading hierarchy in ContextAwareness | P1 | S | None | Fix heading hierarchy, ensure proper h1→h2→h3→h4 structure |
| frontend | Add ARIA labels to all icon-only buttons | P1 | M | None | Add aria-label and sr-only spans to EmailListV2, DashboardLayout, Dialog close buttons |
| frontend | Add visible focus indicators to EmailListV2 items | P1 | S | None | Add focus:ring-2 focus:ring-primary focus:ring-offset-2 classes |
| frontend | Improve image alt text across application | P1 | S | None | Replace generic alt text in LoginPage, DashboardLayout, LoginDialog |
| **Frontend - Accessibility (P2 High)** |
| frontend | Add ARIA descriptions to complex form controls | P2 | S | None | Add aria-labelledby and aria-describedby to Switch components in SettingsDialog |
| frontend | Enhance EmailListV2 with proper listbox ARIA | P2 | M | None | Add role="listbox", aria-label, aria-multiselectable to container, role="option" to items |
| frontend | Improve loading state announcements | P2 | S | None | Add aria-atomic="true" to loading overlay in LoginPage |
| frontend | Fix color contrast issues | P2 | M | None | Review and fix contrast ratios (4.5:1 normal, 3:1 large text), test muted-foreground |
| frontend | Add focus indicators to DashboardLayout sidebar | P2 | S | None | Add visible focus styles to sidebar toggle buttons and menu items |
| frontend | Fix touch target sizes (minimum 44x44px) | P2 | S | None | Add padding to checkboxes and icon buttons in EmailListV2 and dialogs |
| frontend | Convert div/span buttons to semantic button elements | P2 | S | None | Replace div/span with button elements in EmailListV2 sender name buttons |
| frontend | Integrate KeyboardShortcutsDialog into application | P2 | S | None | Add Shift+? keyboard shortcut, integrate into DashboardLayout or SettingsDialog |
| **Frontend - Accessibility (P3 Medium)** |
| frontend | Add reduced motion support | P3 | S | None | Add @media (prefers-reduced-motion: reduce) queries to index.css |
| **Infrastructure (P2-P3)** |
| infra | Set up automated dependency vulnerability scanning | P2 | M | None | Add npm audit and Snyk to CI/CD, create .github/workflows/security.yml |
| infra | Migrate secrets to secret management service | P2 | L | None | Integrate AWS Secrets Manager/Azure Key Vault/HashiCorp Vault for production secrets |
| infra | Add missing security headers | P3 | S | None | Configure X-Content-Type-Options, X-Frame-Options via Helmet in server/_core/index.ts |
| **Testing (P2-P3)** |
| tests | Add security regression tests | P2 | L | All P1 security fixes | Create tests for auth bypass, CSRF, input validation, XSS prevention |
| tests | Set up automated accessibility testing with jest-axe | P2 | M | None | Install @axe-core/react and jest-axe, create test utilities, add tests for major components |
| tests | Add rate limiter fallback regression tests | P3 | S | None | Test operation-specific rate limits work in fallback mode |
| tests | Test CORS configuration in production-like environment | P3 | M | Fix CORS no-origin allowance | Verify CORS blocks unauthorized origins, allows only whitelisted |
| tests | Run Lighthouse accessibility audit on all pages | P3 | M | All P1 accessibility fixes | Run audit on all major pages, document scores, create action items for <90 |
| tests | Manual screen reader testing | P3 | L | All P1-P2 accessibility fixes | Test with NVDA and VoiceOver, document issues, create fixes |
| **Documentation (P2-P3)** |
| docs | Create security remediation implementation plan | P2 | M | None | Break down security fixes into sprint-sized tasks with estimates |
| docs | Create accessibility testing documentation | P2 | M | Set up automated accessibility testing | Document manual testing with screen readers, keyboard navigation, automated setup |
| docs | Review and update auto-generated API documentation | P3 | M | None | Review API_REFERENCE_AUTO.md for accuracy, add missing endpoints/examples |
| docs | Schedule regular status report updates | P3 | S | None | Set up monthly updates or trigger on major releases |
| docs | Review documentation organization plan | P3 | S | None | Review DOCS_CLEANUP_PLAN.md for organizing 83 markdown files |
| docs | Organize root-level documentation files | P3 | M | Review documentation organization plan | Move 83 markdown files from root to docs/ subdirectories |
| docs | Create accessibility statement page | P3 | M | All accessibility fixes | Create public-facing page documenting WCAG compliance, known issues, contact info |
| **Version Management (P3)** |
| docs | Prepare for version bump to 2.0.1 | P3 | S | Documentation organization, All P1 security fixes | Complete cleanup tasks, review checklist in VERSION_BUMP_PLAN.md |

---

## Summary

**Total Tasks:** 47  
**P1 Critical:** 13 tasks (6 backend security + 7 frontend accessibility)  
**P2 High Priority:** 20 tasks  
**P3 Medium Priority:** 14 tasks

**Estimated Effort:**
- **S (Small):** 1-4 hours each = 20 tasks × 2.5h avg = 50 hours
- **M (Medium):** 4-8 hours each = 15 tasks × 6h avg = 90 hours
- **L (Large):** 8-16 hours each = 9 tasks × 12h avg = 108 hours
- **XL (Extra Large):** 16+ hours = 2 tasks × 20h avg = 40 hours
- **Total:** ~288 hours (~36 developer days / ~7 weeks for 1 developer)

---

## Recommended Execution Order

### Week 1: Critical Security & Accessibility Foundation
**Goal:** Address all P1 critical issues

1. **Day 1-2: Backend Security P1 (6 tasks)**
   - Fix weak authentication (M)
   - Remove test bypass (S)
   - Fix CORS no-origin (S)
   - Add input validation (M)
   - Implement log redaction (M)
   - Fix CSP unsafe-eval (S)

2. **Day 3-4: Frontend Accessibility P1 (7 tasks)**
   - Add skip links (S)
   - Implement page titles (M)
   - Fix heading hierarchy (2 tasks, S each)
   - Add ARIA labels (M)
   - Add focus indicators (S)
   - Improve image alt text (S)

**Deliverable:** All P1 issues resolved, application secure and accessible at basic level

### Week 2: High Priority Security & Accessibility
**Goal:** Complete P2 security and accessibility improvements

3. **Day 5-6: Backend Security P2 (5 tasks)**
   - Implement CSRF protection (L) - **Start early, blocks frontend CSRF task**
   - Fix session cookie security (S)
   - Add ownership checks (M)
   - Verify SQL parameterization (M)
   - Start secret management migration (L) - **Can run in parallel**

4. **Day 7-8: Frontend Security & Accessibility P2 (9 tasks)**
   - Sanitize HTML output (M)
   - Add CSRF token to requests (S) - **Depends on backend CSRF**
   - Add ARIA descriptions (S)
   - Enhance EmailListV2 ARIA (M)
   - Improve loading announcements (S)
   - Fix color contrast (M)
   - Add sidebar focus indicators (S)
   - Fix touch targets (S)
   - Convert div/span buttons (S)
   - Integrate KeyboardShortcutsDialog (S)

**Deliverable:** Security hardened, accessibility significantly improved

### Week 3: Testing & Infrastructure
**Goal:** Set up testing infrastructure and complete infrastructure tasks

5. **Day 9-10: Testing Setup (2 tasks)**
   - Set up automated accessibility testing (M)
   - Add security regression tests (L) - **Depends on P1 security fixes**

6. **Day 11-12: Infrastructure (2 tasks)**
   - Set up dependency vulnerability scanning (M)
   - Complete secret management migration (L) - **Continue from Week 2**

7. **Day 13-14: Documentation (2 tasks)**
   - Create security remediation plan (M)
   - Create accessibility testing guide (M) - **Depends on testing setup**

**Deliverable:** Testing infrastructure in place, documentation updated

### Week 4-5: Medium Priority & Polish
**Goal:** Complete remaining P3 tasks and polish

8. **Week 4: Backend & Frontend P3**
   - Add data encryption at rest (XL)
   - Improve error sanitization (M)
   - Verify rate limiter (S)
   - Add reduced motion support (S)
   - Add security headers (S)

9. **Week 5: Testing & Documentation P3**
   - Rate limiter regression tests (S)
   - CORS integration tests (M)
   - Lighthouse audits (M)
   - Manual screen reader testing (L)
   - Review API docs (M)
   - Schedule status reports (S)
   - Review docs organization (S)
   - Organize root docs (M)
   - Create accessibility statement (M)
   - Prepare version bump (S)

**Deliverable:** All tasks complete, ready for 2.0.1 release

---

## Dependencies & Blockers

### Critical Dependencies
1. **CSRF Protection:** Backend CSRF implementation must complete before frontend can add CSRF tokens
2. **Secret Management:** Secret rotation depends on secret management service migration
3. **Security Tests:** Security regression tests depend on all P1 security fixes being complete
4. **Accessibility Tests:** Manual screen reader testing should wait until all P1-P2 accessibility fixes are done
5. **Version Bump:** Blocked by documentation organization and all P1 security fixes

### Parallel Execution Opportunities
- Backend security P1 tasks can be done in parallel (different files)
- Frontend accessibility P1 tasks can be done in parallel (different components)
- Secret management migration can run in parallel with other tasks
- Documentation tasks can run in parallel with development
- P3 tasks can be done in any order after P1-P2 are complete

---

## Risks & Missing Information

### High Risk
1. **Secret Management Migration:** May require infrastructure changes, could block deployments
   - **Mitigation:** Plan migration window, have rollback plan
2. **Data Encryption at Rest:** Large task, may require database schema changes
   - **Mitigation:** Start early, test thoroughly, plan migration strategy
3. **CSRF Protection:** Complex implementation, may break existing functionality
   - **Mitigation:** Implement incrementally, add comprehensive tests

### Medium Risk
1. **Color Contrast Fixes:** May require design changes, could affect visual design
   - **Mitigation:** Work with design team, test in both themes
2. **Screen Reader Testing:** Requires specialized knowledge, may find unexpected issues
   - **Mitigation:** Train team or hire accessibility consultant

### Missing Information
1. **Current secret management setup:** Need to understand existing secret storage
2. **Database encryption requirements:** Need to clarify which PII fields need encryption
3. **CSRF token storage:** Need to decide on token storage mechanism (session vs. cookie)
4. **Accessibility testing resources:** Need to identify team members with screen reader experience

---

## Suggested Next Steps

### Immediate (This Week)
1. **Assign owners** to all P1 tasks
2. **Set up project board** (GitHub Projects, Jira, etc.) with all tasks
3. **Kick off P1 backend security** tasks (Day 1-2)
4. **Kick off P1 frontend accessibility** tasks (Day 3-4)
5. **Schedule daily standups** to track P1 progress

### Short-term (Next 2 Weeks)
1. **Review secret management options** and make decision (AWS/Azure/Vault)
2. **Set up testing infrastructure** for accessibility and security
3. **Create detailed implementation plans** for CSRF and secret management
4. **Begin P2 tasks** after P1 completion

### Medium-term (Next Month)
1. **Complete all P2 tasks**
2. **Begin P3 tasks** in parallel
3. **Conduct accessibility audit** with real users
4. **Prepare for 2.0.1 release**

### Long-term (Next Quarter)
1. **Establish accessibility testing** as part of CI/CD
2. **Regular security audits** (quarterly)
3. **Accessibility training** for all developers
4. **Monitor and maintain** security and accessibility standards

---

## Success Criteria

### P1 Tasks (Week 1)
- ✅ All authentication vulnerabilities fixed
- ✅ All CORS and input validation issues resolved
- ✅ Basic accessibility compliance (WCAG 2.1 Level A)
- ✅ All critical security issues addressed

### P2 Tasks (Week 2-3)
- ✅ CSRF protection implemented end-to-end
- ✅ XSS prevention in place
- ✅ WCAG 2.1 Level AA compliance achieved
- ✅ Testing infrastructure operational

### P3 Tasks (Week 4-5)
- ✅ All security hardening complete
- ✅ Full accessibility compliance
- ✅ Documentation updated
- ✅ Ready for 2.0.1 release

---

**Plan Status:** ✅ Ready for Execution  
**Last Updated:** 2025-01-28  
**Next Review:** After Week 1 completion

