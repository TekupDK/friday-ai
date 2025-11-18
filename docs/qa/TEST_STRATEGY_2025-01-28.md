# Test Strategy - Friday AI Chat

**Date:** January 28, 2025  
**Status:** ✅ Complete  
**Version:** 1.0.0

---

## Executive Summary

Comprehensive test strategy for Friday AI Chat covering unit, integration, and E2E tests with clear coverage goals and test plans for all major features.

---

## Test Framework Overview

### Tools & Technologies

- **Unit/Integration Tests:** Vitest (v8+)
- **E2E Tests:** Playwright
- **Coverage:** v8 provider
- **Test Environment:** jsdom for frontend, node for backend
- **CI/CD:** GitHub Actions (configured)

### Current Test Structure

```
tests/
├── unit/              # Unit tests (Vitest)
├── integration/       # Integration tests (Vitest)
├── e2e/              # E2E tests (Playwright)
├── ai/               # AI-specific tests (Playwright)
└── manual/           # Manual test scripts

server/__tests__/     # Backend unit/integration tests
client/src/__tests__/ # Frontend unit tests
```

---

## Coverage Goals

### Current Thresholds (vitest.config.ts)

```typescript
thresholds: {
  lines: 0.8,        // 80%
  statements: 0.8,   // 80%
  functions: 0.8,    // 80%
  branches: 0.7,     // 70%
}
```

### Target Coverage by Area

| Area | Unit Tests | Integration Tests | E2E Tests | Total Coverage |
|------|-----------|-------------------|-----------|----------------|
| **Business Logic** | 90% | 80% | 70% | **85%** |
| **API Endpoints** | 85% | 85% | 75% | **85%** |
| **UI Components** | 80% | 70% | 80% | **80%** |
| **Hooks** | 85% | 70% | 60% | **80%** |
| **Utilities** | 90% | 70% | 50% | **85%** |
| **Critical Paths** | 95% | 90% | 90% | **95%** |

### Critical Paths (95% Coverage Required)

- Authentication & Authorization
- Subscription Management (create, update, cancel, pause, resume)
- Payment Processing (Billy.dk integration)
- Email Processing (Gmail integration)
- Calendar Integration (Google Calendar)
- Lead Management (CRM workflows)
- AI Tool Execution (Friday AI actions)

---

## Test Types & Strategy

### 1. Unit Tests

**Framework:** Vitest  
**Location:** `server/__tests__/`, `client/src/__tests__/`, `tests/unit/`  
**Goal:** Test individual functions/components in isolation

#### Backend Unit Tests

**Focus Areas:**
- Business logic functions
- Database helpers
- Utility functions
- Data transformations
- Validation logic

**Example Patterns:**
```typescript
describe("createSubscription", () => {
  it("should create subscription with valid input", async () => {
    // Arrange
    const input = { customerProfileId: 1, planType: "tier1" };
    
    // Act
    const result = await createSubscription(userId, input);
    
    // Assert
    expect(result).toMatchObject({
      planType: "tier1",
      status: "active",
    });
  });
});
```

**Coverage Goals:**
- Business logic: 90%
- Database helpers: 85%
- Utilities: 90%

#### Frontend Unit Tests

**Focus Areas:**
- React hooks
- Utility functions
- Component logic (non-UI)
- State management
- Data transformations

**Example Patterns:**
```typescript
describe("useDebouncedValue", () => {
  it("should debounce value updates", async () => {
    const { result } = renderHook(() => useDebouncedValue("test", 300));
    // Test debounce logic
  });
});
```

**Coverage Goals:**
- Hooks: 85%
- Components (logic): 80%
- Utilities: 90%

---

### 2. Integration Tests

**Framework:** Vitest  
**Location:** `server/__tests__/`, `tests/integration/`  
**Goal:** Test interactions between components/modules

#### Backend Integration Tests

**Focus Areas:**
- tRPC endpoints (full request/response cycle)
- Database operations (with real DB or test DB)
- External API integrations (mocked)
- Multi-step workflows
- Error handling across layers

**Example Patterns:**
```typescript
describe("subscription.create", () => {
  it("should create subscription and generate invoice", async () => {
    // Test full flow: create subscription → generate invoice → send email
  });
});
```

**Coverage Goals:**
- API endpoints: 85%
- Workflows: 80%
- Integrations: 75%

#### Frontend Integration Tests

**Focus Areas:**
- Component interactions
- tRPC client usage
- State management flows
- Form submissions
- Navigation flows

**Coverage Goals:**
- Component interactions: 70%
- API integration: 75%

---

### 3. E2E Tests

**Framework:** Playwright  
**Location:** `tests/e2e/`, `tests/ai/`  
**Goal:** Test complete user workflows in real browser

