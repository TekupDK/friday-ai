# Broken Links Analysis Report

**Created:** 2025-01-28  
**Status:** Analysis Complete

## Summary

**Total Broken Links:** 44

### By Category

- **Wrong Path (Files outside docs/):** ~10 links
  - Most are references to `client/src/components/docs/AI_DOCS_USAGE.md`
  - File exists but is outside docs/ directory
- **Not Found (Missing files):** ~34 links
  - Files that don't exist in docs/ directory
  - May have been deleted, renamed, or never created

## Detailed Analysis

### 1. Files Outside docs/ Directory (10 links)

#### `client/src/components/docs/AI_DOCS_USAGE.md` (5 links)

**Files referencing this:**

- `docs/ai-automation/friday-ai/FRIDAY_DOCS_INDEX.md` (3 links)
- `docs/ai-automation/friday-ai/FRIDAY_DOCS_SYSTEM.md` (1 link)
- `docs/development-notes/FRIDAY_DOCS_SYSTEM.md` (1 link)

**Status:** ✅ File exists at `client/src/components/docs/AI_DOCS_USAGE.md`

**Recommendations:**

1. **Option A:** Move file to `docs/ai-automation/friday-ai/AI_DOCS_USAGE.md`
   - Pros: All docs in one place, easier to maintain
   - Cons: File is currently used by component, may break component references
2. **Option B:** Update links to use absolute path from project root
   - Use: `../../../../client/src/components/docs/AI_DOCS_USAGE.md`
   - Pros: Keeps file in component location
   - Cons: Longer paths, harder to maintain
3. **Option C:** Create symlink or copy in docs/
   - Pros: File accessible from both locations
   - Cons: Risk of duplication

**Recommended:** Option A - Move to docs/ if file is primarily documentation

### 2. Missing Files (34 links)

#### Files Referenced But Not Found:

1. **`DOCS_SYSTEM_STATUS.md`** (2 references)
   - Referenced in:
     - `docs/core/documentation/DOCS_NEXT_STEPS.md`
     - `docs/documentation/DOCS_NEXT_STEPS.md`
   - **Action:** Create file or remove references

2. **`TESTING_IMPLEMENTATION_SUMMARY.md`** (1 reference)
   - Referenced in: `docs/development-notes/configuration/CURSOR_HOOKS_TESTING.md`
   - **Action:** Check if file was renamed or moved

3. **`TESTING_GUIDE.md`** (1 reference)
   - Referenced in: `docs/development-notes/fixes/ERROR_HANDLING_TEST_COVERAGE.md`
   - **Action:** Check if file exists with different name

4. **`.cursor/commands/_meta/COMMAND_TEMPLATE.md`** (1 reference)
   - Referenced in: `docs/features/cursor-integration/HOOK_COMMAND_INTEGRATION_GUIDE.md`
   - **Status:** File exists but outside docs/
   - **Action:** Update path to `../../../../.cursor/commands/_meta/COMMAND_TEMPLATE.md`

5. **`.cursor/commands/example-with-hooks.md`** (1 reference)
   - Referenced in: `docs/features/cursor-integration/HOOK_COMMAND_INTEGRATION_GUIDE.md`
   - **Action:** Check if file exists or remove reference

6. **`CHAT_PHASE_PLAN.md`** (1 reference)
   - Referenced in: `docs/features/implementation/CHAT_IMPLEMENTATION_PROGRESS.md`
   - **Action:** Create file or remove reference

7. **`CHAT_ERROR_REPORT.md`** (1 reference)
   - Referenced in: `docs/features/implementation/CHAT_IMPLEMENTATION_PROGRESS.md`
   - **Action:** Create file or remove reference

8. **ChromaDB Integration Files** (6 references)
   - `TECHNICAL-GUIDE.md`
   - `API-REFERENCE.md`
   - `USER-GUIDE.md`
   - `TROUBLESHOOTING.md`
   - `DATA-QUALITY.md`
   - Location: `docs/integrations/ChromaDB/leads-v4.3.5/`
   - **Action:** Check if files exist with different names or create them

9. **ChromaDB Root Files** (2 references)
   - `INTEGRATION.md`
   - `API.md`
   - Location: `docs/integrations/ChromaDB/`
   - **Action:** Check if files exist with different names

10. **Other Missing Files:**
    - `api-optimering-og-rate-limiting-forbedringer.plan.md`
    - `email-tab-development-branch.plan.md`
    - `LOGGING_GUIDE.md`
    - `SPRINT_TODOS_CURSOR_ENHANCEMENTS.md`
    - `SECURITY_GUIDE.md`

## Recommendations by Priority

### P1 - High Priority (Fix Now)

1. **Fix `.cursor/` references** (2 links)
   - Update paths to use relative paths from docs/ root
   - Example: `../../../../.cursor/commands/_meta/COMMAND_TEMPLATE.md`

2. **Handle `AI_DOCS_USAGE.md`** (5 links)
   - Decide: Move to docs/ or update paths
   - Recommended: Move to `docs/ai-automation/friday-ai/AI_DOCS_USAGE.md`

### P2 - Medium Priority (Fix This Week)

3. **Create or remove references to missing core files:**
   - `DOCS_SYSTEM_STATUS.md` (2 references)
   - `TESTING_IMPLEMENTATION_SUMMARY.md` (1 reference)
   - `TESTING_GUIDE.md` (1 reference)

4. **Handle ChromaDB documentation:**
   - Check if files exist with different names
   - Create placeholder files if needed
   - Or remove references if not needed

### P3 - Low Priority (Fix When Needed)

5. **Handle implementation-specific files:**
   - `CHAT_PHASE_PLAN.md`
   - `CHAT_ERROR_REPORT.md`
   - Plan files (`.plan.md`)

6. **Handle other missing guides:**
   - `LOGGING_GUIDE.md`
   - `SECURITY_GUIDE.md`
   - `SPRINT_TODOS_CURSOR_ENHANCEMENTS.md`

## Action Plan

### Immediate Actions

1. ✅ **Analysis Complete** - All 44 broken links identified and categorized

2. **Next Steps:**
   - Fix `.cursor/` path references (2 links)
   - Decide on `AI_DOCS_USAGE.md` location (5 links)
   - Create or remove references to `DOCS_SYSTEM_STATUS.md` (2 links)

### Scripts Available

- `npm run docs:fix-links:dry-run` - Preview link fixes
- `npm run docs:fix-links` - Fix links automatically
- `npx tsx scripts/analyze-broken-links.ts` - Detailed analysis

## Statistics

- **Total Links:** 367
- **Valid Links:** 323 (88%)
- **Broken Links:** 44 (12%)
  - Wrong Path: ~10 (23%)
  - Not Found: ~34 (77%)

---

**Last Updated:** 2025-01-28
