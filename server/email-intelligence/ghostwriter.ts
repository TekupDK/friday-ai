/**
 * AI Ghostwriter - Learns user's writing style and generates replies
 */

import { and, desc, eq } from "drizzle-orm";

import {
  emailResponseFeedback,
  emails,
  InsertUserWritingStyle,
  userWritingStyles,
  type UserWritingStyle,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { routeAI } from "../ai-router";
import { generateCorrelationId } from "../action-audit";
import { logger } from "../_core/logger";

export interface WritingStylePatterns {
  tone: string; // "professional", "friendly", "formal", etc.
  averageLength: number;
  formalityLevel: string; // "formal", "semi-formal", "casual"
  commonPhrases: string[];
  signature: string;
  openingPatterns: string[];
  closingPatterns: string[];
  language: string;
}

/**
 * Analyze sent emails to learn user's writing style
 */
export async function analyzeWritingStyle(
  userId: number,
  sampleSize: number = 20
): Promise<WritingStylePatterns | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get recent sent emails (emails where user is the sender)
  const userEmail = await getUserEmail(userId);
  if (!userEmail) {
    logger.warn({ userId }, "[Ghostwriter] Could not get user email");
    return null;
  }

  // Get sent emails from database
  // Look for emails where the user's email is in the 'to' field (meaning they received it)
  // and then check Gmail API for sent emails, or use a different approach
  // For now, we'll analyze all emails from the user's inbox to learn patterns
  // In production, you'd want to specifically get sent emails from Gmail API
  const sentEmails = await db
    .select({
      id: emails.id,
      subject: emails.subject,
      body: emails.text || emails.html,
      sentAt: emails.sentAt,
      fromEmail: emails.fromEmail,
    })
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        // Filter: emails where fromEmail contains user's email domain or is from user
        // This is a heuristic - in production, use Gmail API to get actual sent emails
      )
    )
    .orderBy(desc(emails.receivedAt))
    .limit(sampleSize)
    .execute();

  // Filter to only include emails that might be from user (heuristic)
  // In production, use Gmail API labels like "SENT" to get actual sent emails
  const userDomain = userEmail.split("@")[1];
  const likelySentEmails = sentEmails.filter(
    (e) =>
      e.fromEmail?.includes(userDomain) ||
      e.fromEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  // Use likely sent emails if available, otherwise use all emails as fallback
  const emailsToAnalyze = likelySentEmails.length > 0 ? likelySentEmails : sentEmails;

  if (emailsToAnalyze.length === 0) {
    logger.info({ userId }, "[Ghostwriter] No emails found for analysis");
    return null;
  }

  // Analyze emails using AI
  const analysisPrompt = `Analyser følgende emails for at lære skrivestil. Identificer:

1. Tone (professional, friendly, formal, casual)
2. Gennemsnitlig længde
3. Formelhedsniveau (formal, semi-formal, casual)
4. Almindelige fraser og udtryk
5. Signatur mønstre
6. Åbningsfraser
7. Afslutningsfraser
8. Sprog (da, en, etc.)

Emails:
${emailsToAnalyze
  .slice(0, 10)
  .map(
    (e, i) =>
      `Email ${i + 1}:\nEmne: ${e.subject || "Ingen"}\nIndhold: ${(e.body || "").substring(0, 500)}`
  )
  .join("\n\n")}

Returner JSON:
{
  "tone": "professional",
  "averageLength": 250,
  "formalityLevel": "semi-formal",
  "commonPhrases": ["Tak for din mail", "Venlig hilsen"],
  "signature": "Med venlig hilsen\n[Navn]",
  "openingPatterns": ["Hej", "Kære"],
  "closingPatterns": ["Venlig hilsen", "Med venlig hilsen"],
  "language": "da"
}`;

  try {
    const response = await routeAI({
      messages: [{ role: "user", content: analysisPrompt }],
      taskType: "chat",
      userId,
      requireApproval: false,
      correlationId: generateCorrelationId(),
      tools: [],
    });

    if (!response || !response.content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const styleData = JSON.parse(jsonMatch[0]) as WritingStylePatterns;

    // Calculate average length from actual emails
    const totalLength = emailsToAnalyze.reduce(
      (sum, e) => sum + (e.body?.length || 0),
      0
    );
    styleData.averageLength = Math.round(totalLength / emailsToAnalyze.length);

    // Save to database
    await saveWritingStyle(userId, styleData, emailsToAnalyze.length);

    logger.info(
      { userId, sampleSize: emailsToAnalyze.length },
      "[Ghostwriter] Analyzed writing style"
    );

    return styleData;
  } catch (error) {
    logger.error(
      { err: error, userId },
      "[Ghostwriter] Error analyzing writing style"
    );
    return null;
  }
}

/**
 * Save writing style to database
 */
async function saveWritingStyle(
  userId: number,
  style: WritingStylePatterns,
  sampleCount: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const styleData: InsertUserWritingStyle = {
    userId,
    tone: style.tone,
    averageLength: style.averageLength,
    formalityLevel: style.formalityLevel,
    commonPhrases: style.commonPhrases,
    signature: style.signature,
    openingPatterns: style.openingPatterns,
    closingPatterns: style.closingPatterns,
    language: style.language || "da",
    sampleCount,
    lastAnalyzedAt: new Date().toISOString(),
  };

  // Upsert (update if exists, insert if not)
  await db
    .insert(userWritingStyles)
    .values(styleData)
    .onConflictDoUpdate({
      target: userWritingStyles.userId,
      set: {
        ...styleData,
        updatedAt: new Date().toISOString(),
      },
    })
    .execute();
}

/**
 * Get user's writing style from database
 */
export async function getWritingStyle(
  userId: number
): Promise<UserWritingStyle | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [style] = await db
    .select()
    .from(userWritingStyles)
    .where(eq(userWritingStyles.userId, userId))
    .limit(1)
    .execute();

  return style || null;
}

