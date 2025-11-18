---
name: ensure-test-data-sanity
description: "[testing] Ensure Test Data Sanity - You are responsible for test data quality."
argument-hint: Optional input or selection
---

# Ensure Test Data Sanity

You are responsible for test data quality.

## TASK

Review and improve the test data used in unit/integration/e2e tests.

## STEPS

1) Inspect fixtures, factories, and seed data.
2) Look for:
   - Unrealistic data
   - Hidden coupling between tests
   - Overly brittle assumptions
3) Propose improvements:
   - More realistic data
   - Reduced coupling
   - Clear naming and structure.

## OUTPUT

Return:
- Issues found
- Concrete suggestions and example snippets.

