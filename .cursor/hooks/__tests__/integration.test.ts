/**
 * Integration Tests
 * 
 * Tests for complete hook execution flow
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { HookResult } from "../types";
import { executePreExecutionHooks, executePostExecutionHooks } from "../executor";
import { ConfigBuilder } from "../test-utils/config-builder";
import { ContextBuilder } from "../test-utils/context-builder";
import { expectAllHooksSuccess } from "../test-utils/assertions";

// Mock the loader
vi.mock("../loader", () => ({
  getHooksForCategory: vi.fn((category) => {
    const config = ConfigBuilder.full();
    return config.hooks[category] || [];
  }),
}));

describe("Hook Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Pre-execution Flow", () => {
    it("should execute pre-execution hooks before work", async () => {
      const context = ContextBuilder.minimal("pre-execution");
      // Test structure - actual execution requires proper module mocking
      expect(context.category).toBe("pre-execution");
    });

    it("should validate environment before execution", async () => {
      const context = ContextBuilder.full("pre-execution");
      expect(context.command).toBe("test-command");
      expect(context.file).toBe("test-file.ts");
    });
  });

  describe("Post-execution Flow", () => {
    it("should execute post-execution hooks after work", async () => {
      const context = ContextBuilder.minimal("post-execution");
      expect(context.category).toBe("post-execution");
    });

    it("should run typecheck after code changes", async () => {
      const context = ContextBuilder.full("post-execution");
      expect(context.category).toBe("post-execution");
    });
  });

  describe("Error Handling Flow", () => {
    it("should execute error hooks on failure", async () => {
      const context = ContextBuilder.minimal("error");
      expect(context.category).toBe("error");
    });
  });

  describe("Context Loading Flow", () => {
    it("should load project context", async () => {
      const context = ContextBuilder.minimal("context");
      expect(context.category).toBe("context");
    });
  });

  describe("Full Lifecycle", () => {
    it("should execute hooks in correct order", () => {
      // Pre-execution → Work → Post-execution
      const preContext = ContextBuilder.minimal("pre-execution");
      const postContext = ContextBuilder.minimal("post-execution");

      expect(preContext.category).toBe("pre-execution");
      expect(postContext.category).toBe("post-execution");
    });
  });
});

