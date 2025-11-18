/**
 * Hook Type Definitions
 *
 * Type definitions for Cursor Agent Hooks system
 */

export type HookCategory =
  | "pre-execution"
  | "post-execution"
  | "error"
  | "context";

export interface HookConfig {
  name: string;
  file: string;
  description: string;
  enabled: boolean;
  priority: number;
}

export interface HookResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

export interface PreExecutionHookResult extends HookResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PostExecutionHookResult extends HookResult {
  output?: string;
  errors?: number;
  warnings?: number;
}

export interface ErrorHookResult extends HookResult {
  logged: boolean;
  recovered?: boolean;
}

export interface ContextHookResult extends HookResult {
  context: Record<string, unknown>;
}

// Category-specific hook function types
export type PreExecutionHookFunction = (
  context: HookExecutionContext
) => Promise<PreExecutionHookResult> | PreExecutionHookResult;

export type PostExecutionHookFunction = (
  context: HookExecutionContext,
  changedFiles?: string[]
) => Promise<PostExecutionHookResult> | PostExecutionHookResult;

export type ErrorHookFunction = (
  error: Error,
  context: HookExecutionContext
) => Promise<ErrorHookResult> | ErrorHookResult;

export type ContextHookFunction = (
  context: HookExecutionContext,
  task?: string
) => Promise<ContextHookResult> | ContextHookResult;

// Union type for all hooks
export type HookFunction<T extends HookResult = HookResult> =
  | PreExecutionHookFunction
  | PostExecutionHookFunction
  | ErrorHookFunction
  | ContextHookFunction;

export interface HookExecutionOptions {
  parallel?: boolean;
  stopOnError?: boolean;
  timeout?: number;
}

export interface HookExecutionContext {
  command?: string;
  file?: string;
  line?: number;
  timestamp: string;
  category: HookCategory;
}
