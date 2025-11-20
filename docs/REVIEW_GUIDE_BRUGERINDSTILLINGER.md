# Review Guide - Brugerindstillinger

**Dato:** 2025-01-28  
**Status:** ⏳ **KLAR TIL REVIEW**

---

## 🎯 Review Mål

Før vi går videre, skal vi verificere at:
1. ✅ Implementation er korrekt
2. ✅ Tests passerer
3. ✅ UI fungerer i browser
4. ✅ Ingen regression
5. ✅ Code quality er god

---

## 📋 Review Checkliste

### 1. Code Review

#### Backend Review
- [ ] **`server/routers/auth-router.ts`**
  - [ ] `getPreferences` endpoint implementeret korrekt
  - [ ] `updatePreferences` endpoint implementeret korrekt
  - [ ] Field mapping korrekt (pushNotifications ↔ desktopNotifications)
  - [ ] JSONB handling korrekt (language)
  - [ ] Error handling korrekt
  - [ ] Type safety korrekt

- [ ] **`server/google-api.ts`**
  - [ ] Import paths fixet korrekt
  - [ ] Ingen breaking changes

#### Frontend Review
- [ ] **`client/src/components/SettingsDialog.tsx`**
  - [ ] Bruger korrekte tRPC endpoints
  - [ ] Error handling korrekt
  - [ ] UI opdateres korrekt
  - [ ] Toast notifications fungerer

#### Database Review
- [ ] **`drizzle/schema.ts`**
  - [ ] Schema er korrekt
  - [ ] Alle felter er korrekte

- [ ] **`server/db.ts`**
  - [ ] `getUserPreferences` fungerer
  - [ ] `updateUserPreferences` fungerer

---

### 2. Test Review

#### Automatiske Tests
- [ ] **Kør alle tests:**
  ```bash
  pnpm test server/__tests__/auth-preferences-isolated.test.ts
  pnpm test server/__tests__/security.test.ts
  ```
- [ ] Verificer at alle tests passerer
- [ ] Verificer at ingen regression

#### Manual Tests (Browser)
- [ ] **Test SettingsDialog:**
  - [ ] Åbn Settings fra user menu (desktop)
  - [ ] Åbn Settings fra mobile menu
  - [ ] Verificer at dialog åbner korrekt
  - [ ] Verificer at indstillinger vises korrekt

- [ ] **Test Theme Toggle:**
  - [ ] Skift fra "dark" til "light"
  - [ ] Verificer at theme ændres umiddelbart
  - [ ] Luk dialog og åbn igen
  - [ ] Verificer at theme er gemt

- [ ] **Test Language Change:**
  - [ ] Skift fra "da" til "en"
  - [ ] Verificer at siden reloader
  - [ ] Verificer at language er ændret
  - [ ] Åbn Settings igen
  - [ ] Verificer at language er gemt

- [ ] **Test Notifications:**
  - [ ] Toggle email notifications
  - [ ] Toggle push notifications
  - [ ] Luk dialog og åbn igen
  - [ ] Verificer at settings er gemt

- [ ] **Test Persistence:**
  - [ ] Ændr alle indstillinger
  - [ ] Log ud
  - [ ] Log ind igen
  - [ ] Verificer at alle indstillinger er gemt

- [ ] **Test Error Handling:**
  - [ ] Åbn browser console
  - [ ] Test alle indstillinger
  - [ ] Verificer at ingen fejl opstår
  - [ ] Test med invalid input (hvis muligt)

---

### 3. Security Review

- [ ] **Authentication:**
  - [ ] Endpoints kræver authentication (protectedProcedure)
  - [ ] Unauthenticated requests blokerer korrekt

- [ ] **Input Validation:**
  - [ ] Zod validation fungerer
  - [ ] Invalid input håndteres korrekt

- [ ] **Error Messages:**
  - [ ] Fejl vises korrekt til brugeren
  - [ ] Ingen sensitive data eksponeres

---

### 4. Performance Review

- [ ] **Database Queries:**
  - [ ] Ingen N+1 queries
  - [ ] Queries er optimerede

- [ ] **Frontend Performance:**
  - [ ] SettingsDialog loader hurtigt
  - [ ] Ingen unødvendige re-renders

---

### 5. UX Review

