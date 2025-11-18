# CRM System - Comprehensive QA Test Plan

**Feature:** Complete CRM System  
**Version:** 1.0.0  
**Date:** 2025-11-17  
**Status:** Active

## Feature Overview

**Name:** CRM System  
**Description:** Complete Customer Relationship Management system with customers, leads, opportunities, segments, and bookings  
**User Stories:**

- As a user, I want to manage customer profiles
- As a user, I want to track leads through a pipeline
- As a user, I want to manage sales opportunities
- As a user, I want to segment customers
- As a user, I want to view bookings in a calendar

**Acceptance Criteria:**

- All CRM pages load correctly
- All buttons and interactions work
- Data persists correctly
- Navigation works between pages
- Search and filtering work
- Export functions work
- Forms validate correctly
- Error handling is graceful

**Dependencies:**

- Backend API (tRPC)
- Database (MySQL/PostgreSQL)
- Authentication system
- Frontend routing (Wouter)

## Test Scope

**In Scope:**

- All CRM pages (Dashboard, Customers, Leads, Opportunities, Segments, Bookings)
- All buttons and interactions
- Navigation and routing
- Search and filtering
- Create/Update/Delete operations
- Export functions (CSV)
- Form validation
- Error handling
- Accessibility
- Responsive design

**Out of Scope:**

- Performance testing (separate plan)
- Security testing (separate plan)
- Integration with external systems (separate plan)

**Environment:**

- Development: http://localhost:5174
- Standalone Mode: http://localhost:5174/crm-standalone
- Database: MySQL (Docker) or Supabase PostgreSQL

**Test Data:**

- Test customers
- Test leads
- Test opportunities
- Test segments

## Test Types

### Unit Tests

**Functions:**

- Customer list filtering
- Lead status updates
- Opportunity stage updates
- CSV export generation
- Form validation

**Edge Cases:**

- Empty lists
- Large datasets
- Special characters in search
- Invalid form inputs
- Network failures

**Error Conditions:**

- API errors
- Database connection failures
- Invalid IDs
- Missing required fields

### Integration Tests

**Integration Points:**

- tRPC API calls
- Database queries
- Authentication flow
- Cache invalidation

**APIs:**

- `crm.customer.listProfiles`
- `crm.customer.createProfile`
- `crm.lead.listLeads`
- `crm.lead.createLead`
- `crm.extensions.listOpportunities`
- `crm.extensions.updateOpportunity`

**Database:**

- Customer profiles table
- Leads table
- Opportunities table
- Segments table

### E2E Tests

**Workflows:**

- Create customer → View in list → Edit → Delete
- Create lead → Move through pipeline → Convert to customer
- Create opportunity → Update stage → Win/Lose
- Search customers → Filter → Export CSV
- Navigate between all CRM pages

**Happy Paths:**

- Complete customer management workflow
- Complete lead management workflow
- Complete opportunity management workflow
- Complete segment management workflow
- Complete booking calendar view

**Error Scenarios:**

- Invalid form submission
- Network errors
- Invalid IDs
- Permission errors
- Empty states

### Performance Tests

**Load Testing:**

- 100+ customers in list
- 100+ leads in pipeline
- 50+ opportunities
- Large CSV exports

**Response Time Targets:**

- Page load: < 2 seconds
- API calls: < 500ms
- Search: < 300ms
- CSV export: < 5 seconds

**Resource Usage:**

- Memory usage
- CPU usage
- Network bandwidth

### Security Tests

**Authentication/Authorization:**

- Unauthorized access blocked
- Session management
- Token validation

**Input Validation:**

- SQL injection prevention
- XSS prevention
- CSRF protection

**Data Privacy:**

- Customer data access control
- Data encryption
- Audit logging

## Test Cases

### TC-001: Customer List - Load Page

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User logged in, database has customers
- **Steps:**
  1. Navigate to /crm/customers
  2. Wait for page to load
- **Expected Result:** Customer list displays with customer cards

### TC-002: Customer List - Search Functionality

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User on customer list page
- **Steps:**
  1. Enter search term in search field
  2. Wait for results
- **Expected Result:** List filters to matching customers

### TC-003: Customer List - Create Customer

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User on customer list page
- **Steps:**
  1. Click "Create Customer" button
  2. Fill form (name, email, phone)
  3. Click "Save"
- **Expected Result:** Customer created, modal closes, customer appears in list

### TC-004: Customer List - Export CSV

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User on customer list page, customers exist
- **Steps:**
  1. Click "Export CSV" button
  2. Wait for download
- **Expected Result:** CSV file downloads with customer data

### TC-005: Customer Detail - View Information

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** Customer exists
- **Steps:**
  1. Navigate to customer detail page
  2. View customer information
- **Expected Result:** Customer name, email, phone, financial data displayed

### TC-006: Customer Detail - Switch Tabs

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User on customer detail page
- **Steps:**
  1. Click "Properties" tab
  2. Click "Notes" tab
  3. Click "Activities" tab
  4. Click "Overview" tab
- **Expected Result:** Each tab displays correct content

### TC-007: Lead Pipeline - Load Page

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm/leads
  2. Wait for page to load
- **Expected Result:** Kanban board displays with lead stages

