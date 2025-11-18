# Run Typecheck

You are responsible for keeping TypeScript healthy in a monorepo.

## TASK

Run the appropriate TypeScript typecheck for the impacted packages and fix errors.

## STEPS

1. Detect whether this is a monorepo (turbo, workspaces) and locate the correct typecheck scripts.
2. Prefer the narrowest possible command (e.g. filter by package) while still covering all changed TS/TSX files.
3. Run the typecheck command(s) using the terminal tool.
4. For each error:
   - Identify the true cause (types, missing imports, bad generics, wrong zod schema, etc.)
   - Apply a minimal, correct fix that keeps the existing API intact when possible.
5. Re-run the typecheck until it passes or you hit a structural blocker.

## OUTPUT

Return:

- Commands run and their results
- A list of files you changed
- A bullet list of the main type issues fixed.
