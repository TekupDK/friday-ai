# Login Portal/Platform - Komplet Filoversigt

**Dato:** 2025-01-28  
**Status:** Production-ready  
**Oversigt:** Alle filer relateret til login portal/platform

---

## 📁 Frontend Filer (Client)

### Hovedkomponenter

#### 1. `client/src/pages/LoginPage.tsx` (444 linjer)
**Hovedlogin-side**
- Email/password form
- Google OAuth button
- Forgot password link
- Loading states med animationer
- Success overlay
- Preview mode support
- Supabase session bridge

**Features:**
- Futuristic AI Canvas baggrund
- Glassmorphism design
- Accessibility (ARIA labels)
- Responsive design
- Error handling
- Auto-redirect efter login

#### 2. `client/src/components/LoginDialog.tsx` (83 linjer)
**Login dialog komponent**
- Simpel dialog variant
- Brugt til embedded login
- Customizable title/logo
- Controlled/uncontrolled state

### Hooks & Utilities

#### 3. `client/src/_core/hooks/useAuth.ts` (82 linjer)
**Authentication hook**
- `useAuth()` hook for auth state
- User query via tRPC
- Logout mutation
- Auto-redirect option
- LocalStorage caching

**API:**
```typescript
const { user, loading, error, isAuthenticated, refresh, logout } = useAuth({
  redirectOnUnauthenticated: false,
  redirectPath: "/login"
});
```

#### 4. `client/src/lib/supabaseClient.ts`
**Supabase client setup**
- Supabase client initialization
- OAuth configuration
- Session management

### Tests

#### 5. `client/src/__tests__/auth-refresh.test.ts` (467 linjer)
**Auth refresh tests**
- JSON parsing tests
- Error handling tests
- Network error tests
- Edge cases

#### 6. `client/src/__tests__/accessibility/LoginPage.a11y.test.tsx`
**Accessibility tests**
- ARIA labels
- Keyboard navigation
- Screen reader support

#### 7. `client/src/pages/__tests__/LoginPage.test.tsx`
**LoginPage unit tests**
- Component rendering
- Form submission
- Error handling

---

## 📁 Backend Filer (Server)

### Core Authentication

#### 8. `server/_core/oauth.ts` (260 linjer)
**OAuth & Dev Login Endpoint**
- Dev login endpoint (`/api/auth/login`)
- Session refresh endpoint (`/api/auth/refresh`)
- OAuth callback handler
- Production blocking
- Session cookie management

**Endpoints:**
- `GET /api/auth/login` - Dev auto-login (development only)
- `POST /api/auth/refresh` - Silent session refresh

#### 9. `server/routers/auth-router.ts` (134 linjer)
**tRPC Auth Router**
- `auth.me` - Get current user
- `auth.login` - Email/password login (dev only)
- `auth.logout` - Logout user

**Security Features:**
- Rate limiting (5 attempts per 15 min)
- Email enumeration prevention
- Timing attack prevention
- Production blocking
- Login method validation

#### 10. `server/routes/auth-supabase.ts` (125 linjer)
**Supabase OAuth Integration**
- `POST /api/auth/supabase/complete` - OAuth callback
- Google OAuth token verification
- User creation/update
- Session cookie setting
- Pending user handling

### Session & Cookie Management

#### 11. `server/_core/cookies.ts` (69 linjer)
**Cookie Security Configuration**
- `getSessionCookieOptions()` - Secure cookie settings
- Production/development modes
- HTTPS enforcement
- SameSite configuration
- Domain handling

**Cookie Settings:**
- `httpOnly: true` - JavaScript kan ikke læse
- `secure: true` (production) - Kun HTTPS
- `sameSite: "strict"` (production) - CSRF protection
- `maxAge: 7 days` (production) / `1 year` (dev)

#### 12. `server/_core/sdk.ts`
**Session SDK**
- `createSessionToken()` - Opret JWT session token
- `verifySessionWithExp()` - Verificer session med expiry
- `authenticateRequest()` - Authenticate HTTP requests
- Session expiry management

### Admin & User Management

#### 13. `server/routers/admin-user-router.ts` (435 linjer)
**Admin User Management**
- `admin.users.list` - List users
- `admin.users.get` - Get user by ID
- `admin.users.create` - Create user (pre-activation)
- `admin.users.update` - Update user
- `admin.users.delete` - Delete user

**Features:**
- Role-based access control
- Pre-created user support
- LoginMethod type safety

---

## 📁 Shared Types & Constants

#### 14. `shared/types.ts`
**Type Definitions**
- `LoginMethod` type: `"google" | "oauth" | "email" | "dev" | null`
- Shared type exports
- Billy.dk invoice types

#### 15. `shared/const.ts` (7 linjer)
**Constants**
- `COOKIE_NAME` - Session cookie name
- `ONE_YEAR_MS` - Dev session expiry
- `SEVEN_DAYS_MS` - Production session expiry
- `UNAUTHED_ERR_MSG` - Unauthorized error message
- `NOT_ADMIN_ERR_MSG` - Not admin error message

---

## 📁 Tests

### Security Tests

