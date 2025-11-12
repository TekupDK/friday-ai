/**
 * LiteLLM Integration Constants
 * All configuration constants for LiteLLM proxy
 */

export const LITELLM_DEFAULTS = {
  BASE_URL: "http://localhost:4000",
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 500, // 500ms
  DEFAULT_MODEL: "openrouter/z-ai/glm-4.5-air:free",
} as const;

/**
 * All FREE OpenRouter models available via LiteLLM
 * Cost: $0.00 for all models
 */
export const LITELLM_MODELS = {
  PRIMARY: "openrouter/z-ai/glm-4.5-air:free",
  FALLBACK_1: "openrouter/deepseek/deepseek-chat-v3.1:free",
  FALLBACK_2: "openrouter/minimax/minimax-m2:free",
  FALLBACK_3: "openrouter/moonshotai/kimi-k2:free",
  FALLBACK_4: "openrouter/qwen/qwen3-coder:free",
} as const;

/**
 * LiteLLM API endpoints
 */
export const LITELLM_ENDPOINTS = {
  HEALTH: "/health",
  CHAT: "/chat/completions",
  MODELS: "/models",
  METRICS: "/metrics",
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  TIMEOUT: "LiteLLM request timed out",
  RATE_LIMIT: "LiteLLM rate limit exceeded",
  UNAVAILABLE: "LiteLLM service unavailable",
  INVALID_REQUEST: "Invalid request to LiteLLM",
  NETWORK_ERROR: "Network error connecting to LiteLLM",
  ALL_MODELS_FAILED: "All LiteLLM models failed",
} as const;
