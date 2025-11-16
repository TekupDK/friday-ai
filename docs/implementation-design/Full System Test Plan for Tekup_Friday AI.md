## Objectives

- Build and typecheck the entire repository

- Verify bundle optimizations and chunking

- Validate lazy loading, CSP, and ENV mapping

- Start the server and confirm runtime stability

- Validate ErrorBoundary and fallback mechanisms

- Produce a structured Markdown report with pass/fail, performance metrics, security validation, and next actions

## Preconditions

- Windows PowerShell environment

- Node and pnpm available

- No additional configuration changes required

## Step 1: Build and Typecheck

- Run `pnpm run build` and capture output and exit code

- Run `pnpm run check` and capture output, error counts, and representative errors

- Record build artifacts location `dist/` and `dist/public/assets/`

## Step 2: Bundle Optimization Verification

- Parse Vite build output for bundle and gzip sizes

- List `dist/public/assets/` sorted by size via `Get-ChildItem` and capture top 20 assets

- Confirm presence of vendor and feature chunks (e.g., `react-vendor`, `react-query-vendor`, `ui-vendor`, `icons-vendor`, `DocsPage`, `ComponentShowcase`, `ChatComponentsShowcase`, feature chunks)

- Compare current sizes to previous baseline when available and compute deltas

## Step 3: Lazy Loading, CSP, ENV Mapping

- Static validation: read `client/src/App.tsx` and `client/src/components/workflow/tabs/LocationsTab.tsx` to confirm `React.lazy` usage and Suspense fallbacks

- Dynamic validation: confirm lazy-loaded routes produce separate chunks in `dist/public/assets/`

- Read `server/_core/index.ts` for CSP directives and environment branching

- Read `server/_core/env.ts` for ENV variable mapping and dynamic getters

## Step 4: Runtime Stability

- Start server from built output with `node dist/index.js` on an available port

- Check startup logs for errors

- Perform a basic health check using `Invoke-WebRequest <http://localhost:><port>/` and record status code

## Step 5: ErrorBoundary and Fallbacks

- Read `client/src/components/ErrorBoundary.tsx` for implementation details

- Validate presence in `client/src/App.tsx`

- If a safe trigger exists (route or flag), request `/` with a parameter to simulate an error; otherwise validate statically

## Step 6: Report Generation

- Produce a Markdown report containing:

  - Test results: pass/fail per task

  - Performance metrics: bundle sizes, gzip sizes, top assets, chunk presence

  - Security & CSP validation: directives, environment behavior, CORS configuration highlights

  - Improvement summary: what’s working, any regressions, actionable next steps

## Deliverables

- One comprehensive Markdown report returned in chat

## Notes

- Uses read-only inspections for code validation and controlled runtime checks

- Will not modify files or configs

- Will avoid interfering with existing running processes by choosing a free port

Please confirm to proceed with executing the plan and generating the report.
