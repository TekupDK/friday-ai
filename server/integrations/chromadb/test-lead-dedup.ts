/**
 * Test Lead Deduplication with ChromaDB
 * Run with: tsx server/integrations/chromadb/test-lead-dedup.ts
 */

import { createLead, getUserLeads } from '../../db';
import type { InsertLead } from '../../../drizzle/schema';

async function testLeadDeduplication() {
  console.log('🧪 Testing Lead Deduplication with ChromaDB\n');

  // Test user ID (use real user from your database)
  const testUserId = 1;

  try {
    // Test 1: Create first lead
    console.log('Test 1: Creating first lead');
    const lead1Data: InsertLead = {
      userId: testUserId,
      name: 'John Doe',
      email: 'john.doe@acme.com',
      phone: '+45 12 34 56 78',
      company: 'ACME Corporation',
      status: 'new',
      source: 'test',
    };

    const lead1 = await createLead(lead1Data);
    console.log(`✅ Created lead #${lead1.id}: ${lead1.name} @ ${lead1.company}\n`);

    // Wait a bit for indexing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Try to create duplicate lead (should return existing)
    console.log('Test 2: Creating duplicate lead (slight variation)');
    const lead2Data: InsertLead = {
      userId: testUserId,
      name: 'John Doe',
      email: 'john@acme.com', // Slightly different email
      phone: '+4512345678', // Different format
      company: 'ACME Corp', // Shorter name
      status: 'new',
      source: 'test',
    };

    const lead2 = await createLead(lead2Data);
    console.log(`Result: Lead #${lead2.id}`);
    
    if (lead1.id === lead2.id) {
      console.log('✅ SUCCESS: Duplicate detected! Returned existing lead\n');
    } else {
      console.log('⚠️  WARNING: Created new lead instead of detecting duplicate\n');
    }

    // Test 3: Create different lead (should create new)
    console.log('Test 3: Creating different lead');
    const lead3Data: InsertLead = {
      userId: testUserId,
      name: 'Jane Smith',
      email: 'jane.smith@xyz.com',
      phone: '+45 98 76 54 32',
      company: 'XYZ Industries',
      status: 'new',
      source: 'test',
    };

    const lead3 = await createLead(lead3Data);
    console.log(`✅ Created lead #${lead3.id}: ${lead3.name} @ ${lead3.company}`);
    
    if (lead3.id !== lead1.id) {
      console.log('✅ SUCCESS: Different lead created as expected\n');
    } else {
      console.log('❌ ERROR: Should have created new lead\n');
    }

    // Test 4: Check all user leads
    console.log('Test 4: Fetching all test leads');
    const allLeads = await getUserLeads(testUserId, { source: 'test' });
    console.log(`Found ${allLeads.length} test leads:`);
    for (const lead of allLeads) {
      console.log(`  - #${lead.id}: ${lead.name} @ ${lead.company}`);
    }

    console.log('\n🎉 Test complete!');
    console.log('\nExpected Results:');
    console.log('- Lead 1 and Lead 2 should have same ID (duplicate detected)');
    console.log('- Lead 3 should have different ID (new lead)');
    console.log('- Total unique leads: 2');

    console.log('\n💡 Check server logs for ChromaDB duplicate detection messages');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run test
testLeadDeduplication();
