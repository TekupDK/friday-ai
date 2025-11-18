## Mål

- Hærd workflow‑automation med sales‑notifikationer og kontekstuelle logs.

- Indfør enkel observability (pino logs + trackEvent) uden at ændre schema.

## Ændringer

1. Workflow‑automation: Tilføj sales‑notifikationer via `trackEvent` og konsistente `userId` propagation i kaldene.
1. Logger: Introducér `server/logger.ts` med pino, og brug den i automation til korrelerede logs (med correlationId og userId).
1. Status: Behold `crm.stats.getSystemStatus` som kilde; udbyg evt. senere med tællere.
1. Tests: En enkel smoke‑test for automation der validerer at `trackEvent` kaldes under finance/calendar scenarier.

## Leverancer

- Sales‑notifikationer og kontekstuelle logs i automation.

- Pino‑logger til genbrug i serverkode.

- Minimal smoke‑test for event‑tracking.

Godkend planen, så implementerer jeg ændringerne og verificerer dem.
