# 📋 Version Bump Plan - Før vi opdaterer til 2.0.1

**Dato:** 28. januar 2025  
**Status:** ⏸️ Paused - Først få styr på filerne  
**Nuværende version:** 2.0.0

---

## 🎯 Principper

**VIKKE version bump før:**

1. ✅ Alle filer er organiserede og på plads
2. ✅ Unødvendige filer er slettet
3. ✅ Dokumentation er konsolideret
4. ✅ Version numre er synkroniseret på tværs af alle filer
5. ✅ CHANGELOG er opdateret med alle ændringer

---

## 📊 Nuværende Status

### **Version Inconsistencies**

- ✅ `package.json`: 2.0.0
- ✅ `README.md`: 2.0.0
- ✅ `docs/STATUSRAPPORT_2025-01-28.md`: 2.0.0
- ✅ `CHANGELOG.md`: Har nu 2.0.0 entry med korrekt dato (2025-01-28)
- ✅ `docs/API_REFERENCE.md`: Nævner "Current Version: 1.0.0" (API version, ikke projekt version - OK)
- ✅ Subprojekter: Har deres egne versioner (1.0.0) - separate packages, OK

### **Filer der skal ryddes op**

#### **1. Empty Files (11 filer - 0 bytes)**

```
❌ DEBUG_AKTUEL_STATUS.md
❌ FIX_500_ERROR.md
❌ LOGIN_FIXES_COMPLETE.md
❌ LOGIN_FIX_SUMMARY.md
❌ LOGIN_ISSUES_ANALYSIS.md
❌ QUICK_START.md
❌ README_LOGIN_FIX.md
❌ TEST_LOGIN_GUIDE.md
❌ VISUAL_LOGIN_GUIDE.md
❌ check-env.js (hvis tom)
❌ test-database.js (hvis tom)
```

#### **2. Backup Files**

```
❌ drizzle/schema.backup.ts (hvis eksisterer)
```

#### **3. Temporary Files**

```
❌ analysis-emil-laerke.json (1.2 MB)
❌ billy-api-response.json
❌ cookies.txt
❌ stats.html
❌ env.template.txt
```

#### **4. Test Files i Root (18 filer)**

```
📦 test-all-email-functions.mjs → tests/manual/
📦 test-billy-api.ts → tests/manual/
📦 test-billy-invoice-response.mjs → tests/manual/
📦 test-email-actions.mjs → tests/manual/
📦 test-email-api.ts → tests/manual/
📦 test-email-loading.mjs → tests/manual/
📦 test-email-sidebar.mjs → tests/manual/
📦 test-friday-calendar-tools.ts → tests/manual/
📦 test-friday-complete.ts → tests/manual/
📦 test-friday-optimized.ts → tests/manual/
📦 test-google-api.mjs → tests/manual/
📦 test-inbound-email.js → tests/manual/
📦 test-intent.mjs → tests/manual/
📦 test-label-filtering.mjs → tests/manual/
📦 test-openrouter.ts → tests/manual/
📦 test-sidebar-logic.md → tests/manual/
📦 test-ui-state.mjs → tests/manual/
📦 verify-email-fix.mjs → tests/manual/
```

#### **5. Documentation i Root (83+ filer)**

Se `DOCS_CLEANUP_PLAN.md` for detaljeret liste.

---

## ✅ Checklist før Version Bump

### **Phase 1: File Cleanup**

- [ ] Slet 11 empty files
- [ ] Slet backup files
- [ ] Slet temporary files (~1.3 MB)
- [ ] Flyt 18 test files til `tests/manual/`
- [ ] Verificer ingen kritiske filer bliver slettet

### **Phase 2: Documentation Organization**

- [ ] Flyt root-level docs til `docs/` struktur
- [ ] Konsolider duplicate dokumentation
- [ ] Opdater links i README.md
- [ ] Verificer alle links virker

### **Phase 3: Version Synchronization**

- [ ] Tjek alle version referencer i kodebase
- [ ] Opdater CHANGELOG.md med 2.0.0 entry
- [ ] Verificer version consistency
- [ ] Opdater alle version badges

### **Phase 4: Final Verification**

- [ ] `pnpm check` - No TypeScript errors
- [ ] `pnpm test` - All tests passing
- [ ] `pnpm build` - Production build successful
- [ ] Git status - Clean working directory
- [ ] Review alle ændringer

### **Phase 5: Version Bump (KUN når alt andet er done)**

- [ ] Opdater `package.json` → 2.0.1
- [ ] Opdater `README.md` badge → 2.0.1
- [ ] Opdater `CHANGELOG.md` med 2.0.1 entry
- [ ] Opdater `docs/STATUSRAPPORT_2025-01-28.md` → 2.0.1
- [ ] Tjek alle andre steder med version referencer
- [ ] Commit med message: `chore: bump version to 2.0.1`

---

## 📝 CHANGELOG Entry Template

Når vi er klar til version bump, skal denne entry tilføjes:

```markdown
## [2.0.1] - 2025-01-28

### 🔄 Version Update & Cleanup

#### Cleanup

- ✅ Deleted 19 unnecessary files (empty, backup, temporary)
- ✅ Organized 18 test files to `tests/manual/`
- ✅ Consolidated documentation structure
- ✅ Moved 83+ root-level docs to organized `docs/` structure

#### Documentation

- ✅ Complete status report with live status check
- ✅ Version consistency across all files
- ✅ Updated CHANGELOG with 2.0.0 entry

#### Technical

- No breaking changes
- Backward compatible
- Production ready
```

---

## 🚀 Næste Skridt

1. **Review denne plan** - Er der noget der mangler?
2. **Start med Phase 1** - File cleanup (sikrest først)
3. **Verificer efter hver phase** - Git status, build, tests
4. **Commit incrementally** - Små commits er bedre
5. **Version bump til sidst** - Når alt andet er done

---

## ⚠️ Vigtigt

**IKKE commit version bump før:**

- ✅ Alle filer er ryddet op
- ✅ Dokumentation er organiseret
- ✅ Versioner er synkroniseret
- ✅ CHANGELOG er opdateret
- ✅ Build og tests passerer

---

**Status:** ⏸️ Paused - Vent på godkendelse af cleanup plan