#### E2E Test Categories

**1. Critical User Flows (P1)**
- User authentication
- Subscription creation/management
- Lead creation from email
- Invoice generation
- Calendar booking creation

**2. Feature-Specific (P2)**
- CRM workflows
- Email management
- Document management
- AI assistant interactions

**3. Cross-Browser (P2)**
- Chrome/Chromium
- Firefox
- Safari (if applicable)

**4. Performance (P3)**
- Page load times
- API response times
- Memory usage
- Bundle size

**5. Accessibility (P2)**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes

**Coverage Goals:**
- Critical paths: 90%
- Feature workflows: 80%
- Cross-browser: 70%

---

## Test Plan by Feature

### Subscription System

#### Unit Tests (Priority: P1)

**Backend:**
- [ ] `createSubscription` - All plan types, edge cases
- [ ] `processRenewal` - Renewal logic, invoice generation
- [ ] `processCancellation` - Cancellation logic, end date calculation
- [ ] `updateSubscription` - Status changes, plan changes
- [ ] `getSubscriptionStats` - MRR, ARR, ARPU, churn calculation
- [ ] `calculateMonthlyRevenue` - Revenue calculation
- [ ] `getARPU` - Average revenue calculation
- [ ] `getChurnRate` - Churn rate calculation
- [ ] `checkOverage` - Usage tracking, overage detection
- [ ] `applyDiscount` - Discount application logic

**Frontend:**
- [ ] `SubscriptionPlanSelector` - Plan selection, recommendation
- [ ] `SubscriptionManagement` - List, filter, actions (pause/resume/upgrade/downgrade)
- [ ] `UsageChart` - Data visualization, overage warnings
- [ ] `SubscriptionManagement` page - Dashboard metrics
- [ ] `SubscriptionLanding` page - Plan comparison

**Coverage Goal:** 85%

#### Integration Tests (Priority: P1)

- [ ] Subscription creation flow (create → invoice → email)
- [ ] Subscription renewal flow (renewal → invoice → calendar event)
- [ ] Subscription cancellation flow (cancel → end date → email)
- [ ] Subscription update flow (pause/resume/upgrade/downgrade)
- [ ] Usage tracking flow (booking → usage → overage detection)
- [ ] Billy.dk invoice generation integration
- [ ] Google Calendar event creation integration

**Coverage Goal:** 80%

#### E2E Tests (Priority: P1)

- [ ] Create subscription from customer profile
- [ ] View subscription management page
- [ ] Pause subscription
- [ ] Resume subscription
- [ ] Upgrade subscription plan
- [ ] Downgrade subscription plan
- [ ] Cancel subscription
- [ ] View usage chart
- [ ] View subscription stats

**Coverage Goal:** 90%

---

### Hooks System

#### Unit Tests (Priority: P2)

- [ ] `usePageTitle` - Title updates, meta description
- [ ] `useIsMobile` - Responsive detection
- [ ] `useDebouncedValue` - Debounce logic
- [ ] `useAdaptivePolling` - Polling intervals
- [ ] `useRateLimit` - Rate limiting logic
- [ ] `usePersistFn` - Function persistence
- [ ] `useFridayChat` - Chat state management
- [ ] `useEmailActions` - Email action handlers
- [ ] `useActionSuggestions` - AI suggestions
- [ ] `useComposition` - Composition logic
- [ ] `useDocsKeyboardShortcuts` - Keyboard shortcuts

**Coverage Goal:** 85%

#### Integration Tests (Priority: P3)

- [ ] Hook composition (multiple hooks together)
- [ ] Hook with tRPC integration
- [ ] Hook with state management

**Coverage Goal:** 70%

---

### CRM System

#### Unit Tests (Priority: P2)

- [ ] Customer CRUD operations
- [ ] Lead pipeline management
- [ ] Opportunity tracking
- [ ] Segment management
- [ ] Booking calendar logic

**Coverage Goal:** 80%

#### Integration Tests (Priority: P1)

- [ ] Email to lead conversion
- [ ] Lead to customer conversion
- [ ] Customer segmentation
- [ ] Booking creation from subscription

**Coverage Goal:** 85%

#### E2E Tests (Priority: P1)

- [ ] Customer list view
- [ ] Customer detail view
- [ ] Lead pipeline view
- [ ] Booking calendar view
- [ ] Segment management

**Coverage Goal:** 80%

---

## Test Execution Strategy

### Pre-Commit Checks

**Required:**
- TypeScript compilation (`pnpm check`)
- Linting (`pnpm lint`)
- Unit tests for changed files (`pnpm test --changed`)

**Recommended:**
- Integration tests for affected areas
- Quick E2E smoke test

