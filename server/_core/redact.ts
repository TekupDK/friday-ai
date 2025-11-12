/**
 * Log redaction utilities for sanitizing sensitive data
 * Protects PII, credentials, and other sensitive information from logs
 */

// Patterns for detecting sensitive data
const PATTERNS = {
  // Database connection strings (must be VERY specific to avoid false positives)
  dbConnection: /(postgres|mysql|mongodb|mariadb|mssql):\/\/[^\s:]+:[^\s@]+@[^\s\/]+(?::\d+)?\/[^\s]+/gi,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  
  // JWT tokens (more specific - must have 3 parts)
  jwt: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  
  // API keys and tokens (common formats) - less aggressive
  apiKey: /\b(?:sk|pk|key)[-_][a-z0-9_-]{20,}\b/gi,
  bearerToken: /Bearer\s+[A-Za-z0-9._-]+/gi,
  
  // Password fields (in objects/JSON)
  passwordField: /(["']?password["']?\s*[:=]\s*["'])([^"']+)(["'])/gi,
  
  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  
  // Danish CPR numbers (DDMMYY-XXXX)
  cpr: /\b\d{6}[-\s]?\d{4}\b/g,
  
  // OAuth/Auth codes
  authCode: /[?&](code|token|access_token|refresh_token)=([^&\s]+)/gi,
};

// Sensitive field names to redact in objects
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'apikey',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authToken',
  'auth_token',
  'privateKey',
  'private_key',
  'cookieSecret',
  'cookie_secret',
  'jwtSecret',
  'jwt_secret',
  'databaseUrl',
  'database_url',
  'connectionString',
  'connection_string',
  'masterKey',
  'master_key',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'cpr',
  'personalNumber',
  'personal_number',
]);

/**
 * Redact a single string value
 */
export function redactString(str: string): string {
  let redacted = str;
  
  // Replace database connection strings FIRST (before email, which would break the pattern)
  redacted = redacted.replace(PATTERNS.dbConnection, '[DB_CONNECTION_STRING]');
  
  // Replace JWT tokens (before general API key pattern)
  redacted = redacted.replace(PATTERNS.jwt, '[JWT_TOKEN]');
  
  // Replace emails with [EMAIL]
  redacted = redacted.replace(PATTERNS.email, '[EMAIL]');
  
  // Replace Bearer tokens
  redacted = redacted.replace(PATTERNS.bearerToken, 'Bearer [TOKEN]');
  
  // Replace password fields in JSON/objects
  redacted = redacted.replace(PATTERNS.passwordField, '$1[REDACTED]$3');
  
  // Replace credit cards
  redacted = redacted.replace(PATTERNS.creditCard, '[CREDIT_CARD]');
  
  // Replace CPR numbers
  redacted = redacted.replace(PATTERNS.cpr, '[CPR]');
  
  // Replace auth codes in URLs
  redacted = redacted.replace(PATTERNS.authCode, '$1=[REDACTED]');
  
  // Replace long API keys (20+ chars of alphanumeric/dashes)
  // Only if not already redacted
  if (!redacted.includes('[REDACTED]') && !redacted.includes('[JWT_TOKEN]')) {
    redacted = redacted.replace(PATTERNS.apiKey, '[API_KEY]');
  }
  
  return redacted;
}

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_FIELDS.has(lower) || 
         lower.includes('password') || 
         lower.includes('secret') ||
         lower.includes('token') ||
         lower.includes('key');
}

/**
 * Redact sensitive fields in an object (recursive)
 */
export function redactObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item)) as T;
  }
  
  // Handle primitives
  if (typeof obj !== 'object') {
    // Redact strings
    if (typeof obj === 'string') {
      return redactString(obj) as T;
    }
    return obj;
  }
  
  // Handle objects
  const redacted: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if field name is sensitive
    if (isSensitiveField(key)) {
      redacted[key] = '[REDACTED]';
      continue;
    }
    
    // Recursively redact nested objects
    if (typeof value === 'object' && value !== null) {
      redacted[key] = redactObject(value);
    } else if (typeof value === 'string') {
      redacted[key] = redactString(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted as T;
}

/**
 * Redact any value (string, object, array, etc.)
 */
export function redact<T>(value: T): T {
  if (typeof value === 'string') {
    return redactString(value) as T;
  }
  
  if (typeof value === 'object' && value !== null) {
    return redactObject(value);
  }
  
  return value;
}

/**
 * Create a redacting serializer for pino logger
 * This intercepts log data before it's written
 */
export function createRedactingSerializer() {
  return {
    // Redact error objects
    err: (err: Error | Record<string, unknown>) => {
      if (err instanceof Error) {
        return {
          type: err.name,
          message: redactString(err.message),
          stack: err.stack ? redactString(err.stack) : undefined,
        };
      }
      return redactObject(err);
    },
    
    // Redact request objects
    req: (req: Record<string, unknown>) => {
      return {
        ...redactObject(req),
        // Explicitly redact headers that might contain tokens
        headers: req.headers ? redactObject(req.headers) : undefined,
      };
    },
    
    // Redact response objects
    res: (res: Record<string, unknown>) => {
      return redactObject(res);
    },
  };
}

/**
 * Redact environment variables for logging
 * Returns a safe subset of env vars
 */
export function redactEnv(env: Record<string, string | undefined>): Record<string, string> {
  const safe: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    
    // Completely hide sensitive env vars
    if (isSensitiveField(key)) {
      safe[key] = '[REDACTED]';
      continue;
    }
    
    // Show non-sensitive vars but still redact patterns
    safe[key] = redactString(value);
  }
  
  return safe;
}
