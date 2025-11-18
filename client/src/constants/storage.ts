/**
 * Storage Constants
 *
 * Centralized storage configuration for file uploads and Supabase Storage integration.
 *
 * @module constants/storage
 *
 * @example
 * ```typescript
 * import { STORAGE, validateFile } from "@/constants/storage";
 *
 * const validation = validateFile(file);
 * if (!validation.valid) {
 *   console.error(validation.error);
 * }
 * ```
 */

export const STORAGE = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  /** Supabase Storage bucket name for customer documents */
  BUCKET_NAME: "customer-documents",

  /** Allowed file types for upload */
  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", // .txt
    "text/csv", // .csv
  ],

  /** Cache control for uploaded files (1 hour) */
  CACHE_CONTROL: "3600",
} as const;

/**
 * Validate file size against maximum allowed size
 *
 * @param size - File size in bytes
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateFileSize(5 * 1024 * 1024); // 5MB
 * if (!result.valid) {
 *   console.error(result.error); // "File size must be less than 10MB"
 * }
 * ```
 */
export function validateFileSize(size: number): {
  valid: boolean;
  error?: string;
} {
  if (size > STORAGE.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate MIME type against allowed types
 *
 * @param type - MIME type (e.g., "application/pdf")
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateFileType("application/pdf");
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateFileType(type: string): {
  valid: boolean;
  error?: string;
} {
  // Type assertion needed because ALLOWED_TYPES is readonly but we're checking against string
  if (!(STORAGE.ALLOWED_TYPES as readonly string[]).includes(type)) {
    return {
      valid: false,
      error: `File type ${type} is not allowed. Allowed types: ${STORAGE.ALLOWED_TYPES.join(", ")}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file (both size and type)
 *
 * @param file - File object from input element
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const validation = validateFile(file);
 *     if (!validation.valid) {
 *       toast.error(validation.error);
 *       return;
 *     }
 *     // File is valid, proceed with upload
 *   }
 * };
 * ```
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }

  const typeCheck = validateFileType(file.type);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  return { valid: true };
}
