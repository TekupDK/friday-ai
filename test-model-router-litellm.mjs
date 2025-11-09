#!/usr/bin/env node
/**
 * Test Model Router with LiteLLM Integration
 * Tests task-based routing through LiteLLM proxy
 */

import 'dotenv/config';

const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4000';

// Test different task types
const testCases = [
  {
    taskType: 'chat',
    model: 'openrouter/z-ai/glm-4.5-air:free',
    message: 'Hej! Hvordan har du det?',
    expectedModel: 'GLM-4.5 Air'
  },
  {
    taskType: 'code-generation',
    model: 'openrouter/qwen/qwen3-coder:free',
    message: 'Write a JavaScript function to reverse a string',
    expectedModel: 'Qwen3 Coder'
  },
  {
    taskType: 'email-draft',
    model: 'openrouter/z-ai/glm-4.5-air:free',
    message: 'Skriv en professionel email om møde i morgen',
    expectedModel: 'GLM-4.5 Air'
  }
];

console.log('🧪 Testing Model Router with LiteLLM Integration\n');
console.log(`LiteLLM URL: ${LITELLM_BASE_URL}`);
console.log(`ENABLE_LITELLM: ${process.env.ENABLE_LITELLM}`);
console.log(`ROLLOUT: ${process.env.LITELLM_ROLLOUT_PERCENTAGE}%\n`);

// Check health first
try {
  const healthResponse = await fetch(`${LITELLM_BASE_URL}/health`);
  const health = await healthResponse.json();
  console.log('✅ LiteLLM Health Check:', health);
} catch (error) {
  console.error('❌ LiteLLM not running! Start it with:');
  console.error('   docker start friday-litellm');
  process.exit(1);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test each case
for (const testCase of testCases) {
  console.log(`📝 Testing: ${testCase.taskType}`);
  console.log(`   Expected Model: ${testCase.expectedModel}`);
  console.log(`   Message: "${testCase.message}"`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: testCase.model,
        messages: [
          { role: 'user', content: testCase.message }
        ],
        max_tokens: 100
      })
    });
    
    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    if (data.error) {
      console.log(`   ❌ FAILED: ${data.error.message}`);
    } else {
      const content = data.choices[0].message.content;
      const tokens = data.usage.total_tokens;
      const cost = data.usage.cost || 0;
      
      console.log(`   ✅ SUCCESS in ${responseTime}ms`);
      console.log(`   Response: ${content.substring(0, 80)}...`);
      console.log(`   Tokens: ${tokens} | Cost: $${cost}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('');
}

console.log('='.repeat(60));
console.log('\n✅ Model Router LiteLLM Integration Test Complete!\n');
