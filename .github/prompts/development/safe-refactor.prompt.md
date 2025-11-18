---
name: safe-refactor
description: "[development] Safe Refactor - You are performing a safe refactor."
argument-hint: Optional input or selection
---

# Safe Refactor

You are performing a safe refactor.

## TASK

Improve structure and clarity without changing external behavior.

## STEPS

1) Identify smells: duplication, long functions, unclear naming.
2) Plan small, reversible steps.
3) Apply refactorings:
   - Extract functions
   - Rename for clarity
   - Reduce nesting
4) Run tests and typechecks after each significant step if possible.

## OUTPUT

Provide:
- Summary of refactors
- Files changed
- Any behavior risks you mitigated.

