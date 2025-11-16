/**
 * Comprehensive Error Handling Utilities
 * Provides retry logic, circuit breakers, and graceful error handling
 */

import { TRPCError } from "@trpc/server";
import { logger } from "./logger";
import { sanitizeError, createSafeTRPCError } from "./errors";

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "ECONNREFUSED",
    "timeout",
    "network",
    "rate limit",
    "429",
    "503",
    "502",
  ],
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  return retryableErrors.some(
    pattern =>
      errorMessage.includes(pattern.toLowerCase()) ||
      errorName.includes(pattern.toLowerCase())
  );
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 * 
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   async () => await fetchData(),
 *   { maxAttempts: 3, initialDelayMs: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableErrors,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error, retryableErrors)) {
        logger.warn(
          { err: error, attempt },
          "[Retry] Non-retryable error, aborting retries"
        );
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        logger.error(
          { err: error, attempt, maxAttempts },
          "[Retry] All retry attempts exhausted"
        );
        break;
      }

      // Log retry attempt
      logger.warn(
        {
          err: error,
          attempt,
          maxAttempts,
          delay,
          nextAttempt: attempt + 1,
        },
        "[Retry] Retrying after error"
      );

      // Wait before retrying
      await sleep(Math.min(delay, maxDelayMs));

      // Exponential backoff
      delay *= backoffMultiplier;
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Circuit breaker state
 */
type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerConfig {
  failureThreshold?: number;
  successThreshold?: number;
  timeoutMs?: number;
  resetTimeoutMs?: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
}

/**
 * Circuit breaker for external service calls
 * Prevents cascading failures by opening circuit after too many failures
 * 
 * @example
 * ```ts
 * const breaker = createCircuitBreaker({ failureThreshold: 5 });
 * const result = await breaker.execute(() => callExternalService());
 * ```
 */
export function createCircuitBreaker(config: CircuitBreakerConfig = {}) {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeoutMs = 5000,
    resetTimeoutMs = 60000,
  } = config;

  let state: CircuitBreakerState = {
    state: "closed",
    failures: 0,
    successes: 0,
  };

  return {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      // Check if circuit should be reset
      if (state.state === "open") {
        const timeSinceLastFailure = Date.now() - (state.lastFailureTime || 0);
        if (timeSinceLastFailure >= resetTimeoutMs) {
          logger.info("[CircuitBreaker] Moving to half-open state");
          state = {
            state: "half-open",
            failures: 0,
            successes: 0,
          };
        } else {
          throw new TRPCError({
            code: "SERVICE_UNAVAILABLE",
            message: "Service temporarily unavailable. Please try again later.",
          });
        }
      }

      try {
        // Execute with timeout
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Operation timed out")),
              timeoutMs
            )
          ),
        ]);

        // Success - reset failures
        if (state.state === "half-open") {
          state.successes++;
          if (state.successes >= successThreshold) {
            logger.info("[CircuitBreaker] Circuit closed, service recovered");
            state = {
              state: "closed",
              failures: 0,
              successes: 0,
            };
          }
        } else {
          state.failures = 0;
        }

        return result;
      } catch (error) {
        state.failures++;
        state.lastFailureTime = Date.now();

        // Open circuit if threshold exceeded
        if (state.failures >= failureThreshold) {
          logger.error(
            {
              err: error,
              failures: state.failures,
              threshold: failureThreshold,
            },
            "[CircuitBreaker] Opening circuit due to too many failures"
          );
          state.state = "open";
        }

        throw error;
      }
    },

    getState(): CircuitState {
      return state.state;
    },

    reset(): void {
      state = {
        state: "closed",
        failures: 0,
        successes: 0,
      };
    },
  };
}

/**
 * Wrap database operation with error handling
 * 
 * @param operation - Database operation to execute
 * @param errorMessage - Custom error message
 * @returns Result of the operation
 * @throws TRPCError with appropriate code
 * 
 * @example
 * ```ts
 * const result = await withDatabaseErrorHandling(
 *   () => db.select().from(users),
 *   "Failed to fetch users"
 * );
 * ```
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage = "Database operation failed"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error({ err: error }, `[Database] ${errorMessage}`);

    // Check for specific database errors
    if (error instanceof Error) {
      // Connection errors
      if (
        error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed. Please try again later.",
        });
      }

      // Query errors
      if (
        error.message.includes("syntax") ||
        error.message.includes("SQL") ||
        error.message.includes("query")
      ) {
        throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
      }

      // Constraint violations
      if (
        error.message.includes("constraint") ||
        error.message.includes("unique") ||
        error.message.includes("duplicate")
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A record with this information already exists.",
        });
      }
    }

    // Generic error
    throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
  }
}

/**
 * Wrap external API call with error handling and retry
 * 
 * @param operation - API call to execute
 * @param config - Retry configuration
 * @returns Result of the operation
 * @throws TRPCError with appropriate code
 * 
 * @example
 * ```ts
 * const result = await withApiErrorHandling(
 *   () => fetch("https://api.example.com/data"),
 *   { maxAttempts: 3 }
 * );
 * ```
 */
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  try {
    return await retryWithBackoff(operation, config);
  } catch (error) {
    logger.error({ err: error }, "[API] External API call failed");

    if (error instanceof Error) {
      // Rate limiting
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      // Service unavailable
      if (
        error.message.includes("503") ||
        error.message.includes("502") ||
        error.message.includes("SERVICE_UNAVAILABLE")
      ) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "External service is temporarily unavailable. Please try again later.",
        });
      }

      // Authentication errors
      if (
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("unauthorized")
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication failed with external service.",
        });
      }
    }

    throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
  }
}

/**
 * Safe async operation wrapper
 * Catches all errors and converts to TRPCError
 * 
 * @param operation - Operation to execute
 * @param defaultCode - Default TRPC error code
 * @returns Result of the operation
 * @throws TRPCError
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  defaultCode: TRPCError["code"] = "INTERNAL_SERVER_ERROR"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw createSafeTRPCError(error, defaultCode);
  }
}

