# TODO Audit Report - January 28, 2025

**⚠️ ARCHIVED - See `docs/TODO_AUDIT_2025-11-16.md` for current status**

**Date:** January 28, 2025  
**Scope:** Review and categorize TODO/FIXME/XXX/HACK comments  
**Total Found:** ~105 comments across 52 files

**Status:** This audit is outdated. Please refer to the November 16, 2025 audit for current status.

---

## Summary

### By Priority

**🔴 High Priority (Action Required):**

- 15 comments requiring immediate attention
- Security-related, critical bugs, or blocking issues

**🟡 Medium Priority (Should Fix):**

- 35 comments for improvements or technical debt
- Performance optimizations, code quality

**🟢 Low Priority (Nice to Have):**

- 40 comments for future enhancements
- Feature requests, documentation improvements

**⚪ Obsolete/Remove:**

- 15 comments that are outdated or no longer relevant

---

## High Priority TODOs

### Security & Critical Issues

1. **`server/email-monitor.ts:383`** ✅ FIXED

   ```typescript
   userId: emailData.userId ?? 1, // TODO: get from user context
   ```

   - **Issue:** Hardcoded fallback userId could cause data leakage
   - **Action:** ✅ Implemented `getUserIdFromEmail()` to resolve userId from Gmail email
   - **Status:** Fixed - Now resolves userId from email address instead of hardcoded fallback
   - **Priority:** 🔴 High (RESOLVED)

2. **`server/notification-service.ts:70`**

   ```typescript
   // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
   ```

   - **Issue:** Email notifications not implemented
   - **Action:** Integrate email service provider
   - **Priority:** 🔴 High

3. **`server/notification-service.ts:235`**

   ```typescript
   // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
   ```

   - **Issue:** SMS notifications not implemented
   - **Action:** Integrate SMS service provider
   - **Priority:** 🟡 Medium (if SMS is required)

### Database & Data Integrity

4. **`server/_core/ab-testing.ts:156`**

   ```typescript
   // TODO: Store metrics in database for analysis
   ```

   - **Issue:** A/B test metrics not persisted
   - **Action:** Implement database storage for metrics
   - **Priority:** 🟡 Medium

5. **`server/_core/ab-testing.ts:190`**

   ```typescript
   // TODO: Fetch actual metrics from database
   ```

   - **Issue:** Metrics analysis incomplete
   - **Action:** Implement database queries for metrics
   - **Priority:** 🟡 Medium

---

## Medium Priority TODOs

### Performance & Optimization

6. **`server/_core/streaming.ts:105`**

   ```typescript
   // TODO: Get actual usage from LLM response
   ```

   - **Issue:** Token usage not tracked accurately
   - **Action:** Extract usage from LLM response
   - **Priority:** 🟡 Medium

### Code Quality

7. **`server/email-monitor.ts:433`**

   ```typescript
   // TODO: Implement specific auto-actions
   ```

   - **Issue:** Auto-actions incomplete
   - **Action:** Complete auto-action implementation
   - **Priority:** 🟡 Medium

---

## Low Priority TODOs

### Future Enhancements

- Feature requests in various components
- UI/UX improvements
- Documentation additions
- Test improvements

---

## Obsolete TODOs

### Can Be Removed

1. **Test data files** - Multiple TODO comments in test data JSON files
   - **Action:** Remove or convert to proper test fixtures
   - **Files:** `server/integrations/chromadb/test-data/*.json`

2. **Deprecated code paths** - TODOs referencing old implementations
   - **Action:** Review and remove if code is no longer used

---

## Recommendations

### Immediate Actions

1. **Fix Security Issues:**
   - Remove hardcoded userId fallback
   - Implement proper user context

2. **Complete Critical Features:**
   - Email notification service integration
   - A/B testing metrics persistence

3. **Clean Up:**
   - Remove obsolete TODOs
   - Convert actionable TODOs to GitHub issues

### Process Improvements

1. **TODO Management:**
   - Use GitHub issues for tracking instead of code comments
   - Add issue numbers to TODOs that reference issues
   - Review TODOs during code reviews

2. **Documentation:**
   - Document why TODOs exist
   - Add expiration dates for TODOs
   - Regular TODO audits (quarterly)

---

## Action Plan

### Phase 1: Critical (This Week)

- [ ] Fix hardcoded userId in email-monitor
- [ ] Integrate email notification service
- [ ] Remove obsolete TODOs from test data

### Phase 2: Important (Next 2 Weeks)

- [ ] Implement A/B test metrics storage
- [ ] Complete auto-actions implementation
- [ ] Fix token usage tracking

### Phase 3: Cleanup (Next Month)

- [ ] Convert remaining TODOs to GitHub issues
- [ ] Remove outdated comments
- [ ] Document TODO management process

---

**Last Updated:** January 28, 2025  
**Next Audit:** February 28, 2025
