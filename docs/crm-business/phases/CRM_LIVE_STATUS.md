# 🧭 CRM Backend – Live Driftstatus og Integrationer

**Dato:** 2025-11-12
**Omfang:** Status‑endpoint, UI‑badges, rate‑limit banner, Billy correlation/retry, Pino logger, Metrics service

## Endpoints

- `crm.stats.getSystemStatus`

  Returnerer:
  - `db.connected`

  - `billy.configured`, `billy.reachable`

  - `google.configured`, `google.gmailReachable`, `google.calendarIdPresent`

- `crm.stats.getEventMetrics`

  Returnerer:
  - `totalEvents` - Samlet antal events

  - `eventsByType` - Events grupperet efter type

  - `topEvents` - Top 10 mest hyppige events

  - `database` - Database metrics (tabel counts)

  - `lastUpdated` - Sidste opdateringstidspunkt

## Observability (NYT)

### Pino Logger (`server/logger.ts`)

- Struktureret JSON logging med correlation IDs

- Context-aware logging med service-specifikke child loggers

- Environment-specifik formattering (pretty i udvikling)

- Request tracing på tværs af services

### Metrics Service (`server/metrics-service.ts`)

- Real-time event tracking og counting

- Top events analytics

- Database metrics integration

- Konfigurerbar reset og retention

### Event Tracking Integration

- Dual tracking i både database og metrics service

- Automatisk event counting og analytics

- Events overvåget:
  - `workflow_complete` - Lead processing fuldført

  - `calendar_event_created` - Kalender integration events

  - `sales_notified` - Salg team notifikationer

  - `geo_tag_added` - Geografisk tagging events

## Klient‑UI

- Header badges med tooltips og retry i `client/src/pages/WorkspaceLayout.tsx`

- Banner ved Gmail 429 med nedtælling; toasts ved auth‑fejl

## Billy Integration

- Automatisk `X-Correlation-ID` og enkel retry/backoff i `server/billy.ts`

- Pipeline fakturaoprettelse passer correlation‑id i `server/pipeline-workflows.ts`

## Workflow Automation (`server/workflow-automation.ts`)

- Opdateret med struktureret logging og correlation IDs

- Integration med metrics service for event tracking

- Forbedret error handling og tracing

## Hurtig brug

- Kald `crm.stats.getSystemStatus` via TRPC for driftstatus

- Kald `crm.stats.getEventMetrics` via TRPC for event analytics

- Brug "↻" i header for at refetche

- Ved rate‑limit: vent til angivet tid; køen afvikles automatisk

## Eksempel på Logger Brug

````typescript
import logger, { createRequestLogger } from './logger';

// Service-level logger
const serviceLogger = logger.child({ service: 'MyService' });

// Request-specific logger med correlation ID
const requestLogger = createRequestLogger(correlationId, userId);
requestLogger.info({ component: 'LeadProcessor' }, 'Processing lead');

```text

## Eksempel på Metrics Brug

```typescript
import { metricsService } from './metrics-service';

// Track custom events
await metricsService.trackEvent('custom_event', {
  metadata: 'value'
});

// Get current metrics
const metrics = metricsService.getMetrics();
const topEvents = metricsService.getTopEvents(10);

```text

## Kildehenvisninger

- `server/routers/crm-stats-router.ts` (status + metrics endpoints)

- `server/logger.ts` (pino logger konfiguration)

- `server/metrics-service.ts` (metrics og event tracking)

- `client/src/pages/WorkspaceLayout.tsx` (badges, tooltips, banner)

- `client/src/main.tsx` (toasts og global fejlhandler)

- `server/billy.ts` (correlation‑id + retry/backoff)

- `server/pipeline-workflows.ts` (correlation‑id ved faktura)

- `server/workflow-automation.ts` (opdateret med logging og metrics)

## Til AI‑chats

- Brug dette dokument for hurtig opfangning af nye driftændringer

- Linkes fra `docs/FRIDAY_DOCS_INDEX.md` under "What's New"

- Inkluderer nu observability features (logger + metrics)
````
