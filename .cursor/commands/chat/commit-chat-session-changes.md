# Commit Chat Session Changes

You are a senior engineer committing only changes made during this chat session. You START COMMITTING immediately after identifying session files.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Scope:** Only files changed during current chat session
- **Method:** Identify files modified by AI tools in this conversation
- **Safety:** Never commit files not modified in this session
- **Format:** Conventional commit messages
- **Exclude:** Files in `.cursor/commands/` (unless explicitly requested)

## TASK

Identify files changed during this chat session and create a commit with only those changes. START COMMITTING immediately.

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

## IDENTIFYING SESSION CHANGES

### Step 1: Review Chat History
1. **Check tool calls:**
   - `search_replace` → File was modified
   - `write` → File was created/modified
   - `edit_notebook` → Notebook was modified
   - Note all files changed in this conversation

2. **List session files:**
   - Create list of all files modified
   - Note what was changed in each
   - Exclude `.cursor/commands/` files (unless requested)

### Step 2: Check Git Status
1. **Run git status:**
   ```bash
   git status
   ```

2. **Compare with session files:**
   - Match git status with session file list
   - Identify which modified files are from this session
   - Note any files already modified (exclude these)

### Step 3: Verify Changes
1. **Review git diff:**
   ```bash
   git diff path/to/file
   ```

2. **Ensure match:**
   - Changes match what was done in this session
   - Exclude unrelated changes
   - Verify file content

## IMPLEMENTATION STEPS

1. **List session changes - START NOW:**
   - Review chat history for tool calls
   - List all files modified: `search_replace`, `write`, etc.
   - Note what changed in each file
   - Exclude `.cursor/commands/` unless requested

2. **Check git status:**
   - Run: `git status`
   - Compare with session file list
   - Identify session files
   - Exclude pre-existing changes

3. **Stage only session files:**
   - Stage one by one: `git add path/to/file`
   - Only stage files from this session
   - Verify with `git status` before committing

4. **Create commit message:**
   - Use conventional format: `type: description`
   - Types: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
   - Describe what was done (not how)
   - Keep concise but descriptive

5. **Commit - DO IT NOW:**
   - Run: `git commit -m "message"`
   - Verify commit contains only session changes
   - Show commit summary

## CONVENTIONAL COMMIT FORMAT

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test changes
- `style:` - Code style changes
- `perf:` - Performance improvements

### Examples
```bash
feat: add CRM opportunity creation endpoint
fix: resolve email sync rate limiting issue
refactor: improve database helper error handling
docs: update API documentation
chore: update dependencies
test: add integration tests for CRM
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
### Committing Chat Session Changes

**Files Modified in This Session:**
- `path/to/file1.ts` - [what changed]
- `path/to/file2.tsx` - [what changed]
- `path/to/file3.md` - [what changed]

**Staged Files:**
- `path/to/file1.ts`
- `path/to/file2.tsx`
- `path/to/file3.md`

**Commit Message:**
\`\`\`
[type]: [description]
\`\`\`

**Commit Created:**
- Hash: [commit hash]
- Files: [count] files
- Changes: [summary of changes]

**Verification:**
- ✅ Only session files committed
- ✅ No unrelated changes included
- ✅ Commit message: CORRECT FORMAT
- ✅ Files verified: MATCH SESSION
```

## GUIDELINES

- **Be precise:** Only commit files you modified in this session
- **Verify:** Check `git diff` before committing
- **Exclude:** Don't commit files that were already modified
- **Exclude commands:** Don't commit `.cursor/commands/` files unless requested
- **Clear message:** Describe what was done, not how
- **One commit:** Group related changes together
- **Start immediately:** Don't wait for approval, commit now

