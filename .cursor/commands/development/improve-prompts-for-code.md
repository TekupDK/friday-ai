# Improve Prompts for Code

**Purpose:** Optimize prompts for code-focused LLMs using best practices

## Quick Reference

### Prompt Structure Template
```
## ROLE
[What is the AI's role and expertise?]

## TASK
[What specific task should be completed?]

## CONTEXT
- Codebase: [What code/files?]
- Scope: [What's in/out?]
- Known Issues: [References]

## CONSTRAINTS
- Time Limit: [How long?]
- Priority: [What's most important?]
- Output Format: [What format?]

## STEPS
[Numbered, specific steps with outputs]

## OUTPUT FORMAT
[Specific deliverables with file names]

## VERIFICATION CRITERIA
[How to know it's done correctly?]
```

## Key Improvements Applied

### ✅ Role Definition
- Clear role (senior engineer, bug hunter, TDD developer)
- Expertise areas specified

### ✅ Task Clarity
- Specific, actionable task
- Clear scope and boundaries

### ✅ Context Provided
- File paths, code structure
- Known issues, test coverage
- Environment details

### ✅ Constraints Defined
- Time limits
- Priority levels
- Output formats
- Code style requirements

### ✅ Concrete Output
- Specific file names and locations
- Code examples with line numbers
- Verifiable deliverables

### ✅ Verification Criteria
- Clear success metrics
- Test requirements
- Documentation standards

## Examples

### Improved Prompts Available:
1. **Exploratory Debugging** - `docs/IMPROVED_CODE_PROMPTS.md#prompt-1`
2. **AI Bug Hunter** - `docs/IMPROVED_CODE_PROMPTS.md#prompt-2`
3. **Minimal Reproducible Test** - `docs/IMPROVED_CODE_PROMPTS.md#prompt-3`

### When to Use:
- **Full Version:** Complex bugs, team documentation, learning points
- **Minimal Version:** Quick fixes, familiar codebase, time-constrained

## See Full Documentation
`docs/IMPROVED_CODE_PROMPTS.md` - Complete analysis and improved versions
