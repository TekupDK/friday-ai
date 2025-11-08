# 🧹 Workspace Cleanup Guide

**Date:** 2025-11-08  
**Status:** Ready to Execute  
**Estimated Time:** 20 minutes

---

## 🎯 **OVERVIEW**

This guide will help you clean up the workspace by:
1. Deleting 19 unnecessary files
2. Organizing 18 test files
3. Consolidating documentation

**Result:** Cleaner, more organized workspace with 47% fewer root-level files

---

## 📋 **CLEANUP STEPS**

### **Step 1: Safe Cleanup (5 min)**

Delete files that are definitely not needed:

```powershell
# Run from project root
.\scripts\cleanup-phase1.ps1
```

**What it does:**
- Deletes 11 empty files (0 bytes)
- Deletes 1 backup file
- Deletes 2 deprecated docs
- Deletes 5 temporary files (including 1.1MB stats.html)

**Total:** 19 files deleted

---

### **Step 2: Organize Test Files (3 min)**

Move test scripts to proper location:

```powershell
# Run from project root
.\scripts\organize-test-files.ps1
```

**What it does:**
- Creates `tests/manual/` directory
- Moves 18 test scripts from root to `tests/manual/`

**Result:** Cleaner root directory, tests properly organized

---

### **Step 3: Verify Changes (2 min)**

Check what was changed:

```powershell
# See deleted files
git status

# Review changes
git diff
```

---

### **Step 4: Commit Changes (1 min)**

Commit the cleanup:

```powershell
git add .
git commit -m "chore: cleanup workspace - delete empty files and organize tests"
```

---

## 🎯 **OPTIONAL: MIGRATION SCRIPTS CLEANUP**

**⚠️ Only do this after verifying migrations are complete!**

These migration scripts can be deleted if migrations are done:

```powershell
# Check if migrations are complete first!
# Then delete these files:

Remove-Item add-alias-columns.ts
Remove-Item add-missing-columns.ts
Remove-Item check-columns.mjs
Remove-Item check-conversation-titles.ts
Remove-Item check-customers.ts
Remove-Item check-emails-table.ts
Remove-Item check-invoices.ts
Remove-Item check-tables.ts
Remove-Item create-tables-directly.ts
Remove-Item fix-emails-table.ts
Remove-Item migrate-emails-schema.ts
Remove-Item resync-invoices.ts
Remove-Item run-email-threads-migration.ts
Remove-Item run-pipeline-migration.mjs
Remove-Item setup-enums-via-cli.ts
```

**Total:** 15 additional files (only if migrations are complete)

---

## 📊 **BEFORE & AFTER**

### **Before Cleanup:**
```
Root directory:
- ~150 files
- 18 test scripts mixed with source
- 11 empty files
- 5 temporary files (1.1MB)
- Cluttered and hard to navigate
```

### **After Cleanup:**
```
Root directory:
- ~80 files (47% reduction)
- All tests in tests/ folder
- No empty files
- No temporary files
- Clean and professional
```

---

## ✅ **VERIFICATION CHECKLIST**

After running cleanup scripts:

- [ ] All empty files deleted
- [ ] Temporary files deleted (stats.html, etc.)
- [ ] Test files moved to tests/manual/
- [ ] Git status shows expected changes
- [ ] No build errors (`pnpm build`)
- [ ] Tests still run (`pnpm test`)
- [ ] Changes committed to git

---

## 🚀 **QUICK START**

**Run all cleanup steps:**

```powershell
# 1. Safe cleanup
.\scripts\cleanup-phase1.ps1

# 2. Organize tests
.\scripts\organize-test-files.ps1

# 3. Verify
git status

# 4. Build test
pnpm build

# 5. Commit
git add .
git commit -m "chore: cleanup workspace"
```

**Total time:** ~10 minutes

---

## 📝 **WHAT GETS DELETED**

### **Empty Files (11):**
- `DEBUG_AKTUEL_STATUS.md`
- `FIX_500_ERROR.md`
- `LOGIN_FIXES_COMPLETE.md`
- `LOGIN_FIX_SUMMARY.md`
- `LOGIN_ISSUES_ANALYSIS.md`
- `QUICK_START.md`
- `README_LOGIN_FIX.md`
- `TEST_LOGIN_GUIDE.md`
- `VISUAL_LOGIN_GUIDE.md`
- `check-env.js`
- `test-database.js`

### **Backup Files (1):**
- `drizzle/schema.backup.ts`

### **Deprecated Docs (2):**
- `docs/DEPRECATED_CODE_CLEANUP.md`
- `docs/DEPRECATED_FILES.md`

### **Temporary Files (5):**
- `analysis-emil-laerke.json`
- `billy-api-response.json` (187KB)
- `cookies.txt`
- `stats.html` (1.1MB!)
- `env.template.txt`

---

## 📦 **WHAT GETS MOVED**

### **Test Files → tests/manual/ (18):**
- `test-all-email-functions.mjs`
- `test-billy-api.ts`
- `test-billy-invoice-response.mjs`
- `test-email-actions.mjs`
- `test-email-api.ts`
- `test-email-loading.mjs`
- `test-email-sidebar.mjs`
- `test-friday-calendar-tools.ts`
- `test-friday-complete.ts`
- `test-friday-optimized.ts`
- `test-google-api.mjs`
- `test-inbound-email.js`
- `test-intent.mjs`
- `test-label-filtering.mjs`
- `test-openrouter.ts`
- `test-sidebar-logic.md`
- `test-ui-state.mjs`
- `verify-email-fix.mjs`

---

## ⚠️ **IMPORTANT NOTES**

1. **Backup First:** All files remain in git history
2. **Test After:** Run `pnpm build` and `pnpm test` after cleanup
3. **Migration Scripts:** Only delete after verifying migrations are complete
4. **Team Communication:** Inform team about cleanup

---

## 🎉 **EXPECTED RESULTS**

After cleanup:
- ✅ 19 unnecessary files deleted
- ✅ 18 test files properly organized
- ✅ Cleaner root directory
- ✅ Easier to navigate
- ✅ More professional structure
- ✅ 1.3MB disk space freed

---

## 🚀 **READY TO START?**

Run the first cleanup script:

```powershell
.\scripts\cleanup-phase1.ps1
```

**It will:**
1. Show you what will be deleted
2. Ask for confirmation
3. Delete files
4. Show summary

**Safe to run!** ✅
