/**
 * AI Router
 * Routes requests to appropriate AI models and handles intent-based actions
 */

import { randomBytes } from "crypto";

import { applyMemoryRules } from "../../../shared/ai/memory-rules";

import { getFeatureFlags } from "../../_core/feature-flags";
import { invokeLLM, type Message } from "../../_core/llm";
import { getFridaySystemPrompt } from "./friday-prompts";
import { FRIDAY_TOOLS } from "./friday-tools";
import { responseCacheRedis } from "../../integrations/litellm/response-cache-redis";
import {
  executeAction,
  parseIntent,
  type ActionResult,
} from "../../intent-actions";
import {
  invokeLLMWithRouting,
  selectModel,
  type AIModel,
  type TaskType,
} from './model-router';
import {
  recommendSubscriptionPlan,
  predictChurnRisk,
  optimizeSubscriptionUsage,
  generateUpsellOpportunities,
} from '../subscription/subscription-ai';
import { executeUTCPTool } from "../../utcp/handler";
import { getAllUTCPTools, hasUTCPTool } from "../../utcp/manifest";

// Re-export types from model-router for backward compatibility
export type { AIModel, TaskType } from './model-router';

export interface EmailContext {
  page?: string; // Current page/tab
  selectedThreads?: string[]; // Selected email thread IDs
  openThreadId?: string; // Currently viewing thread
  folder?: string; // inbox, sent, archive, starred
  viewMode?: string; // list, pipeline, dashboard
  selectedLabels?: string[];
  searchQuery?: string;
  openDrafts?: number;
  previewThreadId?: string; // Thread in preview modal
}

export interface AIRouterOptions {
  messages: Message[];
  taskType?: TaskType;
  model?: AIModel;
  preferredModel?: AIModel;
  stream?: boolean;
  tools?: any[];
  userId?: number;
  requireApproval?: boolean; // NEW: If true, return pendingAction instead of executing
  context?: EmailContext; // Shortwave-style context tracking
  correlationId?: string;
}

export interface PendingAction {
  id: string;
  type:
    | "create_lead"
    | "create_task"
    | "book_meeting"
    | "create_invoice"
    | "search_gmail"
    | "request_flytter_photos"
    | "job_completion"
    | "check_calendar"; // Added for calendar viewing actions
  params: Record<string, any>;
  impact: string;
  preview: string;
  riskLevel: "low" | "medium" | "high";
}

export interface AIResponse {
  content: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: Array<{
    name: string;
    arguments: string;
  }>;
  pendingAction?: PendingAction;
}

/**
 * Build memory rules context from intent and email context
 */
function buildMemoryContext(
  intent: ReturnType<typeof parseIntent>,
  emailContext?: EmailContext
): any {
  const context: any = {};

  // Extract relevant data from intent params
  if (intent.intent === "book_meeting") {
    if (
      intent.params.startHour !== undefined &&
      intent.params.startMinute !== undefined
    ) {
      const hours = intent.params.startHour.toString().padStart(2, "0");
      const minutes = intent.params.startMinute.toString().padStart(2, "0");
      context.proposedTime = `${hours}:${minutes}`;
    }
    if (intent.params.dateHint) {
      context.proposedDate = intent.params.dateHint;
    }
    context.calendarEvent = {
      attendees: intent.params.attendees, // Will be checked by MEMORY_19
    };
  }

  if (intent.intent === "create_invoice") {
    context.invoice = {
      state: intent.params.state || "draft",
      lines: intent.params.lines || [],
    };
    context.isOffer = false; // Invoices are not offers
  }

  if (intent.intent === "create_lead") {
    context.lead = {
      name: intent.params.name,
      email: intent.params.email,
    };
    context.customerEmail = intent.params.email;
    if (intent.params.source?.toLowerCase().includes("flytter")) {
      context.isFlytterengøring = true;
      context.hasPhotos = intent.params.hasPhotos || false;
    }
  }

  if (intent.intent === "request_flytter_photos") {
    context.lead = {
      name: intent.params.customerName,
    };
    context.isFlytterengøring = true;
    context.hasPhotos = false; // Requesting photos means we don't have them yet
  }

  if (intent.intent === "job_completion") {
    context.jobCompletion = {
      invoiceId: intent.params.invoiceId,
      team: intent.params.team,
      paymentMethod: intent.params.paymentMethod,
      actualTime: intent.params.actualTime,
      calendarUpdated: intent.params.calendarUpdated,
      labelsRemoved: intent.params.labelsRemoved,
    };
  }

  if (intent.intent === "search_email" || emailContext) {
    context.customerEmail = intent.params.email || emailContext?.openThreadId;
    context.isOffer = intent.params.isOffer || false;
  }

  // Add email context if available
  if (emailContext?.openThreadId) {
    context.email = {
      from: emailContext.openThreadId, // Placeholder - would need actual email data
    };
  }

  return context;
}

