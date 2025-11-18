/**
 * UTCP Type Definitions
 * 
 * TypeScript types for UTCP (Universal Tool Calling Protocol)
 * Follows UTCP specification: https://utcp.io/spec
 */

/**
 * UTCP Handler Configuration
 */
export type UTCPHandlerType = "http" | "cli" | "grpc" | "mcp" | "database";

export interface UTCPAuthConfig {
  type: "oauth2" | "api_key" | "bearer" | "none";
  provider?: "google" | "billy" | "custom";
  scopes?: string[];
  header?: string;
  envVar?: string;
}

export interface UTCPHTTPHandler {
  type: "http";
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  auth?: UTCPAuthConfig;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: Record<string, any> | string;
  timeout?: number;
  retries?: number;
}

export interface UTCPCLIHandler {
  type: "cli";
  command: string;
  args?: string[];
  env?: Record<string, string>;
  timeout?: number;
}

export interface UTCPDatabaseHandler {
  type: "database";
  operation: "query" | "insert" | "update" | "delete";
  table: string;
  where?: Record<string, any>;
  values?: Record<string, any>;
  limit?: number;
  orderBy?: string;
}

export type UTCPHandler = UTCPHTTPHandler | UTCPCLIHandler | UTCPDatabaseHandler;

/**
 * UTCP Tool Definition
 */
export interface UTCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
  handler: UTCPHandler;
  requiresApproval?: boolean;
  requiresAuth?: boolean;
  cacheable?: boolean;
  cacheTTL?: number; // seconds
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * UTCP Tool Execution Result
 */
export interface UTCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  code?:
    | "UNKNOWN_TOOL"
    | "VALIDATION_ERROR"
    | "APPROVAL_REQUIRED"
    | "RATE_LIMIT_EXCEEDED"
    | "AUTH_ERROR"
    | "API_ERROR"
    | "INTERNAL_ERROR";
  metadata?: {
    executionTimeMs: number;
    cached: boolean;
    correlationId?: string;
  };
}

