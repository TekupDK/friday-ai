/**
 * LiteLLM Integration - Main Exports
 * 
 * This module provides LiteLLM proxy integration for Friday AI
 * All models are FREE OpenRouter models ($0.00 cost)
 */

export { litellmClient, LiteLLMClient } from './client';
export { 
  mapToLiteLLMModel, 
  mapToFridayModel,
  getFallbackModels,
} from './model-mappings';
export {
  LiteLLMError,
  LiteLLMTimeoutError,
  LiteLLMRateLimitError,
  LiteLLMProviderError,
  LiteLLMNetworkError,
  LiteLLMInvalidRequestError,
} from './errors';
export {
  LITELLM_DEFAULTS,
  LITELLM_MODELS,
  LITELLM_ENDPOINTS,
} from './constants';

// Re-export types
export type {
  LiteLLMConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  HealthCheckResponse,
  LiteLLMMetrics,
  RequestOptions,
} from './types';
