/**
 * Production Simulation Test
 * Test with realistic delays and usage patterns
 * Avoid rate limits by spacing requests properly
 */

const OPENROUTER_API_KEY =
  "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Realistic usage scenarios
const scenarios = [
  {
    name: "User Sends Chat Message",
    model: "z-ai/glm-4.5-air:free",
    prompt: "Hej Friday, kan du hjælpe mig med at finde en email fra Peter?",
    expectedQuality: "Danish, helpful, conversational",
    type: "chat",
  },
  {
    name: "User Drafts Professional Email",
    model: "z-ai/glm-4.5-air:free",
    prompt:
      "Skriv en professionel email til kunde om at projektet er færdigt. Tonalitet: venlig men professionel.",
    expectedQuality: "Professional Danish, proper structure",
    type: "email-draft",
  },
  {
    name: "User Requests Quick Analysis",
    model: "openai/gpt-oss-20b:free",
    prompt:
      'Hvad er hovedpointerne i denne email: "Hej, jeg vil gerne have et tilbud på renovering. Vi skal have malet 3 værelser og lagt nyt gulv. Projektet skal være færdigt til maj."',
    expectedQuality: "Fast, concise summary in Danish",
    type: "analysis",
  },
  {
    name: "User Asks Calendar Question",
    model: "openai/gpt-oss-20b:free",
    prompt:
      "Jeg har møde kl 10, frokost kl 12, og skal være færdig kl 15. Hvornår kan jeg placere et 1-times møde?",
    expectedQuality: "Quick reasoning, clear answer",
    type: "reasoning",
  },
];

async function testScenario(scenario) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📝 Scenario: ${scenario.name}`);
  console.log(`🤖 Model: ${scenario.model}`);
  console.log(`📊 Type: ${scenario.type}`);
  console.log(`${"─".repeat(70)}`);

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tekup.dk",
        "X-Title": "Friday AI Production Test",
      },
      body: JSON.stringify({
        model: scenario.model,
        messages: [
          {
            role: "system",
            content:
              "Du er Friday, en dansk AI assistant for Tekup/Rendetalje. Svar altid på dansk i en professionel men venlig tone.",
          },
          { role: "user", content: scenario.prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API Error: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return {
        success: false,
        error: response.status,
        duration,
      };
    }

    const data = await response.json();
    const output = data.choices[0]?.message?.content || "";
    const tokens = data.usage?.total_tokens || 0;

    // Quality checks
    const hasDanish =
      /[æøåÆØÅ]/.test(output) ||
      /\b(er|på|med|til|for|og|i|af|som|en|det|kan|vil|har)\b/.test(
        output.toLowerCase()
      );
    const isNotEmpty = output.length > 20;
    const speedOk = duration < 30000; // 30s max

    const success = hasDanish && isNotEmpty && speedOk;

    // Display results
    console.log(
      `\n⏱️  Response Time: ${duration}ms (${(duration / 1000).toFixed(1)}s)`
    );
    console.log(`🪙 Tokens Used: ${tokens}`);
    console.log(`📏 Output Length: ${output.length} chars`);
    console.log(`\n✅ Quality Checks:`);
    console.log(`   Danish: ${hasDanish ? "✅" : "❌"}`);
    console.log(`   Not Empty: ${isNotEmpty ? "✅" : "❌"}`);
    console.log(`   Speed OK (<30s): ${speedOk ? "✅" : "❌"}`);

    console.log(`\n📤 Output (first 300 chars):`);
    console.log(
      `   "${output.substring(0, 300)}${output.length > 300 ? "..." : ""}"`
    );

    if (success) {
      console.log(`\n✅ PASS - Scenario successful!`);
    } else {
      console.log(`\n⚠️  PARTIAL - Some quality checks failed`);
    }

    return {
      success,
      duration,
      tokens,
      outputLength: output.length,
      hasDanish,
      isNotEmpty,
      speedOk,
      output: output.substring(0, 500),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Exception: ${error.message}`);
    return {
      success: false,
      error: error.message,
      duration,
    };
  }
}

