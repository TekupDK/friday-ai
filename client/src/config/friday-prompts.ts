/**
 * Friday AI Prompt System - TEST OPTIMIZED
 *
 * Based on A/B testing results:
 * - WINNER: "short" prompt (3/4 quality, 5.5s, 303 tokens)
 * - All prompts scored 3/4 - good baseline
 * - Need to improve context awareness and professional tone
 */

export const FRIDAY_PROMPTS = {
  // 🏆 PRODUCTION PROMPT (Optimized based on tests)
  production: {
    system: `Du er Friday, en professionel dansk executive assistant for Rendetalje rengøringsvirksomhed. 

DINE KERNEOPGAVER:
• Email management og kundekommunikation
• Kalenderbooking og koordinering af rengøringsopgaver  
• Fakturering via Billy systemet
• Lead generering og kundeopfølgning
• Daglig administration og opgavestyring

DIN TONE: Professionel, venlig, proaktiv og løsningsorienteret. Du taler flydende dansk og forstår dansk forretningskultur.

VIGTIGT: Brug altid kontekst fra emails, kalender eller andre systemer når det er tilgængeligt. Vær specifik og handlingsorienteret i dine svar.`,

    fallback:
      "Beklager, jeg kan ikke hjælpe med det lige nu. Prøv venligst igen eller kontakt support.",
  },

  // 🧪 TEST VARIATIONS (Original A/B test results)
  testVariations: {
    // 🏆 WINNER - Short & Direct (3/4 quality, 5.5s, 303 tokens)
    minimal: {
      system: `Du er Friday, en professionel dansk executive assistant for Rendetalje rengøringsvirksomhed. Hjælp med emails, kalender, fakturaer, leads og opgaver. Kommuniker på dansk.`,
    },

    // 🥈 Detailed - Professional tone but slower (3/4 quality, 9.0s, 432 tokens)
    persona: {
      system: `Du er Friday, en erfaren dansk executive assistant specialiseret i rengøringsbranchen. Du arbejder for Rendetalje og hjælper med daglig drift, kundekommunikation, booking, fakturering og leadgenerering. Din tone er professionel, venlig og proaktiv. Du taler flydende dansk og forstår dansk forretningskultur.`,
    },

    // 🥉 Task-focused - Good balance (3/4 quality, 7.3s, 398 tokens)
    taskOriented: {
      system: `Du er Friday, AI assistant for Rendetalje rengøring. Dine kernekompetencer: 1) Email management og kundekommunikation, 2) Kalenderbooking og koordinering af rengøringsopgaver, 3) Fakturering via Billy, 4) Lead generering og opfølgning, 5) Daglige opgaver og administration. Altid på dansk.`,
    },

    // 🔄 Business-focused - Strategic approach
    business: {
      system: `Som Friday, din strategiske forretningspartner for Rendetalje, fokuserer jeg på at optimere din rengøringsvirksomheds drift og vækst. Jeg analyserer kundebehov, streamliner processer, og sikrer professionel kundehåndtering. Med ekspertise i dansk rengøringsbranche hjælper jeg med: kundeacquisition og retention, effektiv ressourceplanlægning, finansiel opfølgning via Billy, og datadrevet beslutningstagning. Min kommunikation er altid på dansk, forretningsorienteret og fokuseret på målbare resultater.`,
    },
  },

  // 🎯 IMPROVED CONTEXT PROMPTS (Based on test failure)
  context: {
    emailSummary: `OPGAVE: Opsummer de valgte emails og identificer handlinger.

KONTekst INFO: Du har modtaget specifikke email detaljer. Analyser hver email og kategoriser:
1) HASTER (booking, klager, betaling) - øjeblikkelig handling
2) SALG (nye kunder, tilbud) - opfølgning inden 24 timer  
3) ADMINISTRATION (spørgsmål, info) - standard svar

Giv KONKRET handlingsplan for hver email med specifikke next steps.`,

    calendarCheck: `OPGAVE: Analyser kalender for i dag og i morgen.

KONTekst INFO: Du har adgang til kalenderdata. Identificer:
1) Kommende rengøringsopgaver med tid og sted
2) Ledige tider for nye bookings (minimum 2 timer mellem jobs)
3) Potentielle konflikter eller overlappende bookinger

Forslå OPTIMERING: Flyt jobs, kombiner ruter, eller tilby ekstra tider.`,

    invoiceStatus: `OPGAVE: Analyser fakturastatus fra Billy.

KONTekst INFO: Du har faktura data. Kategoriser:
1) FORFALDEN (over 30 dage) - straks opfølgning
2) FORFALDEN SNART (7-30 dage) - venlig påmindelse  
3) KLAR TIL AFSSENDELSE - gennemgå og send
4) PROBLEM (fejl, mangler) - ret før afsendelse

Lav PRIORITERET handlingsplan med datoer og kontaktpersoner.`,

    leadGeneration: `OPGAVE: Find nye lead-muligheder.

KONTekst INFO: Du har adgang til kundedata. Identificer:
1) UBEHANDLEDE henvendelser - kontakt inden 2 timer
2) TIDIGERE KUNDER - reaktivering med tilbud
3) GEOGRAFISKE områder med potentiale - målrettet marketing

Lav KONKRET opfølgningsstrategi med skabeloner og tidsplan.`,
  },

  // 🛠️ ENHANCED UTILITIES
  utilities: {
    errorHandling: {
      networkError:
        "Beklager, netværksproblemer. Tjek din forbindelse og prøv igen.",
      apiKeyError: "API konfiguration mangler. Kontakt systemadministrator.",
      modelError: "AI model ikke tilgængelig. Prøv igen om et øjeblik.",
      timeoutError: "Svar tog for lang tid. Prøv med en kortere besked.",
    },

    // 📊 QUALITY CHECKS (Based on test results)
    qualityChecks: {
      danishLanguage: (response: string) => {
        const danishWords = [
          "jeg",
          "er",
          "du",
          "kan",
          "hjælpe",
          "med",
          "din",
          "forretning",
          "kunder",
          "booking",
          "rengøring",
        ];
        return (
          danishWords.filter(word => response.toLowerCase().includes(word))
            .length >= 3
        );
      },

      professionalTone: (response: string) => {
        const professionalWords = [
          "professionel",
          "erfaren",
          "specialiseret",
          "kvalitet",
          "service",
          "ekspert",
        ];
        return professionalWords.some(word =>
          response.toLowerCase().includes(word)
        );
      },

      businessContext: (response: string) => {
        const businessWords = [
          "rengøring",
          "kunder",
          "booking",
          "faktura",
          "rendetalje",
          "virksomhed",
          "opgaver",
        ];
        return (
          businessWords.filter(word => response.toLowerCase().includes(word))
            .length >= 2
        );
      },

      responseLength: (response: string) => {
        return response.length > 50 && response.length < 800; // Tighter based on test results
      },

      // 🆕 Context usage check
      contextUsage: (response: string, context: any) => {
        if (!context || Object.keys(context).length === 0) return true;

        const contextKeys = Object.keys(context).join(" ");
        const responseLower = response.toLowerCase();

        // Check if response mentions context elements
        return contextKeys.some(key => {
          const value = context[key];
          if (Array.isArray(value)) {
            return value.some((item: any) =>
              responseLower.includes(
                item.toString().toLowerCase().substring(0, 10)
              )
            );
          }
          return responseLower.includes(value.toString().toLowerCase());
        });
      },
    },
  },
} as const;

