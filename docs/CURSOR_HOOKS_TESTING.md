# Cursor Hooks Testing System

**Author:** TekupDK Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

## Overview

Comprehensive testing infrastructure for the Cursor Agent Hooks system. This testing system ensures that hooks execute correctly, configuration loading is robust, logging works properly, and error handling functions as expected.

The testing system includes:
- **Test Utilities:** Factories, builders, and assertion helpers
- **Test Fixtures:** Mock hooks, configurations, and contexts
- **Test Suites:** Unit, integration, and validation tests
- **Coverage:** >80% coverage of hook system functionality

## Architecture

### Test Structure

```
.cursor/hooks/
├── test-utils/              # Test utilities
│   ├── mock-hook-factory.ts    # Factory for creating mock hooks
│   ├── config-builder.ts       # Builder for test configurations
│   ├── context-builder.ts       # Builder for test contexts
│   └── assertions.ts           # Custom assertion helpers
├── __tests__/               # Test files
│   ├── executor.test.ts        # Hook executor tests
│   ├── loader.test.ts          # Configuration loader tests
│   ├── logger.test.ts          # Logging system tests
│   ├── integration.test.ts     # Integration tests
│   ├── validation.test.ts      # Validation tests
│   └── fixtures/               # Test fixtures
│       ├── mock-hooks/          # Mock hook implementations
│       ├── configs/              # Test configurations
│       └── contexts/              # Test execution contexts
```

### Test Categories

1. **Unit Tests:**
   - Executor tests (hook execution, timeout, error handling)
   - Loader tests (configuration loading, validation, caching)
   - Logger tests (logging, statistics, export)

2. **Integration Tests:**
   - Full hook execution flow
   - Hook-command integration
   - Multiple hooks execution

3. **Validation Tests:**
   - Configuration validation
   - Hook result validation
   - Error handling validation

## API Reference

### Test Utilities

#### Mock Hook Factory

**Location:** `.cursor/hooks/test-utils/mock-hook-factory.ts`

**Functions:**

```typescript
/**
 * Create a mock hook that always succeeds
 */
export function createSuccessHook<T extends HookResult = HookResult>(
  returnValue?: Partial<T>
): HookFunction<T>

/**
 * Create a mock hook that always fails
 */
export function createFailureHook<T extends HookResult = HookResult>(
  errorMessage?: string
): HookFunction<T>

/**
 * Create a mock hook that times out
 */
export function createTimeoutHook<T extends HookResult = HookResult>(
  timeout?: number
): HookFunction<T>

/**
 * Create a mock hook that throws an error
 */
export function createErrorHook<T extends HookResult = HookResult>(
  errorMessage?: string
): HookFunction<T>

/**
 * Create a mock hook with custom behavior
 */
export function createMockHook<T extends HookResult = HookResult>(
  options?: MockHookOptions
): HookFunction<T>
```

**Example:**
```typescript
import { createSuccessHook, createFailureHook } from "../test-utils/mock-hook-factory";

const successHook = createSuccessHook({ data: { test: "value" } });
const failureHook = createFailureHook("Custom error message");
```

#### Configuration Builder

**Location:** `.cursor/hooks/test-utils/config-builder.ts`

**Class:** `ConfigBuilder`

**Methods:**

```typescript
/**
 * Add a hook to a category
 */
addHook(category: HookCategory, hook: Omit<HookConfig, "enabled" | "priority">): this

/**
 * Add multiple hooks to a category
 */
addHooks(category: HookCategory, hooks: Omit<HookConfig, "enabled" | "priority">[]): this

/**
 * Set execution options
 */
setExecution(options: Partial<HooksConfig["execution"]>): this

/**
 * Enable parallel execution
 */
enableParallel(): this

/**
 * Enable stop on error
 */
enableStopOnError(): this

/**
 * Set timeout
 */
setTimeout(timeout: number): this

/**
 * Build the configuration
 */
build(): HooksConfig

/**
 * Create a minimal valid configuration
 */
static minimal(): HooksConfig

/**
 * Create a configuration with all categories
 */
static full(): HooksConfig

/**
 * Create an invalid configuration
 */
static invalid(): Partial<HooksConfig>
```

