---
name: test
description: "[testing] test"
argument-hint: Optional input or selection
---

You are a coding agent running inside a real repository in Cursor.

Your mission for this command is:

→ Look at the ACTUAL code changes (not just descriptions)  
→ Decide which tests/checks are relevant  
→ RUN those tests/checks in the terminal  
→ Report honestly what passed/failed per changed file

This command is **generic** and must work for any repo (frontend, backend, monorepo, etc.).

---

1. DISCOVER THE CHANGESET

---

1. First, determine what has changed:
   - Prefer: use `git diff --name-only HEAD` to list modified files.
   - If there are staged and unstaged changes, include both.
   - If git is not available, fall back to "recently edited files" in the workspace.

2. List the changed files in your reasoning and in the final answer:
   - Group them by type: frontend components, backend modules, tests, configs, etc.
   - Example groups:
     - UI components (.tsx/.jsx/.vue)
     - Backend logic (.ts/.js/.go/.py, etc.)
     - Shared libraries
     - Config (tsconfig, vite/webpack config, eslint, etc.)

---

2. MAP CHANGES → RELEVANT TESTS

---

For each group of changed files, decide the MINIMAL BUT MEANINGFUL set of checks:

- If UI/components changed:
  - Look for colocated tests: same folder, `__tests__` folder, or files ending in `.test` / `.spec`.
  - Plan to run the most relevant test commands (e.g. Jest/Vitest/Playwright/RTL).

- If backend/services logic changed:
  - Find unit/integration tests in the same module/package.
  - Plan to run the relevant test command(s) for that package.

- If types/interfaces/zod schemas changed:
  - Include a TypeScript typecheck (e.g. `pnpm typecheck`, `npm run typecheck`, `tsc --noEmit`, or package-specific typecheck).

- If global config (tsconfig, build, bundler, eslint) changed:
  - Plan a broader check: at least typecheck + lint, and possibly a lightweight build.

To find the correct commands:

- Open `package.json` (root and relevant packages).
- Open monorepo config if present (`turbo.json`, `lerna.json`, `nx.json`, etc.).
- Infer the most specific commands possible (e.g. `pnpm test --filter=<package>` instead of full repo if available).

---

3. RUN REAL COMMANDS (MANDATORY)

---

You MUST run actual commands in the terminal tool.

For each planned command:

1. Show the exact command you are going to run.
2. Use the terminal tool to execute it.
3. Read the output:
   - If it PASSES:
     - Mark it as PASSED in your final report.

   - If it FAILS:
     - Read and summarize the error.
     - Identify the root cause in the code.
     - Propose and APPLY a fix.
     - Re-run the SAME command.
     - Repeat until it passes OR you hit a clear blocker (describe the blocker).

Hard rules:

- Do NOT claim “tests passed” or “typecheck is green” without actually running at least one real command.
- If you cannot run a command (missing dependency, broken script, etc.), say exactly what blocked you and where it needs manual fixing.

---

4. FINAL OUTPUT FORMAT

---

Your final message MUST use this exact structure:

### 1. Changed files (by group)

- List changed files grouped logically, for example:
  - UI components:
    - `path/to/ComponentA.tsx`
    - `path/to/ComponentB.tsx`
  - Backend:
    - `path/to/service.ts`
  - Config:
    - `tsconfig.json`, `vite.config.ts`, etc.

### 2. Commands actually run

For each command, list:

- The exact command string
- Scope (what it is testing)
- Result: PASSED / FAILED
- If FAILED: short explanation of why

Example:

- `pnpm test path/to/ComponentA.test.tsx` → PASSED
- `pnpm typecheck` → FAILED (TS2741 in `src/user/service.ts`)

### 3. Fixes you applied

- File-by-file summary of the code changes you made while fixing test/type errors.
- Keep it short but concrete (what was wrong, what you changed).

### 4. Current status & next steps

- Are all relevant tests for the changed files passing now? (Yes/No)
- Are typechecks for the affected area passing? (Yes/No)
- Anything still broken or risky?
  - If yes, describe:
    - affected files
    - the remaining error(s)
    - what a human should do next.

---

5. HONESTY & LIMITS

---

- Never fabricate test results.
- If you had to skip something (e.g. running full e2e suite is too slow), say it explicitly.
- Prefer small, targeted test runs over full monorepo runs, unless config changes force a full run.
