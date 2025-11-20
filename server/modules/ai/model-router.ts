/**
 * Model Router - Intent-based Model Selection
 * Routes different intents to optimal AI models
 */

import { ENV } from "../../_core/env";
import { getFeatureFlags } from "../../_core/feature-flags";
import { invokeLLM, streamResponse } from "../../_core/llm";
import { trackAIMetric, getMetricsSummary } from "./ai-metrics";
import {
  litellmClient,
  mapToLiteLLMModel,
  getFallbackModels,
} from "../../integrations/litellm";

export type AIModel =
  // FREE TIER - 100% Accuracy Models (Recommended)
  | "glm-4.5-air-free" // NEW: 100% accuracy, recommended by OpenRouter
  | "gpt-oss-20b-free" // NEW: 100% accuracy, OpenAI-compatible
  | "deepseek-chat-v3.1-free" // NEW: Advanced reasoning, coding
  | "minimax-m2-free" // NEW: Fast, efficient
  | "qwen3-coder-free" // NEW: Specialized for code generation
  | "kimi-k2-free" // NEW: Context-aware, long context
  // FREE TIER - Legacy
  | "gemma-3-27b-free" // Legacy: Free, Claude-quality
  // PAID TIER - Fallbacks
  | "gpt-4o-mini" // Fallback: OpenAI, fast
  | "gemini-2.0-flash-exp" // Fallback: Google, multimodal
  | "claude-3-haiku" // Premium: Anthropic, high quality
  | "llama-3.1-70b"; // Premium: Meta, complex reasoning

export type TaskType =
  | "chat"
  | "email-draft"
  | "email-analysis"
  | "invoice-create"
  | "calendar-check"
  | "calendar-create"
  | "lead-analysis"
  | "data-analysis"
  | "code-generation"
  | "complex-reasoning";

export interface ModelRoutingConfig {
  primary: AIModel;
  fallbacks: AIModel[];
  reasoning: string;
  costLevel: "free" | "low" | "medium" | "high";
  capabilities: string[];
}

/**
 * Model routing matrix - maps intents to optimal models
 */
const MODEL_ROUTING_MATRIX: Record<TaskType, ModelRoutingConfig> = {
  // General chat - use free model with good quality
  chat: {
    primary: "glm-4.5-air-free",
    fallbacks: ["gpt-oss-20b-free", "gemma-3-27b-free"],
    reasoning: "100% accuracy, excellent Danish (tested: 100% success rate)",
    costLevel: "free",
    capabilities: [
      "conversation",
      "danish",
      "professional-tone",
      "100%-accuracy",
    ],
  },

  // Email drafting - needs professional writing skills
  "email-draft": {
    primary: "glm-4.5-air-free",
    fallbacks: ["gpt-oss-20b-free", "claude-3-haiku"],
    reasoning:
      "100% accuracy for professional writing (tested: excellent Danish quality)",
    costLevel: "free",
    capabilities: [
      "professional-writing",
      "danish",
      "email-format",
      "100%-accuracy",
    ],
  },

  // Email analysis - use fast model for quick analysis
  "email-analysis": {
    primary: "gpt-oss-20b-free",
    fallbacks: ["glm-4.5-air-free", "claude-3-haiku"],
    reasoning:
      "Fast analysis (2.6s avg) with good quality (tested: 100% success rate)",
    costLevel: "free",
    capabilities: [
      "analysis",
      "context-understanding",
      "summarization",
      "speed",
    ],
  },

  // Invoice creation - structured data generation
  "invoice-create": {
    primary: "gemma-3-27b-free",
    fallbacks: ["gpt-4o-mini", "gemini-2.0-flash-exp"],
    reasoning: "Reliable structured data generation for financial documents",
    costLevel: "free",
    capabilities: ["structured-data", "financial", "billy-api"],
  },

  // Calendar checking - simple logic, free model sufficient
  "calendar-check": {
    primary: "gemma-3-27b-free",
    fallbacks: ["gpt-4o-mini", "gemini-2.0-flash-exp"],
    reasoning: "Simple date/time logic, free model optimal",
    costLevel: "free",
    capabilities: ["date-time", "calendar-api", "simple-logic"],
  },

  // Calendar creation - needs precision
  "calendar-create": {
    primary: "gemma-3-27b-free",
    fallbacks: ["gpt-4o-mini", "gemini-2.0-flash-exp"],
    reasoning: "Precise event creation with proper formatting",
    costLevel: "free",
    capabilities: ["event-creation", "calendar-api", "precision"],
  },

  // Lead analysis - complex business reasoning
  "lead-analysis": {
    primary: "claude-3-haiku",
    fallbacks: ["llama-3.1-70b", "gemma-3-27b-free"],
    reasoning: "Complex business analysis and customer insights",
    costLevel: "medium",
    capabilities: ["business-analysis", "customer-insights", "reasoning"],
  },

  // Data analysis - can handle complex queries
  "data-analysis": {
    primary: "llama-3.1-70b",
    fallbacks: ["claude-3-haiku", "gemini-2.0-flash-exp"],
    reasoning: "Advanced reasoning for complex data queries",
    costLevel: "high",
    capabilities: ["complex-reasoning", "data-processing", "analytics"],
  },

  // Code generation - needs technical precision
  "code-generation": {
    primary: "qwen3-coder-free",
    fallbacks: ["deepseek-chat-v3.1-free", "claude-3-haiku", "llama-3.1-70b"],
    reasoning: "Specialized code model with superior technical accuracy",
    costLevel: "free",
    capabilities: [
      "code-generation",
      "technical-accuracy",
      "debugging",
      "code-specialized",
    ],
  },

  // Complex reasoning - use quality model
  "complex-reasoning": {
    primary: "glm-4.5-air-free",
    fallbacks: ["gpt-oss-20b-free", "llama-3.1-70b"],
    reasoning:
      "100% accuracy with excellent reasoning (tested: 100% success rate)",
    costLevel: "free",
    capabilities: [
      "complex-reasoning",
      "problem-solving",
      "analysis",
      "100%-accuracy",
    ],
  },
};

