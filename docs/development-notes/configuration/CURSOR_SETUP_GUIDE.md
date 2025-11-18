# Cursor IDE Setup Guide - tekup-ai-v2

**Last Updated:** January 28, 2025  
**Purpose:** Complete guide for setting up and using Cursor IDE features in tekup-ai-v2

---

## Overview

This guide covers the complete Cursor IDE configuration for the Friday AI Chat project, including:
- Agent Hooks
- Terminal Integration
- Context Rules
- Custom Commands

---

## 1. Agent Hooks

### What Are Agent Hooks?

Agent hooks allow you to customize agent behavior at specific lifecycle points:
- **Pre-execution:** Before agent runs commands
- **Post-execution:** After agent completes tasks
- **Error:** When agent encounters errors
- **Context:** When agent needs additional context

### Configuration

Hooks are configured in `.cursor/hooks.json`:

```json
{
  "hooks": {
    "pre-execution": [
      {
        "name": "validate-environment",
        "file": ".cursor/hooks/pre-execution/validate-environment.ts",
        "enabled": true
      }
    ]
  }
}
```

### Available Hooks

#### Pre-execution Hooks

1. **validate-environment** - Validates environment variables
2. **check-dependencies** - Checks if dependencies are installed
3. **validate-code-style** - Validates code style

#### Post-execution Hooks

1. **run-typecheck** - Runs TypeScript type checking
2. **run-linter** - Runs ESLint
3. **update-documentation** - Updates documentation

#### Error Hooks

1. **error-logger** - Logs errors with context
2. **error-recovery** - Attempts automatic recovery

#### Context Hooks

1. **load-project-context** - Loads project-specific context
2. **load-codebase-context** - Loads codebase context

### Creating Custom Hooks

1. Create hook file in `.cursor/hooks/[category]/[name].ts`
2. Export hook function
3. Add to `.cursor/hooks.json`
4. Enable in configuration

**Example:**

```typescript
// .cursor/hooks/pre-execution/my-custom-hook.ts
export async function myCustomHook(): Promise<{ isValid: boolean }> {
  // Your hook logic
  return { isValid: true };
}
```

---

## 2. Terminal Integration

### Command Templates

Common commands are defined in `.cursor/terminal/templates.json`:

```json
{
  "templates": {
    "typecheck": {
      "command": "pnpm tsc --noEmit",
      "description": "Run TypeScript type checking",
      "safe": true
    }
  }
}
```

### Command Validation

Commands are validated before execution to prevent:
- Destructive operations
- Unauthorized commands
- Security risks

**Validation Rules:**
- Blacklisted commands are blocked
- Risky commands require confirmation
- Only whitelisted commands are allowed

### Using Terminal Commands

**In Commands:**
```markdown
## TOOL USAGE

**Use these tools:**
- `run_terminal_cmd` - Execute terminal commands
```

**In Code:**
```typescript
// Commands are validated automatically
await run_terminal_cmd("pnpm tsc --noEmit");
```

### Command Categories

- **validation** - Type checking, linting
- **testing** - Running tests
- **database** - Database operations
- **development** - Dev server, hot reload
- **build** - Production builds
- **formatting** - Code formatting

---

## 3. Context Rules

### Rules File

Rules are defined in `.cursorrules` and `docs/CURSOR_RULES.md`.

### Rule Categories

1. **Project Context** - Project overview and stack
2. **Code Style** - TypeScript, React, naming conventions
3. **File Structure** - Organization rules
4. **Database Schema** - Database design rules
5. **tRPC API** - API patterns
6. **Frontend Patterns** - React patterns
7. **Testing Guidelines** - Testing standards
8. **Security Guidelines** - Security best practices

### Using Rules

Rules are automatically applied by the Cursor agent. You can reference specific rules in commands:

```markdown
## REFERENCE MATERIALS

- `.cursorrules` - Project rules and guidelines
- `docs/CURSOR_RULES.md` - Extended documentation
```

### Rule Priority

Rules are organized by priority:
- **P0** - Critical (must follow)
- **P1** - High (should follow)
- **P2** - Medium (recommended)
- **P3** - Low (optional)

---

## 4. Custom Commands

### Command Structure

Commands are defined in `.cursor/commands/[name].md`:

```markdown
# Command Name

You are a [role] doing [task]. START WORKING immediately.

## TASK
[What the command does]

## TOOL USAGE
[What tools to use]

## OUTPUT
[What to provide]
```

### Available Commands

See `.cursor/commands/COMMANDS_INDEX.md` for complete list.

**Popular Commands:**
- `analyze-user-intent.md` - Analyze user requirements
- `debug-issue.md` - Debug issues systematically
- `implement-from-chat-summary.md` - Implement from chat
- `add-documentation.md` - Add documentation
- `create-sprint-todos.md` - Create sprint todos

### Creating Custom Commands

1. Create `.cursor/commands/[name].md`
2. Follow command template
3. Add to `COMMANDS_INDEX.md`
4. Test with `/command-name`

---

## 5. Workspace Configuration

### Workspace Settings

Configured in `tekup-ai-v2.code-workspace`:

```json
{
  "settings": {
    "cursor.general.enableCloudAgents": true,
    "github.copilot.chat.mcp.servers": {
      "playwright": { ... },
      "postgres": { ... },
      "filesystem": { ... },
      "fetch": { ... }
    }
  }
}
```

### MCP Servers

**Available Servers:**
- **playwright** - Browser automation
- **postgres** - Database access
- **filesystem** - File operations
- **fetch** - Web content fetching

---

## 6. Best Practices

### Using Hooks

1. **Keep hooks focused** - One responsibility per hook
2. **Handle errors gracefully** - Don't crash on hook failures
3. **Log appropriately** - Use structured logging
4. **Test hooks** - Verify hook behavior

### Using Terminal

1. **Use templates** - Prefer templates over raw commands
2. **Validate commands** - Always validate before execution
3. **Handle output** - Parse command output appropriately
4. **Confirm risky operations** - Require confirmation for destructive commands

### Using Rules

1. **Keep rules updated** - Update rules as project evolves
2. **Be specific** - Clear, actionable rules
3. **Provide examples** - Include code examples
4. **Document rationale** - Explain why rules exist

### Using Commands

1. **Be explicit** - Clear task definition
2. **Provide context** - Include relevant information
3. **Define output** - Specify expected output format
4. **Test commands** - Verify command behavior

---

## 7. Troubleshooting

### Hooks Not Executing

1. Check `.cursor/hooks.json` configuration
2. Verify hook files exist
3. Check hook enabled status
4. Review hook execution logs

### Terminal Commands Failing

1. Check command validation
2. Verify command is whitelisted
3. Check for required confirmations
4. Review command output

### Rules Not Applied

1. Check `.cursorrules` file exists
2. Verify rule syntax
3. Check rule priority
4. Review agent context

### Commands Not Working

1. Check command file exists
2. Verify command syntax
3. Check command is in index
4. Review command output

---

## 8. References

- [Cursor Agent Hooks Documentation](https://cursor.com/docs/agent/hooks)
- [Cursor Terminal Documentation](https://cursor.com/docs/agent/terminal)
- [Cursor Context Rules Documentation](https://cursor.com/docs/context/rules)
- [Cursor Configuration Analysis](../../status-reports/reviews/CURSOR_CONFIGURATION_ANALYSIS.md)
- [Cursor Rules Documentation](./CURSOR_RULES.md)

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team

