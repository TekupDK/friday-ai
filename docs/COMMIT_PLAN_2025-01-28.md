# Commit Plan - January 28, 2025

**Dato:** 2025-01-28  
**Formål:** Organisere alle uncommitted changes i logiske commits

---

## 📋 Commit Strategy

### Commit 1: Subscription System (Frontend + Backend)
**Type:** `feat(subscription)`

**Files to include:**
- `client/src/components/subscription/` (alle nye filer)
- `client/src/pages/SubscriptionManagement.tsx`
- `client/src/constants/pricing.ts`
- `client/src/constants/storage.ts`
- `server/subscription-*.ts` (alle subscription backend filer)
- `server/routers/subscription-router.ts`
- `drizzle/migrations/create-subscription-tables.sql`
- `server/__tests__/subscription*.test.ts`

**Message:**
```
feat(subscription): add complete subscription management system

- Add frontend components (SubscriptionPlanSelector, SubscriptionManagement, UsageChart)
- Add backend subscription router with CRUD operations
- Add subscription database schema and migrations
- Add subscription actions (create, update, cancel, renew)
- Add subscription usage tracking
- Add subscription email notifications
- Add subscription renewal job
- Add comprehensive test coverage
```

---

### Commit 2: Cursor Hooks System
**Type:** `feat(cursor)`

**Files to include:**
- `.cursor/hooks/` (alle nye filer)
- `.cursor/hooks.json`
- `.cursor/hooks/README.md`
- `.cursor/hooks/__tests__/` (alle test filer)

**Message:**
```
feat(cursor): add hooks system for command execution

- Add hooks executor with pre/post execution hooks
- Add hooks loader with validation
- Add context loaders (codebase, project)
- Add error handling hooks
- Add post-execution hooks (linter, typecheck, documentation)
- Add pre-execution hooks (dependencies, code style, environment)
- Add comprehensive test suite
- Add hooks configuration system
```

---

### Commit 3: Documentation Updates
**Type:** `docs`

**Files to include:**
- `docs/DEVELOPMENT_STATUS_OVERVIEW_2025-01-28.md`
- `docs/COMMIT_PLAN_2025-01-28.md`
- `docs/qa/SUBSCRIPTION_*.md` (alle subscription docs)
- `docs/development-notes/subscription/` (alle filer)
- `docs/development-notes/hooks/` (alle filer)
- `docs/development-notes/commands/` (alle filer)
- `docs/devops-deploy/SENTRY_SETUP.md`
- `docs/devops-deploy/IMPLEMENTATION_SUMMARY.md`
- Andre nye dokumentation filer

**Message:**
```
docs: add comprehensive documentation for recent features

- Add development status overview
- Add subscription system documentation (setup, testing, implementation)
- Add hooks system documentation
- Add commands improvement documentation
- Add Sentry setup guide
- Add implementation summaries
- Update existing documentation
```

---

### Commit 4: Commands System Refactoring
**Type:** `refactor(commands)`

**Files to include:**
- `.cursor/commands/` (alle nye commands i kategorier)
- `.cursor/commands/_meta/` (opdaterede metadata filer)
- Slettede commands (100+ filer)

**Message:**
```
refactor(commands): reorganize commands into categories

- Move commands into category folders (ai/, chat/, core/, debugging/, etc.)
- Update commands metadata and index
- Remove deprecated commands
- Add new command structure
- Update command template
- Improve command organization
```

---

### Commit 5: Code Cleanup and Fixes
**Type:** `chore` / `fix`

**Files to include:**
- Modificerede filer (client/src/App.tsx, client/src/main.tsx, etc.)
- Test data cleanup (staged deletions)
- Code improvements
- TypeScript fixes
- Dependency updates

**Message:**
```
chore: cleanup and fix various issues

- Remove old test-data files
- Fix TypeScript errors
- Update dependencies
- Improve code quality
- Fix linting issues
- Update configuration files
```

---

### Commit 6: Documentation Cleanup
**Type:** `chore(docs)`

**Files to include:**
- Flyttede dokumentation filer (fra root til docs/)
- Slettede duplicate dokumentation
- Organiserede dokumentation struktur

**Message:**
```
chore(docs): organize and cleanup documentation

- Move documentation files to proper locations
- Remove duplicate documentation
- Organize documentation structure
- Clean up old documentation files
```

---

## 🚀 Execution Plan

### Step 1: Review Changes
```bash
# Se alle ændringer
git status

# Se detaljeret diff
git diff --stat
```

