/**
 * V4.3.5: AI-Enhanced Calendar Event Parser
 *
 * Uses LLM to intelligently parse Calendar event descriptions
 * and extract structured customer, service, and quality data
 */

import { resolve } from "path";

import { config } from "dotenv";
import OpenAI from "openai";

config({ path: resolve(process.cwd(), ".env.dev") });

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://rendetalje.dk",
    "X-Title": "RenDetalje Calendar Parser",
  },
});

// ============================================================================
// TYPES
// ============================================================================

export interface AICalendarParsing {
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    propertySize: number | null; // m²
    propertyType: string | null; // 'hus', 'lejlighed', 'rækkehus'
  };
  service: {
    type: string | null; // 'fast', 'flytter', 'hoved', 'post-renovering'
    category: string | null; // 'privatrengøring', 'erhvervsrengøring'
    frequency: string | null; // 'weekly', 'biweekly', 'triweekly', 'monthly', 'one-time'
    estimatedHours: number | null;
    estimatedPrice: number | null;
    actualHours: number | null;
    actualPrice: number | null;
    numberOfWorkers: number | null;
  };
  specialRequirements: string[]; // e.g., ['sæbespåner', 'egen nøgle', 'kalk']
  qualitySignals: {
    isRepeatBooking: boolean;
    bookingNumber: number | null; // #1, #2, etc.
    hasComplaints: boolean;
    hasSpecialNeeds: boolean;
    customerType: "standard" | "premium" | "problematic" | "unknown";
    confidence: "high" | "medium" | "low";
  };
  notes: string | null; // Important context not captured elsewhere
}

// ============================================================================
// AI PARSING
// ============================================================================

export async function parseCalendarEventWithAI(
  summary: string,
  description: string
): Promise<AICalendarParsing> {
  const prompt = `Du er en ekspert i at parse danske rengøringsbookinger fra kalenderbeskrivelser.

KALENDERTITEL: "${summary}"

BESKRIVELSE:
${description}

Parse venligst følgende strukturerede information fra teksten ovenfor. Returner VALID JSON uden markdown formatting:

{
  "customer": {
    "name": "Fulde navn",
    "email": "email adresse",
    "phone": "telefonnummer",
    "address": "fuld adresse",
    "propertySize": antal m² som number,
    "propertyType": "hus" | "lejlighed" | "rækkehus" | "erhverv" | null
  },
  "service": {
    "type": "fast" | "flytter" | "hoved" | "post-renovering" | "introduktion" | null,
    "category": "privatrengøring" | "erhvervsrengøring",
    "frequency": "weekly" | "biweekly" | "triweekly" | "monthly" | "one-time",
    "estimatedHours": antal timer estimeret,
    "estimatedPrice": pris i kr,
    "actualHours": faktiske timer hvis nævnt,
    "actualPrice": faktisk pris hvis nævnt,
    "numberOfWorkers": antal medarbejdere
  },
  "specialRequirements": ["array", "af", "specielle", "krav"],
  "qualitySignals": {
    "isRepeatBooking": true hvis #2, #3 osv,
    "bookingNumber": nummer fra #X,
    "hasComplaints": true hvis klager nævnt,
    "hasSpecialNeeds": true hvis særlige behov,
    "customerType": "standard" | "premium" | "problematic" | "unknown",
    "confidence": "high" | "medium" | "low"
  },
  "notes": "Vigtig kontekst der ikke passer andre steder"
}

REGLER:
- Returner ALTID valid JSON
- Brug null hvis information ikke findes
- Udled customerType baseret på kvalitetssignaler
- Sæt confidence baseret på hvor meget info der er
- Parse telefonnumre uden spaces: "26 36 53 52" → "26365352"
- Extract m² fra "118 m²" → 118
- Identificer booking nummer fra titler som "#7", "#2" osv.`;

  try {
    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenRouter");
    }

    const parsed = JSON.parse(content);
    return parsed as AICalendarParsing;
  } catch (error: any) {
    console.error("❌ AI parsing error:", error.message);

    // Return minimal fallback structure
    return {
      customer: {
        name: null,
        email: null,
        phone: null,
        address: null,
        propertySize: null,
        propertyType: null,
      },
      service: {
        type: null,
        category: null,
        frequency: null,
        estimatedHours: null,
        estimatedPrice: null,
        actualHours: null,
        actualPrice: null,
        numberOfWorkers: null,
      },
      specialRequirements: [],
      qualitySignals: {
        isRepeatBooking: false,
        bookingNumber: null,
        hasComplaints: false,
        hasSpecialNeeds: false,
        customerType: "unknown",
        confidence: "low",
      },
      notes: null,
    };
  }
}

// ============================================================================
// BATCH PARSING
// ============================================================================

export async function parseCalendarEventsBatch(
  events: Array<{ summary: string; description: string }>,
  options: {
    batchSize?: number;
    delayMs?: number;
  } = {}
): Promise<AICalendarParsing[]> {
  const { batchSize = 5, delayMs = 1000 } = options;
  const results: AICalendarParsing[] = [];

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);

    console.log(
      `   Processing events ${i + 1}-${Math.min(i + batchSize, events.length)} of ${events.length}...`
    );

    const batchResults = await Promise.all(
      batch.map(evt => parseCalendarEventWithAI(evt.summary, evt.description))
    );

    results.push(...batchResults);

    // Delay between batches to avoid rate limits
    if (i + batchSize < events.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
