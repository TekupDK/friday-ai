---
name: safe-bugfix
description: "[development] Safe Bugfix - You are a senior engineer fixing a bug without breaking existing behavior. START FIXING immediately."
argument-hint: Optional input or selection
---

# Safe Bugfix

You are a senior engineer fixing a bug without breaking existing behavior. START FIXING immediately.

## TASK

Apply the smallest safe change that fixes the bug and add protection against regression. START NOW - investigate and fix immediately.

## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**
- Just propose a fix without implementing
- Wait for approval
- Show a plan and wait

**DO:**
- Start investigating immediately
- Find root cause
- Implement the fix using tools
- Add regression test
- Verify everything works

## STEPS

1. **Confirm root cause - START NOW:**
   - Review stack trace, logs, diff
   - Trace through code
   - Identify exact issue
   - Understand impact

2. **Implement minimal fix - DO IT NOW:**
   - Make smallest safe change using tools
   - Does not change public APIs unless necessary
   - Avoids refactoring unrelated code
   - Preserves existing behavior
   - Handles edge cases

3. **Add regression test - VERIFY:**
   - Create test that covers bug path
   - Test fails with bug, passes with fix
   - Add to test suite
   - Run tests: `pnpm test`

4. **Run verification - TEST NOW:**
   - Run typecheck: `pnpm check`
   - Run relevant tests
   - Verify bug is fixed
   - Check no regressions
   - Test related functionality

## OUTPUT

Return:
- Root cause identified
- Fix implemented (actual code changes)
- Files changed
- Regression test added
- Test results (all passing)
- Verification that bug is resolved

