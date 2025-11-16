# Hook Tests

Test suite for Cursor Agent Hooks system.

## Structure

```
__tests__/
├── executor.test.ts         # Hook executor tests
├── loader.test.ts           # Configuration loader tests
├── logger.test.ts           # Logging system tests
├── integration.test.ts     # Integration tests
├── validation.test.ts       # Validation tests
├── fixtures/                # Test fixtures
│   ├── mock-hooks/          # Mock hook implementations
│   ├── configs/             # Test configurations
│   └── contexts/            # Test execution contexts
└── README.md                # This file
```

## Running Tests

```bash
# Run all hook tests
pnpm test .cursor/hooks

# Run specific test file
pnpm test .cursor/hooks/__tests__/logger.test.ts

# Run with coverage
pnpm test:coverage .cursor/hooks
```

## Test Utilities

Located in `test-utils/`:
- `mock-hook-factory.ts` - Create mock hooks
- `config-builder.ts` - Build test configurations
- `context-builder.ts` - Build test contexts
- `assertions.ts` - Custom assertions

## Test Patterns

### Using Mock Hooks

```typescript
import { createSuccessHook, createFailureHook } from "../test-utils/mock-hook-factory";

const successHook = createSuccessHook();
const failureHook = createFailureHook("Custom error");
```

### Using Config Builder

```typescript
import { ConfigBuilder } from "../test-utils/config-builder";

const config = new ConfigBuilder()
  .addHook("pre-execution", {
    name: "test-hook",
    file: "test.ts",
    description: "Test",
  })
  .enableParallel()
  .build();
```

### Using Context Builder

```typescript
import { ContextBuilder } from "../test-utils/context-builder";

const context = new ContextBuilder()
  .withCommand("test-command")
  .withFile("test.ts")
  .buildPreExecution();
```

### Using Assertions

```typescript
import { expectHookSuccess, expectHookFailure } from "../test-utils/assertions";

expectHookSuccess(result);
expectHookFailure(result, "Expected error");
```

## Coverage Goals

- **Lines:** >80%
- **Functions:** >80%
- **Branches:** >70%