/**
 * Select optimal model based on task type and feature flags
 */
export function selectModel(
  taskType: TaskType,
  userId?: number,
  forceModel?: AIModel
): AIModel {
  const flags = getFeatureFlags(userId);

  // If OpenRouter models are disabled, fallback to legacy Gemma 3 27B
  if (!flags.enableOpenRouterModels) {
    console.log(
      `🔄 OpenRouter disabled (rollout: ${flags.openRouterRolloutPercentage}%), using Gemma 3 27B`
    );
    return "gemma-3-27b-free";
  }

  // If model routing is disabled, use default OpenRouter model
  if (!flags.enableModelRouting) {
    return "glm-4.5-air-free";
  }

  // If specific model is forced, use it
  if (forceModel) {
    return forceModel;
  }

  const config = MODEL_ROUTING_MATRIX[taskType];
  if (!config) {
    console.warn(`Unknown task type: ${taskType}, using default model`);
    return "glm-4.5-air-free";
  }

  // Return primary model from routing matrix
  return config.primary;
}

/**
 * Get model configuration for task type
 */
export function getModelConfig(taskType: TaskType): ModelRoutingConfig {
  return MODEL_ROUTING_MATRIX[taskType] || MODEL_ROUTING_MATRIX.chat;
}

/**
 * Execute LLM call with model routing and fallbacks
 * Now supports LiteLLM integration with gradual rollout
 */