### Pre-Merge Checks

**Required:**
- All unit tests pass (`pnpm test`)
- All integration tests pass
- TypeScript compilation pass
- Linting pass
- Coverage thresholds met

**Recommended:**
- E2E tests for critical paths
- Performance benchmarks
- Accessibility audit

### Pre-Deployment Checks

**Required:**
- Full test suite pass
- E2E tests for all critical paths
- Performance benchmarks pass
- Security audit
- Accessibility compliance

---

## Test Data Management

### Test Data Strategy

**Unit Tests:**
- Use mocks and fixtures
- No database required
- Fast execution

**Integration Tests:**
- Use test database
- Seed test data before tests
- Clean up after tests
- Isolated test data per test

**E2E Tests:**
- Use staging/test environment
- Seed realistic test data
- Clean up after test run
- Use test user accounts

### Test Data Requirements

**Subscription Tests:**
- 5+ test subscriptions (various plans, statuses)
- Test customer profiles
- Test invoices
- Test usage records

**CRM Tests:**
- 10+ test customers
- 10+ test leads
- 5+ test opportunities
- 3+ test segments

**Email Tests:**
- Test email threads
- Test email labels
- Test email attachments

---

## Test Environment Setup

### Development

**Requirements:**
- Node.js 22+
- pnpm
- Docker (for database)
- Test database (separate from dev)

**Setup:**
```bash
# Start test database
pnpm dev:db

# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### CI/CD

**GitHub Actions:**
- Run on every PR
- Run on merge to main
- Run full test suite
- Generate coverage reports
- Upload test results

**Configuration:**
- `.github/workflows/ci.yml` (exists)

---

## Test Maintenance

### Test Review Process

**When to Review:**
- After major refactorings
- When tests become flaky
- When coverage drops
- Quarterly review

**Review Checklist:**
- [ ] All tests pass
- [ ] Coverage goals met
- [ ] No flaky tests
- [ ] Tests are maintainable
- [ ] Test data is realistic
- [ ] Tests run in reasonable time

### Test Refactoring

**Signs Tests Need Refactoring:**
- Tests are flaky
- Tests are slow (>5s per test)
- Tests are hard to understand
- Tests have too much duplication
- Tests don't catch real bugs

**Refactoring Strategy:**
- Extract common test utilities
- Create test fixtures
- Improve test data setup
- Simplify test assertions
- Add better error messages

---

## Test Metrics & Reporting

### Key Metrics

**Coverage Metrics:**
- Lines coverage
- Statements coverage
- Functions coverage
- Branches coverage

**Quality Metrics:**
- Test execution time
- Test pass rate
- Flaky test count
- Test maintenance time

**Business Metrics:**
- Bugs caught by tests
- Bugs missed by tests
- Test ROI (time saved vs. time spent)

### Reporting

**Coverage Reports:**
- HTML coverage report (`coverage/index.html`)
- JSON coverage report (`coverage/coverage-final.json`)
- CI/CD coverage badges

**Test Results:**
- Playwright HTML report (`test-results/`)
- Vitest console output
- CI/CD test summaries

---

## Test Plan for New Features

### Subscription System (Current Priority)

**Phase 1: Unit Tests (Week 1)**
- [ ] Backend subscription functions
- [ ] Frontend subscription components
- [ ] Subscription hooks (if any)

**Phase 2: Integration Tests (Week 2)**
- [ ] Subscription creation flow
- [ ] Subscription management flow
- [ ] Subscription renewal flow

**Phase 3: E2E Tests (Week 3)**
- [ ] Critical subscription workflows
- [ ] Cross-browser testing
- [ ] Performance testing

**Coverage Goal:** 85% by end of Phase 3

---

### Hooks System (Next Priority)

**Phase 1: Unit Tests (Week 1)**
- [ ] All hooks individually
- [ ] Hook edge cases
- [ ] Hook error handling

**Phase 2: Integration Tests (Week 2)**
- [ ] Hook composition
- [ ] Hook with tRPC
- [ ] Hook with state management

**Coverage Goal:** 80% by end of Phase 2

---

## Test Tools & Utilities

### Test Utilities

**Location:** `client/src/__tests__/test-utils.tsx`, `tests/helpers/`

**Available:**
- `renderWithProviders` - React component rendering with providers
- `mockTrpc` - tRPC client mocking
- `mockAuth` - Authentication mocking
- `testData` - Test data generators

### Test Fixtures

**Location:** `tests/fixtures/` (to be created)

**Planned:**
- Subscription fixtures
- Customer fixtures
- Lead fixtures
- Email fixtures
- Calendar fixtures

---

## Best Practices

### Unit Test Best Practices

1. **Isolation:** Each test should be independent
2. **Arrange-Act-Assert:** Clear test structure
3. **Descriptive Names:** Test names should describe what they test
4. **One Assertion:** One assertion per test (when possible)
5. **Mock External Dependencies:** Don't test external services
6. **Fast Execution:** Unit tests should run in <100ms each

### Integration Test Best Practices

1. **Real Dependencies:** Use real database, mock external APIs
2. **Test Data:** Use realistic test data
3. **Cleanup:** Always clean up test data
4. **Isolation:** Each test should be isolated
5. **Error Scenarios:** Test error handling

### E2E Test Best Practices

1. **Critical Paths:** Focus on critical user workflows
2. **Stable Selectors:** Use data-testid attributes
3. **Wait Strategies:** Use proper wait strategies
4. **Test Data:** Use realistic test data
5. **Cleanup:** Clean up test data after tests
6. **Screenshots:** Capture screenshots on failure
7. **Videos:** Record videos for debugging

---

## Test Coverage Gaps

### Current Gaps Identified

**Subscription System:**
- ⏳ Frontend component tests (0% coverage)
- ⏳ Subscription action tests (pause/resume/upgrade/downgrade)
- ⏳ Usage chart tests
- ✅ Backend unit tests (partial coverage)

**Hooks System:**
- ⏳ Most hooks lack tests
- ⏳ Hook composition tests
- ✅ `useKeyboardShortcuts` has tests

**CRM System:**
- ✅ Good coverage (smoke tests exist)
- ⏳ Component tests could be improved

**Email System:**
- ✅ Good coverage (integration tests exist)
- ⏳ Component tests could be improved

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up test infrastructure
- Create test utilities
- Establish test patterns
- Document test strategy

**Deliverables:**
- Test strategy document (this document)
- Test utilities
- Test fixtures
- Test examples

### Phase 2: Critical Paths (Week 3-4)

**Goals:**
- Achieve 95% coverage on critical paths
- Subscription system tests
- Authentication tests
- Payment processing tests

**Deliverables:**
- Subscription test suite
- Authentication test suite
- Payment processing test suite

### Phase 3: Feature Coverage (Week 5-8)

**Goals:**
- Achieve 80% coverage on all features
- Hooks system tests
- CRM component tests
- Email component tests

**Deliverables:**
- Hooks test suite
- CRM component test suite
- Email component test suite

### Phase 4: E2E Coverage (Week 9-12)

**Goals:**
- Achieve 90% E2E coverage on critical paths
- 80% E2E coverage on feature workflows
- Cross-browser testing
- Performance testing

**Deliverables:**
- E2E test suite
- Performance benchmarks
- Cross-browser test results

---

## Test Commands Reference

### Unit/Integration Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test server/__tests__/subscription.test.ts

# Run tests in watch mode
pnpm test --watch

# Run tests for changed files
pnpm test --changed
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:playwright

# Run specific test file
pnpm test:playwright tests/e2e/crm-comprehensive.spec.ts

# Run in UI mode
pnpm test:playwright:ui

# Run with debug
pnpm test:playwright --debug
```

