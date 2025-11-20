/**
 * Hook Loader
 * 
 * Loads hook files and configurations with error handling
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import type { HookConfig, HookCategory } from "./types";

// Get current directory (ESM-compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

let cachedConfig: HooksConfig | null = null;
let testConfigOverride: HooksConfig | null = null;
const useCache = process.env.NODE_ENV === "production";

/**
 * Test-only: inject a config override for deterministic behavior
 */
export function __setTestConfig(config: HooksConfig | null): void {
  testConfigOverride = config;
  cachedConfig = null;
}

/**
 * Test-only: clear cache and test override
 */
export function __clearHookConfigCache(): void {
  cachedConfig = null;
  testConfigOverride = null;
}

/**
 * Load hook configuration with error handling
 */
export function loadHookConfig(): HooksConfig {
  if (testConfigOverride) {
    return testConfigOverride;
  }

  if (cachedConfig && useCache) {
    return cachedConfig;
  }

  try {
    // Try to load from .cursor/hooks.json
    const configPath = join(process.cwd(), ".cursor", "hooks.json");
    const configContent = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent) as HooksConfig;

    // Validate structure
    if (!config.hooks || !config.execution) {
      throw new Error("Invalid hooks.json structure");
    }

    // Validate hook categories
    const requiredCategories: HookCategory[] = [
      "pre-execution",
      "post-execution",
      "error",
      "context",
    ];
    for (const category of requiredCategories) {
      if (!Array.isArray(config.hooks[category])) {
        config.hooks[category] = [];
      }
    }

    if (useCache) {
      cachedConfig = config;
    }
    return config;
  } catch (error) {
    console.warn(
      `[Hook Loader] Failed to load hooks.json: ${error instanceof Error ? error.message : String(error)}`
    );
    console.warn("[Hook Loader] Using safe defaults");

    // Return safe defaults
    const defaultConfig: HooksConfig = {
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

    if (useCache) {
      cachedConfig = defaultConfig;
    }
    return defaultConfig;
  }
}

/**
 * Get hooks for a specific category
 */
export function getHooksForCategory(
  category: HookCategory
): HookConfig[] {
  const config = loadHookConfig();
  const hooks = config.hooks[category] || [];
  
  // Filter enabled hooks and sort by priority
  return hooks
    .filter((hook) => hook.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get all enabled hooks
 */
export function getAllEnabledHooks(): HookConfig[] {
  const config = loadHookConfig();
  const categories: HookCategory[] = [
    "pre-execution",
    "post-execution",
    "error",
    "context",
  ];

  const allHooks: HookConfig[] = [];
  
  for (const category of categories) {
    const hooks = getHooksForCategory(category);
    allHooks.push(...hooks);
  }

  return allHooks;
}

/**
 * Get hook file path
 */
export function getHookFilePath(hook: HookConfig): string {
  return hook.file;
}

/**
 * Check if hook exists
 */
export function hookExists(hookName: string, category: HookCategory): boolean {
  const hooks = getHooksForCategory(category);
  return hooks.some((hook) => hook.name === hookName);
}