#### 16. `server/__tests__/dev-login-security.test.ts` (194 linjer)
**Dev Login Security Tests**
- Production blocking tests
- Development mode tests
- Test mode query params
- User agent tests

#### 17. `server/__tests__/security.test.ts` (142 linjer)
**Security Regression Tests**
- Error sanitization
- Input validation
- SQL injection prevention
- XSS prevention
- Authentication security
- Session cookie security
- CSRF protection

### E2E Tests

#### 18. `tests/e2e/login-flow.spec.ts`
**End-to-end login flow tests**
- Complete login flow
- OAuth flow
- Error scenarios

#### 19. `tests/login-ui.spec.ts`
**UI Tests**
- Login page rendering
- Form interactions
- Button clicks

#### 20. `tests/dev-login-test.spec.ts`
**Dev Login Tests**
- Dev endpoint tests
- Auto-login tests

#### 21. `tests/login-cookie-test.ts`
**Cookie Tests**
- Cookie setting
- Cookie security
- Cookie expiry

#### 22. `tests/ai/login-canvas-visual.test.ts`
**Visual Tests**
- Canvas rendering
- Animation tests

#### 23. `tests/ai/login-mobile-view.test.ts`
**Mobile Tests**
- Responsive design
- Touch interactions

#### 24. `tests/ai/friday-login.test.ts`
**AI Integration Tests**
- Login with AI features

---

## 📁 Database Schema

#### 25. `drizzle/schema.ts`
**Users Table Schema**
```typescript
export const usersInFridayAi = fridayAi.table("users", {
  id: serial().primaryKey().notNull(),
  openId: varchar({ length: 64 }).notNull(),
  name: text(),
  email: varchar({ length: 320 }),
  loginMethod: varchar({ length: 64 }), // "google" | "oauth" | "email" | "dev" | null
  role: userRoleInFridayAi().default("user").notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  lastSignedIn: timestamp({ mode: "string" }).defaultNow().notNull(),
});
```

---

## 📁 Documentation

#### 26. `docs/LOGIN_SYSTEM_ANALYSE.md` (557 linjer)
**Komplet login system analyse**
- Security analyse
- Flow dokumentation
- Issues & forbedringer
- Anbefalinger

#### 27. `docs/LOGIN_PORTAL_FILE_STRUCTURE.md` (denne fil)
**Filoversigt**
- Komplet liste over alle filer
- Beskrivelse af hver fil
- Struktur og organisation

---

## 📊 Filstatistik

### Frontend
- **Hovedkomponenter:** 2 filer (LoginPage, LoginDialog)
- **Hooks:** 1 fil (useAuth)
- **Tests:** 3 filer
- **Total:** ~600 linjer kode

### Backend
- **Routers:** 2 filer (auth-router, admin-user-router)
- **Routes:** 1 fil (auth-supabase)
- **Core:** 3 filer (oauth, cookies, sdk)
- **Tests:** 2 filer
- **Total:** ~1,200 linjer kode

### Shared
- **Types:** 1 fil (LoginMethod type)
- **Constants:** 1 fil
- **Total:** ~20 linjer

### Tests
- **Security tests:** 2 filer
- **E2E tests:** 6 filer
- **Total:** ~1,000 linjer tests

### Documentation
- **Analyser:** 1 fil (557 linjer)
- **Struktur:** 1 fil (denne fil)

---

## 🔗 Integration Points

### Frontend → Backend
- `LoginPage.tsx` → `trpc.auth.login.useMutation()`
- `LoginPage.tsx` → `supabase.auth.signInWithOAuth()`
- `useAuth.ts` → `trpc.auth.me.useQuery()`
- `useAuth.ts` → `trpc.auth.logout.useMutation()`

### Backend → Database
- `auth-router.ts` → `users` table
- `auth-supabase.ts` → `users` table
- `admin-user-router.ts` → `users` table

### Backend → External Services
- `auth-supabase.ts` → Supabase OAuth
- `oauth.ts` → Session management
- `cookies.ts` → Cookie security

---

## 🎯 Key Features Implemented

### Security
✅ Rate limiting (5 attempts per 15 min)  
✅ Email enumeration prevention  
✅ Timing attack prevention  
✅ Secure cookies (httpOnly, secure, sameSite)  
✅ Production blocking (email/password, dev login)  
✅ Session expiry (7 days production, 1 year dev)  
✅ Rolling session refresh  

### UX
✅ Moderne design (glassmorphism, animations)  
✅ Loading states med tydelige beskeder  
✅ Success feedback  
✅ Error handling  
✅ Accessibility (ARIA labels)  
✅ Responsive design  
✅ Auto-redirect efter login  

### Developer Experience
✅ Type safety (LoginMethod type)  
✅ Konsistent environment checks  
✅ Test coverage  
✅ Dokumentation  
✅ Error boundaries  

---

## 📝 Noter

- **Email/password login:** Kun i development, blokeret i production
- **Google OAuth:** Primær login metode i production
- **Dev login:** Auto-login endpoint, kun i development
- **Session management:** 7-dages expiry i production, rolling refresh
- **Type safety:** LoginMethod type for bedre type checking

---

**Sidst Opdateret:** 2025-01-28  
**Vedligeholdt af:** TekupDK Development Team

