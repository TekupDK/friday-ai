# Security Remediation Implementation Plan

**Date:** 2025-01-28  
**Version:** 2.0.0  
**Status:** Active  
**Reference:** `docs/SECURITY_REVIEW_2025-01-28.md`

---

## Executive Summary

This plan breaks down the security remediation tasks from the security review into sprint-sized, actionable tasks with clear estimates, dependencies, and acceptance criteria.

**Total Issues:** 35 (12 Critical, 8 High, 15 Medium)  
**Completed:** 12 (34%)  
**Remaining:** 23 (66%)  
**Estimated Total Effort:** 18-24 story points

---

## Sprint Planning

### Sprint 1: Critical Security Fixes (Week 1) - ✅ COMPLETED

**Status:** All critical issues addressed  
**Completed:** 2025-01-28

| Task                               | Status | Effort | Files                                                                              |
| ---------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------- |
| Remove test bypass from production | ✅     | 1 SP   | `server/_core/context.ts`                                                          |
| Fix CORS no-origin allowance       | ✅     | 1 SP   | `server/_core/index.ts`                                                            |
| Add input length limits            | ✅     | 2 SP   | `server/routers.ts`, `server/_core/validation.ts`                                  |
| Implement log redaction            | ✅     | 2 SP   | `server/_core/logger.ts`, `server/_core/redact.ts`                                 |
| Fix CSP unsafe-eval                | ✅     | 1 SP   | `server/_core/index.ts`                                                            |
| Verify SQL queries parameterized   | ✅     | 2 SP   | `server/routers/crm-extensions-router.ts`, `server/routers/friday-leads-router.ts` |

**Total:** 9 story points completed

---

### Sprint 2: High Priority Security (Week 2-3) - 🟡 IN PROGRESS

**Status:** 6/8 tasks completed  
**Remaining:** 2 tasks

#### Completed Tasks ✅

| Task                               | Status | Effort | Files                                                    | Completion Date |
| ---------------------------------- | ------ | ------ | -------------------------------------------------------- | --------------- |
| Implement CSRF protection          | ✅     | 3 SP   | `server/_core/csrf.ts`, `client/src/lib/csrf.ts`         | 2025-01-28      |
| Add CSRF token to mutations        | ✅     | 1 SP   | `client/src/lib/trpc.ts`, `client/src/main.tsx`          | 2025-01-28      |
| Fix session cookie security        | ✅     | 2 SP   | `server/_core/cookies.ts`, `server/_core/oauth.ts`       | 2025-01-28      |
| Add authorization ownership checks | ✅     | 2 SP   | `server/rbac.ts`, `server/routers.ts`                    | 2025-01-28      |
| Sanitize HTML output (XSS)         | ✅     | 2 SP   | `client/src/components/chat/advanced/RichTextEditor.tsx` | 2025-01-28      |
| Add security regression tests      | ✅     | 3 SP   | `server/__tests__/security.test.ts`                      | 2025-01-28      |

**Subtotal:** 13 story points completed

#### Remaining Tasks

| Task                                     | Priority | Effort | Dependencies         | Acceptance Criteria                                                                                             |
| ---------------------------------------- | -------- | ------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Implement secret rotation mechanism**  | P2       | 5 SP   | Infrastructure setup | - AWS Secrets Manager or similar integrated<br>- Secret rotation API implemented<br>- Migration plan documented |
| **Set up automated dependency scanning** | P2       | 3 SP   | None                 | - npm audit in CI/CD<br>- Snyk integration<br>- Security workflow created                                       |

**Remaining Effort:** 8 story points

---

### Sprint 3: Medium Priority Security (Week 4-6)

**Status:** 1/7 tasks completed  
**Remaining:** 6 tasks

#### Completed Tasks ✅

| Task                         | Status | Effort | Files                   | Completion Date |
| ---------------------------- | ------ | ------ | ----------------------- | --------------- |
| Add missing security headers | ✅     | 1 SP   | `server/_core/index.ts` | 2025-01-28      |

#### Remaining Tasks

