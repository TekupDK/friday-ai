/**
 * Terminal Command Validation for Cursor Agent
 *
 * Validates terminal commands before execution to prevent:
 * - Destructive operations
 * - Unauthorized commands
 * - Security risks
 */

export interface CommandValidation {
  isValid: boolean;
  reason?: string;
  requiresConfirmation?: boolean;
  category?: string;
}

/**
 * Validate a terminal command before execution
 */
export function validateCommand(command: string): CommandValidation {
  // Check for blacklisted commands
  const blacklist = [
    "rm -rf",
    "rm -r",
    "sudo rm",
    "format C:",
    "del /f",
    "rmdir /s",
    "shutdown",
    "reboot",
    "init 0",
    "init 6",
  ];

  for (const blacklisted of blacklist) {
    if (command.includes(blacklisted)) {
      return {
        isValid: false,
        reason: `Command contains blacklisted pattern: ${blacklisted}`,
      };
    }
  }

  // Check for commands requiring confirmation
  const requireConfirmation = [
    "db:push",
    "db:migrate",
    "db:seed",
    "git push --force",
    "git reset --hard",
    "npm publish",
    "pnpm publish",
  ];

  for (const risky of requireConfirmation) {
    if (command.includes(risky)) {
      return {
        isValid: true,
        requiresConfirmation: true,
        reason: `Command requires confirmation: ${risky}`,
        category: "risky",
      };
    }
  }

  // Check for safe commands (whitelist)
  const whitelist = [
    "pnpm",
    "npm",
    "node",
    "tsc",
    "eslint",
    "prettier",
    "git",
    "drizzle-kit",
    "playwright",
  ];

  const isWhitelisted = whitelist.some(safe => command.startsWith(safe));

  if (!isWhitelisted && !command.startsWith("cd ")) {
    return {
      isValid: false,
      reason: `Command not in whitelist: ${command.split(" ")[0]}`,
    };
  }

  return {
    isValid: true,
    category: "safe",
  };
}

/**
 * Parse command output for structured data
 */
export function parseCommandOutput(
  command: string,
  output: string
): Record<string, unknown> {
  // TypeScript errors
  if (command.includes("tsc") && output.includes("error TS")) {
    const errors = output.match(/error TS\d+.*/g) || [];
    return {
      type: "typescript-errors",
      count: errors.length,
      errors: errors.slice(0, 10), // Limit to first 10 errors
    };
  }

  // ESLint errors
  if (command.includes("eslint") || command.includes("lint")) {
    const errors = output.match(/\d+ problem/g);
    if (errors) {
      return {
        type: "lint-errors",
        count: parseInt(errors[0].split(" ")[0], 10),
      };
    }
  }

  // Test results
  if (command.includes("test")) {
    const passed = output.match(/(\d+) passed/g);
    const failed = output.match(/(\d+) failed/g);
    return {
      type: "test-results",
      passed: passed ? parseInt(passed[1], 10) : 0,
      failed: failed ? parseInt(failed[1], 10) : 0,
    };
  }

  return {
    type: "text",
    output,
  };
}
