/**
 * ChromaDB Threshold Tuning
 * 
 * Uses real production data to find optimal duplicate detection threshold
 * 
 * Tests different thresholds:
 * - 0.75 (loose - catches more duplicates, more false positives)
 * - 0.80 (moderate-loose)
 * - 0.85 (current - balanced)
 * - 0.90 (strict)
 * - 0.95 (very strict - fewer false positives, may miss duplicates)
 * 
 * Metrics:
 * - True Positives (TP): Correctly identified duplicates
 * - False Positives (FP): Incorrectly marked as duplicate
 * - True Negatives (TN): Correctly identified as unique
 * - False Negatives (FN): Missed duplicates
 * - Precision: TP / (TP + FP)
 * - Recall: TP / (TP + FN)
 * - F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
 * 
 * Run with: npx tsx server/integrations/chromadb/scripts/tune-threshold.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.dev') });

import { generateEmbedding } from '../embeddings';
import { formatLeadForEmbedding } from '../index';

console.log('🎯 ChromaDB Threshold Tuning\n');
console.log('='.repeat(60));

interface Lead {
  source: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

interface TestResult {
  threshold: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

async function tuneThreshold() {
  // Load real data
  const dataPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/real-leads.json');
  
  if (!existsSync(dataPath)) {
    console.log('❌ Real data not found!');
    console.log('   Run first: npx tsx server/integrations/chromadb/scripts/collect-real-data.ts');
    process.exit(1);
  }
  
  console.log('\n📂 Loading real data...');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const leads: Lead[] = data.leads;
  
  console.log(`✅ Loaded ${leads.length} leads`);
  console.log(`   Date range: ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}`);
  console.log(`   Sources: Calendar (${data.metadata.sources.calendar}), Email (${data.metadata.sources.email}), Billy (${data.metadata.sources.billy})`);
  
  // Generate embeddings for all leads
  console.log('\n🔄 Generating embeddings...');
  console.log('   This may take a few minutes...');
  
  const embeddings: Map<string, number[]> = new Map();
  const leadTexts: Map<string, string> = new Map();
  
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const key = `${i}`;
    
    const text = formatLeadForEmbedding({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
    });
    
    leadTexts.set(key, text);
    
    try {
      const embedding = await generateEmbedding(text);
      embeddings.set(key, embedding);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${leads.length} (${Math.round((i + 1) / leads.length * 100)}%)`);
      }
    } catch (error) {
      console.log(`   ⚠️  Failed to generate embedding for lead ${i + 1}`);
    }
  }
  
  console.log(`✅ Generated ${embeddings.size} embeddings`);
  
  // Manually label some duplicates for testing
  console.log('\n📝 Identifying Known Duplicates...');
  console.log('   Looking for obvious duplicates in data...');
  
  const knownDuplicates: Set<string> = new Set();
  const emailMap: Map<string, string[]> = new Map();
  
  // Group by email to find duplicates
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    if (lead.email) {
      const normalizedEmail = lead.email.toLowerCase();
      if (!emailMap.has(normalizedEmail)) {
        emailMap.set(normalizedEmail, []);
      }
      emailMap.get(normalizedEmail)!.push(`${i}`);
    }
  }
  
  // Mark duplicates (same email = duplicate)
  for (const [email, leadIds] of emailMap.entries()) {
    if (leadIds.length > 1) {
      console.log(`   Found ${leadIds.length} leads with email: ${email}`);
      for (let i = 1; i < leadIds.length; i++) {
        knownDuplicates.add(`${leadIds[0]}-${leadIds[i]}`);
      }
    }
  }
  
  console.log(`✅ Identified ${knownDuplicates.size} known duplicate pairs`);
  
  // Test different thresholds
  const thresholds = [0.70, 0.75, 0.80, 0.85, 0.90, 0.95];
  const results: TestResult[] = [];
  
  console.log('\n🧪 Testing Thresholds...');
  console.log('='.repeat(60));
  
  for (const threshold of thresholds) {
    console.log(`\nTesting threshold: ${threshold}`);
    console.log('-'.repeat(60));
    
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;
    
    // Test all pairs
    const tested = new Set<string>();
    
    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        const pair = `${i}-${j}`;
        if (tested.has(pair)) continue;
        tested.add(pair);
        
        const embedding1 = embeddings.get(`${i}`);
        const embedding2 = embeddings.get(`${j}`);
        
        if (!embedding1 || !embedding2) continue;
        
        const similarity = cosineSimilarity(embedding1, embedding2);
        const isDuplicate = knownDuplicates.has(pair);
        const predictedDuplicate = similarity >= threshold;
        
        if (isDuplicate && predictedDuplicate) {
          truePositives++;
        } else if (!isDuplicate && predictedDuplicate) {
          falsePositives++;
        } else if (!isDuplicate && !predictedDuplicate) {
          trueNegatives++;
        } else if (isDuplicate && !predictedDuplicate) {
          falseNegatives++;
        }
      }
    }
    
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    const accuracy = (truePositives + trueNegatives) / (truePositives + falsePositives + trueNegatives + falseNegatives) || 0;
    
    results.push({
      threshold,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      precision,
      recall,
      f1Score,
      accuracy,
    });
    
    console.log(`TP: ${truePositives}, FP: ${falsePositives}, TN: ${trueNegatives}, FN: ${falseNegatives}`);
    console.log(`Precision: ${(precision * 100).toFixed(2)}%, Recall: ${(recall * 100).toFixed(2)}%, F1: ${(f1Score * 100).toFixed(2)}%, Accuracy: ${(accuracy * 100).toFixed(2)}%`);
  }
  
  // Find best threshold
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\nThreshold | Precision | Recall | F1 Score | Accuracy');
  console.log('-'.repeat(60));
  
  for (const result of results) {
    const current = result.threshold === 0.85 ? ' ← CURRENT' : '';
    console.log(
      `${result.threshold.toFixed(2)}      | ` +
      `${(result.precision * 100).toFixed(1).padStart(6)}%  | ` +
      `${(result.recall * 100).toFixed(1).padStart(5)}% | ` +
      `${(result.f1Score * 100).toFixed(1).padStart(6)}% | ` +
      `${(result.accuracy * 100).toFixed(1).padStart(6)}%${current}`
    );
  }
  
  // Find optimal threshold (highest F1 score)
  const optimal = results.reduce((best, current) => 
    current.f1Score > best.f1Score ? current : best
  );
  
  console.log('\n🎯 RECOMMENDATION:');
  console.log('-'.repeat(60));
  console.log(`Optimal Threshold: ${optimal.threshold}`);
  console.log(`F1 Score: ${(optimal.f1Score * 100).toFixed(2)}%`);
  console.log(`Precision: ${(optimal.precision * 100).toFixed(2)}%`);
  console.log(`Recall: ${(optimal.recall * 100).toFixed(2)}%`);
  console.log(`Accuracy: ${(optimal.accuracy * 100).toFixed(2)}%`);
  
  if (optimal.threshold !== 0.85) {
    console.log(`\n💡 Consider updating threshold from 0.85 to ${optimal.threshold}`);
    console.log(`   Update in: server/db.ts (line ~470)`);
    console.log(`   Change: if (similarity > 0.85) to if (similarity > ${optimal.threshold})`);
  } else {
    console.log(`\n✅ Current threshold (0.85) is optimal!`);
  }
  
  console.log('\n✅ Threshold tuning complete!');
  process.exit(0);
}

// Run tuning
tuneThreshold().catch((error) => {
  console.error('\n❌ Tuning failed:', error);
  process.exit(1);
});
