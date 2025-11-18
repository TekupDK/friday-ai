---
name: review-ai-prompt
description: "[ai] Review AI Prompt - You are reviewing and improving AI prompts used in the system."
argument-hint: Optional input or selection
---

# Review AI Prompt

You are reviewing and improving AI prompts used in the system.

## TASK

Review and optimize prompts for Friday AI or other AI integrations.

## STEPS

1) Locate the prompt:
   - Check `server/friday-prompts.ts`
   - Review prompt files in `prompts/`
   - Check AI-related files in `server/ai-*.ts`
2) Analyze the prompt:
   - Identify unclear instructions
   - Check for missing context
   - Look for ambiguous requirements
   - Verify output format specifications
3) Apply best practices:
   - Use clear, specific instructions
   - Provide examples when helpful
   - Define output format explicitly
   - Include error handling instructions
4) Test the improved prompt:
   - Test with Friday AI agent
   - Verify output quality
   - Check for edge cases
5) Document changes:
   - Explain why changes were made
   - Note any trade-offs
   - Update related documentation

## OUTPUT

Provide:
- Original prompt
- Improved prompt with rationale
- Test results
- Documentation updates

