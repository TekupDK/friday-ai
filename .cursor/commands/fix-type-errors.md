# Fix Type Errors

You are fixing TypeScript type errors in the codebase.

## TASK

Resolve all TypeScript compilation errors.

## STEPS

1) Run typecheck:
   - Execute `pnpm check` to see all errors
   - Focus on errors, not warnings initially
2) Categorize errors:
   - Missing type definitions
   - Type mismatches
   - Missing imports
   - Incorrect generic usage
3) Fix systematically:
   - Start with root cause errors (fixing these may resolve others)
   - Fix one file at a time
   - Use proper TypeScript types (avoid `any`)
   - Add type assertions only when necessary
4) Follow project patterns:
   - Use `type` for simple types
   - Use `interface` for objects
   - Export types from schema files
   - Use Drizzle type inference: `typeof table.$inferSelect`
5) Re-run typecheck:
   - Run `pnpm check` after each fix
   - Verify errors are resolved
   - Check for new errors introduced
6) Verify no runtime issues:
   - Run tests if available
   - Check that fixes don't break functionality

## OUTPUT

Provide:
- List of errors fixed
- Files modified
- Type improvements made
- Remaining errors (if any) with explanations

