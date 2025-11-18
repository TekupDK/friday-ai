---
name: commit-only-my-changes
description: "[core] Commit Only My Changes - You are committing only the changes you made in this conversation. You carefully identify which files you modified and commit only those."
argument-hint: Optional input or selection
---

# Commit Only My Changes

You are committing only the changes you made in this conversation. You carefully identify which files you modified and commit only those.

## ROLE & CONTEXT

- **Scope:** Only files you modified using tools in this conversation
- **Safety:** Never commit pre-existing changes
- **Method:** Track files you modified, verify before committing
- **Format:** Conventional commit messages

## TASK

Identify files you modified in this conversation and commit only those changes.

## TRACKING YOUR CHANGES

**Files you modified:**
- Keep track of files you changed using `search_replace`, `write`, `delete_file` tools
- Note what was changed in each file
- Be aware of files that were already modified before you started

**Verification process:**
1. List files you know you modified
2. Check `git status` to see all modified files
3. Compare lists - only commit files that match
4. Review `git diff` to verify changes are yours

## STEPS

1. **List your changes:**
   - Review conversation for files you modified
   - List all files you changed using tools
   - Note the changes made to each

2. **Check current git state:**
   - Run `git status` to see all modified files
   - Identify which are yours vs pre-existing
   - Be conservative - if unsure, exclude

3. **Stage your files only:**
   - Stage each file individually: `git add path/to/file`
   - Only stage files you modified
   - Double-check with `git status` before committing

4. **Review staged changes:**
   - Run `git diff --staged` to review
   - Verify all changes are from this session
   - Remove any files that shouldn't be committed

5. **Create commit:**
   - Write clear commit message
   - Use conventional commit format
   - Commit: `git commit -m "message"`
   - Verify commit summary

## COMMIT MESSAGE GUIDELINES

**Format:** `type: description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix  
- `refactor:` - Refactoring
- `docs:` - Documentation
- `chore:` - Maintenance
- `test:` - Tests

**Examples:**
- `feat(crm): add opportunity creation endpoint`
- `fix(email): resolve Gmail rate limiting`
- `refactor(db): improve customer helper functions`
- `docs(commands): add examples to create-trpc-procedure`

## OUTPUT FORMAT

```markdown
## Committing My Changes

**My Changes in This Session:**
- `file1.ts` - [change description]
- `file2.tsx` - [change description]

**Staged for Commit:**
- [list of files]

**Commit:**
\`\`\`
[commit hash] [commit message]
[count] files changed
\`\`\`

**Verification:**
- ✅ Only my changes committed
- ✅ No pre-existing changes included
```

## GUIDELINES

- **Track your work:** Keep mental note of files you modify
- **Verify before commit:** Always check `git diff` first
- **Be conservative:** When in doubt, exclude
- **One logical commit:** Group related changes
- **Clear messages:** Describe what, not how

