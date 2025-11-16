## Formål

- Bekræfte indholdet i `DEV_NOTES_2025-11-12.md` mod repository.

- Validere at nævnte workflows, konfigurationer og sikkerhedslag findes og er korrekt placeret.

## Arbejdsgang

1. Læse og sammenfatte hovedpunkter fra `DEV_NOTES_2025-11-12.md`.
1. Krydstjekke nævnte filer og nøglerutiner (Helmet, CORS, redaktion, ESLint v9, Vite visualizer) i kodebasen.
1. Rapportere præcise filstier og linjenumre for centrale funktioner.

## Validering (efter godkendelse)

- Køre `pnpm lint` for ESLint v9 grænser.

- Køre `pnpm test` (redaction) for at bekræfte pass-status.

- Køre `pnpm bundle:analyze` lokalt for at sikre visualizer-konfigurationen.

## Mulige Opfølgninger

- Kort sikkerhedsreview af CSP/CORS i `server/_core/index.ts` for produktion.

- Tilføje CI-artifact retention/PR-kommentar tjek som beskrevet i noterne, hvis mangler.

## Leverancer

- Sammendrag og filreferencer (med linjenumre) til de nævnte ændringer.

- Valideringsresultater fra lint/tests/analyse (hvis godkendt).

Bekræft venligst planen, så fortsætter jeg med valideringen.
