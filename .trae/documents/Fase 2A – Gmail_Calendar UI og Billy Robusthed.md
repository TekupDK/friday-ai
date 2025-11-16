## Mål

- Forbedre klientfeedback ved Gmail rate‑limit/auth‑fejl og vise nedtælling.

- Hærd Billy‑kald med correlation‑id og enkel retry/backoff.

## Ændringer

1. Klient: Tilføj `getRateLimitUntil()` i request‑queue og vis banner i header med nedtælling + “Prøv igen”.

1. Klient: Vis toast ved Gmail auth‑fejl (401/403) via global error handler.
1. Server: Tilføj simpel retry/backoff i `server/billy.ts` for transiente fejl (5xx/429).
1. Server: Send `X‑Correlation‑ID` for Billy‑kald ved oprettelse/opdatering af faktura fra router.

## Tests

- Unit for bannerens nedtælling og refetch.

- Smoke for Billy‑flows med correlation‑id (log/verificer headers) og retry på 5xx.

Godkend, så implementerer jeg ændringerne og kører verificering.
