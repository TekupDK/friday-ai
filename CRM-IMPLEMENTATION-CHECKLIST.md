# CRM Improvement Implementation Checklist

**Quick Reference Guide for Developers**

Brug denne checklist til at tracke implementering af CRM forbedringer.

---

## 🔴 P0 - KRITISK (Uge 1-2)

### P0.1: Transaction Management ⏱️ 3-5 dage

- [ ] Opret `server/db/transaction-utils.ts`
  - [ ] Implementer `withTransaction()` helper
  - [ ] Implementer `withRetryableTransaction()` helper
  - [ ] Tilføj error handling og logging

- [ ] Refactor multi-step operations til transactions:
  - [ ] `deleteSegment` (customerSegments + customerSegmentMembers)
  - [ ] `convertLeadToCustomer` (lead + customer + activity)
  - [ ] `deleteCustomerProfile` (customer + alle relationer)
  - [ ] `updateOpportunityStage` (opportunity + activity + health score)

- [ ] Skriv unit tests (`server/__tests__/transaction-utils.test.ts`)
  - [ ] Test successful commit
  - [ ] Test rollback on error
  - [ ] Test retry logic

- [ ] Deploy til staging og test
- [ ] Monitor for failed transactions i 1 uge
- [ ] Deploy til production

**Success Criteria:**
- ✅ Zero partial failures i multi-step operations
- ✅ All deletion operations atomic
- ✅ Transaction logging synligt i logs

---

### P0.2: Fix N+1 Queries ⏱️ 1 dag

- [ ] Refactor `listSegments` endpoint
  - [ ] Replace Promise.all loop med SQL JOIN
  - [ ] Test query performance (<100ms for 100 segments)

- [ ] Identificer andre N+1 patterns:
  ```bash
  grep -rn "Promise.all" server/routers/crm-*.ts
  ```

- [ ] Refactor alle fundne N+1 queries

- [ ] Skriv integration test der verificerer single query

**Success Criteria:**
- ✅ 1 query instead of N+1 for segment listing
- ✅ <100ms response time
- ✅ Query logs viser single SELECT

---

### P0.3: XSS Sanitization ⏱️ 2 dage

- [ ] Opret `client/src/utils/sanitize.ts`
  - [ ] Implementer `sanitizeHtml()` function
  - [ ] Implementer `sanitizeText()` function
  - [ ] Implementer `<SafeHtml>` component

- [ ] Find alle steder der renderer user input:
  ```bash
  grep -rn "customer\." client/src/pages/crm/ | grep -v "customer.id"
  grep -rn "note\." client/src/pages/crm/
  grep -rn "lead\." client/src/pages/crm/
  ```

- [ ] Refactor komponenter til at bruge sanitization:
  - [ ] `CustomerDetail.tsx` - notes, activities
  - [ ] `LeadPipeline.tsx` - lead names
  - [ ] `OpportunityCard.tsx` - titles, metadata
  - [ ] `SegmentBuilder.tsx` - segment names
  - [ ] `CustomerList.tsx` - customer names

- [ ] Skriv unit tests for sanitization utils
  - [ ] Test script tag removal
  - [ ] Test event handler removal
  - [ ] Test HTML stripping

**Success Criteria:**
- ✅ All user input sanitized
- ✅ No XSS vulnerabilities in audit
- ✅ Unit tests passing

---

### P0.4: Rate Limiting ⏱️ 1 dag

- [ ] Opret `server/_core/rate-limit.ts`
  - [ ] Implementer `createTRPCRateLimiter()` helper
  - [ ] Opret limiters for stats, export, pipeline

- [ ] Apply rate limiting til endpoints:
  - [ ] `crm.stats.getDashboardStats` (20/15min)
  - [ ] `crm.extensions.exportAuditLog` (10/15min)
  - [ ] `crm.extensions.listOpportunities` (30/15min)

- [ ] Skriv integration test
  - [ ] Test rate limit enforcement
  - [ ] Test error message

