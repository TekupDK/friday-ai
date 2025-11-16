## Forudsætninger

- Supabase: Google provider Enabled, URL Configuration indeholder `http://localhost:3000/` og produktionsdomæner.
- Nøgler: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client). `SUPABASE_SERVICE_ROLE_KEY` (server) til server‑side verifikation.

## Klient (LoginPage)

- Initialiser Supabase klient med env nøgler og guard når nøgler mangler.
- Tilføj "Sign in with Google" knap der kalder `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } })`.
- Efter redirect: Hent Supabase session (`supabase.auth.getSession()`), udtræk `access_token`.
- Kald server endpoint `POST /api/auth/supabase/complete` med `Authorization: Bearer <access_token>` for at etablere intern cookie‑session.
- Deaktivér knappen hvis Supabase nøgler ikke er sat.

## Server (Session‑bro)

- Opret endpoint: `POST /api/auth/supabase/complete`.
- Verificér adgangstoken med Supabase service‑klient (`createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` + `auth.getUser(access_token)`), eller via JWK verify.
- Slå bruger op/registrer i egen DB efter behov (email, name, sub).
- Udsted intern JWT‑cookie (eksisterende mekanisme) og svar 200.
- Valgfrit: `GET /api/auth/me` returnerer bruger baseret på intern cookie.

## TRPC/Client Flow

- Ved app‑load: Hvis 401 på `auth.me`, forsøg `supabase.auth.getSession()`; hvis session findes, kald `POST /api/auth/supabase/complete`; ved succes, reload.
- Bevar eksisteret login/password flow som fallback.

## Sikkerhed

- Redirect whitelisting i Supabase dashboard.
- CSRF: Brug Authorization Bearer token; endpoint accepterer kun gyldige Supabase tokens.
- Cookie: `HttpOnly`, `Secure` i prod, passende `SameSite`.

## Miljøvariabler

- Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Test & Verifikation

- Dev: `pnpm dev` på `http://localhost:3000/`.
- Klik "Sign in with Google"; efter consent, verificér at intern session‑cookie sættes og `auth.me` returnerer bruger.
- Statisk preview (4173) viser UI, men API fejler uden backend; brug dev server til end‑to‑end.

## Faser

1. Klient: Supabase init + Google knap.
1. Server: Endpoint og tokenverifikation + cookie‑udstedelse.
1. Flow: App‑load bridging mellem Supabase session og intern cookie.
1. Test: Lokal E2E, mobil og desktop.
1. Prod: Tilføj prod envs, whitelist redirect URLs.

## Leverancer

- Supabase klientfil.
- LoginPage med Google knap.
- Server endpoint til session‑bro.
- Opdateret auth flow med robust fallback.
