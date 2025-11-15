/**
 * Manual Model Testing Script
 * Test OpenRouter models directly
 */

const OPENROUTER_API_KEY =
  "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const models = [
  { id: "z-ai/glm-4.5-air:free", name: "GLM-4.5 Air (100% accuracy)" },
  { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B (100% accuracy)" },
  { id: "deepseek/deepseek-chat-v3.1:free", name: "DeepSeek Chat v3.1" },
];

const testPrompts = [
  {
    name: "Danish Business Email",
    prompt:
      'Skriv et kort professionelt svar på dansk til denne email: "Hej, jeg vil gerne have et tilbud på badværelsesrenovering. Hvornår kan I komme?" Svar på max 3 linjer.',
  },
  {
    name: "Calendar Reasoning",
    prompt:
      "Jeg skal have et 2-timers møde onsdag 10-16. Kalender viser: 10:00-11:30 optaget, 14:00-15:00 optaget. Hvornår kan mødet placeres? Giv 2 forslag på dansk.",
  },
];

async function testModel(modelId, modelName, prompt, promptName) {
  console.log(`\n🧪 Testing: ${modelName}`);
  console.log(`📝 Prompt: ${promptName}`);

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tekup.dk",
        "X-Title": "Friday AI Test",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      console.log(`❌ Error: ${data.error?.message || "Unknown error"}`);
      return {
        success: false,
        error: data.error?.message,
        duration,
      };
    }

    const output = data.choices[0]?.message?.content || "";
    const tokens = data.usage?.total_tokens || 0;

    console.log(`✅ Success (${duration}ms, ${tokens} tokens)`);
    console.log(
      `📤 Output: ${output.substring(0, 150)}${output.length > 150 ? "..." : ""}`
    );

    return {
      success: true,
      output,
      duration,
      tokens,
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

async function runTests() {
  console.log("🚀 Friday AI - Manual Model Testing");
  console.log("=====================================\n");

  const results = [];

  for (const model of models) {
    for (const test of testPrompts) {
      const result = await testModel(
        model.id,
        model.name,
        test.prompt,
        test.name
      );
      results.push({
        model: model.name,
        test: test.name,
        ...result,
      });

      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log("\n\n📊 Test Summary");
  console.log("=====================================");

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚡ Avg Response Time: ${Math.round(avgDuration)}ms`);

  console.log("\n🎯 Model Performance:");
  for (const model of models) {
    const modelResults = results.filter(r => r.model === model.name);
    const modelSuccesses = modelResults.filter(r => r.success).length;
    const modelAvgTime =
      modelResults.reduce((sum, r) => sum + r.duration, 0) /
      modelResults.length;

    console.log(`  ${model.name}:`);
    console.log(
      `    Success Rate: ${modelSuccesses}/${modelResults.length} (${Math.round((modelSuccesses / modelResults.length) * 100)}%)`
    );
    console.log(`    Avg Time: ${Math.round(modelAvgTime)}ms`);
  }
}

// Run tests
runTests().catch(console.error);
