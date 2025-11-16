## Årsag og Fund

- Fejl: Browser viser net::ERR_ABORTED for `/assets/*.js` og CSS, hvilket tyder på 404/ikke-servede filer.
- Build-output findes i `dist/public` og indeholder de nævnte filer (`index-DX5GTb0q.js`, `react-vendor-BjHjopvn.js`, m.fl.).
- Serverens statiske serving vælger forkert sti i production:
  - `server/_core/vite.ts:50-55` bruger `server/_core/public` i production, som ikke eksisterer.
  - `server/_core/index.ts:185-189` kalder `serveStatic(app)` i production.

## Plan for Rettelse

1. Opdater serving-logic i `server/_core/vite.ts`:
   - Production: brug altid `dist/public` som statisk rod.
   - Bevar dev-mode via `setupVite` uændret.
1. Genbyg og genstart:
   - Kør build (hvis nødvendigt) og start server i production-mode for at bruge `dist/public`.
1. Verificering:
   - Åbn `http://localhost:<port>/lead-analysis` og bekræft 200-respons på alle `/assets/*` i Netværk-fanen.
   - Tjek konsollen for fravær af `net::ERR_ABORTED`.
1. Sikkerhedstjek:
   - Bekræft Helmet CSP (scripts/styles fra `'self'`) ikke blokerer ressourcer; nuværende setup er kompatibelt med lokale assets.
1. Ekstra diagnostik (valgfrit):
   - Midlertidig logging af 404 på statiske ruter for hurtig fejlfinding, hvis problemer fortsætter.

## Ændringer (konkrete)

- `server/_core/vite.ts:50-55`: ret `serveStatic` til at pege på `../../dist/public` i production.
- Ingen andre kodeændringer nødvendige.

## QA og Godkendelse

- Efter rettelse bekræft:
  - Alle assets loader (200) fra `dist/public/assets/*`.
  - Siden `/lead-analysis` renderer og er interaktiv.
  - Ingen CSP/helmet-advarsler i konsol.

Bekræft planen, så udfører jeg ændringen, genstarter korrekt og verificerer preview.
