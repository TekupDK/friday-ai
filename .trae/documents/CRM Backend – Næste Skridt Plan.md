## Mål

- Stabilisere integrationer (Billy, Gmail/Calendar) og synliggøre driftstatus.

- Hærdning af CRM-routers og automatisering (lead‑to‑cash) med tests og observability.

## Phase 1: Status & Klientintegration

1. Eksponér `crm.stats.getSystemStatus` i klienten og vis indikatorer (DB, Billy, Gmail, Calendar).
1. Tilføj simple UI‑alerts og retry‑hint ved fejl (fx Gmail 400/401/429).
1. Dokumentér miljøkrav (env‑keys, service account), og læg short troubleshooting sektion.

## Phase 2: Gmail/Calendar Robusthed

1. Miljøvalidering ved startup (service account JSON/ENV, impersonated user, calendar ID) – vis klientfeedback.
1. Graceful fallback i endpoints (rate limit, auth fejl) med struktureret TRPC‑fejl (code + retryAfter).

1. Let smoke‑test for `inbox.calendar.*` og `inbox.email.*` mod staging.

## Phase 3: Billy Forbedringer

1. Udvid DB‑cache for fakturaer (skat/afledte felter) og afklar fallback politik.
1. Konsistent `X‑Correlation‑ID` i Billy‑kald (sporbarhed) og exponential backoff.
1. Sammenlign `inbox.invoices.stats` med beregningslogik og ret evt. afvigelser.

## Phase 4: Workflow‑Automation TODOs

1. Udfyld manglende felter (userId, metadata) og sales‑notifikationer.
1. Geotagging og event‑hooks/webhooks for stage‑skift.
1. Smoke‑tests for orchestrering (booking, invoice, calendar) og rollback‑sikring.

## Phase 5: Metrics & Observability

1. Pino logs med kontekst (userId, correlationId, router/method, latency).
1. Simple metrics (tællere for calls/errors, latens histogram) og dashboards.
1. Rate‑limit overvågning og alarmgrænser.

## Phase 6: Performance & DB

1. Drizzle index review for `customerProfiles`, `bookings`, `emailPipeline*`.
1. Query‑optimering for statistik (dashboard, healthscore) og pagination.
1. Migrations + rollback scripts med dry‑run checks.

## Tests & Kvalitet

- Udvid Vitest dækning for nye endpoints og edge‑cases.

- Playwright E2E for status‑UI og typiske CRM flows (lead→customer→booking→invoice).

## Udrulning

- Staging verifikation (env, secrets) → gradvis prod udrulning.

- Feature flags for nye status‑UI og automation.

Godkend planen, så går jeg i gang med implementeringen fase for fase.
