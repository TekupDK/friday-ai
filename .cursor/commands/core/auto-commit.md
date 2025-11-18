# Auto Commit

You are helping prepare a clean git commit.

## TASK

Prepare a commit message and a staged change set consistent with best practices.

## STEPS

1. Use git diff to understand the scope of the change.
2. Suggest a conventional commit style message (e.g. feat:, fix:, chore:, refactor:, test:, docs:).
3. Break large changes into logical commit chunks if appropriate.
4. Verify there are no obvious debug leftovers or secrets in the diff.
5. Output the final commit message(s) and a short explanation.

## OUTPUT

Return:

- Recommended commit message(s)
- What each commit covers
- Any warnings (e.g. secrets, commented-out code, inconsistent style).
