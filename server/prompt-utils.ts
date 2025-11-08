/**
 * Prompt Utilities
 * Helper functions for better AI prompts based on test learnings
 */

/**
 * Extract JSON from AI response (handles various formats)
 */
export function extractJSON(content: string): any | null {
  if (!content || content.trim().length === 0) {
    return null;
  }

  // Try direct JSON parse first
  try {
    return JSON.parse(content);
  } catch {
    // Continue to extraction methods
  }

  // Try to find JSON object
  let jsonMatch = content.match(/\{[\s\S]*?\}/);
  
  if (!jsonMatch) {
    // Try to find JSON in code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonMatch = [codeBlockMatch[1]];
    }
  }

  if (!jsonMatch) {
    // Try to find JSON array
    jsonMatch = content.match(/\[[\s\S]*?\]/);
  }

  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

/**
 * Create intent detection prompt (optimized for JSON output)
 */
export function createIntentPrompt(): string {
  return `You are an intent classifier. Analyze the user message and identify the intent.

Return ONLY valid JSON in this exact format:
{"intent": "intent_name", "confidence": 0.95, "params": {"key": "value"}}

Intents:
- create_lead: Create new lead (extract: name, email, phone)
- book_meeting: Book calendar meeting (extract: person, date, time)
- create_invoice: Create invoice (extract: customer, amount, description)
- check_calendar: Check calendar (extract: date)
- search_gmail: Search emails (extract: query)
- unknown: Unknown intent

Examples:
User: "Opret et lead for Hans, email hans@test.dk"
{"intent": "create_lead", "confidence": 0.95, "params": {"name": "Hans", "email": "hans@test.dk"}}

User: "Book møde med Peter onsdag kl 14"
{"intent": "book_meeting", "confidence": 0.99, "params": {"person": "Peter", "date": "Wednesday", "time": "14:00"}}`;
}

/**
 * Create email summary prompt (optimized for Danish summaries)
 */
export function createEmailSummaryPrompt(subject: string, body: string): string {
  // Truncate body to avoid token limits
  const truncatedBody = body.substring(0, 1500);
  
  return `Lav en kort dansk sammenfatning af denne email (max 150 tegn):

Emne: ${subject}
${truncatedBody}

Sammenfatning (kun tekst, max 150 tegn):`;
}

/**
 * Create label suggestion prompt (optimized for JSON output)
 */
export function createLabelPrompt(from: string, subject: string, body: string): string {
  const truncatedBody = body.substring(0, 500);
  
  return `Analyser denne email og find det bedste label:

Labels: Lead (ny kunde), Booking (aftale), Finance (faktura/betaling), Support (problem), Newsletter

Email:
Fra: ${from}
Emne: ${subject}
${truncatedBody}

Svar KUN med JSON:
[{"label": "Lead", "confidence": 90, "reasoning": "kort begrundelse"}]`;
}

/**
 * Recommended model settings for different tasks
 */
export const MODEL_SETTINGS = {
  // For JSON/structured output - use GPT-OSS
  JSON_OUTPUT: {
    model: 'openai/gpt-oss-20b:free',
    temperature: 0.1,
    max_tokens: 300,
    reasoning: 'GPT-OSS is 75% better at JSON than GLM (tested)'
  },
  
  // For natural Danish conversation - use GLM
  CONVERSATION: {
    model: 'z-ai/glm-4.5-air:free',
    temperature: 0.7,
    max_tokens: 2000,
    reasoning: 'GLM has excellent Danish quality (100% success rate)'
  },
  
  // For fast analysis - use GPT-OSS
  FAST_ANALYSIS: {
    model: 'openai/gpt-oss-20b:free',
    temperature: 0.7,
    max_tokens: 1000,
    reasoning: 'GPT-OSS is 7.5x faster (2.6s vs 19s)'
  },
  
  // For email summaries - use GLM for quality
  EMAIL_SUMMARY: {
    model: 'z-ai/glm-4.5-air:free',
    temperature: 0.7,
    max_tokens: 150,
    reasoning: 'GLM provides best Danish quality for professional writing'
  }
} as const;

/**
 * Retry wrapper for AI calls
 */
export async function retryAICall<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}
