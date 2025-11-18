/**
 * HTTP Handler for UTCP Tools
 * 
 * Executes HTTP-based UTCP tools (Google APIs, Billy API, etc.)
 */

import { searchGmailThreads } from "../../google-api";
import type { UTCPTool, UTCPHTTPHandler, UTCPToolResult } from "../types";
import { interpolateTemplate, interpolateTemplateObject } from "../utils/template";

/**
 * Get authentication token for HTTP handler
 */
async function getAuthToken(
  auth: UTCPHTTPHandler["auth"],
  userId: number
): Promise<string> {
  if (!auth || auth.type === "none") {
    return "";
  }

  // For Google OAuth, we use service account with domain-wide delegation
  // This is already handled by google-api.ts getAuthClient()
  if (auth.type === "oauth2" && auth.provider === "google") {
    // Return empty - google-api.ts handles auth internally
    return "";
  }

  // For API keys, get from environment
  if (auth.type === "api_key" && auth.envVar) {
    return process.env[auth.envVar] || "";
  }

  return "";
}

/**
 * Execute HTTP handler
 */
export async function executeHTTPHandler(
  tool: UTCPTool,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  const handler = tool.handler as UTCPHTTPHandler;

  try {
    // Special handling for Google APIs - use existing functions
    if (handler.endpoint.includes("gmail.googleapis.com")) {
      return await handleGoogleGmailAPI(tool, handler, args, userId, correlationId);
    }

    // For other HTTP endpoints, use direct fetch
    // 1. Build URL with template interpolation
    const endpoint = interpolateTemplate(handler.endpoint, args);
    const url = new URL(endpoint);

    // 2. Add query parameters
    if (handler.queryParams) {
      for (const [key, value] of Object.entries(handler.queryParams)) {
        const interpolated = interpolateTemplate(value, args);
        if (interpolated && interpolated !== `{{${key}}}`) {
          url.searchParams.append(key, interpolated);
        }
      }
    }

    // 3. Get authentication token
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...handler.headers,
    };

    if (handler.auth) {
      const token = await getAuthToken(handler.auth, userId);
      if (handler.auth.type === "oauth2" && token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (handler.auth.type === "api_key" && handler.auth.header && token) {
        headers[handler.auth.header] = token;
      }
    }

    // 4. Build request body
    let body: string | undefined;
    if (handler.body && (handler.method === "POST" || handler.method === "PUT" || handler.method === "PATCH")) {
      if (typeof handler.body === "string") {
        body = interpolateTemplate(handler.body, args);
      } else {
        body = JSON.stringify(interpolateTemplateObject(handler.body, args));
      }
    }

    // 5. Execute HTTP request
    const response = await fetch(url.toString(), {
      method: handler.method,
      headers,
      body,
      signal: AbortSignal.timeout(handler.timeout || 30000),
    });

    // 6. Parse response
    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.error?.message || `HTTP ${response.status}`,
        code: "API_ERROR",
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "HTTP request failed",
      code: "API_ERROR",
    };
  }
}

/**
 * Handle Google Gmail API calls using existing functions
 */
async function handleGoogleGmailAPI(
  tool: UTCPTool,
  handler: UTCPHTTPHandler,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  try {
    if (tool.name === "search_gmail") {
      const results = await searchGmailThreads({
        query: args.query,
        maxResults: args.maxResults || 20,
      });

      return {
        success: true,
        data: results,
      };
    }

    // Fallback for other Gmail operations
    return {
      success: false,
      error: `Gmail operation ${tool.name} not yet implemented via UTCP`,
      code: "INTERNAL_ERROR",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gmail API request failed",
      code: "API_ERROR",
    };
  }
}