/**
 * Generate reply using learned writing style
 */
export async function generateGhostwriterReply(
  userId: number,
  email: {
    threadId: string;
    subject: string;
    from: string;
    body: string;
    previousMessages?: string[];
  }
): Promise<string> {
  // Get user's writing style
  let style = await getWritingStyle(userId);

  // If no style exists, analyze it first
  if (!style) {
    logger.info({ userId }, "[Ghostwriter] No style found, analyzing...");
    const analyzedStyle = await analyzeWritingStyle(userId);
    if (analyzedStyle) {
      style = await getWritingStyle(userId);
    }
  }

  // Build prompt with style information
  const styleContext = style
    ? `
Brugerens skrivestil:
- Tone: ${style.tone}
- Formelhed: ${style.formalityLevel}
- Gennemsnitlig længde: ${style.averageLength} tegn
- Almindelige fraser: ${(style.commonPhrases as string[] || []).join(", ")}
- Åbningsfraser: ${(style.openingPatterns as string[] || []).join(", ")}
- Afslutningsfraser: ${(style.closingPatterns as string[] || []).join(", ")}
- Signatur: ${style.signature || "Ingen"}
- Sprog: ${style.language || "da"}

VIGTIGT: Skriv svaret i brugerens stil - brug samme tone, formelhed, og fraser.
`
    : "";

  const prompt = `Du er en email assistent der genererer svar i brugerens personlige skrivestil.

${styleContext}

Email at svare på:
Emne: ${email.subject}
Fra: ${email.from}
Indhold: ${email.body.substring(0, 1500)}

${email.previousMessages && email.previousMessages.length > 0
  ? `Tidligere beskeder i tråden:\n${email.previousMessages
      .slice(-3)
      .join("\n---\n")}`
  : ""}

Generer et svar der:
1. Matcher brugerens skrivestil præcist
2. Er passende i længde (${style?.averageLength || 200} tegn er typisk)
3. Bruger brugerens almindelige fraser og udtryk
4. Har samme tone og formelhed
5. Inkluderer relevant signatur hvis brugeren typisk bruger en

Svar KUN med selve email-svaret, ingen ekstra forklaringer.`;

  try {
    const response = await routeAI({
      messages: [{ role: "user", content: prompt }],
      taskType: "chat",
      userId,
      requireApproval: false,
      correlationId: generateCorrelationId(),
      tools: [],
    });

    if (!response || !response.content) {
      throw new Error("No response from AI");
    }

    return response.content.trim();
  } catch (error) {
    logger.error(
      { err: error, userId, threadId: email.threadId },
      "[Ghostwriter] Error generating reply"
    );
    throw error;
  }
}

