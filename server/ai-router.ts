/**
 * AI Router
 * Routes requests to appropriate AI models and handles intent-based actions
 */

import { randomBytes } from "crypto";
import { invokeLLM, type Message } from "./_core/llm";
import { getFridaySystemPrompt } from "./friday-prompts";
import { invokeLLMWithRouting, selectModel, type TaskType, type AIModel } from "./model-router";
import {
  executeAction,
  parseIntent,
  type ActionResult,
} from "./intent-actions";
import { getFeatureFlags } from "./_core/feature-flags";

// Re-export types from model-router for backward compatibility
export type { AIModel, TaskType } from "./model-router";

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
 * Enhanced model selection with routing and feature flags
 */
function selectModelForTask(taskType: TaskType, userId?: number, explicitModel?: AIModel): AIModel {
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

  // Use preferred model first, then explicit model, then select based on task type
  const selectedModel = selectModelForTask(taskType, userId, explicitModel || preferredModel);

  const logPrefix = correlationId
    ? `[AI Router][${correlationId}]`
    : `[AI Router]`;

  console.log(`${logPrefix} Using model: ${selectedModel} for task: ${taskType}`);

  // Get the last user message to check for intents
  const lastUserMessage = messages.filter(m => m.role === "user").pop();
  const userMessageText =
    typeof lastUserMessage?.content === "string" ? lastUserMessage.content : "";

  // Parse intent from user message
  const intent = parseIntent(userMessageText);
  console.log(
    `${logPrefix} Detected intent: ${intent.intent} (confidence: ${intent.confidence})`
  );
  console.log(`${logPrefix} Intent params:`, intent.params);

  let actionResult: ActionResult | null = null;
  let pendingAction: PendingAction | undefined = undefined;

  // Debug: Check execution conditions (only if DEBUG=true)
  if (process.env.DEBUG === "true") {
    console.log(`${logPrefix} Execution conditions:`, {
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
  if (intent.confidence > 0.7 && intent.intent !== "unknown" && userId) {
    if (requireApproval) {
      // Return pending action for user approval
      console.log(
        `${logPrefix} CREATING pending action for intent: ${intent.intent}`
      );
      pendingAction = createPendingAction(intent);
      console.log(`${logPrefix} Pending action created:`, pendingAction);
    } else {
      // Execute action immediately (legacy mode)
      console.log(`${logPrefix} EXECUTING action for intent: ${intent.intent}`);
      try {
        actionResult = await executeAction(intent, userId, { correlationId });
        console.log(`${logPrefix} Action SUCCESS:`, actionResult);
      } catch (error) {
        console.error(`${logPrefix} Action execution FAILED:`, error);
        actionResult = {
          success: false,
          message: "Der opstod en fejl under udførelsen af handlingen.",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
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
        if (result.data.length > 3) content += `\n... og ${result.data.length - 3} flere`;
      } else if (typeof result.data === 'object') {
        // Extract key info without showing full JSON
        const keys = Object.keys(result.data);
        if (keys.length <= 5) {
          content += `\n\nDetaljer: ${keys.map(k => `${k}: ${result.data[k]}`).join(', ')}`;
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
    // Call AI with enhanced routing and fallbacks
    const flags = getFeatureFlags(userId);
    let response;

    if (flags.enableModelRouting && !explicitModel && !preferredModel) {
      // Use new model routing system with fallbacks
      response = await invokeLLMWithRouting(taskType, finalMessages, {
        userId,
        stream: false,
        maxRetries: 2,
      });
    } else {
      // Use legacy LLM invocation
      response = await invokeLLM({
        messages: finalMessages,
        model: selectedModel,
      });
    }

    // Handle both streaming and non-streaming responses
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

      return {
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

      // If action was executed successfully, prepend action confirmation
      if (actionResult && actionResult.success) {
        content = actionResult.message + "\n\n" + content;
      }

      return {
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
  } catch (error) {
    console.error(`${logPrefix} Error with model ${selectedModel}:`, error);

    // If action succeeded but AI failed, return action result
    if (actionResult && actionResult.success) {
      return {
        content: actionResult.message,
        model: selectedModel,
      };
    }

    throw error;
  }
}
