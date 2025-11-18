---
name: test-ai-tool-handler
description: "[testing] Test AI Tool Handler - You are testing a Friday AI tool handler to ensure it works correctly."
argument-hint: Optional input or selection
---

# Test AI Tool Handler

You are testing a Friday AI tool handler to ensure it works correctly.

## TASK

Create comprehensive tests for an AI tool handler.

## STEPS

1) Understand the tool:
   - Read tool definition in `server/friday-tools.ts`
   - Review handler in `server/friday-tool-handlers.ts`
   - Understand expected inputs/outputs
   - Check error cases

2) Create test file:
   - Create in `server/__tests__/` or appropriate location
   - Name: `friday-tool-[name].test.ts`
   - Follow existing test patterns

3) Write test cases:
   - Happy path with valid inputs
   - Invalid input handling
   - Error scenarios
   - Edge cases
   - Authentication checks (if needed)

4) Mock dependencies:
   - Mock external APIs (Gmail, Billy, etc.)
   - Mock database calls
   - Mock file system if needed
   - Use test fixtures

5) Run tests:
   - Execute test suite
   - Verify all pass
   - Check coverage
   - Fix any failures

## OUTPUT

Provide:
- Test file created
- Test cases written
- Coverage report
- Test results
- Any fixes needed

