/**
 * Custom Assertions
 * 
 * Custom assertion helpers for hook testing
 */

import { expect } from "vitest";
import type { HookResult, HookLog, HookStats } from "../types";

/**
 * Assert that a hook result is successful
 */
export function expectHookSuccess(result: HookResult): void {
  expect(result.success).toBe(true);
  expect(result.error).toBeUndefined();
}

/**
 * Assert that a hook result failed
 */
export function expectHookFailure(result: HookResult, errorMessage?: string): void {
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  if (errorMessage) {
    expect(result.error).toContain(errorMessage);
  }
}

/**
 * Assert that a hook result has warnings
 */
export function expectHookWarnings(result: HookResult, count?: number): void {
  expect(result.warnings).toBeDefined();
  expect(Array.isArray(result.warnings)).toBe(true);
  if (count !== undefined) {
    expect(result.warnings?.length).toBe(count);
  }
}

/**
 * Assert that a hook result has data
 */
export function expectHookData(result: HookResult, data?: unknown): void {
  expect(result.data).toBeDefined();
  if (data !== undefined) {
    expect(result.data).toEqual(data);
  }
}

/**
 * Assert that multiple hook results are all successful
 */
export function expectAllHooksSuccess(results: HookResult[]): void {
  results.forEach((result) => expectHookSuccess(result));
}

/**
 * Assert that at least one hook result failed
 */
export function expectSomeHooksFailed(results: HookResult[]): void {
  const hasFailure = results.some((result) => !result.success);
  expect(hasFailure).toBe(true);
}

/**
 * Assert log entry structure
 */
export function expectLogEntry(log: HookLog): void {
  expect(log).toHaveProperty("hook");
  expect(log).toHaveProperty("category");
  expect(log).toHaveProperty("status");
  expect(log).toHaveProperty("timestamp");
  expect(typeof log.hook).toBe("string");
  expect(typeof log.category).toBe("string");
  expect(["started", "completed", "failed"]).toContain(log.status);
}

/**
 * Assert statistics structure
 */
export function expectStats(stats: HookStats): void {
  expect(stats).toHaveProperty("completed");
  expect(stats).toHaveProperty("failed");
  expect(stats).toHaveProperty("total");
  expect(stats).toHaveProperty("avgDuration");
  expect(stats).toHaveProperty("totalDuration");
  expect(typeof stats.completed).toBe("number");
  expect(typeof stats.failed).toBe("number");
  expect(typeof stats.total).toBe("number");
  expect(stats.total).toBe(stats.completed + stats.failed);
}

/**
 * Assert that logs contain a specific hook
 */
export function expectLogsContainHook(logs: HookLog[], hookName: string): void {
  const hasHook = logs.some((log) => log.hook === hookName);
  expect(hasHook).toBe(true);
}

/**
 * Assert that logs contain a specific status
 */
export function expectLogsContainStatus(
  logs: HookLog[],
  status: HookLog["status"]
): void {
  const hasStatus = logs.some((log) => log.status === status);
  expect(hasStatus).toBe(true);
}

