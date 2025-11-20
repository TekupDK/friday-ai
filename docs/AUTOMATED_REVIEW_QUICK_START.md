# Automatiseret Review - Quick Start

**Tid:** ~2 minutter  
**Status:** ✅ **KLAR TIL BRUG**

---

## 🚀 Hurtig Start

### Simpleste Metode

```bash
# Kør automatisk review (starter server hvis nødvendigt)
pnpm review:settings
```

**Det gør:**
1. ✅ Tjekker om server kører
2. ✅ Starter server hvis nødvendigt
3. ✅ Kører alle 7 review tests
4. ✅ Viser resultat

---

## 📊 Hvad Bliver Testet

### Automatisk (7 Tests)

1. ✅ SettingsDialog åbner korrekt
2. ✅ Theme toggle fungerer og persisterer
3. ✅ Language change fungerer og reloader
4. ✅ Notifications toggles fungerer
5. ✅ Persistence efter logout/login
6. ✅ Ingen console errors
7. ✅ API calls er korrekte

**Total tid:** ~50 sekunder

---

## ✅ Review Resultat

### Hvis Alle Tests Passerer

```
✅ All review tests passed!

📊 View detailed report:
   pnpm exec playwright show-report tests/results/reports
```

**Status:** ✅ **GODKENDT TIL PRODUCTION**

### Hvis Tests Fejler

```
❌ Some tests failed. Check report for details.

📊 View detailed report:
   pnpm exec playwright show-report tests/results/reports
```

**Status:** ⚠️ **FIX ISSUES FØRST**

---

## 🔍 Se Detaljeret Rapport

```bash
pnpm exec playwright show-report tests/results/reports
```

**Rapporten viser:**
- ✅ Alle test results
- 📸 Screenshots ved fejl
- 🎥 Videos ved fejl
- 🔍 Trace files for debugging

---

## 🛠️ Alternative Metoder

### Hvis Server Allerede Kører

```bash
# Kør tests direkte (uden at starte server)
pnpm review:settings:manual
```

### Hvis Server Har Problemer

```bash
# Start server manuelt først
pnpm dev

# I anden terminal, kør tests
pnpm review:settings:manual
```

---

## ✅ Review Complete

**Efter test kører:**

- [ ] Alle 7 tests passerer
- [ ] HTML rapport gennemgået
- [ ] Ingen kritiske issues

**Hvis alt godkendes:**
- ✅ **Klar til production**

**Hvis issues:**
- ⚠️ Fix issues
- 🔄 Re-run test
- ✅ Godkend når fixet

---

**Oprettet:** 2025-01-28  
**Status:** ✅ Klar til brug

