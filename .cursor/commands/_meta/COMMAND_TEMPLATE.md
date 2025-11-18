# Command Template

Use this template when creating new commands. Copy this template and fill in the sections.

````markdown
# [Command Name]

You are [role] doing [task] for Friday AI Chat. [Key constraint/approach].

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** [React 19 + TypeScript + tRPC 11 + Drizzle ORM / relevant stack]
- **Approach:** [key approach/philosophy]
- **Quality:** [quality standards]

## TASK

[Clear, single-sentence objective]

## COMMUNICATION STYLE

- **Tone:** [Professional / Friendly / Technical / Action-oriented]
- **Audience:** [Senior engineers / Developers / QA / etc.]
- **Style:** [Clear, concise, technical / etc.]
- **Format:** [Markdown with code examples / etc.]

## REFERENCE MATERIALS

- `docs/[relevant-doc].md` - [Description]
- `[code-file].ts` - [Pattern example]
- `docs/DEVELOPMENT_GUIDE.md` - Development patterns
- `docs/ARCHITECTURE.md` - System architecture

## HOOK EXECUTION

**Before starting work, execute pre-execution hooks:**

1. **Validate Environment:**
   - Check if required environment variables are set
   - Verify configuration is correct
   - Use: `validate-environment` hook

2. **Check Dependencies:**
   - Verify required packages are installed
   - Check for version compatibility
   - Use: `check-dependencies` hook

3. **Validate Code Style:**
   - Ensure code follows project style guidelines
   - Check against `.cursorrules`
   - Use: `validate-code-style` hook

**After completing work, execute post-execution hooks:**

1. **Run TypeCheck:**
   - Execute `pnpm tsc --noEmit`
   - Fix any type errors found
   - Use: `run-typecheck` hook

2. **Run Linter:**
   - Execute `pnpm lint`
   - Fix any linting errors
   - Use: `run-linter` hook

**If errors occur, execute error hooks:**

1. **Log Error:**
   - Log error with full context
   - Include stack trace and file location
   - Use: `error-logger` hook

2. **Attempt Recovery:**
   - Try automatic error recovery
   - Suggest fixes if recovery fails
   - Use: `error-recovery` hook

## TOOL USAGE

**Use these tools:**

- `read_file` - [When to use]
- `codebase_search` - [When to use]
- `grep` - [When to use]
- `search_replace` - [When to use]
- `run_terminal_cmd` - [When to use]

**DO NOT:**

- [What not to do]
- [Common mistake to avoid]

## REASONING PROCESS

Before [action], think through:

1. **Understand [context]:**
   - [Question 1]
   - [Question 2]

2. **Review [something]:**
   - [What to review]
   - [What to check]

3. **Plan [action]:**
   - [Step 1]
   - [Step 2]

4. **Execute:**
   - [How to execute]
   - [What to verify]

## CODEBASE PATTERNS (Follow These Exactly)

[If applicable - include code examples from actual codebase]

### Example: [Pattern Name]

```typescript
// Actual code example from codebase
```
````

## IMPLEMENTATION STEPS

1. **Step 1:**
   - [Sub-step]
   - [Sub-step]

2. **Step 2:**
   - [Sub-step]

3. **Step 3:**
   - [Sub-step]

## VERIFICATION

After [action]:

- ✅ [Check 1]
- ✅ [Check 2]
- ✅ [Check 3]

## OUTPUT FORMAT

**IMPORTANT:** Always use `2025-11-16` as the date in output templates (or current date if different).

```markdown
### [Output Title]

**Date:** 2025-11-16
**Status:** [COMPLETE/IN PROGRESS]

**Summary:**

- [What was done]

**Details:**

- [Detail 1]
- [Detail 2]

**Verification:**

- ✅ [Result]
```

## GUIDELINES

- **Guideline 1:** [Description]
- **Guideline 2:** [Description]
- **Guideline 3:** [Description]

````

## Date Standardization

**IMPORTANT:** Always use `2025-11-16` as the date in output templates (or current date if different).

**Standard format:**
```markdown
**Date:** 2025-11-16
````

**Do NOT use:**

- `[DATE]`
- `[Date]`
- `[date]`
- `[DATE/TIME]`
- `[Date/Time]`

## Template Selection

For specific command types, use specialized templates:

- **AI-Focused:** Use `TEMPLATE_AI_FOCUSED.md` for AI-related commands
- **Analysis:** Use `TEMPLATE_ANALYSIS.md` for analysis commands
- **Debug:** Use `TEMPLATE_DEBUG.md` for debugging commands
- **General:** Use this template for other commands

See `TEMPLATE_GUIDE.md` for detailed template selection guide.

## Notes

- All sections are required unless marked optional
- Follow the exact structure shown
- Include real code examples from the codebase when possible
- Be specific and actionable
- Reference actual files and patterns from the project
- Always use `2025-11-16` for dates in output formats
