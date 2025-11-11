/**
 * V4.3.3 Script 5: Semantic Lead Search
 * 
 * Interactive semantic search for leads in ChromaDB.
 * 
 * Features:
 * - Semantic text search ("Find villa flytterengøring customers")
 * - Similar lead finding (based on lead ID)
 * - Advanced filtering (revenue, status, service type, etc.)
 * - Customer recommendations
 * 
 * Usage: npx tsx server/integrations/chromadb/scripts/5-search-leads.ts
 */

import { ChromaClient } from 'chromadb';

console.log('🔍 V4.3.3 Script 5: Semantic Lead Search\n');
console.log('='.repeat(70));

const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
const CHROMA_PORT = process.env.CHROMA_PORT || '8000';
const COLLECTION_NAME = 'leads_v4_3_3';

const client = new ChromaClient({ 
  path: `http://${CHROMA_HOST}:${CHROMA_PORT}`,
});

async function searchLeads() {
  console.log(`\n🔌 Connecting to ChromaDB at http://${CHROMA_HOST}:${CHROMA_PORT}...`);
  
  // Import the default embedding function
  const { DefaultEmbeddingFunction } = await import('@chroma-core/default-embed');
  const embedder = new DefaultEmbeddingFunction();
  
  const collection = await client.getCollection({ 
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
  });
  const count = await collection.count();
  
  console.log(`✅ Connected to collection: ${COLLECTION_NAME} (${count} leads)\n`);
  console.log('='.repeat(70));
  
  // ============================================================================
  // EXAMPLE 1: Semantic Search - Find villa cleaning customers
  // ============================================================================
  
  console.log('\n📝 EXAMPLE 1: Find villa cleaning customers');
  console.log('-'.repeat(70));
  
  const villaResults = await collection.query({
    queryTexts: ['villa rengøring'],
    nResults: 5,
  });
  
  console.log('\nTop 5 villa cleaning leads:');
  villaResults.ids![0].forEach((id: string, idx: number) => {
    const meta = villaResults.metadatas![0][idx];
    console.log(`   ${idx + 1}. ${meta?.customerName} - ${meta?.serviceType}`);
    console.log(`      Revenue: ${meta?.revenue} kr | Status: ${meta?.status} | Completeness: ${meta?.dataCompleteness}%`);
  });
  
  // ============================================================================
  // EXAMPLE 2: High-Value Opportunities
  // ============================================================================
  
  console.log('\n\n💰 EXAMPLE 2: High-Value Opportunities (>2000 kr revenue)');
  console.log('-'.repeat(70));
  
  const highValueResults = await collection.get({
    where: {
      $and: [
        { revenue: { $gt: 2000 } },
        { status: { $in: ['contacted', 'proposal', 'calendar'] } },
      ],
    },
    limit: 10,
  });
  
  console.log(`\nFound ${highValueResults.ids.length} high-value opportunities:`);
  highValueResults.ids.forEach((id, idx) => {
    const meta = highValueResults.metadatas[idx];
    console.log(`   ${idx + 1}. ${meta?.customerName} - ${meta?.serviceType}`);
    console.log(`      Revenue: ${meta?.revenue} kr | Status: ${meta?.status} | Lead Source: ${meta?.leadSource}`);
  });
  
  // ============================================================================
  // EXAMPLE 3: Find Similar Customers
  // ============================================================================
  
  console.log('\n\n🔗 EXAMPLE 3: Find Similar Customers');
  console.log('-'.repeat(70));
  
  // Get a random won customer
  const wonCustomers = await collection.get({
    where: { status: 'won' },
    limit: 1,
  });
  
  if (wonCustomers.ids.length > 0) {
    const referenceId = wonCustomers.ids[0];
    const referenceMeta = wonCustomers.metadatas[0];
    const referenceDoc = wonCustomers.documents[0];
    
    console.log(`\nReference customer: ${referenceMeta?.customerName}`);
    console.log(`Service: ${referenceMeta?.serviceType} | Revenue: ${referenceMeta?.revenue} kr`);
    
    // Find similar
    const similarResults = await collection.query({
      queryTexts: [referenceDoc || ''],
      nResults: 6, // +1 because first will be the reference itself
      where: {
        status: { $ne: 'won' }, // Exclude already won
      },
    });
    
    console.log('\nTop 5 similar leads to convert:');
    similarResults.ids![0].slice(0, 5).forEach((id: string, idx: number) => {
      const meta = similarResults.metadatas![0][idx];
      console.log(`   ${idx + 1}. ${meta?.customerName} - ${meta?.serviceType}`);
      console.log(`      Status: ${meta?.status} | Completeness: ${meta?.dataCompleteness}%`);
    });
  }
  
  // ============================================================================
  // EXAMPLE 4: Lead Source Performance
  // ============================================================================
  
  console.log('\n\n📊 EXAMPLE 4: Lead Source Analysis');
  console.log('-'.repeat(70));
  
  const rengoring = await collection.get({
    where: { leadSource: 'Rengøring.nu (via leadmail.no)' },
  });
  
  const leadpoint = await collection.get({
    where: { leadSource: 'Leadpoint.dk (Rengøring Aarhus)' },
  });
  
  const rengoringRevenue = rengoring.metadatas.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);
  const leadpointRevenue = leadpoint.metadatas.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);
  
  const rengoringWon = rengoring.metadatas.filter(m => m?.status === 'won').length;
  const leadpointWon = leadpoint.metadatas.filter(m => m?.status === 'won').length;
  
  console.log('\nRengøring.nu (via leadmail.no):');
  console.log(`   Total Leads: ${rengoring.ids.length}`);
  console.log(`   Won: ${rengoringWon} (${((rengoringWon / rengoring.ids.length) * 100).toFixed(1)}%)`);
  console.log(`   Revenue: ${rengoringRevenue.toLocaleString()} kr`);
  console.log(`   Avg Revenue/Lead: ${(rengoringRevenue / rengoring.ids.length).toFixed(0)} kr`);
  
  console.log('\nLeadpoint.dk (Rengøring Aarhus):');
  console.log(`   Total Leads: ${leadpoint.ids.length}`);
  console.log(`   Won: ${leadpointWon} (${((leadpointWon / leadpoint.ids.length) * 100).toFixed(1)}%)`);
  console.log(`   Revenue: ${leadpointRevenue.toLocaleString()} kr`);
  console.log(`   Avg Revenue/Lead: ${(leadpointRevenue / leadpoint.ids.length).toFixed(0)} kr`);
  
  // ============================================================================
  // EXAMPLE 5: Data Quality Insights
  // ============================================================================
  
  console.log('\n\n📈 EXAMPLE 5: Data Quality Insights');
  console.log('-'.repeat(70));
  
  const highQuality = await collection.get({
    where: { dataCompleteness: { $gt: 80 } },
  });
  
  const mediumQuality = await collection.get({
    where: { 
      $and: [
        { dataCompleteness: { $gte: 50 } },
        { dataCompleteness: { $lte: 80 } },
      ],
    },
  });
  
  const lowQuality = await collection.get({
    where: { dataCompleteness: { $lt: 50 } },
  });
  
  console.log('\nData Quality Distribution:');
  console.log(`   High (>80%): ${highQuality.ids.length} leads`);
  console.log(`   Medium (50-80%): ${mediumQuality.ids.length} leads`);
  console.log(`   Low (<50%): ${lowQuality.ids.length} leads`);
  
  const highQualityRevenue = highQuality.metadatas.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);
  const mediumQualityRevenue = mediumQuality.metadatas.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);
  const lowQualityRevenue = lowQuality.metadatas.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);
  
  console.log('\nRevenue by Quality:');
  console.log(`   High Quality: ${highQualityRevenue.toLocaleString()} kr`);
  console.log(`   Medium Quality: ${mediumQualityRevenue.toLocaleString()} kr`);
  console.log(`   Low Quality: ${lowQualityRevenue.toLocaleString()} kr`);
  
  // ============================================================================
  // EXAMPLE 6: Custom Semantic Queries
  // ============================================================================
  
  console.log('\n\n🎯 EXAMPLE 6: Custom Semantic Queries');
  console.log('-'.repeat(70));
  
  const queries = [
    'flytterengøring stor villa',
    'erhvervsrengøring kontor',
    'privat hus',
  ];
  
  for (const query of queries) {
    const results = await collection.query({
      queryTexts: [query],
      nResults: 3,
    });
    
    console.log(`\n"${query}":`);
    results.ids![0].forEach((id: string, idx: number) => {
      const meta = results.metadatas![0][idx];
      console.log(`   ${idx + 1}. ${meta?.customerName} - ${meta?.serviceType} (${meta?.revenue} kr)`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ SEARCH COMPLETE');
  console.log('='.repeat(70));
  console.log('\n💡 ChromaDB provides powerful semantic search capabilities!');
  console.log('   - Natural language queries');
  console.log('   - Similarity matching');
  console.log('   - Advanced metadata filtering');
  console.log('   - Customer recommendations\n');
}

searchLeads().catch(console.error);
