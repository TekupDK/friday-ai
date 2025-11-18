# Sprint Todos: Critical Fixes & Production Readiness

**Sprint Periode:** 2025-01-28 - 2025-02-04  
**Duration:** 7 dage  
**Status:** 🚧 In Progress

---

## Sprint Overview

**Focus:** Fix production blockers and unblock email features  
**Total Tasks:** 7 tasks  
**Estimated Effort:** 35-40 timer  
**Priority:** Critical fixes first, then important features

---

## Task Selection Rationale

**Selected Tasks:**
- ✅ All 6 critical missing items (production blockers)
- ✅ 1 important item (segment update - quick win)
- ✅ Focus on unblocking email features
- ✅ Fix TypeScript errors (blocks deployment)

**Not Selected (Deferred):**
- Auto-invoice creation (depends on email pipeline)
- Email template system (can wait)
- Pipeline automation (depends on SMTP)
- Advanced search (nice-to-have)

---

## Sprint TODO List

### 🔴 Critical Priority (Must Complete)

#### [P1-1] Fix TypeScript Compilation Errors
**Estimated:** 2-4 timer  
**Status:** 🔴 Not Started  
**Owner:** Developer

**Tasks:**
- [ ] Fix `CustomerList.tsx` - customerType type mismatch
- [ ] Fix `crm-workflow.test.ts` - Add missing status property
- [ ] Export `OpportunityCardData` and `OpportunityStage` from `OpportunityColumn.tsx`
- [ ] Fix `OpportunityForm.tsx` - Type assignment issue
- [ ] Implement `deleteSegment` endpoint in `crm-extensions-router.ts`
- [ ] Fix `SegmentActions.tsx` - Function argument count
- [ ] Verify: `tsc --noEmit` passes with 0 errors
- [ ] Run all tests to ensure no regressions

**Acceptance:**
- ✅ All 6 files compile without errors
- ✅ Type checking passes
- ✅ Tests pass

---

#### [P1-2] Implement SMTP Inbound Email Server
**Estimated:** 8-16 timer (1-2 dage)  
**Status:** 🔴 Not Started  
**Owner:** Developer + DevOps  
**Dependencies:** Docker, DNS access, Google Workspace admin

**Tasks:**
- [ ] Clone `github.com/sendbetter/inbound-email`
- [ ] Setup Docker container and configuration
- [ ] Configure DNS MX records for `parse.tekup.dk`
- [ ] Setup Google Workspace auto-forward (info@rendetalje.dk → parse@tekup.dk)
- [ ] Implement `/api/inbound/email` webhook endpoint in backend
- [ ] Parse email data (from, to, subject, body, attachments)
- [ ] Insert into database (emails, email_threads, attachments tables)
- [ ] Test with real email delivery
- [ ] Update email enrichment pipeline (remove Gmail API dependency)
- [ ] Document setup process in `docs/`

**Acceptance:**
- ✅ SMTP server receiving emails
- ✅ Webhook endpoint functional
- ✅ Emails stored in database
- ✅ No Gmail API rate limit errors

---

#### [P1-3] Setup Email Notification Service
**Estimated:** 4-6 timer  
**Status:** 🔴 Not Started  
**Owner:** Developer  
**Dependencies:** SendGrid account

**Tasks:**
- [ ] Create SendGrid account (or AWS SES)
- [ ] Verify domain (if required)
- [ ] Add API key to `.env` files
- [ ] Create email templates:
  - [ ] Welcome email
  - [ ] Error notification
  - [ ] Task reminder
  - [ ] Calendar reminder
- [ ] Implement `sendEmail` function in `server/notification-service.ts`
- [ ] Integrate with notification service
- [ ] Test email delivery
- [ ] Add error handling and retry logic
- [ ] Update documentation

**Acceptance:**
- ✅ SendGrid account configured
- ✅ Test emails successfully sent
- ✅ Notification service integrated
- ✅ Error handling working

---

### 🟡 Important Priority (Should Complete)

#### [P2-1] Implement Calendar Reminder Scheduling
**Estimated:** 4-6 timer  
**Status:** 🟡 Pending  
**Owner:** Developer  
**Dependencies:** Email notification service (P1-3)

**Tasks:**
- [ ] Design reminder system architecture
- [ ] Create database table for reminders (if needed)
- [ ] Implement scheduling logic (calculate reminder times)
- [ ] Integrate with notification service
- [ ] Add UI for reminder settings in `CalendarTab.tsx`
- [ ] Test reminder delivery (30 min before event)
- [ ] Handle edge cases (all-day events, recurring events)
- [ ] Remove TODO comment in `CalendarTab.tsx:1288`

**Acceptance:**
- ✅ Reminder scheduling working
- ✅ Reminders sent at correct times
- ✅ UI for reminder settings
- ✅ Test reminders delivered

---

#### [P2-2] Implement Segment Update Endpoint
**Estimated:** 2-3 timer  
**Status:** 🟡 Pending  
**Owner:** Developer

**Tasks:**
- [ ] Implement `updateSegment` in `server/routers/crm-extensions-router.ts`
- [ ] Add Zod validation schema
- [ ] Implement database update logic
- [ ] Add error handling
- [ ] Update frontend `SegmentForm.tsx` to use endpoint
- [ ] Test update functionality
- [ ] Remove TODO comment in `SegmentForm.tsx:95`

**Acceptance:**
- ✅ Update endpoint implemented
- ✅ Frontend updated
- ✅ Tests passing
- ✅ TODO removed

