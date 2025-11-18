# Hook-Command Integration Guide

**Last Updated:** January 28, 2025  
**Purpose:** Complete guide for integrating hooks with commands

---

## Overview

This guide explains how to integrate the hook system with Cursor commands, enabling automatic validation and verification throughout the agent's workflow.

---

## How It Works

### Architecture

```
Command Called → Pre-execution Hooks → Command Execution → Post-execution Hooks
                                      ↓
                                 Error Hooks (if error)
```

### Flow

1. **User calls command** (e.g., `/implement-feature`)
2. **Pre-execution hooks run** (validate environment, check dependencies)
3. **Command executes** (agent follows command instructions)
4. **Post-execution hooks run** (typecheck, lint)
5. **Error hooks run** (if any errors occurred)

---

## Integration Methods

### Method 1: Instruction-Based (Recommended)

Commands include hook execution instructions that the agent follows:

```markdown
## HOOK EXECUTION

**Before starting work:**

1. Execute `validate-environment` hook
2. Execute `check-dependencies` hook
3. Execute `validate-code-style` hook

**After completing work:**

1. Execute `run-typecheck` hook
2. Execute `run-linter` hook
```

**Advantages:**

- ✅ Works with current Cursor setup
- ✅ No code changes needed
- ✅ Agent follows instructions naturally
- ✅ Easy to customize per command

**Disadvantages:**

- ⚠️ Relies on agent following instructions
- ⚠️ Not automatic (requires instructions)

### Method 2: Programmatic (Future)

Hooks execute automatically via executor:

```typescript
import { executePreExecutionHooks } from ".cursor/hooks/executor";

// Automatically runs before command
await executePreExecutionHooks({
  command: "implement-feature",
  timestamp: new Date().toISOString(),
});
```

**Advantages:**

- ✅ Fully automatic
- ✅ No manual instructions needed
- ✅ Consistent execution

**Disadvantages:**

- ⚠️ Requires Cursor API support
- ⚠️ Not yet available

---

## Command Template Integration

### Updated Template

The command template (`.cursor/commands/_meta/COMMAND_TEMPLATE.md`) now includes a **HOOK EXECUTION** section:

```markdown
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
```

### Using in Commands

When creating a new command, include the hook execution section:

```markdown
# My New Command

## HOOK EXECUTION

**Before starting:**

- Execute pre-execution hooks (validate-environment, check-dependencies)

**After completing:**

- Execute post-execution hooks (run-typecheck, run-linter)
```

---

## Examples

### Example 1: Simple Command

```markdown
# Create Component

## HOOK EXECUTION

**Before starting:**

1. Execute `validate-code-style` hook

**After completing:**

1. Execute `run-typecheck` hook
2. Execute `run-linter` hook

## TASK

Create a new React component following project patterns.
```

### Example 2: Complex Command

```markdown
# Implement Feature

## HOOK EXECUTION

**Before starting:**

1. Execute `validate-environment` hook
2. Execute `check-dependencies` hook
3. Execute `validate-code-style` hook

**After completing:**

1. Execute `run-typecheck` hook
2. Execute `run-linter` hook
3. Execute `update-documentation` hook (if enabled)

**If errors occur:**

1. Execute `error-logger` hook
2. Execute `error-recovery` hook

## TASK

Implement a complete feature with backend and frontend.
```

---

## Hook Execution Utilities

### Executor

The hook executor (`.cursor/hooks/executor.ts`) provides functions to execute hooks:

```typescript
import {
  executePreExecutionHooks,
  executePostExecutionHooks,
  executeErrorHooks,
} from ".cursor/hooks/executor";

// Execute pre-execution hooks
const preResults = await executePreExecutionHooks({
  command: "implement-feature",
  timestamp: new Date().toISOString(),
});

// Execute post-execution hooks
const postResults = await executePostExecutionHooks({
  command: "implement-feature",
  timestamp: new Date().toISOString(),
});

// Execute error hooks
const errorResults = await executeErrorHooks(
  new Error("Something went wrong"),
  {
    command: "implement-feature",
    timestamp: new Date().toISOString(),
  }
);
```

### Loader

The hook loader (`.cursor/hooks/loader.ts`) provides functions to load hook configuration:

```typescript
import { getHooksForCategory, getAllEnabledHooks } from ".cursor/hooks/loader";

// Get all pre-execution hooks
const preHooks = getHooksForCategory("pre-execution");

// Get all enabled hooks
const allHooks = getAllEnabledHooks();
```

---

## Best Practices

### 1. Always Include Pre-execution Hooks

```markdown
## HOOK EXECUTION

**Before starting:**

- Execute `validate-environment` hook
- Execute `check-dependencies` hook
```

### 2. Always Include Post-execution Hooks

```markdown
**After completing:**

- Execute `run-typecheck` hook
- Execute `run-linter` hook
```

### 3. Handle Errors

```markdown
**If errors occur:**

- Execute `error-logger` hook
- Execute `error-recovery` hook
```

### 4. Be Specific

Instead of:

```markdown
- Run hooks
```

Use:

```markdown
- Execute `validate-environment` hook
- Execute `run-typecheck` hook
```

---

## Troubleshooting

### Hooks Not Executing

**Problem:** Hooks don't run when command is called.

**Solutions:**

1. Check hook is enabled in `.cursor/hooks.json`
2. Verify hook file exists
3. Ensure command includes hook execution instructions
4. Check hook priority (lower = runs first)

### Hook Errors

**Problem:** Hook execution fails.

**Solutions:**

1. Check hook file syntax
2. Verify hook function is exported
3. Check hook return type matches expected
4. Review hook logs for details

### Integration Issues

**Problem:** Commands don't call hooks.

**Solutions:**

1. Add HOOK EXECUTION section to command
2. Use specific hook names
3. Follow command template structure
4. Test with example command

---

## Next Steps

1. **Update Existing Commands:**
   - Add hook execution to high-priority commands
   - Test hook execution
   - Verify integration works

2. **Create New Commands:**
   - Use updated template
   - Include hook execution
   - Test thoroughly

3. **Monitor Hook Execution:**
   - Review hook results
   - Fix any issues
   - Optimize hook performance

---

## References

- [Cursor Setup Guide](../../development-notes/configuration/CURSOR_SETUP_GUIDE.md)
- [Command Template](../../../../.cursor/commands/_meta/COMMAND_TEMPLATE.md)
- [Hook Executor](../.cursor/hooks/executor.ts)
- [Hook Loader](../.cursor/hooks/loader.ts)
- [Example Command](../../../../.cursor/commands/example-with-hooks.md)

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team
