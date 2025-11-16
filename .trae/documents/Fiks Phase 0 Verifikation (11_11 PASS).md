## Mål

- Opnå fuld verifikation af Apple UI Phase 0 (11/11 PASS)

- Eliminere story-ID uoverensstemmelser og sikre stabil theme-switching målinger

## Root Cause Opsummering

- Story-ID format: stories bruger "Apple UI/*", mens verifikationsscriptet forventer "crm-apple-ui-*"

- ScrollToTop har afvigende story title (CRM/Apple UI/ScrollToTop)

- Verifikationsscript mangler/er tomt og skal genimplementeres med per‑component isolation

## Trin 1: Normalisér Storybook Stories

- Ensret alle story titles til `"Apple UI/<Component>"` for:

  - `AppleButton.stories.tsx`

  - `AppleInput.stories.tsx`

  - `AppleModal.stories.tsx`

  - `AppleBadge.stories.tsx`

  - `AppleCard.stories.tsx`

  - `ScrollToTop.stories.tsx` (skift fra `CRM/Apple UI/ScrollToTop` → `Apple UI/ScrollToTop`)

- Bekræft at `.storybook/main.ts` globs inkluderer `../client/src/**/*.stories.@(js|jsx|mjs|ts|tsx)` (allerede OK)

## Trin 2: Story-ID Discovery (robust)

- Implementér en enkel discovery rutine der læser faktiske story IDs fra kørende Storybook manager:

  - Besøg `<http://localhost:6006/`>

  - Brug DOM‑scraping af sidebar eller `window.__STORYBOOK_CLIENT_API__.getStories()` til at liste `id`

  - Gem listen som `test-results/phase0-verification/stories.json`

## Trin 3: Genimplementér Verifikationsscript

- Fil: `scripts/verify-phase0-components.mjs`

- Arkitektur (som i notaterne):

  - Per‑component page isolation (`context.newPage()` i loop, `page.close()` efter hver)

  - Story-ID fallback: primært `apple-ui-*`, fallback `crm-apple-ui-*`

  - Port fallback: 6006 (primær), 6007 (sekundær)

  - Content validation: tjek både error‑display og at `#storybook-root` har children

  - Theme toggling: sæt `data-theme` på `documentElement` og `#storybook-root`

  - Selector‑liste pr. komponent (button/input/card/backdrop osv.)

  - Style sampling: indsamling af `backgroundColor`, `color`, `borderColor` for synlige matches

  - Pass‑kriterie: `JSON.stringify(lightColors) !== JSON.stringify(darkColors)`

  - Output: `test-results/phase0-verification/report.json` med PASS/FAIL pr. komponent

## Trin 4: ScrollToTop Theme‑fix verifikation

- Bekræft at CSS selektorerne i `ScrollToTop.module.css` skaber målbar forskel mellem light/dark

- Hvis målingen stadig er lig med hinanden, udvid forskellen (f.eks. tydeligere `background`/`box-shadow` i dark)

## Trin 5: Kør Verifikation

- Start Storybook på port 6006

- Kør `node scripts/verify-phase0-components.mjs`

- Forventet resultat: 11/11 PASS

- Gem rapport og udskrift som artefakt under `test-results/phase0-verification/`

## Acceptkriterier

- Alle 11 komponenter markeres PASS i `report.json`

- Story‑ID discovery matcher faktiske manager‑IDs

- Scriptet er deterministisk og robust (ingen nav‑interruptions)

## Eventuelle Risikoer og Mitigering

- Port 6007 utilgængelig: fortsæt med 6006 alene

- Backdrop‑filter support: script måler endelig stil efter fallback (allerede understøttet i `materials.ts`)

- Story navneændringer fremover: discovery‑trin minimerer vedligeholdelse

## Leverancer

- Opdaterede story titles (ensrettede)

- `scripts/verify-phase0-components.mjs` (reimplementeret)

- `test-results/phase0-verification/stories.json` og `report.json`

Bekræft planen, så implementerer jeg ændringerne og kører verifikationen med rapportering.
