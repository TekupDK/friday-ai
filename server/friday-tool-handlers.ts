/**
 * Friday AI Tool Handlers
 * Implements the actual execution logic for each tool
 */

import { createInvoice, getInvoices, searchCustomerByEmail } from "./billy";
import {
  createLead,
  createTask,
  getUserLeads,
  getUserTasks,
  updateLeadStatus,
  trackEvent,
} from "./db";
import { ToolName } from "./friday-tools";
import {
  createCalendarEvent,
  createGmailDraft,
  findFreeTimeSlots,
  getGmailThread,
  listCalendarEvents,
  searchGmail,
} from "./mcp";
import { z } from "zod";

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
  handler: (args: any, userId: number) => Promise<ToolCallResult>;
};

const TOOL_REGISTRY: Record<ToolName, ToolRegistryEntry> = {
  // Gmail
  search_gmail: {
    schema: z.object({
      query: z.string().min(1),
      maxResults: z.number().int().positive().max(100).optional(),
    }),
    requiresApproval: false,
    handler: async (args: any) => handleSearchGmail(args),
  },
  get_gmail_thread: {
    schema: z.object({ threadId: z.string().min(1) }),
    requiresApproval: false,
    handler: async (args: any) => handleGetGmailThread(args),
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
    handler: async (args: any) => handleCreateGmailDraft(args),
  },

  // Billy
  list_billy_invoices: {
    schema: z.object({}).strict(),
    requiresApproval: false,
    handler: async () => handleListBillyInvoices(),
  },
  search_billy_customer: {
    schema: z.object({ email: z.string().email() }),
    requiresApproval: false,
    handler: async (args: any) => handleSearchBillyCustomer(args),
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
    handler: async (args: any) => handleCreateBillyInvoice(args),
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
    handler: async (args: any) => handleListCalendarEvents(args),
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
    handler: async (args: any) => handleFindFreeCalendarSlots(args),
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
    handler: async (args: any) => handleCreateCalendarEvent(args),
  },
  search_customer_calendar_history: {
    schema: z.object({
      customerName: z.string().min(1),
      customerEmail: z.string().optional(),
      monthsBack: z.number().int().min(1).max(24).optional(),
    }),
    requiresApproval: false,
    handler: async (args: any) => handleSearchCustomerCalendarHistory(args),
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
    handler: async (args: any) => handleUpdateCalendarEvent(args),
  },
  delete_calendar_event: {
    schema: z.object({
      eventId: z.string().min(1),
      reason: z.string().optional(),
    }),
    requiresApproval: true,
    handler: async (args: any) => handleDeleteCalendarEvent(args),
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
    handler: async (args: any) => handleCheckCalendarConflicts(args),
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
    handler: async (args: any, userId: number) => handleListLeads(userId, args),
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
    handler: async (args: any, userId: number) =>
      handleCreateLead(userId, args),
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
    handler: async (args: any) => handleUpdateLeadStatus(args),
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
    handler: async (args: any, userId: number) => handleListTasks(userId, args),
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
    handler: async (args: any, userId: number) =>
      handleCreateTask(userId, args),
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
 */
export async function executeToolCall(
  toolName: ToolName,
  args: Record<string, any>,
  userId: number,
  options?: { correlationId?: string }
): Promise<ToolCallResult> {
  const start = Date.now();
  const logPrefix = options?.correlationId
    ? `[Tool][${options.correlationId}]`
    : `[Tool]`;
  if (!toolName) {
    return {
      success: false,
      error: "Tool name is required",
      code: "VALIDATION_ERROR",
    };
  }
  if (!args || typeof args !== "object") {
    return {
      success: false,
      error: "Invalid arguments object",
      code: "VALIDATION_ERROR",
    };
  }

  const entry = TOOL_REGISTRY[toolName];
  if (!entry) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      code: "UNKNOWN_TOOL",
    };
  }

  if (entry.requiresUser && !userId) {
    return {
      success: false,
      error: "User authentication required",
      code: "AUTH_ERROR",
    };
  }

  const parsed = entry.schema.safeParse(args);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message,
      code: "VALIDATION_ERROR",
    };
  }

  if (entry.requiresApproval && (args as any).__approved !== true) {
    return {
      success: false,
      error: "Approval required for this action",
      code: "APPROVAL_REQUIRED",
    };
  }

  try {
    const result = await entry.handler(parsed.data, userId);
    const duration = Date.now() - start;
    console.log(
      `${logPrefix} ${toolName} by user ${userId} -> ${result.success ? "OK" : "ERR"} in ${duration}ms${result.code ? ` [${result.code}]` : ""}`
    );
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
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `${logPrefix} ${toolName} by user ${userId} failed in ${duration}ms:`,
      error
    );
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
async function handleSearchGmail(args: {
  query: string;
  maxResults?: number;
}): Promise<ToolCallResult> {
  try {
    const results = await callWithRetry(() =>
      searchGmail(args.query, args.maxResults)
    );
    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleGetGmailThread(args: {
  threadId: string;
}): Promise<ToolCallResult> {
  try {
    const thread = await callWithRetry(() => getGmailThread(args.threadId));
    return { success: true, data: thread };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateGmailDraft(args: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}): Promise<ToolCallResult> {
  try {
    const draft = await callWithRetry(() => createGmailDraft(args));
    return { success: true, data: draft };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

// Billy Tool Handlers
async function handleListBillyInvoices(): Promise<ToolCallResult> {
  try {
    const invoices = await callWithRetry(() => getInvoices());
    return { success: true, data: invoices };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleSearchBillyCustomer(args: {
  email: string;
}): Promise<ToolCallResult> {
  try {
    const customer = await callWithRetry(() =>
      searchCustomerByEmail(args.email)
    );
    return { success: true, data: customer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateBillyInvoice(args: {
  contactId: string;
  entryDate: string;
  paymentTermsDays?: number;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
  }>;
}): Promise<ToolCallResult> {
  try {
    const invoice = await callWithRetry(() => createInvoice(args));
    return { success: true, data: invoice };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

// Calendar Tool Handlers
async function handleListCalendarEvents(args: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}): Promise<ToolCallResult> {
  try {
    const events = await callWithRetry(() => listCalendarEvents(args));
    return { success: true, data: events };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleFindFreeCalendarSlots(args: {
  date: string;
  duration: number;
  workingHours?: { start: number; end: number };
}): Promise<ToolCallResult> {
  try {
    const slots = await callWithRetry(() => findFreeTimeSlots(args));
    return { success: true, data: slots };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleCreateCalendarEvent(args: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
}): Promise<ToolCallResult> {
  try {
    const event = await callWithRetry(() => createCalendarEvent(args));
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: "API_ERROR",
    };
  }
}

async function handleSearchCustomerCalendarHistory(args: {
  customerName: string;
  customerEmail?: string;
  monthsBack?: number;
}): Promise<ToolCallResult> {
  const { listCalendarEvents: listGoogleCalendarEvents } = await import(
    "./google-api"
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
    return {
      success: false,
      error: `Kunne ikke hente historik: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleUpdateCalendarEvent(args: {
  eventId: string;
  summary?: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
}): Promise<ToolCallResult> {
  try {
    const { updateCalendarEvent: updateGoogleEvent } = await import(
      "./google-api"
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

    return {
      success: true,
      data: {
        message: "Event opdateret succesfuldt",
        event: updatedEvent,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Kunne ikke opdatere event: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleDeleteCalendarEvent(args: {
  eventId: string;
  reason?: string;
}): Promise<ToolCallResult> {
  try {
    const { deleteCalendarEvent: deleteGoogleEvent } = await import(
      "./google-api"
    );

    await callWithRetry(() =>
      deleteGoogleEvent({
        eventId: args.eventId,
      })
    );

    return {
      success: true,
      data: {
        message: `Event slettet succesfuldt${args.reason ? ` (grund: ${args.reason})` : ""}`,
        eventId: args.eventId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Kunne ikke slette event: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

async function handleCheckCalendarConflicts(args: {
  start: string;
  end: string;
  ignoreEventId?: string;
}): Promise<ToolCallResult> {
  try {
    const { listCalendarEvents: listGoogleCalendarEvents } = await import(
      "./google-api"
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
    return {
      success: false,
      error: `Kunne ikke tjekke konflikter: ${error instanceof Error ? error.message : "Ukendt fejl"}`,
    };
  }
}

// Lead Tool Handlers
async function handleListLeads(
  userId: number,
  args: { status?: string; source?: string }
): Promise<ToolCallResult> {
  const leads = await getUserLeads(userId, {
    status: args.status,
    source: args.source,
  });
  return { success: true, data: leads };
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
  }
): Promise<ToolCallResult> {
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

  return {
    success: true,
    data: lead,
  };
}

async function handleUpdateLeadStatus(args: {
  leadId: number;
  status: string;
}): Promise<ToolCallResult> {
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
  return {
    success: true,
    data: { leadId: args.leadId, status: args.status },
  };
}

// Task Tool Handlers
async function handleListTasks(
  userId: number,
  args: { status?: string }
): Promise<ToolCallResult> {
  const tasks = await getUserTasks(userId);

  // Filter by status if provided
  let filteredTasks = tasks;
  if (args.status) {
    filteredTasks = filteredTasks.filter(task => task.status === args.status);
  }

  return {
    success: true,
    data: filteredTasks,
  };
}

async function handleCreateTask(
  userId: number,
  args: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
  }
): Promise<ToolCallResult> {
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

  return {
    success: true,
    data: task,
  };
}
