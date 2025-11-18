# Commit Organization - January 28, 2025

**Status:** Auto-generated using improved forbedre-command  
**Total files:** 604 files changed (3308 insertions, 3634 deletions)

---

## 📊 Git Status Analysis

**Staged files:** 0  
**Unstaged files:** ~600+  
**Untracked files:** ~10

---

## 🔍 Automatic File Grouping

Baseret på fil patterns, foreslås følgende commit grupper:

### Group 1: Commands System (2 files)
- `.cursor/commands/ai/analyze-chat-prompt.md`
- `.cursor/commands/development/add-error-handling.md`
- `.cursor/commands/development/add-feature-flags.md`
- `.cursor/commands/forbedre-command.md`

### Group 2: Cursor Hooks (6 files)
- `.cursor/hooks/__tests__/*.test.ts` (5 files)
- `.cursor/hooks/executor.ts`
- `.cursor/hooks/loader.ts`
- `.cursor/hooks/test-utils/assertions.ts`

### Group 3: Documentation (10+ files)
- `docs/SESSION_SUMMARY_2025-01-28.md`
- `docs/analysis/SUBSCRIPTION_IMPLEMENTATION_TODOS_CLEANED.md`
- `docs/devops-deploy/SENTRY_SETUP.md`
- `docs/development-notes/commands/*.md` (new files)
- `docs/qa/*.md` (new files)

### Group 4: Client Components (400+ files)
- `client/src/components/**/*.tsx` - Mange component opdateringer
- Primært line ending fixes (LF → CRLF warnings)

### Group 5: Server Code (100+ files)
- `server/**/*.ts` - Server code opdateringer
- `server/__tests__/*.test.ts` - Test opdateringer

### Group 6: Scripts Cleanup (deleted files)
- `scripts/analyze-system-logs.ps1` (deleted)
- `scripts/deploy-chat-flow.ts` (deleted)
- `scripts/dev-with-tunnel.mjs` (deleted)
- `scripts/monitor-*.ps1` (deleted)
- `scripts/tunnel-*.mjs` (deleted)

### Group 7: Configuration (5 files)
- `drizzle.config.ts`
- `eslint.config.js`
- `vite.config.ts`
- `vitest.config.ts`
- `vitest.setup.ts`

---

## 📋 Proposed Commits

### Commit 1: Commands System Improvements
**Type:** `refactor(commands)`  
**Files:** 4 files

```bash
git add .cursor/commands/ai/analyze-chat-prompt.md
git add .cursor/commands/development/add-error-handling.md
git add .cursor/commands/development/add-feature-flags.md
git add .cursor/commands/forbedre-command.md
git commit -m "refactor(commands): improve commands with git integration

- Add git integration to forbedre-command
- Update command documentation
- Improve command structure"
```

### Commit 2: Cursor Hooks Updates
**Type:** `chore(cursor)`  
**Files:** 8 files

```bash
git add .cursor/hooks/
git commit -m "chore(cursor): update hooks system tests and utilities

- Update hooks executor and loader
- Update test files
- Update test utilities"
```

### Commit 3: Documentation Updates
**Type:** `docs`  
**Files:** 10+ files

```bash
git add docs/SESSION_SUMMARY_2025-01-28.md
git add docs/analysis/SUBSCRIPTION_IMPLEMENTATION_TODOS_CLEANED.md
git add docs/devops-deploy/SENTRY_SETUP.md
git add docs/development-notes/commands/
git add docs/qa/
git commit -m "docs: add session summary and command improvement documentation

- Add session summary
- Add command improvement reports
- Update Sentry setup docs
- Add QA documentation"
```

### Commit 4: Scripts Cleanup
**Type:** `chore(scripts)`  
**Files:** 6 deleted files

```bash
git add scripts/analyze-system-logs.ps1
git add scripts/deploy-chat-flow.ts
git add scripts/dev-with-tunnel.mjs
git add scripts/monitor-*.ps1
git add scripts/tunnel-*.mjs
git commit -m "chore(scripts): remove unused scripts

- Remove analyze-system-logs.ps1
- Remove deploy-chat-flow.ts
- Remove dev-with-tunnel.mjs
- Remove monitor scripts
- Remove tunnel scripts"
```

### Commit 5: Configuration Updates
**Type:** `chore(config)`  
**Files:** 5 files

```bash
git add drizzle.config.ts
git add eslint.config.js
git add vite.config.ts
git add vitest.config.ts
git add vitest.setup.ts
git commit -m "chore(config): update configuration files

- Update drizzle config
- Update eslint config
- Update vite config
- Update vitest config"
```

### Commit 6: Client Components (Line Endings)
**Type:** `chore(client)`  
**Files:** 400+ files

**Note:** Disse er primært line ending fixes (LF → CRLF). Overvej at committe dem alle sammen:

```bash
git add client/src/components/
git commit -m "chore(client): fix line endings in components

- Normalize line endings (LF → CRLF)
- Update component files"
```

### Commit 7: Server Code Updates
**Type:** `chore(server)`  
**Files:** 100+ files

```bash
git add server/
git commit -m "chore(server): update server code and tests

- Update server core files
- Update server routers
- Update test files
- Improve error handling"
```

---

## ⚠️ Edge Case: Mange Filer

**Problem:** 604 filer er for mange til at committe i én gang

**Løsning:** 
1. Committe i logiske grupper (som foreslået ovenfor)
2. Eller committe alle på én gang hvis de er relaterede (f.eks. line ending fixes)

**Anbefaling:** 
- Start med små commits (Commands, Hooks, Docs)
- Derefter større commits (Client, Server)
- Til sidst cleanup (Scripts)

---

## 🚀 Execution Order

1. ✅ Commit 1: Commands (4 files)
2. ✅ Commit 2: Hooks (8 files)
3. ✅ Commit 3: Documentation (10+ files)
4. ✅ Commit 4: Scripts Cleanup (6 files)
5. ✅ Commit 5: Configuration (5 files)
6. ⚠️ Commit 6: Client Components (400+ files) - Overvej om dette skal splittes
7. ⚠️ Commit 7: Server Code (100+ files) - Overvej om dette skal splittes

---

**Status:** ✅ Auto-generated  
**Næste skridt:** Review og execute commits  
**Last Updated:** 2025-01-28

