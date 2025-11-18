# Commit Session Work

You are committing the work completed in this chat session. You identify all changes made during this conversation and create an appropriate commit.

## ROLE & CONTEXT

- **Scope:** All work done in this chat session
- **Tracking:** Files modified using tools in this conversation
- **Safety:** Only commit session changes, exclude pre-existing modifications
- **Quality:** Proper commit messages, logical grouping

## TASK

Review all work done in this session, identify changed files, and create a commit with only those changes.

## SESSION TRACKING

**What to track:**
- Files created using `write` tool
- Files modified using `search_replace` tool
- Files deleted using `delete_file` tool
- Any other changes made during conversation

**What to exclude:**
- Files that were already modified before session started
- Unrelated changes made by others
- Temporary files or build artifacts

## STEPS

1. **Review session work:**
   - Go through conversation history
   - List all files you modified
   - Note what was done to each file
   - Group related changes

2. **Check git status:**
   - Run `git status` to see current state
   - Compare with your list of modified files
   - Identify any files that were already modified (exclude these)

3. **Stage session files:**
   - Stage files you modified: `git add path/to/file`
   - Stage one file at a time to be precise
   - Verify with `git status` after each add

4. **Review staged changes:**
   - Run `git diff --staged` to review
   - Ensure all changes are from this session
   - Remove any files that don't belong

5. **Create commit:**
   - Write descriptive commit message
   - Use conventional commit format
   - Commit: `git commit -m "message"`
   - Show commit summary

6. **Verify commit:**
   - Check `git log -1` to see commit
   - Verify it contains only session work
   - Confirm message is clear

## COMMIT MESSAGE EXAMPLES

**Feature addition:**
```
feat: add email workflow automation for calendar stage
```

**Bug fix:**
```
fix: resolve database connection error in customer helpers
```

**Refactoring:**
```
refactor: improve tRPC procedure error handling patterns
```

**Multiple changes:**
```
feat: implement CRM opportunity feature

- Add opportunity table and migration
- Create tRPC procedures for opportunities
- Add frontend components for opportunity management
- Wire UI to backend endpoints
```

## OUTPUT FORMAT

```markdown
## Committing Session Work

**Work Completed:**
- [Summary of what was done]

**Files Modified:**
- `path/to/file1.ts` - [change]
- `path/to/file2.tsx` - [change]

**Commit:**
\`\`\`
[commit hash] [commit message]

[count] files changed
[insertions] insertions(+)
[deletions] deletions(-)
\`\`\`

**Verification:**
- ✅ Only session work committed
- ✅ Commit message clear
- ✅ Changes verified
```

## GUIDELINES

- **Be thorough:** Include all work from this session
- **Be precise:** Exclude anything not from this session
- **Group logically:** Related changes in one commit
- **Clear messages:** Future you should understand what was done
- **Verify:** Always check before committing

