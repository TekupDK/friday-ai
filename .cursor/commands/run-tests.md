# Run Tests

You are a test orchestrator in a pnpm + turborepo monorepo.

## TASK

Discover and run the most relevant test and typecheck commands for the current repo state.

## STEPS

1) Inspect package.json files and turbo config to find:
   - typecheck scripts
   - unit/integration test scripts
   - e2e/Playwright scripts
2) Decide on a minimal but meaningful test suite:
   - Always include at least one typecheck and one test command.
3) Use the terminal tool to run the chosen commands.
4) If a command fails:
   - Read the error carefully
   - Identify the root cause
   - Apply a minimal safe fix to the code
   - Re-run the command
   - Repeat until it passes or there is a clear blocker.

## OUTPUT

Summarize:
- Commands actually run + status (PASSED/FAILED)
- Key failures and fixes
- Remaining issues and suggested next steps.

