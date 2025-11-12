/**
 * Response Generator - AI-powered email response suggestions
 * Generates context-aware, tone-matched response drafts for emails
 */

import { routeAI } from "../ai-router";
import { generateCorrelationId } from "../action-audit";
import type { EmailMessage } from "./categorizer";

export interface ResponseSuggestion {
  id: string;
  type: "quick_reply" | "detailed" | "forward" | "schedule";
  text: string;
  tone: "professional" | "friendly" | "formal";
  confidence: number; // 0-1
  reasoning?: string;
}

export interface ConversationContext {
  previousEmails?: EmailMessage[];
  senderRelationship?: "vip" | "customer" | "colleague" | "unknown";
  threadHistory?: string[];
}

const RESPONSE_GENERATION_PROMPT = `Du er en professionel email assistent. Generer passende svar-forslag til følgende email.

Email Information:
Fra: {from}
Til: {to}
Emne: {subject}
Indhold: {body}

{contextSection}

Generer 2-3 svar-forslag i forskellige længder:
1. Hurtig bekræftelse (1-2 linjer)
2. Detaljeret professionelt svar (4-6 linjer)
3. (Valgfrit) Alternativ med anden tone

Krav:
- Skriv på dansk
- Match afsenderens tone
- Vær høflig og professionel
- Inkluder relevante detaljer fra original email
- Ingen placeholders som [navn] - brug faktiske navne

Svar KUN med valid JSON array:
[
  {
    "type": "quick_reply",
    "text": "Faktisk svar tekst her...",
    "tone": "professional",
    "confidence": 0.9,
    "reasoning": "Kort bekræftelse der anerkender modtagelse"
  },
  {
    "type": "detailed",
    "text": "Længere svar tekst her...",
    "tone": "professional", 
    "confidence": 0.85,
    "reasoning": "Detaljeret svar med relevant information"
  }
]`;

/**
 * Generate response suggestions for an email
 */
export async function generateResponseSuggestions(
  email: EmailMessage,
  userId: number,
  context?: ConversationContext
): Promise<ResponseSuggestion[]> {
  try {
    // Build context section
    const contextSection = buildContextSection(context);

    // Truncate long content
    const truncatedBody =
      email.body.length > 1500
        ? email.body.substring(0, 1500) + "..."
        : email.body;

    // Build prompt
    const prompt = RESPONSE_GENERATION_PROMPT.replace("{from}", email.from)
      .replace("{to}", email.to)
      .replace("{subject}", email.subject)
      .replace("{body}", truncatedBody)
      .replace("{contextSection}", contextSection);

    // Call LLM
    const response = await routeAI({
      messages: [{ role: "user", content: prompt }],
      taskType: "chat",
      userId,
      requireApproval: false,
      correlationId: generateCorrelationId(),
      tools: [],
    });

    // Parse response
    const suggestions = parseResponseSuggestions(response.content, email);

    return suggestions;
  } catch (error) {
    console.error("Response generation error:", error);

    // Fallback to template responses
    return generateTemplateResponses(email, context);
  }
}

/**
 * Build context section for prompt
 */
function buildContextSection(context?: ConversationContext): string {
  if (!context) return "";

  const sections: string[] = [];

  if (context.senderRelationship) {
    sections.push(`Afsender forhold: ${context.senderRelationship}`);
  }

  if (context.previousEmails && context.previousEmails.length > 0) {
    sections.push(`Tidligere emails i tråd: ${context.previousEmails.length}`);
  }

  if (context.threadHistory && context.threadHistory.length > 0) {
    const history = context.threadHistory.slice(0, 2).join("\n");
    sections.push(`Tidligere kommunikation:\n${history}`);
  }

  return sections.length > 0 ? `\nKontekst:\n${sections.join("\n")}\n` : "";
}

/**
 * Parse LLM response into ResponseSuggestion array
 */
function parseResponseSuggestions(
  content: string,
  email: EmailMessage
): ResponseSuggestion[] {
  try {
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Validate and transform each suggestion
    return parsed
      .map((item, index) => ({
        id: `${email.id}-suggestion-${index}`,
        type: validateType(item.type),
        text: item.text || "",
        tone: validateTone(item.tone),
        confidence: Math.min(Math.max(item.confidence || 0, 0), 1),
        reasoning: item.reasoning,
      }))
      .filter(s => s.text.length > 0);
  } catch (error) {
    console.error("Failed to parse response suggestions:", error);
    throw error;
  }
}

/**
 * Validate suggestion type
 */
function validateType(type: string): ResponseSuggestion["type"] {
  const validTypes: ResponseSuggestion["type"][] = [
    "quick_reply",
    "detailed",
    "forward",
    "schedule",
  ];
  return validTypes.includes(type as any)
    ? (type as ResponseSuggestion["type"])
    : "quick_reply";
}

