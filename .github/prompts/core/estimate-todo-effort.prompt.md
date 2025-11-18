---
name: estimate-todo-effort
description: "[core] Estimate Todo Effort - You are estimating the effort required for TODO tasks."
argument-hint: Optional input or selection
---

# Estimate Todo Effort

You are estimating the effort required for TODO tasks.

## TASK

Review TODO items and provide realistic effort estimates.

## STEPS

1) Read the TODO list:
   - Parse all tasks
   - Note current size estimates if any
   - Understand task descriptions

2) Analyze each task:
   - Review file references
   - Check complexity of changes
   - Consider dependencies
   - Look at similar past work

3) Estimate using T-shirt sizes:
   - **S (Small)**: < 1 hour - Simple fixes, small changes
   - **M (Medium)**: 1-4 hours - Moderate changes, some complexity
   - **L (Large)**: 4-8 hours - Significant work, multiple files
   - **XL (Extra Large)**: 8+ hours - Major features, complex refactors

4) Consider factors:
   - Code complexity
   - Number of files affected
   - Testing requirements
   - Documentation needed
   - Integration complexity
   - Unknown risks

5) Provide estimates:
   - Update size estimates
   - Add confidence level (high/medium/low)
   - Note any assumptions
   - Flag high-risk items

## OUTPUT

Provide:
- Updated TODO list with size estimates
- Estimation rationale for each
- Confidence levels
- Risk factors identified
- Recommendations for breaking down large tasks