- [ ] Deploy og monitor rate limit hits

**Success Criteria:**
- ✅ Rate limiting på dyre endpoints
- ✅ Clear error messages
- ✅ Monitoring viser rate limit hits

---

### P0.5: Fix Silent Failures ⏱️ 2 dage

- [ ] Setup Sentry
  - [ ] Tilføj SENTRY_DSN til .env
  - [ ] Opret `server/_core/monitoring.ts`
  - [ ] Implementer `captureError()` helper
  - [ ] Implementer `trackAsyncOperation()` helper

- [ ] Refactor async operations:
  - [ ] Subscription usage tracking
  - [ ] Email notifications
  - [ ] Health score calculations
  - [ ] Billy invoice sync

- [ ] Setup structured logging med Pino
  - [ ] Replace all `console.log` med `logger`
  - [ ] Add context to all log statements

- [ ] Verify Sentry receives errors

**Success Criteria:**
- ✅ Zero silent failures
- ✅ All errors logged with context
- ✅ Sentry dashboard shows errors

---

## 🟡 P1 - HØJ PRIORITET (Uge 3-5)

### P1.1: Background Job System ⏱️ 5 dage

- [ ] Install dependencies:
  ```bash
  pnpm add bullmq ioredis
  pnpm add -D @types/ioredis
  ```

- [ ] Setup Redis (Docker eller Upstash)
  - [ ] Add to docker-compose.yml
  - [ ] Add REDIS_URL to .env

- [ ] Opret `server/jobs/queue.ts`
  - [ ] Define job types enum
  - [ ] Define job data interfaces
  - [ ] Create queue instance
  - [ ] Implement helper functions

- [ ] Opret `server/jobs/worker.ts`
  - [ ] Implement job handlers
  - [ ] Start worker
  - [ ] Add error handling

- [ ] Opret `server/jobs/scheduler.ts`
  - [ ] Schedule daily health score recalculation
  - [ ] Schedule auto-segmentation
  - [ ] Schedule data cleanup

- [ ] Refactor operations til jobs:
  - [ ] Health score calculation
  - [ ] Subscription usage tracking
  - [ ] Email notifications
  - [ ] Billy invoice sync

- [ ] Skriv tests
  - [ ] Test job creation
  - [ ] Test job processing
  - [ ] Test retry logic

- [ ] Deploy og monitor job queue

**Success Criteria:**
- ✅ All heavy operations i background
- ✅ Response times <200ms
- ✅ Job success rate >99%

---

### P1.2: Auth Middleware ⏱️ 2 dage

- [ ] Opret `server/_core/auth-helpers.ts`
  - [ ] Implementer `verifyOwnership()` generic helper
  - [ ] Implementer `verifyCustomerAccess()`
  - [ ] Implementer `verifyLeadAccess()`
  - [ ] Implementer `verifyOpportunityAccess()`
  - [ ] Implementer `verifySegmentAccess()`
  - [ ] Implementer `verifyBatchOwnership()`

- [ ] Opret `server/_core/auth-middleware.ts`
  - [ ] Implementer `requireCustomerAccess` middleware

- [ ] Refactor routers:
  - [ ] crm-customer-router.ts (22 endpoints)
  - [ ] crm-lead-router.ts (5 endpoints)
  - [ ] crm-booking-router.ts (6 endpoints)
  - [ ] crm-extensions-router.ts (20 endpoints)

- [ ] Skriv tests
  - [ ] Test ownership verification
  - [ ] Test access denied errors
  - [ ] Test batch verification

**Success Criteria:**
- ✅ 50+ auth checks replaced
- ✅ Consistent error messages
- ✅ 80% code reduction i auth checks

---

### P1.3: Backend Router Tests ⏱️ 8 dage

**Dag 1-2: crm-customer-router.ts (22 endpoints)**

- [ ] Setup test utilities
  - [ ] Create test user
  - [ ] Create test customer helper
  - [ ] Create tRPC caller helper

