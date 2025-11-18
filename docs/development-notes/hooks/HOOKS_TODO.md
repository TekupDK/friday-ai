# Hooks System - TODO List

**Date:** January 28, 2025  
**Status:** Active  
**Priority:** P2 (Medium)

---

## ✅ Completed

- [x] **P1** - Resolve duplicate `useKeyboardShortcuts` hook names
- [x] **P1** - Fix file extension inconsistencies (.tsx → .ts where no JSX)
- [x] **P1** - Fix naming mismatches (useMobile.tsx → useIsMobile.ts)
- [x] **P1** - Create central hooks index file
- [x] **P1** - Update all imports to use renamed hooks
- [x] **P2** - Consolidate debounce hooks (`useDebounce` → `useDebouncedValue`)
- [x] **P2** - Create hooks documentation (`client/src/hooks/README.md`)

---

## 🔄 In Progress

None

---

## 📋 Pending

### Frontend

- [ ] **P3** - Add missing hook tests
  - **Description:** Add tests for hooks that currently lack test coverage
  - **Impact:** Improves code quality and prevents regressions
  - **Effort:** High (4-8 hours)
  - **Owner:** Frontend team
  - **Hooks needing tests:**
    - `usePageTitle`
    - `useIsMobile`
    - `useDebouncedValue`
    - `useEmailActions`
    - `useActionSuggestions`
    - `useAdaptivePolling`
    - `useRateLimit`
    - `usePersistFn`
    - `useComposition`
    - CRM hooks (useAdaptiveRendering, useFeatureDetection, etc.)

- [ ] **P3** - Create shared hook types file (`client/src/hooks/types.ts`)
  - **Description:** Extract common types/interfaces used across multiple hooks
  - **Impact:** Reduces duplication, improves type safety
  - **Effort:** Low (1-2 hours)
  - **Owner:** Frontend team

### AI Integration

- [ ] **P2** - Implement hook discovery via vector search
  - **Description:** Enable Friday AI to suggest hooks based on code requirements using semantic search
  - **Impact:** Improves developer experience, reduces duplication
  - **Effort:** High (8-16 hours)
  - **Owner:** AI team
  - **Dependencies:** Vector DB setup, hook embeddings

- [ ] **P3** - Hook usage pattern analysis
  - **Description:** Track which hooks are used together and suggest compositions
  - **Impact:** Identifies optimization opportunities
  - **Effort:** Medium (4-8 hours)
  - **Owner:** AI team

- [ ] **P3** - Automatic hook test generation
  - **Description:** Generate test cases for hooks based on their implementation
  - **Impact:** Improves test coverage automatically
  - **Effort:** High (8-16 hours)
  - **Owner:** AI team

- [ ] **P3** - Hook performance monitoring
  - **Description:** Track hook execution times and suggest optimizations
  - **Impact:** Identifies performance bottlenecks
  - **Effort:** High (8-16 hours)
  - **Owner:** AI team

### Documentation

- [ ] **P2** - Update architecture docs with hooks system
  - **Description:** Add hooks system to main architecture documentation
  - **Impact:** Improves project documentation
  - **Effort:** Low (1-2 hours)
  - **Owner:** Documentation team

- [ ] **P3** - Create hook usage examples
  - **Description:** Add code examples for common hook usage patterns
  - **Impact:** Improves developer onboarding
  - **Effort:** Medium (2-4 hours)
  - **Owner:** Frontend team

---

## Priority Legend

- **P1** - Critical (blocks other work, security issues)
- **P2** - High (important features, significant improvements)
- **P3** - Medium (nice-to-have, optimizations)

---

**Last Updated:** January 28, 2025  
**Next Review:** February 4, 2025

