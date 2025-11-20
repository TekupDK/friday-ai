/**
 * Model Mappings - Maps internal model names to OpenRouter model IDs
 * OpenRouter Documentation: https://openrouter.ai/docs
 */

import type { AIModel } from '../modules/ai/model-router';

/**
 * Maps internal model names to actual OpenRouter model IDs
 */
export const MODEL_ID_MAPPING: Record<AIModel, string> = {
  // FREE TIER - 100% Accuracy Models (Recommended)
  "glm-4.5-air-free": "z-ai/glm-4.5-air:free",
  "gpt-oss-20b-free": "openai/gpt-oss-20b:free",
  "deepseek-chat-v3.1-free": "deepseek/deepseek-chat-v3.1:free",
  "minimax-m2-free": "minimax/minimax-m2:free",
  "qwen3-coder-free": "qwen/qwen3-coder:free",
  "kimi-k2-free": "moonshotai/kimi-k2:free",

  // FREE TIER - Legacy
  "gemma-3-27b-free": "google/gemma-3-27b-it:free",

  // PAID TIER - Fallbacks
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gemini-2.0-flash-exp": "google/gemini-2.0-flash-exp",
  "claude-3-haiku": "anthropic/claude-3-haiku",
  "llama-3.1-70b": "meta-llama/llama-3.1-70b-instruct",
};

/**
 * Model metadata for display and evaluation
 */
export const MODEL_METADATA: Record<
  AIModel,
  {
    displayName: string;
    provider: string;
    accuracy?: string;
    specialization?: string;
    contextWindow?: number;
    costTier: "free" | "paid";
  }
> = {
  "glm-4.5-air-free": {
    displayName: "GLM-4.5 Air",
    provider: "Z-AI",
    accuracy: "100%",
    specialization: "General purpose, Danish support",
    contextWindow: 128000,
    costTier: "free",
  },
  "gpt-oss-20b-free": {
    displayName: "GPT-OSS 20B",
    provider: "OpenAI",
    accuracy: "100%",
    specialization: "General purpose, OpenAI-compatible",
    contextWindow: 8192,
    costTier: "free",
  },
  "deepseek-chat-v3.1-free": {
    displayName: "DeepSeek Chat v3.1",
    provider: "DeepSeek",
    specialization: "Advanced reasoning, coding",
    contextWindow: 32000,
    costTier: "free",
  },
  "minimax-m2-free": {
    displayName: "MiniMax M2",
    provider: "MiniMax",
    specialization: "Fast, efficient general purpose",
    contextWindow: 8192,
    costTier: "free",
  },
  "qwen3-coder-free": {
    displayName: "Qwen3 Coder",
    provider: "Qwen",
    specialization: "Code generation and debugging",
    contextWindow: 32000,
    costTier: "free",
  },
  "kimi-k2-free": {
    displayName: "Kimi K2",
    provider: "Moonshot AI",
    specialization: "Long context, context-aware",
    contextWindow: 200000,
    costTier: "free",
  },
  "gemma-3-27b-free": {
    displayName: "Gemma 3 27B",
    provider: "Google",
    specialization: "General purpose (legacy)",
    contextWindow: 8192,
    costTier: "free",
  },
  "gpt-4o-mini": {
    displayName: "GPT-4o Mini",
    provider: "OpenAI",
    specialization: "Fast, general purpose",
    contextWindow: 128000,
    costTier: "paid",
  },
  "gemini-2.0-flash-exp": {
    displayName: "Gemini 2.0 Flash",
    provider: "Google",
    specialization: "Multimodal",
    contextWindow: 1000000,
    costTier: "paid",
  },
  "claude-3-haiku": {
    displayName: "Claude 3 Haiku",
    provider: "Anthropic",
    specialization: "High quality analysis",
    contextWindow: 200000,
    costTier: "paid",
  },
  "llama-3.1-70b": {
    displayName: "Llama 3.1 70B",
    provider: "Meta",
    specialization: "Complex reasoning",
    contextWindow: 128000,
    costTier: "paid",
  },
};

/**
 * Get OpenRouter model ID from internal model name
 */
export function getModelId(model: AIModel): string {
  return MODEL_ID_MAPPING[model] || MODEL_ID_MAPPING["glm-4.5-air-free"];
}

/**
 * Get model metadata
 */
export function getModelMetadata(model: AIModel) {
  return MODEL_METADATA[model] || MODEL_METADATA["glm-4.5-air-free"];
}

/**
 * Get all free tier models
 */
export function getFreeTierModels(): AIModel[] {
  return Object.entries(MODEL_METADATA)
    .filter(([_, meta]) => meta.costTier === "free")
    .map(([model]) => model as AIModel);
}

/**
 * Get models by specialization
 */
export function getModelsBySpecialization(specialization: string): AIModel[] {
  return Object.entries(MODEL_METADATA)
    .filter(([_, meta]) =>
      meta.specialization?.toLowerCase().includes(specialization.toLowerCase())
    )
    .map(([model]) => model as AIModel);
}