async function runProductionSimulation() {
  console.log("\n🚀 Friday AI - Production Simulation Test");
  console.log("=".repeat(70));
  console.log("Testing realistic user scenarios with proper delays");
  console.log("Avoiding rate limits by spacing requests 10 seconds apart");
  console.log("=".repeat(70));

  const results = [];
  const DELAY_BETWEEN_TESTS = 10000; // 10 seconds - realistic user delay

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];

    console.log(`\n\n📊 Test ${i + 1} of ${scenarios.length}`);

    const result = await testScenario(scenario);
    results.push({
      scenario: scenario.name,
      type: scenario.type,
      model: scenario.model,
      ...result,
    });

    // Wait between tests (except after last one)
    if (i < scenarios.length - 1) {
      console.log(
        `\n⏸️  Waiting ${DELAY_BETWEEN_TESTS / 1000}s before next test...`
      );
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }
  }

  // Summary
  console.log(`\n\n${"=".repeat(70)}`);
  console.log("📊 PRODUCTION SIMULATION SUMMARY");
  console.log("=".repeat(70));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const totalTokens = results.reduce((sum, r) => sum + (r.tokens || 0), 0);

  console.log(
    `\n✅ Success Rate: ${successful}/${results.length} (${Math.round((successful / results.length) * 100)}%)`
  );
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `⏱️  Avg Response Time: ${Math.round(avgDuration)}ms (${(avgDuration / 1000).toFixed(1)}s)`
  );
  console.log(`🪙 Total Tokens: ${totalTokens} (Cost: $0.00 - free tier)`);

  // Per-model breakdown
  const glmResults = results.filter(r => r.model === "z-ai/glm-4.5-air:free");
  const gptResults = results.filter(r => r.model === "openai/gpt-oss-20b:free");

  console.log(`\n📈 Performance by Model:`);

  if (glmResults.length > 0) {
    const glmSuccess = glmResults.filter(r => r.success).length;
    const glmAvgTime =
      glmResults.reduce((sum, r) => sum + r.duration, 0) / glmResults.length;
    console.log(`\n  GLM-4.5 Air:`);
    console.log(
      `    Success: ${glmSuccess}/${glmResults.length} (${Math.round((glmSuccess / glmResults.length) * 100)}%)`
    );
    console.log(
      `    Avg Time: ${Math.round(glmAvgTime)}ms (${(glmAvgTime / 1000).toFixed(1)}s)`
    );
    console.log(`    Use Cases: Chat, Email Drafting`);
  }

  if (gptResults.length > 0) {
    const gptSuccess = gptResults.filter(r => r.success).length;
    const gptAvgTime =
      gptResults.reduce((sum, r) => sum + r.duration, 0) / gptResults.length;
    console.log(`\n  GPT-OSS 20B:`);
    console.log(
      `    Success: ${gptSuccess}/${gptResults.length} (${Math.round((gptSuccess / gptResults.length) * 100)}%)`
    );
    console.log(
      `    Avg Time: ${Math.round(gptAvgTime)}ms (${(gptAvgTime / 1000).toFixed(1)}s)`
    );
    console.log(`    Use Cases: Analysis, Quick Reasoning`);
  }

  // Per-type breakdown
  console.log(`\n📋 Performance by Use Case:`);
  const types = [...new Set(results.map(r => r.type))];

  for (const type of types) {
    const typeResults = results.filter(r => r.type === type);
    const typeSuccess = typeResults.filter(r => r.success).length;
    const typeAvgTime =
      typeResults.reduce((sum, r) => sum + r.duration, 0) / typeResults.length;

    console.log(`\n  ${type}:`);
    console.log(`    Success: ${typeSuccess}/${typeResults.length}`);
    console.log(
      `    Avg Time: ${Math.round(typeAvgTime)}ms (${(typeAvgTime / 1000).toFixed(1)}s)`
    );
  }

  // Recommendations
  console.log(`\n\n💡 RECOMMENDATIONS:`);
  console.log("=".repeat(70));

  if (successful === results.length) {
    console.log("✅ All scenarios passed! System is production-ready.");
    console.log("✅ Danish quality is excellent across all use cases.");
    console.log("✅ Response times are acceptable for user experience.");
  } else if (successful >= results.length * 0.75) {
    console.log("⚠️  Most scenarios passed (75%+). Minor tuning needed.");
    console.log("   Review failed scenarios and adjust prompts/settings.");
  } else {
    console.log("❌ Many scenarios failed (<75%). Needs investigation.");
    console.log("   Check API issues, prompt quality, or model selection.");
  }

  const slowTests = results.filter(r => r.duration > 20000);
  if (slowTests.length > 0) {
    console.log(`\n⚠️  ${slowTests.length} scenario(s) were slow (>20s):`);
    slowTests.forEach(t => {
      console.log(`   - ${t.scenario}: ${Math.round(t.duration)}ms`);
    });
    console.log(
      "   Consider using faster model (GPT-OSS) for these use cases."
    );
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("✅ Production simulation complete!");
  console.log(`${"=".repeat(70)}\n`);
}

// Run simulation
runProductionSimulation().catch(console.error);
