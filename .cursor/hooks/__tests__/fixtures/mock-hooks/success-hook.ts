/**
 * Mock Success Hook
 * 
 * Always succeeds - used for testing
 */

import type { HookResult, HookExecutionContext } from "../../../types";

export default async function successHook(
  context: HookExecutionContext
): Promise<HookResult> {
  return {
    success: true,
    data: {
      message: "Hook executed successfully",
      context: context.command,
    },
  };
}

