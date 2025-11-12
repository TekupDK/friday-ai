/**
 * LiteLLM Integration Errors
 * Custom error classes for LiteLLM integration
 */

/**
 * Base LiteLLM error
 */
export class LiteLLMError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public provider?: string,
    public details?: any
  ) {
    super(message);
    this.name = "LiteLLMError";
    Object.setPrototypeOf(this, LiteLLMError.prototype);
  }
}

/**
 * LiteLLM timeout error
 */
export class LiteLLMTimeoutError extends LiteLLMError {
  constructor(message: string = "Request timeout", provider?: string) {
    super(message, 408, provider);
    this.name = "LiteLLMTimeoutError";
    Object.setPrototypeOf(this, LiteLLMTimeoutError.prototype);
  }
}

/**
 * LiteLLM rate limit error
 */
export class LiteLLMRateLimitError extends LiteLLMError {
  constructor(message: string = "Rate limit exceeded", provider?: string) {
    super(message, 429, provider);
    this.name = "LiteLLMRateLimitError";
    Object.setPrototypeOf(this, LiteLLMRateLimitError.prototype);
  }
}

/**
 * LiteLLM provider error
 * When a specific model/provider fails
 */
export class LiteLLMProviderError extends LiteLLMError {
  constructor(
    message: string,
    statusCode: number,
    provider?: string,
    details?: any
  ) {
    super(message, statusCode, provider, details);
    this.name = "LiteLLMProviderError";
    Object.setPrototypeOf(this, LiteLLMProviderError.prototype);
  }
}

/**
 * LiteLLM network error
 * When connection to LiteLLM proxy fails
 */
export class LiteLLMNetworkError extends LiteLLMError {
  constructor(message: string = "Network error", details?: any) {
    super(message, 503, undefined, details);
    this.name = "LiteLLMNetworkError";
    Object.setPrototypeOf(this, LiteLLMNetworkError.prototype);
  }
}

/**
 * LiteLLM invalid request error
 */
export class LiteLLMInvalidRequestError extends LiteLLMError {
  constructor(message: string = "Invalid request", details?: any) {
    super(message, 400, undefined, details);
    this.name = "LiteLLMInvalidRequestError";
    Object.setPrototypeOf(this, LiteLLMInvalidRequestError.prototype);
  }
}
