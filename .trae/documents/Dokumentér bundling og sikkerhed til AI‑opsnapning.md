## Formål

- Tilføje opdateret dokumentation om bundling (manualChunks, lazy loading) og CSP/CORS, så andre AI‑chats kan indlæse kontekst mens de koder.

## Leverancer

1. Opdatere `SECURITY_IMPLEMENTATION.md` med:

- Prod/dev‑CSP forskelle og dynamisk `connectSrc` ud fra ENV.

- Kort CORS‑oversigt og whitelist/override via `CORS_ALLOWED_ORIGINS`.

- Henvisning til bundledokument.

1. Oprette `BUNDLE_OPTIMIZATION.md` med:

- Rationale og retningslinjer for `manualChunks` (vendor‑grupper + feature‑chunks).

- Lazy loading mønstre (`React.lazy`, `Suspense`, on‑demand komponenter som `MapView`).

- Treemap brug (`stats.html`): hvordan man bygger, læser og vælger nye splits.

- Prefetch anbefalinger for ofte besøgte ruter.

- Eksempellinks til relevante kodepunkter (fil:linje).

## Placering

- Roden af repo (samme niveau som `SECURITY_IMPLEMENTATION.md`) for maksimal discoverability.

## Effekt

- Ingen runtime‑ændringer; kun dokumentation. Forbedrer kontekstdeling på tværs af AI‑sessions.

## Validering

- Åbne og skimme docs i IDE; sikre at referencer (filstier/linjer) er korrekte.

Godkend venligst, så skriver jeg og linker dokumenterne.
