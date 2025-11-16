/**
 * Mock Timeout Hook
 * 
 * Times out - used for testing timeout handling
 */

import type { HookResult, HookExecutionContext } from "../../../types";

export default async function timeoutHook(
  context: HookExecutionContext
): Promise<HookResult> {
  // Wait longer than typical timeout
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    success: true,
  };
}

