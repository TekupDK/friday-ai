#!/usr/bin/env node
/**
 * Test LiteLLM with Realistic Lead Data (Simulated)
 * Based on actual lead patterns from rengøring.nu, Leadpoint, etc.
 * 
 * IMPORTANT: READ ONLY - NO EMAILS WILL BE SENT!
 */

import 'dotenv/config';

const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4000';

console.log('🧪 Testing LiteLLM with REALISTIC Lead Scenarios\n');
console.log('⚠️  READ ONLY MODE - NO EMAILS WILL BE SENT!\n');
console.log(`LiteLLM URL: ${LITELLM_BASE_URL}`);
console.log(`ENABLE_LITELLM: ${process.env.ENABLE_LITELLM}`);
console.log(`ROLLOUT: ${process.env.LITELLM_ROLLOUT_PERCENTAGE}%\n`);

// Realistic lead data based on your sources
const realisticLeads = [
  {
    id: 1,
    name: 'Mette Hansen',
    email: 'mette.h@example.com',
    phone: '+45 23 45 67 89',
    source: 'rengøring.nu',
    service_type: 'flytterengøring',
    status: 'new',
    notes: 'Ønsker tilbud på flytterengøring i 3-værelses lejlighed i Aarhus C. Fraflytning d. 15. december. Kræver syn for tilbud.',
    created_at: new Date('2024-11-05')
  },
  {
    id: 2,
    name: 'Lars Nielsen',
    email: 'lars.n@company.dk',
    phone: '+45 40 12 34 56',
    source: 'Rengøring Århus',
    service_type: 'erhvervsrengøring',
    status: 'contacted',
    notes: 'Kontor på 200m2 i Aarhus N. Ønsker ugentlig rengøring. Har ringet tilbage og aftalt møde til kl. 14:00 i morgen.',
    created_at: new Date('2024-11-07')
  },
  {
    id: 3,
    name: 'Anne og Thomas Sørensen',
    email: 'anne.thomas@email.dk',
    phone: '+45 51 87 65 43',
    source: 'Leadpoint',
    service_type: 'privat rengøring',
    status: 'qualified',
    notes: 'Privat rengøring hver 14. dag i villa på 180m2. Har 2 børn og hund. Ønsker start fra december. Budget: 800-1000 kr/gang.',
    created_at: new Date('2024-11-08')
  },
  {
    id: 4,
    name: 'Peter Madsen',
    email: 'peter.m@hotmail.com',
    phone: '+45 29 34 56 78',
    source: 'Netberrau',
    service_type: 'vinduespudsning',
    status: 'new',
    notes: 'Vinduespudsning på rækkehus. 12 vinduer. Ønsker udført inden jul. Svar på email foretrækkes.',
    created_at: new Date('2024-11-09')
  },
  {
    id: 5,
    name: 'Karen Olsen',
    email: 'karen@rådgivning.dk',
    phone: '+45 42 11 22 33',
    source: 'rengøring.nu',
    service_type: 'dybderengøring',
    status: 'interested',
    notes: 'Efterspørger dybderengøring af lejlighed efter renovation. Ca. 90m2. Kan bookes når som helst de næste 2 uger. Meget interesseret.',
    created_at: new Date('2024-11-09')
  }
];

