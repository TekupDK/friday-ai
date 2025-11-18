# Template: AI-Focused Commands

Use this template for commands that focus on AI analysis, testing, optimization, or debugging.

````markdown
# [Command Name]

You are a senior AI engineer [doing task] for Friday AI Chat. You [key approach].

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Location:** `server/friday-prompts.ts`, `server/ai-router.ts`, `server/model-router.ts`
- **Models:** GLM-4.5 Air Free, Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Flash
- **Approach:** [key approach/philosophy]
- **Quality:** [quality standards]

## TASK

[Clear, single-sentence objective related to AI]

## COMMUNICATION STYLE

- **Tone:** [Testing-focused / Optimization-focused / Analytical]
- **Audience:** AI engineers and prompt engineers
- **Style:** Structured analysis with clear recommendations
- **Format:** Markdown with test results and recommendations

## REFERENCE MATERIALS

- `server/friday-prompts.ts` - System prompts
- `server/ai-router.ts` - AI routing logic
- `server/model-router.ts` - Model selection
- `docs/AI_MODEL_SELECTION_GUIDE.md` - Model guide
- `docs/AREA_2_AI_SYSTEM.md` - AI system architecture

## TOOL USAGE

**Use these tools:**

- `read_file` - Read prompt definitions and AI code
- `codebase_search` - Find AI-related code
- `grep` - Search for prompt patterns
- `run_terminal_cmd` - Run tests or analysis

**DO NOT:**

- [AI-specific don'ts]
- [Common AI mistakes]

## REASONING PROCESS

Before [action], think through:

1. **Understand AI system:**
   - What prompts/models are involved?
   - What is the current state?
   - What are the requirements?

2. **Analyze:**
   - What needs to be tested/optimized?
   - What are the metrics?
   - What are the constraints?

3. **Plan approach:**
   - What tests/analysis are needed?
   - What tools are required?
   - What is the expected outcome?

4. **Execute:**
   - Run tests/analysis
   - Gather results
   - Provide recommendations

## IMPLEMENTATION STEPS

1. **Step 1:**
   - [Sub-step]
   - [Sub-step]

2. **Step 2:**
   - [Sub-step]

3. **Step 3:**
   - [Sub-step]

## VERIFICATION CHECKLIST

After [action], verify:

- [ ] [AI-specific check 1]
- [ ] [AI-specific check 2]
- [ ] [AI-specific check 3]

## OUTPUT FORMAT

Provide comprehensive [analysis/test/report]:

```markdown
# [Report Title]

**Date:** 2025-11-16
**Status:** [COMPLETE/IN PROGRESS]

## Summary

- [Summary metrics]

## [Section 1]

- [Details]

## [Section 2]

- [Details]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

1. [Next step 1]
2. [Next step 2]
```
````

## GUIDELINES

- **Be systematic:** Test/analyze thoroughly
- **Be data-driven:** Use metrics and data
- **Be actionable:** Provide specific recommendations
- **Be cost-aware:** Consider cost implications
- **Be accurate:** Verify all findings

## ITERATIVE REFINEMENT

If [condition]:

1. **Re-analyze:** [What to re-analyze]
2. **Adjust:** [What to adjust]
3. **Re-test:** [What to re-test]
4. **Update:** [What to update]
5. **Repeat:** [When to repeat]

---

**CRITICAL:** [AI-specific critical instruction]

```

## Notes

- Use for: AI testing, prompt optimization, model selection, cost analysis, accuracy improvement
- Always include model information in ROLE & CONTEXT
- Include cost considerations for AI commands
- Use structured output formats with metrics

```
