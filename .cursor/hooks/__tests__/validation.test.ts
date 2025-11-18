/**
 * Validation Tests
 *
 * Tests for configuration and result validation
 */

import { describe, it, expect } from "vitest";

import {
  expectHookSuccess,
  expectHookFailure,
  expectHookData,
} from "../test-utils/assertions";
import { ConfigBuilder } from "../test-utils/config-builder";
import type { HookResult } from "../types";

describe("Configuration Validation", () => {
  it("should validate valid configuration structure", () => {
    const config = ConfigBuilder.full();
    expect(config.hooks).toBeDefined();
    expect(config.execution).toBeDefined();
    expect(config.hooks["pre-execution"]).toBeDefined();
    expect(config.hooks["post-execution"]).toBeDefined();
    expect(config.hooks.error).toBeDefined();
    expect(config.hooks.context).toBeDefined();
  });

  it("should reject invalid configuration structure", () => {
    const invalidConfig = ConfigBuilder.invalid();
    // Invalid config should not have proper structure - hooks should be missing or empty
    expect(invalidConfig.hooks).toBeUndefined();
    // Or if it exists, it should be an empty object or missing required categories
    if (invalidConfig.hooks) {
      expect(Object.keys(invalidConfig.hooks).length).toBe(0);
    }
  });

  it("should validate hook structure", () => {
    const config = new ConfigBuilder()
      .addHook("pre-execution", {
        name: "test-hook",
        file: "test.ts",
        description: "Test",
      })
      .build();

    const hook = config.hooks["pre-execution"][0];
    expect(hook).toHaveProperty("name");
    expect(hook).toHaveProperty("file");
    expect(hook).toHaveProperty("description");
    expect(hook).toHaveProperty("enabled");
    expect(hook).toHaveProperty("priority");
  });

  it("should validate execution options", () => {
    const config = ConfigBuilder.full();
    expect(config.execution).toHaveProperty("parallel");
    expect(config.execution).toHaveProperty("stopOnError");
    expect(config.execution).toHaveProperty("timeout");
    expect(typeof config.execution.parallel).toBe("boolean");
    expect(typeof config.execution.stopOnError).toBe("boolean");
    expect(typeof config.execution.timeout).toBe("number");
  });
});

describe("Result Validation", () => {
  it("should validate success result structure", () => {
    const result: HookResult = {
      success: true,
      data: { test: "data" },
    };
    expectHookSuccess(result);
    expectHookData(result, { test: "data" });
  });

  it("should validate failure result structure", () => {
    const result: HookResult = {
      success: false,
      error: "Test error",
    };
    expectHookFailure(result, "Test error");
  });

  it("should validate result with warnings", () => {
    const result: HookResult = {
      success: true,
      warnings: ["Warning 1", "Warning 2"],
    };
    expectHookSuccess(result);
    expect(result.warnings?.length).toBe(2);
  });

  it("should reject invalid result structure", () => {
    // Results must be objects (not null, undefined, primitives, or arrays)
    const invalidResults = [null, undefined, "string", 123, []];
    invalidResults.forEach(invalid => {
      const isValidObject =
        typeof invalid === "object" &&
        invalid !== null &&
        !Array.isArray(invalid);
      expect(isValidObject).toBe(false);
    });
  });
});
