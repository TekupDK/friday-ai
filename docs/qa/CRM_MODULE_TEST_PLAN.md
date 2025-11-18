# Test Plan: CRM Module

**Version:** 1.0  
**Date:** 2025-01-28  
**Status:** Draft  
**Test Engineer:** QA Team

---

## Feature Overview

### Name

CRM Module - Complete Customer Relationship Management System

### Description

The CRM module provides comprehensive customer, lead, opportunity, segment, and booking management functionality for Rendetalje.dk. It includes features for managing customer profiles, tracking leads through pipelines, managing sales opportunities, organizing customers into segments, and scheduling service bookings.

### User Stories

1. **As a sales manager**, I want to view all customers in a list with search functionality, so I can quickly find specific customers.
2. **As a sales rep**, I want to create and manage leads through a Kanban pipeline, so I can track lead progression.
3. **As a sales manager**, I want to manage opportunities/deals with drag-and-drop, so I can visualize the sales pipeline.
4. **As a marketing manager**, I want to organize customers into segments, so I can target specific customer groups.
5. **As a service coordinator**, I want to view bookings in a calendar, so I can schedule services efficiently.
6. **As a user**, I want to see CRM KPIs on a dashboard, so I can understand business performance.

### Acceptance Criteria

1. ✅ All CRM pages load without errors
2. ✅ Navigation between CRM pages works correctly
3. ✅ All CRUD operations work (Create, Read, Update, Delete)
4. ✅ Data persists correctly in database
5. ✅ User can only see their own data (user scoping)
6. ✅ All forms validate input correctly
7. ✅ Error states display properly
8. ✅ Loading states show during async operations
9. ✅ Responsive design works on mobile/tablet/desktop
10. ✅ Accessibility requirements met (WCAG 2.1 AA)

### Dependencies

- **Backend:** tRPC routers (`crm-customer-router`, `crm-lead-router`, `crm-booking-router`, `crm-extensions-router`)
- **Database:** PostgreSQL with Drizzle ORM
- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **UI Components:** Apple UI component library
- **State Management:** TanStack Query (via tRPC)

---

## Test Scope

### In Scope

1. **Customer Management**
   - Customer list with search
   - Customer detail view
   - Create/Edit/Delete customer
   - Customer properties CRUD
   - Customer notes CRUD

2. **Lead Management**
   - Lead pipeline Kanban board
   - Create/Edit/Delete lead
   - Lead status updates
   - Lead to customer conversion

3. **Opportunity Management**
   - Opportunity pipeline Kanban with drag-and-drop
   - Create/Edit/Delete opportunity
   - Stage transitions
   - Revenue forecast calculations

4. **Segment Management**
   - Segment list
   - Create/Edit/Delete segment
   - Add/Remove customers from segments (bulk)
   - Rule-based automatic segments
   - Segment members view

5. **Booking Management**
   - Booking calendar view
   - Create/Edit/Delete booking
   - Booking status updates
   - Month navigation

6. **Dashboard**
   - KPI widgets display
   - Revenue chart
   - Real-time stats

7. **Navigation & Layout**
   - CRM navigation bar
   - Active route highlighting
   - Responsive layout

### Out of Scope

1. **Backend API Testing** (covered in separate backend test suite)
2. **Database Schema Testing** (covered in migration tests)
3. **Authentication/Authorization** (covered in core system tests)
4. **Performance Testing** (covered in separate performance test plan)
5. **Security Testing** (covered in separate security test plan)
6. **Third-party Integrations** (Billy.dk, Google Calendar - separate tests)

### Environment Requirements

- **Development:** Local development environment
- **Staging:** Staging environment with test data
- **Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Devices:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Network:** Normal and throttled (3G simulation)

### Test Data Requirements

- Test users (minimum 2 for multi-user scenarios)
- Test customers (minimum 10)
- Test leads (minimum 15, distributed across stages)
- Test opportunities (minimum 20, distributed across stages)
- Test segments (minimum 5, mix of manual and automatic)
- Test bookings (minimum 30, distributed across dates)

---

## Test Types

### Unit Tests

**Functions to Test:**

- Formatting utilities (currency, dates, numbers)
- Validation functions
- Data transformation functions
- Component rendering logic
- State management hooks

**Edge Cases:**

- Empty data sets
- Null/undefined values
- Very long strings
- Special characters in input
- Boundary values (min/max)

**Error Conditions:**

- Network failures
- Invalid API responses
- Missing required fields
- Invalid data types

