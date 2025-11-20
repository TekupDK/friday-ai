# Automatiseret Review Guide - Brugerindstillinger

**Dato:** 2025-01-28  
**Status:** ✅ **AUTOMATISERET TEST OPRETTET**

---

## 🎯 Hvad Jeg Har Lavet

### 1. **Oprettet Automatiseret E2E Test** ✅

**Fil:** `tests/e2e/user-settings-review.spec.ts`

**Test Coverage:**
- ✅ SettingsDialog åbner korrekt
- ✅ Theme toggle fungerer og persisterer
- ✅ Language change fungerer og reloader
- ✅ Notifications toggles fungerer
- ✅ Persistence efter logout/login
- ✅ Ingen console errors
- ✅ API calls er korrekte

**Total:** 7 automatiske tests der dækker alle review-kriterier

---

## 🚀 Sådan Kører Du Automatiseret Review

### Option 1: Med Automatisk Server Start (Anbefalet)

**Playwright starter automatisk serveren:**

```bash
# Kør automatisk review test
pnpm test:playwright tests/e2e/user-settings-review.spec.ts
```

**Hvad sker der:**
1. Playwright starter automatisk `pnpm dev` (hvis server ikke kører)
2. Vent til server er klar (max 120 sekunder)
3. Kører alle 7 tests automatisk
4. Genererer rapport

**Note:** Hvis serveren har import problemer, brug Option 2.

---

### Option 2: Med Manuelt Startet Server (Hvis Option 1 Fejler)

**Start server manuelt først:**

```bash
# Terminal 1: Start server
pnpm dev

# Vent til server er klar (du ser "Server running on port 3000")
```

**I en anden terminal:**

```bash
# Terminal 2: Kør tests (uden auto-start)
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/user-settings-review.spec.ts --project=chromium
```

**Eller med reuseExistingServer:**

```bash
# Kør test (bruger eksisterende server)
pnpm exec playwright test tests/e2e/user-settings-review.spec.ts --project=chromium
```

---

## 📊 Test Resultat Format

### Når Tests Kører

Du vil se output som:

```
Running 7 tests using 1 worker

  ✓ tests/e2e/user-settings-review.spec.ts:15:5 › User Settings Review - Automated › REVIEW: SettingsDialog should open correctly (5.2s)
  ✓ tests/e2e/user-settings-review.spec.ts:45:5 › User Settings Review - Automated › REVIEW: Theme toggle should work and persist (8.1s)
  ✓ tests/e2e/user-settings-review.spec.ts:75:5 › User Settings Review - Automated › REVIEW: Language change should work and reload page (6.3s)
  ✓ tests/e2e/user-settings-review.spec.ts:105:5 › User Settings Review - Automated › REVIEW: Notifications toggles should work (7.5s)
  ✓ tests/e2e/user-settings-review.spec.ts:145:5 › User Settings Review - Automated › REVIEW: Settings should persist after logout/login (12.3s)
  ✓ tests/e2e/user-settings-review.spec.ts:215:5 › User Settings Review - Automated › REVIEW: No console errors when using settings (4.8s)
  ✓ tests/e2e/user-settings-review.spec.ts:250:5 › User Settings Review - Automated › REVIEW: API calls should be correct (5.1s)

  7 passed (49.3s)
```

### Hvis Tests Fejler

Tests vil vise:
- Screenshot ved fejl
- Video ved fejl
- Trace filer for debugging
- Detaljerede error messages

---

## 🔍 Hvad Tests Verificerer

### Test 1: SettingsDialog Åbner
- ✅ Dialog åbner når Settings klikkes
- ✅ Alle sektioner er synlige
- ✅ Dialog title er korrekt

### Test 2: Theme Toggle
- ✅ Theme kan ændres
- ✅ Toast notification vises
- ✅ Theme gemmes korrekt
- ✅ Theme loades efter genåbning

### Test 3: Language Change
- ✅ Language kan ændres
- ✅ Siden reloader korrekt
- ✅ Language gemmes korrekt

### Test 4: Notifications
- ✅ Email notifications toggle fungerer
- ✅ Push notifications toggle fungerer
- ✅ Toast notifications vises
- ✅ Settings gemmes korrekt

### Test 5: Persistence (Vigtigst)
- ✅ Alle indstillinger gemmes
- ✅ Indstillinger loades efter logout/login
- ✅ Ingen data loss

### Test 6: Error Handling
- ✅ Ingen console errors
- ✅ Ingen page errors
- ✅ Systemet crasher ikke

### Test 7: API Calls
- ✅ getPreferences kaldes korrekt
- ✅ updatePreferences kaldes korrekt
- ✅ API responses er korrekte

---

## 📝 Review Rapport

### Efter Tests Kører

**Se HTML Rapport:**
```bash
pnpm exec playwright show-report tests/results/reports
```

**Rapporten viser:**
- Alle test results
- Screenshots ved fejl
- Videos ved fejl
- Trace files for debugging
- Performance metrics

---

## 🛠️ Troubleshooting

### Problem: Server Starter Ikke Automatisk

**Løsning:**
- Start server manuelt først
- Brug Option 2 ovenfor

### Problem: Tests Fejler Med Timeout

**Løsning:**
- Tjek at server kører korrekt
- Tjek at port 3000 er tilgængelig
- Øg timeout i `playwright.config.ts` hvis nødvendigt

### Problem: Selectors Findes Ikke

**Løsning:**
- Tjek at UI er korrekt implementeret
- Opdater selectors i test filen
- Brug Playwright's codegen til at finde korrekte selectors:
  ```bash
  pnpm exec playwright codegen http://localhost:3000
  ```

---

## ✅ Review Complete Checklist

Efter automatiseret test:

- [ ] Alle 7 tests passerer
- [ ] Ingen console errors
- [ ] Ingen API errors
- [ ] Persistence verificeret
- [ ] HTML rapport gennemgået

**Hvis alle tests passerer:**
- ✅ **Godkendt til production**

**Hvis tests fejler:**
- ⚠️ Fix issues
- 🔄 Re-run tests
- ✅ Godkend når alle passerer

---

## 🎯 Næste Steps

### Efter Automatiseret Review

1. **Hvis alle tests passerer:**
   - ✅ Review er gennemført
   - ✅ Systemet er klar til production
   - 📝 Dokumenter review resultat

2. **Hvis tests fejler:**
   - ⚠️ Analyser fejl i HTML rapport
   - 🔧 Fix issues
   - 🔄 Re-run tests
   - ✅ Godkend når fixet

---

## 📚 Relaterede Filer

- `tests/e2e/user-settings-review.spec.ts` - Automatiseret test
- `docs/REVIEW_STEP_BY_STEP.md` - Manual review guide
- `docs/REVIEW_QUICK_START.md` - Quick start guide

---

**Oprettet:** 2025-01-28  
**Status:** ✅ Automatiseret test klar til brug


