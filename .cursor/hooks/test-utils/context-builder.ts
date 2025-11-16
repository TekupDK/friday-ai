/**
 * Context Builder
 * 
 * Builder for creating test execution contexts
 */

import type { HookExecutionContext, HookCategory } from "../types";

export class ContextBuilder {
  private context: Omit<HookExecutionContext, "category"> = {
    timestamp: new Date().toISOString(),
  };

  /**
   * Set command name
   */
  withCommand(command: string): this {
    this.context.command = command;
    return this;
  }

  /**
   * Set file path
   */
  withFile(file: string): this {
    this.context.file = file;
    return this;
  }

  /**
   * Set line number
   */
  withLine(line: number): this {
    this.context.line = line;
    return this;
  }

  /**
   * Set timestamp
   */
  withTimestamp(timestamp: string): this {
    this.context.timestamp = timestamp;
    return this;
  }

  /**
   * Build context for a category
   */
  build(category: HookCategory): HookExecutionContext {
    return {
      ...this.context,
      category,
    };
  }

  /**
   * Build pre-execution context
   */
  buildPreExecution(): HookExecutionContext {
    return this.build("pre-execution");
  }

  /**
   * Build post-execution context
   */
  buildPostExecution(): HookExecutionContext {
    return this.build("post-execution");
  }

  /**
   * Build error context
   */
  buildError(): HookExecutionContext {
    return this.build("error");
  }

  /**
   * Build context context
   */
  buildContext(): HookExecutionContext {
    return this.build("context");
  }

  /**
   * Create a minimal context
   */
  static minimal(category: HookCategory): HookExecutionContext {
    return new ContextBuilder().build(category);
  }

  /**
   * Create a full context
   */
  static full(category: HookCategory): HookExecutionContext {
    return new ContextBuilder()
      .withCommand("test-command")
      .withFile("test-file.ts")
      .withLine(42)
      .build(category);
  }
}

