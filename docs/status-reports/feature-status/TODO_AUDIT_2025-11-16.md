# TODO Audit Report - November 16, 2025

**Date:** November 16, 2025  
**Scope:** Review and categorize TODO/FIXME/XXX/HACK comments  
**Total Found:** ~105 comments across 52 files  
**Status:** Updated from January 28, 2025 audit

---

## Summary Statistics

### By Status

- ✅ **Completed:** 3 items (archived below)
- 🔴 **High Priority:** 2 items requiring immediate attention
- 🟡 **Medium Priority:** 4 items for improvements
- 🟢 **Low Priority:** 40+ items for future enhancements
- ⚪ **Obsolete:** 15+ items that are outdated or no longer relevant

### By Category

- **Security & Critical Issues:** 2 active, 1 completed
- **Code Quality:** 1 active, 2 completed
- **Performance & Optimization:** 1 active
- **Database & Data Integrity:** 2 active
- **Future Enhancements:** 40+ items

---

## ✅ Completed Tasks (Archived)

### Security & Critical Issues

1. **`server/email-monitor.ts:383`** ✅ COMPLETED (November 16, 2025)

   ```typescript
   // Before: userId: emailData.userId ?? 1, // TODO: get from user context
   // After: ✅ Implemented getUserIdFromEmail() to resolve userId from Gmail email
   ```

   - **Issue:** Hardcoded fallback userId could cause data leakage
   - **Action:** ✅ Implemented `getUserIdFromEmail()` to resolve userId from Gmail email
   - **Status:** Fixed - Now resolves userId from email address instead of hardcoded fallback
   - **Completion Date:** November 16, 2025
   - **Related Files:** `server/email-monitor.ts` (lines 372-413)

### Code Quality Improvements

2. **Console.log Replacement** ✅ COMPLETED (November 16, 2025)
   - **Issue:** Inconsistent logging using console.log/error/warn
   - **Action:** ✅ Replaced all console.log with structured logger
   - **Files Fixed:**
     - `server/notification-service.ts` - 4 replacements
     - `server/ai-router.ts` - 15 replacements
     - `server/routers/inbox-router.ts` - 1 replacement
   - **Status:** All server code now uses structured logger
   - **Completion Date:** November 16, 2025
   - **Related Report:** `docs/CODE_QUALITY_IMPROVEMENTS_REPORT.md`

3. **Input Validation Improvements** ✅ COMPLETED (November 16, 2025)
   - **Issue:** Missing max length limits on string inputs in inbox-router
   - **Action:** ✅ Added `labelName` validation schema and updated all inbox-router endpoints
   - **Files Fixed:**
     - `server/_core/validation.ts` - Added `labelName` schema
     - `server/routers/inbox-router.ts` - Updated 8 endpoints to use validationSchemas
   - **Status:** All inbox-router endpoints now use proper validation
   - **Completion Date:** November 16, 2025
   - **Related Report:** `docs/INPUT_VALIDATION_REPORT.md`

---

## 🔴 High Priority TODOs (Active)

### Security & Critical Issues

1. **`server/notification-service.ts:70`**

   ```typescript
   // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
   ```

   - **Issue:** Email notifications not implemented (only logging)
   - **Action:** Integrate email service provider (SendGrid, AWS SES, or similar)
   - **Priority:** 🔴 High
   - **Impact:** Email notifications not functional
   - **Estimated Effort:** 2-4 hours
   - **Dependencies:** Email service account setup

2. **`server/notification-service.ts:235`**

   ```typescript
   // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
   ```

   - **Issue:** SMS notifications not implemented (only logging)
   - **Action:** Integrate SMS service provider (Twilio, AWS SNS, or similar)
   - **Priority:** 🟡 Medium (if SMS is required for business)
   - **Impact:** SMS notifications not functional
   - **Estimated Effort:** 2-4 hours
   - **Dependencies:** SMS service account setup

---

## 🟡 Medium Priority TODOs

### Database & Data Integrity

3. **`server/_core/ab-testing.ts:156`**

   ```typescript
   // TODO: Store metrics in database for analysis
   ```

   - **Issue:** A/B test metrics not persisted
   - **Action:** Implement database storage for metrics
   - **Priority:** 🟡 Medium
   - **Impact:** Cannot analyze A/B test results over time
   - **Estimated Effort:** 4-6 hours
   - **Dependencies:** Database schema design