### Step 2: Stage og Commit (en ad gangen)

**Commit 1: Subscription System**
```bash
git add client/src/components/subscription/
git add client/src/pages/SubscriptionManagement.tsx
git add client/src/constants/pricing.ts
git add client/src/constants/storage.ts
git add server/subscription-*.ts
git add server/routers/subscription-router.ts
git add drizzle/migrations/create-subscription-tables.sql
git add server/__tests__/subscription*.test.ts
git commit -m "feat(subscription): add complete subscription management system

- Add frontend components (SubscriptionPlanSelector, SubscriptionManagement, UsageChart)
- Add backend subscription router with CRUD operations
- Add subscription database schema and migrations
- Add subscription actions (create, update, cancel, renew)
- Add subscription usage tracking
- Add subscription email notifications
- Add subscription renewal job
- Add comprehensive test coverage"
```

**Commit 2: Cursor Hooks**
```bash
git add .cursor/hooks/
git add .cursor/hooks.json
git commit -m "feat(cursor): add hooks system for command execution

- Add hooks executor with pre/post execution hooks
- Add hooks loader with validation
- Add context loaders (codebase, project)
- Add error handling hooks
- Add post-execution hooks (linter, typecheck, documentation)
- Add pre-execution hooks (dependencies, code style, environment)
- Add comprehensive test suite
- Add hooks configuration system"
```

**Commit 3: Documentation**
```bash
git add docs/DEVELOPMENT_STATUS_OVERVIEW_2025-01-28.md
git add docs/COMMIT_PLAN_2025-01-28.md
git add docs/qa/SUBSCRIPTION_*.md
git add docs/development-notes/subscription/
git add docs/development-notes/hooks/
git add docs/development-notes/commands/
git add docs/devops-deploy/SENTRY_SETUP.md
git add docs/devops-deploy/IMPLEMENTATION_SUMMARY.md
# Tilføj andre dokumentation filer
git commit -m "docs: add comprehensive documentation for recent features

- Add development status overview
- Add subscription system documentation (setup, testing, implementation)
- Add hooks system documentation
- Add commands improvement documentation
- Add Sentry setup guide
- Add implementation summaries
- Update existing documentation"
```

**Commit 4: Commands Refactoring**
```bash
git add .cursor/commands/
git add .cursor/commands/_meta/
git commit -m "refactor(commands): reorganize commands into categories

- Move commands into category folders (ai/, chat/, core/, debugging/, etc.)
- Update commands metadata and index
- Remove deprecated commands
- Add new command structure
- Update command template
- Improve command organization"
```

**Commit 5: Code Cleanup**
```bash
# Test data cleanup (allerede staged)
git commit -m "chore: remove old test-data files"

# Code changes
git add client/src/App.tsx
git add client/src/main.tsx
git add client/src/pages/WorkspaceLayout.tsx
git add server/_core/index.ts
git add server/_core/vite.ts
git add server/docs/ai/auto-create.ts
git add vite.config.ts
git add package.json
# Tilføj andre modificerede filer
git commit -m "chore: cleanup and fix various issues

- Fix TypeScript errors
- Update dependencies
- Improve code quality
- Fix linting issues
- Update configuration files"
```

**Commit 6: Documentation Cleanup**
```bash
# Flyttede dokumentation filer
git add docs/development-notes/CONTINUATION_SUMMARY.md
git add docs/development-notes/LOGIN_DEBUG.md
git add docs/development-notes/hooks/IMPLEMENTATION_SUMMARY_HOOK_INTEGRATION.md
git add docs/development-notes/subscription/SUBSCRIPTION_ROUTES_ADDED.md
# Tilføj andre flyttede filer
git commit -m "chore(docs): organize and cleanup documentation

- Move documentation files to proper locations
- Remove duplicate documentation
- Organize documentation structure
- Clean up old documentation files"
```

### Step 3: Push to Origin
```bash
git push origin main
```

---

## ✅ Verification

Efter commits, verificer:

```bash
# Se commit historik
git log --oneline -10

# Se status
git status

# Se remote status
git status -sb
```

---

## 📊 Estimated Time

- **Review changes:** 10 minutter
- **Organize commits:** 20-30 minutter
- **Execute commits:** 15-20 minutter
- **Push to origin:** 2 minutter
- **Total:** ~50 minutter

---

**Status:** ✅ Plan oprettet  
**Næste skridt:** Review plan og execute commits  
**Last Updated:** 2025-01-28