### TC-008: Lead Pipeline - Create Lead

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User on lead pipeline page
- **Steps:**
  1. Click "Create Lead" button
  2. Fill form (name, email, company)
  3. Click "Save"
- **Expected Result:** Lead created, appears in "New" stage

### TC-009: Lead Pipeline - Drag and Drop

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** Lead exists in pipeline
- **Steps:**
  1. Drag lead card to different stage
  2. Drop in new stage
- **Expected Result:** Lead moves to new stage, status updates

### TC-010: Lead Detail - Convert to Customer

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** Lead with email exists
- **Steps:**
  1. Navigate to lead detail page
  2. Click "Convert to Customer" button
  3. Confirm conversion
- **Expected Result:** Lead converted, navigates to customer detail page

### TC-011: Opportunity Pipeline - Load Page

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm/opportunities
  2. Wait for page to load
- **Expected Result:** Kanban board displays with opportunity stages

### TC-012: Opportunity Pipeline - Create Opportunity

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User on opportunity pipeline page, customer exists
- **Steps:**
  1. Click "Create Opportunity" button
  2. Fill form (customer, title, value)
  3. Click "Save"
- **Expected Result:** Opportunity created, appears in "Lead" stage

### TC-013: Opportunity Pipeline - Update Stage

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** Opportunity exists
- **Steps:**
  1. Drag opportunity to different stage
  2. Drop in new stage
- **Expected Result:** Opportunity moves to new stage, stage updates

### TC-014: Segments - Load Page

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm/segments
  2. Wait for page to load
- **Expected Result:** Segments list displays

### TC-015: Bookings - Load Calendar

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm/bookings
  2. Wait for calendar to load
- **Expected Result:** Calendar view displays with bookings

### TC-016: Navigation - Between Pages

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to Dashboard
  2. Navigate to Customers
  3. Navigate to Leads
  4. Navigate to Opportunities
- **Expected Result:** Each page loads correctly, navigation works

### TC-017: CRM Standalone Mode - Load

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm-standalone
  2. Wait for page to load
- **Expected Result:** Standalone mode loads, debug banner visible

### TC-018: Form Validation - Required Fields

- **Type:** E2E
- **Priority:** P1
- **Preconditions:** User on create customer/lead form
- **Steps:**
  1. Leave required fields empty
  2. Click "Save"
- **Expected Result:** Validation errors displayed, form doesn't submit

### TC-019: Error Handling - Invalid ID

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User logged in
- **Steps:**
  1. Navigate to /crm/customers/999999
- **Expected Result:** Error message displayed or redirect to list

### TC-020: Error Handling - Network Error

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User on CRM page
- **Steps:**
  1. Simulate network offline
  2. Try to load data
- **Expected Result:** Error message displayed, page doesn't crash

### TC-021: Accessibility - Keyboard Navigation

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User on CRM page
- **Steps:**
  1. Press Tab to navigate
  2. Press Enter to activate
- **Expected Result:** All interactive elements accessible via keyboard

### TC-022: Accessibility - ARIA Labels

- **Type:** E2E
- **Priority:** P2
- **Preconditions:** User on CRM page
- **Steps:**
  1. Check buttons for ARIA labels
  2. Check form inputs for labels
- **Expected Result:** All interactive elements have accessible names

## Test Data

**Required:**

- 10+ test customers (various types, statuses)
- 10+ test leads (various stages)
- 5+ test opportunities (various stages)
- 3+ test segments
- Test bookings

**Setup:**

- Run database migrations
- Seed test data via API or database
- Create test user account

**Cleanup:**

- Delete test data after test run
- Reset database state
- Clear cache

## Test Environment

**Setup:**

- Development server running (port 5174)
- Backend server running (port 3000)
- Database running (Docker or Supabase)
- Test user authenticated

**Dependencies:**

- Node.js 22+
- pnpm
- Docker (for database)
- Playwright

**Tools:**

- Playwright for E2E tests
- Vitest for unit tests
- Browser DevTools for debugging
- Network tab for API inspection

## Test Execution

**Run All Tests:**

```bash
pnpm test:playwright
```

**Run CRM Tests Only:**

```bash
pnpm test:playwright tests/e2e/crm-comprehensive.spec.ts
```

**Run Specific Test:**

```bash
pnpm test:playwright tests/e2e/crm-comprehensive.spec.ts -g "Customer List"
```

**Debug Mode:**

```bash
pnpm test:playwright --debug
```

## Test Results

**Success Criteria:**

- All P1 tests pass
- 95%+ of all tests pass
- No critical bugs found
- Performance targets met

**Reporting:**

- HTML report: `tests/results/reports/index.html`
- JSON report: `tests/results/playwright/results.json`
- Screenshots: `test-results/` (on failure)
- Videos: `test-results/` (on failure)

## Known Issues

**Current Issues:**

- None identified yet (will be updated after test execution)

**Workarounds:**

- N/A

## Test Coverage

**Coverage Goals:**

- E2E: 80%+ of user workflows
- Unit: 70%+ of functions
- Integration: 60%+ of API endpoints

**Current Coverage:**

- E2E: 0% (tests being created)
- Unit: TBD
- Integration: TBD

## Maintenance

**Test Updates:**

- Update tests when features change
- Add tests for new features
- Remove obsolete tests
- Update test data as needed

**Review Schedule:**

- Weekly during active development
- Before each release
- After major feature changes