| Task                                   | Priority | Effort | Dependencies | Acceptance Criteria                                                                     |
| -------------------------------------- | -------- | ------ | ------------ | --------------------------------------------------------------------------------------- |
| **Add data encryption at rest**        | P3       | 8 SP   | None         | - Encryption utility created<br>- PII fields encrypted<br>- Migration script documented |
| **Verify rate limiter fallback**       | P3       | 1 SP   | None         | - Regression tests pass<br>- Fallback mode verified                                     |
| **Add rate limiter regression tests**  | P3       | 2 SP   | None         | - Tests in `rate-limiter-fallback-bug.test.ts` pass                                     |
| **Test CORS in production-like env**   | P3       | 2 SP   | None         | - Integration tests created<br>- CORS behavior verified                                 |
| **Improve error message sanitization** | P3       | 1 SP   | None         | - `sanitizeError()` utility created<br>- Production errors generic                      |

**Remaining Effort:** 14 story points

---

## Task Breakdown by Area

### Authentication & Authorization

#### ✅ Completed

- Remove test bypass from production
- Add authorization ownership checks
- Fix session cookie security

#### ⏳ Remaining

- **P1: Fix weak authentication** (Decision needed)
  - **Option A:** Keep OAuth-only in production (current approach - secure)
  - **Option B:** Implement bcrypt password hashing (requires DB migration)
  - **Recommendation:** Option A - Current approach is secure for production
  - **Effort:** 3 SP (if Option B chosen)

### Input Validation & Sanitization

#### ✅ Completed

- Add input length limits and validation
- Sanitize HTML output (XSS prevention)
- Verify SQL queries use parameterized queries
- Improve error message sanitization

### Data Protection

#### ✅ Completed

- Implement log redaction for sensitive data

#### ⏳ Remaining

- **P3: Add data encryption at rest** (8 SP)
  - Encrypt PII fields (email, phone) before database storage
  - Create encryption utility
  - Document migration process

### Infrastructure Security

#### ✅ Completed

- Fix CORS no-origin allowance
- Fix CSP unsafe-eval in production
- Add missing security headers

#### ⏳ Remaining

- **P2: Set up automated dependency scanning** (3 SP)
  - Add npm audit to CI/CD
  - Integrate Snyk
  - Create security workflow

