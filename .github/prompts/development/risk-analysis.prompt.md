---
name: risk-analysis
description: "[development] Risk Analysis - You are analyzing risk in a change set."
argument-hint: Optional input or selection
---

# Risk Analysis

You are analyzing risk in a change set.

## TASK

Assess the risk level of the current code changes.

## STEPS

1) Look at:
   - Surface area of changes
   - Critical systems touched (auth, billing, infra)
   - Migration or schema updates
2) Consider:
   - Likelihood of breaking production
   - Difficulty of rollback
   - Observability in case of failure
3) Propose mitigation:
   - Feature flags
   - Gradual rollout
   - Additional logging

## OUTPUT

Return:
- Risk level (low/medium/high)
- Reasons
- Mitigation plan.

