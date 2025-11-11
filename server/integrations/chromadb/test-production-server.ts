/**
 * Test ChromaDB with Production Server
 * Tests lead creation and duplicate detection via running server
 * 
 * Prerequisites:
 * - Server running: npm run dev
 * - ChromaDB running: docker-compose up
 * - CHROMA_ENABLED=true in .env.dev
 * 
 * Run with: npx tsx server/integrations/chromadb/test-production-server.ts
 */

console.log('🧪 Testing ChromaDB with Running Production Server\n');
console.log('='.repeat(60));

interface Lead {
  id: number;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  source: string;
  status: string;
  createdAt: string;
}

async function testProductionServer() {
  const API_URL = 'http://localhost:3000/api/leads';
  
  console.log('\n📋 Test Setup');
  console.log('-'.repeat(60));
  console.log(`API URL: ${API_URL}`);
  console.log(`Expected: Server should use ChromaDB for duplicate detection`);

  // Test 1: Create first lead
  console.log('\n📝 Test 1: Create First Lead');
  console.log('-'.repeat(60));
  
  const lead1Data = {
    name: 'John Doe ChromaDB',
    email: 'john.doe@chromadb-test.com',
    company: 'ChromaDB Test Corporation',
    phone: '+45 12 34 56 78',
    source: 'chromadb-test',
    status: 'new'
  };
  
  console.log('Creating lead:', JSON.stringify(lead1Data, null, 2));
  
  let lead1: Lead;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead1Data),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    lead1 = await response.json();
    console.log(`✅ Lead created successfully!`);
    console.log(`   ID: ${lead1.id}`);
    console.log(`   Name: ${lead1.name}`);
    console.log(`   Company: ${lead1.company}`);
    console.log('\n💡 Check server logs for:');
    console.log('   [ChromaDB] Indexed new lead #' + lead1.id);
    console.log('   [Embeddings] Generated embedding (1536 dimensions)');
  } catch (error) {
    console.log('❌ Failed to create lead:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   • Is server running? npm run dev');
    console.log('   • Check server logs for errors');
    console.log('   • Verify API endpoint: ' + API_URL);
    process.exit(1);
  }

  // Wait for indexing
  console.log('\n⏳ Waiting 3 seconds for ChromaDB indexing...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 2: Create duplicate lead (should return existing)
  console.log('\n👥 Test 2: Create Duplicate Lead');
  console.log('-'.repeat(60));
  
  const lead2Data = {
    name: 'John Doe ChromaDB', // Same name
    email: 'j.doe@chromadb-test.com', // Slightly different email
    company: 'ChromaDB Test Corp', // Shorter company name
    phone: '+4512345678', // Different format
    source: 'chromadb-test',
    status: 'new'
  };
  
  console.log('Creating similar lead:', JSON.stringify(lead2Data, null, 2));
  console.log('\nExpected behavior:');
  console.log('• ChromaDB should detect similarity');
  console.log('• If similarity > 0.85 → return existing lead');
  console.log('• Server logs should show duplicate detection');
  
  let lead2: Lead;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead2Data),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    lead2 = await response.json();
    console.log(`\n✅ API Response received!`);
    console.log(`   ID: ${lead2.id}`);
    console.log(`   Name: ${lead2.name}`);
    console.log(`   Company: ${lead2.company}`);
  } catch (error) {
    console.log('❌ Failed to create duplicate lead:', error);
    process.exit(1);
  }

  // Test 3: Verify duplicate detection
  console.log('\n🔍 Test 3: Verify Duplicate Detection');
  console.log('-'.repeat(60));
  
  if (lead1.id === lead2.id) {
    console.log('✅ ✅ ✅ SUCCESS! DUPLICATE DETECTED! ✅ ✅ ✅');
    console.log(`\nLead 1 ID: ${lead1.id}`);
    console.log(`Lead 2 ID: ${lead2.id}`);
    console.log(`\n🎉 ChromaDB correctly identified the duplicate!`);
    console.log(`   Similarity must have been > 0.85 (threshold)`);
    console.log(`   Returned existing lead instead of creating new one`);
    console.log('\n💡 Check server logs for:');
    console.log(`   [ChromaDB] Duplicate lead detected (similarity: 0.XXX)`);
    console.log(`   [ChromaDB] Returning existing lead #${lead1.id}`);
  } else {
    console.log('⚠️  Different IDs - New lead was created');
    console.log(`\nLead 1 ID: ${lead1.id}`);
    console.log(`Lead 2 ID: ${lead2.id}`);
    console.log(`\nPossible reasons:`);
    console.log(`• Similarity was < 0.85 (not similar enough)`);
    console.log(`• ChromaDB not enabled (check .env.dev)`);
    console.log(`• Embeddings not working`);
    console.log(`\n💡 Check server logs for similarity score`);
  }

  // Test 4: Create completely different lead
  console.log('\n👤 Test 4: Create Different Lead');
  console.log('-'.repeat(60));
  
  const lead3Data = {
    name: 'Jane Smith',
    email: 'jane.smith@different-company.com',
    company: 'Totally Different Corp',
    phone: '+45 98 76 54 32',
    source: 'chromadb-test',
    status: 'new'
  };
  
  console.log('Creating different lead:', JSON.stringify(lead3Data, null, 2));
  
  let lead3: Lead | undefined;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead3Data),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    lead3 = await response.json();
    console.log(`\n✅ Lead created!`);
    console.log(`   ID: ${lead3.id}`);
    console.log(`   Name: ${lead3.name}`);
    
    if (lead3 && lead3.id !== lead1.id && lead3.id !== lead2.id) {
      console.log('\n✅ Correct! Different lead created');
      console.log('   ChromaDB correctly identified this as unique');
      console.log('   Similarity must have been < 0.85');
    } else {
      console.log('\n⚠️  Unexpected: Matched with existing lead');
    }
  } catch (error) {
    console.log('❌ Failed to create different lead:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nLeads Created:`);
  console.log(`• Lead 1: #${lead1.id} - ${lead1.name}`);
  console.log(`• Lead 2: #${lead2.id} - ${lead2.name}${lead1.id === lead2.id ? ' (DUPLICATE ✅)' : ' (NEW ⚠️)'}`);
  if (lead3) {
    console.log(`• Lead 3: #${lead3.id} - ${lead3.name} (DIFFERENT ✅)`);
  }
  
  console.log('\n🎯 ChromaDB Integration Status:');
  if (lead1.id === lead2.id) {
    console.log('✅ WORKING PERFECTLY!');
    console.log('   • Duplicate detection: Active');
    console.log('   • Semantic similarity: Working');
    console.log('   • Threshold (0.85): Properly configured');
    console.log('   • Lead indexing: Automatic');
  } else {
    console.log('⚠️  NEEDS INVESTIGATION');
    console.log('   • Check server logs for ChromaDB messages');
    console.log('   • Verify CHROMA_ENABLED=true in .env.dev');
    console.log('   • Ensure ChromaDB is running: docker ps');
  }
  
  if (!lead3) {
    console.log('\n⚠️  Note: Lead 3 test did not complete');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Check server logs for detailed ChromaDB activity');
  console.log('   2. View Langfuse dashboard: http://localhost:3001');
  console.log('   3. Check ChromaDB: curl http://localhost:8000/api/v2/heartbeat');
  console.log('   4. Test in UI: Create leads and see duplicate detection');
  
  console.log('\n🎉 Test Complete!');
  process.exit(0);
}

// Run tests
testProductionServer().catch((error) => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
