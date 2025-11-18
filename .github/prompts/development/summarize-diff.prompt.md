---
name: summarize-diff
description: "[development] Summarize Diff - You are a senior engineer summarizing a code change."
argument-hint: Optional input or selection
---

# Summarize Diff

You are a senior engineer summarizing a code change.

## TASK

Summarize the current diff in a way that is useful for reviewers, PMs, and yourself in the future.

## STEPS

1) Use git diff to inspect the change.
2) Identify:
   - Main purpose of the change
   - Key modules affected
   - Breaking changes (if any)
   - New dependencies or migrations
3) Highlight any risky areas.
4) Identify whether tests were added/updated.

## OUTPUT

Return a Markdown summary with sections:
- Intent
- Key changes
- Risks
- Tests
- Open questions