### Integration Tests

**Integration Points:**

- tRPC client ↔ Backend API
- Frontend components ↔ tRPC hooks
- Form submissions ↔ API mutations
- Cache invalidation ↔ Data refetching

**APIs to Test:**

- `trpc.crm.customer.*` (listProfiles, getProfile, createProfile, etc.)
- `trpc.crm.lead.*` (listLeads, createLead, updateLeadStatus, etc.)
- `trpc.crm.booking.*` (listBookings, createBooking, updateBookingStatus, etc.)
- `trpc.crm.extensions.*` (listOpportunities, createSegment, addToSegment, etc.)
- `trpc.crm.stats.*` (getDashboardStats)

**Database Operations:**

- User scoping (users can only see own data)
- Foreign key constraints
- Unique constraints
- Cascade deletes

### E2E Tests

**Workflows to Test:**

1. **Customer Management Workflow**
   - Create customer → View customer → Edit customer → Add property → Add note → Delete customer

2. **Lead Conversion Workflow**
   - Create lead → Update lead status → Convert to customer → View customer profile

3. **Opportunity Pipeline Workflow**
   - Create opportunity → Drag to different stage → Edit opportunity → View revenue forecast

4. **Segment Management Workflow**
   - Create segment → Add customers → View members → Remove customers → Delete segment

5. **Booking Management Workflow**
   - Create booking → View in calendar → Update status → Delete booking

6. **Dashboard Workflow**
   - View dashboard → Verify KPIs → Check revenue chart → Navigate to other pages

**Happy Paths:**

- All CRUD operations succeed
- Navigation works correctly
- Data displays correctly
- Forms submit successfully

**Error Scenarios:**

- Network errors (show error message)
- Validation errors (show field errors)
- Permission errors (show access denied)
- Not found errors (show 404)

### Performance Tests

**Load Testing:**

- Page load times < 2 seconds
- API response times < 500ms
- Large data sets (1000+ customers)
- Multiple concurrent users

**Stress Testing:**

- 100+ simultaneous requests
- Large payloads
- Memory usage monitoring

**Response Time Targets:**

- Initial page load: < 2s
- API calls: < 500ms
- Form submissions: < 1s
- Navigation: < 100ms

### Security Tests

**Authentication/Authorization:**

- User can only access their own data
- Unauthenticated users redirected
- Session expiration handling

**Input Validation:**

- SQL injection prevention
- XSS prevention
- CSRF protection
- File upload validation (if applicable)

**Data Privacy:**

- User data isolation
- Sensitive data not exposed
- Proper error messages (no data leakage)

---

## Test Cases

### Customer Management

#### TC-CRM-001: View Customer List

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - At least 5 customers exist
- **Steps:**
  1. Navigate to `/crm/customers`
  2. Verify customer list displays
  3. Verify all customers are visible
  4. Verify customer count matches database
- **Expected Result:** Customer list displays all customers with correct count

#### TC-CRM-002: Search Customers

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Customers exist with different names
- **Steps:**
  1. Navigate to `/crm/customers`
  2. Type search query in search field
  3. Verify results filter correctly
  4. Clear search
  5. Verify all customers display again
- **Expected Result:** Search filters customers correctly, clears properly

#### TC-CRM-003: Create Customer

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/customers`
  2. Click "Create Customer" button
  3. Fill in required fields (name, email)
  4. Submit form
  5. Verify customer appears in list
  6. Navigate to customer detail
  7. Verify data is correct
- **Expected Result:** Customer created successfully, appears in list and detail view

#### TC-CRM-004: Edit Customer

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Customer exists
- **Steps:**
  1. Navigate to customer detail
  2. Click edit button
  3. Modify customer data
  4. Save changes
  5. Verify changes are saved
- **Expected Result:** Customer data updated successfully

#### TC-CRM-005: Add Customer Property

- **Type:** Integration
- **Priority:** P2
- **Preconditions:**
  - User is logged in
  - Customer exists
- **Steps:**
  1. Navigate to customer detail
  2. Go to Properties tab
  3. Click "Add Property"
  4. Fill in property details
  5. Submit form
  6. Verify property appears in list
- **Expected Result:** Property added successfully, appears in list

#### TC-CRM-006: Add Customer Note

- **Type:** Integration
- **Priority:** P2
- **Preconditions:**
  - User is logged in
  - Customer exists
- **Steps:**
  1. Navigate to customer detail
  2. Go to Notes tab
  3. Click "Add Note"
  4. Enter note text
  5. Submit form
  6. Verify note appears in timeline
- **Expected Result:** Note added successfully, appears in timeline

### Lead Management

#### TC-CRM-007: View Lead Pipeline

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Leads exist in different stages
- **Steps:**
  1. Navigate to `/crm/leads`
  2. Verify Kanban board displays
  3. Verify all stages are visible
  4. Verify leads are in correct columns
- **Expected Result:** Lead pipeline displays correctly with leads in correct stages

#### TC-CRM-008: Create Lead

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/leads`
  2. Click "Create Lead"
  3. Fill in lead details
  4. Submit form
  5. Verify lead appears in "new" stage
