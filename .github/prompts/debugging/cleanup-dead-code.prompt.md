---
name: cleanup-dead-code
description: "[debugging] Cleanup Dead Code - You are cleaning up dead and unused code."
argument-hint: Optional input or selection
---

# Cleanup Dead Code

You are cleaning up dead and unused code.

## TASK

Find and remove unused functions, components, and files safely.

## STEPS

1) Identify unused exports and files (search references).
2) Confirm that they are not used dynamically (e.g. reflection, config-based).
3) Remove them or mark as deprecated where appropriate.
4) Run tests and typechecks.

## OUTPUT

Return:
- Items removed
- Any deprecations added
- Notes about potential dynamic usage risks.

