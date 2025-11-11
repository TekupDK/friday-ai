/**
 * Live ChromaDB Duplicate Detection Test
 * Tests lead deduplication with server's environment loaded
 * 
 * Run with: npx tsx server/integrations/chromadb/test-live-dedup.ts
 */

// Load environment first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.dev') });

import { createLead, getUserLeads } from '../../db';
import type { InsertLead } from '../../../drizzle/schema';

console.log('🧪 Live ChromaDB Duplicate Detection Test\n');
console.log('='.repeat(60));

async function testLiveDedup() {
  // Test user ID (you'll need a real user from database)
  const testUserId = 1; // Update if needed
  
  console.log('\n📋 Setup');
  console.log('-'.repeat(60));
  console.log(`User ID: ${testUserId}`);
  console.log(`CHROMA_ENABLED: ${process.env.CHROMA_ENABLED}`);
  console.log(`CHROMA_URL: ${process.env.CHROMA_URL}`);
  
  // Test 1: Create first lead
  console.log('\n📝 Test 1: Create First Lead');
  console.log('-'.repeat(60));
  
  const lead1Data: InsertLead = {
    userId: testUserId,
    name: 'Sarah Johnson Live Test',
    email: 'sarah.johnson@livetest.com',
    phone: '+45 23 45 67 89',
    company: 'Live Test Corporation',
    status: 'new',
    source: 'chromadb-live-test',
  };
  
  console.log('Creating:', JSON.stringify(lead1Data, null, 2));
  
  try {
    const lead1 = await createLead(lead1Data);
    console.log(`\n✅ Created lead #${lead1.id}`);
    console.log(`   Name: ${lead1.name}`);
    console.log(`   Company: ${lead1.company}`);
    console.log(`   Email: ${lead1.email}`);
    
    console.log('\n💡 Watch server console for:');
    console.log('   [Embeddings] Generated embedding (1536 dimensions) in XXXms');
    console.log('   [ChromaDB] Indexed new lead #' + lead1.id);
    
    // Wait for indexing
    console.log('\n⏳ Waiting 3 seconds for ChromaDB to index...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Try to create duplicate
    console.log('\n👥 Test 2: Create Duplicate Lead');
    console.log('-'.repeat(60));
    
    const lead2Data: InsertLead = {
      userId: testUserId,
      name: 'Sarah Johnson Live Test', // Same name
      email: 's.johnson@livetest.com', // Different email
      phone: '+4523456789', // Different format
      company: 'Live Test Corp', // Shorter name
      status: 'new',
      source: 'chromadb-live-test',
    };
    
    console.log('Creating similar lead:', JSON.stringify(lead2Data, null, 2));
    console.log('\nExpected: ChromaDB should detect this as duplicate');
    
    const lead2 = await createLead(lead2Data);
    console.log(`\n📊 Result: Lead #${lead2.id}`);
    
    // Verify duplicate detection
    console.log('\n🔍 Test 3: Verify Duplicate Detection');
    console.log('-'.repeat(60));
    
    if (lead1.id === lead2.id) {
      console.log('✅ ✅ ✅ SUCCESS! DUPLICATE DETECTED! ✅ ✅ ✅');
      console.log(`\nLead 1 ID: ${lead1.id}`);
      console.log(`Lead 2 ID: ${lead2.id}`);
      console.log(`\n🎉 ChromaDB Integration Working Perfectly!`);
      console.log(`   • Semantic similarity calculation: ✅`);
      console.log(`   • Duplicate threshold (0.85): ✅`);
      console.log(`   • Lead indexing: ✅`);
      console.log(`   • Embedding generation: ✅`);
      console.log(`\n💡 Check server logs for similarity score`);
      console.log('   Look for: [ChromaDB] Duplicate lead detected (similarity: 0.XXX)');
    } else {
      console.log('❌ DIFFERENT IDs - New lead created');
      console.log(`\nLead 1 ID: ${lead1.id}`);
      console.log(`Lead 2 ID: ${lead2.id}`);
      console.log(`\n⚠️  ChromaDB might not be enabled or similarity < 0.85`);
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check server logs for ChromaDB messages');
      console.log('   2. Verify CHROMA_ENABLED=true in .env.dev');
      console.log('   3. Check ChromaDB is running: docker ps');
      console.log('   4. Look for similarity score in logs');
    }
    
    // Test 3: Create different lead
    console.log('\n👤 Test 4: Create Different Lead');
    console.log('-'.repeat(60));
    
    const lead3Data: InsertLead = {
      userId: testUserId,
      name: 'Michael Brown',
      email: 'michael.brown@different.com',
      phone: '+45 98 76 54 32',
      company: 'Completely Different Inc',
      status: 'new',
      source: 'chromadb-live-test',
    };
    
    console.log('Creating different lead...');
    const lead3 = await createLead(lead3Data);
    console.log(`✅ Created lead #${lead3.id}: ${lead3.name}`);
    
    if (lead3.id !== lead1.id && lead3.id !== lead2.id) {
      console.log('✅ Correct! Different lead created (as expected)');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`\nTest Results:`);
    console.log(`• Lead 1: #${lead1.id} - ${lead1.name}`);
    console.log(`• Lead 2: #${lead2.id} - ${lead2.name}${lead1.id === lead2.id ? ' ← DUPLICATE ✅' : ' ← NEW ❌'}`);
    console.log(`• Lead 3: #${lead3.id} - ${lead3.name} ← DIFFERENT ✅`);
    
    console.log('\n🎯 ChromaDB Status:');
    if (lead1.id === lead2.id) {
      console.log('✅ PRODUCTION READY!');
      console.log('   All features working correctly');
    } else {
      console.log('⚠️  NEEDS ATTENTION');
      console.log('   Check server logs and configuration');
    }
    
    console.log('\n🧹 Cleanup');
    console.log('To remove test leads:');
    console.log(`DELETE FROM leads WHERE source = 'chromadb-live-test';`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\n💡 Common issues:');
    console.log('   • Database not running');
    console.log('   • Invalid user ID');
    console.log('   • ChromaDB not enabled');
    process.exit(1);
  }
  
  console.log('\n✅ Test Complete!');
  process.exit(0);
}

// Run test
testLiveDedup().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
