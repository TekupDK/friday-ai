/**
 * UTCP Manifest - Tool Definitions
 *
 * Follows UTCP specification for tool definitions
 * Phase 1 Prototype: 3 tools (search_gmail, list_leads, create_lead)
 */

import type { UTCPTool } from "./types";

/**
 * UTCP Tool Manifest
 *
 * Defines all available tools with their schemas and handlers
 * Phase 1: Prototype with 3 tools for validation
 */
export const UTCP_MANIFEST: Record<string, UTCPTool> = {
  // ============= Gmail Tools =============

  search_gmail: {
    name: "search_gmail",
    description:
      "Søg i Gmail efter emails baseret på søgekriterier. Brug dette til at finde leads, kunde emails, eller tidligere kommunikation.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Gmail søgequery. VIGTIG: after: operatoren betyder 'efter denne dato ER SLUT', så after:YYYY-MM-DD viser kun emails fra næste dag.",
          minLength: 1,
          maxLength: 500,
        },
        maxResults: {
          type: "number",
          description: "Maksimalt antal resultater at returnere (standard: 20)",
          minimum: 1,
          maximum: 100,
          default: 20,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    handler: {
      type: "http",
      method: "GET",
      endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      auth: {
        type: "oauth2",
        provider: "google",
        scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
      },
      queryParams: {
        q: "{{query}}",
        maxResults: "{{maxResults}}",
      },
    },
    requiresApproval: false,
    requiresAuth: true,
    cacheable: true,
    cacheTTL: 300, // 5 minutes
  },

  // ============= Database Tools =============

  list_leads: {
    name: "list_leads",
    description:
      "Hent liste over leads. Brug dette til at se nye leads eller søge efter specifikke leads.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["new", "contacted", "qualified", "proposal", "won", "lost"],
          description: "Filter på status",
        },
        source: {
          type: "string",
          enum: [
            "rengoring_nu",
            "rengoring_aarhus",
            "adhelp",
            "website",
            "referral",
          ],
          description: "Filter på kilde",
        },
      },
      additionalProperties: false,
    },
    handler: {
      type: "database",
      operation: "query",
      table: "leads",
      where: {
        status: "{{status}}",
        source: "{{source}}",
      },
    },
    requiresApproval: false,
    requiresAuth: true,
    cacheable: true,
    cacheTTL: 60, // 1 minute
  },

  create_lead: {
    name: "create_lead",
    description:
      "Opret nyt lead fra email eller anden kilde. Brug dette når du finder et nyt lead i Gmail.",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          enum: [
            "rengoring_nu",
            "rengoring_aarhus",
            "adhelp",
            "website",
            "referral",
          ],
          description: "Lead kilde",
        },
        name: {
          type: "string",
          description: "Kundens navn",
          minLength: 1,
          maxLength: 255,
        },
        email: {
          type: "string",
          description: "Kundens email",
          format: "email",
        },
        phone: {
          type: "string",
          description: "Kundens telefon",
        },
        notes: {
          type: "string",
          description: "Noter om leadet",
        },
        score: {
          type: "number",
          description: "Lead score 0-100",
          minimum: 0,
          maximum: 100,
        },
      },
      required: ["source", "name"],
      additionalProperties: false,
    },
    handler: {
      type: "database",
      operation: "insert",
      table: "leads",
      values: {
        source: "{{source}}",
        name: "{{name}}",
        email: "{{email}}",
        phone: "{{phone}}",
        notes: "{{notes}}",
        score: "{{score}}",
        status: "new",
      },
    },
    requiresApproval: false,
    requiresAuth: true,
    cacheable: false,
  },
};

/**
 * Get UTCP tool by name
 */
export function getUTCPTool(toolName: string): UTCPTool | undefined {
  return UTCP_MANIFEST[toolName];
}

/**
 * Get all UTCP tools
 */
export function getAllUTCPTools(): UTCPTool[] {
  return Object.values(UTCP_MANIFEST);
}

/**
 * Check if tool exists in manifest
 */
export function hasUTCPTool(toolName: string): boolean {
  return toolName in UTCP_MANIFEST;
}
