/**
 * Database Handler for UTCP Tools
 * 
 * Executes database operations via UTCP
 */

import { eq, and } from "drizzle-orm";

import { leads } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { getUserLeads, createLead } from "../../lead-db";
import type { UTCPTool, UTCPDatabaseHandler, UTCPToolResult } from "../types";
import { interpolateTemplateObject } from "../utils/template";


/**
 * Execute database handler
 */
export async function executeDatabaseHandler(
  tool: UTCPTool,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  const handler = tool.handler as UTCPDatabaseHandler;

  try {
    switch (handler.operation) {
      case "query":
        return await executeDatabaseQuery(handler, args, userId, correlationId);
      case "insert":
        return await executeDatabaseInsert(handler, args, userId, correlationId);
      case "update":
        return await executeDatabaseUpdate(handler, args, userId, correlationId);
      case "delete":
        return await executeDatabaseDelete(handler, args, userId, correlationId);
      default:
        return {
          success: false,
          error: `Unsupported database operation: ${handler.operation}`,
          code: "INTERNAL_ERROR",
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database operation failed",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Execute database query
 */
async function executeDatabaseQuery(
  handler: UTCPDatabaseHandler,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  try {
    // Special handling for leads table - use existing function
    if (handler.table === "leads") {
      const leads = await getUserLeads(userId, {
        status: args.status,
        source: args.source,
        limit: handler.limit,
      });

      return {
        success: true,
        data: leads,
      };
    }

    // Generic query for other tables
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        error: "Database not available",
        code: "INTERNAL_ERROR",
      };
    }

    // Build where conditions
    const whereConditions: any[] = [];
    if (handler.where) {
      const interpolatedWhere = interpolateTemplateObject(handler.where, args);
      for (const [key, value] of Object.entries(interpolatedWhere)) {
        if (value !== undefined && value !== null) {
          // This is simplified - would need proper schema mapping
          whereConditions.push(eq((handler.table as any)[key], value));
        }
      }
    }

    // Execute query (simplified - would need proper table mapping)
    return {
      success: false,
      error: `Generic database queries not yet implemented for table: ${handler.table}`,
      code: "INTERNAL_ERROR",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database query failed",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Execute database insert
 */
async function executeDatabaseInsert(
  handler: UTCPDatabaseHandler,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  try {
    // Special handling for leads table - use existing function
    if (handler.table === "leads") {
      if (!handler.values) {
        return {
          success: false,
          error: "Insert operation requires values",
          code: "VALIDATION_ERROR",
        };
      }

      const interpolatedValues = interpolateTemplateObject(handler.values, {
        ...args,
        now: new Date().toISOString(),
      });

      // Add userId to values
      const leadData = {
        ...interpolatedValues,
        userId,
        status: interpolatedValues.status || "new",
        createdAt: new Date(),
      };

      const newLead = await createLead(leadData);

      return {
        success: true,
        data: newLead,
      };
    }

    // Generic insert for other tables
    return {
      success: false,
      error: `Generic database inserts not yet implemented for table: ${handler.table}`,
      code: "INTERNAL_ERROR",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database insert failed",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Execute database update
 */
async function executeDatabaseUpdate(
  handler: UTCPDatabaseHandler,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  // Not implemented in prototype
  return {
    success: false,
    error: "Database update operation not yet implemented",
    code: "INTERNAL_ERROR",
  };
}

/**
 * Execute database delete
 */
async function executeDatabaseDelete(
  handler: UTCPDatabaseHandler,
  args: Record<string, any>,
  userId: number,
  correlationId?: string
): Promise<UTCPToolResult> {
  // Not implemented in prototype
  return {
    success: false,
    error: "Database delete operation not yet implemented",
    code: "INTERNAL_ERROR",
  };
}

