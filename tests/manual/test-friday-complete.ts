/**
 * Friday AI Complete Test Suite
 *
 * Tests:
 * 1. OpenRouter API connection
 * 2. Gemma 3 27B Free model responses
 * 3. Prompt variations (A/B testing)
 * 4. Danish language quality
 * 5. Context awareness
 * 6. Error handling
 */

import { config } from "dotenv";

// Load environment
config({ path: ".env.dev" });

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Test prompts for A/B testing
const PROMPT_VARIATIONS = {
  // Version A: Short, direct
  short: {
    system: `Du er Friday, en professionel dansk executive assistant for Rendetalje rengøringsvirksomhed. Hjælp med emails, kalender, fakturaer, leads og opgaver. Kommuniker på dansk.`,
    test: "Hej Friday, hvad kan du hjælpe med i dag?",
  },

  // Version B: Detailed, persona-focused
  detailed: {
    system: `Du er Friday, en erfaren dansk executive assistant specialiseret i rengøringsbranchen. Du arbejder for Rendetalje og hjælper med daglig drift, kundekommunikation, booking, fakturering og leadgenerering. Din tone er professionel, venlig og proaktiv. Du taler flydende dansk og forstår dansk forretningskultur.`,
    test: "Hej Friday, præsenter dig selv og fortæl hvad du kan hjælpe med",
  },

  // Version C: Task-focused
  taskFocused: {
    system: `Du er Friday, AI assistant for Rendetalje rengøring. Dine kernekompetencer: 1) Email management og kundekommunikation, 2) Kalenderbooking og koordinering, 3) Fakturering via Billy, 4) Lead generering og opfølgning, 5) Daglige opgaver og administration. Altid på dansk.`,
    test: "Vis mig dine kernekompetencer og hvordan du kan hjælpe min forretning",
  },
};

// Test quality criteria
const QUALITY_CHECKS = {
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
      "faktura",
    ];
    const found = danishWords.filter(word =>
      response.toLowerCase().includes(word)
    );
    return found.length >= 3; // At least 3 Danish words
  },

  professionalTone: (response: string) => {
    const professionalWords = [
      "professionel",
      "erfaren",
      "specialiseret",
      "ekspert",
      "kvalitet",
      "service",
    ];
    const found = professionalWords.filter(word =>
      response.toLowerCase().includes(word)
    );
    return found.length >= 1;
  },

  businessContext: (response: string) => {
    const businessWords = [
      "rengøring",
      "kunder",
      "booking",
      "faktura",
      "rendetalje",
      "virksomhed",
    ];
    const found = businessWords.filter(word =>
      response.toLowerCase().includes(word)
    );
    return found.length >= 2;
  },

  responseLength: (response: string) => {
    return response.length > 50 && response.length < 1000; // Reasonable length
  },
};

async function testOpenRouterConnection() {
  console.log("\n🔍 Testing OpenRouter Connection...");

  if (!OPENROUTER_API_KEY) {
    throw new Error("❌ VITE_OPENROUTER_API_KEY not found in .env.dev");
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Friday AI Test",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: 'Test connection - respond with "OK"' },
          { role: "user", content: "Test" },
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ OpenRouter connection successful");
    console.log(`📊 Model: ${data.model || "google/gemma-3-27b-it:free"}`);
    console.log(`💰 Usage: ${JSON.stringify(data.usage || {})}`);

    return true;
  } catch (error) {
    console.error("❌ OpenRouter connection failed:", error);
    return false;
  }
}

