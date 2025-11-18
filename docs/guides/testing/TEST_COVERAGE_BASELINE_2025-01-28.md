# Test Coverage Baseline - January 28, 2025

**Generated:** January 28, 2025  
**Test Framework:** Vitest with v8 coverage provider  
**Command:** `pnpm test:coverage`

---

## Summary

This document provides the baseline test coverage metrics for the Friday AI Chat codebase.

### Test Execution Results

- **Test Files:** 39 passed, 7 failed, 2 skipped (48 total)
- **Tests:** 458 passed, 1 failed, 2 skipped (461 total)
- **Duration:** ~17.4 seconds

### Coverage Thresholds (Configured)

The project has coverage thresholds configured in `vitest.config.ts`:

- **Lines:** 80% (0.8)
- **Statements:** 80% (0.8)
- **Functions:** 80% (0.8)
- **Branches:** 70% (0.7)

### Known Test Failures

1. **CORS Test** - 1 test failing due to missing OAuth route in test setup (test infrastructure issue, not code bug)
2. **Test Suite Failures** - 6 test suites failed due to transform/build errors:
   - `server/__tests__/crm-smoke.test.ts`
   - `server/__tests__/crm-status.test.ts`
   - `server/__tests__/e2e-email-to-lead.test.ts`
   - `server/__tests__/workflow-automation-smoke.test.ts`
   - `server/routes/__tests__/health.test.ts`
   - `tests/redaction.test.ts` (transform error)

### Coverage Report Location

Coverage reports are generated in the `coverage/` directory with:
- **HTML Report:** `coverage/index.html` (interactive browser view)
- **JSON Report:** `coverage/coverage-final.json` (machine-readable)
- **Text Report:** Console output during test run

### Next Steps

1. **Fix Test Infrastructure Issues:**
   - Resolve transform/build errors in 6 test suites
   - Fix CORS test OAuth route setup

2. **Improve Coverage:**
   - Add tests for critical business logic (invoice creation, booking creation)
   - Increase coverage for untested areas
   - Focus on high-risk code paths

3. **Monitor Coverage:**
   - Run `pnpm test:coverage` regularly
   - Track coverage trends over time
   - Set up CI/CD coverage reporting

### Coverage Exclusions

The following are excluded from coverage calculations (configured in `vitest.config.ts`):

- `node_modules/`
- `dist/`
- `**/*.d.ts` (TypeScript declaration files)
- `**/*.config.*` (Config files)
- `**/vitest.setup.ts` (Test setup files)

---

## Detailed Coverage Metrics

*Note: Run `pnpm test:coverage` and open `coverage/index.html` in a browser for detailed per-file coverage metrics.*

### Coverage by Area (Estimated)

Based on test file locations:

- **Server Core:** Good coverage (rate limiting, error handling, validation)
- **Server Routers:** Moderate coverage (some routers well-tested, others need work)
- **Client Components:** Good coverage (inbox components, email components)
- **Integrations:** Limited coverage (needs improvement)
- **Business Logic:** Needs improvement (invoice, booking, workflow automation)

---

**Last Updated:** January 28, 2025  
**Next Review:** February 28, 2025
