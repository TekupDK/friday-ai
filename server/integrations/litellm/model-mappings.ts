/**
 * Model Mappings
 * Maps Friday AI model names to LiteLLM/OpenRouter model IDs
 */

import type { AIModel } from '../../model-router';

/**
 * Friday AI model name → LiteLLM model ID
 * All models are FREE OpenRouter models
 */
export const FRIDAY_TO_LITELLM_MODEL_MAP: Record<string, string> = {
  // Primary models
  'glm-4.5-air-free': 'openrouter/z-ai/glm-4.5-air:free',
  'gpt-oss-20b-free': 'openrouter/openai/gpt-oss-20b:free',
  
  // Coding specialists
  'deepseek-chat-v3.1-free': 'openrouter/deepseek/deepseek-chat-v3.1:free',
  'qwen3-coder-free': 'openrouter/qwen/qwen3-coder:free',
  
  // General purpose
  'minimax-m2-free': 'openrouter/minimax/minimax-m2:free',
  'kimi-k2-free': 'openrouter/moonshotai/kimi-k2:free',
  
  // Legacy
  'gemma-3-27b-free': 'openrouter/google/gemma-3-27b-it:free',
} as const;

/**
 * LiteLLM model ID → Friday AI model name
 */
export const LITELLM_TO_FRIDAY_MODEL_MAP: Record<string, string> = Object.entries(
  FRIDAY_TO_LITELLM_MODEL_MAP
).reduce((acc, [friday, litellm]) => {
  acc[litellm] = friday;
  return acc;
}, {} as Record<string, string>);

/**
 * Convert Friday AI model name to LiteLLM model ID
 */
export function mapToLiteLLMModel(fridayModel: AIModel | string): string {
  // If it's already a LiteLLM format (openrouter/...), return as-is
  if (typeof fridayModel === 'string' && fridayModel.startsWith('openrouter/')) {
    return fridayModel;
  }
  
  const mapped = FRIDAY_TO_LITELLM_MODEL_MAP[fridayModel as string];
  
  if (!mapped) {
    console.warn(`[LiteLLM] Unknown model: ${fridayModel}, using default`);
    return FRIDAY_TO_LITELLM_MODEL_MAP['glm-4.5-air-free'];
  }
  
  return mapped;
}

/**
 * Convert LiteLLM model ID to Friday AI model name
 */
export function mapToFridayModel(litellmModel: string): string {
  const mapped = LITELLM_TO_FRIDAY_MODEL_MAP[litellmModel];
  
  if (!mapped) {
    // Try to extract base model name
    const match = litellmModel.match(/openrouter\/(.+):free/);
    if (match) {
      return `${match[1]}-free`;
    }
    return 'glm-4.5-air-free'; // Default fallback
  }
  
  return mapped;
}

/**
 * Get fallback models for a given Friday AI model
 */
export function getFallbackModels(fridayModel: AIModel | string): string[] {
  // Define fallback chains
  const fallbackChains: Record<string, string[]> = {
    'glm-4.5-air-free': [
      'openrouter/deepseek/deepseek-chat-v3.1:free',
      'openrouter/minimax/minimax-m2:free',
      'openrouter/moonshotai/kimi-k2:free',
    ],
    'deepseek-chat-v3.1-free': [
      'openrouter/qwen/qwen3-coder:free',
      'openrouter/z-ai/glm-4.5-air:free',
    ],
    'qwen3-coder-free': [
      'openrouter/deepseek/deepseek-chat-v3.1:free',
      'openrouter/z-ai/glm-4.5-air:free',
    ],
  };
  
  return fallbackChains[fridayModel as string] || [
    'openrouter/z-ai/glm-4.5-air:free',
    'openrouter/deepseek/deepseek-chat-v3.1:free',
  ];
}
