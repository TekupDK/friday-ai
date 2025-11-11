/**
 * Collect ENRICHED Data with ALL Available Info
 * 
 * Improvements:
 * 1. Extract emails & phones from calendar descriptions
 * 2. Get MORE Gmail threads (with pagination)
 * 3. Cross-reference Billy + Gmail by name/phone
 * 4. Link calendar events to Gmail threads via email
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.dev') });

import { listCalendarEvents, searchGmailThreads, getGmailThread } from '../../../google-api';
import { getCustomers } from '../../../billy';

console.log('📊 ENRICHED DATA COLLECTION\n');
console.log('='.repeat(70));

interface EnrichedLead {
  source: 'billy' | 'calendar' | 'gmail';
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  gmailThreadId?: string | null;
  rawData: any;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function collectEnrichedData() {
  const startDate = new Date('2025-07-01T00:00:00Z');
  const endDate = new Date('2025-12-31T23:59:59Z');
  
  console.log('\n📋 Parameters:');
  console.log('-'.repeat(70));
  console.log(`Date Range: July 1 - December 31, 2025`);
  console.log(`Billy: ALL customers`);
  console.log(`Calendar: Extract from descriptions`);
  console.log(`Gmail: Up to 1500 threads (with pagination)`);
  
  const collectedLeads: EnrichedLead[] = [];
  const gmailThreads: Map<string, any> = new Map(); // threadId -> thread data
  
  // STEP 1: Collect Gmail (more threads with pagination)
  console.log('\n📧 Step 1: Gmail (Extended Collection)');
  console.log('-'.repeat(70));
  
  try {
    const query = `after:${Math.floor(startDate.getTime() / 1000)} before:${Math.floor(endDate.getTime() / 1000)}`;
    
    let allThreads: any[] = [];
    let pageCount = 0;
    const maxPages = 2; // 2 pages = ~1000 threads (safer)
    
    // Pagination loop
    for (let page = 0; page < maxPages; page++) {
      const threads = await searchGmailThreads({
        query,
        maxResults: 500,
      });
      
      allThreads = allThreads.concat(threads);
      pageCount++;
      
      console.log(`   Page ${pageCount}: ${threads.length} threads (total: ${allThreads.length})`);
      
      if (threads.length < 500) break; // No more pages
      await sleep(500); // Rate limiting
    }
    
    console.log(`✅ Collected ${allThreads.length} Gmail threads total`);
    
    // Extract leads from Gmail
    console.log('   Extracting contact info...');
    
    for (let i = 0; i < allThreads.length; i++) {
      const thread = allThreads[i];
      
      if (i > 0 && i % 50 === 0) {
        await sleep(200);
        console.log(`   Progress: ${i}/${allThreads.length} threads processed`);
      }
      
      try {
        const threadDetail = await getGmailThread(thread.id);
        if (!threadDetail) continue;
        
        // Log every 100 to track progress
        if (i % 100 === 0 && i > 0) {
          console.log(`   [Debug] Processed ${i} threads, extracted ${collectedLeads.filter(l => l.source === 'gmail').length} leads so far`);
        }
        
        const threadData = threadDetail as any;
        gmailThreads.set(thread.id, threadData); // Save for later cross-reference
        
        // Extract from thread
        if (threadData.from) {
          const emailMatch = threadData.from.match(/([^<]+)?<?([^>@]+@[^>]+)>?/);
          if (emailMatch) {
            const name = emailMatch[1]?.trim() || emailMatch[2].split('@')[0];
            const email = emailMatch[2].trim();
            
            if (!email.includes('rendetalje.dk') && !email.includes('noreply') && !email.includes('aliexpress')) {
              collectedLeads.push({
                source: 'gmail',
                name,
                email,
                phone: null,
                company: email.split('@')[1] || null,
                gmailThreadId: thread.id,
                rawData: {
                  threadId: thread.id,
                  subject: threadData.subject,
                  snippet: threadData.snippet || thread.snippet,
                }
              });
            }
          }
        }
      } catch (error: any) {
        // Log but continue
        if (i % 100 === 0) {
          console.log(`   [Debug] Error at thread ${i}: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Extracted ${collectedLeads.filter(l => l.source === 'gmail').length} leads from Gmail`);
    
  } catch (error) {
    console.log('❌ Gmail collection failed:', error);
  }
  
  // STEP 2: Calendar with description parsing
  console.log('\n📅 Step 2: Calendar (Extract from Descriptions)');
  console.log('-'.repeat(70));
  
  try {
    const events = await listCalendarEvents({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 500,
    });
    
    console.log(`✅ Found ${events.length} calendar events`);
    
    for (const event of events) {
      const title = event.summary || '';
      const description = (event as any).description || '';
      
      // Extract email from description
      const emailMatches = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
      
      // Extract phone from description (Danish format)
      const phoneMatches = description.match(/(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g);
      
      // Extract name from title
      const namePatterns = [
        /([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/g
      ];
      
      let names: string[] = [];
      for (const pattern of namePatterns) {
        const matches = title.matchAll(pattern);
        for (const match of matches) {
          const name = match[0].trim();
          if (name.length > 3 && name.split(' ').length >= 2) {
            names.push(name);
          }
        }
      }
      
      // If we have email or phone, this is valuable!
      if (emailMatches || phoneMatches || names.length > 0) {
        const email = emailMatches ? emailMatches[0] : null;
        const phone = phoneMatches ? phoneMatches[0].replace(/\s/g, '') : null;
        const name = names[0] || (email ? email.split('@')[0] : 'Unknown');
        
        // Try to find Gmail thread for this email
        let gmailThreadId = null;
        if (email) {
          for (const [threadId, thread] of gmailThreads.entries()) {
            if (thread.from && thread.from.toLowerCase().includes(email.toLowerCase())) {
              gmailThreadId = threadId;
              break;
            }
          }
        }
        
        collectedLeads.push({
          source: 'calendar',
          name,
          email,
          phone,
          company: email ? email.split('@')[1] : null,
          gmailThreadId,
          rawData: {
            eventTitle: title,
            eventStart: event.start,
            eventLocation: (event as any).location,
            description: description.substring(0, 200), // Save snippet
          }
        });
      }
    }
    
    console.log(`✅ Extracted ${collectedLeads.filter(l => l.source === 'calendar').length} leads from calendar`);
    
  } catch (error) {
    console.log('❌ Calendar collection failed:', error);
  }
  
  // STEP 3: Billy (cross-reference with Gmail)
  console.log('\n💰 Step 3: Billy (Cross-Reference with Gmail)');
  console.log('-'.repeat(70));
  
  try {
    const billyCustomers = await getCustomers();
    
    console.log(`✅ Found ${billyCustomers.length} Billy customers`);
    
    for (const customer of billyCustomers) {
      const name = (customer as any).name || 'Unknown';
      const phone = (customer as any).phone || null;
      
      // Try to find email from Gmail by matching name
      let matchedEmail = null;
      let gmailThreadId = null;
      
      for (const lead of collectedLeads) {
        if (lead.source === 'gmail' && lead.email) {
          // Fuzzy name match
          const leadName = lead.name.toLowerCase().trim();
          const billyName = name.toLowerCase().trim();
          
          if (leadName.includes(billyName) || billyName.includes(leadName)) {
            matchedEmail = lead.email;
            gmailThreadId = lead.gmailThreadId;
            break;
          }
        }
      }
      
      collectedLeads.push({
        source: 'billy',
        name,
        email: matchedEmail, // Enriched from Gmail!
        phone,
        company: name,
        gmailThreadId,
        rawData: {
          billyId: customer.id,
          customerData: customer,
        }
      });
    }
    
    const billyWithEmail = collectedLeads.filter(l => l.source === 'billy' && l.email).length;
    console.log(`✅ Extracted ${collectedLeads.filter(l => l.source === 'billy').length} Billy customers`);
    console.log(`✅ Enriched ${billyWithEmail} Billy customers with email from Gmail!`);
    
  } catch (error) {
    console.log('❌ Billy collection failed:', error);
  }
  
  // STEP 4: Deduplication & Save
  console.log('\n🔄 Deduplicating...');
  console.log('-'.repeat(70));
  
  const uniqueLeads = new Map<string, EnrichedLead>();
  
  for (const lead of collectedLeads) {
    const key = lead.email?.toLowerCase() || lead.phone || lead.name.toLowerCase();
    if (!uniqueLeads.has(key)) {
      uniqueLeads.set(key, lead);
    } else {
      // Merge data if duplicate found
      const existing = uniqueLeads.get(key)!;
      if (!existing.email && lead.email) existing.email = lead.email;
      if (!existing.phone && lead.phone) existing.phone = lead.phone;
      if (!existing.gmailThreadId && lead.gmailThreadId) existing.gmailThreadId = lead.gmailThreadId;
    }
  }
  
  console.log(`✅ ${collectedLeads.length} total → ${uniqueLeads.size} unique leads`);
  
  // Save
  const outputPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/enriched-leads.json');
  const output = {
    metadata: {
      collected: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      sources: {
        billy: collectedLeads.filter(l => l.source === 'billy').length,
        calendar: collectedLeads.filter(l => l.source === 'calendar').length,
        gmail: collectedLeads.filter(l => l.source === 'gmail').length,
      },
      totalLeads: collectedLeads.length,
      uniqueLeads: uniqueLeads.size,
      enrichmentStats: {
        withEmail: Array.from(uniqueLeads.values()).filter(l => l.email).length,
        withPhone: Array.from(uniqueLeads.values()).filter(l => l.phone).length,
        withGmailLink: Array.from(uniqueLeads.values()).filter(l => l.gmailThreadId).length,
      }
    },
    leads: Array.from(uniqueLeads.values()),
  };
  
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);
  
  // Summary
  const stats = output.metadata.enrichmentStats;
  console.log('\n' + '='.repeat(70));
  console.log('📊 ENRICHED DATA SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nTotal: ${output.metadata.uniqueLeads} unique leads`);
  console.log(`  • Billy: ${output.metadata.sources.billy}`);
  console.log(`  • Calendar: ${output.metadata.sources.calendar}`);
  console.log(`  • Gmail: ${output.metadata.sources.gmail}`);
  console.log(`\nEnrichment:`);
  console.log(`  • With email: ${stats.withEmail} (${Math.round(stats.withEmail/output.metadata.uniqueLeads*100)}%)`);
  console.log(`  • With phone: ${stats.withPhone} (${Math.round(stats.withPhone/output.metadata.uniqueLeads*100)}%)`);
  console.log(`  • With Gmail link: ${stats.withGmailLink} (${Math.round(stats.withGmailLink/output.metadata.uniqueLeads*100)}%)`);
  
  console.log('\n✅ Enriched data collection complete!');
  console.log('');
  
  process.exit(0);
}

collectEnrichedData().catch((error) => {
  console.error('\n❌ Collection failed:', error);
  process.exit(1);
});
