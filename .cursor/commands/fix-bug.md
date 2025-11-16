# Fix Bug

You are a senior engineer fixing bugs in Friday AI Chat. You START INVESTIGATING and FIXING immediately with minimal, safe changes.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Approach:** Minimal safe patches, preserve existing behavior
- **Quality:** Fix root cause, add regression test, verify no side effects

## TASK

Fix a bug with minimal changes. START NOW - investigate and fix immediately.

## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**

- Just describe the bug
- Wait for approval to investigate
- Show a plan without fixing
- Refactor unrelated code

**DO:**

- Start investigating immediately
- Find root cause
- Fix the bug using tools
- Add regression test
- Verify the fix works

## DEBUGGING STRATEGY

1. **Reproduce the bug:**
   - Understand error messages
   - Check stack traces
   - Reproduce in dev environment if possible

2. **Trace the code:**
   - Follow error stack trace
   - Read related files
   - Search for similar patterns
   - Check recent changes if known

3. **Identify root cause:**
   - Find exact line causing issue
   - Understand why it fails
   - Check edge cases (null, undefined, empty, etc.)

4. **Fix minimally:**
   - Make smallest change that fixes bug
   - Don't refactor unrelated code
   - Preserve existing behavior
   - Add defensive checks if needed

5. **Verify fix:**
   - Reproduce original bug (should be fixed)
   - Run existing tests (should still pass)
   - Add regression test
   - Check for side effects

## STEPS

1. **Understand the bug:**
   - Read bug description carefully
   - Check error messages/logs
   - Review stack traces
   - Understand expected vs actual behavior
   - Note when/where it occurs

2. **Investigate - START NOW:**
   - Read files mentioned in error
   - Search for related code
   - Trace through execution flow
   - Check recent changes (git log)
   - Identify exact root cause

3. **Fix - IMPLEMENT IMMEDIATELY:**
   - Make smallest safe patch using tools
   - Fix root cause, not symptoms
   - Follow project patterns
   - Preserve existing behavior elsewhere
   - Add defensive checks if needed
   - Add comments explaining fix if non-obvious

4. **Add regression test:**
   - Create test that fails with bug
   - Verify test passes with fix
   - Add to appropriate test file
   - Run test: `pnpm test`

5. **Verify - TEST NOW:**
   - Run typecheck: `pnpm check`
   - Run targeted unit tests
   - Run component tests (if frontend)
   - Reproduce original bug (should be fixed)
   - Check for regressions
   - Test related functionality

6. **Report:**
   - Root cause identified
   - Fix implemented
   - Files changed
   - Regression test added
   - Verification results

## COMMON BUG PATTERNS

- **Null/undefined access:** Add null checks
- **Type mismatches:** Fix types, don't use `any`
- **Async/await issues:** Check promise handling
- **State issues:** Check React hooks dependencies
- **Database queries:** Verify user ownership, check for null results
- **API errors:** Check error handling, verify inputs

## VERIFICATION

After fix:

- ✅ Bug is fixed (reproduce original issue - should work)
- ✅ Regression test added and passing
- ✅ Existing tests still pass
- ✅ No side effects
- ✅ Typecheck passes
- ✅ Code follows patterns

## OUTPUT FORMAT

```markdown
### Bug Fix: [Bug Description]

**Root Cause:**
[What was causing the bug]

**Fix:**

- File: `path/to/file.ts`
- Change: [what was fixed]

**Regression Test:**

- File: `path/to/test.ts`
- Test: [test description]

**Verification:**

- ✅ Bug fixed: PASSED
- ✅ Regression test: PASSED
- ✅ Existing tests: PASSED
- ✅ Typecheck: PASSED

**Files Modified:**

- [list]
```
