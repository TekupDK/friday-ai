# Test Changed Files

You are a test orchestrator focusing on efficiency.

## TASK

Run only the most relevant tests for the current set of changed files.

## STEPS

1) Use git diff --name-only HEAD to determine which files changed.
2) Group files by area: backend, frontend, shared, config, tests.
3) Map each group to test commands:
   - Backend → unit/integration tests for that package
   - Frontend → component/unit + Playwright scope
   - Shared → tests for packages depending on them
4) Use the terminal tool to run the chosen commands.
5) Fix failing tests if possible, then rerun.

## OUTPUT

Provide:
- The mapping from changed files → test commands
- Commands executed and their status
- Any remaining failing tests and suggested fixes.

