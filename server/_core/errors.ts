/**
 * Error Sanitization Utility
 * Prevents information leakage in production error messages
 */

import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

/**
 * ✅ SECURITY FIX: Sanitize error messages to prevent information leakage
 * 
 * In production, returns generic error messages to prevent exposing:
 * - Internal error details
 * - Stack traces
 * - Database errors
 * - File paths
 * - API keys or secrets
 * 
 * In development, returns full error messages for debugging.
 * 
 * @param error - The error to sanitize (can be Error, TRPCError, or unknown)
 * @returns Sanitized error message safe to return to clients
 * 
 * @example
 * ```ts
 * try {
 *   // ... operation that might fail
 * } catch (error) {
 *   throw new TRPCError({
 *     code: "INTERNAL_SERVER_ERROR",
 *     message: sanitizeError(error),
 *   });
 * }
 * ```
 */
export function sanitizeError(error: unknown): string {
  // TRPCError messages are already user-facing and safe
  if (error instanceof TRPCError) {
    return error.message;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // In production, return generic message to prevent information leakage
    if (ENV.isProduction) {
      // Check if error message contains sensitive information
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /key/i,
        /token/i,
        /api[_-]?key/i,
        /database/i,
        /connection/i,
        /sql/i,
        /query/i,
        /file[_\s]?path/i,
        /stack[_\s]?trace/i,
        /at\s+\w+\.\w+/i, // Stack trace format
      ];

      const hasSensitiveInfo = sensitivePatterns.some(pattern =>
        pattern.test(error.message)
      );

      if (hasSensitiveInfo) {
        return "An error occurred. Please try again later.";
      }

      // For non-sensitive errors, still return generic message in production
      // to prevent exposing internal implementation details
      return "An error occurred. Please try again later.";
    }

    // In development, return full error message for debugging
    return error.message;
  }

  // Handle unknown error types
  if (typeof error === "string") {
    // In production, don't expose string errors (might contain sensitive info)
    return ENV.isProduction
      ? "An error occurred. Please try again later."
      : error;
  }

  // Fallback for any other error type
  return "An unexpected error occurred";
}

/**
 * ✅ SECURITY FIX: Create a safe TRPCError from any error
 * 
 * Convenience function that sanitizes the error and creates a TRPCError
 * with appropriate error code.
 * 
 * @param error - The error to convert
 * @param code - TRPC error code (defaults to INTERNAL_SERVER_ERROR)
 * @returns TRPCError with sanitized message
 * 
 * @example
 * ```ts
 * try {
 *   // ... operation
 * } catch (error) {
 *   throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
 * }
 * ```
 */
export function createSafeTRPCError(
  error: unknown,
  code: TRPCError["code"] = "INTERNAL_SERVER_ERROR"
): TRPCError {
  return new TRPCError({
    code,
    message: sanitizeError(error),
    cause: error instanceof Error ? error : undefined,
  });
}

