# Implement Scenario: Refactor

You are refactoring existing code without changing functionality.

## TASK

Improve code structure, readability, and maintainability without altering behavior.

## STEPS

1. Understand the refactor scope:
   - Identify code to refactor
   - Current behavior to preserve
   - Areas to improve (structure, naming, types, etc.)
   - Dependencies to maintain

2. Plan the refactor:
   - Identify safe refactoring steps
   - Plan for backward compatibility
   - Consider breaking changes (avoid if possible)
   - Order refactoring steps

3. Execute refactoring:
   - Extract functions/components
   - Improve naming
   - Strengthen types
   - Reduce duplication
   - Improve organization

4. Maintain functionality:
   - Run tests after each step
   - Verify behavior unchanged
   - Check typecheck passes
   - Ensure no regressions

5. Update related code:
   - Update imports
   - Update documentation
   - Update tests if structure changed
   - Keep API contracts

## OUTPUT

Provide:

- Refactoring summary
- Files modified
- Improvements made
- Behavior preserved confirmation
- Test results