- [ ] **UI/UX:**
  - [ ] SettingsDialog ser godt ud
  - [ ] Alle indstillinger er tydelige
  - [ ] Feedback er tydeligt (toast notifications)
  - [ ] Mobile experience er god

- [ ] **Accessibility:**
  - [ ] ARIA labels er korrekte
  - [ ] Keyboard navigation fungerer
  - [ ] Screen reader support

---

## 🔍 Review Steps

### Step 1: Code Review (15 min)

1. **Læs gennem implementerede filer:**
   - `server/routers/auth-router.ts` (linje 141-245)
   - `client/src/components/SettingsDialog.tsx` (eksisterende)
   - `server/__tests__/auth-preferences-isolated.test.ts` (ny)

2. **Verificer:**
   - Code quality
   - Type safety
   - Error handling
   - Kommentarer

### Step 2: Test Review (10 min)

1. **Kør automatiske tests:**
   ```bash
   pnpm test server/__tests__/auth-preferences-isolated.test.ts
   ```

2. **Verificer:**
   - Alle tests passerer
   - Ingen regression

### Step 3: Manual Test i Browser (20 min)

1. **Start development server:**
   ```bash
   pnpm dev
   ```

2. **Test alle features:**
   - Følg manual test checkliste ovenfor
   - Dokumenter eventuelle issues

### Step 4: Security Review (10 min)

1. **Verificer:**
   - Authentication requirements
   - Input validation
   - Error handling

### Step 5: Final Review (5 min)

1. **Opsummer:**
   - Alle checks passerer
   - Ingen issues fundet
   - Klar til production

---

## 📝 Review Template

### Code Review Notes

**Backend:**
- [ ] ✅ Korrekt
- [ ] ⚠️ Issues fundet: _________________

**Frontend:**
- [ ] ✅ Korrekt
- [ ] ⚠️ Issues fundet: _________________

**Tests:**
- [ ] ✅ Alle passerer
- [ ] ⚠️ Issues fundet: _________________

**Manual Test:**
- [ ] ✅ Fungerer korrekt
- [ ] ⚠️ Issues fundet: _________________

**Security:**
- [ ] ✅ Korrekt
- [ ] ⚠️ Issues fundet: _________________

**Performance:**
- [ ] ✅ Korrekt
- [ ] ⚠️ Issues fundet: _________________

**UX:**
- [ ] ✅ Korrekt
- [ ] ⚠️ Issues fundet: _________________

---

## 🚨 Kritiske Checks

### Må IKKE Gå Videre Hvis:

1. ❌ Tests fejler
2. ❌ Security issues fundet
3. ❌ Breaking changes
4. ❌ Data loss risiko
5. ❌ Performance issues

### Kan Gå Videre Hvis:

1. ✅ Alle tests passerer
2. ✅ Ingen security issues
3. ✅ Ingen breaking changes
4. ✅ Manual test passerer
5. ✅ Code quality er god

---

## 📊 Review Status

### Pre-Review Status
- ✅ Implementation færdig
- ✅ Tests oprettet (10/10 passerer)
- ✅ Code quality god
- ⏳ **Mangler: Manual test i browser**

### Post-Review Status
- [ ] Code review gennemført
- [ ] Tests verificeret
- [ ] Manual test gennemført
- [ ] Security review gennemført
- [ ] Performance review gennemført
- [ ] UX review gennemført
- [ ] **Klar til production: [ ]**

---

## 🎯 Anbefalinger

### Før Review
1. ✅ Læs gennem denne guide
2. ✅ Forbered test environment
3. ✅ Have browser klar til manual test

### Under Review
1. ✅ Følg checkliste systematisk
2. ✅ Dokumenter alle issues
3. ✅ Test både desktop og mobile

### Efter Review
1. ✅ Fix eventuelle issues
2. ✅ Re-test efter fixes
3. ✅ Dokumenter review resultat

---

## 📚 Relaterede Dokumenter

- `docs/USER_SETTINGS_IMPLEMENTATION_COMPLETE.md` - Implementation detaljer
- `docs/USER_SETTINGS_TESTS_COMPLETE.md` - Test results
- `docs/BRUGERINDSTILLINGER_KOMPLET_OVERSIGT.md` - Komplet oversigt

---

**Oprettet:** 2025-01-28  
**Status:** ⏳ Klar til review

