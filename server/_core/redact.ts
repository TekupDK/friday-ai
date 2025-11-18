/**
 * Data Redaction Utility
 * ✅ SECURITY: Redacts sensitive information from logs and error messages
 */

/**
 * List of sensitive field names (case-insensitive matching)
 */
const SENSITIVE_KEYS = [
  "cookie",
  "cookieval",
  "sessiontoken",
  "session",
  "password",
  "passwd",
  "pwd",
  "apikey",
  "api_key",
  "secret",
  "token",
  "authorization",
  "auth",
  "jwt",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "privatekey",
  "private_key",
  "credential",
  "credential",
  "bearer",
  "x-api-key",
  "x-csrf-token",
  "database", // ✅ FIXED: Added database to catch database_url, databaseUrl, etc.
  "db",
  "connection",
  "url",
];

/**
 * Patterns that indicate sensitive data
 */
const SENSITIVE_PATTERNS = [
  /^[A-Za-z0-9_-]{20,}$/, // Long alphanumeric strings (likely tokens)
  /^Bearer\s+[A-Za-z0-9_-]+$/i, // Bearer tokens
  /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-like strings
];

/**
 * Check if a key name indicates sensitive data
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sk => lowerKey.includes(sk));
}

/**
 * Check if a value looks like sensitive data
 */
function looksLikeSensitiveValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  
  // Check patterns
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Redact sensitive data from an object
 * Recursively processes objects and arrays
 */
export function redact(obj: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return "[MAX_DEPTH_REACHED]";
  }

  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitives (including strings)
  if (typeof obj !== "object") {
    // If it's a string, use redactString for pattern matching
    if (typeof obj === "string") {
      return redactString(obj);
    }
    // Check if primitive value looks sensitive
    if (looksLikeSensitiveValue(obj)) {
      return "[REDACTED]";
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redact(item, depth + 1));
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }

  // Handle Error objects
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: redactString(obj.message), // ✅ FIXED: Use redactString to preserve message structure
      stack: process.env.NODE_ENV === "production" ? "[REDACTED]" : redactString(obj.stack || ""),
    };
  }

  // Handle objects
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // ✅ FIXED: Check if value is an object FIRST, before checking if key is sensitive
    // This ensures nested objects are recursively processed even if the key name is sensitive
    // Helper to check if value is a plain object (not array, Date, Error, etc.)
    const isPlainObject = 
      typeof value === "object" && 
      value !== null && 
      !Array.isArray(value) && 
      !(value instanceof Date) && 
      !(value instanceof Error);
    
    // Handle arrays - recursively process array items
    if (Array.isArray(value)) {
      redacted[key] = redact(value, depth + 1);
    } else if (isPlainObject) {
      // Recursively redact nested objects (regardless of key name)
      redacted[key] = redact(value, depth + 1);
    } else {
      const isSensitive = isSensitiveKey(key);
      
      if (isSensitive) {
        // Redact sensitive keys, but check value pattern first for Bearer tokens
        if (typeof value === "string" && value.length > 0) {
          // Special handling for Bearer tokens - preserve format
          if (/^Bearer\s+[A-Za-z0-9_-]+$/i.test(value)) {
            redacted[key] = "Bearer [TOKEN]";
          }
          // Check for database connection strings
          // Note: Use non-global regex for testing (global flag causes state issues with .test())
          else if (/[a-z]+:\/\/[^@]+@[^\s]+/i.test(value)) {
            redacted[key] = "[REDACTED]";
          }
          // Show first 4 chars and last 4 chars for debugging (only in dev)
          else if (process.env.NODE_ENV === "development" && value.length > 8) {
            redacted[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
          } else {
            redacted[key] = "[REDACTED]";
          }
        } else {
          redacted[key] = "[REDACTED]";
        }
      } else if (typeof value === "string") {
        // ✅ FIXED: Redact sensitive patterns in string values (emails, DB URLs, Bearer tokens)
        // Use redactString for partial string redaction (preserves message structure)
        // Note: Use non-global regex for testing (global flag causes state issues with .test())
        if (/[a-z]+:\/\/[^@]+@[^\s]+/i.test(value) || /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(value) || /^Bearer\s+[A-Za-z0-9_-]+$/i.test(value)) {
          // Use redactString to preserve message structure (e.g., "Error: [DB_CONNECTION_STRING]")
          redacted[key] = redactString(value);
        }
        // Check for other sensitive patterns
        else if (looksLikeSensitiveValue(value)) {
          redacted[key] = "[REDACTED]";
        } else {
          redacted[key] = value;
        }
      } else if (looksLikeSensitiveValue(value)) {
        // Value looks sensitive even if key doesn't
        redacted[key] = "[REDACTED]";
      } else {
        // Safe to include
        redacted[key] = value;
      }
    }
  }

  return redacted;
}

