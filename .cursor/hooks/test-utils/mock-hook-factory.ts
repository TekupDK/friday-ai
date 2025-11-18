/**
 * Mock Hook Factory
 *
 * Factory for creating mock hooks with different behaviors for testing
 */

import type {
  HookFunction,
  HookResult,
  HookExecutionContext,
  PreExecutionHookResult,
  PostExecutionHookResult,
  ErrorHookResult,
  ContextHookResult,
} from "../types";

export interface MockHookOptions {
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
  timeout?: boolean;
  returnValue?: Partial<HookResult>;
}

/**
 * Create a mock hook that always succeeds
 */
export function createSuccessHook<T extends HookResult = HookResult>(
  returnValue?: Partial<T>
): HookFunction<T> {
  return async (context: HookExecutionContext): Promise<T> => {
    return {
      success: true,
      ...returnValue,
    } as T;
  };
}

/**
 * Create a mock hook that always fails
 */
export function createFailureHook<T extends HookResult = HookResult>(
  errorMessage = "Mock hook failed"
): HookFunction<T> {
  return async (context: HookExecutionContext): Promise<T> => {
    return {
      success: false,
      error: errorMessage,
    } as T;
  };
}

/**
 * Create a mock hook that times out
 */
export function createTimeoutHook<T extends HookResult = HookResult>(
  timeout = 100
): HookFunction<T> {
  return async (context: HookExecutionContext): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, timeout));
    return {
      success: true,
    } as T;
  };
}

/**
 * Create a mock hook that throws an error
 */
export function createErrorHook<T extends HookResult = HookResult>(
  errorMessage = "Mock hook error"
): HookFunction<T> {
  return async (context: HookExecutionContext): Promise<T> => {
    throw new Error(errorMessage);
  };
}

/**
 * Create a mock hook with custom behavior
 */
export function createMockHook<T extends HookResult = HookResult>(
  options: MockHookOptions = {}
): HookFunction<T> {
  const {
    delay = 0,
    shouldFail = false,
    errorMessage = "Mock hook failed",
    timeout = false,
    returnValue = {},
  } = options;

  return async (context: HookExecutionContext): Promise<T> => {
    // Simulate delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simulate timeout
    if (timeout) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // Simulate failure
    if (shouldFail) {
      return {
        success: false,
        error: errorMessage,
        ...returnValue,
      } as T;
    }

    // Return success
    return {
      success: true,
      ...returnValue,
    } as T;
  };
}

/**
 * Create a mock pre-execution hook
 */
export function createMockPreExecutionHook(
  options: MockHookOptions = {}
): HookFunction<PreExecutionHookResult> {
  return createMockHook<PreExecutionHookResult>({
    returnValue: {
      isValid: !options.shouldFail,
      errors: options.shouldFail
        ? [options.errorMessage || "Validation failed"]
        : [],
      warnings: [],
      ...options.returnValue,
    },
    ...options,
  });
}

/**
 * Create a mock post-execution hook
 */
export function createMockPostExecutionHook(
  options: MockHookOptions = {}
): HookFunction<PostExecutionHookResult> {
  return createMockHook<PostExecutionHookResult>({
    returnValue: {
      errors: options.shouldFail ? 1 : 0,
      warnings: 0,
      output: "",
      ...options.returnValue,
    },
    ...options,
  });
}

/**
 * Create a mock error hook
 */
export function createMockErrorHook(
  options: MockHookOptions = {}
): HookFunction<ErrorHookResult> {
  return createMockHook<ErrorHookResult>({
    returnValue: {
      logged: true,
      recovered: !options.shouldFail,
      ...options.returnValue,
    },
    ...options,
  });
}

/**
 * Create a mock context hook
 */
export function createMockContextHook(
  contextData: Record<string, unknown> = {}
): HookFunction<ContextHookResult> {
  return async (
    executionContext: HookExecutionContext
  ): Promise<ContextHookResult> => {
    return {
      success: true,
      context: {
        project: "Friday AI Chat",
        ...contextData,
      },
    };
  };
}
