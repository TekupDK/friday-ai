/**
 * Friday AI Tool Handlers
 * Implements the actual execution logic for each tool
 */

import { z } from "zod";

import { createInvoice, getInvoices, searchCustomerByEmail } from '../billing/billy';
import { createTask, getUserTasks, trackEvent } from "../../db";
import { ToolName } from "./friday-tools";
import { createLead, getUserLeads, updateLeadStatus } from '../crm/lead-db';
import {
  createCalendarEvent,
  createGmailDraft,
  findFreeTimeSlots,
  getGmailThread,
  listCalendarEvents,
  searchGmail,
} from "../../mcp";

export interface ToolCallResult {
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
}

type ToolRegistryEntry = {
  schema: z.ZodTypeAny;
  requiresApproval: boolean;
  requiresUser?: boolean;
  handler: (args: any, userId: number, correlationId?: string) => Promise<ToolCallResult>;
};

const TOOL_REGISTRY: Record<ToolName, ToolRegistryEntry> = {
  // Gmail
  search_gmail: {
    schema: z.object({
      query: z.string().min(1),
      maxResults: z.number().int().positive().max(100).optional(),
    }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleSearchGmail(args, correlationId),
  },
  get_gmail_thread: {
    schema: z.object({ threadId: z.string().min(1) }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleGetGmailThread(args, correlationId),
  },
  create_gmail_draft: {
    schema: z.object({
      to: z.string().min(1),
      subject: z.string().min(1),
      body: z.string().min(1),
      cc: z.string().optional(),
      bcc: z.string().optional(),
    }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => {
      return handleCreateGmailDraft(args, correlationId);
    },
  },

  // Billy
  list_billy_invoices: {
    schema: z.object({}).strict(),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => {
      return handleListBillyInvoices(correlationId);
    },
  },
  search_billy_customer: {
    schema: z.object({ email: z.string().email() }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleSearchBillyCustomer(args, correlationId),
  },
  create_billy_invoice: {
    schema: z.object({
      contactId: z.string().min(1),
      entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentTermsDays: z.number().int().min(0).max(60).optional(),
      lines: z
        .array(
          z.object({
            description: z.string().min(1),
            quantity: z.number().positive(),
            unitPrice: z.number().nonnegative(),
            productId: z.string().optional(),
          })
        )
        .min(1),
    }),
    requiresApproval: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleCreateBillyInvoice(args, correlationId),
  },

  // Calendar
  list_calendar_events: {
    schema: z
      .object({
        timeMin: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
          )
          .optional(),
        timeMax: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
          )
          .optional(),
        maxResults: z.number().int().positive().optional(),
      })
      .strict(),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleListCalendarEvents(args, correlationId),
  },
  find_free_calendar_slots: {
    schema: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      duration: z.number().positive(),
      workingHours: z
        .object({
          start: z.number().min(0).max(23),
          end: z.number().min(0).max(23),
        })
        .optional(),
    }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleFindFreeCalendarSlots(args, correlationId),
  },
  create_calendar_event: {
    schema: z.object({
      summary: z.string().min(1),
      description: z.string().optional(),
      start: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        ),
      end: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        ),
      location: z.string().optional(),
    }),
    requiresApproval: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleCreateCalendarEvent(args, correlationId),
  },
  search_customer_calendar_history: {
    schema: z.object({
      customerName: z.string().min(1),
      customerEmail: z.string().optional(),
      monthsBack: z.number().int().min(1).max(24).optional(),
    }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleSearchCustomerCalendarHistory(args, correlationId),
  },
  update_calendar_event: {
    schema: z.object({
      eventId: z.string().min(1),
      summary: z.string().optional(),
      description: z.string().optional(),
      start: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        )
        .optional(),
      end: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        )
        .optional(),
      location: z.string().optional(),
    }),
    requiresApproval: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleUpdateCalendarEvent(args, correlationId),
  },
  delete_calendar_event: {
    schema: z.object({
      eventId: z.string().min(1),
      reason: z.string().optional(),
    }),
    requiresApproval: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleDeleteCalendarEvent(args, correlationId),
  },
  check_calendar_conflicts: {
    schema: z.object({
      start: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        ),
      end: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/
        ),
      ignoreEventId: z.string().optional(),
    }),
    requiresApproval: false,
    handler: async (args: any, userId: number, correlationId?: string) => handleCheckCalendarConflicts(args, correlationId),
  },

  // Leads
  list_leads: {
    schema: z
      .object({
        status: z
          .enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
          .optional(),
        source: z.string().optional(),
      })
      .strict(),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      return handleListLeads(userId, args, correlationId);
    },
  },
  create_lead: {
    schema: z.object({
      source: z.string().min(1),
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      notes: z.string().optional(),
      score: z.number().int().min(0).max(100).optional(),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      return handleCreateLead(userId, args, correlationId);
    },
  },
  update_lead_status: {
    schema: z.object({
      leadId: z.number().int().positive(),
      status: z.enum([
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
      ]),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleUpdateLeadStatus(args, correlationId),
  },

  // Tasks
  list_tasks: {
    schema: z
      .object({
        status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
      })
      .strict(),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => handleListTasks(userId, args, correlationId),
  },
  create_task: {
    schema: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      return handleCreateTask(userId, args, correlationId);
    },
  },
  recommend_subscription_plan: {
    schema: z.object({
      customerId: z.number().int().positive(),
      includeReasoning: z.boolean().optional().default(true),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      // Handled in ai-router.ts custom handlers
      return {
        success: false,
        error: "This tool is handled by AI router custom handlers",
        code: "INTERNAL_ERROR" as const,
      };
    },
  },
  predict_churn_risk: {
    schema: z.object({
      customerId: z.number().int().positive(),
      lookbackDays: z.number().int().min(1).max(365).optional().default(90),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      // Handled in ai-router.ts custom handlers
      return {
        success: false,
        error: "This tool is handled by AI router custom handlers",
        code: "INTERNAL_ERROR" as const,
      };
    },
  },
  optimize_subscription_usage: {
    schema: z.object({
      subscriptionId: z.number().int().positive(),
      optimizeFor: z.enum(["value", "convenience", "efficiency"]).optional().default("value"),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      // Handled in ai-router.ts custom handlers
      return {
        success: false,
        error: "This tool is handled by AI router custom handlers",
        code: "INTERNAL_ERROR" as const,
      };
    },
  },
  generate_upsell_opportunities: {
    schema: z.object({
      customerId: z.number().int().positive(),
      includeCrossSell: z.boolean().optional().default(true),
    }),
    requiresApproval: false,
    requiresUser: true,
    handler: async (args: any, userId: number, correlationId?: string) => {
      // Handled in ai-router.ts custom handlers
      return {
        success: false,
        error: "This tool is handled by AI router custom handlers",
        code: "INTERNAL_ERROR" as const,
      };
    },
  },
};

async function callWithRetry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; timeoutMs?: number; backoffMs?: number }
): Promise<T> {
  const retries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 10000;
  const backoffMs = options?.backoffMs ?? 250;
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      const p = fn();
      const result = await Promise.race([
        p,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        ),
      ]);
      return result as T;
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
      attempt += 1;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Execute a tool call with the given arguments
 * 
 * This is the main entry point for executing Friday AI tools. It validates
 * the tool name and arguments, checks permissions, and calls the appropriate
 * handler function.
 * 
 * @param toolName - Name of the tool to execute (must be in TOOL_REGISTRY)
 * @param args - Arguments for the tool (validated against tool schema)
 * @param userId - User ID for authentication and ownership checks
 * @param options - Optional configuration including correlationId for request tracing
 * @returns ToolCallResult with success status, data, or error information
 * 
 * @example
 * ```typescript
 * const result = await executeToolCall(
 *   "search_gmail",
 *   { query: "from:customer@example.com" },
 *   userId,
 *   { correlationId: "action_1234567890_abc12345" }
 * );
 * 
 * if (result.success) {
 *   console.log("Found emails:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function executeToolCall(
  toolName: ToolName,
  args: Record<string, any>,
  userId: number,
  options?: { correlationId?: string }
): Promise<ToolCallResult> {
  const start = Date.now();
  const correlationId = options?.correlationId;

  console.log("[DEBUG] [Tool] [executeToolCall]: Entry", {
    toolName,
    userId,
    hasArgs: !!args,
    argKeys: args ? Object.keys(args) : [],
    correlationId,
  });

  if (!toolName) {
    console.warn("[WARN] [Tool] [executeToolCall]: Tool name missing", {
      correlationId,
    });
    return {
      success: false,
      error: "Tool name is required",
      code: "VALIDATION_ERROR",
    };
  }
  if (!args || typeof args !== "object") {
    console.warn("[WARN] [Tool] [executeToolCall]: Invalid arguments", {
      toolName,
      correlationId,
    });
    return {
      success: false,
      error: "Invalid arguments object",
      code: "VALIDATION_ERROR",
    };
  }

  const entry = TOOL_REGISTRY[toolName];
  if (!entry) {
    console.warn("[WARN] [Tool] [executeToolCall]: Unknown tool", {
      toolName,
      correlationId,
    });
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      code: "UNKNOWN_TOOL",
    };
  }

  console.log("[DEBUG] [Tool] [executeToolCall]: Tool registry entry found", {
    toolName,
    requiresApproval: entry.requiresApproval,
    requiresUser: entry.requiresUser,
    correlationId,
  });

  if (entry.requiresUser && !userId) {
    console.warn("[WARN] [Tool] [executeToolCall]: User authentication required", {
      toolName,
      correlationId,
    });
    return {
      success: false,
      error: "User authentication required",
      code: "AUTH_ERROR",
    };
  }

  console.log("[DEBUG] [Tool] [executeToolCall]: Validating arguments", {
    toolName,
    correlationId,
  });
  const parsed = entry.schema.safeParse(args);
  if (!parsed.success) {
    console.warn("[WARN] [Tool] [executeToolCall]: Validation failed", {
      toolName,
      error: parsed.error.message,
      correlationId,
    });
    return {
      success: false,
      error: parsed.error.message,
      code: "VALIDATION_ERROR",
    };
  }

  if (entry.requiresApproval && (args as any).__approved !== true) {
    console.log("[DEBUG] [Tool] [executeToolCall]: Approval required", {
      toolName,
      correlationId,
    });
    return {
      success: false,
      error: "Approval required for this action",
      code: "APPROVAL_REQUIRED",
    };
  }

  console.log("[DEBUG] [Tool] [executeToolCall]: Executing handler", {
    toolName,
    userId,
    correlationId,
  });

  try {
    const result = await entry.handler(parsed.data, userId, correlationId);
    const duration = Date.now() - start;
    console.log("[INFO] [Tool] [executeToolCall]: Handler completed", {
      toolName,
      userId,
      success: result.success,
      code: result.code,
      duration,
      hasData: !!result.data,
      correlationId,
    });
    await trackEvent({
      userId,
      eventType: "tool_call",
      eventData: {
        toolName,
        requiresApproval: entry.requiresApproval,
        approved: (args as any)?.__approved === true,
        success: result.success,
        code: result.code ?? null,
        durationMs: duration,
        correlationId: options?.correlationId || null,
      },
    });
    console.log("[DEBUG] [Tool] [executeToolCall]: Complete", {
      toolName,
      duration,
      correlationId,
    });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error("[ERROR] [Tool] [executeToolCall]: Handler failed", {
      toolName,
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      correlationId,
    });
    await trackEvent({
      userId,
      eventType: "tool_call",
      eventData: {
        toolName,
        requiresApproval: entry.requiresApproval,
        approved: (args as any)?.__approved === true,
        success: false,
        code: "INTERNAL_ERROR",
        durationMs: duration,
        error: error instanceof Error ? error.message : String(error),
        correlationId: options?.correlationId || null,
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}

// Gmail Tool Handlers
async function handleSearchGmail(
  args: {
    query: string;
    maxResults?: number;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleSearchGmail]: Entry", {
    query: args.query,
    maxResults: args.maxResults,
    correlationId,
  });
  try {
    const results = await callWithRetry(() =>
      searchGmail(args.query, args.maxResults)
    );
    console.log("[INFO] [Tool] [handleSearchGmail]: Success", {
      resultCount: results.length,
      query: args.query,
      correlationId,
    });
    return { success: true, data: results };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleSearchGmail]: Failed", {
      query: args.query,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleGetGmailThread(
  args: {
    threadId: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleGetGmailThread]: Entry", {
    threadId: args.threadId,
    correlationId,
  });
  try {
    const thread = await callWithRetry(() => getGmailThread(args.threadId));
    console.log("[INFO] [Tool] [handleGetGmailThread]: Success", {
      threadId: args.threadId,
      correlationId,
    });
    return { success: true, data: thread };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleGetGmailThread]: Failed", {
      threadId: args.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateGmailDraft(
  args: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCreateGmailDraft]: Entry", {
    to: args.to,
    subject: args.subject,
    correlationId,
  });
  try {
    const draft = await callWithRetry(() => createGmailDraft(args));
    console.log("[INFO] [Tool] [handleCreateGmailDraft]: Success", {
      draftId: draft.draftId,
      to: args.to,
      correlationId,
    });
    return { success: true, data: draft };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCreateGmailDraft]: Failed", {
      to: args.to,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

// Billy Tool Handlers
async function handleListBillyInvoices(correlationId?: string): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleListBillyInvoices]: Entry", {
    correlationId,
  });
  try {
    const invoices = await callWithRetry(() => getInvoices());
    console.log("[INFO] [Tool] [handleListBillyInvoices]: Success", {
      invoiceCount: invoices.length,
      correlationId,
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleListBillyInvoices]: Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleSearchBillyCustomer(
  args: {
    email: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleSearchBillyCustomer]: Entry", {
    email: args.email,
    correlationId,
  });
  try {
    const customer = await callWithRetry(() =>
      searchCustomerByEmail(args.email)
    );
    console.log("[INFO] [Tool] [handleSearchBillyCustomer]: Success", {
      email: args.email,
      found: !!customer,
      correlationId,
    });
    return { success: true, data: customer };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleSearchBillyCustomer]: Failed", {
      email: args.email,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateBillyInvoice(
  args: {
    contactId: string;
    entryDate: string;
    paymentTermsDays?: number;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      productId?: string;
    }>;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCreateBillyInvoice]: Entry", {
    contactId: args.contactId,
    entryDate: args.entryDate,
    lineCount: args.lines.length,
    totalAmount: args.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    correlationId,
  });
  try {
    const invoice = await callWithRetry(() => createInvoice(args, { correlationId }));
    console.log("[INFO] [Tool] [handleCreateBillyInvoice]: Success", {
      invoiceId: invoice.id,
      contactId: args.contactId,
      correlationId,
    });
    return { success: true, data: invoice };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCreateBillyInvoice]: Failed", {
      contactId: args.contactId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

// Calendar Tool Handlers
async function handleListCalendarEvents(
  args: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleListCalendarEvents]: Entry", {
    timeMin: args.timeMin,
    timeMax: args.timeMax,
    maxResults: args.maxResults,
    correlationId,
  });
  try {
    const events = await callWithRetry(() => listCalendarEvents(args));
    console.log("[INFO] [Tool] [handleListCalendarEvents]: Success", {
      eventCount: events.length,
      correlationId,
    });
    return { success: true, data: events };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleListCalendarEvents]: Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleFindFreeCalendarSlots(
  args: {
    date: string;
    duration: number;
    workingHours?: { start: number; end: number };
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleFindFreeCalendarSlots]: Entry", {
    date: args.date,
    duration: args.duration,
    correlationId,
  });
  try {
    const slots = await callWithRetry(() => findFreeTimeSlots(args));
    console.log("[INFO] [Tool] [handleFindFreeCalendarSlots]: Success", {
      slotCount: slots.length,
      correlationId,
    });
    return { success: true, data: slots };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleFindFreeCalendarSlots]: Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateCalendarEvent(
  args: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    location?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCreateCalendarEvent]: Entry", {
    summary: args.summary,
    start: args.start,
    end: args.end,
    location: args.location,
    correlationId,
  });
  try {
    const event = await callWithRetry(() => createCalendarEvent(args));
    console.log("[INFO] [Tool] [handleCreateCalendarEvent]: Success", {
      eventId: event.id,
      summary: args.summary,
      correlationId,
    });
    return { success: true, data: event };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCreateCalendarEvent]: Failed", {
      summary: args.summary,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleSearchCustomerCalendarHistory(
  args: {
    customerName: string;
    customerEmail?: string;
    monthsBack?: number;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleSearchCustomerCalendarHistory]: Entry", {
    customerName: args.customerName,
    customerEmail: args.customerEmail,
    monthsBack: args.monthsBack,
    correlationId,
  });
  const { listCalendarEvents: listGoogleCalendarEvents } = await import(
    "../../google-api"
  );

  const monthsBack = args.monthsBack || 6;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // Include future events too

  try {
    const allEvents = await callWithRetry(() =>
      listGoogleCalendarEvents({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: 500,
      })
    );

    // Filter events matching customer
    const customerNameLower = args.customerName.toLowerCase();
    const customerEmailLower = args.customerEmail?.toLowerCase() || "";

    const matchedEvents = allEvents.filter((event: any) => {
      const summary = (event.summary || "").toLowerCase();
      const description = (event.description || "").toLowerCase();
      const location = (event.location || "").toLowerCase();

      // Get customer name from summary (format: "Type - Customer - Details")
      const summaryParts = event.summary?.split("-") || [];
      const eventCustomerName =
        summaryParts.length > 1 ? summaryParts[1].trim().toLowerCase() : "";

      return (
        (eventCustomerName && eventCustomerName.includes(customerNameLower)) ||
        (customerNameLower && description.includes(customerNameLower)) ||
        (customerEmailLower && description.includes(customerEmailLower)) ||
        (customerNameLower && location.includes(customerNameLower))
      );
    });

    // Sort by date (newest first)
    matchedEvents.sort((a: any, b: any) => {
      const aTime = a.start?.dateTime || a.start?.date || "";
      const bTime = b.start?.dateTime || b.start?.date || "";
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    console.log("[INFO] [Tool] [handleSearchCustomerCalendarHistory]: Success", {
      customerName: args.customerName,
      totalEvents: matchedEvents.length,
      correlationId,
    });

    return {
      success: true,
      data: {
        customerName: args.customerName,
        totalEvents: matchedEvents.length,
        events: matchedEvents.map((event: any) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          status: event.status,
        })),
      },
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleSearchCustomerCalendarHistory]: Failed", {
      customerName: args.customerName,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: `Kunne ikke hente historik: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleUpdateCalendarEvent(
  args: {
    eventId: string;
    summary?: string;
    description?: string;
    start?: string;
    end?: string;
    location?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleUpdateCalendarEvent]: Entry", {
    eventId: args.eventId,
    correlationId,
  });
  try {
    const { updateCalendarEvent: updateGoogleEvent } = await import(
      "../../google-api"
    );

    const updatedEvent = await callWithRetry(() =>
      updateGoogleEvent({
        eventId: args.eventId,
        summary: args.summary,
        description: args.description,
        start: args.start,
        end: args.end,
        location: args.location,
      })
    );

    console.log("[INFO] [Tool] [handleUpdateCalendarEvent]: Success", {
      eventId: args.eventId,
      correlationId,
    });

    return {
      success: true,
      data: {
        message: "Event opdateret succesfuldt",
        event: updatedEvent,
      },
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleUpdateCalendarEvent]: Failed", {
      eventId: args.eventId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: `Kunne ikke opdatere event: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleDeleteCalendarEvent(
  args: {
    eventId: string;
    reason?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleDeleteCalendarEvent]: Entry", {
    eventId: args.eventId,
    reason: args.reason,
    correlationId,
  });
  try {
    const { deleteCalendarEvent: deleteGoogleEvent } = await import(
      "../../google-api"
    );

    await callWithRetry(() =>
      deleteGoogleEvent({
        eventId: args.eventId,
      })
    );

    console.log("[INFO] [Tool] [handleDeleteCalendarEvent]: Success", {
      eventId: args.eventId,
      correlationId,
    });

    return {
      success: true,
      data: {
        message: `Event slettet succesfuldt${args.reason ? ` (grund: ${args.reason})` : ""}`,
        eventId: args.eventId,
      },
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleDeleteCalendarEvent]: Failed", {
      eventId: args.eventId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: `Kunne ikke slette event: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleCheckCalendarConflicts(
  args: {
    start: string;
    end: string;
    ignoreEventId?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCheckCalendarConflicts]: Entry", {
    start: args.start,
    end: args.end,
    ignoreEventId: args.ignoreEventId,
    correlationId,
  });
  try {
    const { listCalendarEvents: listGoogleCalendarEvents } = await import(
      "../../google-api"
    );

    // Fetch events in the time range
    const events = await callWithRetry(() =>
      listGoogleCalendarEvents({
        timeMin: args.start,
        timeMax: args.end,
        maxResults: 100,
      })
    );

    // Filter for overlapping events
    const requestStart = new Date(args.start);
    const requestEnd = new Date(args.end);

    const conflicts = events.filter((event: any) => {
      // Skip if this is the event we're updating
      if (args.ignoreEventId && event.id === args.ignoreEventId) {
        return false;
      }

      const eventStart = new Date(event.start?.dateTime || event.start?.date);
      const eventEnd = new Date(event.end?.dateTime || event.end?.date);

      // Check for overlap: (StartA < EndB) AND (EndA > StartB)
      return requestStart < eventEnd && requestEnd > eventStart;
    });

    const hasConflicts = conflicts.length > 0;

    console.log("[INFO] [Tool] [handleCheckCalendarConflicts]: Success", {
      hasConflicts,
      conflictCount: conflicts.length,
      correlationId,
    });

    return {
      success: true,
      data: {
        hasConflicts,
        conflictCount: conflicts.length,
        conflicts: conflicts.map((event: any) => ({
          id: event.id,
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          description: event.description,
        })),
        message: hasConflicts
          ? `⚠️ ${conflicts.length} overlappende booking(s) fundet!`
          : "✅ Ingen konflikter - tiden er ledig",
      },
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCheckCalendarConflicts]: Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: `Kunne ikke tjekke konflikter: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

// Lead Tool Handlers
async function handleListLeads(
  userId: number,
  args: { status?: string; source?: string },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleListLeads]: Entry", {
    userId,
    status: args.status,
    source: args.source,
    correlationId,
  });
  try {
    const leads = await getUserLeads(userId, {
      status: args.status,
      source: args.source,
    });
    console.log("[INFO] [Tool] [handleListLeads]: Success", {
      userId,
      leadCount: leads.length,
      correlationId,
    });
    return { success: true, data: leads };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleListLeads]: Failed", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}

async function handleCreateLead(
  userId: number,
  args: {
    source: string;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    score?: number;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCreateLead]: Entry", {
    userId,
    name: args.name,
    source: args.source,
    hasEmail: !!args.email,
    hasPhone: !!args.phone,
    correlationId,
  });
  try {
    const lead = await createLead({
      userId,
      source: args.source,
      name: args.name,
      email: args.email || null,
      phone: args.phone || null,
      score: args.score || 0,
      status: "new",
      notes: args.notes || null,
    });

    console.log("[INFO] [Tool] [handleCreateLead]: Success", {
      leadId: lead.id,
      name: args.name,
      source: args.source,
      correlationId,
    });

    return {
      success: true,
      data: lead,
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCreateLead]: Failed", {
      userId,
      name: args.name,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}

async function handleUpdateLeadStatus(
  args: {
    leadId: number;
    status: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleUpdateLeadStatus]: Entry", {
    leadId: args.leadId,
    status: args.status,
    correlationId,
  });
  try {
    await updateLeadStatus(
      args.leadId,
      args.status as
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
    );
    console.log("[INFO] [Tool] [handleUpdateLeadStatus]: Success", {
      leadId: args.leadId,
      status: args.status,
      correlationId,
    });
    return {
      success: true,
      data: { leadId: args.leadId, status: args.status },
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleUpdateLeadStatus]: Failed", {
      leadId: args.leadId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}

// Task Tool Handlers
async function handleListTasks(
  userId: number,
  args: { status?: string },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleListTasks]: Entry", {
    userId,
    status: args.status,
    correlationId,
  });
  try {
    const tasks = await getUserTasks(userId);

    // Filter by status if provided
    let filteredTasks = tasks;
    if (args.status) {
      filteredTasks = filteredTasks.filter(task => task.status === args.status);
    }

    console.log("[INFO] [Tool] [handleListTasks]: Success", {
      userId,
      taskCount: filteredTasks.length,
      correlationId,
    });

    return {
      success: true,
      data: filteredTasks,
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleListTasks]: Failed", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}

async function handleCreateTask(
  userId: number,
  args: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
  },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleCreateTask]: Entry", {
    userId,
    title: args.title,
    priority: args.priority,
    hasDueDate: !!args.dueDate,
    correlationId,
  });
  try {
    const priorityValues = ["low", "medium", "high", "urgent"] as const;
    const priority = priorityValues.includes((args.priority || "medium") as any)
      ? ((args.priority || "medium") as (typeof priorityValues)[number])
      : ("medium" as const);
    const dueDateIso = args.dueDate
      ? /\d{4}-\d{2}-\d{2}$/.test(args.dueDate)
        ? new Date(args.dueDate + "T00:00:00.000Z").toISOString()
        : new Date(args.dueDate).toISOString()
      : null;
    const task = await createTask({
      userId,
      title: args.title,
      description: args.description || null,
      dueDate: dueDateIso,
      status: "todo",
      priority,
    });

    console.log("[INFO] [Tool] [handleCreateTask]: Success", {
      taskId: task.id,
      title: args.title,
      correlationId,
    });

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    console.error("[ERROR] [Tool] [handleCreateTask]: Failed", {
      userId,
      title: args.title,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      correlationId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_ERROR",
    };
  }
}