/**
 * Redact sensitive data from a string (for simple log messages)
 * ✅ FIXED: Updated to match test expectations
 */
export function redactString(str: string): string {
  // Redact common patterns
  let redacted = str;
  
  // Redact database connection strings (postgres://, mysql://, etc.)
  redacted = redacted.replace(/[a-z]+:\/\/[^@]+@[^\s]+/gi, "[DB_CONNECTION_STRING]");
  
  // Redact JWT tokens (3 parts separated by dots)
  redacted = redacted.replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[JWT_TOKEN]");
  
  // Redact Bearer tokens
  redacted = redacted.replace(/Bearer\s+[A-Za-z0-9_-]+/gi, "Bearer [TOKEN]");
  
  // Redact long alphanumeric strings (likely tokens, API keys)
  redacted = redacted.replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[TOKEN]");
  
  // Redact email addresses
  redacted = redacted.replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, "[EMAIL]");
  
  // Redact credit card numbers (16 digits, may have dashes/spaces)
  redacted = redacted.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[CREDIT_CARD]");
  
  // Redact Danish CPR numbers (DDMMYY-XXXX or DDMMYYXXXX)
  redacted = redacted.replace(/\b\d{6}-?\d{4}\b/g, "[CPR]");
  
  // Redact auth codes in URLs
  redacted = redacted.replace(/code=[A-Za-z0-9_-]+/gi, "code=[REDACTED]");
  
  // Redact password fields in JSON strings
  redacted = redacted.replace(/"password"\s*:\s*"[^"]*"/gi, '"password":"[REDACTED]"');
  
  return redacted;
}

/**
 * Safe stringify that redacts sensitive data
 */
export function safeStringify(obj: any, space?: number): string {
  try {
    const redacted = redact(obj);
    return JSON.stringify(redacted, null, space);
  } catch (error) {
    return `[STRINGIFY_ERROR: ${error}]`;
  }
}

/**
 * Redact sensitive data from an object (alias for redact for backward compatibility)
 * ✅ FIXED: Added missing function expected by tests
 * 
 * @param obj - Object to redact
 * @returns Redacted object with sensitive data replaced
 * 
 * @example
 * ```ts
 * const redacted = redactObject({ password: "secret", name: "John" });
 * // Returns: { password: "[REDACTED]", name: "John" }
 * ```
 */
export function redactObject(obj: any): any {
  return redact(obj);
}

/**
 * Redact sensitive environment variables
 * ✅ FIXED: Added missing function expected by tests
 * 
 * @param env - Environment variables object
 * @returns Redacted environment variables with sensitive values replaced
 * 
 * @example
 * ```ts
 * const redacted = redactEnv({ DATABASE_URL: "postgres://...", PORT: "3000" });
 * // Returns: { DATABASE_URL: "[REDACTED]", PORT: "3000" }
 * ```
 */
export function redactEnv(env: Record<string, string | undefined>): Record<string, string | undefined> {
  const redacted: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      redacted[key] = undefined;
    } else if (isSensitiveKey(key) || looksLikeSensitiveValue(value) || /[a-z]+:\/\/[^@]+@[^\s]+/i.test(value)) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}
