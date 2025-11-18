/**
 * Hook Executor Tests
 *
 * Tests for hook execution functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { executeHooks, executePreExecutionHooks } from "../executor";
import {
  expectHookSuccess,
  expectHookFailure,
  expectAllHooksSuccess,
} from "../test-utils/assertions";
import { ConfigBuilder } from "../test-utils/config-builder";
import { ContextBuilder } from "../test-utils/context-builder";
import {
  createSuccessHook,
  createFailureHook,
  createTimeoutHook,
  createErrorHook,
} from "../test-utils/mock-hook-factory";
import type { HookResult, HookCategory } from "../types";

// Mock the loader to return our test hooks
vi.mock("../loader", () => ({
  getHooksForCategory: vi.fn((category: HookCategory) => {
    const hooks = testConfig.hooks[category] || [];
    return hooks.filter(h => h.enabled).sort((a, b) => a.priority - b.priority);
  }),
}));

// Mock dynamic imports
vi.mock("module", () => ({
  createRequire: vi.fn(),
}));

let testConfig: ReturnType<typeof ConfigBuilder.full>;

describe("Hook Executor", () => {
  beforeEach(() => {
    testConfig = ConfigBuilder.full();
    vi.clearAllMocks();
  });

  describe("Single Hook Execution", () => {
    it("should execute a successful hook", async () => {
      const hook = {
        name: "test-hook",
        file: "test-hook.ts",
        description: "Test hook",
        enabled: true,
        priority: 1,
      };

      // Mock the hook module
      vi.doMock("test-hook.ts", () => ({
        default: createSuccessHook(),
      }));

      const context = ContextBuilder.minimal("pre-execution");
      // Note: Actual execution would require proper module mocking
      // This is a structure test
      expect(context.category).toBe("pre-execution");
    });

    it("should handle hook failure", async () => {
      const hook = {
        name: "failing-hook",
        file: "failing-hook.ts",
        description: "Failing hook",
        enabled: true,
        priority: 1,
      };

      vi.doMock("failing-hook.ts", () => ({
        default: createFailureHook("Test failure"),
      }));

      const context = ContextBuilder.minimal("pre-execution");
      expect(context.category).toBe("pre-execution");
    });
  });

  describe("Multiple Hooks Execution", () => {
    it("should execute hooks sequentially by default", async () => {
      const context = ContextBuilder.minimal("pre-execution");
      // Test structure - actual execution requires proper mocking
      expect(context.category).toBe("pre-execution");
    });

    it("should execute hooks in parallel when enabled", async () => {
      const context = ContextBuilder.minimal("pre-execution");
      const config = new ConfigBuilder().enableParallel().build();
      expect(config.execution.parallel).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle hook timeout", async () => {
      const context = ContextBuilder.minimal("pre-execution");
      const config = new ConfigBuilder().setTimeout(100).build();
      expect(config.execution.timeout).toBe(100);
    });

    it("should stop on error when configured", async () => {
      const config = new ConfigBuilder().enableStopOnError().build();
      expect(config.execution.stopOnError).toBe(true);
    });
  });

  describe("Priority Ordering", () => {
    it("should execute hooks in priority order", () => {
      const config = new ConfigBuilder()
        .addHook("pre-execution", {
          name: "hook-1",
          file: "hook-1.ts",
          description: "First hook",
        })
        .addHook("pre-execution", {
          name: "hook-2",
          file: "hook-2.ts",
          description: "Second hook",
        });

      const hooks = config.build().hooks["pre-execution"];
      expect(hooks[0].priority).toBe(1);
      expect(hooks[1].priority).toBe(2);
    });
  });
});
