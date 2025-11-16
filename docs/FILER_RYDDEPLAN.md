# 🧹 Fil Ryddeplan - Før Version Bump

**Dato:** 28. januar 2025  
**Status:** 🔄 I gang  
**Mål:** Få styr på alle filer før vi opdaterer version

---

## 🎯 Principper

**VIKKE version bump før:**
1. ✅ Alle tomme/backup/temp filer er slettet
2. ✅ Test filer er organiseret
3. ✅ Dokumentation er på plads
4. ✅ Versioner er synkroniseret
5. ✅ CHANGELOG er opdateret

---

## 📊 Nuværende Status

### **Root Directory - Filer der skal ryddes**

#### **1. Empty Files (0 bytes) - SKAL SLETTES**

**✅ VERIFICERET:**
- `check-env.js` - **BEHOLDES** (103 linjer, bruges i package.json scripts)
- `.gitkeep` - **BEHOLDES** (intentional empty file)

**Filer at tjekke/slette (hvis de eksisterer og er tomme):**
- `DEBUG_AKTUEL_STATUS.md` (tjek om eksisterer)
- `FIX_500_ERROR.md` (tjek om eksisterer)
- `LOGIN_FIXES_COMPLETE.md` (tjek om eksisterer)
- `LOGIN_FIX_SUMMARY.md` (tjek om eksisterer)
- `LOGIN_ISSUES_ANALYSIS.md` (tjek om eksisterer)
- `QUICK_START.md` (tjek om eksisterer)
- `README_LOGIN_FIX.md` (tjek om eksisterer)
- `TEST_LOGIN_GUIDE.md` (tjek om eksisterer)
- `VISUAL_LOGIN_GUIDE.md` (tjek om eksisterer)
- `test-database.js` (tjek om eksisterer)

**Status:** De fleste af disse filer eksisterer sandsynligvis ikke længere eller har indhold.

#### **2. Temporary Files - SKAL SLETTES**

**✅ VERIFICERET:**
- `stats.html` - **EKSISTERER** (i root)
- `data/stats.html` - **EKSISTERER** (i data/)
- `analysis-emil-laerke.json` (tjek om eksisterer)
- `billy-api-response.json` (tjek om eksisterer)
- `cookies.txt` (tjek om eksisterer)
- `env.template.txt` (tjek om eksisterer)

**Action:** Slet `stats.html` filer (både i root og data/)

#### **3. Backup Files - SKAL SLETTES**

**✅ VERIFICERET:**
- `drizzle/schema.backup.ts` - **EKSISTERER IKKE** ✅

**Status:** Ingen backup files at slette.

#### **4. Test Files i Root - SKAL FLYTTES**

**Flyt til `tests/manual/`:**
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

#### **5. Documentation i Root - SKAL ORGANISERES**

Se `DOCS_CLEANUP_PLAN.md` for detaljeret liste.

**Hurtig oversigt:**
- Status & Progress docs → `docs/status-reports/`
- AI & Automation docs → `docs/ai-automation/`
- Email & CRM docs → `docs/email-system/` eller `docs/crm-business/`
- Integration docs → `docs/integrations/`
- Guides → `docs/guides/`

---

## ✅ Handlingsplan

### **Phase 1: Safe Cleanup (Start her!)**

#### **Step 1.1: Tjek Empty Files**

```powershell
# Tjek hvilke filer faktisk er tomme
Get-ChildItem -Path . -File | Where-Object { $_.Length -eq 0 } | Select-Object Name, Length
```

**Action:**
- [ ] Liste alle tomme filer
- [ ] Verificer `check-env.js` - er den tom eller har den indhold?
- [ ] Slet kun filer der ER tomme (0 bytes)

#### **Step 1.2: Slet Temporary Files**

```powershell
# Tjek om de eksisterer
Test-Path "stats.html"
Test-Path "analysis-emil-laerke.json"
Test-Path "billy-api-response.json"
Test-Path "cookies.txt"
Test-Path "env.template.txt"
```

**Action:**
- [ ] Verificer filerne eksisterer
- [ ] Slet temporary files
- [ ] Tjek `data/stats.html` også

#### **Step 1.3: Slet Backup Files**

```powershell
# Tjek backup file
Test-Path "drizzle/schema.backup.ts"
```

**Action:**
- [ ] Verificer backup file eksisterer
- [ ] Slet hvis migrations er complete

#### **Step 1.4: Commit Phase 1**

```powershell
git add .
git commit -m "chore: cleanup - delete empty, temporary and backup files"
```

---

### **Phase 2: Organize Test Files**

#### **Step 2.1: Opret tests/manual/ directory**

```powershell
# Opret directory hvis den ikke eksisterer
New-Item -ItemType Directory -Path "tests/manual" -Force
```

