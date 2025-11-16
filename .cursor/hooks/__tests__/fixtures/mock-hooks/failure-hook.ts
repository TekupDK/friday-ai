/**
 * Mock Failure Hook
 * 
 * Always fails - used for testing error handling
 */

import type { HookResult, HookExecutionContext } from "../../../types";

export default async function failureHook(
  context: HookExecutionContext
): Promise<HookResult> {
  return {
    success: false,
    error: "Mock hook intentionally failed",
  };
}

