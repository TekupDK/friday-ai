/**
 * Friday AI Optimized Test - Encoding Fixed
 *
 * Test the improved prompts based on initial A/B test results
 * Focus on: Context awareness, professional tone, performance
 */

import { config } from "dotenv";

config({ path: ".env.dev" });

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// 🏆 WINNING PROMPT + IMPROVEMENTS
const OPTIMIZED_PROMPT = `Du er Friday, en professionel dansk executive assistant for Rendetalje rengøringsvirksomhed. 

DINE KERNEOPGAVER:
• Email management og kundekommunikation
• Kalenderbooking og koordinering af rengøringsopgaver  
• Fakturering via Billy systemet
• Lead generering og kundeopfølgning
• Daglig administration og opgavestyring

DIN TONE: Professionel, venlig, proaktiv og løsningsorienteret. Du taler flydende dansk og forstår dansk forretningskultur.

VIGTIGT: Brug altid kontekst fra emails, kalender eller andre systemer når det er tilgængeligt. Vær specifik og handlingsorienteret i dine svar.`;

async function testOptimizedPrompt() {
  console.log("🧪 Testing Optimized Friday AI Prompt");
  console.log("=====================================");

  if (!OPENROUTER_API_KEY) {
    throw new Error("❌ VITE_OPENROUTER_API_KEY not found");
  }

  const testCases = [
    {
      name: "Introduction Test",
      user: "Hej Friday, præsenter dig selv",
      context: {},
    },
    {
      name: "Business Context Test",
      user: "Hvad kan du hjælpe mig med i min rengøringsvirksomhed?",
      context: {},
    },
    {
      name: "🎯 Context Awareness Test",
      user: "Jeg har 3 kundeemails - opsummer dem og foreslå handlinger",
      context: {
        selectedEmails: [
          "Email 1: Jensen AS sporger om priser for kontorrengoring 200m2",
          "Email 2: Bioferm onsker booking af vinduespudsning pa fredag",
          "Email 3: Kunde klager over manglende rengoring i molerum",
        ],
      },
    },
    {
      name: "🎯 Calendar Context Test",
      user: "Tjek min kalender for i dag og find ledige tider",
      context: {
        calendarEvents: [
          "09:00-11:00: Kontorrengoring hos Jensen AS",
          "13:00-15:00: Hovedrengoring Bioferm",
          "16:00-17:00: Mode med nye kunde",
        ],
      },
    },
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.name}`);

    try {
      const startTime = Date.now();

      // Build context string (ASCII safe)
      const contextString =
        Object.keys(testCase.context).length > 0
          ? `

KONTEKST:
${Object.entries(testCase.context)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key.toUpperCase()}:
${value.join("\n")}`;
    }
    return `${key.toUpperCase()}: ${value}`;
  })
  .join("\n")}`
          : "";

      const fullSystemPrompt = OPTIMIZED_PROMPT + contextString;

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": `Friday AI Optimized Test - ${testCase.name}`,
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it:free",
          messages: [
            { role: "system", content: fullSystemPrompt },
            { role: "user", content: testCase.user },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "";
      const responseTime = Date.now() - startTime;

      // Quality checks
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
      const danishScore = danishWords.filter(word =>
        aiResponse.toLowerCase().includes(word)
      ).length;

      const professionalWords = [
        "professionel",
        "erfaren",
        "specialiseret",
        "kvalitet",
        "service",
        "ekspert",
      ];
      const professionalScore = professionalWords.some(word =>
        aiResponse.toLowerCase().includes(word)
      );

      const businessWords = [
        "rengøring",
        "kunder",
        "booking",
        "faktura",
        "rendetalje",
        "virksomhed",
        "opgaver",
      ];
      const businessScore = businessWords.filter(word =>
        aiResponse.toLowerCase().includes(word)
      ).length;

      // Context usage check
      const usesContext =
        Object.keys(testCase.context).length === 0 ||
        Object.values(testCase.context).some((value: any) => {
          if (Array.isArray(value)) {
            return value.some(item =>
              aiResponse
                .toLowerCase()
                .includes(item.toString().toLowerCase().substring(0, 8))
            );
          }
          return aiResponse
            .toLowerCase()
            .includes(value.toString().toLowerCase());
        });

      const qualityScore = [
        danishScore >= 3, // Danish
        professionalScore, // Professional
        businessScore >= 2, // Business
        aiResponse.length > 50 && aiResponse.length < 800, // Length
        usesContext, // Context usage
      ].filter(Boolean).length;

      console.log(
        `📝 Response (${responseTime}ms, ${data.usage?.total_tokens || 0} tokens):`
      );
      console.log(
        `"${aiResponse.substring(0, 250)}${aiResponse.length > 250 ? "..." : ""}"`
      );
      console.log(`📊 Quality Score: ${qualityScore}/5`);
      console.log(
        `🇩🇰 Danish: ${danishScore >= 3 ? "✅" : "❌"} (${danishScore} words)`
      );
      console.log(`💼 Professional: ${professionalScore ? "✅" : "❌"}`);
      console.log(
        `🏢 Business: ${businessScore >= 2 ? "✅" : "❌"} (${businessScore} terms)`
      );
      console.log(
        `📏 Length: ${aiResponse.length > 50 && aiResponse.length < 800 ? "✅" : "❌"} (${aiResponse.length} chars)`
      );
      console.log(`🎯 Context: ${usesContext ? "✅" : "❌"}`);

      results.push({
        name: testCase.name,
        qualityScore,
        responseTime,
        tokens: data.usage?.total_tokens || 0,
        usesContext,
        danishScore,
        professionalScore,
        businessScore,
      });
    } catch (error) {
      console.error(`❌ Test failed:`, error);
    }
  }

  // Summary
  console.log("\n📊 OPTIMIZED TEST RESULTS");
  console.log("==========================");

  const avgQuality =
    results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
  const avgResponseTime =
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const avgTokens =
    results.reduce((sum, r) => sum + r.tokens, 0) / results.length;
  const contextPassRate =
    results.filter(r => r.usesContext).length / results.length;

  console.log(`📈 Average Quality Score: ${avgQuality.toFixed(1)}/5`);
  console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`💰 Average Tokens: ${avgTokens.toFixed(0)}`);
  console.log(
    `🎯 Context Success Rate: ${(contextPassRate * 100).toFixed(0)}%`
  );

  // Comparison with original
  console.log("\n🔄 IMPROVEMENT VS ORIGINAL");
  console.log("============================");
  console.log(`Original Quality: 3.0/4 (75%)`);
  console.log(
    `Optimized Quality: ${avgQuality.toFixed(1)}/5 (${((avgQuality / 5) * 100).toFixed(0)}%)`
  );
  console.log(
    `Context Awareness: ${(contextPassRate * 100).toFixed(0)}% (was 0%)`
  );

  if (avgQuality >= 4 && contextPassRate >= 0.5) {
    console.log("\n🎉 OPTIMIZATION SUCCESSFUL!");
    console.log("✅ Ready for production deployment");

    console.log("\n🏆 PRODUCTION READY PROMPT:");
    console.log("=============================");
    console.log(OPTIMIZED_PROMPT);
  } else {
    console.log("\n⚠️  Further optimization needed");
  }
}

testOptimizedPrompt().catch(console.error);