/**
 * Validate tone
 */
function validateTone(tone: string): ResponseSuggestion["tone"] {
  const validTones: ResponseSuggestion["tone"][] = [
    "professional",
    "friendly",
    "formal",
  ];
  return validTones.includes(tone as any)
    ? (tone as ResponseSuggestion["tone"])
    : "professional";
}

/**
 * Generate template-based fallback responses
 */
function generateTemplateResponses(
  email: EmailMessage,
  context?: ConversationContext
): ResponseSuggestion[] {
  const senderName = extractSenderName(email.from);

  const suggestions: ResponseSuggestion[] = [
    {
      id: `${email.id}-template-quick`,
      type: "quick_reply",
      text: `Hej ${senderName},\n\nTak for din mail. Jeg har modtaget den og vender tilbage hurtigst muligt.\n\nVenlig hilsen`,
      tone: "professional",
      confidence: 0.7,
      reasoning: "Standard bekræftelse",
    },
    {
      id: `${email.id}-template-detailed`,
      type: "detailed",
      text: `Hej ${senderName},\n\nTak for din henvendelse vedrørende "${email.subject}".\n\nJeg har noteret dine punkter og vil gennemgå dem grundigt. Jeg vender tilbage med et detaljeret svar inden for 24 timer.\n\nHvis du har yderligere spørgsmål i mellemtiden, er du velkommen til at kontakte mig.\n\nVenlig hilsen`,
      tone: "professional",
      confidence: 0.75,
      reasoning: "Detaljeret bekræftelse med forventning",
    },
  ];

  // Add context-specific suggestion if VIP
  if (context?.senderRelationship === "vip") {
    suggestions.push({
      id: `${email.id}-template-vip`,
      type: "detailed",
      text: `Kære ${senderName},\n\nTak for din mail. Jeg prioriterer din henvendelse og vil sørge for at give dig et fyldestgørende svar snarest muligt.\n\nJeg kontakter dig direkte senere i dag.\n\nMed venlig hilsen`,
      tone: "formal",
      confidence: 0.8,
      reasoning: "VIP prioriteret respons",
    });
  }

  return suggestions;
}

/**
 * Extract sender name from email address
 */
function extractSenderName(from: string): string {
  // Try to extract name from "Name <email>" format
  const nameMatch = from.match(/^([^<]+)</);
  if (nameMatch && nameMatch[1].trim()) {
    return nameMatch[1].trim();
  }

  // Extract from email address (before @)
  const emailMatch = from.match(/([^@<]+)/);
  if (emailMatch && emailMatch[1]) {
    // Capitalize first letter
    const name = emailMatch[1].trim();
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return "der";
}

/**
 * Generate quick reply suggestions (very short)
 */
export async function generateQuickReplies(
  email: EmailMessage,
  userId: number
): Promise<string[]> {
  const quickReplies = [
    "Tak for din mail!",
    "Modtaget - vender tilbage snarest.",
    "Tak! Jeg kigger på det.",
    "Perfekt, tak!",
    "Det lyder godt!",
  ];

  // Could enhance with LLM for context-specific quick replies
  return quickReplies.slice(0, 3);
}

/**
 * Batch generate responses for multiple emails
 */
export async function generateBatchResponses(
  emails: EmailMessage[],
  userId: number,
  contexts?: Map<string, ConversationContext>
): Promise<Map<string, ResponseSuggestion[]>> {
  const results = new Map<string, ResponseSuggestion[]>();

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 2;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(email =>
        generateResponseSuggestions(
          email,
          userId,
          contexts?.get(email.id)
        ).catch(error => {
          console.error(`Failed to generate responses for ${email.id}:`, error);
          return generateTemplateResponses(email, contexts?.get(email.id));
        })
      )
    );

    batch.forEach((email, index) => {
      results.set(email.id, batchResults[index]);
    });
  }

  return results;
}

/**
 * Score response quality (for learning/improvement)
 */
export function scoreResponseQuality(
  suggestion: ResponseSuggestion,
  actualResponse?: string
): number {
  if (!actualResponse) return suggestion.confidence;

  // Simple similarity score
  const suggestionWords = new Set(suggestion.text.toLowerCase().split(/\s+/));
  const actualWords = actualResponse.toLowerCase().split(/\s+/);

  let matches = 0;
  for (const word of actualWords) {
    if (suggestionWords.has(word)) matches++;
  }

  const similarity = matches / Math.max(actualWords.length, 1);

  // Combine with original confidence
  return (suggestion.confidence + similarity) / 2;
}
