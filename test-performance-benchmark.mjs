/**
 * Performance Benchmark Test
 * Measure response times, throughput, and consistency
 */

const OPENROUTER_API_KEY =
  "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Test configuration
const ITERATIONS = 10; // Number of requests per model
const DELAY_BETWEEN_REQUESTS = 3000; // 3 seconds to avoid rate limits

async function benchmarkModel(modelId, modelName, prompt) {
  const results = {
    modelId,
    modelName,
    prompt: prompt.substring(0, 50) + "...",
    iterations: ITERATIONS,
    times: [],
    tokens: [],
    errors: 0,
    successes: 0,
  };

  console.log(`\n${"=".repeat(70)}`);
  console.log(`📊 Benchmarking: ${modelName}`);
  console.log(`${"=".repeat(70)}`);
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`Delay: ${DELAY_BETWEEN_REQUESTS}ms between requests\n`);

  for (let i = 0; i < ITERATIONS; i++) {
    const iteration = i + 1;
    process.stdout.write(`  Request ${iteration}/${ITERATIONS}... `);

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://tekup.dk",
          "X-Title": "Friday AI Benchmark",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = endMemory - startMemory;

      if (!response.ok) {
        console.log(`❌ Failed (${response.status})`);
        results.errors++;
        continue;
      }

      const data = await response.json();
      const tokens = data.usage?.total_tokens || 0;

      results.times.push(duration);
      results.tokens.push(tokens);
      results.successes++;

      console.log(
        `✅ ${duration}ms (${tokens} tokens, ${(memoryDelta / 1024 / 1024).toFixed(2)}MB)`
      );

      // Delay before next request
      if (i < ITERATIONS - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Error after ${duration}ms: ${error.message}`);
      results.errors++;
    }
  }

  return results;
}

function analyzeResults(results) {
  if (results.times.length === 0) {
    return {
      ...results,
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      avgTokens: 0,
      throughput: 0,
      consistency: 0,
    };
  }

  const sortedTimes = [...results.times].sort((a, b) => a - b);
  const avgTime =
    results.times.reduce((sum, t) => sum + t, 0) / results.times.length;
  const minTime = Math.min(...results.times);
  const maxTime = Math.max(...results.times);
  const avgTokens =
    results.tokens.reduce((sum, t) => sum + t, 0) / results.tokens.length;

  // Percentiles
  const p50Index = Math.floor(sortedTimes.length * 0.5);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p99Index = Math.floor(sortedTimes.length * 0.99);

  const p50 = sortedTimes[p50Index];
  const p95 = sortedTimes[p95Index];
  const p99 = sortedTimes[p99Index];

  // Throughput (requests per minute)
  const throughput = 60000 / avgTime;

  // Consistency (lower stddev = more consistent)
  const variance =
    results.times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) /
    results.times.length;
  const stddev = Math.sqrt(variance);
  const consistency = ((1 - stddev / avgTime) * 100).toFixed(1); // % consistency

  return {
    ...results,
    avgTime: Math.round(avgTime),
    minTime: Math.round(minTime),
    maxTime: Math.round(maxTime),
    p50: Math.round(p50),
    p95: Math.round(p95),
    p99: Math.round(p99),
    avgTokens: Math.round(avgTokens),
    throughput: throughput.toFixed(1),
    stddev: Math.round(stddev),
    consistency: parseFloat(consistency),
  };
}

function printResults(analyzed) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📈 BENCHMARK RESULTS: ${analyzed.modelName}`);
  console.log(`${"=".repeat(70)}`);
  console.log(
    `\n✅ Success Rate: ${analyzed.successes}/${analyzed.iterations} (${Math.round((analyzed.successes / analyzed.iterations) * 100)}%)`
  );
  console.log(`❌ Errors: ${analyzed.errors}`);

  console.log(`\n⏱️  Response Times:`);
  console.log(`   Average:    ${analyzed.avgTime}ms`);
  console.log(`   Minimum:    ${analyzed.minTime}ms`);
  console.log(`   Maximum:    ${analyzed.maxTime}ms`);
  console.log(`   P50 (median): ${analyzed.p50}ms`);
  console.log(`   P95:        ${analyzed.p95}ms`);
  console.log(`   P99:        ${analyzed.p99}ms`);
  console.log(`   Std Dev:    ±${analyzed.stddev}ms`);

  console.log(`\n🪙 Token Usage:`);
  console.log(`   Avg per request: ${analyzed.avgTokens} tokens`);
  console.log(
    `   Total:           ${analyzed.tokens.reduce((sum, t) => sum + t, 0)} tokens`
  );

  console.log(`\n📊 Performance:`);
  console.log(`   Throughput:  ${analyzed.throughput} req/min`);
  console.log(`   Consistency: ${analyzed.consistency}%`);

  // Performance rating
  let rating = "⭐⭐⭐⭐⭐";
  if (analyzed.avgTime > 5000) rating = "⭐⭐⭐";
  else if (analyzed.avgTime > 3000) rating = "⭐⭐⭐⭐";

  console.log(`   Rating:      ${rating}`);

  console.log(`\n${"=".repeat(70)}\n`);
}

