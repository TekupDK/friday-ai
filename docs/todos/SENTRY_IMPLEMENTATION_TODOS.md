# Sentry Integration - TODO List

**Date:** January 28, 2025  
**Status:** Mostly Complete - Remaining items below

---

## ✅ Completed

### Backend
- [x] Install @sentry/node package
- [x] Configure Sentry.init() in server/_core/index.ts
- [x] Add Express integration via expressIntegration()
- [x] Add environment variables to ENV object (sentryDsn, sentryEnabled, sentryEnvironment, sentryTracesSampleRate)
- [x] Add conditional initialization logic

### Frontend
- [x] Install @sentry/react package
- [x] Configure Sentry.init() in client/src/main.tsx
- [x] Add browser tracing integration
- [x] Update PanelErrorBoundary to report errors to Sentry
- [x] Add dynamic import for code splitting

### Testing
- [x] Write server-side Sentry tests (18 tests)
- [x] Write client-side ErrorBoundary tests (4 tests)
- [x] All tests passing (22/22)
- [x] Test coverage validation

### Documentation
- [x] Create SENTRY_SETUP.md
- [x] Create SENTRY_COMPLETE.md
- [x] Create SENTRY_ENV_SETUP.md
- [x] Create SENTRY_TESTS_REPORT.md
- [x] Create SENTRY_VALIDATION_REPORT.md
- [x] Update documentation to match implementation

### Environment
- [x] Add Sentry variables to .env.dev
- [x] Create PowerShell script for adding env vars

---

## 🔄 Remaining Tasks

### Infrastructure (P1 - High Priority)
- [x] Add Sentry environment variables to .env.prod ✅
  - Script executed: `scripts/add-sentry-env-prod.ps1`
  - Variables added to .env.prod
  - Production setup guide created

### Configuration (P2 - Medium Priority)
- [ ] Configure Sentry alerts in Sentry dashboard
  - Alert rule: "An issue is created"
  - Condition: "More than 10 occurrences in 1 minute"
  - Action: Email/Slack notification
  - Optional but recommended

### Testing (P2 - Medium Priority)
- [ ] Integration testing in development environment
  - Start dev server
  - Verify Sentry initialization in logs
  - Trigger test error in browser
  - Verify error appears in Sentry dashboard
  - Test both server and client errors

### Documentation (P3 - Low Priority)
- [x] Add production deployment guide ✅
  - Created: `docs/devops-deploy/SENTRY_PRODUCTION_SETUP.md`
  - Includes: Production projects setup, alerts configuration, monitoring best practices

---

## Priority Summary

**P1 (Must Do):**
- Production environment variables

**P2 (Should Do):**
- Sentry alerts configuration
- Integration testing

**P3 (Nice to Have):**
- Production deployment guide

---

## Next Steps

1. **Immediate:** Add Sentry variables to .env.prod
2. **Short-term:** Configure alerts in Sentry dashboard
3. **Before Production:** Run integration tests
4. **Ongoing:** Monitor Sentry dashboard for errors

