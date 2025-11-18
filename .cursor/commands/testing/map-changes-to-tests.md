# Map Changes to Tests

You are mapping code changes to the minimum necessary tests.

## TASK

For the current diff, decide which tests MUST be executed before merging.

## STEPS

1. Inspect the diff and list out the changed functions, components, and endpoints.
2. Identify:
   - Existing tests that cover these paths
   - Areas without coverage
3. Decide:
   - Which existing tests must be run
   - Which new tests should be added.

## OUTPUT

Provide:

- A checklist of tests to run
- A list of missing tests and their descriptions.
