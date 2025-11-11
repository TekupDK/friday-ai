/**
 * Direct ChromaDB Test - Bypasses ENV caching
 * Tests ChromaDB directly without going through Friday AI's ENV system
 * 
 * Run with: npx tsx server/integrations/chromadb/test-chromadb-direct.ts
 */

import { ChromaClient } from 'chromadb';

console.log('🧪 Direct ChromaDB Connection Test\n');
console.log('='.repeat(60));

async function testDirect() {
  // Test 1: Direct connection
  console.log('\n📡 Test 1: Direct ChromaDB Connection');
  console.log('-'.repeat(60));
  
  let client: ChromaClient;
  try {
    client = new ChromaClient({
      path: 'http://localhost:8000',
      auth: {
        provider: 'token',
        credentials: 'friday-chromadb-token-dev',
      }
    });
    console.log('✅ Client created');
  } catch (error) {
    console.log('❌ Client creation failed:', error);
    process.exit(1);
  }

  // Test 2: Heartbeat
  console.log('\n💓 Test 2: Heartbeat');
  console.log('-'.repeat(60));
  try {
    const heartbeat = await client.heartbeat();
    console.log('✅ ChromaDB is alive!');
    console.log(`   Heartbeat: ${JSON.stringify(heartbeat).slice(0, 100)}...`);
  } catch (error) {
    console.log('❌ Heartbeat failed:', error);
    process.exit(1);
  }

  // Test 3: List collections
  console.log('\n📋 Test 3: List Collections');
  console.log('-'.repeat(60));
  try {
    const collections = await client.listCollections();
    console.log(`✅ Found ${collections.length} collections`);
    if (collections.length > 0) {
      collections.forEach(c => console.log(`   - ${c.name}`));
    }
  } catch (error) {
    console.log('❌ List collections failed:', error);
    process.exit(1);
  }

  // Test 4: Create test collection
  console.log('\n📦 Test 4: Create Collection');
  console.log('-'.repeat(60));
  try {
    const collection = await client.getOrCreateCollection({
      name: 'test_direct_connection',
      metadata: { test: 'true' }
    });
    console.log(`✅ Collection created: ${collection.name}`);
  } catch (error) {
    console.log('❌ Collection creation failed:', error);
    process.exit(1);
  }

  // Test 5: Add document
  console.log('\n📝 Test 5: Add Document');
  console.log('-'.repeat(60));
  try {
    const collection = await client.getOrCreateCollection({
      name: 'test_direct_connection'
    });
    
    await collection.add({
      ids: ['test-doc-1'],
      documents: ['This is a test document for ChromaDB'],
      metadatas: [{ type: 'test' }]
    });
    console.log('✅ Document added');
  } catch (error) {
    console.log('❌ Add document failed:', error);
    process.exit(1);
  }

  // Test 6: Query document
  console.log('\n🔍 Test 6: Query Document');
  console.log('-'.repeat(60));
  try {
    const collection = await client.getOrCreateCollection({
      name: 'test_direct_connection'
    });
    
    const results = await collection.query({
      queryTexts: ['test document'],
      nResults: 1
    });
    
    console.log(`✅ Query successful`);
    console.log(`   Found: ${results.ids[0].length} results`);
    if (results.ids[0].length > 0) {
      console.log(`   ID: ${results.ids[0][0]}`);
      console.log(`   Document: ${results.documents[0][0]}`);
    }
  } catch (error) {
    console.log('❌ Query failed:', error);
    process.exit(1);
  }

  // Test 7: Production collections check
  console.log('\n🏭 Test 7: Production Collections Check');
  console.log('-'.repeat(60));
  try {
    // Try to get production collections
    const collections = await client.listCollections();
    const leadsCollection = collections.find(c => c.name === 'friday_leads');
    const emailsCollection = collections.find(c => c.name === 'friday_emails');
    
    if (leadsCollection) {
      const collection = await client.getCollection({ name: 'friday_leads' });
      const count = await collection.count();
      console.log(`✅ friday_leads: ${count} documents`);
    } else {
      console.log(`⚠️  friday_leads: Not created yet (will be created on first use)`);
    }
    
    if (emailsCollection) {
      const collection = await client.getCollection({ name: 'friday_emails' });
      const count = await collection.count();
      console.log(`✅ friday_emails: ${count} documents`);
    } else {
      console.log(`⚠️  friday_emails: Not created yet (will be created on first use)`);
    }
  } catch (error) {
    console.log('⚠️  Could not check production collections:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL DIRECT TESTS PASSED!');
  console.log('='.repeat(60));
  console.log('\n✅ ChromaDB Status:');
  console.log('   • Server: Running (http://localhost:8000)');
  console.log('   • Authentication: Working');
  console.log('   • Collections: Working');
  console.log('   • Documents: Working');
  console.log('   • Queries: Working');
  console.log('\n💡 What This Means:');
  console.log('   • ChromaDB is fully operational');
  console.log('   • Ready for Friday AI integration');
  console.log('   • Production collections will be created automatically');
  console.log('   • When server starts with CHROMA_ENABLED=true:');
  console.log('     - Leads will be indexed on creation');
  console.log('     - Emails will be indexed on sync');
  console.log('     - Duplicate detection will work');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Ensure .env.dev has CHROMA_ENABLED=true');
  console.log('   2. Restart Friday AI server: npm run dev');
  console.log('   3. Create a lead in UI');
  console.log('   4. Check server logs for: "[ChromaDB] Indexed new lead"');
  console.log('   5. Try creating duplicate → should return existing');
  
  process.exit(0);
}

// Run tests
testDirect().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