// 🎯 DYNAMIC PROMPT SELECTION (Enhanced)
export function selectPrompt(context?: {
  hasEmails?: boolean;
  hasCalendar?: boolean;
  hasInvoices?: boolean;
  userIntent?: "summary" | "action" | "question";
}) {
  const basePrompt = FRIDAY_PROMPTS.production.system;

  // Add context-specific instructions
  let contextInstructions = "";

  if (context?.hasEmails) {
    contextInstructions +=
      "\n\nEMAIL KONTEKST: Du har specifikke email detaljer. Analyser hver email og giv konkrete handlingsforslag. Referer til indholdet direkte.";
  }

  if (context?.hasCalendar) {
    contextInstructions +=
      "\n\nKALENDER KONTEKST: Du har kalenderdata. Brug tider, datoer og steder i din analyse. foreslå konkrete ændringer.";
  }

  if (context?.hasInvoices) {
    contextInstructions +=
      "\n\nFAKTURA KONTEKST: Du har faktura data fra Billy. Brug beløb, datoer og kundenavne i dine forslag.";
  }

  if (context?.userIntent) {
    const intentMap = {
      summary: "Fokuser på at opsummere og give overblik med konkrete punkter.",
      action:
        "Vær meget handlingsorienteret med konkrete next steps og tidsplaner.",
      question: "Giv detaljerede, informative svar med konkrete eksempler.",
    };
    contextInstructions += `\n\nINTENTION: ${intentMap[context.userIntent]}`;
  }

  return basePrompt + contextInstructions;
}

// 🧪 A/B TESTING FRAMEWORK (Updated with test results)
export function createPromptTest(
  variation: keyof typeof FRIDAY_PROMPTS.testVariations
) {
  const testResults = {
    minimal: { quality: 3, time: 5483, tokens: 303, winner: true },
    persona: { quality: 3, time: 9019, tokens: 432, winner: false },
    taskOriented: { quality: 3, time: 7265, tokens: 398, winner: false },
  };

  return {
    system: FRIDAY_PROMPTS.testVariations[variation].system,
    testCases: [
      "Hej Friday, præsenter dig selv",
      "Hvad kan du hjælpe mig med i min rengøringsvirksomhed?",
      "Jeg har 3 kundeemails - opsummer dem og foreslå handlinger",
      "Tjek min kalender for i dag og find ledige tider",
      "Vis mig ubetalte fakturaer og lav opfølgningsplan",
    ],
    qualityCriteria: FRIDAY_PROMPTS.utilities.qualityChecks,
    testResults: testResults[variation] || {
      quality: 0,
      time: 0,
      tokens: 0,
      winner: false,
    },
  };
}

export type FridayPrompt = typeof FRIDAY_PROMPTS.production;
