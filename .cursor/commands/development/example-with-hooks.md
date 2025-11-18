# Example Command with Hooks

This is an example command showing how to integrate hooks.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Approach:** Use hooks for validation and verification
- **Quality:** Production-ready code with automatic checks

## TASK

Example task that demonstrates hook integration.

## HOOK EXECUTION

**Before starting work:**

1. **Execute pre-execution hooks:**

   ```typescript
   // Agent should call these hooks before starting:
   - validate-environment hook → Check environment variables
   - check-dependencies hook → Verify packages installed
   - validate-code-style hook → Check code style compliance
   ```

2. **If any hook fails:**
   - Stop execution
   - Report errors to user
   - Fix issues before continuing

**After completing work:**

1. **Execute post-execution hooks:**

   ```typescript
   // Agent should call these hooks after completing:
   - run-typecheck hook → Run `pnpm tsc --noEmit`
   - run-linter hook → Run `pnpm lint`
   ```

2. **If hooks find issues:**
   - Fix type errors
   - Fix linting errors
   - Re-run hooks until all pass

**If errors occur during execution:**

1. **Execute error hooks:**
   ```typescript
   // Agent should call these hooks on error:
   - error-logger hook → Log error with context
   - error-recovery hook → Attempt automatic recovery
   ```

## IMPLEMENTATION STEPS

1. **Pre-execution validation:**
   - Execute pre-execution hooks
   - Verify all checks pass
   - Proceed only if valid

2. **Main work:**
   - Perform the actual task
   - Follow project patterns
   - Handle errors gracefully

3. **Post-execution verification:**
   - Execute post-execution hooks
   - Fix any issues found
   - Verify all checks pass

## VERIFICATION

After completion:

- ✅ Pre-execution hooks passed
- ✅ Main work completed
- ✅ Post-execution hooks passed
- ✅ No type errors
- ✅ No linting errors

## OUTPUT FORMAT

```markdown
### Example Output

**Date:** 2025-01-28
**Status:** COMPLETE

**Pre-execution Hooks:**

- ✅ validate-environment: PASSED
- ✅ check-dependencies: PASSED
- ✅ validate-code-style: PASSED

**Work Completed:**

- [What was done]

**Post-execution Hooks:**

- ✅ run-typecheck: PASSED (0 errors)
- ✅ run-linter: PASSED (0 errors)

**Verification:**

- ✅ All hooks passed
- ✅ No errors found
```
