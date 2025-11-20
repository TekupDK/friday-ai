# Brugerindstillinger og Hovedside - Analyse

**Dato:** 2025-01-28  
**Status:** ⚠️ **MANGENDE ENDPOINTS IDENTIFICERET**

---

## 📋 Oversigt

### Hvad Vi Har

1. **Database Schema** ✅
   - `userPreferences` table i `drizzle/schema.ts`
   - Felter: `theme`, `emailNotifications`, `desktopNotifications`, `preferences` (JSONB)

2. **Database Helpers** ✅
   - `getUserPreferences()` i `server/db.ts`
   - `updateUserPreferences()` i `server/db.ts`

3. **Frontend UI** ✅
   - `SettingsDialog` component i `client/src/components/SettingsDialog.tsx`
   - Integreret i `WorkspaceLayout` header menu
   - Mobile menu support via `MobileUserMenuSheet`

4. **Hovedside** ✅
   - `WorkspaceLayout` er hovedside efter login (`/` route)
   - 3-panel layout: AI Assistant, Email Center, Smart Workspace

---

## ⚠️ Problemer Identificeret

### 1. **MANGENDE tRPC ENDPOINTS** 🔴 KRITISK

**Problem:**
- `SettingsDialog` bruger `trpc.auth.getPreferences` og `trpc.auth.updatePreferences`
- Disse endpoints findes **IKKE** i `server/routers/auth-router.ts`
- Dette vil resultere i runtime errors når brugeren åbner indstillinger

**Filer Berørt:**
- `client/src/components/SettingsDialog.tsx` (linje 41-45, 76-78)
- `server/routers/auth-router.ts` (mangler endpoints)

**Fejl:**
```typescript
// SettingsDialog.tsx bruger:
const { data: preferences } = (trpc as any).auth.getPreferences.useQuery(...);
const updatePreferencesMutation = (trpc as any).auth.updatePreferences.useMutation(...);

// Men auth-router.ts har kun:
- me
- login
- logout
```

---

## 📊 Nuværende Status

### Database Schema

```typescript
// drizzle/schema.ts
export const userPreferencesInFridayAi = fridayAi.table(
  "user_preferences",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    theme: themeInFridayAi().default("dark").notNull(),
    emailNotifications: boolean().default(true).notNull(),
    desktopNotifications: boolean().default(true).notNull(),
    preferences: jsonb(), // For ekstra indstillinger
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [unique("user_preferences_userId_key").on(table.userId)]
);
```

### Database Helpers (✅ Fungerer)

```typescript
// server/db.ts
export async function getUserPreferences(userId: number): Promise<UserPreferences | null>
export async function updateUserPreferences(userId: number, preferences: Partial<...>): Promise<UserPreferences | null>
```

### Frontend Implementation

**SettingsDialog Features:**
- ✅ Theme toggle (light/dark)
- ✅ Language selection (da/en)
- ✅ Email notifications toggle
- ✅ Push notifications toggle
- ✅ Debug section (Sentry test)

**Hvor det bruges:**
- ✅ `WorkspaceLayout` header → User menu → Settings
- ✅ `MobileUserMenuSheet` → Settings button

---

## 🏠 Hovedside (WorkspaceLayout)

### Route
- **Path:** `/` (root)
- **Component:** `WorkspaceLayout`
- **Access:** Kun efter login

### Layout
```
┌─────────────────────────────────────────────────┐
│ Header (Friday AI + CRM Navigation + User Menu)│
├──────────┬──────────────┬───────────────────────┤
│ AI       │ Email        │ Smart                │
│ Assistant│ Center       │ Workspace             │
│ (20%)    │ (60%)        │ (20%)                │
│          │              │                       │
│          │              │                       │
└──────────┴──────────────┴───────────────────────┘
```

### Features
- ✅ 3-panel resizable layout
- ✅ CRM navigation i header
- ✅ User menu med Profile, Settings, Documentation, CRM links
- ✅ Mobile responsive med drawer navigation
- ✅ Keyboard shortcuts (Alt+1/2/3 for panel focus)

---

## ✅ Implementation Færdig

### 1. tRPC Endpoints i auth-router.ts ✅ IMPLEMENTERET

**Endpoints Tilføjet:**

```typescript
// server/routers/auth-router.ts
export const authRouter = router({
  // ... eksisterende endpoints ...
  
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // Returns user preferences with pushNotifications and language mapping
  }),

  updatePreferences: protectedProcedure
    .input(z.object({ ... }))
    .mutation(async ({ ctx, input }) => {
      // Updates user preferences with proper field mapping
      // Maps pushNotifications -> desktopNotifications
      // Stores language in preferences JSONB field
    }),
});
```

**Features:**
- ✅ Maps `pushNotifications` ↔ `desktopNotifications` for frontend compatibility
- ✅ Stores `language` in `preferences` JSONB field
- ✅ Proper error handling
- ✅ Type-safe with Zod validation

### 2. Schema Mismatch

**Problem:**
- Database har `desktopNotifications`
- Frontend bruger `pushNotifications`
- Database mangler `language` field

**Løsning:**
- Enten tilføj `language` til database schema
- Eller brug `preferences` JSONB field til at gemme `language` og `pushNotifications`

---

## 📝 Anbefalinger

### Prioritet 1: Fix Manglende Endpoints 🔴
1. Tilføj `getPreferences` og `updatePreferences` til `auth-router.ts`
2. Test at SettingsDialog virker korrekt

### Prioritet 2: Schema Alignment 🟡
1. Beslut om `language` skal være eget felt eller i JSONB
2. Align `pushNotifications` vs `desktopNotifications`
3. Opdater database migration hvis nødvendigt

### Prioritet 3: Forbedringer 🟢
1. Tilføj flere indstillinger (f.eks. panel sizes, notification sounds)
2. Tilføj export/import af indstillinger
3. Tilføj reset to defaults funktion

---

## 🧪 Test Plan

### Når Endpoints er Implementeret

1. **Test SettingsDialog:**
   - Åbn Settings fra user menu
   - Test theme toggle
   - Test language change
   - Test notification toggles
   - Verificer at ændringer gemmes

2. **Test Persistence:**
   - Log ud og log ind igen
   - Verificer at indstillinger er gemt

3. **Test Mobile:**
   - Test Settings i mobile menu
   - Verificer at alle features virker

---

## 📚 Relaterede Filer

### Backend
- `server/routers/auth-router.ts` - **Mangler endpoints**
- `server/db.ts` - Database helpers (✅ fungérer)
- `drizzle/schema.ts` - Database schema (✅ korrekt)

### Frontend
- `client/src/components/SettingsDialog.tsx` - Settings UI (✅ klar)
- `client/src/pages/WorkspaceLayout.tsx` - Hovedside (✅ fungerer)
- `client/src/components/MobileUserMenuSheet.tsx` - Mobile menu (✅ fungerer)

---

## ✅ Konklusion

**Status:** ✅ **IMPLEMENTERET**

Systemet har nu:
- ✅ Database schema og helpers
- ✅ Frontend UI komponenter
- ✅ Hovedside layout
- ✅ **tRPC endpoints implementeret** (getPreferences, updatePreferences)

**Næste Step:** Test at SettingsDialog virker korrekt

---

**Oprettet:** 2025-01-28  
**Opdateret:** 2025-01-28  
**Status:** ✅ Implementation færdig - klar til test