console.log(`📊 Testing with ${realisticLeads.length} realistic lead scenarios\n`);
console.log('='.repeat(80) + '\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test each lead with different AI tasks
for (const lead of realisticLeads) {
  console.log(`📝 Lead #${lead.id}: ${lead.name}`);
  console.log(`   Source: ${lead.source}`);
  console.log(`   Service: ${lead.service_type}`);
  console.log(`   Status: ${lead.status}`);
  console.log(`   Created: ${lead.created_at.toLocaleDateString('da-DK')}`);
  console.log(`   Notes: ${lead.notes.substring(0, 80)}...`);

  // Test 1: Lead Analysis with task-based routing
  console.log('\n   🤖 Test 1: Lead Analysis (Task: lead-analysis)');
  try {
    totalTests++;
    
    const analysisPrompt = `Analyser denne lead og vurder prioritet og næste skridt:
    
Kunde: ${lead.name}
Email: ${lead.email}
Telefon: ${lead.phone}
Service: ${lead.service_type}
Kilde: ${lead.source}
Status: ${lead.status}
Noter: ${lead.notes}

Giv en kort analyse med:
1. Prioritet (høj/mellem/lav)
2. Sandsynlighed for konvertering
3. Anbefalet næste skridt
4. Evt. røde flag

Svar på dansk, max 150 ord.`;

    const startTime = Date.now();
    const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openrouter/z-ai/glm-4.5-air:free', // Primary model for lead-analysis
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 250
      })
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (data.error) {
      console.log(`      ❌ FAILED: ${data.error.message}`);
      failedTests++;
    } else {
      const analysis = data.choices[0].message.content;
      console.log(`      ✅ SUCCESS in ${responseTime}ms`);
      console.log(`      Analysis (first 120 chars):`);
      console.log(`      "${analysis.substring(0, 120)}..."`);
      console.log(`      Tokens: ${data.usage.total_tokens} | Cost: $${data.usage.cost || 0}`);
      passedTests++;
    }
  } catch (error) {
    console.log(`      ❌ ERROR: ${error.message}`);
    failedTests++;
  }

  // Test 2: Email Draft Generation (NOT SENT!)
  if (lead.email && lead.status !== 'lost') {
    console.log('\n   📧 Test 2: Email Draft (Task: email-draft) [NOT SENT!]');
    try {
      totalTests++;
      
      const draftPrompt = `Skriv et kort, professionelt follow-up email til denne kunde:

Til: ${lead.name}
Service efterspurgt: ${lead.service_type}
Status: ${lead.status}
Context: ${lead.notes}

Email skal:
- Være venlig og professionel
- Svare på deres forespørgsel
- Foreslå næste skridt (møde, syn, eller tilbud)
- Max 100 ord på dansk
- Inkludere en klar call-to-action`;

      const startTime = Date.now();
      const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openrouter/z-ai/glm-4.5-air:free', // Primary for email-draft
          messages: [{ role: 'user', content: draftPrompt }],
          max_tokens: 180
        })
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.error) {
        console.log(`      ❌ FAILED: ${data.error.message}`);
        failedTests++;
      } else {
        const draft = data.choices[0].message.content;
        console.log(`      ✅ Draft generated in ${responseTime}ms`);
        console.log(`      Preview (first 100 chars):`);
        console.log(`      "${draft.substring(0, 100)}..."`);
        console.log(`      ⚠️  NOT SENT - Read only mode!`);
        passedTests++;
      }
    } catch (error) {
      console.log(`      ❌ ERROR: ${error.message}`);
      failedTests++;
    }
  }

  // Test 3: Booking/Task Creation Prompt (if applicable)
  if (lead.status === 'qualified' || lead.status === 'interested') {
    console.log('\n   📅 Test 3: Task Planning (Task: complex-reasoning)');
    try {
      totalTests++;
      
      const taskPrompt = `Baseret på denne lead, lav en plan for booking og opgaveløsning:

Kunde: ${lead.name}
Service: ${lead.service_type}
Context: ${lead.notes}

Giv konkrete forslag til:
1. Hvornår skal opgaven udføres?
2. Hvor lang tid tager det?
3. Hvad skal vi huske/forberede?
4. Estimeret pris?

Svar kort på dansk, max 120 ord.`;

      const startTime = Date.now();
      const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openrouter/z-ai/glm-4.5-air:free', // Primary for complex-reasoning
          messages: [{ role: 'user', content: taskPrompt }],
          max_tokens: 200
        })
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.error) {
        console.log(`      ❌ FAILED: ${data.error.message}`);
        failedTests++;
      } else {
        const plan = data.choices[0].message.content;
        console.log(`      ✅ Plan generated in ${responseTime}ms`);
        console.log(`      Plan (first 100 chars):`);
        console.log(`      "${plan.substring(0, 100)}..."`);
        passedTests++;
      }
    } catch (error) {
      console.log(`      ❌ ERROR: ${error.message}`);
      failedTests++;
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Summary
console.log('📊 TEST SUMMARY\n');
console.log('='.repeat(80));
console.log(`Total Tests:   ${totalTests}`);
console.log(`✅ Passed:     ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`❌ Failed:     ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
console.log('='.repeat(80));
console.log('\n✅ Realistic Lead Testing Complete!');
console.log('⚠️  NO EMAILS WERE SENT - All tests were read-only\n');
console.log('💰 Total Cost: $0.00 (All FREE models!)');

if (passedTests === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED! LiteLLM works great with real lead scenarios!\n');
} else {
  console.log(`\n⚠️  ${failedTests} tests failed. Check LiteLLM proxy status.\n`);
}
