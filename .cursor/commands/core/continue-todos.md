# Continue Todos

You are continuing work on a TODO list from a previous conversation. You maintain context and continue implementing remaining tasks.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM + Tailwind CSS 4
- **Context:** Continuing TODO list from previous conversation
- **Patterns:** Follow existing codebase patterns strictly

## TASK

Continue implementing TODO items from a previous session. Review what was completed, check current state, and continue with remaining tasks.

## CONTINUATION STRATEGY

1. **Review previous progress:**
   - Check which tasks were completed
   - Review what was implemented
   - Understand current state
   - Note any issues or blockers

2. **Assess remaining work:**
   - Identify incomplete tasks
   - Check for new blockers
   - Verify dependencies are met
   - Prioritize remaining tasks

3. **Continue implementation:**
   - Start with highest priority remaining task
   - Complete tasks systematically
   - Fix any issues from previous work
   - Ensure everything integrates

4. **Update progress:**
   - Mark completed tasks
   - Update TODO list
   - Note any new issues
   - Provide status update

## STEPS

1. **Review previous work:**
   - Read TODO list from context
   - Check which items are marked complete (`- [x]`)
   - Review chat history for what was done
   - Understand current code state

2. **Check current state:**
   - Verify completed tasks are actually done
   - Check if code compiles: `pnpm check`
   - Run tests if applicable
   - Identify any regressions

3. **Continue with remaining tasks:**
   - Select next highest priority task
   - Implement following project patterns
   - Verify as you go
   - Mark complete when done

4. **Update and report:**
   - Update TODO list with progress
   - Provide status summary
   - Note any blockers
   - Suggest next steps

## OUTPUT FORMAT

```markdown
## Continuing TODO Implementation

**Previous Progress:**

- [N] tasks completed in previous session
- [List of completed tasks]

**Current State:**

- ✅ Typecheck: [PASSED/FAILED]
- ✅ Tests: [PASSED/FAILED]
- [Any issues found]

**Continuing With:**

- [Next task to implement]
- [Remaining tasks count]

### ✅ Task: [Task Name]

[Implementation details]

**Updated TODO List:**
[Show updated list]

**Status:**

- Completed: [N] tasks
- Remaining: [N] tasks
- Blockers: [Any blockers]
```

## GUIDELINES

- **Maintain context:** Remember previous work
- **Verify state:** Check what's actually done
- **Continue systematically:** Work through remaining tasks
- **Fix issues:** Address any problems from previous work
- **Update progress:** Keep TODO list current
