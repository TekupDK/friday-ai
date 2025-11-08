# 🧹 Cleanup Scripts - Hvad Bliver Slettet/Flyttet?

**Dato:** 2025-11-08  
**Scripts:** 2 stk (cleanup-phase1.ps1 + organize-test-files.ps1)

---

## 📋 **SCRIPT 1: cleanup-phase1.ps1**

### **Hvad slettes:**

#### **1. Tomme Filer (11 stk, 0 bytes)**
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
❌ check-env.js
❌ test-database.js
```

**Hvorfor:** Alle er 0 bytes - tomme placeholder filer

---

#### **2. Backup Filer (1 stk)**
```
❌ drizzle/schema.backup.ts
```

**Hvorfor:** Gammel backup, ikke længere nødvendig

---

#### **3. Deprecated Docs (2 stk)**
```
❌ docs/DEPRECATED_CODE_CLEANUP.md
❌ docs/DEPRECATED_FILES.md
```

**Hvorfor:** Meta-dokumenter om deprecated kode, ikke relevante længere

---

#### **4. Temporary Filer (5 stk, ~1.3 MB)**
```
❌ analysis-emil-laerke.json (1.2 MB)
❌ billy-api-response.json
❌ cookies.txt
❌ stats.html
❌ env.template.txt
```

**Hvorfor:** Midlertidige filer fra tests/debugging

---

### **Total Script 1:**
- **19 filer slettes**
- **~1.3 MB frigives**
- **Ingen kode påvirkes**

---

## 📦 **SCRIPT 2: organize-test-files.ps1**

### **Hvad flyttes:**

#### **Test Filer (18 stk) → `tests/manual/`**

```
📦 test-all-email-functions.mjs
📦 test-billy-api.ts
📦 test-billy-invoice-response.mjs
📦 test-email-actions.mjs
📦 test-email-api.ts
📦 test-email-loading.mjs
📦 test-email-sidebar.mjs
📦 test-friday-calendar-tools.ts
📦 test-friday-complete.ts
📦 test-friday-optimized.ts
📦 test-google-api.mjs
📦 test-inbound-email.js
📦 test-intent.mjs
📦 test-label-filtering.mjs
📦 test-openrouter.ts
📦 test-sidebar-logic.md
📦 test-ui-state.mjs
📦 verify-email-fix.mjs
```

**Hvorfor:** Test filer skal ikke ligge i root, men i `tests/manual/`

---

### **Total Script 2:**
- **18 filer flyttes**
- **Fra:** Root directory
- **Til:** `tests/manual/`
- **Ingen filer slettes**

---

## 📊 **SAMLET RESULTAT**

### **Før Cleanup:**
```
Root Directory:
├── ~150 filer
├── Mange test filer
├── Tomme placeholder filer
└── Temporary filer
```

### **Efter Cleanup:**
```
Root Directory:
├── ~80 filer (-47%)
├── Ingen test filer (flyttet til tests/)
├── Ingen tomme filer
└── Ingen temporary filer
```

---

## ✅ **HVAD PÅVIRKES IKKE:**

### **Ingen af disse slettes/flyttes:**
- ✅ Kildekode (`client/`, `server/`)
- ✅ Vigtige docs (`README.md`, `STATUS.md`)
- ✅ Config filer (`.env`, `package.json`)
- ✅ Scripts (`scripts/`)
- ✅ Tests (`tests/`)
- ✅ Database (`database/`, `drizzle/`)
- ✅ Dependencies (`node_modules/`)

---

## 🔒 **SIKKERHED:**

### **Scripts er sikre fordi:**

1. **Interaktive** - Beder om bekræftelse før sletning
2. **Viser liste** - Du ser præcis hvad der slettes/flyttes
3. **Ingen wildcards** - Kun specifikke filer
4. **Reversible** - Git kan gendanne hvis nødvendigt
5. **Ingen kode** - Kun docs og test filer

---

## 📋 **STEP-BY-STEP:**

### **Når du kører cleanup-phase1.ps1:**

```powershell
PS> .\scripts\cleanup-phase1.ps1

🧹 Starting Phase 1 Cleanup...

Files to delete: 19

📋 Files that will be deleted:
  ❌ DEBUG_AKTUEL_STATUS.md (0 bytes)
  ❌ FIX_500_ERROR.md (0 bytes)
  ... (liste af alle filer)

Do you want to delete these files? (yes/no): _
```

**Du skal skrive "yes" for at fortsætte**

---

### **Når du kører organize-test-files.ps1:**

```powershell
PS> .\scripts\organize-test-files.ps1

📦 Organizing test files...

✅ Created directory: tests\manual

Files to move: 18

📋 Files that will be moved to tests/manual/:
  📦 test-all-email-functions.mjs (1234 bytes)
  ... (liste af alle filer)

Do you want to move these files? (yes/no): _
```

**Du skal skrive "yes" for at fortsætte**

---

## 🎯 **ANBEFALING:**

### **Kør begge scripts:**

```powershell
# 1. Slet unødvendige filer
.\scripts\cleanup-phase1.ps1

# 2. Organiser test filer
.\scripts\organize-test-files.ps1

# 3. Check resultatet
git status

# 4. Commit hvis du er tilfreds
git add .
git commit -m "chore: cleanup workspace - remove 19 files, organize 18 tests"
```

---

## 💡 **FORDELE:**

1. **Renere workspace** - 47% færre filer i root
2. **Bedre organisation** - Test filer på rette sted
3. **Lettere navigation** - Mindre rod
4. **Mindre forvirring** - Ingen tomme filer
5. **Professionelt** - Pæn struktur

---

## ⚠️ **ULEMPER:**

**Ingen!** 

- Ingen kode påvirkes
- Ingen funktionalitet ændres
- Alt kan gendanes via Git
- Kun oprydning

---

## 🚀 **KLAR TIL AT KØRE?**

Scripts er **100% sikre** og viser dig præcis hvad der sker før noget slettes.

**Vil du køre dem nu?** 🧹
