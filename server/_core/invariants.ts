/**
 * Invariant Assertions
 * Reusable runtime checks for critical business logic
 * 
 * ✅ SECURITY: Validates assumptions that must always be true
 * ✅ DEBUGGING: Fails fast with clear error messages
 * ✅ MONITORING: Logs violations for analysis
 */

import { TRPCError } from "@trpc/server";

import { logger } from "./logger";

/**
 * Assert that a value is not null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value === null || value === undefined) {
    logger.error({ value, message }, "[Invariant] Value is null or undefined");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Invariant violation: ${message}`,
    });
  }
}

/**
 * Assert that a user ID is valid (positive integer)
 */
export function assertValidUserId(userId: unknown, context: string): asserts userId is number {
  if (typeof userId !== "number" || !Number.isInteger(userId) || userId <= 0) {
    logger.error({ userId, context }, "[Invariant] Invalid user ID");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Invariant violation: Invalid user ID in ${context}`,
    });
  }
}

/**
 * Assert that a user owns a resource (userId matches)
 */
export function assertOwnership(
  resourceUserId: number | null | undefined,
  currentUserId: number,
  resourceType: string,
  resourceId: number | string
): void {
  if (!resourceUserId) {
    logger.error(
      { resourceType, resourceId, currentUserId },
      "[Invariant] Resource has no userId"
    );
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${resourceType} not found`,
    });
  }

  if (resourceUserId !== currentUserId) {
    logger.warn(
      { resourceType, resourceId, resourceUserId, currentUserId },
      "[Invariant] Ownership violation"
    );
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have access to this ${resourceType}`,
    });
  }
}

/**
 * Assert that a date is valid and in the future (for scheduling)
 */
export function assertFutureDate(
  date: string | Date,
  fieldName: string
): void {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    logger.error({ date, fieldName }, "[Invariant] Invalid date");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid ${fieldName}: not a valid date`,
    });
  }

  if (dateObj <= new Date()) {
    logger.warn({ date, fieldName }, "[Invariant] Date is not in the future");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be in the future`,
    });
  }
}

/**
 * Assert that an amount is positive
 */
export function assertPositiveAmount(
  amount: number,
  fieldName: string
): void {
  if (!Number.isFinite(amount) || amount < 0) {
    logger.error({ amount, fieldName }, "[Invariant] Invalid amount");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be a positive number`,
    });
  }
}

/**
 * Assert that a percentage is between 0 and 100
 */
export function assertValidPercentage(
  percentage: number,
  fieldName: string
): void {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    logger.error({ percentage, fieldName }, "[Invariant] Invalid percentage");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be between 0 and 100`,
    });
  }
}

/**
 * Assert that an email is valid format
 */
export function assertValidEmail(email: string, fieldName: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.error({ email, fieldName }, "[Invariant] Invalid email format");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be a valid email address`,
    });
  }
}

/**
 * Assert that a rate limit config is valid
 */
export function assertValidRateLimitConfig(config: {
  limit: number;
  windowMs: number;
}): void {
  if (!Number.isFinite(config.limit) || config.limit < 1) {
    logger.error({ config }, "[Invariant] Invalid rate limit config");
    throw new Error("Rate limit 'limit' must be a finite number >= 1");
  }

  if (!Number.isFinite(config.windowMs) || config.windowMs < 1000) {
    logger.error({ config }, "[Invariant] Invalid rate limit config");
    throw new Error("Rate limit 'windowMs' must be a finite number >= 1000ms");
  }
}

/**
 * Assert that a rate limit result is valid
 */
export function assertValidRateLimitResult(result: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}): void {
  if (typeof result.success !== "boolean") {
    throw new Error("Rate limit result 'success' must be boolean");
  }

  if (!Number.isFinite(result.limit) || result.limit < 0) {
    throw new Error("Rate limit result 'limit' must be a finite number >= 0");
  }

  if (!Number.isFinite(result.remaining) || result.remaining < 0) {
    throw new Error("Rate limit result 'remaining' must be a finite number >= 0");
  }

  if (!Number.isFinite(result.reset) || result.reset <= 0) {
    throw new Error("Rate limit result 'reset' must be a finite number > 0");
  }
}

/**
 * Assert that a customer exists and belongs to user
 */
export async function assertCustomerOwnership(
  db: Awaited<ReturnType<typeof import("../db").getDb>>,
  customerId: number,
  userId: number
): Promise<void> {
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  const { customerProfiles } = await import("../../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(and(eq(customerProfiles.id, customerId), eq(customerProfiles.userId, userId)))
    .limit(1);

  if (!customer) {
    logger.warn({ customerId, userId }, "[Invariant] Customer ownership violation");
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer profile not found",
    });
  }
}

/**
 * Type guard to check if a value is a valid date string (ISO 8601)
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.includes("T");
}

/**
 * Type guard to check if a value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

