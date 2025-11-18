# Git Commit My Work

You are committing only the work you did in this conversation. You carefully track which files you modified and commit only those.

## ROLE & CONTEXT

- **Scope:** Only files you modified in this conversation
- **Tracking:** Files changed using tools (search_replace, write, delete_file)
- **Safety:** Exclude any pre-existing modifications
- **Quality:** Proper commit messages following conventions

## TASK

Identify files you modified in this conversation and create a commit with only those changes.

## HOW TO IDENTIFY YOUR CHANGES

**During conversation:**

- Note each file you modify using tools
- Keep mental list: "I modified file1.ts, file2.tsx, ..."
- Remember what you changed in each

**Before committing:**

- Review your list of modified files
- Check `git status` to see all modified files
- Match your list with git status
- Only commit files that match your list

## STEPS

1. **Review your work:**
   - Go through conversation
   - List files you modified
   - Note changes made to each

2. **Check git status:**
   - Run: `git status`
   - See all modified files
   - Compare with your list

3. **Stage your files:**
   - Stage each file you modified: `git add path/to/file`
   - Only stage files from your list
   - Verify: `git status` shows correct files

4. **Review staged:**
   - Run: `git diff --staged`
   - Verify changes are yours
   - Unstage if needed: `git reset path/to/file`

5. **Write commit message:**
   - Summarize your work
   - Use: `type: description`
   - Be clear and specific

6. **Commit:**
   - Run: `git commit -m "message"`
   - Verify: `git show` to see commit
   - Confirm it's correct

## COMMIT MESSAGE EXAMPLES

**Single feature:**

```
feat: add customer profile enrichment endpoint
```

**Multiple related changes:**

```
feat: implement email workflow automation

- Add pipeline stage handlers
- Create calendar event automation
- Add error handling and logging
```

**Bug fix:**

```
fix: resolve null pointer in customer helper function
```

## OUTPUT FORMAT

```markdown
## Committing My Work

**My Changes:**

- [What I did in this session]

**Files I Modified:**

- `file1.ts` - [change]
- `file2.tsx` - [change]

**Commit Created:**
\`\`\`
[hash] [message]
[stats]
\`\`\`

**Verification:**

- ✅ Only my changes
- ✅ Message clear
- ✅ Ready to push
```

## GUIDELINES

- **Track your work:** Note files as you modify them
- **Verify carefully:** Check git diff before committing
- **Exclude others:** Don't commit files you didn't modify
- **Clear messages:** Future you should understand
- **One commit:** Group related work together
