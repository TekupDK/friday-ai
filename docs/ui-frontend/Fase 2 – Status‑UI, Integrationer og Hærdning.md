## Mål

- Hæve driftssynlighed i UI og gøre integrationer (Gmail/Calendar, Billy) mere robuste.

- Fuldføre automation TODOs og indføre let observability.

## Fase A: Status‑UI Forbedringer

1. Tilføj tooltips for badges (DB/Billy/Google) med detaljer og anbefalinger.
1. Tilføj “Prøv igen” knap der refetcher `crm.stats.getSystemStatus` og viser “sidst tjekket” tid.
1. Vis mild banner ved rate‑limit på Gmail (brug `retryAfter`), inkl. automatisk skjul når tiden udløber.

## Fase B: Gmail/Calendar Robusthed

1. Klient‑validering: vis advarsel hvis `GOOGLE_CALENDAR_ID` mangler eller ser ugyldig ud.
1. TRPC fejlhåndtering: sikre konsistent mapping for 400/401/429 med bruger‑venlig tekst og `retryAfter`.
1. Små smoke‑tests for `inbox.calendar.*` og email søgning i staging (read‑only).

## Fase C: Billy Forbedringer

1. Brug `X‑Correlation‑ID` i relevante Billy‑kald for sporbarhed.
1. Backoff/retry ved midlertidige fejl; tydelig fejltekst i UI.
1. Afklar DB‑cache vs. live API for skat/gross beløb, dokumentér fallback‑politik.

## Fase D: Workflow‑Automation TODOs

1. Udfyld manglende felter (fx `userId`) i inserts og tilføj sales‑notifikationer.
1. Geotagging og event‑hooks/webhooks ved pipeline stage‑skift.
1. Smoke‑tests for orchestrering (lead→customer→booking→invoice) med simpel rollback.

## Fase E: Metrics & Observability

1. Strukturerede pino‑logs med `userId`, `correlationId`, router/metode og latens.
1. Enkle tællere og latens histogram; lille admin endpoint til status.
1. Rate‑limit overvågning og advarsler i UI.

## Tests

- Vitest for status‑UI logik (refetch/last‑checked/tooltips).

- Playwright E2E: badges skifter korrekt, banner for rate‑limit.

- Unit/integration tests for TRPC fejlhåndtering og Billy correlation.

## Leverancer

- Opdateret header‑status UI med tooltips/retry.

- Robust fejlhåndtering for Gmail/Calendar og Billy.

- Automation TODOs implementeret med smoke‑tests.

- Logs/metrics og simple admin status.

Godkend planen, så implementerer jeg fase for fase med verificerbare tests.
