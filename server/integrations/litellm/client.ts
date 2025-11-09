/**
 * LiteLLM Client
 * Main client for interacting with LiteLLM proxy
 */

import type { InvokeParams, InvokeResult } from '../../_core/llm';
import { ENV } from '../../_core/env';
import { LITELLM_DEFAULTS, LITELLM_ENDPOINTS, ERROR_MESSAGES } from './constants';
import {
  LiteLLMError,
  LiteLLMTimeoutError,
  LiteLLMNetworkError,
  LiteLLMProviderError,
} from './errors';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  HealthCheckResponse,
  RequestOptions,
} from './types';

export class LiteLLMClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor() {
    this.baseUrl = ENV.litellmBaseUrl || LITELLM_DEFAULTS.BASE_URL;
    this.timeout = LITELLM_DEFAULTS.TIMEOUT;
    this.maxRetries = LITELLM_DEFAULTS.MAX_RETRIES;
  }

  /**
   * Main chat completion method
   * Compatible with Friday AI's invokeLLM signature
   */
  async chatCompletion(
    params: InvokeParams,
    options?: RequestOptions
  ): Promise<InvokeResult> {
    const { messages, tools, toolChoice, tool_choice } = params;
    const model = options?.model || LITELLM_DEFAULTS.DEFAULT_MODEL;

    const request: ChatCompletionRequest = {
      model,
      messages: messages || [],
      max_tokens: 32768,
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      request.tools = tools;
      request.tool_choice = toolChoice || tool_choice;
    }

    try {
      const response = await this.makeRequest<ChatCompletionResponse>(
        LITELLM_ENDPOINTS.CHAT,
        {
          method: 'POST',
          body: JSON.stringify(request),
        },
        options?.timeout || this.timeout
      );

      return this.mapToInvokeResult(response);
    } catch (error) {
      // Log error for debugging
      console.error('[LiteLLM] Chat completion error:', error);
      throw error;
    }
  }

  /**
   * Health check
   * Returns true if LiteLLM is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<HealthCheckResponse>(
        LITELLM_ENDPOINTS.HEALTH,
        { method: 'GET' },
        5000 // 5 second timeout for health check
      );
      return response.healthy_count >= 0;
    } catch {
      return false;
    }
  }

  /**
   * Make HTTP request to LiteLLM
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new LiteLLMProviderError(
          `LiteLLM request failed: ${response.status}`,
          response.status,
          undefined,
          errorText
        );
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new LiteLLMTimeoutError(ERROR_MESSAGES.TIMEOUT);
        }
        if (error.message.includes('fetch')) {
          throw new LiteLLMNetworkError(ERROR_MESSAGES.NETWORK_ERROR, error);
        }
      }

      throw error;
    }
  }

  /**
   * Map LiteLLM response to Friday AI InvokeResult format
   */
  private mapToInvokeResult(response: ChatCompletionResponse): InvokeResult {
    return {
      id: response.id,
      created: response.created,
      model: response.model,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
          tool_calls: choice.message.tool_calls,
        },
        finish_reason: choice.finish_reason,
      })),
      usage: response.usage,
    };
  }
}

/**
 * Singleton instance
 */
export const litellmClient = new LiteLLMClient();
