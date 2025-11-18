# Bundle Optimering og Code Splitting

## Formål

- Reducere initial indlæsningstid og forbedre navigationsoplevelsen via målrettet code splitting.

- Skabe klare vendor‑chunks som kan caches effektivt og isolere tunge feature‑moduler.

## ManualChunks Konfiguration

- Fil: `vite.config.ts:37-56`

- Rationale:
  - `react-vendor`, `react-query-vendor`, `icons-vendor` for populære lib‑grupper.

  - `ui-vendor` samler Radix‑baserede UI‑komponenter.

  - `date-fns-vendor` isolerer formatteringsbiblioteker og locale.

  - `superjson-vendor` isolerer serializer afhængigheden.

  - Feature‑chunks for workspace‑paneler og store UI‑områder.

````ts
// Eksempler (vite.config.ts)
manualChunks: {
  "react-vendor": ["react", "react-dom"],
  "react-query-vendor": ["@tanstack/react-query"],
  "icons-vendor": ["lucide-react"],
  "ui-vendor": [
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-select",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-navigation-menu",
  ],
  "date-fns-vendor": ["date-fns", "date-fns/locale/da"],
  "superjson-vendor": ["superjson"],
  // Feature‑paneler
  "workspace-lead": ["@/components/workspace/LeadAnalyzer"],
  "workspace-booking": ["@/components/workspace/BookingManager"],
  "workspace-invoice": ["@/components/workspace/InvoiceTracker"],
  "workspace-customer": ["@/components/workspace/CustomerProfile"],
  "workspace-dashboard": ["@/components/workspace/BusinessDashboard"],
  "email-components": ["@/components/inbox/EmailTabV2"],
  "ai-components": ["@/components/panels/AIAssistantPanelV2"],
}

```text

## Lazy Loading Mønstre

- Fil: `client/src/App.tsx:1-51`

- Brug `React.lazy(() => import(...))` + `Suspense` fallback for store ruter.

- Eksempel:

```tsx
const DocsPage = React.lazy(() => import("./pages/docs/DocsPage"));
<Suspense fallback={<Spinner/>}>
  <Route path="/docs" component={DocsPage} />
</Suspense>

```text

- Map (ekstern SDK): Fil: `client/src/components/workflow/tabs/LocationsTab.tsx:1-63`

  - Lazy‑import af `MapView` og visning ved klik på “Se Kort”.

## Treemap (stats.html)

- Genereres via `rollup-plugin-visualizer` i `vite.config.ts:11-17`.

- Byg lokalt:

```text

pnpm exec vite build

```text

- Åbn `stats.html` i projektroden for at analysere chunks.

## Prefetch Anbefalinger

- For ofte besøgte lazy‑ruter, brug `link rel="prefetch"` eller programmatisk prefetch ved hover.

- Overvej prefetch af `react-query-vendor` i travle views for at undgå kold‑cache.

## Tjekliste for nye features

- Byg projektet og åbne `stats.html` for treemap.

- Identificér tunge moduler (vendor vs feature) i treemap.

- Vurdér om modulet passer i eksisterende vendor‑grupper eller kræver ny chunk.

- Indfør `React.lazy` for feature‑routes/paneler, tilføj `Suspense` fallback.

- Opdater `vite.config.ts` `manualChunks` efter behov (undgå oversplitting).

- Kør build igen og verificér reduktion i `index-*.js` og nye chunk‑størrelser.

- Tilføj prefetch for ofte besøgte lazy‑ruter.

- Dokumentér ændringer med filhenvisninger (`file_path:line_number`).

## Før/Efter Indikatorer

- Initial bundle reduceret til ~524 kB (gzip ~148 kB) efter splits.

- Store docs/showcase chunks lazy‑loades og påvirker ikke første indlæsning.

## Kodehenvisninger

- `vite.config.ts:37-56` — manualChunks definitioner.

- `client/src/App.tsx:20-51` — lazy‑ruter og `Suspense` fallback.

- `client/src/components/workflow/tabs/LocationsTab.tsx:1-63` — lazy MapView.

## Best Practices

- Split efter naturlige domæner (vendor vs feature).

- Undgå oversplitting som skaber mange små requests — balancér størrelse og antal.

- Evaluer treemap efter hver større feature for at justere chunking.

## Vedligeholdelse

- Rebuild og gennemgå `stats.html` efter dependency‑opdateringer.

- Opdater manualChunks når nye tunge libs tilkommer.

**Sidst opdateret**: 2025‑11‑12
**Forfatter**: Friday AI Engineering
````
