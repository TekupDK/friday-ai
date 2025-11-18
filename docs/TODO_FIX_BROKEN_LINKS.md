# TODO: Fix Broken Documentation Links

**Created:** 2025-11-18
**Priority:** P1 (High)
**Estimated Time:** 1-2 hours

---

## Summary

After documentation reorganization (199 files moved), there are **44 broken markdown links** in the documentation that need to be fixed.

---

## How to Fix

Run the automated link fix script:

```bash
# Dry-run (see what would be fixed)
npm run docs:fix-links:dry-run

# Apply fixes
npm run docs:fix-links
```

---

## Broken Link Categories

### 1. Files Outside docs/ (10 links)
- **Issue:** Links point to files in `client/src/components/docs/`
- **Example:** `client/src/components/docs/AI_DOCS_USAGE.md`
- **Fix:** Update relative paths or move files to `docs/`

### 2. Missing Files (34 links)
- **Issue:** Referenced files don't exist
- **Examples:**
  - `DOCS_SYSTEM_STATUS.md`
  - `TESTING_IMPLEMENTATION_SUMMARY.md`
  - `CHAT_PHASE_PLAN.md`
- **Fix:** Create missing files or remove references

---

## Detailed Analysis

See complete analysis in:
- `docs/BROKEN_LINKS_ANALYSIS.md` (detailed breakdown)
- `docs/BROKEN_LINKS_FIX_SUMMARY.md` (fix summary)

---

## Manual Fix Steps (If Script Fails)

1. **Identify broken links:**
   ```bash
   grep -r "](.*\.md)" docs/ | grep -v "http"
   ```

2. **For each broken link:**
   - Check if target file exists
   - If yes: Update relative path
   - If no: Create file or remove link

3. **Test links:**
   - Use VS Code "Go to Definition" on markdown links
   - Verify all links work

---

## Prevention

To prevent future broken links:

1. **Use link validator in CI:**
   ```bash
   npm run docs:validate-links  # Add this script
   ```

2. **Use VS Code markdown extensions:**
   - Markdown All in One
   - Markdown Link Checker

3. **Document file moves:**
   - Keep changelog of file relocations
   - Update links immediately after moves

---

## Status

- ✅ Script exists: `scripts/docs/fix-docs-links.ts`
- ⏳ Needs to be run
- ⏳ Broken links need verification after fix

---

**Next Steps:**
1. Run `npm run docs:fix-links:dry-run` to see what will be fixed
2. Review proposed changes
3. Run `npm run docs:fix-links` to apply fixes
4. Verify links work
5. Commit changes

---

**Related Files:**
- `docs/BROKEN_LINKS_ANALYSIS.md`
- `docs/BROKEN_LINKS_FIX_SUMMARY.md`
- `docs/TODO_DOCS_CATEGORIZATION.md`
- `scripts/docs/fix-docs-links.ts`

---

**Last Updated:** 2025-11-18