async function runBenchmarks() {
  console.log("\n🚀 Friday AI - Performance Benchmark Test");
  console.log("=".repeat(70));
  console.log(`Running ${ITERATIONS} iterations per model`);
  console.log(`Delay: ${DELAY_BETWEEN_REQUESTS}ms between requests`);
  console.log(
    `Estimated time: ~${((ITERATIONS * DELAY_BETWEEN_REQUESTS) / 1000 / 60).toFixed(1)} minutes per model`
  );
  console.log("=".repeat(70));

  const models = [
    { id: "z-ai/glm-4.5-air:free", name: "GLM-4.5 Air" },
    { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B" },
  ];

  const testPrompt =
    "Skriv et kort svar på dansk: Hvad er hovedpunkterne i et godt tilbud til en kunde?";

  const allResults = [];

  for (const model of models) {
    const results = await benchmarkModel(model.id, model.name, testPrompt);
    const analyzed = analyzeResults(results);
    printResults(analyzed);
    allResults.push(analyzed);

    // Wait between models
    if (model !== models[models.length - 1]) {
      console.log(`⏸️  Waiting 30s before next model...\n`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // Comparison
  console.log("\n" + "=".repeat(70));
  console.log("📊 COMPARATIVE ANALYSIS");
  console.log("=".repeat(70));

  console.log("\n⏱️  Average Response Time:");
  allResults.forEach(r => {
    const bar = "█".repeat(Math.floor(r.avgTime / 200));
    console.log(
      `   ${r.modelName.padEnd(20)} ${r.avgTime.toString().padStart(5)}ms ${bar}`
    );
  });

  console.log("\n🎯 P95 Response Time:");
  allResults.forEach(r => {
    const bar = "█".repeat(Math.floor(r.p95 / 200));
    console.log(
      `   ${r.modelName.padEnd(20)} ${r.p95.toString().padStart(5)}ms ${bar}`
    );
  });

  console.log("\n📈 Throughput (req/min):");
  allResults.forEach(r => {
    const bar = "█".repeat(Math.floor(parseFloat(r.throughput) / 2));
    console.log(
      `   ${r.modelName.padEnd(20)} ${r.throughput.padStart(6)} ${bar}`
    );
  });

  console.log("\n✅ Consistency:");
  allResults.forEach(r => {
    const bar = "█".repeat(Math.floor(r.consistency / 5));
    console.log(
      `   ${r.modelName.padEnd(20)} ${r.consistency.toString().padStart(5)}% ${bar}`
    );
  });

  // Winner
  const fastestAvg = allResults.reduce((min, r) =>
    r.avgTime < min.avgTime ? r : min
  );
  const fastestP95 = allResults.reduce((min, r) => (r.p95 < min.p95 ? r : min));
  const mostConsistent = allResults.reduce((max, r) =>
    r.consistency > max.consistency ? r : max
  );

  console.log("\n🏆 WINNERS:");
  console.log(
    `   Fastest (avg):     ${fastestAvg.modelName} (${fastestAvg.avgTime}ms)`
  );
  console.log(
    `   Fastest (p95):     ${fastestP95.modelName} (${fastestP95.p95}ms)`
  );
  console.log(
    `   Most Consistent:   ${mostConsistent.modelName} (${mostConsistent.consistency}%)`
  );

  console.log("\n💡 RECOMMENDATIONS:");
  if (fastestAvg.avgTime < 3000) {
    console.log(`   ✅ ${fastestAvg.modelName} is production-ready (<3s avg)`);
  }
  if (fastestP95.p95 < 5000) {
    console.log(`   ✅ ${fastestP95.modelName} has acceptable P95 (<5s)`);
  }
  if (mostConsistent.consistency > 80) {
    console.log(
      `   ✅ ${mostConsistent.modelName} is highly consistent (>${mostConsistent.consistency}%)`
    );
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Benchmark Complete!");
  console.log("=".repeat(70) + "\n");
}

// Run benchmarks
runBenchmarks().catch(console.error);
