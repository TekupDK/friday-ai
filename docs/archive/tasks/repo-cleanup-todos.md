# Repository Cleanup TODO List

**Created**: 2025-11-15  
**Status**: Ready to execute  
**Reference**: REPO_STRUCTURE_ASSESSMENT.md

## ✅ Completed

- [x] Docs migration (81 files moved to docs/)
- [x] Fix git lock issue (.git/index.lock removed)
- [x] Create cleanup assessment

## 🔥 Priority 1: Immediate (Do Now)

### Task 1.1: Remove Empty Directories

**Impact**: Immediate visual cleanup  
**Effort**: 5 minutes  
**Risk**: Minimal

```powershell
# Remove completely empty
Remove-Item "AI Apps" -Recurse -Force

# Verify
Get-ChildItem -Directory | Where-Object { (Get-ChildItem $_.FullName -Recurse -File | Measure-Object).Count -eq 0 }
```

**Checklist**:

- [ ] Remove "AI Apps/" (empty)
- [ ] Verify no other empty top-level directories

---

### Task 1.2: Gitignore Runtime Folders

**Impact**: Prevent future clutter  
**Effort**: 2 minutes  
**Risk**: None

```powershell
# Add to .gitignore
Add-Content .gitignore "`n# Runtime folders"
Add-Content .gitignore "tmp/"
Add-Content .gitignore "logs/"
Add-Content .gitignore "*.log"
Add-Content .gitignore "`n# Git lock files"
Add-Content .gitignore ".git/index.lock"
```

**Checklist**:

- [ ] Add tmp/ to .gitignore
- [ ] Add logs/ to .gitignore
- [ ] Add \*.log to .gitignore
- [ ] Add .git/index.lock to .gitignore
- [ ] Commit .gitignore changes

---

### Task 1.3: Archive Legacy Directories

**Impact**: Clean up confusion  
**Effort**: 5 minutes  
**Risk**: Low

```powershell
# Archive barely-used folders
git mv tasks archive/tasks
git mv migration-check archive/migrations
git mv development-notes archive/development-notes
```

**Checklist**:

- [ ] Move tasks/ → archive/tasks/
- [ ] Move migration-check/ → archive/migrations/
- [ ] Move development-notes/ → archive/development-notes/
- [ ] Commit archive moves

---

## 📦 Priority 2: Short-term (This Week)

### Task 2.1: Organize Root Scripts

**Impact**: Major root cleanup (19 files → 0)  
**Effort**: 30 minutes  
**Risk**: Low (need to update package.json)

```powershell
# Create structure
New-Item -ItemType Directory -Force -Path "scripts\migrations\archive"
New-Item -ItemType Directory -Force -Path "scripts\testing"
New-Item -ItemType Directory -Force -Path "scripts\setup"

# Move migration scripts
git mv add-alias-columns.ts scripts/migrations/archive/
git mv add-missing-columns.ts scripts/migrations/archive/
git mv check-columns.mjs scripts/migrations/archive/
git mv check-conversation-titles.ts scripts/migrations/archive/
git mv check-customers.ts scripts/migrations/archive/
git mv check-emails-table.ts scripts/migrations/archive/
git mv check-invoices.ts scripts/migrations/archive/
git mv check-tables.ts scripts/migrations/archive/
git mv create-tables-directly.ts scripts/migrations/archive/
git mv fix-emails-table.ts scripts/migrations/archive/
git mv migrate-emails-schema.ts scripts/migrations/archive/
git mv resync-invoices.ts scripts/migrations/archive/
git mv run-email-threads-migration.ts scripts/migrations/archive/
git mv run-migration.ts scripts/migrations/archive/
git mv run-pipeline-migration.mjs scripts/migrations/archive/
git mv setup-enums-via-cli.ts scripts/setup/

# Move test scripts
git mv test-email-intelligence.mjs scripts/testing/
git mv test-intent-detection.mjs scripts/testing/
git mv test-model-router-litellm.mjs scripts/testing/
git mv test-models-manual.mjs scripts/testing/
git mv test-performance-benchmark.mjs scripts/testing/
git mv test-production-simulation.mjs scripts/testing/
git mv test-real-leads-sim.mjs scripts/testing/
git mv test-real-leads.mjs scripts/testing/
git mv run-ai-tests.ts scripts/testing/
git mv run-friday-tests.ts scripts/testing/