- [ ] Test customer profile CRUD:
  - [ ] `createProfile`
  - [ ] `listProfiles`
  - [ ] `getProfile`
  - [ ] `updateProfile`
  - [ ] `deleteProfile`
  - [ ] `searchProfiles`

- [ ] Test properties:
  - [ ] `createProperty`
  - [ ] `listProperties`
  - [ ] `updateProperty`
  - [ ] `deleteProperty`

- [ ] Test notes:
  - [ ] `addNote`
  - [ ] `listNotes`
  - [ ] `updateNote`
  - [ ] `deleteNote`

- [ ] Test integrations:
  - [ ] `getEmailHistory`
  - [ ] `linkEmailToCustomer`
  - [ ] `getInvoices`
  - [ ] `syncBillyInvoices`

- [ ] Test health scores:
  - [ ] `getHealthScore`
  - [ ] `recalculateHealthScore`

**Dag 3-4: crm-lead-router.ts (5 endpoints)**

- [ ] Test lead CRUD:
  - [ ] `createLead`
  - [ ] `listLeads`
  - [ ] `getLead`
  - [ ] `updateLeadStatus`
  - [ ] `convertLeadToCustomer`

**Dag 5-6: crm-extensions-router.ts (20 endpoints)**

- [ ] Test opportunities:
  - [ ] `createOpportunity`
  - [ ] `listOpportunities`
  - [ ] `getOpportunity`
  - [ ] `updateOpportunity`
  - [ ] `deleteOpportunity`
  - [ ] `updateStage`

- [ ] Test segments:
  - [ ] `createSegment`
  - [ ] `listSegments`
  - [ ] `getSegment`
  - [ ] `updateSegment`
  - [ ] `deleteSegment`

- [ ] Test documents:
  - [ ] `uploadDocument`
  - [ ] `listDocuments`
  - [ ] `deleteDocument`

- [ ] Test audit log:
  - [ ] `getAuditLog`
  - [ ] `exportAuditLog`

**Dag 7-8: crm-booking-router.ts + crm-stats-router.ts**

- [ ] Test bookings:
  - [ ] `createBooking`
  - [ ] `listBookings`
  - [ ] `getBooking`
  - [ ] `updateBooking`
  - [ ] `deleteBooking`
  - [ ] `getUpcomingBookings`

- [ ] Test stats:
  - [ ] `getDashboardStats`

**Success Criteria:**
- ✅ 60+ backend tests written
- ✅ 80%+ code coverage på routers
- ✅ All tests passing i CI/CD

---

### P1.4: Frontend Component Tests ⏱️ 5 dage

**Dag 1: CRMDashboard.tsx**

- [ ] Test rendering
- [ ] Test KPI display
- [ ] Test chart interactions
- [ ] Test loading states

**Dag 2: CustomerList.tsx**

- [ ] Test customer list rendering
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test CSV export
- [ ] Test empty states

**Dag 3: CustomerDetail.tsx**

- [ ] Test customer info display
- [ ] Test notes CRUD
- [ ] Test activities display
- [ ] Test properties display
- [ ] Test documents upload

**Dag 4: LeadPipeline.tsx + OpportunityPipeline.tsx**

- [ ] Test kanban board rendering
- [ ] Test drag-and-drop
- [ ] Test stage updates
- [ ] Test filtering

**Dag 5: SegmentList.tsx + Other components**

- [ ] Test segment listing
- [ ] Test segment creation
- [ ] Test rule builder
- [ ] Test relationship graph

**Success Criteria:**
- ✅ 30+ frontend tests
- ✅ 60%+ coverage på CRM pages
- ✅ Critical user flows tested

---

### P1.5: Audit Logging Middleware ⏱️ 3 dage

- [ ] Opret `server/_core/audit-middleware.ts`
  - [ ] Implementer automatic audit logging
  - [ ] Capture old/new values
  - [ ] Capture IP + user agent

