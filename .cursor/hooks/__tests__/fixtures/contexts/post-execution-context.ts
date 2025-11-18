/**
 * Post-execution Context Fixture
 */

import type { HookExecutionContext } from "../../../types";

export const postExecutionContext: HookExecutionContext = {
  command: "test-command",
  file: "test-file.ts",
  line: 42,
  timestamp: new Date().toISOString(),
  category: "post-execution",
};
