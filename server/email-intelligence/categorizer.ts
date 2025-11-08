/**
 * Email Categorizer - AI-powered email classification
 * Uses LLM to automatically categorize emails for better organization
 */

import { routeAI } from "../ai-router";
import { generateCorrelationId } from "../action-audit";

export interface EmailCategory {
  category: 'work' | 'personal' | 'finance' | 'marketing' | 'important' | 'other';
  confidence: number; // 0-1
  subcategory?: string;
  reasoning?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
}

const CATEGORIZATION_PROMPT = `Du er en email klassificerings-ekspert. Analyser følgende email og bestem dens kategori.

Email Information:
Fra: {from}
Til: {to}
Emne: {subject}
Indhold: {body}

Kategorier:
- work: Arbejdsrelateret (projekter, møder, opgaver)
- personal: Personligt (venner, familie, private sager)
- finance: Økonomi (fakturaer, betalinger, bank)
- marketing: Marketing/reklame (nyhedsbreve, tilbud)
- important: Vigtig/urgent (kræver hurtig handling)
- other: Andet

Svar KUN med valid JSON i dette format:
{
  "category": "work",
  "confidence": 0.95,
  "subcategory": "project_update",
  "reasoning": "Email handler om projektopdatering fra teammedlem"
}`;

/**
 * Categorize an email using AI
 */
export async function categorizeEmail(
  email: EmailMessage,
  userId: number
): Promise<EmailCategory> {
  try {
    // Truncate long content for LLM efficiency
    const truncatedBody = email.body.length > 2000 
      ? email.body.substring(0, 2000) + '...'
      : email.body;

    // Build prompt with email data
    const prompt = CATEGORIZATION_PROMPT
      .replace('{from}', email.from)
      .replace('{to}', email.to)
      .replace('{subject}', email.subject)
      .replace('{body}', truncatedBody);

    // Call LLM
    const response = await routeAI({
      messages: [{ role: 'user', content: prompt }],
      taskType: 'chat',
      userId,
      requireApproval: false,
      correlationId: generateCorrelationId(),
      tools: [], // No tools needed for categorization
    });

    // Parse LLM response
    const result = parseCategorizationResponse(response.content);
    
    return result;
  } catch (error) {
    console.error('Email categorization error:', error);
    
    // Fallback to basic categorization
    return basicCategorization(email);
  }
}

/**
 * Parse LLM response into EmailCategory
 */
function parseCategorizationResponse(content: string): EmailCategory {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate category
    const validCategories = ['work', 'personal', 'finance', 'marketing', 'important', 'other'];
    if (!validCategories.includes(parsed.category)) {
      throw new Error('Invalid category');
    }

    return {
      category: parsed.category,
      confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
      subcategory: parsed.subcategory,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    throw new Error('Failed to parse categorization response');
  }
}

/**
 * Basic rule-based categorization as fallback
 */
function basicCategorization(email: EmailMessage): EmailCategory {
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();
  const from = email.from.toLowerCase();

  // Marketing patterns
  if (
    subject.includes('unsubscribe') ||
    subject.includes('nyhedsbrev') ||
    subject.includes('tilbud') ||
    body.includes('unsubscribe')
  ) {
    return {
      category: 'marketing',
      confidence: 0.7,
      subcategory: 'newsletter',
      reasoning: 'Contains marketing keywords',
    };
  }

  // Finance patterns
  if (
    subject.includes('faktura') ||
    subject.includes('invoice') ||
    subject.includes('betaling') ||
    subject.includes('payment') ||
    from.includes('bank') ||
    from.includes('payment')
  ) {
    return {
      category: 'finance',
      confidence: 0.75,
      subcategory: 'invoice',
      reasoning: 'Contains financial keywords',
    };
  }

  // Important patterns
  if (
    subject.includes('urgent') ||
    subject.includes('vigtig') ||
    subject.includes('deadline') ||
    subject.includes('asap')
  ) {
    return {
      category: 'important',
      confidence: 0.8,
      subcategory: 'urgent',
      reasoning: 'Contains urgency keywords',
    };
  }

  // Default to work
  return {
    category: 'work',
    confidence: 0.5,
    subcategory: 'general',
    reasoning: 'No specific patterns detected, defaulting to work',
  };
}

/**
 * Batch categorize multiple emails efficiently
 */
export async function categorizeEmailBatch(
  emails: EmailMessage[],
  userId: number
): Promise<Map<string, EmailCategory>> {
  const results = new Map<string, EmailCategory>();

  // Process in parallel but limit concurrency
  const BATCH_SIZE = 3;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(email => 
        categorizeEmail(email, userId).catch(error => {
          console.error(`Failed to categorize email ${email.id}:`, error);
          return basicCategorization(email);
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
 * Get category statistics for analytics
 */
export function getCategoryStats(categories: EmailCategory[]): {
  distribution: Record<string, number>;
  averageConfidence: number;
} {
  const distribution: Record<string, number> = {
    work: 0,
    personal: 0,
    finance: 0,
    marketing: 0,
    important: 0,
    other: 0,
  };

  let totalConfidence = 0;

  categories.forEach(cat => {
    distribution[cat.category]++;
    totalConfidence += cat.confidence;
  });

  return {
    distribution,
    averageConfidence: categories.length > 0 ? totalConfidence / categories.length : 0,
  };
}
