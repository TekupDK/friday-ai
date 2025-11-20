/**
 * Client-side Logging Service
 *
 * Provides structured logging for client-side errors and events.
 * Can be extended with Sentry or other error tracking services.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('Error message', { context: 'component' });
 *   logger.warn('Warning message', { data: {...} });
 *   logger.info('Info message');
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Log error with context
   */
  error(message: string, context?: LogContext, error?: Error | unknown) {
    const logData = {
      level: "error" as LogLevel,
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    // Always log errors to console in development
    if (this.isDevelopment) {
      console.error(`[Logger] ${message}`, logData);
    }

    // In production, send to error tracking service (Sentry, etc.)
    if (this.isProduction) {
      // TODO: Integrate with Sentry or other error tracking service
      // Sentry.captureException(error, { extra: logData });
      console.error(`[Logger] ${message}`, logData);
    }
  }

  /**
   * Log warning with context
   */
  warn(message: string, context?: LogContext) {
    const logData = {
      level: "warn" as LogLevel,
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.warn(`[Logger] ${message}`, logData);
    }

    // In production, optionally send warnings to tracking service
    if (this.isProduction) {
      // TODO: Integrate with Sentry or other error tracking service
      // Sentry.captureMessage(message, { level: 'warning', extra: logData });
      console.warn(`[Logger] ${message}`, logData);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    const logData = {
      level: "info" as LogLevel,
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.log(`[Logger] ${message}`, logData);
    }

    // Info logs typically not sent to tracking service in production
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[Logger] ${message}`, {
        level: "debug" as LogLevel,
        message,
        context: context || {},
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in components
export type { LogContext };
