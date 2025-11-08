/**
 * Model Router - Intent-based Model Selection
 * Routes different intents to optimal AI models
 */

import { invokeLLM, streamResponse } from "./_core/llm";
import { getFeatureFlags } from "./_core/feature-flags";

export type AIModel = 
  | "gemma-3-27b-free"     // Primary: Free, Claude-quality
  | "gpt-4o-mini"          // Fallback: OpenAI, fast
  | "gemini-2.0-flash-exp" // Fallback: Google, multimodal
  | "claude-3-haiku"       // Premium: Anthropic, high quality
  | "llama-3.1-70b";       // Premium: Meta, complex reasoning

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
    primary: "gemma-3-27b-free",
    fallbacks: ["gpt-4o-mini", "gemini-2.0-flash-exp"],
    reasoning: "Free model with Claude-quality for daily conversations",
    costLevel: "free",
    capabilities: ["conversation", "danish", "professional-tone"],
  },

  // Email drafting - needs professional writing skills
  "email-draft": {
    primary: "gemma-3-27b-free",
    fallbacks: ["claude-3-haiku", "gpt-4o-mini"],
    reasoning: "Professional writing with Danish business context",
    costLevel: "free",
    capabilities: ["professional-writing", "danish", "email-format"],
  },

  // Email analysis - can handle complex thread analysis
  "email-analysis": {
    primary: "claude-3-haiku",
    fallbacks: ["gemma-3-27b-free", "gemini-2.0-flash-exp"],
    reasoning: "Superior analysis capabilities for complex email threads",
    costLevel: "medium",
    capabilities: ["analysis", "context-understanding", "summarization"],
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
    primary: "claude-3-haiku",
    fallbacks: ["llama-3.1-70b", "gpt-4o-mini"],
    reasoning: "Superior code quality and technical accuracy",
    costLevel: "medium",
    capabilities: ["code-generation", "technical-accuracy", "debugging"],
  },

  // Complex reasoning - use best available model
  "complex-reasoning": {
    primary: "llama-3.1-70b",
    fallbacks: ["claude-3-haiku", "gemini-2.0-flash-exp"],
    reasoning: "Maximum reasoning capability for complex problems",
    costLevel: "high",
    capabilities: ["complex-reasoning", "problem-solving", "analysis"],
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
  
  // If model routing is disabled, use default
  if (!flags.enableModelRouting) {
    return "gemma-3-27b-free";
  }

  // If specific model is forced, use it
  if (forceModel) {
    return forceModel;
  }

  const config = MODEL_ROUTING_MATRIX[taskType];
  if (!config) {
    console.warn(`Unknown task type: ${taskType}, using default model`);
    return "gemma-3-27b-free";
  }

  // TODO: Implement cost/usage tracking for model selection
  // For now, return primary model
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
  
  console.log(`🧠 Model Routing: Task=${taskType}, Model=${selectedModel}, Reason=${config.reasoning}`);

  let lastError: Error | null = null;
  
  // Try primary model first, then fallbacks
  const modelsToTry = [selectedModel, ...config.fallbacks.slice(0, maxRetries)];
  
  for (const model of modelsToTry) {
    try {
      if (stream) {
        return await streamResponse({ model });
      } else {
        return await invokeLLM({ model });
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Model ${model} failed, trying next fallback:`, lastError.message);
      continue;
    }
  }

  // All models failed
  throw lastError || new Error("All models failed to respond");
}

/**
 * Get model usage statistics for monitoring
 */
export function getModelStats() {
  // TODO: Implement model usage tracking
  return {
    totalRequests: 0,
    modelUsage: {} as Record<AIModel, number>,
    averageResponseTime: 0,
    errorRate: 0,
  };
}
