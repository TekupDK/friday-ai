---
name: dependency-audit
description: "[development] Dependency Audit - You are reviewing dependencies for security risk."
argument-hint: Optional input or selection
---

# Dependency Audit

You are reviewing dependencies for security risk.

## TASK

Assess the risk of external packages used in the project.

## STEPS

1) Inspect package.json and lock files.
2) Identify:
   - Outdated packages with known vulnerabilities (if information available)
   - Suspicious or unnecessary dependencies
3) Suggest upgrades, removals, or replacements.

## OUTPUT

Return:
- High-risk dependencies
- Suggested actions
- Notes on impact of changes.

