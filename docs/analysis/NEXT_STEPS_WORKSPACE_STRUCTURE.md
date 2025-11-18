# Næste Steps - Workspace Structure Improvements

**Dato:** 28. januar 2025  
**Status:** Priority 1 ✅ Complete | Priority 2 🔄 Next

---

## ✅ Completed (Priority 1)

- [x] Config mappe oprettet (`config/`)
- [x] Server docs organiseret (`docs/server/templates/`)
- [x] Scripts undermapper oprettet (`scripts/dev/`, `scripts/deploy/`, `scripts/utils/`)
- [x] Tomme mapper slettet (`development-notes/`, `reports/`)

---

## 🔄 Next Steps (Priority 2)

### 1. Konsolider Root Files (Medium Priority)

**Mål:** Flyt spredte filer fra roden til relevante mapper

**Actions:**
```bash
# Flyt PowerShell scripts til scripts/
mv *.ps1 scripts/utils/  # (hvis nogen i roden)

# Flyt Python scripts til scripts/python/
mv *.py scripts/python/  # (hvis nogen i roden)

# Flyt YAML configs til config/
mv *.yaml config/  # (hvis nogen i roden)
mv *.yml config/   # (hvis nogen i roden)
```

**Files to check:**
- `fix-llama-server.ps1` → `scripts/utils/`
- `fix-markdown-lint.ps1` → `scripts/utils/`
- `reorganize-docs.ps1` → `scripts/utils/`
- `extract_google_data.py` → `scripts/python/`
- `ai-eval-config.yaml` → `config/`
- `promptfooconfig.yaml` → `config/`

**Impact:** Renere root directory, bedre organisation

---

### 2. Organiser Flere Scripts (Medium Priority)

**Mål:** Flyt flere scripts til relevante undermapper

**Actions:**
```bash
# Docs scripts → scripts/docs/
mkdir -p scripts/docs
mv scripts/auto-categorize-docs.ts scripts/docs/
mv scripts/fix-docs-links.ts scripts/docs/
mv scripts/generate-ai-components-docs.ts scripts/docs/
mv scripts/import-docs.ts scripts/docs/
mv scripts/recategorize-docs.ts scripts/docs/

# Maintenance scripts → scripts/maintenance/
mv scripts/backup-db.ps1 scripts/maintenance/
mv scripts/cleanup-*.ps1 scripts/maintenance/
mv scripts/restart-comet.ps1 scripts/maintenance/
mv scripts/organize-*.ps1 scripts/maintenance/

# Analysis scripts → scripts/analysis/ (allerede eksisterer)
# (flyt relevante scripts der allerede er i analysis/)

# Database scripts → scripts/database/ (allerede eksisterer)
# (flyt relevante scripts der allerede er i database/)
```

**Impact:** Bedre script-organisation, nemmere at finde

---

### 3. Tilføj README.md til Vigtige Mapper (Medium Priority)

**Mål:** Dokumenter mappens formål

**Actions:**
- Opret `scripts/README.md` - Forklar script-organisation
- Opret `config/README.md` - Forklar config-filer
- Opret `docs/server/README.md` - Forklar server dokumentation
- Opdater eksisterende README filer hvis nødvendigt

**Template:**
```markdown
# [Mappe Navn]

## Formål
[Beskrivelse af hvad mappen indeholder]

## Struktur
[Oversigt over undermapper]

## Usage
[Hvordan man bruger indholdet]
```

**Impact:** Bedre dokumentation, nemmere onboarding

---

## 📋 Future Improvements (Priority 3)

### 4. Archive Konsolidering (Low Priority)

**Mål:** Flyt `archive/` til `docs/archive/` for konsistens

**Actions:**
```bash
# Flyt archive/ til docs/archive/
mv archive/* docs/archive/
rmdir archive
```

**Impact:** Konsistent dokumentationsstruktur

---

### 5. Test Results Organisation (Low Priority)

**Mål:** Flyt `test-results/` til skjult mappe eller `tests/results/`

**Actions:**
```bash
# Option 1: Skjul mappen
mv test-results .test-results

# Option 2: Flyt til tests/
mv test-results tests/results
```

**Impact:** Renere root, bedre test-organisation

---

### 6. Component Organisation Review (Low Priority)

**Mål:** Overvej yderligere opdeling af `client/src/components/` (411 filer)

**Actions:**
- Review component struktur
- Overvej `components/common/` for shared components
- Overvej yderligere feature-opdeling hvis nødvendigt

**Impact:** Bedre navigering i store component-mapper

---

## 🎯 Recommended Order

1. **Konsolider Root Files** (Quick win, 15 min)
2. **Organiser Flere Scripts** (Medium effort, 30 min)
3. **Tilføj README.md** (Documentation, 20 min)
4. **Archive Konsolidering** (Low priority, 10 min)
5. **Test Results** (Low priority, 5 min)
6. **Component Review** (Future, når nødvendigt)

---

## 📊 Expected Impact

### After Priority 2:
- ✅ Root directory: Meget renere
- ✅ Scripts: Bedre organiseret
- ✅ Documentation: Bedre struktur
- ✅ Overall Score: 8.5/10 → 9.0/10

### After Priority 3:
- ✅ Complete organisation
- ✅ Industry-standard structure
- ✅ Overall Score: 9.0/10 → 9.5/10

---

## 🚀 Quick Start

For at starte med Priority 2, kør:

```bash
# 1. Konsolider root files
# (Tjek hvilke filer der faktisk er i roden først)

# 2. Organiser scripts
mkdir -p scripts/docs scripts/maintenance
# (Flyt relevante scripts)

# 3. Tilføj README.md
# (Opret README filer i vigtige mapper)
```

---

## 📝 Notes

- **Config files:** Mange config-filer er allerede i roden (drizzle.config.ts, vite.config.ts, etc.) - disse skal typisk blive i roden for at build tools kan finde dem
- **Scripts:** Nogle scripts refererer til paths - tjek om paths skal opdateres efter flytning
- **Documentation:** Opdater dokumentation hvis strukturen ændres betydeligt

---

**Næste Action:** Start med at konsolidere root files og organisere flere scripts.

