---
name: optimize-ai-prompt
description: "[ai] Optimize AI Prompt - You are optimizing a prompt for Friday AI to improve response quality or reduce costs."
argument-hint: Optional input or selection
---

# Optimize AI Prompt

You are optimizing a prompt for Friday AI to improve response quality or reduce costs.

## TASK

Improve a prompt to get better results, reduce tokens, or lower costs.

## STEPS

1) Review current prompt:
   - Read prompt in `server/friday-prompts.ts`
   - Understand what it's trying to achieve
   - Check current performance metrics
   - Note any issues

2) Analyze the prompt:
   - Identify verbose sections
   - Find unclear instructions
   - Check for redundancy
   - Look for optimization opportunities

3) Apply optimizations:
   - Remove unnecessary text
   - Clarify instructions
   - Use more efficient phrasing
   - Structure for better parsing
   - Add examples if helpful

4) Consider model-specific optimizations:
   - Gemini: Shorter, direct prompts
   - Claude: Can handle longer context
   - GPT-4: Structured instructions work well
   - Adjust based on which model uses it

5) Test the optimized prompt:
   - Test with same scenarios
   - Compare response quality
   - Check token usage
   - Verify behavior unchanged

6) Update documentation:
   - Note why changes were made
   - Document performance improvements
   - Update related docs

## OUTPUT

Provide:
- Original prompt
- Optimized prompt
- Rationale for changes
- Performance improvements (tokens, quality)
- Test results

