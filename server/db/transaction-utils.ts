import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

import { logger } from "../_core/logger";
import { getDb } from "../db";

/**
 * Transaction type for Drizzle PostgreSQL
 */
export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

/**
 * Executes a database operation within a transaction
 * Automatically rolls back on error
 *
 * @param operation - The database operation to execute within the transaction
 * @param operationName - Human-readable name for logging purposes
 * @returns The result of the operation
 *
 * @example
 * ```typescript
 * const result = await withTransaction(async (tx) => {
 *   await tx.delete(customerSegmentMembers).where(...);
 *   await tx.delete(customerSegments).where(...);
 *   return { success: true };
 * }, 'Delete Customer Segment');
 * ```
 */
export async function withTransaction<T>(
  operation: (tx: Transaction) => Promise<T>,
  operationName = "Database Transaction"
): Promise<T> {
  const startTime = Date.now();
  const db = await getDb();

  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.transaction(async (tx) => {
      return await operation(tx as unknown as Transaction);
    });

    const duration = Date.now() - startTime;
    logger.info(
      { operationName, duration },
      `Transaction "${operationName}" completed in ${duration}ms`
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        operationName,
        duration,
        error: error instanceof Error ? error.message : String(error)
      },
      `Transaction "${operationName}" failed after ${duration}ms`
    );
    throw error;
  }
}

/**
 * Type-safe transaction helper with retry logic for transient database errors
 *
 * @param operation - The database operation to execute
 * @param options - Configuration options
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param options.retryDelay - Initial delay between retries in ms (default: 100)
 * @param options.operationName - Human-readable name for logging
 * @returns The result of the operation
 *
 * @example
 * ```typescript
 * const result = await withRetryableTransaction(
 *   async (tx) => {
 *     return await tx.insert(customers).values(...).returning();
 *   },
 *   { maxRetries: 3, operationName: 'Create Customer' }
 * );
 * ```
 */
export async function withRetryableTransaction<T>(
  operation: (tx: Transaction) => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    operationName?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 100, operationName = "Transaction" } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(operation, `${operationName} (attempt ${attempt})`);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on application errors, only on database errors
      if (error instanceof Error && !isDatabaseError(error)) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(
          { attempt, nextRetryIn: delay, error: lastError.message },
          `Retrying transaction "${operationName}" after ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Check if an error is a transient database error that should be retried
 */
function isDatabaseError(error: Error): boolean {
  const dbErrorCodes = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EPIPE',
    '40001', // PostgreSQL serialization failure
    '40P01', // PostgreSQL deadlock detected
    '53300', // PostgreSQL too many connections
    '08006', // PostgreSQL connection failure
    '08003', // PostgreSQL connection does not exist
    '08000', // PostgreSQL connection exception
  ];

  const errorMessage = error.message.toUpperCase();
  return dbErrorCodes.some(code => errorMessage.includes(code.toUpperCase()));
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    const db = await getDb();
    return db !== null;
  } catch {
    return false;
  }
}
