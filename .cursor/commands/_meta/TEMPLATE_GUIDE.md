# Template Guide - Friday AI Chat Commands

This guide explains when to use which template for creating new commands.

## Available Templates

### 1. Base Template
**File:** `COMMAND_TEMPLATE.md`
**Use for:** General commands that don't fit specific categories
**When to use:** Default template for most commands

### 2. AI-Focused Template
**File:** `TEMPLATE_AI_FOCUSED.md`
**Use for:** Commands related to AI analysis, testing, optimization, debugging
**Examples:**
- `test-ai-prompts.md`
- `optimize-ai-model-selection.md`
- `analyze-ai-costs.md`
- `debug-ai-responses.md`
- `improve-ai-accuracy.md`

**Key features:**
- Includes model information
- Cost considerations
- AI-specific metrics
- Model comparison patterns

### 3. Analysis Template
**File:** `TEMPLATE_ANALYSIS.md`
**Use for:** Commands that analyze code, systems, performance, or data
**Examples:**
- `analyze-api-performance.md`
- `analyze-codebase-health.md`
- `analyze-changes.md`
- `analyze-workspace-structure.md`

**Key features:**
- Structured analysis approach
- Metrics and data focus
- Actionable recommendations
- Comprehensive reporting

### 4. Debug Template
**File:** `TEMPLATE_DEBUG.md`
**Use for:** Commands that debug issues, fix bugs, or troubleshoot
**Examples:**
- `debug-issue.md`
- `debug-ai-responses.md`
- `fix-bug.md`
- `root-cause-analysis.md`

**Key features:**
- Root cause analysis
- Systematic debugging approach
- Minimal, safe changes
- Verification steps

## Template Selection Guide

### Choose AI-Focused Template if:
- ✅ Command involves AI models, prompts, or responses
- ✅ Command tests or optimizes AI systems
- ✅ Command analyzes AI costs or performance
- ✅ Command debugs AI-related issues

### Choose Analysis Template if:
- ✅ Command analyzes code, systems, or data
- ✅ Command provides metrics and insights
- ✅ Command compares different approaches
- ✅ Command identifies patterns or issues

### Choose Debug Template if:
- ✅ Command fixes bugs or issues
- ✅ Command troubleshoots problems
- ✅ Command requires root cause analysis
- ✅ Command makes code changes to fix issues

### Choose Base Template if:
- ✅ Command doesn't fit specific categories
- ✅ Command is a general utility
- ✅ Command creates or modifies code
- ✅ Command is documentation-related

## Date Standardization

**IMPORTANT:** All output templates must use `2025-11-16` as the date (or current date if different).

**Standard format:**
```markdown
**Date:** 2025-11-16
```

**Do NOT use:**
- `[DATE]`
- `[Date]`
- `[date]`
- `[DATE/TIME]`
- `[Date/Time]`

## Template Customization

When using a template:

1. **Copy the template** - Don't modify the template file itself
2. **Fill in placeholders** - Replace all `[placeholder]` text
3. **Add specific sections** - Add command-specific sections as needed
4. **Update date** - Always use `2025-11-16` in output formats
5. **Include real examples** - Use actual code from the codebase

## Common Patterns

### Immediate Action Commands
Add this section for commands that need immediate action:

```markdown
## CRITICAL: START NOW

**DO NOT:**
- Wait for approval
- Just plan without implementing

**DO:**
- Start immediately
- Make actual changes
```

### Code Example Pattern
Always include real code examples:

```markdown
## CODEBASE PATTERNS (Follow These Exactly)

### Example: [Pattern Name]
```typescript
// Real code from codebase
export async function example() {
  // ...
}
```
```

### Verification Pattern
Always include verification:

```markdown
## VERIFICATION CHECKLIST

After [action], verify:

- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]
```

## Best Practices

1. **Use the right template** - Match template to command type
2. **Fill all sections** - Don't leave placeholders
3. **Include real examples** - Use actual codebase code
4. **Standardize dates** - Always use `2025-11-16` format
5. **Be specific** - Use actual file paths and patterns
6. **Be actionable** - Clear steps, not vague descriptions
7. **Be complete** - All sections filled, no missing parts

## Questions?

- Check `PROMPT_ENGINEERING_GUIDE.md` for techniques
- Check `COMMANDS_INDEX.md` for similar commands
- Check `CHANGELOG.md` for recent patterns
- Check existing commands for examples

---

**Last Updated:** 2025-11-16

