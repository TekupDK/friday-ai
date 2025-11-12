/**
 * LiteLLM Integration Types
 * Type definitions for LiteLLM proxy integration
 */

import type { Message, Tool, ToolChoice } from "../../_core/llm";

/**
 * LiteLLM client configuration
 */
export interface LiteLLMConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Chat completion request to LiteLLM
 */
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  tools?: Tool[];
  tool_choice?: ToolChoice;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Chat completion response from LiteLLM
 * Compatible with OpenAI format
 */
export interface ChatCompletionResponse {
  id: string;
  created: number;
  model: string;
  object: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant" | "user" | "system";
      content: string;
      tool_calls?: any[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
  };
  provider?: string;
}

/**
 * LiteLLM health check response
 */
export interface HealthCheckResponse {
  healthy_endpoints: string[];
  unhealthy_endpoints: string[];
  healthy_count: number;
  unhealthy_count: number;
}

/**
 * LiteLLM metrics
 */
export interface LiteLLMMetrics {
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  fallbackRate: number;
  errorRate: number;
  errorsByType: Record<string, number>;
}

/**
 * LiteLLM request options
 */
export interface RequestOptions {
  model?: string;
  maxRetries?: number;
  timeout?: number;
  fallbackModels?: string[];
}
