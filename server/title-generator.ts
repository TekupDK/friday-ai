/**
 * Automatic Conversation Title Generation
 * 3-tier fallback system: Intent → Keywords → AI → Fallback
 */

import { parseIntent, type Intent } from "./intent-actions";
import { invokeLLM } from "./_core/llm";

/**
 * Generate title from intent and parameters with emoji
 */
function generateIntentTitle(
  intent: Intent,
  params: Record<string, any>
): string | null {
  const titleMap: Record<Intent, (p: Record<string, any>) => string> = {
    create_lead: p => {
      const name = p.name || "Ukendt";
      const source = p.source || "";
      return source ? `💼 Lead: ${name} - ${source}` : `💼 Lead: ${name}`;
    },
    create_task: p => {
      const title = p.title || "Ny opgave";
      const priority = p.priority === "high" ? "🔴 " : "✅ ";
      return `${priority}${title}`;
    },
    book_meeting: p => {
      const summary = p.summary || "Møde";
      const date = p.start
        ? new Date(p.start).toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
          })
        : "";
      return date ? `📅 ${summary} - ${date}` : `📅 ${summary}`;
    },
    create_invoice: p => {
      const customer = p.customerName || p.contactId || "Kunde";
      return `💰 Faktura: ${customer}`;
    },
    search_email: p => {
      const query = p.query || "søgning";
      return `📧 Email: ${query}`;
    },
    request_flytter_photos: p => {
      const address = p.address || p.leadName || "flytterengøring";
      return `🏠 Flytter: ${address}`;
    },
    job_completion: p => {
      const customer = p.customerName || p.jobId || "job";
      return `✅ Afsluttet: ${customer}`;
    },
    list_tasks: () => "📋 Mine opgaver",
    list_leads: () => "💼 Mine leads",
    check_calendar: () => "📅 Kalender oversigt",
    ai_generate_summaries: p => {
      const count = Array.isArray(p.emailIds) ? p.emailIds.length : undefined;
      return count && count > 0
        ? `🤖 AI: Resuméer (${count} mails)`
        : "🤖 AI: Generér resuméer";
    },
    ai_suggest_labels: p => {
      const count = Array.isArray(p.emailIds) ? p.emailIds.length : undefined;
      const auto = p.autoApply ? " (auto)" : "";
      return count && count > 0
        ? `🏷️ AI: Labels (${count} mails)${auto}`
        : `🏷️ AI: Foreslå labels${auto}`;
    },
    unknown: () => "💬 Ny samtale",
  };

  const generator = titleMap[intent];
  if (!generator) return null;

  try {
    const title = generator(params);
    return title ? truncateTitle(title) : null;
  } catch (error) {
    console.error("[Title Generator] Intent title generation failed:", error);
    return null;
  }
}

/**
 * Generate title from domain-specific keywords with emoji
 */
function generateKeywordTitle(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  const keywordMap: Record<string, string> = {
    flytterengøring: "🏠 Flytterengøring forespørgsel",
    hovedrengøring: "✨ Hovedrengøring forespørgsel",
    "fast rengøring": "🔄 Fast rengøring aftale",
    tilbud: "💰 Tilbudsforespørgsel",
    faktura: "🧾 Faktura spørgsmål",
    betaling: "💳 Betalingshenvendelse",
    klage: "⚠️ Kundeservice sag",
    "rengøring.nu": "🌐 Lead fra Rengøring.nu",
    adhelp: "📢 Lead fra AdHelp",
    google: "🔍 Lead fra Google",
  };

  for (const [keyword, title] of Object.entries(keywordMap)) {
    if (lowerMessage.includes(keyword)) {
      return title;
    }
  }

  return null;
}

/**
 * Generate title using AI (fallback) with emoji
 */
async function generateAITitle(
  message: string,
  model: string = "gemma-3-27b-free"
): Promise<string | null> {
  try {
    const prompt = `Generer kort titel (max 32 tegn inkl. emoji) for Rendetalje kundesamtale.
Besked: "${message}"

Format: [Emoji] [Type]: [Kunde/Emne]

Brug relevante emoji:
🏠 Flytter/hovedrengøring
💼 Lead/kunde
📅 Møde/kalender  
💰 Tilbud/faktura
📧 Email/besked
✨ Generel rengøring
📋 Opgave

Eksempler: 
"🏠 Flytter: Vestergade 12"
"💼 Lead: Marie Hansen"
"💰 Tilbud: 85m² lejlighed"

Returner KUN titlen med emoji først, ingen forklaring.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Du er en hjælpsom assistent der genererer korte, præcise titler med emoji på dansk.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      return truncateTitle(content.trim());
    }

    return null;
  } catch (error) {
    console.error("[Title Generator] AI title generation failed:", error);
    return null;
  }
}

/**
 * Truncate title to max 40 characters
 */
function truncateTitle(title: string): string {
  const maxLength = 40;
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
}

/**
 * Generate fallback title with emoji and timestamp
 */
function generateFallbackTitle(): string {
  const now = new Date();
  const time = now.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `💬 Samtale ${time}`;
}

/**
 * Main title generation function with 3-tier fallback
 */
export async function generateConversationTitle(
  message: string,
  model?: string
): Promise<string> {
  // Tier 1: Intent-based title (0-10ms)
  const parsedIntent = parseIntent(message);
  if (parsedIntent.confidence > 0.7 && parsedIntent.intent !== "unknown") {
    const intentTitle = generateIntentTitle(
      parsedIntent.intent,
      parsedIntent.params
    );
    if (intentTitle) {
      console.log("[Title Generator] Intent-based title:", intentTitle);
      return intentTitle;
    }
  }

  // Tier 2: Keyword-based title (10-50ms)
  const keywordTitle = generateKeywordTitle(message);
  if (keywordTitle) {
    console.log("[Title Generator] Keyword-based title:", keywordTitle);
    return keywordTitle;
  }

  // Tier 3: AI-generated title (500-2000ms)
  const aiTitle = await generateAITitle(message, model);
  if (aiTitle) {
    console.log("[Title Generator] AI-generated title:", aiTitle);
    return aiTitle;
  }

  // Tier 4: Fallback title
  const fallbackTitle = generateFallbackTitle();
  console.log("[Title Generator] Fallback title:", fallbackTitle);
  return fallbackTitle;
}