#### **Step 2.2: Flyt Test Files**

```powershell
# Flyt hver fil (eksempel)
Move-Item "test-all-email-functions.mjs" -Destination "tests/manual/" -ErrorAction SilentlyContinue
```

**Action:**
- [ ] Flyt alle 18 test files til `tests/manual/`
- [ ] Verificer filerne er flyttet korrekt
- [ ] Opdater eventuelle referencer i scripts

#### **Step 2.3: Commit Phase 2**

```powershell
git add .
git commit -m "chore: organize test files to tests/manual/"
```

---

### **Phase 3: Documentation Organization**

**⚠️ Dette er større opgave - gør det i batches**

#### **Step 3.1: Review DOCS_CLEANUP_PLAN.md**

- [ ] Læs `DOCS_CLEANUP_PLAN.md` for detaljeret plan
- [ ] Identificer første batch (f.eks. Status & Progress docs)
- [ ] Flyt første batch

#### **Step 3.2: Flyt Documentation i Batches**

**Batch 1: Status Reports**
- [ ] Flyt `PHASE*_*.md` til `docs/status-reports/phases/`
- [ ] Flyt `DAY*_*.md` til `docs/status-reports/daily-progress/`
- [ ] Flyt `*_STATUS.md` til `docs/status-reports/feature-status/`

**Batch 2: AI & Automation**
- [ ] Flyt `AI_*.md` til `docs/ai-automation/`
- [ ] Flyt `FRIDAY_*.md` til `docs/ai-automation/friday-ai/`
- [ ] Flyt `AUTONOMOUS-*.md` til `docs/ai-automation/agentic-rag/`

**Batch 3: Integration Docs**
- [ ] Flyt `LANGFUSE_*.md` til `docs/integrations/langfuse/`
- [ ] Flyt `LITELLM_*.md` til `docs/integrations/litellm/`
- [ ] Flyt `CHROMADB_*.md` til `docs/integrations/ChromaDB/`

**Batch 4: Guides & Misc**
- [ ] Flyt guides til `docs/guides/`
- [ ] Flyt component docs til `docs/ui-frontend/`
- [ ] Flyt email docs til `docs/email-system/`

#### **Step 3.3: Commit Documentation Organization**

```powershell
# Commit hver batch separat
git add .
git commit -m "chore: organize documentation - move [batch name] to docs/"
```

---

### **Phase 4: Version Synchronization**

#### **Step 4.1: Opdater CHANGELOG.md**

- [ ] Tilføj 2.0.0 entry hvis mangler
- [ ] Dokumenter alle features i 2.0.0
- [ ] Verificer format er korrekt

#### **Step 4.2: Tjek Version Referencer**

```powershell
# Søg efter version referencer
Select-String -Path "*.md","*.json","*.ts","*.tsx" -Pattern "2\.0\.0|1\.8\.0|version" -Recurse | Select-Object -First 20
```

**Action:**
- [ ] Find alle version referencer
- [ ] Opdater til konsistent version
- [ ] Verificer alle badges og links

#### **Step 4.3: Commit Version Sync**

```powershell
git add .
git commit -m "chore: synchronize version numbers across all files"
```

---

### **Phase 5: Final Verification**

#### **Step 5.1: Build Check**

```powershell
pnpm check    # TypeScript check
pnpm test     # Run tests
pnpm build    # Production build
```

**Action:**
- [ ] Verificer ingen TypeScript errors
- [ ] Verificer alle tests passerer
- [ ] Verificer build er successful

#### **Step 5.2: Git Status**

```powershell
git status
```

**Action:**
- [ ] Review alle ændringer
- [ ] Verificer ingen kritiske filer er slettet
- [ ] Verificer alle commits er logiske

---

## 🎯 Næste Skridt

**Start med Phase 1 - Safe Cleanup:**
1. Tjek empty files
2. Slet temporary files
3. Slet backup files
4. Commit

**Derefter Phase 2:**
1. Organize test files
2. Commit

**Derefter Phase 3 (større opgave):**
1. Organize documentation i batches
2. Commit hver batch

**Til sidst Phase 4 & 5:**
1. Version sync
2. Final verification
3. **FØRST NU** - Version bump til 2.0.1

---

## ⚠️ Vigtige Noter

1. **check-env.js** - Tjek om den faktisk bruges! Den er i `package.json` scripts
2. **Incremental commits** - Commit ofte, små commits er bedre
3. **Verificer før sletning** - Tjek altid om filer faktisk er tomme/ubrugelige
4. **Backup før store ændringer** - Overvej at lave branch før Phase 3

---

**Status:** 🔄 Klar til at starte Phase 1

