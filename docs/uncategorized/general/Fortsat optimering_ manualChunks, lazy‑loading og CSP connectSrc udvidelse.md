## Mål

- Yderligere reducere initial bundle og forbedre navigationsoplevelse.

- Udvide prod‑CSP `connectSrc` til nødvendige eksterne tjenester baseret på ENV.

## Ændringer (ingen breaking)

1. Vite manualChunks

- Split `date-fns`/`date-fns/locale` i egen chunk.

- Udvid shadcn/Radix‑grupper: `dialog`, `select`, `navigation-menu`, `tooltip` i dedikerede chunks.

- Overvej `superjson` separat chunk.

1. Lazy loading på klient

- Lazy‑load Google Maps komponent (`client/src/components/Map.tsx`) og ruten/tab der bruger den.

- Lazify formatteringshjælpere (fx `formatDistanceToNow`) pr. feature.

1. CSP connectSrc (prod)

- Dynamisk tilføje: `openrouter.ai`, `api.openai.com`, `generativelanguage.googleapis.com`, `www.googleapis.com`, `${FORGE_API_URL}`, `${LITELLM_BASE_URL}`, `${LANGFUSE_BASE_URL}`, `${CHROMA_URL}` og relevante `localhost` endpoints afhængigt af ENV‑flags.

- Dev bevarer `ws/wss` og `unsafe-eval`.

## Forventet effekt

- Yderligere reduktion af `index-*.js`; mindre runtime overhead.

- Ingen funktionalitetstab; lazily hentede features indlæses ved behov.

- Prod‑CSP matcher reelle tjenester og undgår blokeringer.

## Validering

- Build og treemap‑gennemgang (`stats.html`) før/efter.

- Hurtig kliktest af Maps og formatteringer.

- Sikkerhedstjek af CSP med scanner.

## Risiko & rollback

- Mindre risiko for flere netværkskald; afhjælpes med prefetch.

- Rollback: fjern nye `manualChunks` og lazy‑imports; CSP connectSrc justeres via ENV uden kodeændringer.

Godkend venligst, så implementerer jeg disse ændringer og rapporterer konkrete før/efter‑tal.
