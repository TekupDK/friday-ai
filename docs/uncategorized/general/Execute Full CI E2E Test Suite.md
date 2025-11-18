## Prerequisites

- Ensure dev server runs at `<http://localhost:3000`> (Playwright config uses this base URL)

- If any tests target `<http://localhost:3002`,> ensure that service is started, or temporarily scope tests to `tests/ai/**` and `tests/e2e/**` that hit `:3000`

- Docker installed for Trivy (or use local Trivy binary). Ports `3000/3002` available

- Create an `artifacts/` or `test-results/` folder to store outputs for summarization

## Step 1: Build, Typecheck, Lint

- Build: `pnpm build`

- Typecheck: `pnpm check`

- Lint: `pnpm lint`

- Optional formatting check: `pnpm format:check`

## Step 2: Backend Integration & TRPC Contract Tests (Vitest)

- Full unit/integration suite: `pnpm test`

- Server-only focus (if needed): `pnpm exec vitest run server/__tests__ --reporter=verbose`

- Key references:
  - `server/__tests__/crm-smoke.test.ts` (tRPC caller over CRM routers)

  - `server/__tests__/chat-endpoints.test.ts` (chat router behaviors)

- Outputs: Vitest console, optionally `--coverage` via `pnpm test:coverage`

## Step 3: Playwright E2E Across Chromium/WebKit/Firefox

- Run suite: `pnpm test:playwright`

- UI runner (debug): `pnpm test:playwright:ui`

- Config: `playwright.config.ts`
  - Reporters write HTML to `playwright-report`, JSON to `test-results/results.json`, JUnit to `test-results/junit.xml`

  - Projects: Chromium, Firefox, WebKit, Mobile Chrome/Safari, `ai-tests`

- Scope: `tests/e2e/**` and `tests/ai/**`

## Step 4: Lighthouse Performance Benchmark

- With dev server running at `<http://localhost:3000`:>

- Simple CLI run and artifacts:
  - `pnpm dlx lighthouse <http://localhost:3000> --output html --output json --output-path ./test-results/lighthouse-3000.html --save-assets`

- Alternative LHCI (filesystem upload):
  - `pnpm dlx @lhci/cli@latest autorun --collect.url=<http://localhost:3000> --upload.target=filesystem --upload.outputDir=./test-results/lhci`

- Outputs: HTML/JSON in `test-results/`

## Step 5: Security Audit (npm audit + Trivy)

- NPM audit JSON:
  - `npm audit --json > test-results/npm-audit.json`

- Trivy filesystem scan (Docker):
  - PowerShell: `docker run --rm -v ${PWD}:/workspace aquasec/trivy:latest fs --exit-code 1 --severity HIGH,CRITICAL /workspace > test-results/trivy-fs.txt`

- Optional image scan if building a container: `docker run --rm aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL <image>`

## Step 6: Accessibility Tests (axe-core)

- CLI against `<http://localhost:3000`:>
  - `pnpm dlx @axe-core/cli <http://localhost:3000> --tags wcag2a,wcag2aa --timeout 60000 --json > test-results/axe-results.json`

- Alternative: integrate `@axe-core/playwright` in E2E tests later for per-page scans

## Step 7: Results Aggregation & Summary

- Collect outputs:
  - Build/Typecheck/Lint: exit codes and console logs

  - Vitest: pass/fail counts; coverage `%` from `pnpm test:coverage`

  - Playwright: `test-results/junit.xml`, `test-results/results.json`, and `playwright-report`

  - Lighthouse: performance scores (Performance/Accessibility/Best Practices/SEO) from JSON

  - Security: counts of vulnerabilities (HIGH/CRITICAL) from `npm-audit.json` and Trivy text

  - Accessibility: violations count and categories from `axe-results.json`

- Compute pass/fail indicators per step and (if a previous baseline exists) percentage improvements for:
  - Lighthouse scores vs last run (store `lighthouse-*.json` for baseline)

  - Playwright failures reduced vs previous `results.json`

  - Coverage `%` vs previous report

  - Axe violations reduced vs previous `axe-results.json`

- Produce a concise summary artifact (Markdown or JSON) embedding:
  - Overall status ✅/❌ per step

  - Key metrics (e.g., Lighthouse Performance 85 → 88 (+3.5%))

  - Top 3 optimization recommendations (bundle size, render blocking, accessibility landmarks, vulnerable packages)

## Optional: CI Orchestration (GitHub Actions)

- Single workflow job steps in `ci-e2e.yml`:
  - Checkout, setup Node, `pnpm i`

  - Step 1–2 (build/typecheck/lint/Vitest)

  - Start dev server on `:3000` (reusable service) and run Step 3–6 (E2E/Lighthouse/Axe/Security)

  - Upload artifacts from `test-results/` and `playwright-report/`

- Nightly job can expand matrix to include `projects: [chromium, firefox, webkit]`

Confirm and I will execute the full sequence, capture artifacts in `test-results/`, and deliver a summarized report with pass/fail, percentage changes, and next-step optimizations.
