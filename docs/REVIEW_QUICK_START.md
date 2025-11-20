# Review Quick Start - Brugerindstillinger

**Tid:** ~60 minutter  
**Status:** ⏳ **KLAR TIL REVIEW**

---

## 🚀 Hurtig Start

### 1. Kør Tests (5 min)

```bash
# Kør alle relevante tests
pnpm test server/__tests__/auth-preferences-isolated.test.ts server/__tests__/security.test.ts
```

**Forventet resultat:**
```
Test Files  2 passed (2)
Tests  25 passed (25)
```

✅ **Hvis alle passerer → Fortsæt**  
❌ **Hvis fejl → Stop og fix først**

---

### 2. Code Review (15 min)

**Læs disse filer:**

1. **`server/routers/auth-router.ts`** (linje 141-245)
   - Tjek `getPreferences` og `updatePreferences` endpoints
   - Verificer field mapping og error handling

2. **`client/src/components/SettingsDialog.tsx`** (linje 40-86)
   - Tjek tRPC hooks
   - Verificer error handling

3. **`server/__tests__/auth-preferences-isolated.test.ts`**
   - Tjek test coverage
   - Verificer at alle cases er dækket

**Checkliste:**
- [ ] Code er læsbar og velkommenteret
- [ ] Type safety er korrekt
- [ ] Error handling er korrekt
- [ ] Ingen security issues

---

### 3. Manual Test i Browser (30 min)

**Start server:**
```bash
pnpm dev
```

**Test Checklist:**

#### Desktop Test
- [ ] Log ind på platformen
- [ ] Klik på user ikon (👤) i header
- [ ] Klik på "Settings"
- [ ] Verificer at SettingsDialog åbner
- [ ] Test theme toggle (dark ↔ light)
- [ ] Test language change (da ↔ en)
- [ ] Test email notifications toggle
- [ ] Test push notifications toggle
- [ ] Verificer toast notifications
- [ ] Luk dialog og åbn igen
- [ ] Verificer at indstillinger er gemt

#### Mobile Test
- [ ] Åbn på mobile device eller resize browser
- [ ] Klik på hamburger menu (☰)
- [ ] Klik på "Settings"
- [ ] Test alle indstillinger
- [ ] Verificer at UI ser godt ud

#### Persistence Test
- [ ] Ændr alle indstillinger
- [ ] Log ud
- [ ] Log ind igen
- [ ] Verificer at alle indstillinger er gemt
- [ ] Verificer at theme anvendes korrekt
- [ ] Verificer at language anvendes korrekt

#### Error Test
- [ ] Åbn browser console (F12)
- [ ] Test alle indstillinger
- [ ] Verificer at ingen fejl opstår i console

---

### 4. Security Check (5 min)

- [ ] Test at unauthenticated requests blokerer
- [ ] Verificer at input validation fungerer
- [ ] Tjek at error messages ikke eksponerer sensitive data

---

### 5. Final Check (5 min)

- [ ] Alle tests passerer
- [ ] Code review gennemført
- [ ] Manual test gennemført
- [ ] Ingen issues fundet
- [ ] **Klar til production: [ ]**

---

## ✅ Review Complete

Hvis alle checks passerer:
- ✅ **Godkendt til production**
- 📝 Dokumenter review resultat
- 🚀 Klar til at gå videre

Hvis issues fundet:
- ⚠️ **Dokumenter issues**
- 🔧 Fix issues
- 🔄 Re-test
- ✅ Godkend når alle issues er fixet

---

**Oprettet:** 2025-01-28  
**Status:** ⏳ Klar til review


