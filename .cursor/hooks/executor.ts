/**
 * Hook Executor
 *
 * Executes hooks based on configuration
 */

import { getHooksForCategory } from "./loader";
import { hookLogger } from "./logger";
import type {
  HookConfig,
  HookResult,
  HookCategory,
  HookExecutionContext,
  HookExecutionOptions,
  HookFunction,
} from "./types";

/**
 * Execute hooks for a category
 */
export async function executeHooks(
  category: HookCategory,
  context: HookExecutionContext,
  options: HookExecutionOptions = {}
): Promise<HookResult[]> {
  const hooks = getHooksForCategory(category);
  const results: HookResult[] = [];

  const executionOptions: HookExecutionOptions = {
    parallel: false,
    stopOnError: false,
    timeout: 30000,
    ...options,
  };

  // Parallel execution
  if (executionOptions.parallel && hooks.length > 1) {
    const promises = hooks.map(hook =>
      executeHook(hook, context, executionOptions).catch(error => ({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }))
    );

    const parallelResults = await Promise.all(promises);
    results.push(...parallelResults);

    // Check for errors if stopOnError is enabled
    if (executionOptions.stopOnError) {
      const firstError = parallelResults.find(r => !r.success);
      if (firstError) {
        return [firstError];
      }
    }

    return results;
  }

  // Sequential execution
  for (const hook of hooks) {
    try {
      const result = await executeHook(hook, context, executionOptions);
      results.push(result);

      // Stop on error if configured
      if (executionOptions.stopOnError && !result.success) {
        break;
      }
    } catch (error) {
      const errorResult: HookResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      results.push(errorResult);

      if (executionOptions.stopOnError) {
        break;
      }
    }
  }

  return results;
}

/**
 * Execute a single hook
 */
async function executeHook(
  hook: HookConfig,
  context: HookExecutionContext,
  options: HookExecutionOptions
): Promise<HookResult> {
  const startTime = Date.now();
  hookLogger.log(hook.name, context.category, "started");

  try {
    // Dynamic import with error handling
    // Convert relative path to absolute if needed
    const hookPath = hook.file.startsWith(".") ? hook.file : `./${hook.file}`;

    let hookModule: Record<string, unknown>;
    try {
      // Try dynamic import
      hookModule = await import(hookPath);
    } catch (importError) {
      // If import fails, try with .ts extension
      try {
        hookModule = await import(`${hookPath}.ts`);
      } catch {
        // If that fails, try with .js extension (for compiled code)
        hookModule = await import(`${hookPath}.js`);
      }
    }

    // Support multiple export patterns
    const hookFn =
      (hookModule.default as HookFunction) ||
      (hookModule[hook.name] as HookFunction) ||
      (hookModule[`${hook.name}Hook`] as HookFunction) ||
      (Object.values(hookModule).find(
        fn => typeof fn === "function"
      ) as HookFunction);

    if (!hookFn) {
      throw new Error(
        `Hook function not found in ${hook.file}. Expected: default export, ${hook.name}, or ${hook.name}Hook`
      );
    }

    // Execute with timeout protection
    const timeout = options.timeout || 30000;
    const result = await Promise.race([
      hookFn(context),
      new Promise<HookResult>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Hook timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);

    const duration = Date.now() - startTime;

    // Validate result structure
    if (typeof result !== "object" || result === null) {
      throw new Error("Hook must return an object");
    }

    const hookResult: HookResult = {
      success: result.success !== false, // Default to true if not specified
      data: result.data,
      error: result.error,
      warnings: result.warnings,
    };

    hookLogger.log(hook.name, context.category, "completed", duration);
    return hookResult;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    hookLogger.log(
      hook.name,
      context.category,
      "failed",
      duration,
      errorMessage
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Execute pre-execution hooks
 */
export async function executePreExecutionHooks(
  context: Omit<HookExecutionContext, "category">
): Promise<HookResult[]> {
  return executeHooks("pre-execution", {
    ...context,
    category: "pre-execution",
  });
}

/**
 * Execute post-execution hooks
 */
export async function executePostExecutionHooks(
  context: Omit<HookExecutionContext, "category">
): Promise<HookResult[]> {
  return executeHooks("post-execution", {
    ...context,
    category: "post-execution",
  });
}

/**
 * Execute error hooks
 */
export async function executeErrorHooks(
  error: Error,
  context: Omit<HookExecutionContext, "category">
): Promise<HookResult[]> {
  return executeHooks("error", {
    ...context,
    category: "error",
  });
}

/**
 * Execute context hooks
 */
export async function executeContextHooks(
  context: Omit<HookExecutionContext, "category">
): Promise<HookResult[]> {
  return executeHooks("context", {
    ...context,
    category: "context",
  });
}
