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

  // Handle primitives
  if (typeof obj !== "object") {
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
      message: redact(obj.message, depth + 1),
      stack: process.env.NODE_ENV === "production" ? "[REDACTED]" : obj.stack,
    };
  }

  // Handle objects
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = isSensitiveKey(key);
    
    if (isSensitive) {
      // Redact sensitive keys
      if (typeof value === "string" && value.length > 0) {
        // Show first 4 chars and last 4 chars for debugging (only in dev)
        if (process.env.NODE_ENV === "development" && value.length > 8) {
          redacted[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
        } else {
          redacted[key] = "[REDACTED]";
        }
      } else {
        redacted[key] = "[REDACTED]";
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively redact nested objects
      redacted[key] = redact(value, depth + 1);
    } else if (looksLikeSensitiveValue(value)) {
      // Value looks sensitive even if key doesn't
      redacted[key] = "[REDACTED]";
    } else {
      // Safe to include
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact sensitive data from a string (for simple log messages)
 */
export function redactString(str: string): string {
  // Redact common patterns
  let redacted = str;
  
  // Redact JWT tokens (3 parts separated by dots)
  redacted = redacted.replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[JWT_REDACTED]");
  
  // Redact long alphanumeric strings (likely tokens)
  redacted = redacted.replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[TOKEN_REDACTED]");
  
  // Redact email-like patterns that might be sensitive
  // (Keep actual emails, but redact if they look like tokens)
  redacted = redacted.replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, (match) => {
    // Only redact if it's in a sensitive context (like "token: email@...")
    if (str.toLowerCase().includes("token") || str.toLowerCase().includes("secret")) {
      return "[EMAIL_REDACTED]";
    }
    return match;
  });
  
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
