/**
 * UTCP Tool Execution Handler
 *
 * Main entry point for executing UTCP tools
 */

import { trackEvent } from "../db";

import { executeDatabaseHandler } from "./handlers/database-handler";
import { executeHTTPHandler } from "./handlers/http-handler";
import { getUTCPTool } from "./manifest";
import type { UTCPTool } from "./types";
import type { UTCPToolResult } from "./types";
import { validateUTCPInput } from "./validators";

/**
 * Cache management (in-memory, can be upgraded to Redis)
 */
const cache = new Map<string, { data: any; expires: number }>();

function getCachedResult(
  toolName: string,
  args: Record<string, any>,
  userId: number
): any | null {
  const key = `${toolName}:${userId}:${JSON.stringify(args)}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

function cacheResult(
  toolName: string,
  args: Record<string, any>,
  userId: number,
  data: any,
  ttl: number
): void {
  const key = `${toolName}:${userId}:${JSON.stringify(args)}`;
  cache.set(key, {
    data,
    expires: Date.now() + ttl * 1000,
  });
}

/**
 * Execute UTCP tool
 *
 * @param toolName - Name of tool to execute
 * @param args - Tool arguments
 * @param userId - User ID for authentication
 * @param options - Execution options
 * @returns Tool execution result
 */
export async function executeUTCPTool(
  toolName: string,
  args: Record<string, any>,
  userId: number,
  options?: {
    correlationId?: string;
    approved?: boolean;
    skipCache?: boolean;
  }
): Promise<UTCPToolResult> {
  const startTime = Date.now();
  const correlationId = options?.correlationId;

  // 1. Load tool from manifest
  const tool = getUTCPTool(toolName);
  if (!tool) {
    return {
      success: false,
      error: `Unknown UTCP tool: ${toolName}`,
      code: "UNKNOWN_TOOL",
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  }

  // 2. Check authentication
  if (tool.requiresAuth && !userId) {
    return {
      success: false,
      error: "User authentication required",
      code: "AUTH_ERROR",
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  }

  // 3. Check approval requirement
  if (tool.requiresApproval && !options?.approved) {
    return {
      success: false,
      error: "Approval required for this action",
      code: "APPROVAL_REQUIRED",
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  }

  // 4. Validate input schema
  const validation = validateUTCPInput(tool.inputSchema, args);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error || "Invalid input",
      code: "VALIDATION_ERROR",
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  }

  // 5. Check cache (if cacheable and not skipped)
  if (tool.cacheable && !options?.skipCache) {
    const cached = getCachedResult(toolName, args, userId);
    if (cached) {
      return {
        success: true,
        data: cached,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          cached: true,
          correlationId,
        },
      };
    }
  }

  // 6. Execute handler based on type
  let result: UTCPToolResult;
  try {
    switch (tool.handler.type) {
      case "http":
        result = await executeHTTPHandler(
          tool,
          validation.data!,
          userId,
          correlationId
        );
        break;
      case "database":
        result = await executeDatabaseHandler(
          tool,
          validation.data!,
          userId,
          correlationId
        );
        break;
      default:
        result = {
          success: false,
          error: `Unsupported handler type: ${(tool.handler as any).type}`,
          code: "INTERNAL_ERROR",
        };
    }

    // 7. Cache result if cacheable
    if (tool.cacheable && result.success && result.data) {
      cacheResult(toolName, args, userId, result.data, tool.cacheTTL || 300);
    }

    // 8. Track event
    await trackEvent({
      userId,
      eventType: "utcp_tool_call",
      eventData: {
        toolName,
        success: result.success,
        code: result.code,
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    });

    return {
      ...result,
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "INTERNAL_ERROR",
      metadata: {
        executionTimeMs: Date.now() - startTime,
        cached: false,
        correlationId,
      },
    };
  }
}
