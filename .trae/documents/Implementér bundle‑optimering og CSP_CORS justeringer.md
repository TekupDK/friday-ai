## Arbejde der udføres

1. Opdatere `vite.config.ts` med `build.rollupOptions.manualChunks` for at splitte tunge vendor‑pakker og app‑moduler.
1. Indføre `React.lazy` og `Suspense` for store klientmoduler (fx workspace‑ og email‑features) for lazy loading.
1. Justere `server/_core/index.ts` CSP per miljø: strammere i prod (uden `unsafe-eval`), dev bevarer nødvendige undtagelser; bekræfte CORS whitelist og logging.
1. Verificere ændringer: køre build, generere `stats.html`, sammenligne treemap og rapportere reduktion.

## Sikring af stabilitet

- Minimal risiko for funktionalitet; lazy loading får fallback via `Suspense`.

- Rollback er triviel: fjern `manualChunks` og revert lazy imports; CSP ændres via miljøflag.

## Leverancer

- Opdaterede configs og ruter.

- Før/efter målinger (bundle størrelser, treemap).

- Kort notat om CSP/CORS forskelle dev vs prod.

Godkend venligst, så foretager jeg ændringerne med efterfølgende validering.
