# Cursor Agent Hooks

Hook execution system for Cursor IDE agent.

## Structure

```
.cursor/hooks/
├── types.ts              # Type definitions
├── loader.ts              # Hook configuration loader
├── executor.ts            # Hook execution engine
├── README.md              # This file
├── pre-execution/         # Pre-execution hooks
├── post-execution/        # Post-execution hooks
├── error/                 # Error hooks
└── context/               # Context hooks
```

## Features

- ✅ **Actual Hook Execution** - Hooks are dynamically imported and executed
- ✅ **Robust Error Handling** - Configuration loading with safe defaults
- ✅ **Logging System** - Complete logging for debugging and monitoring
- ✅ **Parallel Execution** - Support for parallel hook execution
- ✅ **Type Safety** - Category-specific hook function types
- ✅ **Timeout Protection** - Automatic timeout handling

## Usage

### In Commands

Commands can call hooks by instructing the agent:

```markdown
## HOOK EXECUTION

Before starting work:

1. Execute pre-execution hooks:
   - Run `validate-environment` hook
   - Run `check-dependencies` hook
   - Run `validate-code-style` hook

After completing work:

1. Execute post-execution hooks:
   - Run `run-typecheck` hook
   - Run `run-linter` hook
```

### Programmatic Usage

```typescript
import { executePreExecutionHooks } from "./executor";

const results = await executePreExecutionHooks({
  command: "implement-feature",
  timestamp: new Date().toISOString(),
});

for (const result of results) {
  if (!result.success) {
    console.error("Hook failed:", result.error);
  }
}
```

## Hook Categories

### Pre-execution

Runs before agent starts work:

- `validate-environment` - Validates environment
- `check-dependencies` - Checks dependencies
- `validate-code-style` - Validates code style

### Post-execution

Runs after agent completes work:

- `run-typecheck` - TypeScript type checking
- `run-linter` - ESLint
- `update-documentation` - Updates docs

### Error

Runs when errors occur:

- `error-logger` - Logs errors
- `error-recovery` - Attempts recovery

### Context

Runs to load context:

- `load-project-context` - Loads project context
- `load-codebase-context` - Loads codebase context

## Configuration

Hooks are configured in `.cursor/hooks.json`:

```json
{
  "hooks": {
    "pre-execution": [
      {
        "name": "validate-environment",
        "file": ".cursor/hooks/pre-execution/validate-environment.ts",
        "enabled": true,
        "priority": 1
      }
    ]
  }
}
```

## Execution Order

Hooks execute in priority order (1 = first):

1. Priority 1 hooks
2. Priority 2 hooks
3. Priority 3 hooks

## Error Handling

- Hooks can fail without stopping execution (unless `stopOnError: true`)
- Errors are logged and returned in results
- Error hooks run when other hooks fail

## Logging

The hook system includes comprehensive logging:

```typescript
import { hookLogger } from "./logger";

// Get execution statistics
const stats = hookLogger.getStats();
console.log(`Completed: ${stats.completed}, Failed: ${stats.failed}`);

// Get logs for a specific hook
const logs = hookLogger.getLogsForHook("validate-environment");

// Export logs
const logData = hookLogger.export();
```

## Error Handling

The system includes robust error handling:

- **Configuration Loading**: Falls back to safe defaults if hooks.json is missing
- **Hook Execution**: Catches and logs all errors
- **Timeout Protection**: Automatically times out slow hooks
- **Import Errors**: Tries multiple import strategies (.ts, .js, no extension)

## Examples

See `.cursor/commands/` for examples of commands using hooks.

## Implementation Details

### Hook Execution Flow

1. **Load Configuration** - Reads `.cursor/hooks.json` with error handling
2. **Filter Enabled Hooks** - Only executes enabled hooks
3. **Sort by Priority** - Executes in priority order (1 = first)
4. **Dynamic Import** - Loads hook file dynamically
5. **Execute Hook** - Runs hook function with timeout protection
6. **Log Results** - Logs execution status and duration
7. **Return Results** - Returns success/failure with data/errors
