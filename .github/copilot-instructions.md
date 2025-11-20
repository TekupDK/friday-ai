# Repository Custom Instructions for GitHub Copilot

These instructions provide Copilot Chat with repository-specific context and preferences. Keep responses concise, actionable, and aligned with our stack and standards.

## Project

- Name: Friday AI
- Stack: React 19 + TypeScript + tRPC 11 + Drizzle ORM + Vite + Vitest + Playwright
- Server: Node (ESM), Express, Drizzle ORM (Postgres)
- Styling: Tailwind CSS + shadcn/ui

## Conventions

- TypeScript strict. Prefer explicit types and narrowings, never use `any` unless justified.
- Functional, small components; keep files <300 lines when reasonable.
- Data validation: Zod schemas at boundaries (HTTP, tRPC procedures).
- Side-effects isolated; prefer pure helpers and single-responsibility modules.
- Logs: use `pino` on server. Avoid console logs in shipped code.
- Errors: always surface helpful messages; never swallow. Wrap external calls with try/catch and typed error paths.
- Security: sanitize inputs (DOMPurify on client), parameterized queries only, avoid `dangerouslySetInnerHTML`.

## Tests

- Unit: Vitest. Put tests next to source or under `__tests__`.
- E2E: Playwright. Use `tests/` and `@playwright/test` fixtures.
- Accessibility: `@axe-core/playwright` and `@testing-library/react`.
- Aim for fast feedback: write at least a smoke/unit test with every non-trivial change.

## Build & Run

- Dev server: `pnpm dev` (requires `.env.dev`).
- Type check: `pnpm check`. Lint: `pnpm lint`. Format: `pnpm format`.
- Server build: `pnpm build`. Storybook: `pnpm storybook`.

## Database

- Drizzle ORM with Postgres. Migrations via `drizzle-kit`.
- Local dev DB: `docker-compose -f docker-compose.db-only.yml up -d` then `pnpm db:push:dev`.

## Prompts & Customization

- Reusable prompts live in `.github/prompts` as `*.prompt.md` files (synced from `.cursor/commands`).
- Use `/` in chat to discover and run them (for example `/session-init`).
- Prefer using relevant prompt files before ad-hoc freeform prompting to keep outputs consistent.

## Response style

- Keep answers concise but thorough. Use bullet points for steps. When changing code, provide filename paths and reasoning.
- When commands are needed, prefer PowerShell syntax for Windows dev environment.
- If a change requires secrets, reference `.env.*` keys and do not print real secrets.

## Pull Requests

- Include clear motivation, risk assessment, tests added/updated, and rollback plan.
- Run `pnpm check` and `pnpm test` before submitting.

## Do not

- Introduce breaking API changes without migration plan.
- Commit secrets or credentials.
- Bypass TypeScript types with `// @ts-ignore` without a comment explaining why.

## Operating Principles

- **Context Gathering**: Gain actionable context rapidly. Stop as soon as you can take effective action. Trace only symbols you'll modify or whose interfaces govern your changes.
- **Persistence**: Continue working until the user request is completely resolved. Don't stall on uncertainties—make a best judgment, act, and record your rationale.
- **Reasoning**: Use high reasoning effort for multi-file refactors or ambiguous tasks. Be verbose in code/diff outputs but concise in chat.

---

Tip: To view or run prompt files, open Chat > Configure (gear) > Prompt Files. Ensure VS Code setting `chat.promptFiles` is enabled.