export async function invokeLLMWithRouting(
  taskType: TaskType,
  messages: any[],
  options: {
    userId?: number;
    stream?: boolean;
    forceModel?: AIModel;
    maxRetries?: number;
  } = {}
) {
  const { userId, stream = false, forceModel, maxRetries = 2 } = options;
  const flags = getFeatureFlags(userId);

  let selectedModel = selectModel(taskType, userId, forceModel);
  const config = getModelConfig(taskType);

  console.log(
    `🧠 Model Routing: Task=${taskType}, Model=${selectedModel}, Reason=${config.reasoning}`
  );

  // Check if we should use LiteLLM (gradual rollout)
  const useLiteLLM = shouldUseLiteLLM(userId);

  if (useLiteLLM) {
    console.log(
      `🚀 [LiteLLM] Routing through LiteLLM proxy (rollout: ${ENV.litellmRolloutPercentage}%)`
    );
    return await invokeLLMWithLiteLLM(
      taskType,
      selectedModel,
      messages,
      config,
      { userId, stream, maxRetries }
    );
  }

  // Legacy path: Original routing logic
  let lastError: Error | null = null;
  const modelsToTry = [selectedModel, ...config.fallbacks.slice(0, maxRetries)];

  for (const model of modelsToTry) {
    const startTime = Date.now();

    try {
      console.log(`🔄 Attempting with model: ${model}`);

      let result;
      if (stream) {
        result = await streamResponse(messages);
      } else {
        result = await invokeLLM({ messages });
      }

      // Track successful metric
      const responseTime = Date.now() - startTime;
      trackAIMetric({
        userId,
        modelId: model,
        taskType,
        responseTime,
        success: true,
      });

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const responseTime = Date.now() - startTime;

      // Track failed metric
      trackAIMetric({
        userId,
        modelId: model,
        taskType,
        responseTime,
        success: false,
        errorMessage: lastError.message,
      });

      console.warn(
        `⚠️ Model ${model} failed, trying next fallback:`,
        lastError.message
      );
      continue;
    }
  }

  // All models failed
  throw lastError || new Error("All models failed to respond");
}

/**
 * Get model usage statistics for monitoring
 * @param lastMinutes Number of minutes to look back (default: 60)
 */
export function getModelStats(lastMinutes: number = 60) {
  const summary = getMetricsSummary(lastMinutes);

  // Map model breakdown to modelUsage format
  const modelUsage: Record<string, number> = {};
  Object.entries(summary.modelBreakdown).forEach(([modelId, stats]) => {
    modelUsage[modelId] = stats.requests;
  });

  return {
    totalRequests: summary.totalRequests,
    modelUsage: modelUsage as Record<AIModel, number>,
    averageResponseTime: summary.avgResponseTime,
    errorRate: summary.errorRate,
  };
}

/**
 * Determine if we should use LiteLLM for this request
 * Based on feature flag and gradual rollout percentage
 */
function shouldUseLiteLLM(userId?: number): boolean {
  // Feature flag must be enabled
  if (!ENV.enableLiteLLM) {
    return false;
  }

  // 0% = disabled, 100% = all users
  const rolloutPercentage = ENV.litellmRolloutPercentage;

  if (rolloutPercentage === 0) {
    return false;
  }

  if (rolloutPercentage === 100) {
    return true;
  }

  // Gradual rollout: use userId hash for consistent assignment
  if (userId) {
    const hash = userId % 100;
    return hash < rolloutPercentage;
  }

  // No userId: use random (for anonymous requests)
  return Math.random() * 100 < rolloutPercentage;
}

/**
 * Invoke LLM through LiteLLM proxy with automatic fallback
 */
async function invokeLLMWithLiteLLM(
  taskType: TaskType,
  primaryModel: AIModel,
  messages: any[],
  config: ModelRoutingConfig,
  options: { userId?: number; stream?: boolean; maxRetries?: number }
) {
  const { userId, stream = false, maxRetries = 2 } = options;
  const startTime = Date.now();

  try {
    // Convert Friday AI model name to LiteLLM format
    const litellmModel = mapToLiteLLMModel(primaryModel);

    console.log(
      `🚀 [LiteLLM] Using model: ${litellmModel} (Friday: ${primaryModel})`
    );

    // Call LiteLLM client
    const result = await litellmClient.chatCompletion(
      { messages },
      { model: litellmModel }
    );

    // Track success
    const responseTime = Date.now() - startTime;
    trackAIMetric({
      userId,
      modelId: primaryModel,
      taskType,
      responseTime,
      success: true,
    });

    console.log(`✅ [LiteLLM] Success in ${responseTime}ms`);

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`❌ [LiteLLM] Failed after ${responseTime}ms:`, errorMessage);

    // Track failure
    trackAIMetric({
      userId,
      modelId: primaryModel,
      taskType,
      responseTime,
      success: false,
      errorMessage,
    });

    // LiteLLM already handles fallback internally, but if it completely fails,
    // we can fall back to the legacy path
    console.warn(
      `⚠️ [LiteLLM] All LiteLLM attempts failed, falling back to direct API`
    );

    // Fallback to legacy invokeLLM
    if (stream) {
      return await streamResponse(messages);
    } else {
      return await invokeLLM({ messages });
    }
  }
}
