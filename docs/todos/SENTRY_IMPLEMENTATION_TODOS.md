# Sentry Integration - TODO List

**Date:** November 16, 2025  
**Status:** ✅ Complete (Codebase) / 🟡 Pending (Sentry.io Config)
**Last Action:** Verification and Cleanup

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
- [x] **Backend Integration Verified:**
  - Verified via `scripts/verify-sentry.ts` (Successful flush to Sentry)
- [x] **Frontend Integration Configured:**
  - Verified correct DSN injection in Vite build
  - Verified initialization code in `client/src/main.tsx`
  - Verified ErrorBoundary configuration

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
- [x] Add Sentry variables to .env.prod

---

## 🔔 REMINDER: Sentry.io Configuration (Manual Step)

**Action Required:** Configure Alerts in Sentry Dashboard.
**When:** Before production launch or when convenient.

### Steps to Configure
1. Go to [sentry.io](https://sentry.io) and log in.
2. Select your project (`tekup-friday-ai`).
3. Navigate to **Alerts** in the left sidebar.
4. Click **Create Alert**.
5. Select **"Issues"** -> **"Set Conditions"**.
6. Recommended Rule:
   - **Condition:** "When a new issue is created"
   - **Action:** Send email to team / Post to Slack
   - **Filter:** Consider filtering to `environment: production` to avoid noise from dev.

---

**Integration Status:** Verified & Complete (Infrastructure ready)