- **Expected Result:** Lead created successfully, appears in pipeline

#### TC-CRM-009: Convert Lead to Customer

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Lead exists with email
- **Steps:**
  1. Navigate to lead detail
  2. Click "Convert to Customer"
  3. Confirm conversion
  4. Verify customer is created
  5. Verify navigation to customer profile
- **Expected Result:** Lead converted to customer successfully

### Opportunity Management

#### TC-CRM-010: View Opportunity Pipeline

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Opportunities exist
- **Steps:**
  1. Navigate to `/crm/opportunities`
  2. Verify Kanban board displays
  3. Verify all 6 stages are visible
  4. Verify opportunities are in correct columns
- **Expected Result:** Opportunity pipeline displays correctly

#### TC-CRM-011: Create Opportunity

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Customer exists
- **Steps:**
  1. Navigate to `/crm/opportunities`
  2. Click "Create Opportunity"
  3. Select customer
  4. Fill in opportunity details (title, value, probability)
  5. Submit form
  6. Verify opportunity appears in "lead" stage
- **Expected Result:** Opportunity created successfully

#### TC-CRM-012: Drag-and-Drop Opportunity

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Opportunity exists
- **Steps:**
  1. Navigate to `/crm/opportunities`
  2. Drag opportunity to different stage
  3. Drop in new stage
  4. Verify opportunity moves to new stage
  5. Verify stage update persists after refresh
- **Expected Result:** Drag-and-drop works, stage updates correctly

#### TC-CRM-013: View Revenue Forecast

- **Type:** Integration
- **Priority:** P2
- **Preconditions:**
  - User is logged in
  - Opportunities exist with values
- **Steps:**
  1. Navigate to `/crm/dashboard`
  2. Scroll to Revenue Chart section
  3. Verify revenue forecast displays
  4. Verify total value is correct
  5. Verify weighted value is correct
- **Expected Result:** Revenue forecast displays correctly with accurate calculations

### Segment Management

#### TC-CRM-014: View Segment List

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Segments exist
- **Steps:**
  1. Navigate to `/crm/segments`
  2. Verify segment list displays
  3. Verify segment cards show correct information
  4. Verify member counts are correct
- **Expected Result:** Segment list displays correctly

#### TC-CRM-015: Create Manual Segment

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/segments`
  2. Click "Create Segment"
  3. Fill in segment details (name, description, color)
  4. Select "Manual" type
  5. Submit form
  6. Verify segment appears in list
- **Expected Result:** Manual segment created successfully

#### TC-CRM-016: Create Automatic Segment

- **Type:** E2E
- **Priority:** P2
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/segments`
  2. Click "Create Segment"
  3. Fill in segment details
  4. Select "Automatic" type
  5. Add rule (e.g., healthScore >= 50)
  6. Submit form
  7. Verify segment appears in list with "Auto" badge
- **Expected Result:** Automatic segment created with rules

#### TC-CRM-017: Add Customers to Segment (Bulk)

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Segment exists
  - Customers exist
- **Steps:**
  1. Navigate to segment detail
  2. Click "Add Customers"
  3. Select multiple customers
  4. Click "Add Selected"
  5. Verify customers appear in member list
  6. Verify member count updates
- **Expected Result:** Customers added to segment successfully

#### TC-CRM-018: Remove Customers from Segment (Bulk)

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Segment exists with members
- **Steps:**
  1. Navigate to segment detail
  2. Click "Remove Customers"
  3. Select multiple customers
  4. Click "Remove Selected"
  5. Verify customers removed from list
  6. Verify member count updates
- **Expected Result:** Customers removed from segment successfully

### Booking Management

#### TC-CRM-019: View Booking Calendar

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Bookings exist
- **Steps:**
  1. Navigate to `/crm/bookings`
  2. Verify calendar grid displays
  3. Verify current month is shown
  4. Verify bookings appear on correct dates
  5. Verify status colors are correct
