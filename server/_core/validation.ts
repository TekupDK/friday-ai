/**
 * Shared validation schemas for consistent input validation across the application
 * ✅ SECURITY: All string inputs have max length limits to prevent DoS attacks
 */

import { z } from "zod";

/**
 * Standard validation schemas with security limits
 */
export const validationSchemas = {
  // Email validation (RFC 5321 max length: 320 characters)
  email: z.string().email().max(320),

  // Name validation (reasonable max for names)
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/),

  // Phone number validation
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\-\+\(\)]+$/)
    .optional(),

  // URL validation
  url: z.string().url().max(2048),

  // Text content (for messages, descriptions, etc.)
  text: z.string().max(10000),
  shortText: z.string().max(500),
  mediumText: z.string().max(2000),
  longText: z.string().max(5000),

  // Title/Subject validation
  title: z.string().min(1).max(500),
  shortTitle: z.string().min(1).max(255),

  // Search query validation
  searchQuery: z.string().max(500),

  // Model name validation
  modelName: z.string().max(100),

  // Page/Route validation
  page: z.string().max(100),

  // Color hex validation
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .max(7)
    .optional(),

  // Filename validation
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^\/\\<>:"|?*\x00-\x1f]+$/),

  // Entity type validation (enum-like)
  entityType: z.string().min(1).max(50),

  // Action type validation
  action: z.string().min(1).max(50),

  // Relationship type validation
  relationshipType: z.string().min(1).max(50),

  // IP address validation (IPv4 or IPv6)
  ipAddress: z
    .string()
    .regex(
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    )
    .max(45)
    .optional(),

  // User agent validation
  userAgent: z.string().max(500).optional(),

  // Category validation
  category: z.string().max(100).optional(),

  // Description fields (various lengths)
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),

  // Address validation
  address: z.string().min(3).max(500),

  // City validation
  city: z.string().max(120),

  // Postal code validation
  postalCode: z.string().max(20),

  // Date validation (ISO 8601 datetime string)
  dateTime: z.string().datetime(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .max(10),

  // Amount validation (positive numbers)
  amount: z.number().int().min(0),
  amountDecimal: z.number().min(0),

  // Thread/Message ID validation (Gmail thread IDs can be long)
  threadId: z.string().max(100),
  messageId: z.string().max(100),

  // Email addresses (for to/cc/bcc fields)
  emailAddress: z.string().email().max(320),
  emailAddressList: z.string().max(5000), // Comma-separated list

  // Subject line validation
  subject: z.string().max(500),

  // Body/content validation
  body: z.string().max(50000), // Email body can be large but limit to prevent DoS
  content: z.string().max(5000),

  // Page token validation (for pagination)
  pageToken: z.string().max(500),

  // MIME type validation
  mimeType: z
    .string()
    .max(100)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/
    ),

  // Storage URL validation
  storageUrl: z.string().url().max(2048),

  // Reason/description fields
  reason: z.string().max(1000).optional(),
  wonReason: z.string().max(1000).optional(),
  lostReason: z.string().max(1000).optional(),

  // Label name validation (Gmail labels)
  labelName: z
    .string()
    .min(1, "Label name cannot be empty")
    .max(100, "Label name too long (max 100 characters)")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Label name contains invalid characters"),
};

/**
 * Helper to create array validators with max length
 */
export function createArrayValidator<T extends z.ZodTypeAny>(
  itemSchema: T,
  maxLength: number = 100
) {
  return z.array(itemSchema).max(maxLength);
}

/**
 * Helper to create optional string with max length
 */
export function optionalString(maxLength: number = 255) {
  return z.string().max(maxLength).optional();
}