---

#### [P2-3] Document Upload to Supabase Storage
**Estimated:** 3-4 timer  
**Status:** 🟡 Pending  
**Owner:** Developer  
**Dependencies:** Supabase Storage bucket

**Tasks:**
- [ ] Create Supabase Storage bucket for documents
- [ ] Setup bucket permissions
- [ ] Implement upload function in `DocumentUploader.tsx`
- [ ] Add file validation (max size, allowed types)
- [ ] Implement download functionality
- [ ] Add upload progress indicator
- [ ] Test with various file types
- [ ] Remove TODO comment in `DocumentUploader.tsx:69`

**Acceptance:**
- ✅ Supabase Storage bucket created
- ✅ Upload/download working
- ✅ File validation implemented
- ✅ UI updated

---

### 🟢 Nice-to-Have (If Time Permits)

#### [P3-1] A/B Testing Metrics Persistence
**Estimated:** 3-4 timer  
**Status:** 🟢 Optional  
**Owner:** Developer

**Tasks:**
- [ ] Design metrics schema
- [ ] Create database migration
- [ ] Implement storage logic in `server/_core/ab-testing.ts`
- [ ] Create analysis queries
- [ ] Test metrics collection
- [ ] Remove TODO comments in `ab-testing.ts:156,190`

**Acceptance:**
- ✅ Metrics stored in database
- ✅ Analysis queries working
- ✅ TODO comments removed

---

## Daily Breakdown

### Day 1 (Tirsdag, 2025-01-28) - 8 timer

**Focus:** Fix TypeScript Errors + Start SMTP Setup

**Morning (4 timer):**
- [P1-1] Fix TypeScript compilation errors (2-4 timer)
  - Fix all 6 files
  - Verify with `tsc --noEmit`
  - Run tests

**Afternoon (4 timer):**
- [P1-2] Start SMTP server setup (4 timer)
  - Clone repository
  - Setup Docker
  - Begin DNS config

**Daily Goal:** ✅ All TypeScript errors fixed, SMTP setup started

---

### Day 2 (Onsdag, 2025-01-29) - 8 timer

**Focus:** Complete SMTP Server Setup

**Morning (4 timer):**
- [P1-2] Complete DNS and Google Workspace setup (4 timer)
  - Configure MX records
  - Setup auto-forward
  - Test DNS

**Afternoon (4 timer):**
- [P1-2] Implement webhook endpoint (4 timer)
  - Create endpoint
  - Parse email data
  - Test reception

**Daily Goal:** ✅ SMTP server receiving emails

---

### Day 3 (Torsdag, 2025-01-30) - 8 timer

**Focus:** Email Storage + Notification Service

**Morning (4 timer):**
- [P1-2] Complete email storage (4 timer)
  - Database insertion
  - Test end-to-end
  - Update pipeline

**Afternoon (4 timer):**
- [P1-3] Setup notification service (4-6 timer)
  - SendGrid account
  - Implement sendEmail
  - Test delivery

**Daily Goal:** ✅ Emails stored, notifications working

---

### Day 4 (Fredag, 2025-01-31) - 8 timer

**Focus:** Calendar Reminders + Quick Wins

**Morning (4 timer):**
- [P2-1] Calendar reminders (4-6 timer)
  - Implement scheduling
  - Add UI
  - Test delivery

**Afternoon (4 timer):**
- [P2-2] Segment update endpoint (2-3 timer)
- [P2-3] Document upload (3-4 timer)

**Daily Goal:** ✅ Reminders working, 2 quick wins done

---

### Day 5 (Mandag, 2025-02-03) - 8 timer

**Focus:** A/B Testing + Testing & Documentation

**Morning (4 timer):**
- [P3-1] A/B testing metrics (3-4 timer)
  - If time permits

**Afternoon (4 timer):**
- Comprehensive testing
- Documentation updates
- Code review prep

**Daily Goal:** ✅ All features tested, docs updated

---

## Estimated Effort Summary

| Priority | Tasks | Estimated Hours | Story Points |
|----------|-------|----------------|--------------|
| P1 (Critical) | 3 | 14-26 timer | 21 SP |
| P2 (Important) | 3 | 9-13 timer | 12 SP |
| P3 (Nice-to-have) | 1 | 3-4 timer | 4 SP |
| **Total** | **7** | **26-43 timer** | **37 SP** |

**Sprint Capacity:** ~40 timer  
**Committed:** 26-43 timer (fits within capacity with buffer)

---

## Success Criteria

- [ ] All P1 tasks completed (100%)
- [ ] All P2 tasks completed (100%)
- [ ] P3 tasks completed (if time permits)
- [ ] All TypeScript errors fixed
- [ ] SMTP server operational
- [ ] Email notifications working
- [ ] All features tested
- [ ] Documentation updated
- [ ] Code review completed

---

## Risk Items

### High Risk
- SMTP server setup complexity
- Google Workspace admin access delays
- SendGrid account verification time

### Medium Risk
- TypeScript error complexity
- Calendar reminder scheduling complexity

### Mitigation
- Start early with external dependencies
- Have backup plans ready
- Defer complex items if needed

---

## Dependencies

### External
- Docker environment ✅
- DNS access ⚠️
- Google Workspace admin ⚠️
- SendGrid account ⚠️

### Internal
- Email notification → Calendar reminders
- SMTP server → All email features
- TypeScript fixes → Production deployment

---

**Last Updated:** 2025-01-28  
**Status:** 🚧 Ready to Start

