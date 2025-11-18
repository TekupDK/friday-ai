## Mål

- Bekræft at CRM-backenden (customers, leads, bookings, activity, stats) er stabil og fuldt funktionel.

- Afklare integrationsstatus (Billy, Gmail/Calendar) og identificere resterende TODOs/blokeringer.

## Verifikationsskridt (read-only først)

1. Læs og kør smoke-tests: `server/__tests__/crm-smoke.test.ts` for CRUD og sikkerhed.
1. Valider feature-status: `server/scripts/test-crm-features.ts` (Activity & Health Score) og gennemgå output.
1. Kør udvidede tests: `server/scripts/test-crm-extensions.ts` (Phase 2-6) for Opportunities/Segments/Documents/Audit/Relationships.
1. Billy-integration: sammenlign `inbox.invoices.stats` med `tests/manual/test-billy-api.ts` og `server/utils/invoice-stats.ts`.
1. Kalender/Email: dry-run endpoints via manual tests `tests/manual/test-friday-calendar-tools.ts` og `tests/manual/test-email-api.ts`.
1. Router-konsistens: inspicér `server/routers.ts` import af `crm-extensions-router` og bekræft fil/sti; noter og planlæg fix hvis mangler.
1. Workflow TODOs: gennemgå `server/workflow-automation.ts` og katalogisér manglende felter/notifications.

## Hærdning/Opfølgning (efter godkendelse)

- Ret router-import mismatch (hvis `crm-extensions-router` mangler) og tilføj enhedstest for router-registrering.

- Tilføj en read-only `status` endpoint (tRPC) der returnerer CRM health: DB-tilgængelighed, Billy/Gmail/Calendar connectivity, pipeline triggers.

- Skærp Billy-cache-sti: udvid DB-cachefelter (fx skat) eller dokumentér fallback-politik tydeligt.

- Afslut TODOs i `workflow-automation.ts` (userId-felter, sales-notifications, geotagging) og tilføj smoke-tests.

## Leverancer

- Verifikationsrapport: testresultater + kendte gaps.

- Router-fix og status endpoint (kode) med enhedstests.

- Opdateret dokumentation for integrationers driftstatus og fallback-politikker.

Bekræft planen, så påbegynder jeg verifikationen og derefter nødvendige kodeændringer.