/**
 * Enhanced model selection with routing and feature flags
 */
function selectModelForTask(
  taskType: TaskType,
  userId?: number,
  explicitModel?: AIModel
): AIModel {
  const flags = getFeatureFlags(userId);

  // If model routing is disabled or explicit model provided, use legacy logic
  if (!flags.enableModelRouting || explicitModel) {
    return explicitModel || "gemma-3-27b-free";
  }

  // Use new model routing system
  return selectModel(taskType, userId, explicitModel);
}

/**
 * Determine risk level for an intent type
 */
function getRiskLevel(intentType: string): "low" | "medium" | "high" {
  const riskMap: Record<string, "low" | "medium" | "high"> = {
    create_lead: "low",
    create_task: "low",
    book_meeting: "medium",
    create_invoice: "high",
    search_gmail: "low",
    request_flytter_photos: "low",
    job_completion: "medium",
    check_calendar: "medium", // Changed from 'low' to always show approval modal
  };
  return riskMap[intentType] || "medium";
}

/**
 * Generate preview text for an action
 */
function generateActionPreview(
  intentType: string,
  params: Record<string, any>
): string {
  switch (intentType) {
    case "create_lead":
      return `Opret nyt lead:\n- Navn: ${params.name || "Ikke angivet"}\n- Email: ${params.email || "Ikke angivet"}\n- Telefon: ${params.phone || "Ikke angivet"}\n- Kilde: ${params.source || "Ikke angivet"}`;

    case "create_task":
      return `Opret ny opgave:\n- Titel: ${params.title || "Ikke angivet"}\n- Prioritet: ${params.priority || "medium"}\n- Deadline: ${params.dueDate ? new Date(params.dueDate).toLocaleDateString("da-DK") : "Ikke angivet"}`;

    case "book_meeting":
      return `Book kalenderaftale:\n- Titel: ${params.summary || "Ikke angivet"}\n- Start: ${params.start ? new Date(params.start).toLocaleString("da-DK") : "Ikke angivet"}\n- Slut: ${params.end ? new Date(params.end).toLocaleString("da-DK") : "Ikke angivet"}\n- Sted: ${params.location || "Ikke angivet"}`;

    case "create_invoice":
      const totalAmount =
        params.lines?.reduce(
          (sum: number, line: any) => sum + line.quantity * line.unitPrice,
          0
        ) || 0;
      return `Opret faktura:\n- Kunde: ${params.contactId || "Ikke angivet"}\n- Beløb: ${totalAmount} kr\n- Betalingsfrist: ${params.paymentTermsDays || 14} dage\n- Antal linjer: ${params.lines?.length || 0}`;

    case "search_gmail":
      return `Søg i Gmail:\n- Søgeord: "${params.query || ""}"`;

    case "request_flytter_photos":
      return `Anmod om billeder til flytterengøring:\n- Lead: ${params.leadName || "Ikke angivet"}\n- Email: ${params.email || "Ikke angivet"}`;

    case "job_completion":
      return `Afslut job:\n- Job ID: ${params.jobId || "Ikke angivet"}\n- Kunde: ${params.customerName || "Ikke angivet"}\n- Gennemfør 6-trins tjekliste`;

    case "check_calendar":
      const dateStr = params.date
        ? new Date(params.date).toLocaleDateString("da-DK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "i dag";
      return `Hent kalenderbegivenheder:\n- Dato: ${dateStr}\n- Viser alle aftaler for denne dag`;

    default:
      return JSON.stringify(params, null, 2);
  }
}

/**
 * Generate impact description for an action
 */
function generateActionImpact(
  intentType: string,
  params: Record<string, any>
): string {
  switch (intentType) {
    case "create_lead":
      return "Opretter et nyt lead i databasen. Leadet vil være synligt i Leads-fanen.";

    case "create_task":
      return "Opretter en ny opgave i databasen. Opgaven vil være synlig i Tasks-fanen.";

    case "book_meeting":
      return "Opretter en ny kalenderaftale i Google Calendar. Aftalen vil være synlig i Calendar-fanen. BEMÆRK: Der tilføjes IKKE deltagere (MEMORY_19).";

    case "create_invoice":
      return "Opretter en KLADDE-faktura i Billy.dk. Fakturaen skal godkendes manuelt i Billy før afsendelse (MEMORY_17).";

    case "search_gmail":
      return "Søger i Gmail for at finde eksisterende emails. Ingen ændringer foretages.";

    case "request_flytter_photos":
      return "Sender email til kunden med anmodning om billeder af flytterengøring. Dette er KRITISK før tilbudssendelse (MEMORY_16).";

    case "job_completion":
      return "Gennemfører 6-trins tjekliste for jobafslutning: faktura, team, betaling, tid, kalender, labels (MEMORY_24).";

    case "check_calendar":
      return "Henter kalenderbegivenheder fra Google Calendar. Ingen ændringer foretages - kun læsning.";

    default:
      return "Udfører den anmodede handling.";
  }
}

/**
 * Create a pending action object from intent
 */
function createPendingAction(
  intent: ReturnType<typeof parseIntent>
): PendingAction {
  return {
    id: randomBytes(16).toString("hex"),
    type: intent.intent as PendingAction["type"],
    params: intent.params,
    impact: generateActionImpact(intent.intent, intent.params),
    preview: generateActionPreview(intent.intent, intent.params),
    riskLevel: getRiskLevel(intent.intent),
  };
}

/**
 * Route AI request to the appropriate model with intent-based actions
 */
export async function routeAI(
  options: AIRouterOptions & { userId?: number }
): Promise<AIResponse> {
  const {
    messages,
    taskType = "chat",
    model: explicitModel,
    preferredModel,
    userId,
    requireApproval = true, // DEFAULT: Require approval for all actions
    context,
    correlationId,
  } = options;

  const logPrefix = correlationId
    ? `[AI Router][${correlationId}]`
    : `[AI Router]`;

  const { logger } = await import("../../_core/logger");

  logger.debug(
    {
      taskType,
      userId,
      messageCount: messages.length,
      hasExplicitModel: !!explicitModel,
      hasPreferredModel: !!preferredModel,
      requireApproval,
      hasContext: !!context,
      contextKeys: context ? Object.keys(context) : [],
      correlationId,
    },
    "[AI Router] [routeAI]: Entry"
  );

  // Use preferred model first, then explicit model, then select based on task type
  logger.debug(
    {
      taskType,
      userId,
      explicitModel,
      preferredModel,
    },
    "[AI Router] [routeAI]: Selecting model"
  );

  const selectedModel = selectModelForTask(
    taskType,
    userId,
    explicitModel || preferredModel
  );

  logger.info(
    {
      selectedModel,
      taskType,
      correlationId,
    },
    "[AI Router] [routeAI]: Model selected"
  );

  // Get the last user message to check for intents
  const lastUserMessage = messages.filter(m => m.role === "user").pop();
  const userMessageText =
    typeof lastUserMessage?.content === "string" ? lastUserMessage.content : "";

  logger.debug(
    {
      userMessageLength: userMessageText.length,
      hasLastUserMessage: !!lastUserMessage,
      correlationId,
    },
    "[AI Router] [routeAI]: Parsing intent"
  );

  // Parse intent from user message
  const intent = parseIntent(userMessageText);
  logger.debug(
    {
      intent: intent.intent,
      confidence: intent.confidence,
      params: intent.params,
      correlationId,
    },
    "[AI Router] [routeAI]: Intent parsed"
  );

  let actionResult: ActionResult | null = null;
  let pendingAction: PendingAction | undefined = undefined;

  // Debug: Check execution conditions (only if DEBUG=true)
  if (process.env.DEBUG === "true") {
    logger.debug({
      confidence: intent.confidence,
      confidenceCheck: intent.confidence > 0.7,
      intentNotUnknown: intent.intent !== "unknown",
      userId: userId,
      hasUserId: !!userId,
      requireApproval: requireApproval,
      shouldExecute:
        intent.confidence > 0.7 &&
        intent.intent !== "unknown" &&
        !!userId &&
        !requireApproval,
    });
  }

  // If high-confidence intent detected
  logger.debug(
    {
      confidence: intent.confidence,
      confidenceThreshold: 0.7,
      intent: intent.intent,
      hasUserId: !!userId,
      requireApproval,
      shouldExecute:
        intent.confidence > 0.7 &&
        intent.intent !== "unknown" &&
        !!userId &&
        !requireApproval,
      shouldCreatePending:
        intent.confidence > 0.7 &&
        intent.intent !== "unknown" &&
        !!userId &&
        requireApproval,
      correlationId,
    },
    "[AI Router] [routeAI]: Checking intent execution conditions"
  );

  if (intent.confidence > 0.7 && intent.intent !== "unknown" && userId) {
    if (requireApproval) {
      // Return pending action for user approval
      logger.info(
        {
          intent: intent.intent,
          correlationId,
        },
        "[AI Router] [routeAI]: Creating pending action"
      );

      pendingAction = createPendingAction(intent);

      logger.debug({
        actionId: pendingAction.id,
        actionType: pendingAction.type,
        riskLevel: pendingAction.riskLevel,
        correlationId,
      });
    } else {
      // Execute action immediately (legacy mode)
      logger.info(
        {
          intent: intent.intent,
          userId,
          correlationId,
        },
        "[AI Router] [routeAI]: Executing action immediately"
      );

      // Apply memory rules validation before executing action
      const memoryContext = buildMemoryContext(intent, context);
      const ruleResult = await applyMemoryRules(memoryContext);

      if (!ruleResult.passed && ruleResult.violations.length > 0) {
        logger.warn(
          {
            intent: intent.intent,
            violations: ruleResult.violations,
            warnings: ruleResult.warnings,
            correlationId,
          },
          "[AI Router] [routeAI]: Memory rule violations detected - blocking action"
        );

        actionResult = {
          success: false,
          message: `⚠️ Regel overtrædelse opdaget:\n\n${ruleResult.violations.map(v => `❌ ${v}`).join("\n")}${ruleResult.warnings.length > 0 ? `\n\n⚠️ Advarsler:\n${ruleResult.warnings.map(w => `⚠️ ${w}`).join("\n")}` : ""}\n\nHandlingen er blokeret for at beskytte forretningsreglerne.`,
        };
      } else {
        if (ruleResult.warnings.length > 0) {
          logger.info(
            {
              intent: intent.intent,
              warnings: ruleResult.warnings,
              correlationId,
            },
            "[AI Router] [routeAI]: Memory rule warnings (non-blocking)"
          );
        }

        try {
          actionResult = await executeAction(intent, userId, { correlationId });
          logger.info(
            {
              intent: intent.intent,
              success: actionResult.success,
              hasData: !!actionResult.data,
              correlationId,
            },
            "[AI Router] [routeAI]: Action executed successfully"
          );
        } catch (error) {
          logger.error(
            {
              err: error,
              intent: intent.intent,
              correlationId,
            },
            "[AI Router] [routeAI]: Action execution failed"
          );
          actionResult = {
            success: false,
            message: "Der opstod en fejl under udførelsen af handlingen.",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }
  } else {
    logger.debug(
      {
        reason: !userId
          ? "noUserId"
          : intent.confidence <= 0.7
            ? "lowConfidence"
            : intent.intent === "unknown"
              ? "unknownIntent"
              : "unknown",
        correlationId,
      },
      "[AI Router] [routeAI]: No action execution"
    );
  }

  // Add Friday system prompt if not already present
  const hasSystemPrompt = messages.some(m => m.role === "system");

  // Build context string if provided (Shortwave-style)
  let contextString = "";
  if (context) {
    const contextParts: string[] = [];

    if (context.page) {
      contextParts.push(`User is on page: ${context.page}`);
    }

    if (context.folder) {
      contextParts.push(`Viewing folder: ${context.folder}`);
    }

    if (context.viewMode && context.viewMode !== "list") {
      contextParts.push(`View mode: ${context.viewMode}`);
    }

    if (context.selectedThreads && context.selectedThreads.length > 0) {
      contextParts.push(
        `User has ${context.selectedThreads.length} email thread(s) selected`
      );
      if (context.selectedThreads.length <= 5) {
        contextParts.push(
          `Selected thread IDs: ${context.selectedThreads.join(", ")}`
        );
      }
    }

    if (context.openThreadId) {
      contextParts.push(`User is viewing thread: ${context.openThreadId}`);
    }

    if (context.previewThreadId) {
      contextParts.push(
        `Preview modal open for thread: ${context.previewThreadId}`
      );
    }

    if (context.selectedLabels && context.selectedLabels.length > 0) {
      contextParts.push(
        `Filtered by labels: ${context.selectedLabels.join(", ")}`
      );
    }

    if (context.searchQuery) {
      contextParts.push(`Search query: "${context.searchQuery}"`);
    }

    if (context.openDrafts && context.openDrafts > 0) {
      contextParts.push(`User has ${context.openDrafts} draft(s) open`);
    }

    if (contextParts.length > 0) {
      contextString = `\n\n<system-reminder>\n${contextParts.join("\n")}\n</system-reminder>\n\nWhen user refers to "det her", "denne email", "dem", etc., they are referring to the above context. Use this to understand what they're talking about.\n`;
    }
  }

  // Add critical date/time reminder as FIRST system message after initial system prompt
  // This ensures LLM sees it BEFORE any old messages with wrong dates
  const now = new Date();
  const dateStr = now.toLocaleDateString("da-DK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateReminderMessage = {
    role: "system" as const,
    content: `🔴 KRITISK INFORMATION - LÆS DETTE FØRST:

Dagens dato er: ${dateStr}
Klokken er: ${timeStr}

DU SKAL ALTID bruge denne dato når du:
- Svarer på spørgsmål om tid/dato
- Tjekker kalender
- Opretter begivenheder
- Refererer til "i dag", "i morgen", "nu"

IGNORER alle tidligere beskeder hvor du nævnte andre datoer (fx april 2024).
Den korrekte dato er ${dateStr}. Brug ALTID denne dato.

Hvis brugeren siger du har forkert dato, så TJEK DENNE BESKED IGEN! ⬆️`,
  };

  const messagesWithSystem = hasSystemPrompt
    ? messages
    : [
        {
          role: "system" as const,
          content: getFridaySystemPrompt() + contextString,
        },
        dateReminderMessage, // Insert date reminder RIGHT AFTER system prompt
        ...messages,
      ];

  // Helper function to format action results for AI
  const formatActionResultForAI = (result: ActionResult): string => {
    let content = `[Handling Udført] ${result.success ? "✅ Succes" : "❌ Fejl"}: ${result.message}`;

    if (result.data) {
      // Format data based on type instead of raw JSON
      if (Array.isArray(result.data)) {
        content += `\n\nResultater (${result.data.length} elementer):`;
        result.data.slice(0, 3).forEach((item, i) => {
          if (item.summary) content += `\n${i + 1}. ${item.summary}`;
          else if (item.title) content += `\n${i + 1}. ${item.title}`;
          else if (item.subject) content += `\n${i + 1}. ${item.subject}`;
        });
        if (result.data.length > 3)
          content += `\n... og ${result.data.length - 3} flere`;
      } else if (typeof result.data === "object") {
        // Extract key info without showing full JSON
        const keys = Object.keys(result.data);
        if (keys.length <= 5) {
          content += `\n\nDetaljer: ${keys.map(k => `${k}: ${result.data[k]}`).join(", ")}`;
        } else {
          content += `\n\nData modtaget (${keys.length} felter)`;
        }
      }
    }

    if (result.error) {
      content += `\n\n⚠️ Teknisk fejl: ${result.error}`;
    }

    content += `\n\n💡 Præsenter nu resultatet naturligt til brugeren på dansk uden at vise tekniske detaljer eller JSON.`;
    return content;
  };

  // If action was executed, add result to context
  // If pending action, add note to AI
  const finalMessages: Message[] = [...messagesWithSystem];
  if (actionResult) {
    finalMessages.push({
      role: "system",
      content: formatActionResultForAI(actionResult),
    });
  } else if (pendingAction) {
    finalMessages.push({
      role: "system",
      content: `Du har netop foreslået en handling af typen "${pendingAction.type}" til brugeren. En godkendelsesdialog vil blive vist automatisk. 

VIGTIGT: Skriv IKKE "[Pending Action]" i din response! UI'en viser automatisk en modal.

I stedet, forklar kort og naturligt:
- Hvad du vil gøre
- Hvorfor det er relevant
- Hvad brugeren kan forvente at se

Eksempel: "Jeg tjekker din kalender for dagens aftaler nu." (UDEN at skrive [Pending Action])`,
    });
  }

  try {
    // ✅ PERFORMANCE: Check Redis cache for AI responses
    // Only cache if no actions were executed (actions make responses non-deterministic)
    const shouldCache = !actionResult && !pendingAction;
    logger.debug(
      {
        shouldCache,
        hasActionResult: !!actionResult,
        hasPendingAction: !!pendingAction,
        correlationId,
      },
      "[AI Router] [routeAI]: Checking cache"
    );

    if (shouldCache) {
      const cached = await responseCacheRedis.get(finalMessages, selectedModel);
      if (cached) {
        logger.info(
          {
            model: selectedModel,
            correlationId,
          },
          "[AI Router] [routeAI]: Cache hit"
        );
        // Type guard: ensure cached response matches AIResponse structure
        const cachedResult = cached as AIResponse;
        return {
          content: cachedResult.content || "",
          model: cachedResult.model || selectedModel,
          toolCalls: cachedResult.toolCalls,
          pendingAction: cachedResult.pendingAction,
          usage: cachedResult.usage,
        };
      } else {
        logger.debug(
          {
            model: selectedModel,
            correlationId,
          },
          "[AI Router] [routeAI]: Cache miss"
        );
      }
    }

    // Call AI with enhanced routing and fallbacks
    const flags = getFeatureFlags(userId);
    logger.debug(
      {
        selectedModel,
        enableModelRouting: flags.enableModelRouting,
        hasExplicitModel: !!explicitModel,
        hasPreferredModel: !!preferredModel,
        messageCount: finalMessages.length,
        correlationId,
      },
      "[AI Router] [routeAI]: Calling LLM"
    );

    // Prepare tools (UTCP or legacy)
    let toolsToUse = options.tools || FRIDAY_TOOLS;
    if (flags.enableUTCP) {
      // Convert UTCP tools to LLM function format
      const utcpTools = getAllUTCPTools();
      const utcpToolsForLLM = utcpTools.map(tool => ({
        type: "function" as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      }));

      // Use UTCP tools for prototype tools, fallback to FRIDAY_TOOLS for others
      const utcpToolNames = new Set(utcpTools.map(t => t.name));
      const legacyTools = (options.tools || FRIDAY_TOOLS).filter(
        (t: any) => !utcpToolNames.has(t.function?.name)
      );

      toolsToUse = [...utcpToolsForLLM, ...legacyTools];

      logger.debug(
        {
          utcpToolCount: utcpToolsForLLM.length,
          legacyToolCount: legacyTools.length,
          totalToolCount: toolsToUse.length,
          correlationId,
        },
        "[AI Router] [routeAI]: Using UTCP tools (prototype)"
      );
    }

    let response;
    if (flags.enableModelRouting && !explicitModel && !preferredModel) {
      // Use new model routing system with fallbacks
      logger.debug(
        {
          taskType,
          userId,
          correlationId,
        },
        "[AI Router] [routeAI]: Using model routing system"
      );

      response = await invokeLLMWithRouting(taskType, finalMessages, {
        userId,
        stream: false,
        maxRetries: 2,
      });
    } else {
      // Use legacy LLM invocation
      logger.debug(
        {
          model: selectedModel,
          correlationId,
        },
        "[AI Router] [routeAI]: Using legacy LLM invocation"
      );

      response = await invokeLLM({
        messages: finalMessages,
        model: selectedModel,
        tools: toolsToUse,
      });
    }

    logger.debug(
      {
        hasResponse: !!response,
        isStreaming: Symbol.asyncIterator in response,
        correlationId,
      },
      "[AI Router] [routeAI]: LLM response received"
    );

    // Handle both streaming and non-streaming responses
    let aiResponse: AIResponse;
    if (Symbol.asyncIterator in response) {
      // Streaming response - accumulate chunks
      let accumulatedContent = "";
      for await (const chunk of response) {
        accumulatedContent += chunk;
      }

      const messageContent = accumulatedContent;
      let content = typeof messageContent === "string" ? messageContent : "";

      // If action was executed successfully, prepend action confirmation
      if (actionResult && actionResult.success) {
        content = actionResult.message + "\n\n" + content;
      }

      aiResponse = {
        content,
        model: selectedModel,
        usage: {
          promptTokens: 0,
          completionTokens: content.length,
          totalTokens: content.length,
        },
        pendingAction, // Include pending action if created
      };
    } else {
      // Non-streaming response
      const messageContent = response.choices[0]?.message?.content;
      let content = typeof messageContent === "string" ? messageContent : "";

      // Handle tool calls from LLM response (UTCP or legacy)
      const toolCalls = response.choices[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        logger.debug(
          {
            toolCallCount: toolCalls.length,
            correlationId,
          },
          "[AI Router] [routeAI]: Processing tool calls"
        );

        const flags = getFeatureFlags(userId);
        const toolResults: Array<{ role: "tool"; content: string; tool_call_id: string }> = [];

        for (const toolCall of toolCalls) {
          const toolName = toolCall.function?.name;
          const toolArgs = toolCall.function?.arguments
            ? JSON.parse(toolCall.function.arguments)
            : {};

          logger.debug(
            {
              toolName,
              toolArgs,
              correlationId,
            },
            "[AI Router] [routeAI]: Executing tool call"
          );

          // Check if this is a UTCP tool
          if (flags.enableUTCP && hasUTCPTool(toolName)) {
            try {
              const utcpResult = await executeUTCPTool(
                toolName,
                toolArgs,
                userId!,
                { correlationId, approved: !requireApproval }
              );

              toolResults.push({
                role: "tool",
                content: utcpResult.success
                  ? JSON.stringify(utcpResult.data)
                  : JSON.stringify({ error: utcpResult.error }),
                tool_call_id: toolCall.id,
              });

              logger.info(
                {
                  toolName,
                  success: utcpResult.success,
                  cached: utcpResult.metadata?.cached,
                  executionTimeMs: utcpResult.metadata?.executionTimeMs,
                  correlationId,
                },
                "[AI Router] [routeAI]: UTCP tool executed"
              );
            } catch (error) {
              logger.error(
                {
                  toolName,
                  error: error instanceof Error ? error.message : String(error),
                  correlationId,
                },
                "[AI Router] [routeAI]: UTCP tool execution failed"
              );

              toolResults.push({
                role: "tool",
                content: JSON.stringify({
                  error: error instanceof Error ? error.message : "Unknown error",
                }),
                tool_call_id: toolCall.id,
              });
            }
          } else {
            // Fallback to legacy tool execution or custom handlers
            logger.debug(
              {
                toolName,
                correlationId,
              },
              "[AI Router] [routeAI]: Using legacy/custom tool execution"
            );

            // Custom subscription tool handlers
            if (toolName === "recommend_subscription_plan") {
              try {
                const recommendation = await recommendSubscriptionPlan(
                  toolArgs.customerId,
                  userId!,
                  toolArgs.includeReasoning ?? true
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify(recommendation),
                  tool_call_id: toolCall.id,
                });
              } catch (error) {
                logger.error(
                  {
                    toolName,
                    error: error instanceof Error ? error.message : String(error),
                    correlationId,
                  },
                  "[AI Router] [routeAI]: Subscription recommendation failed"
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                  }),
                  tool_call_id: toolCall.id,
                });
              }
            } else if (toolName === "predict_churn_risk") {
              try {
                const prediction = await predictChurnRisk(
                  toolArgs.customerId,
                  userId!,
                  toolArgs.lookbackDays || 90
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify(prediction),
                  tool_call_id: toolCall.id,
                });
              } catch (error) {
                logger.error(
                  {
                    toolName,
                    error: error instanceof Error ? error.message : String(error),
                    correlationId,
                  },
                  "[AI Router] [routeAI]: Churn prediction failed"
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                  }),
                  tool_call_id: toolCall.id,
                });
              }
            } else if (toolName === "optimize_subscription_usage") {
              try {
                const optimization = await optimizeSubscriptionUsage(
                  toolArgs.subscriptionId,
                  userId!,
                  toolArgs.optimizeFor || "value"
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify(optimization),
                  tool_call_id: toolCall.id,
                });
              } catch (error) {
                logger.error(
                  {
                    toolName,
                    error: error instanceof Error ? error.message : String(error),
                    correlationId,
                  },
                  "[AI Router] [routeAI]: Usage optimization failed"
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                  }),
                  tool_call_id: toolCall.id,
                });
              }
            } else if (toolName === "generate_upsell_opportunities") {
              try {
                const opportunities = await generateUpsellOpportunities(
                  toolArgs.customerId,
                  userId!,
                  toolArgs.includeCrossSell ?? true
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify(opportunities),
                  tool_call_id: toolCall.id,
                });
              } catch (error) {
                logger.error(
                  {
                    toolName,
                    error: error instanceof Error ? error.message : String(error),
                    correlationId,
                  },
                  "[AI Router] [routeAI]: Upsell opportunities failed"
                );
                toolResults.push({
                  role: "tool",
                  content: JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                  }),
                  tool_call_id: toolCall.id,
                });
              }
            } else if (flags.enableUTCP) {
              // Legacy tool execution would go here
              toolResults.push({
                role: "tool",
                content: JSON.stringify({
                  error: `Tool ${toolName} not yet migrated to UTCP`,
                }),
                tool_call_id: toolCall.id,
              });
            }
          }
        }

        // If we have tool results, make another LLM call with results
        if (toolResults.length > 0) {
          const messagesWithToolResults = [
            ...finalMessages,
            {
              role: "assistant" as const,
              content: "",
              tool_calls: toolCalls,
            },
            ...toolResults,
          ];

          logger.debug(
            {
              toolResultCount: toolResults.length,
              correlationId,
            },
            "[AI Router] [routeAI]: Making follow-up LLM call with tool results"
          );

          const followUpResponse = await invokeLLM({
            messages: messagesWithToolResults,
            model: selectedModel,
            tools: toolsToUse,
          });

          const followUpContent =
            followUpResponse.choices[0]?.message?.content || "";
          content = typeof followUpContent === "string" ? followUpContent : "";

          aiResponse = {
            content,
            model: selectedModel,
            usage: followUpResponse.usage
              ? {
                  promptTokens: followUpResponse.usage.prompt_tokens,
                  completionTokens: followUpResponse.usage.completion_tokens,
                  totalTokens: followUpResponse.usage.total_tokens,
                }
              : {
                  promptTokens: 0,
                  completionTokens: content.length,
                  totalTokens: content.length,
                },
            pendingAction,
            toolCalls: toolCalls.map(tc => ({
              name: tc.function?.name || "",
              arguments: tc.function?.arguments || "",
            })),
          };
        } else {
          // No tool results, use original response
          if (actionResult && actionResult.success) {
            content = actionResult.message + "\n\n" + content;
          }

          aiResponse = {
            content,
            model: selectedModel,
            usage: response.usage
              ? {
                  promptTokens: response.usage.prompt_tokens,
                  completionTokens: response.usage.completion_tokens,
                  totalTokens: response.usage.total_tokens,
                }
              : {
                  promptTokens: 0,
                  completionTokens: content.length,
                  totalTokens: content.length,
                },
            pendingAction,
            toolCalls: toolCalls?.map(tc => ({
              name: tc.function?.name || "",
              arguments: tc.function?.arguments || "",
            })),
          };
        }
      } else {
        // No tool calls, use original response
        // If action was executed successfully, prepend action confirmation
        if (actionResult && actionResult.success) {
          content = actionResult.message + "\n\n" + content;
        }

        aiResponse = {
          content,
          model: selectedModel,
          usage: response.usage
            ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
              }
            : {
                promptTokens: 0,
                completionTokens: content.length,
                totalTokens: content.length,
              },
          pendingAction, // Include pending action if created
        };
      }
    }

    // ✅ PERFORMANCE: Cache the final response if no actions were executed
    if (shouldCache) {
      logger.debug(
        {
          model: selectedModel,
          correlationId,
        },
        "[AI Router] [routeAI]: Caching response"
      );

      await responseCacheRedis.set(finalMessages, selectedModel, aiResponse);
    }

    logger.debug(
      {
        model: aiResponse.model,
        responseLength: aiResponse.content.length,
        hasPendingAction: !!aiResponse.pendingAction,
        usage: aiResponse.usage,
        correlationId,
      },
      "[AI Router] [routeAI]: Complete"
    );

    return aiResponse;
  } catch (error) {
    logger.error(
      {
        err: error,
        model: selectedModel,
        hasActionResult: !!actionResult,
        actionSuccess: actionResult?.success,
        correlationId,
      },
      "[AI Router] [routeAI]: Error occurred"
    );

    // If action succeeded but AI failed, return action result
    if (actionResult && actionResult.success) {
      logger.info(
        {
          correlationId,
        },
        "[AI Router] [routeAI]: Returning action result after AI error"
      );
      return {
        content: actionResult.message,
        model: selectedModel,
      };
    }

    throw error;
  }
}