**Example:**
```typescript
import { ConfigBuilder } from "../test-utils/config-builder";

const config = new ConfigBuilder()
  .addHook("pre-execution", {
    name: "test-hook",
    file: "test.ts",
    description: "Test hook",
  })
  .enableParallel()
  .setTimeout(5000)
  .build();
```

#### Context Builder

**Location:** `.cursor/hooks/test-utils/context-builder.ts`

**Class:** `ContextBuilder`

**Methods:**

```typescript
/**
 * Set command name
 */
withCommand(command: string): this

/**
 * Set file path
 */
withFile(file: string): this

/**
 * Set line number
 */
withLine(line: number): this

/**
 * Set timestamp
 */
withTimestamp(timestamp: string): this

/**
 * Build context for a category
 */
build(category: HookCategory): HookExecutionContext

/**
 * Build pre-execution context
 */
buildPreExecution(): HookExecutionContext

/**
 * Build post-execution context
 */
buildPostExecution(): HookExecutionContext

/**
 * Build error context
 */
buildError(): HookExecutionContext

/**
 * Build context context
 */
buildContext(): HookExecutionContext
```

**Example:**
```typescript
import { ContextBuilder } from "../test-utils/context-builder";

const context = new ContextBuilder()
  .withCommand("test-command")
  .withFile("test.ts")
  .withLine(42)
  .buildPreExecution();
```

#### Custom Assertions

**Location:** `.cursor/hooks/test-utils/assertions.ts`

**Functions:**

```typescript
/**
 * Assert that a hook result is successful
 */
export function expectHookSuccess(result: HookResult): void

/**
 * Assert that a hook result failed
 */
export function expectHookFailure(result: HookResult, errorMessage?: string): void

/**
 * Assert that a hook result has warnings
 */
export function expectHookWarnings(result: HookResult, count?: number): void

/**
 * Assert that a hook result has data
 */
export function expectHookData(result: HookResult, data?: unknown): void

/**
 * Assert that multiple hook results are all successful
 */
export function expectAllHooksSuccess(results: HookResult[]): void

/**
 * Assert that at least one hook result failed
 */
export function expectSomeHooksFailed(results: HookResult[]): void
```

**Example:**
```typescript
import { expectHookSuccess, expectHookFailure } from "../test-utils/assertions";

expectHookSuccess(result);
expectHookFailure(result, "Expected error");
```

## Implementation Details

### Test Execution

Tests are run using Vitest and are configured in `vitest.config.ts`:

```typescript
test: {
  include: [
    ".cursor/**/*.test.ts",
    ".cursor/**/*.spec.ts",
  ],
}
```

### Mocking Strategy

1. **File System:** Mocked using Vitest's `vi.mock()` with `importActual` for partial mocking
2. **Module Loading:** Dynamic imports are tested through structure tests
3. **Hooks:** Mock hooks are created using the factory pattern

### Test Coverage

Current coverage:
- **Executor:** 8 tests covering execution, timeout, error handling, priority
- **Loader:** 8 tests covering loading, validation, caching, filtering
- **Logger:** 10 tests covering logging, statistics, filtering, export
- **Integration:** 6 tests covering full execution flows
- **Validation:** 6 tests covering configuration and result validation

**Total: 32 tests, all passing**

## Usage Examples

### Running Tests

```bash
# Run all hook tests
pnpm test .cursor/hooks

# Run specific test file
pnpm test .cursor/hooks/__tests__/logger.test.ts

# Run with coverage
pnpm test:coverage .cursor/hooks
```

