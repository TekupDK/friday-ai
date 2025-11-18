---
name: implement-scenario-bugfix
description: "[development] Implement Scenario: Bugfix - You are fixing a specific bug in the codebase. START INVESTIGATING and FIXING immediately."
argument-hint: Optional input or selection
---

# Implement Scenario: Bugfix

You are fixing a specific bug in the codebase. START INVESTIGATING and FIXING immediately.

## TASK

Identify and fix a bug with minimal changes, ensuring no regressions. START NOW - investigate and fix immediately.

## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**
- Just describe the bug
- Wait for approval to investigate
- Show a plan without fixing

**DO:**
- Start investigating immediately
- Find root cause
- Fix the bug using tools
- Verify the fix works

## STEPS

1. **Quickly understand the bug:**
   - Read bug description
   - Reproduce if possible
   - Check error messages/logs
   - Understand expected vs actual
   - Then START INVESTIGATING

2. **Find root cause - START NOW:**
   - Trace through code
   - Check related files
   - Review error stack traces
   - Search for references
   - Identify the exact issue

3. **Fix - IMPLEMENT IMMEDIATELY:**
   - Make minimal change using tools
   - Fix the root cause
   - Avoid refactoring unrelated code
   - Preserve existing behavior
   - Handle edge cases
   - Add defensive checks if needed

4. **Add regression test - VERIFY:**
   - Create test that fails with bug
   - Verify test passes with fix
   - Add to test suite
   - Run tests: `pnpm test`

5. **Verify fix - TEST NOW:**
   - Reproduce original bug (should be fixed)
   - Run existing tests (should still pass)
   - Run typecheck: `pnpm check`
   - Test related functionality
   - Check for side effects

## OUTPUT

Provide:
- Bug description
- Root cause identified
- Fix implemented
- Regression test added
- Verification results
- Files modified

