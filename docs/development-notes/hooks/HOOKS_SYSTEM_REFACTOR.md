# Hooks System Refactor

**Date:** January 28, 2025  
**Status:** ✅ Complete  
**Purpose:** Refactoring and standardization of React hooks system in Friday AI Chat

---

## Context

Friday AI Chat uses a comprehensive React hooks system with 29+ custom hooks organized across multiple categories. A validation audit identified several critical issues that needed to be addressed for better maintainability and consistency.

## Problem

The hooks system had several issues:

1. **Duplicate Hook Names** - `useKeyboardShortcuts` existed in both main hooks and docs subdirectory, causing potential import conflicts
2. **File Extension Inconsistencies** - Some hooks used `.tsx` extension without containing JSX
3. **Naming Mismatches** - File names didn't match export names (e.g., `useMobile.tsx` exporting `useIsMobile`)
4. **Missing Central Index** - No central export file for easier hook imports
5. **Inconsistent Organization** - Hooks scattered without clear import patterns

## Solution

### 1. Resolved Duplicate Hooks

**Issue:** Two hooks with same name `useKeyboardShortcuts`

- `client/src/hooks/useKeyboardShortcuts.ts` (general keyboard shortcuts)
- `client/src/hooks/docs/useKeyboardShortcuts.tsx` (docs-specific shortcuts)

**Solution:**

- Renamed docs version to `useDocsKeyboardShortcuts`
- Created new file: `client/src/hooks/docs/useDocsKeyboardShortcuts.ts`
- Updated component `KeyboardShortcutsHint` to `DocsKeyboardShortcutsHint`
- Updated all imports in:
  - `client/src/pages/docs/DocsPage.tsx`
  - `client/src/components/docs/DocumentEditor.tsx`

### 2. Fixed File Extensions

**Issue:** Files using `.tsx` without JSX content

**Solution:**

- `useMobile.tsx` → `useIsMobile.ts` (no JSX, renamed to match export)
- `useDocsKeyboardShortcuts.tsx` → `useDocsKeyboardShortcuts.ts` (no JSX)

**Note:** The `DocsKeyboardShortcutsHint` component still uses JSX, which is correct.

### 3. Standardized Naming

**Issue:** File name didn't match export name

**Solution:**

- Renamed `useMobile.tsx` to `useIsMobile.ts` to match export `useIsMobile()`
- Updated imports in:
  - `client/src/components/DashboardLayout.tsx`
  - `client/src/components/ui/sidebar.tsx`

### 4. Created Central Hooks Index

**Issue:** No central export file for easier imports

**Solution:**

- Created `client/src/hooks/index.ts` with organized exports:
  - Core hooks (useAuth)
  - UI & Layout hooks
  - Performance hooks
  - Chat hooks
  - Email hooks
  - CRM hooks (re-exported)
  - Docs hooks (re-exported)

**Benefits:**

- Cleaner imports: `import { usePageTitle, useDebouncedValue } from "@/hooks"`
- Better discoverability
- Easier maintenance

## Implementation Notes

### File Structure

```
client/src/hooks/
├── index.ts                    # Central export (NEW)
├── usePageTitle.ts
├── useIsMobile.ts              # Renamed from useMobile.tsx
├── useKeyboardShortcuts.ts
├── useDebounce.ts
├── useDebouncedValue.ts
├── ... (other hooks)
├── crm/
│   ├── index.ts
│   └── ... (CRM hooks)
└── docs/
    ├── useDocsKeyboardShortcuts.ts  # Renamed from useKeyboardShortcuts.tsx
    └── ... (other docs hooks)
```

### Import Patterns

**Before:**

```typescript
import { useIsMobile } from "@/hooks/useMobile";
import { useKeyboardShortcuts } from "@/hooks/docs/useKeyboardShortcuts";
```

**After:**

```typescript
import { useIsMobile, useDocsKeyboardShortcuts } from "@/hooks";
// OR
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDocsKeyboardShortcuts } from "@/hooks/docs/useDocsKeyboardShortcuts";
```

### Hook Categories

1. **Core Hooks** - `@/_core/hooks/useAuth.ts`
2. **UI & Layout** - `usePageTitle`, `useIsMobile`, `useKeyboardShortcuts`
3. **Performance** - `useDebouncedValue`, `useAdaptivePolling`, `useRateLimit` (consolidated from `useDebounce`)
4. **Chat** - `useFridayChat`, `useFridayChatSimple`, `useStreamingChat`, `useChatInput`
5. **Email** - `useEmailActions`, `useEmailKeyboardShortcuts`
6. **CRM** - `useAdaptiveRendering`, `useFeatureDetection`, `usePerformanceTier`, etc.
7. **Docs** - `useDocuments`, `useDocsWebSocket`, `useAIGeneration`, `useDocsKeyboardShortcuts`

## Verification

All changes verified:

- ✅ No linting errors
- ✅ All imports updated correctly
- ✅ No duplicate hook names
- ✅ File extensions correct
- ✅ File names match exports
- ✅ Central index file created

## Future Work

### Recommended Improvements

1. ~~**Consolidate Debounce Hooks**~~ ✅ **COMPLETED** - Removed `useDebounce`, standardized on `useDebouncedValue` with default 300ms delay
2. ~~**Add Hook Documentation**~~ ✅ **COMPLETED** - Created comprehensive `client/src/hooks/README.md` with all hooks documented
3. **Increase Test Coverage** - Add tests for hooks that currently lack coverage
4. **Hook Type Definitions** - Create shared types file if needed
5. **AI Integration** - Consider AI-powered hook discovery and suggestions (see AI ideas below)

### AI Enhancement Opportunities

1. **Hook Discovery** - Vector search for hooks based on requirements
2. **Usage Analysis** - Track hook usage patterns for optimization
3. **Automatic Testing** - Generate tests for hooks based on implementation
4. **Performance Monitoring** - Track hook execution times and suggest optimizations

## Related Documentation

- `.cursorrules` - Project coding standards
- `docs/core/guides/STATE_MANAGEMENT_GUIDE.md` - State management patterns
- `client/src/hooks/index.ts` - Central hooks export

---

## Additional Work Completed

### Debounce Hook Consolidation ✅

**Issue:** Two nearly identical debounce hooks (`useDebounce` and `useDebouncedValue`)

**Solution:**

- Removed `useDebounce` hook
- Standardized on `useDebouncedValue` with default 300ms delay
- Updated `EmailSearchV2.tsx` to use `useDebouncedValue`
- Removed export from hooks index

**Impact:** Reduced duplication, improved consistency, better developer experience with sensible defaults

### Hooks Documentation ✅

**Created:** `client/src/hooks/README.md`

**Contents:**

- Complete hook reference with examples
- All 29+ hooks documented
- Usage patterns and best practices
- TypeScript examples
- Testing information
- File structure overview

**Impact:** Improved developer experience, better discoverability, easier onboarding

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team
