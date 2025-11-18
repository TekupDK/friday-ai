/**
 * Error Hook: Error Logger
 * 
 * Logs errors with context for debugging
 */

export interface ErrorContext {
  command?: string;
  file?: string;
  line?: number;
  stack?: string;
  timestamp: string;
}

/**
 * Log error with context
 */
export function logError(error: Error, context: ErrorContext): void {
  const errorLog = {
    message: error.message,
    name: error.name,
    ...context,
  };

  // In a real implementation, this would write to a log file or service
  console.error("[Cursor Agent Error]", errorLog);
}

