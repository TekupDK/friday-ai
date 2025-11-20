# Review Step-by-Step - Live Guide

**Dato:** 2025-01-28  
**Status:** 🔄 **REVIEW I GANG**

---

## ✅ Step 1: Test Verification - FÆRDIG

**Resultat:**
```
✓ server/__tests__/auth-preferences-isolated.test.ts (10 tests) 6ms
 Test Files  1 passed (1)
      Tests  10 passed (10)
```

**Status:** ✅ **ALLE TESTS PASSERER**

---

## 📝 Step 2: Code Review - GENNEMGÅET

### Backend Code Review

**Fil:** `server/routers/auth-router.ts`

#### ✅ getPreferences Endpoint (linje 145-169)

**Verificeret:**
- ✅ Bruger `protectedProcedure` (kræver authentication)
- ✅ Tjekker `ctx.user?.id` før database call
- ✅ Håndterer null preferences korrekt
- ✅ Mapper `desktopNotifications` → `pushNotifications` ✅
- ✅ Henter `language` fra JSONB field ✅
- ✅ Returnerer korrekt format

**Kode Kvalitet:** ✅ **GOD**

#### ✅ updatePreferences Endpoint (linje 175-245)

**Verificeret:**
- ✅ Bruger `protectedProcedure` (kræver authentication)
- ✅ Zod validation for input (linje 177-184)
- ✅ Tjekker `ctx.user?.id` før update
- ✅ Mapper `pushNotifications` → `desktopNotifications` korrekt
- ✅ Merger eksisterende preferences korrekt (linje 218-221)
- ✅ Gemmer `language` i JSONB field
- ✅ Returnerer data i samme format som getPreferences
- ✅ Error handling korrekt

**Kode Kvalitet:** ✅ **GOD**

### Frontend Code Review

**Fil:** `client/src/components/SettingsDialog.tsx`

#### ✅ tRPC Integration (linje 40-86)

**Verificeret:**
- ✅ Bruger `trpc.auth.getPreferences.useQuery()` korrekt
- ✅ Bruger `trpc.auth.updatePreferences.useMutation()` korrekt
- ✅ `enabled: open` - kun loader når dialog åbner ✅
- ✅ State management korrekt (linje 34-38)
- ✅ useEffect syncer preferences korrekt (linje 48-74)
- ✅ Error handling med toast notifications (linje 83-85)
- ✅ Success feedback med toast (linje 80)

**Kode Kvalitet:** ✅ **GOD**

---

## 🧪 Step 3: Manual Test - NÆSTE STEP

### Test Environment Setup

**Status:** ⏳ **KLAR TIL TEST**

**Commands:**
```bash
# Start development server
pnpm dev
```

**Når serveren kører:**
1. Åbn browser: `http://localhost:5173` (eller den port der vises)
2. Log ind på platformen
3. Følg test cases nedenfor

### Test Cases

#### Test 1: SettingsDialog Åbner ✅
**Steps:**
1. Klik på user ikon (👤) i header (øverst til højre)
2. Klik på "Settings"
3. Verificer at SettingsDialog åbner

**Forventet:**
- ✅ Dialog åbner
- ✅ Alle sektioner vises (Appearance, Notifications, Language)
- ✅ Nuværende indstillinger vises korrekt

**Status:** [ ] Testet

---

#### Test 2: Theme Toggle ✅
**Steps:**
1. I SettingsDialog, find "Tema" sektionen
2. Skift fra "dark" til "light" (eller omvendt)
3. Observer:
   - Theme ændres umiddelbart
   - Toast notification: "Indstillinger gemt"
4. Luk dialog (klik udenfor eller X)
5. Åbn Settings igen
6. Verificer at theme er gemt

**Forventet:**
- ✅ Theme ændres umiddelbart
- ✅ Toast notification vises
- ✅ Theme er gemt efter genåbning

**Status:** [ ] Testet

---

#### Test 3: Language Change ✅
**Steps:**
1. I SettingsDialog, find "Sprog" sektionen
2. Skift fra "da" til "en" (eller omvendt)
3. Observer:
   - Siden reloader automatisk
   - Language er ændret
4. Åbn Settings igen
5. Verificer at language er gemt

**Forventet:**
- ✅ Siden reloader efter language change
- ✅ Language er gemt efter reload
- ✅ UI tekst er på det valgte sprog

**Status:** [ ] Testet

---

#### Test 4: Notifications ✅
**Steps:**
1. I SettingsDialog, find "Notifikationer" sektionen
2. Toggle "Email notifikationer" (on/off)
3. Observer toast notification
4. Toggle "Push notifikationer" (on/off)
5. Observer toast notification
6. Luk dialog og åbn igen
7. Verificer at settings er gemt

**Forventet:**
- ✅ Toggles virker
- ✅ Toast notifications vises
- ✅ Settings er gemt efter genåbning

**Status:** [ ] Testet

---

#### Test 5: Persistence (Vigtigst) ✅
**Steps:**
1. I SettingsDialog, ændr ALLE indstillinger:
   - Theme: "light"
   - Language: "en"
   - Email notifications: off
   - Push notifications: on
2. Verificer at alle er gemt (toast notifications)
3. **Log ud** (fra user menu)
4. **Log ind igen**
5. Åbn Settings
6. Verificer at ALLE indstillinger er gemt:
   - Theme skal være "light"
   - Language skal være "en"
   - Email notifications skal være off
   - Push notifications skal være on

**Forventet:**
- ✅ Alle indstillinger gemmes
- ✅ Alle indstillinger loades efter logout/login
- ✅ Theme anvendes korrekt
- ✅ Language anvendes korrekt

**Status:** [ ] Testet

---

#### Test 6: Error Handling ✅
**Steps:**
1. Åbn browser console (F12)
2. Gå til "Console" tab
3. Test alle indstillinger (theme, language, notifications)
4. Observer console for fejl
5. Gå til "Network" tab
6. Test indstillinger igen
7. Verificer API calls:
   - `auth.getPreferences` - GET request
   - `auth.updatePreferences` - POST request

**Forventet:**
- ✅ Ingen console errors
- ✅ API calls er korrekte
- ✅ Responses er korrekte

**Status:** [ ] Testet

---

## 🔒 Step 4: Security Review - VERIFICERET

**Status:** ✅ **GODKENDT**

**Verificeret:**
- ✅ Authentication required (`protectedProcedure`)
- ✅ Input validation (Zod)
- ✅ Error handling korrekt
- ✅ Ingen sensitive data eksponeres

---

## 📊 Review Resultat

### ✅ Completed
- [x] Test verification (10/10 passerer)
- [x] Code review (Backend + Frontend)
- [x] Security review

### ⏳ Pending
- [ ] Manual test i browser
- [ ] Persistence test
- [ ] Error handling test

### Final Status
- [ ] ✅ Godkendt til production
- [ ] ⚠️ Issues skal fixes først
- [ ] 🔄 Review i gang

---

**Næste Step:** Kør manual tests i browser

---

**Oprettet:** 2025-01-28  
**Status:** 🔄 Review i gang - Step 3 pending