### Subscription Tests

```bash
# Run subscription smoke tests
pnpm test:subscription

# Test subscription email
pnpm test:subscription:email

# Test subscription renewal
pnpm test:subscription:renewal

# Test subscription usage tracking
pnpm test:subscription:usage
```

### AI Tests

```bash
# Run all AI tests
pnpm test:ai:all

# Run conversation tests
pnpm test:ai:conversation

# Run visual regression tests
pnpm test:ai:visual

# Run performance tests
pnpm test:ai:performance

# Run accessibility tests
pnpm test:ai:accessibility
```

---

## Success Criteria

### Coverage Goals

- ✅ **Critical Paths:** 95% coverage
- ✅ **Business Logic:** 85% coverage
- ✅ **API Endpoints:** 85% coverage
- ✅ **UI Components:** 80% coverage
- ✅ **Hooks:** 80% coverage

### Quality Goals

- ✅ **Test Execution Time:** <5 minutes for full suite
- ✅ **Flaky Tests:** <1% flaky rate
- ✅ **Test Maintenance:** <20% of development time
- ✅ **Bug Detection:** >90% of bugs caught by tests

---

## Conclusion

This test strategy provides a comprehensive framework for testing Friday AI Chat. The strategy balances coverage goals with practical implementation, focusing on critical paths while maintaining high quality standards.

**Next Steps:**
1. Review and approve test strategy
2. Set up test infrastructure
3. Begin Phase 1 implementation
4. Establish test review process

---

**Last Updated:** January 28, 2025  
**Status:** ✅ Complete  
**Next Review:** February 28, 2025

