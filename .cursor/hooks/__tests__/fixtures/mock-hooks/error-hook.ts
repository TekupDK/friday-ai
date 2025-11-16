/**
 * Mock Error Hook
 * 
 * Throws error - used for testing error handling
 */

import type { HookResult, HookExecutionContext } from "../../../types";

export default async function errorHook(
  context: HookExecutionContext
): Promise<HookResult> {
  throw new Error("Mock hook threw an error");
}

