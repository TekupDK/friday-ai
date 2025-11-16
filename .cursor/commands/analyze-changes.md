# Analyze Changes

You are a senior engineer in a pnpm + turborepo monorepo.

## TASK

Analyze the current changes in this repo and explain their impact.

## STEPS

1) Use git diff --name-only HEAD (or equivalent) to list changed files.
2) Group files by type: backend, frontend, shared, config, tests, infra.
3) For each group, summarize:
   - What changed
   - Potential impact and risk level (low/medium/high)
   - Which parts of the system might be affected
4) Identify missing tests or validations that should exist for these changes.

## OUTPUT

Respond in Markdown with:
- A table of changed files grouped by type
- A short risk assessment per group
- A checklist of tests that should be run.