# Move analysis
git mv analyze-figma.mjs scripts/setup/
git mv analyze-figma.spec.ts scripts/setup/
```

**Checklist**:

- [ ] Create scripts/migrations/archive/
- [ ] Create scripts/testing/
- [ ] Create scripts/setup/
- [ ] Move 16 migration scripts
- [ ] Move 10 test scripts
- [ ] Move 2 analysis scripts
- [ ] Update package.json script paths (see Task 2.2)
- [ ] Test affected scripts still work
- [ ] Commit script reorganization

---

### Task 2.2: Update package.json Scripts

**Impact**: Ensure scripts still work  
**Effort**: 10 minutes  
**Risk**: Low

Update paths in package.json scripts section:

```json
{
  "scripts": {
    "test:ai": "tsx scripts/testing/run-ai-tests.ts",
    "test:friday": "tsx scripts/testing/run-friday-tests.ts",
    "test:email": "node scripts/testing/test-email-intelligence.mjs",
    "test:performance": "node scripts/testing/test-performance-benchmark.mjs"
  }
}
```

**Checklist**:

- [ ] Review all package.json scripts
- [ ] Update paths to new locations
- [ ] Test each affected script
- [ ] Commit package.json updates

---

### Task 2.3: Archive Figma Analysis

**Impact**: Move design docs  
**Effort**: 5 minutes  
**Risk**: Minimal

```powershell
# Move to docs
New-Item -ItemType Directory -Force -Path "docs\design"
git mv figma-analysis docs/design/
git mv figma-design.png docs/design/
git mv figma-design-scrolled.png docs/design/
```

**Checklist**:

- [ ] Create docs/design/
- [ ] Move figma-analysis/ folder
- [ ] Move figma PNG files
- [ ] Update any references in docs
- [ ] Commit design docs move

---

## 📊 Priority 3: Medium-term (This Month)

### Task 3.1: Consolidate Test Structure

**Impact**: Unified test discovery  
**Effort**: 1 hour  
**Risk**: Medium (must update CI/CD)

```powershell
# Backup first
Copy-Item tests tests-backup -Recurse

# Create new structure
New-Item -ItemType Directory -Force -Path "tests\e2e"
New-Item -ItemType Directory -Force -Path "tests\integration"
New-Item -ItemType Directory -Force -Path "tests\unit"
New-Item -ItemType Directory -Force -Path "tests\results"

# Move existing E2E tests
Get-ChildItem tests -File -Recurse | Move-Item -Destination tests/e2e/

# Move test outputs
git mv test-results tests/results/playwright
git mv playwright-report tests/results/reports

# Update .gitignore
Add-Content .gitignore "`ntests/results/"
```

**Checklist**:

- [ ] Backup current tests/
- [ ] Create new test structure
- [ ] Move E2E tests to tests/e2e/
- [ ] Move component tests (client/src/**tests**/) to tests/unit/client/
- [ ] Move server tests (server/**tests**/) to tests/unit/server/
- [ ] Move test outputs to tests/results/
- [ ] Update playwright.config.ts
- [ ] Update vitest.config.ts
- [ ] Update .gitignore
- [ ] Update CI/CD pipeline (.github/workflows/)
- [ ] Test all test suites still run
- [ ] Remove backup after verification
- [ ] Commit test reorganization

---

### Task 3.2: Consolidate Archive Folders

**Impact**: Single archive location  
**Effort**: 15 minutes  
**Risk**: Low

```powershell
# Move docs/archive content to archive/docs/
New-Item -ItemType Directory -Force -Path "archive\docs"
git mv docs/archive/root archive/docs/root
git mv docs/archive/tasks archive/docs/tasks
git mv docs/archive/test-results archive/docs/test-results
git mv docs/archive/claude archive/docs/claude
git mv docs/archive/copilot archive/docs/copilot