- **Expected Result:** Booking calendar displays correctly

#### TC-CRM-020: Navigate Calendar Months

- **Type:** E2E
- **Priority:** P2
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/bookings`
  2. Click "Previous" month button
  3. Verify previous month displays
  4. Click "Next" month button
  5. Verify next month displays
  6. Click "Today" button
  7. Verify current month displays
- **Expected Result:** Month navigation works correctly

### Dashboard

#### TC-CRM-021: View Dashboard KPIs

- **Type:** Integration
- **Priority:** P1
- **Preconditions:**
  - User is logged in
  - Data exists (customers, bookings, revenue)
- **Steps:**
  1. Navigate to `/crm/dashboard`
  2. Verify all 4 KPI cards display
  3. Verify numbers are correct
  4. Verify icons display
- **Expected Result:** Dashboard KPIs display correctly with accurate data

#### TC-CRM-022: Dashboard Loading State

- **Type:** Unit
- **Priority:** P2
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to `/crm/dashboard`
  2. Verify loading spinner displays
  3. Wait for data to load
  4. Verify spinner disappears
  5. Verify data displays
- **Expected Result:** Loading state works correctly

### Navigation & Layout

#### TC-CRM-023: CRM Navigation

- **Type:** E2E
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to any CRM page
  2. Verify navigation bar displays
  3. Click each navigation item
  4. Verify correct page loads
  5. Verify active route is highlighted
- **Expected Result:** Navigation works correctly, active route highlighted

#### TC-CRM-024: Responsive Design - Mobile

- **Type:** E2E
- **Priority:** P2
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Resize browser to mobile size (375x667)
  2. Navigate to each CRM page
  3. Verify layout adapts correctly
  4. Verify all functionality works
  5. Verify no horizontal scrolling
- **Expected Result:** Mobile layout works correctly

#### TC-CRM-025: Responsive Design - Tablet

- **Type:** E2E
- **Priority:** P2
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Resize browser to tablet size (768x1024)
  2. Navigate to each CRM page
  3. Verify layout adapts correctly
  4. Verify grid columns adjust
- **Expected Result:** Tablet layout works correctly

### Error Handling

#### TC-CRM-026: Network Error Handling

- **Type:** Integration
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Disconnect network
  2. Navigate to CRM page
  3. Verify error message displays
  4. Reconnect network
  5. Verify retry works
- **Expected Result:** Network errors handled gracefully

#### TC-CRM-027: Validation Error Handling

- **Type:** Unit
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to create customer form
  2. Submit form without required fields
  3. Verify validation errors display
  4. Fill in required fields
  5. Verify errors clear
- **Expected Result:** Validation errors display and clear correctly

### Security

#### TC-CRM-028: User Data Isolation

- **Type:** Security
- **Priority:** P1
- **Preconditions:**
  - Two users exist
  - Each user has their own data
- **Steps:**
  1. Login as User A
  2. Note customer IDs
  3. Logout
  4. Login as User B
  5. Try to access User A's customer (via URL manipulation)
  6. Verify access denied
- **Expected Result:** Users can only access their own data

#### TC-CRM-029: Input Sanitization

- **Type:** Security
- **Priority:** P1
- **Preconditions:**
  - User is logged in
- **Steps:**
  1. Navigate to create customer form
  2. Enter XSS payload in name field: `<script>alert('XSS')</script>`
  3. Submit form
  4. Verify script does not execute
  5. Verify data is sanitized
- **Expected Result:** XSS attacks prevented

---

## Test Data

### Required Test Data

**Users:**

- `test-user-1` - Primary test user
- `test-user-2` - Secondary test user (for isolation tests)

**Customers:**

- 10+ customers with various statuses
- Mix of private and business customers
- Customers with and without properties
- Customers with and without notes

**Leads:**

- 15+ leads distributed across all stages
- Leads with and without email
- Leads from different sources

**Opportunities:**

- 20+ opportunities distributed across all stages
- Opportunities with various values and probabilities
- Opportunities linked to different customers

**Segments:**

- 5+ segments (mix of manual and automatic)
- Segments with various member counts
- Segments with different colors

**Bookings:**

- 30+ bookings distributed across multiple months
- Bookings with various statuses
- Bookings linked to different customers

### Test Data Setup

1. Run database seed script: `pnpm db:seed`
2. Create test users via API or database
3. Create test data via UI or API
4. Verify data exists in database

### Test Data Cleanup

1. Delete test data after each test run
2. Reset database to clean state
3. Remove test users
4. Clear cache

---

## Test Environment

### Setup Requirements

**Development Environment:**

- Node.js 20+
- PostgreSQL 15+
- All dependencies installed (`pnpm install`)
- Environment variables configured

**Staging Environment:**

- Deployed to staging server
- Test database configured
- Test users created
- Test data seeded

### Dependencies

- **Backend:** Express server running
- **Database:** PostgreSQL accessible
- **Frontend:** React dev server or production build
- **Browser:** Latest Chrome/Firefox/Safari/Edge

### Configuration

- **API Base URL:** Configured in environment
- **Database Connection:** Configured in `.env`
- **Test User Credentials:** Stored securely
- **Test Data IDs:** Documented for reference

### Tools Needed

**Testing Tools:**

- **E2E:** Playwright or Cypress
- **Unit/Integration:** Vitest
- **API Testing:** tRPC client or Postman
- **Performance:** Lighthouse, WebPageTest
- **Accessibility:** axe DevTools, WAVE

**Development Tools:**

- **IDE:** VS Code with extensions
- **Browser DevTools:** For debugging
- **Network Throttling:** Chrome DevTools
- **Screen Recording:** For bug reports

---

## Test Execution Plan

### Phase 1: Unit Tests (Week 1)

- Test all utility functions
- Test component rendering
- Test state management
- **Target:** 80%+ code coverage

### Phase 2: Integration Tests (Week 1-2)

- Test API integrations
- Test database operations
- Test cache invalidation
- **Target:** All critical paths covered

### Phase 3: E2E Tests (Week 2)

- Test all user workflows
- Test happy paths
- Test error scenarios
- **Target:** All P1 test cases passing

### Phase 4: Performance Tests (Week 2)

- Load testing
- Response time verification
- Memory usage monitoring
- **Target:** All performance targets met

### Phase 5: Security Tests (Week 2)

- Authentication tests
- Authorization tests
- Input validation tests
- **Target:** All security requirements met

### Phase 6: Regression Tests (Week 3)

- Full regression suite
- Cross-browser testing
- Mobile device testing
- **Target:** All tests passing

---

## Test Metrics & Reporting

### Metrics to Track

- **Test Coverage:** Target 80%+
- **Pass Rate:** Target 95%+
- **Defect Density:** Track defects per feature
- **Test Execution Time:** Track total time
- **Defect Resolution Time:** Track time to fix

### Reporting

- **Daily:** Test execution status
- **Weekly:** Test metrics report
- **Per Release:** Comprehensive test report
- **Defect Reports:** As issues found

---

## Risk Assessment

### High Risk Areas

1. **Drag-and-Drop Functionality**
   - Risk: Complex interaction, browser compatibility
   - Mitigation: Extensive cross-browser testing

2. **Data Synchronization**
   - Risk: Cache invalidation issues
   - Mitigation: Test cache scenarios thoroughly

3. **User Data Isolation**
   - Risk: Security vulnerability
   - Mitigation: Comprehensive security testing

### Medium Risk Areas

1. **Performance with Large Datasets**
   - Risk: Slow load times
   - Mitigation: Performance testing, optimization

2. **Responsive Design**
   - Risk: Layout issues on different devices
   - Mitigation: Device testing, responsive design review

---

## Sign-off

**Test Plan Approved By:**

- [ ] QA Lead
- [ ] Product Owner
- [ ] Tech Lead
- [ ] Development Team

**Date:** **\*\***\_\_\_**\*\***

---

## Appendix

### Test Case Template

```
TC-XXX: [Test Case Name]
- Type: [Unit/Integration/E2E/Performance/Security]
- Priority: [P1/P2/P3]
- Preconditions: [List]
- Steps:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- Expected Result: [Description]
- Actual Result: [To be filled during execution]
- Status: [Pass/Fail/Blocked/Skipped]
- Notes: [Any additional notes]
```

### Defect Report Template

```
DEF-XXX: [Defect Title]
- Severity: [Critical/High/Medium/Low]
- Priority: [P1/P2/P3]
- Environment: [Development/Staging/Production]
- Steps to Reproduce:
  1. [Step 1]
  2. [Step 2]
- Expected: [Expected behavior]
- Actual: [Actual behavior]
- Screenshots: [Attach if applicable]
- Browser/Device: [Browser version, device]
```
