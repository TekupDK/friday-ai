# Brugerindstillinger - Komplet Oversigt

**Dato:** 2025-01-28  
**Status:** ✅ **FÆRDIG IMPLEMENTERET**

---

## 🎯 Hvad Jeg Har Lavet

### 1. **Implementeret Manglende Backend Endpoints** ✅

**Problem:** SettingsDialog brugte `trpc.auth.getPreferences` og `trpc.auth.updatePreferences`, men disse endpoints fandtes ikke.

**Løsning:** Tilføjet 2 nye endpoints i `server/routers/auth-router.ts`:

#### `getPreferences` Endpoint
- Henter brugerindstillinger fra database
- Mapper `desktopNotifications` → `pushNotifications` for frontend
- Henter `language` fra JSONB field
- Returnerer: `{ theme, emailNotifications, pushNotifications, language, ... }`

#### `updatePreferences` Endpoint
- Opdaterer brugerindstillinger
- Mapper `pushNotifications` → `desktopNotifications` i database
- Gemmer `language` i JSONB field
- Validerer input med Zod
- Returnerer opdaterede preferences

---

### 2. **Fixet Eksisterende Import Problem** ✅

**Problem:** `server/google-api.ts` prøvede at importere `./gmail-labels`, men filen var i `./modules/email/gmail-labels.ts`.

**Løsning:** Fixet import paths i 2 steder:
- `./gmail-labels` → `./modules/email/gmail-labels`

---

### 3. **Oprettet Tests** ✅

**Oprettet:** `server/__tests__/auth-preferences-isolated.test.ts`
- 10 test cases
- Alle 10 tests passerer ✅
- Dækker alle use cases og error handling

---

## 🎨 Hvordan Brugerindstillingerne Ser Ud

### UI Struktur

Brugerindstillingerne er tilgængelige via **SettingsDialog** - en modal dialog med følgende struktur:

