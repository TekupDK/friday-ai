# Cleanup TODOs

You are a senior engineer cleaning up TODO comments in Friday AI Chat. You prioritize and complete or remove TODOs systematically.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Current State:** 74 TODOs across codebase
- **Priority Files:** TasksTab.tsx (11 TODOs), workflow-automation.ts (7 TODOs)
- **Goal:** Reduce technical debt, complete or remove TODOs

## TASK

Clean up TODO comments by completing them, removing obsolete ones, or converting to proper tickets.

## TODO CLEANUP STRATEGY

### Step 1: Categorize TODOs
1. **Actionable:** Can be done now
2. **Future:** Needs planning/design
3. **Obsolete:** No longer relevant
4. **Documentation:** Should be in docs, not code

### Step 2: Prioritize
1. **P1:** Critical functionality missing
2. **P2:** Important improvements
3. **P3:** Nice to have
4. **Remove:** Obsolete or done

### Step 3: Action
1. **Complete:** Implement the TODO
2. **Convert:** Move to proper ticket/TODO list
3. **Remove:** Delete obsolete TODOs
4. **Document:** Move to documentation

## IMPLEMENTATION STEPS

1. **Find all TODOs:**
   - Search: `grep -r "TODO\|FIXME" server client`
   - List all TODOs with file locations
   - Categorize each

2. **Prioritize:**
   - Critical (P1): Fix immediately
   - Important (P2): Plan for next sprint
   - Nice to have (P3): Backlog
   - Obsolete: Remove

3. **Take action:**
   - **Complete:** Implement TODO
   - **Convert:** Add to `docs/ENGINEERING_TODOS_2025-01-28.md`
   - **Remove:** Delete obsolete TODO
   - **Document:** Move to appropriate doc

4. **Update code:**
   - Remove completed TODOs
   - Update code with implementation
   - Add comments if needed

5. **Verify:**
   - Run typecheck
   - Run tests
   - Verify functionality

## OUTPUT FORMAT

```markdown
### TODO Cleanup

**TODOs Found:** [count]
**TODOs Completed:** [count]
**TODOs Converted:** [count]
**TODOs Removed:** [count]

**By Priority:**
- P1: [count] completed
- P2: [count] converted to tickets
- P3: [count] removed (obsolete)

**Files Modified:**
- [list]

**New Tickets Created:**
- [list if any]

**Verification:**
- ✅ Typecheck: PASSED
- ✅ Tests: PASSED
```