4. **`server/_core/ab-testing.ts:190`**

   ```typescript
   // TODO: Fetch actual metrics from database
   ```

   - **Issue:** Metrics analysis incomplete
   - **Action:** Implement database queries for metrics
   - **Priority:** 🟡 Medium
   - **Impact:** Cannot retrieve historical A/B test data
   - **Estimated Effort:** 3-4 hours
   - **Dependencies:** Task #3 (metrics storage)

### Performance & Optimization

5. **`server/_core/streaming.ts:105`**

   ```typescript
   // TODO: Get actual usage from LLM response
   ```

   - **Issue:** Token usage not tracked accurately
   - **Action:** Extract usage from LLM response
   - **Priority:** 🟡 Medium
   - **Impact:** Inaccurate token usage tracking
   - **Estimated Effort:** 2-3 hours
   - **Dependencies:** LLM API response format

### Code Quality

6. **`server/email-monitor.ts:470`**

   ```typescript
   // TODO: Implement specific auto-actions
   ```

   - **Issue:** Auto-actions incomplete
   - **Action:** Complete auto-action implementation
   - **Priority:** 🟡 Medium
   - **Impact:** Limited automation capabilities
   - **Estimated Effort:** 8-12 hours
   - **Dependencies:** Business requirements definition

---

## 🟢 Low Priority TODOs

### Future Enhancements

- Feature requests in various components
- UI/UX improvements
- Documentation additions
- Test improvements
- Performance optimizations
- Code refactoring opportunities

**Note:** These are tracked in code comments but should be converted to GitHub issues for proper tracking.

---

## ⚪ Obsolete TODOs

### Can Be Removed

1. **Test data files** - Multiple TODO comments in test data JSON files
   - **Action:** Remove or convert to proper test fixtures
   - **Files:** `server/integrations/chromadb/test-data/*.json`

2. **Deprecated code paths** - TODOs referencing old implementations
   - **Action:** Review and remove if code is no longer used

---

## Recommendations

### Immediate Actions (This Week)

1. **Complete Email Notification Integration:**
   - Choose email service provider (SendGrid recommended)
   - Set up service account
   - Implement email sending in `sendEmailNotification()`
   - Add error handling and retry logic

2. **Review Obsolete TODOs:**
   - Remove outdated comments
   - Convert actionable TODOs to GitHub issues

### Short-term Actions (Next 2 Weeks)

1. **Implement A/B Test Metrics Storage:**
   - Design database schema for metrics
   - Implement storage in `ab-testing.ts`
   - Add queries for metrics retrieval

2. **Complete Auto-Actions:**
   - Define business requirements
   - Implement specific auto-actions
   - Add tests

### Long-term Actions (Next Month)

1. **Convert TODOs to GitHub Issues:**
   - Create issues for all actionable TODOs
   - Link issues to code comments
   - Set up proper tracking

2. **Document TODO Management Process:**
   - Define when to use TODOs vs issues
   - Set expiration dates for TODOs
   - Regular TODO audits (quarterly)

---

## Action Plan

### Phase 1: Critical (This Week)

- [ ] Integrate email notification service
- [ ] Review and remove obsolete TODOs

### Phase 2: Important (Next 2 Weeks)

- [ ] Implement A/B test metrics storage
- [ ] Complete auto-actions implementation
- [ ] Fix token usage tracking

### Phase 3: Cleanup (Next Month)

- [ ] Convert remaining TODOs to GitHub issues
- [ ] Remove outdated comments
- [ ] Document TODO management process

---

## Related Documentation

- [Code Quality Improvements Report](./CODE_QUALITY_IMPROVEMENTS_REPORT.md) - Completed improvements
- [Input Validation Report](./INPUT_VALIDATION_REPORT.md) - Validation improvements
- [Rate Limiting Fixes Report](./RATE_LIMITING_FIXES_REPORT.md) - Rate limiting improvements
- [Session Summary](../../SESSION_SUMMARY_2025-11-16.md) - Recent work summary

---

**Last Updated:** November 16, 2025  
**Previous Audit:** January 28, 2025  
**Next Audit:** February 16, 2026 (Quarterly)