/**
 * Learn from user's edits to AI suggestions
 */
export async function learnFromFeedback(
  userId: number,
  feedback: {
    originalSuggestion: string;
    editedResponse: string;
    threadId: string;
    suggestionId?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Analyze differences between original and edited
  const changes = analyzeChanges(
    feedback.originalSuggestion,
    feedback.editedResponse
  );

  // Save feedback
  await db.insert(emailResponseFeedback).values({
    userId,
    originalSuggestionId: feedback.suggestionId,
    threadId: feedback.threadId,
    originalSuggestion: feedback.originalSuggestion,
    editedResponse: feedback.editedResponse,
    changes,
    feedbackType: "edited",
    learningPoints: extractLearningPoints(changes),
  });

  // If significant changes, trigger style re-analysis
  if (changes.added.length > 0 || changes.removed.length > 0) {
    logger.info(
      { userId, changesCount: changes.added.length + changes.removed.length },
      "[Ghostwriter] Significant changes detected, may trigger re-analysis"
    );

    // Re-analyze style after accumulating enough feedback (every 10 feedbacks)
    const feedbackCount = await db
      .select()
      .from(emailResponseFeedback)
      .where(eq(emailResponseFeedback.userId, userId))
      .execute();

    if (feedbackCount.length % 10 === 0) {
      logger.info(
        { userId, feedbackCount: feedbackCount.length },
        "[Ghostwriter] Triggering style re-analysis"
      );
      await analyzeWritingStyle(userId);
    }
  }
}

/**
 * Analyze changes between original and edited text
 */
function analyzeChanges(
  original: string,
  edited: string
): {
  added: string[];
  removed: string[];
  modified: Array<{ from: string; to: string }>;
} {
  // Simple word-level diff (could be enhanced with proper diff algorithm)
  const originalWords = original.toLowerCase().split(/\s+/);
  const editedWords = edited.toLowerCase().split(/\s+/);

  const added: string[] = [];
  const removed: string[] = [];
  const modified: Array<{ from: string; to: string }> = [];

  // Simple comparison (in production, use a proper diff library)
  const originalSet = new Set(originalWords);
  const editedSet = new Set(editedWords);

  for (const word of editedWords) {
    if (!originalSet.has(word)) {
      added.push(word);
    }
  }

  for (const word of originalWords) {
    if (!editedSet.has(word)) {
      removed.push(word);
    }
  }

  return { added, removed, modified };
}

/**
 * Extract learning points from changes
 */
function extractLearningPoints(changes: {
  added: string[];
  removed: string[];
  modified: Array<{ from: string; to: string }>;
}): Record<string, unknown> {
  return {
    preferredPhrases: changes.added.slice(0, 10), // Top 10 added phrases
    avoidedPhrases: changes.removed.slice(0, 10), // Top 10 removed phrases
    changeCount: changes.added.length + changes.removed.length,
  };
}

/**
 * Get user's email address (helper)
 */
async function getUserEmail(userId: number): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const { users } = await import("../../drizzle/schema");
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    return user?.email || null;
  } catch (error) {
    logger.warn({ err: error, userId }, "[Ghostwriter] Could not get user email");
    return null;
  }
}
