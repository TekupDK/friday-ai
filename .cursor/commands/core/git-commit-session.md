# Git Commit Session

You are a senior engineer creating a git commit with only the changes made during this chat session. You START COMMITTING immediately after identifying session files.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Purpose:** Commit work from this conversation only
- **Method:** Identify session changes, stage, and commit immediately
- **Safety:** Never commit pre-existing or unrelated changes
- **Format:** Conventional commit messages
- **Exclude:** Files in `.cursor/commands/` (unless explicitly requested)

## TASK

Create a git commit containing only the files you modified in this chat session. START COMMITTING immediately.

## CRITICAL: START COMMITTING IMMEDIATELY

**DO NOT:**
- Just list files without committing
- Wait for approval
- Commit files not modified in this session
- Commit command files unless explicitly requested

**DO:**
- Identify session files immediately
- Stage only session files
- Create commit with conventional format
- Verify commit contains only session changes

## IDENTIFICATION PROCESS

### Step 1: Track Your Modifications
1. **Review tool calls in conversation:**
   - `search_replace` → File was modified
   - `write` → File was created/modified
   - `delete_file` → File was deleted
   - `edit_notebook` → Notebook was modified
   - Note all files you touched

2. **Create session file list:**
   - List all files you modified
   - Note what changed in each
   - Exclude `.cursor/commands/` files (unless requested)

### Step 2: Compare with Git Status
1. **Run git status:**
   ```bash
   git status --short
   ```

2. **Match with your list:**
   - Compare git status with your session file list
   - Identify which modified files are from this session
   - Exclude files that were already modified

### Step 3: Verify Changes
1. **Review git diff for each file:**
   ```bash
   git diff path/to/file
   ```

2. **Ensure match:**
   - Changes match your work in this session
   - Exclude unrelated modifications
   - Verify file content is correct

## IMPLEMENTATION STEPS

1. **List session files - START NOW:**
   - Review conversation for tool calls
   - List all files you modified: `search_replace`, `write`, etc.
   - Note what changed in each file
   - Exclude `.cursor/commands/` unless requested

2. **Check git status:**
   - Run: `git status --short`
   - Compare with your session file list
   - Identify files that match your session work
   - Exclude pre-existing changes

3. **Stage session files:**
   - For each file you modified: `git add path/to/file`
   - Only stage files from your list
   - Verify: `git status` shows only your files staged

4. **Review staged changes:**
   - Run: `git diff --staged`
   - Verify all changes are from this session
   - Unstage any files that don't belong: `git reset path/to/file`

5. **Create commit message:**
   - Summarize what was done in this session
   - Use format: `type: description`
   - Be specific but concise
   - Describe what was accomplished (not how)

6. **Commit - DO IT NOW:**
   - Run: `git commit -m "message"`
   - Verify commit: `git log -1 --stat`
   - Confirm it contains only session work

## CONVENTIONAL COMMIT FORMAT

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test changes
- `style:` - Code style changes (rarely used)
- `perf:` - Performance improvements

### Examples
```bash
# Single feature
feat: add CRM opportunity creation endpoint

# Bug fix
fix: resolve email sync rate limiting issue

# Refactoring
refactor: improve database helper error handling

# Documentation
docs: update API documentation

# Multiple related changes
feat: implement email workflow automation

- Add pipeline stage handlers
- Create calendar event automation
- Add error handling and logging
```

### Multi-line Commit (If Needed)
```bash
git commit -m "feat: add CRM opportunity creation

- Add createOpportunity tRPC procedure
- Add opportunity database helpers
- Add opportunity UI components
- Add tests for opportunity creation"
```

## VERIFICATION

After commit:
- ✅ Only session files committed
- ✅ No unrelated changes included
- ✅ Commit message follows conventional format
- ✅ Files match session changes
- ✅ No `.cursor/commands/` files (unless requested)

## OUTPUT FORMAT

```markdown
### Git Commit: Session Work

**Session Changes:**
- [Summary of work done in this session]

**Files Committed:**
- `file1.ts` - [what changed]
- `file2.tsx` - [what changed]
- `file3.md` - [what changed]

**Commit:**
\`\`\`
[commit hash]
[commit message]

[file stats - lines added/removed]
\`\`\`

**Verification:**
- ✅ Only session files committed
- ✅ No unrelated changes
- ✅ Commit message: CORRECT FORMAT
- ✅ Files verified: MATCH SESSION
```

## GUIDELINES

- **Track as you go:** Note files you modify during conversation
- **Verify before commit:** Always check `git diff` first
- **Be conservative:** When unsure, exclude the file
- **Exclude commands:** Don't commit `.cursor/commands/` files unless requested
- **One logical commit:** Group related changes together
- **Clear messages:** Describe what was accomplished, not how
- **Start immediately:** Don't wait for approval, commit now

