/**
 * Intent Detection Test
 * Test if AI can correctly identify user intents
 */

const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const intentTests = [
  {
    name: 'Create Lead Intent',
    userMessage: 'Opret et lead for Jens Jensen, email: jens@test.dk, telefon: 12345678',
    expectedIntent: 'create_lead',
    expectedParams: ['Jens Jensen', 'jens@test.dk', '12345678']
  },
  {
    name: 'Book Meeting Intent',
    userMessage: 'Book et møde med Peter på onsdag kl 14',
    expectedIntent: 'book_meeting',
    expectedParams: ['Peter', 'onsdag', '14']
  },
  {
    name: 'Create Invoice Intent',
    userMessage: 'Lav en faktura til kunde XYZ for badværelsesrenovering 25000 kr',
    expectedIntent: 'create_invoice',
    expectedParams: ['XYZ', 'badværelsesrenovering', '25000']
  },
  {
    name: 'Check Calendar Intent',
    userMessage: 'Hvad har jeg i min kalender i dag?',
    expectedIntent: 'check_calendar',
    expectedParams: ['i dag']
  }
];

const systemPrompt = `You are an intent classifier. Analyze the user message and identify the intent.

Return ONLY valid JSON in this exact format:
{"intent": "intent_name", "confidence": 0.95, "params": {"key": "value"}}

Intents:
- create_lead: Create new lead (extract: name, email, phone)
- book_meeting: Book calendar meeting (extract: person, date, time)
- create_invoice: Create invoice (extract: customer, amount, description)
- check_calendar: Check calendar (extract: date)
- unknown: Unknown intent

Examples:
User: "Opret et lead for Hans, email hans@test.dk"
{"intent": "create_lead", "confidence": 0.95, "params": {"name": "Hans", "email": "hans@test.dk"}}

User: "Book møde med Peter onsdag kl 14"
{"intent": "book_meeting", "confidence": 0.99, "params": {"person": "Peter", "date": "Wednesday", "time": "14:00"}}`;

async function testIntent(model, test) {
  // Retry logic (up to 3 attempts)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://tekup.dk',
          'X-Title': 'Friday AI Test'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: test.userMessage }
          ],
          max_tokens: 300,
          temperature: 0.1 // Low temperature for consistent JSON
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const output = data.choices[0]?.message?.content || '';

      // Extract JSON from response - try multiple patterns
      let jsonMatch = output.match(/\{[\s\S]*?\}/);
      
      if (!jsonMatch) {
        // Try to find JSON between code blocks
        const codeBlockMatch = output.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1]];
        }
      }
      
      if (!jsonMatch) {
        if (attempt < 3) {
          console.log(`   ⚠️ Attempt ${attempt}: No JSON found, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        return {
          success: false,
          error: 'No JSON in response',
          output: output.substring(0, 200),
          attempts: attempt
        };
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        if (attempt < 3) {
          console.log(`   ⚠️ Attempt ${attempt}: JSON parse error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        return {
          success: false,
          error: 'Invalid JSON format',
          output: jsonMatch[0].substring(0, 200),
          attempts: attempt
        };
      }
      
      // Check if intent matches
      const intentCorrect = parsed.intent === test.expectedIntent;
      const confidenceOk = parsed.confidence >= 0.7;
      
      // Check if expected params are mentioned
      const paramsFound = test.expectedParams.every(param => 
        JSON.stringify(parsed.params).toLowerCase().includes(param.toLowerCase())
      );

      return {
        success: intentCorrect && confidenceOk,
        intent: parsed.intent,
        confidence: parsed.confidence,
        intentCorrect,
        confidenceOk,
        paramsFound,
        params: parsed.params,
        attempts: attempt
      };
    } catch (error) {
      if (attempt < 3) {
        console.log(`   ⚠️ Attempt ${attempt} exception: ${error.message}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
      return {
        success: false,
        error: error.message,
        attempts: attempt
      };
    }
  }
}

async function runIntentTests() {
  console.log('🎯 Friday AI - Intent Detection Testing (Improved)');
  console.log('===================================================\n');

  // Only test GPT-OSS since it's much better at JSON (75% vs 25% for GLM)
  const models = [
    { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B (JSON Specialist)' }
  ];

  const results = [];

  for (const model of models) {
    console.log(`\n🤖 Testing: ${model.name}`);
    console.log('─'.repeat(50));

    for (const test of intentTests) {
      console.log(`\n📝 ${test.name}`);
      console.log(`   Input: "${test.userMessage}"`);

      const result = await testIntent(model.id, test);
      results.push({
        model: model.name,
        test: test.name,
        ...result
      });

      if (result.success) {
        console.log(`   ✅ Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)`);
        console.log(`   ✅ Params: ${JSON.stringify(result.params)}`);
      } else if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      } else {
        console.log(`   ⚠️ Intent: ${result.intent} (expected: ${test.expectedIntent})`);
        console.log(`   ⚠️ Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`   ⚠️ Params found: ${result.paramsFound}`);
      }

      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n\n📊 Intent Detection Summary');
  console.log('=========================================');

  for (const model of models) {
    const modelResults = results.filter(r => r.model === model.name);
    const successful = modelResults.filter(r => r.success).length;
    const avgConfidence = modelResults
      .filter(r => r.confidence)
      .reduce((sum, r) => sum + r.confidence, 0) / modelResults.length;

    console.log(`\n${model.name}:`);
    console.log(`  Success Rate: ${successful}/${modelResults.length} (${Math.round(successful/modelResults.length*100)}%)`);
    console.log(`  Avg Confidence: ${Math.round(avgConfidence * 100)}%`);
    
    // Show which intents passed
    const passedIntents = modelResults.filter(r => r.success).map(r => r.test);
    const failedIntents = modelResults.filter(r => !r.success).map(r => r.test);
    
    if (passedIntents.length > 0) {
      console.log(`  ✅ Passed: ${passedIntents.join(', ')}`);
    }
    if (failedIntents.length > 0) {
      console.log(`  ❌ Failed: ${failedIntents.join(', ')}`);
    }
  }

  const totalSuccess = results.filter(r => r.success).length;
  const totalTests = results.length;
  console.log(`\n🎯 Overall Success Rate: ${totalSuccess}/${totalTests} (${Math.round(totalSuccess/totalTests*100)}%)`);
}

runIntentTests().catch(console.error);
