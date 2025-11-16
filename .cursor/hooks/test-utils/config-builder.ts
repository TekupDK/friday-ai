/**
 * Configuration Builder
 * 
 * Builder pattern for creating test hook configurations
 */

import type { HookConfig, HookCategory } from "../types";

interface HooksConfig {
  hooks: {
    "pre-execution": HookConfig[];
    "post-execution": HookConfig[];
    error: HookConfig[];
    context: HookConfig[];
  };
  execution: {
    parallel: boolean;
    stopOnError: boolean;
    timeout: number;
  };
}

export class ConfigBuilder {
  private config: HooksConfig = {
    hooks: {
      "pre-execution": [],
      "post-execution": [],
      error: [],
      context: [],
    },
    execution: {
      parallel: false,
      stopOnError: false,
      timeout: 30000,
    },
  };

  /**
   * Add a hook to a category
   */
  addHook(
    category: HookCategory,
    hook: Omit<HookConfig, "enabled" | "priority">
  ): this {
    const fullHook: HookConfig = {
      ...hook,
      enabled: true,
      priority: this.config.hooks[category].length + 1,
    };
    this.config.hooks[category].push(fullHook);
    return this;
  }

  /**
   * Add multiple hooks to a category
   */
  addHooks(category: HookCategory, hooks: Omit<HookConfig, "enabled" | "priority">[]): this {
    hooks.forEach((hook) => this.addHook(category, hook));
    return this;
  }

  /**
   * Set execution options
   */
  setExecution(options: Partial<HooksConfig["execution"]>): this {
    this.config.execution = { ...this.config.execution, ...options };
    return this;
  }

  /**
   * Enable parallel execution
   */
  enableParallel(): this {
    this.config.execution.parallel = true;
    return this;
  }

  /**
   * Enable stop on error
   */
  enableStopOnError(): this {
    this.config.execution.stopOnError = true;
    return this;
  }

  /**
   * Set timeout
   */
  setTimeout(timeout: number): this {
    this.config.execution.timeout = timeout;
    return this;
  }

  /**
   * Build the configuration
   */
  build(): HooksConfig {
    return JSON.parse(JSON.stringify(this.config)); // Deep clone
  }

  /**
   * Create a minimal valid configuration
   */
  static minimal(): HooksConfig {
    return new ConfigBuilder().build();
  }

  /**
   * Create a configuration with all categories
   */
  static full(): HooksConfig {
    return new ConfigBuilder()
      .addHook("pre-execution", {
        name: "validate-environment",
        file: ".cursor/hooks/pre-execution/validate-environment.ts",
        description: "Validates environment",
      })
      .addHook("post-execution", {
        name: "run-typecheck",
        file: ".cursor/hooks/post-execution/run-typecheck.ts",
        description: "Runs typecheck",
      })
      .addHook("error", {
        name: "error-logger",
        file: ".cursor/hooks/error/error-logger.ts",
        description: "Logs errors",
      })
      .addHook("context", {
        name: "load-project-context",
        file: ".cursor/hooks/context/load-project-context.ts",
        description: "Loads context",
      })
      .build();
  }

  /**
   * Create an invalid configuration
   */
  static invalid(): Partial<HooksConfig> {
    return {
      // Missing hooks property entirely
      execution: {
        parallel: false,
        stopOnError: false,
        timeout: 30000,
      },
    } as Partial<HooksConfig>;
  }
}

