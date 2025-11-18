# Contributing to Commands

Guide for creating, updating, and maintaining commands in Friday AI Chat.

## Creating New Commands

### 1. Use the Template

Copy `COMMAND_TEMPLATE.md` and fill in all sections following the structure exactly.

### 2. Follow Prompt Engineering Guide

All commands must follow `PROMPT_ENGINEERING_GUIDE.md` v2.2.0 standards:

- ROLE & CONTEXT
- COMMUNICATION STYLE
- REFERENCE MATERIALS
- TOOL USAGE
- REASONING PROCESS
- CODEBASE PATTERNS (where relevant)
- IMPLEMENTATION STEPS
- VERIFICATION
- OUTPUT FORMAT
- GUIDELINES

### 3. Include Real Examples

- Use actual code from the codebase
- Reference real files and patterns
- Include working examples
- Show Friday AI Chat specific patterns

### 4. Naming Convention

- Use `kebab-case.md` for file names
- Be descriptive: `create-trpc-procedure.md` not `trpc.md`
- Use action verbs: `create-`, `fix-`, `debug-`, `test-`

## Updating Existing Commands

### 1. Review Current Command

- Read the existing command
- Understand what it does
- Identify what needs updating

### 2. Follow Update Checklist

- [ ] Add missing prompt engineering sections
- [ ] Update code examples to match current code
- [ ] Update reference materials
- [ ] Verify all sections are complete
- [ ] Check examples still work

### 3. Update Metadata

- Update `COMMANDS_INDEX.md` if name/description changed
- Add entry to `CHANGELOG.md`
- Update this guide if patterns change

## Command Quality Standards

### Required Sections

All commands must have:

1. **ROLE & CONTEXT** - Clear role and project context
2. **TASK** - Single-sentence objective
3. **COMMUNICATION STYLE** - Tone, audience, format
4. **REFERENCE MATERIALS** - Relevant docs and files
5. **TOOL USAGE** - What tools to use and not use
6. **REASONING PROCESS** - How to think through the task
7. **IMPLEMENTATION STEPS** - Clear step-by-step process
8. **VERIFICATION** - How to verify completion
9. **OUTPUT FORMAT** - Expected output format
10. **GUIDELINES** - Best practices and constraints

### Optional Sections

- **CODEBASE PATTERNS** - If showing code examples
- **CRITICAL: START NOW** - If immediate action needed
- **ITERATIVE REFINEMENT** - If iterative process

## Testing Commands

### Before Committing

1. **Read the command** - Does it make sense?
2. **Check examples** - Do they match current code?
3. **Verify references** - Do files exist?
4. **Test structure** - Are all sections present?
5. **Check formatting** - Is markdown correct?

### After Committing

1. **Update CHANGELOG.md** - Document changes
2. **Update COMMANDS_INDEX.md** - If new command
3. **Test the command** - Use it in a real scenario

## Common Patterns

### Immediate Action Commands

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

````markdown
## CODEBASE PATTERNS (Follow These Exactly)

### Example: [Pattern Name]

```typescript
// Real code from codebase
export async function example() {
  // ...
}
```
````

````

### Verification Pattern

```markdown
## VERIFICATION

After [action]:
- ✅ [Check 1]
- ✅ [Check 2]
- ✅ [Check 3]
````

## Best Practices

1. **Be Specific** - Use actual file paths, function names, patterns
2. **Be Actionable** - Clear steps, not vague descriptions
3. **Be Complete** - All sections filled, no placeholders
4. **Be Accurate** - Examples match current code
5. **Be Consistent** - Follow existing patterns

## Review Process

Before submitting:

1. Self-review using this guide
2. Check against `PROMPT_ENGINEERING_GUIDE.md`
3. Verify examples work
4. Update metadata files
5. Test the command

## Questions?

- Check `PROMPT_ENGINEERING_GUIDE.md` for techniques
- Check `COMMANDS_INDEX.md` for similar commands
- Check `CHANGELOG.md` for recent patterns
- Review existing updated commands for examples