- **P2: Migrate secrets to secret management service** (5 SP)
  - Evaluate options (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
  - Integrate chosen service
  - Migrate existing secrets
  - Document rotation process

- **P3: Test CORS configuration** (2 SP)
  - Create integration tests
  - Test in production-like environment
  - Verify unauthorized origins blocked

### Cross-Site Request Forgery (CSRF)

#### ✅ Completed

- Implement CSRF protection (backend)
- Add CSRF token to mutation requests (frontend)

### Testing & Verification

#### ✅ Completed

- Add security regression tests
- Verify rate limiter fallback fix

#### ⏳ Remaining

- **P3: Add rate limiter fallback regression tests** (2 SP)
  - Tests already exist and passing
  - Mark as complete after verification

---

## Detailed Task Specifications

### Task: Implement Secret Rotation Mechanism

**Priority:** P2 (High)  
**Effort:** 5 story points  
**Dependencies:** Infrastructure secret management service  
**Owner:** Backend team

**Description:**
Integrate AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault for production secrets. Add secret rotation support.

**Acceptance Criteria:**

- [ ] Secret management service integrated
- [ ] Secret rotation API implemented
- [ ] Migration plan documented
- [ ] Rotation schedule defined
- [ ] Monitoring/alerting configured

**Implementation Steps:**

1. Evaluate secret management service options
2. Choose service (recommend AWS Secrets Manager for AWS deployments)
3. Create `server/_core/secrets.ts` utility
4. Implement secret retrieval functions
5. Implement rotation API endpoints
6. Document migration process
7. Set up rotation schedule
8. Add monitoring/alerting

**Files to Modify:**

- `server/_core/secrets.ts` (new)
- `server/_core/env.ts` (update to use secret service)
- `server/routers.ts` (add rotation endpoints)
- `docs/SECRET_ROTATION_GUIDE.md` (new)

**Estimated Time:** 2-3 days

---

### Task: Set Up Automated Dependency Vulnerability Scanning

**Priority:** P2 (High)  
**Effort:** 3 story points  
**Dependencies:** None  
**Owner:** DevOps team

**Description:**
Add npm audit and Snyk to CI/CD pipeline. Create security workflow.

**Acceptance Criteria:**

- [ ] npm audit script added to package.json
- [ ] Snyk integration configured
- [ ] GitHub Actions workflow created
- [ ] Security alerts configured
- [ ] Documentation updated

**Implementation Steps:**

1. Add npm audit scripts to `package.json`
2. Install Snyk CLI
3. Configure Snyk project
4. Create `.github/workflows/security.yml`
5. Set up security alerts in GitHub
6. Document process

**Files to Modify:**

- `package.json` (add scripts)
- `.github/workflows/security.yml` (new)
- `docs/SECURITY_SCANNING_GUIDE.md` (new)

**Estimated Time:** 1-2 days

---

### Task: Add Data Encryption at Rest

**Priority:** P3 (Medium)  
**Effort:** 8 story points  
**Dependencies:** None  
**Owner:** Backend team

**Description:**
Implement encryption for PII fields (email, phone) before database storage.

**Acceptance Criteria:**

- [ ] Encryption utility created
- [ ] PII fields encrypted before storage
- [ ] Decryption on retrieval implemented
- [ ] Migration script created
- [ ] Key management documented

**Implementation Steps:**

1. Choose encryption library (recommend `crypto` built-in or `node-forge`)
2. Create `server/_core/encryption.ts` utility
3. Implement encrypt/decrypt functions
4. Update database schema helpers to encrypt PII
5. Create migration script for existing data
6. Document key management process
7. Add tests

**Files to Modify:**

- `server/_core/encryption.ts` (new)
- `server/db.ts` (update user creation/retrieval)
- `server/lead-db.ts` (update lead creation/retrieval)
- `server/scripts/migrate-encrypt-pii.ts` (new)
- `docs/ENCRYPTION_GUIDE.md` (new)

**Estimated Time:** 4-5 days

---

### Task: Test CORS Configuration in Production-like Environment

**Priority:** P3 (Medium)  
**Effort:** 2 story points  
**Dependencies:** None  
**Owner:** QA team

**Description:**
Verify CORS blocks unauthorized origins and allows only whitelisted ones.

**Acceptance Criteria:**

- [ ] Integration tests created
- [ ] Tests verify unauthorized origins blocked
- [ ] Tests verify whitelisted origins allowed
- [ ] Tests run in CI/CD

**Implementation Steps:**

1. Create `tests/integration/cors.test.ts`
2. Write tests for unauthorized origin rejection
3. Write tests for whitelisted origin acceptance
4. Write tests for no-origin handling
5. Add to CI/CD pipeline

**Files to Modify:**

- `tests/integration/cors.test.ts` (new)
- `.github/workflows/test.yml` (add integration tests)

**Estimated Time:** 1 day

---

## Risk Assessment

### High Risk Items

1. **Secret Rotation Mechanism** (P2)
   - **Risk:** Secrets exposed if rotation fails
   - **Mitigation:** Implement gradual rollout, monitoring, rollback plan

2. **Data Encryption at Rest** (P3)
   - **Risk:** Data loss if encryption keys lost
   - **Mitigation:** Key backup strategy, key rotation plan

### Medium Risk Items

1. **Dependency Scanning** (P2)
   - **Risk:** False positives blocking deployments
   - **Mitigation:** Configure severity thresholds, manual review process

---

## Dependencies & Blockers

### Current Blockers

None - All tasks can proceed independently

### Dependency Chains

1. **Secret Management:**
   - Infrastructure setup → Secret rotation mechanism
   - Secret rotation → Key rotation documentation

2. **Testing:**
   - CORS tests → CI/CD integration
   - Rate limiter tests → Verification complete

---

## Success Metrics

### Completion Targets

- **Sprint 2:** 8/8 tasks (100%) - Currently 6/8 (75%)
- **Sprint 3:** 7/7 tasks (100%) - Currently 1/7 (14%)

### Quality Metrics

- All security tests passing
- Zero critical vulnerabilities
- < 5 high-priority vulnerabilities
- Security headers score: 100%
- Dependency audit: 0 critical issues

---

## Next Steps

### Immediate (This Week)

1. ✅ Complete remaining Sprint 2 tasks (2 tasks, 8 SP)
2. ⏭️ Start Sprint 3 tasks (6 tasks, 14 SP)

### This Month

1. Complete all P2 security tasks
2. Begin P3 security hardening
3. Security audit review

### Next Quarter

1. Complete all P3 security tasks
2. Security compliance review
3. Penetration testing

---

## Resources

- **Security Review:** `docs/SECURITY_REVIEW_2025-01-28.md`
- **Security Tests:** `server/__tests__/security.test.ts`
- **Accessibility Audit:** `docs/ACCESSIBILITY_AUDIT.md`
- **Testing Guide:** `docs/ACCESSIBILITY_TESTING_GUIDE.md`

---

**Last Updated:** 2025-01-28  
**Next Review:** After Sprint 2 completion
