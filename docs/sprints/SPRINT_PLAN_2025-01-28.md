# Sprint Plan: Critical Fixes & Production Readiness

**Dato:** 2025-01-28  
**Sprint Periode:** 2025-01-28 - 2025-02-04  
**Duration:** 7 dage (1 uge)  
**Team Capacity:** ~40 timer (1 developer, 5 dage × 8 timer)  
**Sprint Type:** Critical Fixes & Production Blockers

---

## Sprint Goals

1. **Fix Production Blockers** - Resolve TypeScript errors and critical bugs
2. **Unblock Email Features** - Implement SMTP inbound server to bypass Gmail rate limits
3. **Complete Core Notifications** - Setup email notification service for user alerts
4. **Improve Code Quality** - Fix compilation errors and improve type safety

---

## Sprint Backlog

### 🔴 High Priority (Must Have) - 20-24 timer

#### 1. Fix TypeScript Compilation Errors

**Priority:** P1 - Critical  
**Estimated:** 2-4 timer / 3 story points  
**Dependencies:** None  
**Owner:** Developer  
**Status:** 🔴 Blocking production deployment

**Acceptance Criteria:**

- [ ] All 6 files compile without errors
- [ ] Type checking passes (`tsc --noEmit`)
- [ ] No type safety warnings
- [ ] All imports resolve correctly
- [ ] Tests pass

**Files to Fix:**

1. `client/src/pages/crm/CustomerList.tsx` - Type mismatch (`"private" | "erhverv"` vs `"private"`)
2. `server/__tests__/crm-workflow.test.ts` - Missing `status` property
3. `client/src/pages/crm/OpportunityPipeline.tsx` - Export `OpportunityCardData` and `OpportunityStage`
4. `client/src/components/crm/OpportunityForm.tsx` - Type assignment issue
5. `client/src/pages/crm/SegmentList.tsx` - Missing `deleteSegment` endpoint
6. `client/src/components/crm/SegmentActions.tsx` - Argument count mismatch

**Tasks:**

- [ ] Fix CustomerList customerType type definition
- [ ] Add status property to CRM workflow test types
- [ ] Export OpportunityCardData and OpportunityStage from OpportunityColumn
- [ ] Fix OpportunityForm stage type assignment
- [ ] Implement deleteSegment endpoint in backend
- [ ] Fix SegmentActions function signature

---

#### 2. Implement SMTP Inbound Email Server

**Priority:** P1 - Critical  
**Estimated:** 1-2 dage (8-16 timer) / 13 story points  
**Dependencies:** Docker, DNS access, Google Workspace admin  
**Owner:** Developer + DevOps  
**Status:** 🔴 Blocking all email features

**Acceptance Criteria:**

- [ ] SMTP server running in Docker
- [ ] DNS MX records configured
- [ ] Google Workspace auto-forward setup
- [ ] Webhook endpoint receives emails
- [ ] Emails parsed and stored in database
- [ ] Test emails successfully processed
- [ ] No Gmail API rate limit errors

**Tasks:**

- [ ] Clone `github.com/sendbetter/inbound-email`
- [ ] Setup Docker container and configuration
- [ ] Configure DNS MX records for `parse.tekup.dk`
- [ ] Setup Google Workspace auto-forward (info@rendetalje.dk → parse@tekup.dk)
- [ ] Implement `/api/inbound/email` webhook endpoint
- [ ] Parse email data (from, to, subject, body, attachments)
- [ ] Insert into database (emails, email_threads, attachments tables)
- [ ] Test with real email delivery
- [ ] Update email enrichment pipeline (no Gmail API)
- [ ] Document setup process

**Dependencies:**

- Docker environment
- DNS access for MX records
- Google Workspace admin access
- Database schema ready

---

#### 3. Setup Email Notification Service

**Priority:** P1 - Critical  
**Estimated:** 4-6 timer / 5 story points  
**Dependencies:** SendGrid/AWS SES account  
**Owner:** Developer  
**Status:** 🔴 Required for user notifications

**Acceptance Criteria:**

- [ ] SendGrid or AWS SES account configured
- [ ] API keys stored securely in environment
- [ ] Email templates created (welcome, error, reminder)
- [ ] `sendEmail` function implemented
- [ ] Integrated with notification service
- [ ] Test emails successfully sent
- [ ] Error handling for delivery failures

**Tasks:**

- [ ] Choose provider (SendGrid recommended - free tier available)
- [ ] Create SendGrid account and verify domain
- [ ] Add API key to environment variables
- [ ] Create email templates (welcome, error, reminder, task notification)
- [ ] Implement `sendEmail` function in `server/notification-service.ts`
- [ ] Add email sending to notification service
- [ ] Test email delivery (welcome email, error notification)
- [ ] Add error handling and retry logic
- [ ] Update notification service documentation

**Dependencies:**

- SendGrid account (or AWS SES)
- Domain verification (if required)

---

### 🟡 Medium Priority (Should Have) - 8-12 timer

