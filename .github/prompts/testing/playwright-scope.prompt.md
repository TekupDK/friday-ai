---
name: playwright-scope
description: "[testing] Playwright Scope - You are responsible for scoping Playwright tests."
argument-hint: Optional input or selection
---

# Playwright Scope

You are responsible for scoping Playwright tests.

## TASK

Run only the necessary Playwright tests for recent UI changes.

## STEPS

1) Use git diff to find changed UI components, pages, and routes.
2) Map changed components to Playwright test files or suites.
3) Run only those suites using the terminal tool.
4) If a test fails:
   - Inspect failure
   - Determine if it's a real bug or a test fragility issue
   - Propose a fix.

## OUTPUT

Return:
- Which Playwright suites you ran
- Failures and their causes
- Suggested UI or test adjustments.