### Writing New Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { ConfigBuilder } from "../test-utils/config-builder";
import { ContextBuilder } from "../test-utils/context-builder";
import { createSuccessHook } from "../test-utils/mock-hook-factory";
import { expectHookSuccess } from "../test-utils/assertions";

describe("My Hook Test", () => {
  beforeEach(() => {
    // Setup
  });

  it("should work correctly", () => {
    const config = ConfigBuilder.full();
    const context = ContextBuilder.minimal("pre-execution");
    const hook = createSuccessHook();
    
    // Test implementation
    expectHookSuccess(result);
  });
});
```

### Testing Hook Execution

```typescript
import { executeHooks } from "../executor";
import { ContextBuilder } from "../test-utils/context-builder";

describe("Hook Execution", () => {
  it("should execute hooks", async () => {
    const context = ContextBuilder.minimal("pre-execution");
    const results = await executeHooks("pre-execution", context);
    
    expect(results.length).toBeGreaterThan(0);
    expectAllHooksSuccess(results);
  });
});
```

### Testing Configuration Loading

```typescript
import { loadHookConfig } from "../loader";
import { ConfigBuilder } from "../test-utils/config-builder";
import { readFileSync } from "fs";
import { vi } from "vitest";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    readFileSync: vi.fn(),
  };
});

describe("Configuration Loading", () => {
  it("should load valid configuration", () => {
    const validConfig = ConfigBuilder.full();
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(validConfig));
    
    const config = loadHookConfig();
    expect(config.hooks).toBeDefined();
    expect(config.execution).toBeDefined();
  });
});
```

## Troubleshooting

### Tests Not Found

**Problem:** Vitest doesn't find `.cursor` tests

**Solution:** Ensure `vitest.config.ts` includes:
```typescript
include: [
  ".cursor/**/*.test.ts",
  ".cursor/**/*.spec.ts",
]
```

### Mock Import Errors

**Problem:** `Cannot access '__filename' before initialization`

**Solution:** Use `importActual` for partial mocking:
```typescript
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return {
    ...actual,
    readFileSync: vi.fn(),
  };
});
```

### ConfigBuilder Method Errors

**Problem:** `ConfigBuilder.full().setTimeout is not a function`

**Solution:** Use builder pattern correctly:
```typescript
// Wrong
const config = ConfigBuilder.full().setTimeout(100);

// Correct
const config = new ConfigBuilder().setTimeout(100).build();
```

### Test Timeout Issues

**Problem:** Tests timeout or are flaky

**Solution:** 
- Use Vitest's fake timers for timeout tests
- Add proper delays in mock hooks
- Use `toBeCloseTo()` for duration assertions

### Logger Test Failures

**Problem:** Average duration calculation fails

**Solution:** Account for all hooks having duration:
```typescript
// Average of 100, 200, and 50 = 116.67
expect(stats.avgDuration).toBeCloseTo(116.67, 0);
```

## Best Practices

1. **Use Test Utilities:**
   - Always use `ConfigBuilder` for configurations
   - Use `ContextBuilder` for contexts
   - Use `mock-hook-factory` for mock hooks

2. **Follow Test Structure:**
   - Arrange: Set up test data
   - Act: Execute the code
   - Assert: Verify results

3. **Mock Properly:**
   - Use `importActual` for partial mocks
   - Clear mocks in `beforeEach`
   - Use appropriate mock implementations

4. **Write Clear Tests:**
   - Use descriptive test names
   - Group related tests with `describe`
   - Add comments for complex logic

5. **Maintain Coverage:**
   - Aim for >80% coverage
   - Test edge cases
   - Test error scenarios

## Related Documentation

- [Hook System Documentation](.cursor/hooks/README.md)
- [Hook-Command Integration Guide](docs/HOOK_COMMAND_INTEGRATION_GUIDE.md)
- [Cursor Setup Guide](docs/CURSOR_SETUP_GUIDE.md)
- [Testing Implementation Summary](../TESTING_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team