#### 4. Implement Calendar Reminder Scheduling

**Priority:** P2 - Important  
**Estimated:** 4-6 timer / 5 story points  
**Dependencies:** Email notification service (item #3)  
**Owner:** Developer  
**Status:** 🟡 Core calendar feature

**Acceptance Criteria:**

- [ ] Reminder scheduling system designed
- [ ] Reminder logic implemented
- [ ] Integration with notification service
- [ ] UI for reminder settings (30 min, 1 hour, 1 day before)
- [ ] Reminders sent at correct times
- [ ] Test reminder delivery

**Tasks:**

- [ ] Design reminder system architecture
- [ ] Create database table for reminders (if needed)
- [ ] Implement scheduling logic (calculate reminder times)
- [ ] Integrate with notification service
- [ ] Add UI for reminder settings in CalendarTab
- [ ] Test reminder delivery (30 min before event)
- [ ] Handle edge cases (all-day events, recurring events)

**Dependencies:**

- Email notification service (item #3)

---

#### 5. Implement Segment Update Endpoint

**Priority:** P2 - Important  
**Estimated:** 2-3 timer / 3 story points  
**Dependencies:** None  
**Owner:** Developer  
**Status:** 🟡 Incomplete feature

**Acceptance Criteria:**

- [ ] `updateSegment` endpoint implemented
- [ ] Input validation added
- [ ] Database update logic
- [ ] Frontend updated to use endpoint
- [ ] Tests passing

**Tasks:**

- [ ] Implement `updateSegment` in `server/routers/crm-extensions-router.ts`
- [ ] Add Zod validation schema
- [ ] Implement database update logic
- [ ] Add error handling
- [ ] Update frontend `SegmentForm.tsx` to use endpoint
- [ ] Test update functionality
- [ ] Remove TODO comment

---

#### 6. Document Upload to Supabase Storage

**Priority:** P2 - Important  
**Estimated:** 3-4 timer / 4 story points  
**Dependencies:** Supabase Storage bucket  
**Owner:** Developer  
**Status:** 🟡 Incomplete feature

**Acceptance Criteria:**

- [ ] Supabase Storage bucket created
- [ ] Upload logic implemented
- [ ] File validation (size, type)
- [ ] Download functionality
- [ ] UI updated to show upload progress
- [ ] Test upload/download

**Tasks:**

- [ ] Create Supabase Storage bucket for documents
- [ ] Setup bucket permissions
- [ ] Implement upload function in `DocumentUploader.tsx`
- [ ] Add file validation (max size, allowed types)
- [ ] Implement download functionality
- [ ] Add upload progress indicator
- [ ] Test with various file types
- [ ] Remove TODO comment

---

### 🟢 Low Priority (Nice to Have) - 4-6 timer

#### 7. A/B Testing Metrics Persistence

**Priority:** P3 - Nice-to-have  
**Estimated:** 3-4 timer / 4 story points  
**Dependencies:** Database schema  
**Owner:** Developer  
**Status:** 🟢 Feature enhancement

**Acceptance Criteria:**

- [ ] Metrics schema designed
- [ ] Database table created
- [ ] Storage logic implemented
- [ ] Analysis queries created
- [ ] Metrics collected and stored
- [ ] Test metrics collection

**Tasks:**

- [ ] Design metrics schema (test_id, variant, user_id, metric_name, value, timestamp)
- [ ] Create database migration
- [ ] Implement storage logic in `server/_core/ab-testing.ts`
- [ ] Create analysis queries (conversion rates, user counts)
- [ ] Test metrics collection
- [ ] Remove TODO comments

---

## Daily Breakdown

### Day 1 (Tirsdag, 2025-01-28)

**Focus:** Fix TypeScript Errors + Start SMTP Setup

- **Morning (4 timer):**
  - Fix TypeScript compilation errors (6 filer)
  - Verify all fixes with `tsc --noEmit`
  - Run tests to ensure no regressions

- **Afternoon (4 timer):**
  - Start SMTP inbound server setup
  - Clone inbound-email repository
  - Setup Docker container
  - Begin DNS configuration

**Goal:** All TypeScript errors fixed, SMTP server setup started

---

### Day 2 (Onsdag, 2025-01-29)

**Focus:** Complete SMTP Server Setup

- **Morning (4 timer):**
  - Complete DNS MX records configuration
  - Setup Google Workspace auto-forward
  - Test DNS resolution

- **Afternoon (4 timer):**
  - Implement webhook endpoint `/api/inbound/email`
  - Parse email data structure
  - Test email reception

**Goal:** SMTP server receiving emails, webhook endpoint functional

---

### Day 3 (Torsdag, 2025-01-30)

**Focus:** Email Storage + Notification Service

- **Morning (4 timer):**
  - Complete email parsing and database storage
  - Test end-to-end email flow
  - Update email enrichment pipeline

- **Afternoon (4 timer):**
  - Setup SendGrid account
  - Implement email notification service
  - Create email templates
  - Test email delivery

**Goal:** Emails stored in database, notification service working

---

### Day 4 (Fredag, 2025-01-31)

**Focus:** Calendar Reminders + Quick Wins

- **Morning (4 timer):**
  - Implement calendar reminder scheduling
  - Integrate with notification service
  - Add UI for reminder settings

- **Afternoon (4 timer):**
  - Implement segment update endpoint
  - Fix DocumentUploader Supabase Storage
  - Test both features

**Goal:** Calendar reminders working, 2 quick wins completed

---

### Day 5 (Mandag, 2025-02-03)

**Focus:** A/B Testing Metrics + Testing & Documentation

- **Morning (4 timer):**
  - Implement A/B testing metrics persistence
  - Create database schema
  - Test metrics collection

- **Afternoon (4 timer):**
  - Comprehensive testing of all features
  - Update documentation
  - Code review preparation

**Goal:** All features tested, documentation updated

---

## Milestones & Checkpoints

### Milestone 1: TypeScript Errors Fixed (Day 1, Morning)

**Verification:**

- [ ] `tsc --noEmit` passes with 0 errors
- [ ] All 6 files compile successfully
- [ ] Tests pass

**Status:** ✅ Ready for production deployment (no compilation errors)

---

### Milestone 2: SMTP Server Operational (Day 2, End)

**Verification:**

- [ ] SMTP server receiving emails
- [ ] Webhook endpoint functional
- [ ] Test email successfully processed
- [ ] No Gmail API rate limit errors

**Status:** ✅ Email features unblocked

---

### Milestone 3: Notification Service Live (Day 3, Afternoon)

**Verification:**

- [ ] SendGrid account configured
- [ ] Test email successfully sent
- [ ] Notification service integrated
- [ ] Error handling working

**Status:** ✅ User notifications enabled

---

### Milestone 4: Sprint Complete (Day 5, End)

**Verification:**

- [ ] All high priority tasks completed
- [ ] All medium priority tasks completed
- [ ] All features tested
- [ ] Documentation updated
- [ ] Code review completed

**Status:** ✅ Sprint goals achieved

---

## Risk Assessment

### 🔴 High Risk

1. **SMTP Server Setup Complexity**
   - **Risk:** DNS configuration or Docker setup issues
   - **Mitigation:** Start early, have DevOps support ready
   - **Contingency:** Use alternative email service if needed

2. **Google Workspace Admin Access**
   - **Risk:** May require admin approval for auto-forward
   - **Mitigation:** Request access early, have backup plan
   - **Contingency:** Manual forwarding setup if needed

3. **SendGrid Account Verification**
   - **Risk:** Domain verification may take time
   - **Mitigation:** Start account setup early
   - **Contingency:** Use AWS SES if SendGrid delayed

### 🟡 Medium Risk

1. **TypeScript Error Complexity**
   - **Risk:** Some errors may require schema changes
   - **Mitigation:** Start with simple fixes first
   - **Contingency:** Defer complex fixes to next sprint

2. **Calendar Reminder Scheduling**
   - **Risk:** May require background job system
   - **Mitigation:** Use simple polling if needed
   - **Contingency:** Defer to next sprint if too complex

---

## Success Criteria

- [ ] All high priority tasks completed (100%)
- [ ] All TypeScript errors fixed
- [ ] SMTP server operational
- [ ] Email notification service working
- [ ] Sprint goals achieved
- [ ] No critical bugs introduced
- [ ] Code review completed
- [ ] Tests passing (all existing tests)
- [ ] Documentation updated

---

## Velocity Projection

**Previous Velocity:** N/A (first structured sprint)  
**Sprint Capacity:** ~40 timer (1 developer, 5 dage × 8 timer)  
**Committed:** 35-40 timer (high + medium priority)  
**Buffer:** 0-5 timer (10% for unexpected work)

**Breakdown:**

- High Priority: 20-24 timer
- Medium Priority: 8-12 timer
- Low Priority: 4-6 timer (if time permits)
- Buffer: 0-5 timer

---

## Dependencies

### External Dependencies

1. **Docker Environment** - Status: ✅ Available
2. **DNS Access** - Status: ⚠️ Needs verification
3. **Google Workspace Admin** - Status: ⚠️ Needs access request
4. **SendGrid Account** - Status: ⚠️ Needs creation

### Internal Dependencies

1. **Email Notification Service** → Blocks Calendar Reminders
2. **SMTP Server** → Blocks all email features
3. **TypeScript Fixes** → Blocks production deployment
4. **Segment Update Endpoint** → Blocks segment management feature

---

## Notes

- **Focus on Critical:** Prioritize production blockers first
- **Quick Wins:** Segment update and document upload are quick wins
- **Testing:** Ensure all features tested before marking complete
- **Documentation:** Update docs as features are completed
- **Code Review:** Schedule review after Day 3 for early feedback

---

**Last Updated:** 2025-01-28  
**Next Sprint Review:** 2025-02-04
