# Logging & Observability – Plan

Context: Pino structured logging added to server; consider request logs.

## Goals

- Consistent structured logs with redaction for PII.

## Acceptance criteria

- [ ] Startup, auth, and key workflows log with `level`, `msg`, `context` fields.
- [ ] Request logs include correlationId.

## Steps (suggested)

- [ ] Centralize logger and child loggers per module.
- [ ] Add request middleware with correlationId and timing.

## 2025-11-06 Update

- [x] Added audit logging for tool executions via `trackEvent` in `server/friday-tool-handlers.ts`.
  - Event type: `tool_call`
  - Properties: `toolName`, `requiresApproval`, `approved`, `success`, `code`, `durationMs`, `correlationId`
  - Note: Arguments er ikke logget (PII-safe). CorrelationId inkluderes fra `executeToolCall(options)`.
  - Next: Consider persisting to a dedicated `tool_calls` table; for now it uses `analytics_events`.