async function testPromptVariation(
  name: string,
  variation: typeof PROMPT_VARIATIONS.short
) {
  console.log(`\n🧪 Testing Prompt Variation: ${name}`);

  try {
    const startTime = Date.now();

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": `Friday AI Test - ${name}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: variation.system },
          { role: "user", content: variation.test },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";
    const responseTime = Date.now() - startTime;

    // Quality checks
    const qualityResults = {
      danishLanguage: QUALITY_CHECKS.danishLanguage(aiResponse),
      professionalTone: QUALITY_CHECKS.professionalTone(aiResponse),
      businessContext: QUALITY_CHECKS.businessContext(aiResponse),
      responseLength: QUALITY_CHECKS.responseLength(aiResponse),
    };

    const score = Object.values(qualityResults).filter(Boolean).length;

    console.log(`📝 Response (${responseTime}ms):`);
    console.log(
      `"${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? "..." : ""}"`
    );
    console.log(`📊 Quality Score: ${score}/4`);
    console.log(`🇩🇰 Danish: ${qualityResults.danishLanguage ? "✅" : "❌"}`);
    console.log(
      `💼 Professional: ${qualityResults.professionalTone ? "✅" : "❌"}`
    );
    console.log(
      `🏢 Business Context: ${qualityResults.businessContext ? "✅" : "❌"}`
    );
    console.log(`📏 Length: ${qualityResults.responseLength ? "✅" : "❌"}`);

    return {
      name,
      response: aiResponse,
      responseTime,
      qualityScore: score,
      qualityResults,
      tokens: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error(`❌ Prompt variation ${name} failed:`, error);
    return null;
  }
}

async function testContextAwareness() {
  console.log("\n🎯 Testing Context Awareness...");

  const contextTest = {
    system: `Du er Friday, dansk executive assistant for Rendetalje. Brug den givne kontekst i dit svar.`,
    user: `Jeg har valgt 3 emails fra kunder. Opsummer dem og foreslå handlinger.`,
    context: {
      selectedEmails: [
        "email-1: Spørgsmål om priser for kontorrengøring",
        "email-2: Booking anmodning for næste uge",
        "email-3: Klage over sidste rengøring",
      ],
    },
  };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Friday AI Context Test",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "system",
            content: `${contextTest.system}\n\nKontekst:\n${contextTest.context.selectedEmails.join("\n")}`,
          },
          { role: "user", content: contextTest.user },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    const usesContext = contextTest.context.selectedEmails.some(email =>
      aiResponse.toLowerCase().includes(email.toLowerCase().substring(0, 10))
    );

    console.log(`📝 Context Response:`);
    console.log(
      `"${aiResponse.substring(0, 300)}${aiResponse.length > 300 ? "..." : ""}"`
    );
    console.log(`🎯 Context Used: ${usesContext ? "✅" : "❌"}`);

    return {
      response: aiResponse,
      usesContext,
      tokens: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("❌ Context test failed:", error);
    return null;
  }
}

async function runCompleteTestSuite() {
  console.log("🚀 Friday AI Complete Test Suite");
  console.log("=====================================");

  // Test 1: Connection
  const connectionOk = await testOpenRouterConnection();
  if (!connectionOk) {
    console.log("\n❌ Cannot continue - connection failed");
    return;
  }

  // Test 2: A/B Prompt Testing
  console.log("\n🧪 A/B Prompt Testing");
  console.log("=====================");

  const results = [];
  for (const [name, variation] of Object.entries(PROMPT_VARIATIONS)) {
    const result = await testPromptVariation(name, variation);
    if (result) results.push(result);
  }

  // Test 3: Context Awareness
  console.log("\n🎯 Context Awareness Testing");
  console.log("============================");
  const contextResult = await testContextAwareness();

  // Summary
  console.log("\n📊 TEST RESULTS SUMMARY");
  console.log("========================");

  results.forEach(result => {
    console.log(`${result.name}: ${result.qualityScore}/4 quality score`);
  });

  const bestPrompt = results.reduce((best, current) =>
    current.qualityScore > best.qualityScore ? current : best
  );

  console.log(`\n🏆 BEST PROMPT: ${bestPrompt.name}`);
  console.log(`Quality Score: ${bestPrompt.qualityScore}/4`);
  console.log(`Response Time: ${bestPrompt.responseTime}ms`);
  console.log(`Tokens Used: ${bestPrompt.tokens}`);

  if (contextResult) {
    console.log(
      `\n🎯 Context Awareness: ${contextResult.usesContext ? "✅ PASS" : "❌ FAIL"}`
    );
  }

  // Recommendations
  console.log("\n💡 RECOMMENDATIONS");
  console.log("==================");

  if (bestPrompt.qualityScore >= 3) {
    console.log(`✅ Use "${bestPrompt.name}" prompt for production`);
    console.log(
      `📝 System prompt: ${PROMPT_VARIATIONS[bestPrompt.name as keyof typeof PROMPT_VARIATIONS].system}`
    );
  } else {
    console.log("❌ All prompts need improvement - refine system prompts");
  }

  if (!contextResult?.usesContext) {
    console.log("⚠️  Context awareness needs improvement");
  }

  console.log("\n🎉 Test suite complete!");
}

// Run the test suite
runCompleteTestSuite().catch(console.error);

export { runCompleteTestSuite, PROMPT_VARIATIONS, QUALITY_CHECKS };
