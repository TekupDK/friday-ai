# Debug Friday AI Agent

You are debugging issues with the Friday AI agent system.

## TASK

Identify and fix problems with Friday AI agent responses, tool execution, or behavior.

## STEPS

1) Understand the issue:
   - Read error messages or logs
   - Reproduce the problem
   - Identify when it occurs
   - Check user's intended action vs actual result

2) Check AI router:
   - Review `server/ai-router.ts`
   - Check model routing logic
   - Verify prompt construction
   - Check context handling

3) Review Friday tools:
   - Check `server/friday-tools.ts` for tool definitions
   - Review `server/friday-tool-handlers.ts` for implementations
   - Verify tool parameters are correct
   - Check tool execution flow

4) Check prompts:
   - Review `server/friday-prompts.ts`
   - Verify system prompts are correct
   - Check for prompt injection risks
   - Ensure instructions are clear

5) Debug model responses:
   - Check which model was used
   - Review raw LLM response
   - Verify function calling worked
   - Check response parsing

6) Test the fix:
   - Reproduce original issue
   - Verify fix works
   - Test related functionality
   - Check for regressions

## OUTPUT

Provide:
- Issue identified
- Root cause analysis
- Fix implemented
- Files modified
- Test results
- Prevention measures