- [ ] Apply til alle mutations:
  - [ ] Customer mutations
  - [ ] Lead mutations
  - [ ] Opportunity mutations
  - [ ] Segment mutations
  - [ ] Booking mutations

- [ ] Test audit trail:
  - [ ] Verify all changes logged
  - [ ] Verify GDPR export includes all data

**Success Criteria:**
- ✅ 100% mutation coverage i audit log
- ✅ GDPR compliant data export
- ✅ Audit trail queryable

---

### P1.6: Error Monitoring ⏱️ 2 dage

- [ ] Sentry integration (already started i P0.5)
- [ ] Add custom error tags
  - [ ] User ID
  - [ ] Operation name
  - [ ] Customer ID (if applicable)

- [ ] Setup alerting:
  - [ ] Slack notifications for critical errors
  - [ ] Email for high-frequency errors

- [ ] Create error dashboard
- [ ] Setup error budget (99.9% target)

**Success Criteria:**
- ✅ All errors captured
- ✅ Alert channels working
- ✅ Error rate visible

---

## 🟢 P2 - MEDIUM PRIORITET (Uge 6-8)

### P2.1: Centralized Validation ⏱️ 3 dage

- [ ] Audit existing validation schemas
- [ ] Consolidate til `server/_core/validation.ts`
- [ ] Replace inline Zod schemas
- [ ] Add custom error messages
- [ ] Test validation edge cases

---

### P2.2: Database FK Constraints ⏱️ 2 dage

- [ ] Add foreign key constraints til schema
- [ ] Create migration
- [ ] Test cascade deletions
- [ ] Deploy til staging
- [ ] Monitor for constraint violations

---

### P2.3: Performance Monitoring ⏱️ 3 dage

- [ ] Setup query performance tracking
- [ ] Create slow query log
- [ ] Build performance dashboard
- [ ] Add response time metrics
- [ ] Setup alerting for slow queries

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: CRM Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:playwright

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Progress Tracking

Brug denne tabel til at tracke overall fremgang:

| Fase | Tasks | Status | Completion | Notes |
|------|-------|--------|------------|-------|
| P0.1 | Transaction Management | ⬜ | 0% | |
| P0.2 | Fix N+1 Queries | ⬜ | 0% | |
| P0.3 | XSS Sanitization | ⬜ | 0% | |
| P0.4 | Rate Limiting | ⬜ | 0% | |
| P0.5 | Fix Silent Failures | ⬜ | 0% | |
| P1.1 | Background Jobs | ⬜ | 0% | |
| P1.2 | Auth Middleware | ⬜ | 0% | |
| P1.3 | Backend Tests | ⬜ | 0% | |
| P1.4 | Frontend Tests | ⬜ | 0% | |
| P1.5 | Audit Middleware | ⬜ | 0% | |
| P1.6 | Error Monitoring | ⬜ | 0% | |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

---

## Daily Standup Template

**Hvad gjorde jeg i går?**
-

**Hvad skal jeg lave i dag?**
-

**Er der blockers?**
-

**Test coverage denne uge:**
- Backend: ____%
- Frontend: ____%

---

## Quick Commands

```bash
# Run all tests
pnpm test

# Run CRM tests only
pnpm test server/__tests__/crm

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test server/__tests__/transaction-utils.test.ts

# Check test coverage
pnpm test:coverage --reporter=html
open coverage/index.html

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm check
```

---

## Resources

- **Action Plan:** `CRM-IMPROVEMENT-ACTION-PLAN.md`
- **System Diagrams:** `CRM-SYSTEM-DIAGRAMS.md`
- **Test Examples:** `server/__tests__/`
- **Vitest Docs:** https://vitest.dev
- **BullMQ Docs:** https://docs.bullmq.io
- **Sentry Docs:** https://docs.sentry.io

---

**Last Updated:** 2025-11-18
**Next Review:** Weekly standups
