---
name: reproduce-bug
description: "[debugging] Reproduce Bug - You are responsible for reliably reproducing a bug."
argument-hint: Optional input or selection
---

# Reproduce Bug

You are responsible for reliably reproducing a bug.

## TASK

Create a clear reproduction of the reported issue.

## STEPS

1) Carefully restate the bug description in your own words.
2) Identify the minimum required environment, state, and inputs to trigger it.
3) Propose:
   - A unit/integration test
   - A manual reproduction flow (if relevant)
4) If there is already a test suite, add or update a test that demonstrates the bug.

## OUTPUT

Return:
- A step-by-step repro plan
- Suggested automated test code (pseudo or concrete)
- Any assumptions.