```
┌─────────────────────────────────────────────────┐
│  Indstillinger                          [X]     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  🎨 Udseende                                    │
│    ┌─────────────────────────────────────┐     │
│    │ Tema                                │     │
│    │ Vælg dit foretrukne tema            │     │
│    │                    [Dark ▼]         │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  🔔 Notifikationer                              │
│    ┌─────────────────────────────────────┐     │
│    │ Email notifikationer                │     │
│    │ Modtag notifikationer via email     │     │
│    │                          [Toggle]    │     │
│    └─────────────────────────────────────┘     │
│    ┌─────────────────────────────────────┐     │
│    │ Push notifikationer                  │     │
│    │ Modtag push notifikationer           │     │
│    │                          [Toggle]    │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  🌐 Sprog                                       │
│    ┌─────────────────────────────────────┐     │
│    │ Sprog                               │     │
│    │ Vælg dit foretrukne sprog           │     │
│    │                    [Dansk ▼]        │     │
│    └─────────────────────────────────────┘     │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  🐛 Debug (kun for testing)                    │
│    ┌─────────────────────────────────────┐     │
│    │ Sentry Test                          │     │
│    │ Triggers a client-side error...      │     │
│    │                    [Trigger Error]  │     │
│    └─────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### Sektioner i SettingsDialog

#### 1. **🎨 Udseende (Appearance)**
- **Tema (Theme):**
  - Dropdown med 2 valg: "Light" (☀️) og "Dark" (🌙)
  - Ændres umiddelbart når valgt
  - Gemmes automatisk i database

#### 2. **🔔 Notifikationer (Notifications)**
- **Email Notifikationer:**
  - Toggle switch (on/off)
  - Beskrivelse: "Modtag notifikationer via email"
  - Gemmes som `emailNotifications` i database

- **Push Notifikationer:**
  - Toggle switch (on/off)
  - Beskrivelse: "Modtag push notifikationer"
  - Gemmes som `desktopNotifications` i database (mapper til `pushNotifications` i frontend)

#### 3. **🌐 Sprog (Language)**
- **Sprog:**
  - Dropdown med 2 valg: "Dansk" (da) og "English" (en)
  - Når sprog ændres, reloader siden automatisk
  - Gemmes i `preferences` JSONB field i database

#### 4. **🐛 Debug (Kun for testing)**
- **Sentry Test:**
  - Knap til at teste Sentry error tracking
  - Kun synlig i development mode

---

## 📍 Hvor Findes Indstillingerne?

### Desktop
1. **User Menu (Øverst til højre):**
   - Klik på user ikon (👤) i header
   - Vælg "Settings" fra dropdown menu
   - SettingsDialog åbner

### Mobile
1. **Mobile Menu:**
   - Klik på hamburger menu (☰)
   - Vælg "Settings" fra mobile menu sheet
   - SettingsDialog åbner

---

## 💾 Hvordan Data Gemmes

### Database Schema

```typescript
userPreferences {
  id: number                    // Auto-increment primary key
  userId: number                // Foreign key til users table
  theme: "light" | "dark"       // Default: "dark"
  emailNotifications: boolean   // Default: true
  desktopNotifications: boolean // Default: true (mapper til pushNotifications)
  preferences: jsonb           // JSON object for ekstra data (fx language)
  createdAt: timestamp         // Auto-set ved oprettelse
  updatedAt: timestamp         // Auto-updateret ved ændringer
}
```

### Field Mapping

**Frontend → Backend:**
- `pushNotifications` → `desktopNotifications` (i database)
- `language` → `preferences.language` (i JSONB field)

**Backend → Frontend:**
- `desktopNotifications` → `pushNotifications` (i response)
- `preferences.language` → `language` (i response)

---

## 🔄 Hvordan Det Fungerer

### Flow: Åbn Settings

1. **Bruger klikker på "Settings"**
   - `setShowSettingsDialog(true)` kaldes
   - SettingsDialog åbner

2. **SettingsDialog Loader Data**
   - `trpc.auth.getPreferences.useQuery()` kaldes
   - Backend henter preferences fra database
   - Hvis ingen preferences findes, oprettes default preferences
   - Data vises i UI

3. **Bruger Ændrer Indstilling**
   - F.eks. skifter theme fra "dark" til "light"
   - `handleThemeChange("light")` kaldes
   - `trpc.auth.updatePreferences.useMutation()` kaldes
   - Backend opdaterer database
   - Toast notification: "Indstillinger gemt"
   - UI opdateres

### Flow: Persistence

1. **Bruger Logger Ud**
   - Session slettes
   - Cookies cleared

2. **Bruger Logger Ind Igen**
   - Ny session oprettes
   - `getPreferences` kaldes automatisk
   - Gemte indstillinger loades
   - Theme og language anvendes automatisk

---

## ✅ Features

### Implementerede Features
- ✅ Theme toggle (light/dark)
- ✅ Language selection (da/en)
- ✅ Email notifications toggle
- ✅ Push notifications toggle
- ✅ Automatisk persistence
- ✅ Real-time updates
- ✅ Error handling
- ✅ Toast notifications
- ✅ Mobile support
- ✅ Accessibility (ARIA labels)

### Sikkerhed
- ✅ Authentication required (protectedProcedure)
- ✅ Input validation (Zod)
- ✅ Error handling
- ✅ Type safety

---

## 🧪 Test Status

**Status:** ✅ **10/10 TESTS PASSERER**

**Test Coverage:**
- ✅ getPreferences - 4 tests
- ✅ updatePreferences - 6 tests
- ✅ Error handling verificeret
- ✅ Field mapping verificeret

---

## 📝 Filer Berørt

### Backend
- ✅ `server/routers/auth-router.ts` - Tilføjet 2 endpoints
- ✅ `server/google-api.ts` - Fixet import path

### Frontend
- ✅ `client/src/components/SettingsDialog.tsx` - Eksisterende (fungerer nu)
- ✅ `client/src/pages/WorkspaceLayout.tsx` - Eksisterende (åbner SettingsDialog)

### Database
- ✅ `drizzle/schema.ts` - Eksisterende schema (fungerer)
- ✅ `server/db.ts` - Eksisterende helpers (fungerer)

### Tests
- ✅ `server/__tests__/auth-preferences-isolated.test.ts` - Ny test fil

---

## 🎉 Konklusion

**Status:** ✅ **FÆRDIG OG FUNGERENDE**

Brugerindstillingerne er nu:
- ✅ **Fuldt implementeret** - Alle endpoints fungerer
- ✅ **Testet** - 10/10 tests passerer
- ✅ **Tilgængelig** - Via user menu (desktop og mobile)
- ✅ **Persistent** - Gemmes i database
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Sikker** - Authentication required

**Systemet er klar til production!** 🚀

---

**Oprettet:** 2025-01-28  
**Status:** ✅ Komplet implementeret og testet