# Remove empty docs/archive/
Remove-Item docs/archive -Force
```

**Checklist**:

- [ ] Create archive/docs/
- [ ] Move docs/archive/\* to archive/docs/
- [ ] Remove empty docs/archive/
- [ ] Update documentation references
- [ ] Commit archive consolidation

---

### Task 3.3: Document Folder Conventions

**Impact**: Team clarity  
**Effort**: 30 minutes  
**Risk**: None

Create/update docs/CONTRIBUTING.md with:

- Folder structure overview
- Where to place new files
- Archive policy
- Test organization
- Documentation standards

**Checklist**:

- [ ] Create docs/CONTRIBUTING.md
- [ ] Document folder structure
- [ ] Document file placement rules
- [ ] Document archive policy
- [ ] Add examples
- [ ] Link from README.md
- [ ] Commit contribution guide

---

## 🔮 Priority 4: Long-term (Future)

### Task 4.1: Improve Docs Service Robustness

**Impact**: Prevent git lock issues  
**Effort**: 2-4 hours  
**Risk**: Medium

**Changes needed**:

1. Add git lock detection and auto-cleanup
2. Make git sync optional in development
3. Better error handling and logging
4. Graceful degradation if git fails

**Files to modify**:

- server/integrations/docs/ (or wherever GitSync lives)
- Add environment variable DOCS_GIT_SYNC_ENABLED
- Add recovery mechanisms

**Checklist**:

- [ ] Find GitSync implementation
- [ ] Add git lock detection
- [ ] Add auto-cleanup on stale locks
- [ ] Make git sync optional (env var)
- [ ] Improve error messages
- [ ] Add retry logic
- [ ] Test with various failure scenarios
- [ ] Document new behavior
- [ ] Commit improvements

---

### Task 4.2: Evaluate Server Domain Organization

**Impact**: Better code organization  
**Effort**: 8-16 hours  
**Risk**: High

**Deferred** - Plan for dedicated refactor sprint

---

### Task 4.3: Config File Consolidation

**Impact**: Cleaner root  
**Effort**: 4-8 hours  
**Risk**: Medium-High

**Deferred** - Evaluate on case-by-case basis

---

## 📋 Execution Plan

### Today (2025-11-15)

1. ✅ Task 1.1: Remove empty directories (5 min)
2. ✅ Task 1.2: Update .gitignore (2 min)
3. ✅ Task 1.3: Archive legacy folders (5 min)
4. Commit: "chore: Remove empty dirs and archive legacy folders"

**Total time: ~15 minutes**

### Tomorrow (2025-11-16)

1. Task 2.1: Organize root scripts (30 min)
2. Task 2.2: Update package.json (10 min)
3. Task 2.3: Archive figma analysis (5 min)
4. Commit: "chore: Reorganize scripts and design files"

**Total time: ~45 minutes**

### Next Week

1. Task 3.1: Consolidate test structure (1 hour)
2. Task 3.2: Consolidate archives (15 min)
3. Task 3.3: Document conventions (30 min)
4. Commit: "chore: Reorganize test structure and document conventions"

**Total time: ~2 hours**

### Next Month

1. Task 4.1: Improve docs service (2-4 hours)
2. Evaluate need for tasks 4.2 and 4.3

---

## Success Metrics

**Root Directory Before**: 133 files (83 MD + 50 configs/scripts)  
**Root Directory After**: ~16 files (3 MD + 13 configs)  
**Reduction**: 88% fewer files in root

**Test Organization Before**: 6+ locations  
**Test Organization After**: 1 unified tests/ folder

**Documentation**: Clear conventions documented

---

## Notes

- Always use `git mv` to preserve file history
- Test affected functionality after each task
- Commit frequently with clear messages
- Update documentation as you go
- If something breaks, git reset and investigate

---

## Quick Commands

```powershell
# Start Priority 1
cd C:\Users\empir\Tekup\services\tekup-ai-v2

# Task 1.1
Remove-Item "AI Apps" -Recurse -Force

# Task 1.2
@"

# Runtime folders
tmp/
logs/
*.log

# Git lock files
.git/index.lock
"@ | Add-Content .gitignore

# Task 1.3
git mv tasks archive/tasks
git mv migration-check archive/migrations

# Commit
git add .
git commit -m "chore: Remove empty dirs, gitignore runtime, archive legacy"
```
