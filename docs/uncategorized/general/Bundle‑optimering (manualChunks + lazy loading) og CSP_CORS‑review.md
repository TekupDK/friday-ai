## Mål

- Reducere hovedbundle og forbedre førstegangs‑indlæsning via målrettet code‑splitting.

- Stramme CSP/CORS i produktion uden at bremse lokal udvikling.

## Hvad ændres

- `vite.config.ts`: tilføje `build.rollupOptions.manualChunks` for klare vendor‑splits (fx `react`, `react-dom`, `lucide-react`, UI‑bibliotek).

- Klientruter: indføre `React.lazy`/`dynamic import()` for tunge featureområder (fx `workspace-*`, `email-components`, `ai-components`).

- `server/_core/index.ts`: separere CSP for dev/prod; fjerne `unsafe-eval` i prod; beholde WebSocket i dev; bekræfte CORS whitelist fra `CORS_ALLOWED_ORIGINS`.

## Forventet effekt

- Frontend: 20–40% lavere initial `index-*.js`; hurtigere FCP/TTI; lidt flere efterfølgende lazy‑fetches ved navigation.

- Backend: strengere headers i prod; ingen ændring i funktionalitet; blokerede CORS‑requests logges tydeligere.

- CI/CD: uændret; bundle‑analysis artefakt bliver mere informativ; tests påvirkes ikke.

## Implementationstrin

1. Manual chunks

- Opdatér `vite.config.ts` med navngivne chunks; hold visualizer aktiv.

- Byg (`pnpm exec vite build`), evaluér `stats.html`, justér splits.

1. Lazy loading

- Skift store ruter/moduler til `React.lazy` + `Suspense`.

- Smoke‑test navigation; mål antal netværkskald.

1. CSP/CORS review

- Skift CSP per miljø: prod uden `unsafe-eval` og strammere `scriptSrc`/`connectSrc`.

- Valider CORS med nuværende whitelist og `CORS_ALLOWED_ORIGINS`.

## Validering

- `pnpm exec vite build` + review `stats.html` for chunk‑reduktion.

- `pnpm lint` for importgrænser og kvalitet.

- Hurtig funktionel kliktest i UI (lokalt) af lazy‑ruter.

- Sikkerhedstjek af headers med scanner (manuelt).

## Risiko & rollback

- Risiko: forsinket første visning af lazy‑ruter; afhjælpes med prefetch.

- Rollback: fjern `manualChunks`, revert `React.lazy`; CSP skiftes via miljøflag.

## Leverancer

- Opdateret `vite.config.ts`; opdaterede ruter med lazy loading.

- `stats.html` før/efter, noteret bundle‑reduktion.

- Kort notat om CSP/CORS forskelle dev vs prod.

Bekræft venligst, så gennemfører jeg ændringerne og leverer før/efter‑målinger.
