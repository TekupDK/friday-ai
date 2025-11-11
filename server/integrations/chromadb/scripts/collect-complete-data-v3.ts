/**
 * COMPLETE DATA COLLECTION V3 - Start forfra med ALLE korrekte parametre
 * 
 * Forbedringer:
 * 1. Korrekte lead sources (Leadpoint, Rengøring.nu, AdHelp)
 * 2. Spam filtering
 * 3. Tid og estimat parsing (timer, minutter, faktisk vs estimat)
 * 4. Property size (m²)
 * 5. Service types (REN-001 til REN-005)
 * 6. Access codes, special instructions
 * 7. Better Gmail → Calendar → Billy linking
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.dev') });

import { listCalendarEvents, searchGmailThreads, getGmailThread } from '../../../google-api';
import { getCustomers } from '../../../billy';

console.log('📊 COMPLETE DATA COLLECTION V3 - START FORFRA\n');
console.log('='.repeat(70));

// Lead sources
enum LeadSource {
  LEADPOINT = 'Leadpoint.dk',
  RENGORINGNU = 'Rengøring.nu',
  ADHELP = 'AdHelp',
  DIRECT = 'Direct',
  EXISTING = 'Existing',
  UNKNOWN = 'Unknown',
}

interface TimeEstimate {
  estimatedHours?: number;
  actualHours?: number;
  totalMinutes?: number;
  text?: string;
}

interface Lead {
  id: string;
  source: 'gmail' | 'calendar' | 'billy';
  leadSource?: LeadSource;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address?: string;
  
  // Gmail specific
  gmailThreadId?: string;
  gmailSubject?: string;
  gmailDate?: string;
  
  // Calendar specific
  calendarEventId?: string;
  calendarTitle?: string;
  calendarDate?: string;
  calendarLocation?: string;
  serviceType?: string;
  timeEstimate?: TimeEstimate;
  propertySize?: string;
  price?: number;
  accessCode?: string;
  specialInstructions?: string;
  
  // Billy specific
  billyCustomerId?: string;
  
  rawData: any;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Spam filter
const spamDomains = [
  'stripe.com', 'google.com', 'tasklet.com', 'feedhive.com', 
  'bubble.io', 'lindy.ai', 'wordpress.com', 'airtable.com',
  'booking.com', 'link.com', 'linkedin.com',
];

const spamKeywords = [
  'invoice', 'subscription', 'verification code', 'password reset',
  'lifetime deal', 'demo day', 'newsletter', 'wp statistics',
  'calendar notification', 'hiring', 'security notification',
];

function isSpam(email: string, subject: string): boolean {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  for (const domain of spamDomains) {
    if (emailLower.includes(domain)) return true;
  }
  
  for (const keyword of spamKeywords) {
    if (subjectLower.includes(keyword)) return true;
  }
  
  return false;
}

// Identify lead source
function identifyLeadSource(email: string, subject: string): LeadSource {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Leadpoint / Rengøring Aarhus
  if (
    subjectLower.includes('rengøring aarhus') ||
    subjectLower.includes('leadpoint') ||
    emailLower.includes('leadpoint.dk') ||
    subjectLower.includes('formular via rengøring aarhus') ||
    subjectLower.includes('opkald via rengøring aarhus')
  ) {
    return LeadSource.LEADPOINT;
  }
  
  // Rengøring.nu / Leadmail
  if (
    subjectLower.includes('rengøring.nu') ||
    subjectLower.includes('nettbureau') ||
    emailLower.includes('leadmail.no')
  ) {
    return LeadSource.RENGORINGNU;
  }
  
  // AdHelp
  if (
    emailLower.includes('adhelp.dk') ||
    emailLower.includes('mw@adhelp.dk') ||
    emailLower.includes('sp@adhelp.dk')
  ) {
    return LeadSource.ADHELP;
  }
  
  // Existing customer
  if (subject.match(/^(re:|sv:)/i) || subjectLower.includes('faktura nr')) {
    return LeadSource.EXISTING;
  }
  
  // Direct
  if (subjectLower.includes('rengøring') || subjectLower.includes('tilbud')) {
    return LeadSource.DIRECT;
  }
  
  return LeadSource.UNKNOWN;
}

// Parse time estimate
function parseTimeEstimate(text: string): TimeEstimate | undefined {
  const result: TimeEstimate = {};
  
  // "X timer" eller "X-Y timer"
  const hoursMatch = text.match(/(\d+(?:-\d+)?)\s*timer/i);
  if (hoursMatch) {
    const hours = hoursMatch[1];
    if (hours.includes('-')) {
      const [min, max] = hours.split('-').map(Number);
      result.estimatedHours = (min + max) / 2;
    } else {
      result.estimatedHours = parseInt(hours);
    }
    result.text = hoursMatch[0];
  }
  
  // "X arbejdstimer" (faktisk tid)
  const actualMatch = text.match(/(\d+(?:[.,]\d+)?)\s*arbejdstimer/i);
  if (actualMatch) {
    result.actualHours = parseFloat(actualMatch[1].replace(',', '.'));
  }
  
  // "X personer × Y timer"
  const personHoursMatch = text.match(/(\d+)\s*personer?\s*[×x]\s*(\d+(?:[.,]\d+)?)\s*timer/i);
  if (personHoursMatch) {
    const persons = parseInt(personHoursMatch[1]);
    const hours = parseFloat(personHoursMatch[2].replace(',', '.'));
    result.estimatedHours = persons * hours;
    result.text = `${persons}p × ${hours}h = ${result.estimatedHours}h`;
  }
  
  if (result.estimatedHours) {
    result.totalMinutes = result.estimatedHours * 60;
  }
  
  return Object.keys(result).length > 0 ? result : undefined;
}

async function collectCompleteData() {
  const startDate = new Date('2025-07-01T00:00:00Z');
  const endDate = new Date('2025-12-31T23:59:59Z');
  
  console.log('\n📋 Collection Parameters:');
  console.log('-'.repeat(70));
  console.log(`Period: July 1 - December 31, 2025`);
  console.log(`Sources: Gmail (filtered), Calendar, Billy`);
  console.log(`Lead sources: Leadpoint, Rengøring.nu, AdHelp`);
  console.log(`Spam filtering: ENABLED`);
  
  const allLeads: Lead[] = [];
  let spamCount = 0;
  
  // STEP 1: Gmail with spam filtering
  console.log('\n\n📧 STEP 1: Gmail Collection (with spam filtering)');
  console.log('='.repeat(70));
  
  try {
    const query = `after:${Math.floor(startDate.getTime() / 1000)} before:${Math.floor(endDate.getTime() / 1000)}`;
    
    const threads = await searchGmailThreads({
      query,
      maxResults: 500,
    });
    
    console.log(`✅ Found ${threads.length} Gmail threads`);
    console.log('   Filtering spam...');
    
    for (let i = 0; i < threads.length; i++) {
      if (i > 0 && i % 50 === 0) {
        await sleep(200);
        console.log(`   Progress: ${i}/${threads.length} processed`);
      }
      
      try {
        const threadDetail = await getGmailThread(threads[i].id);
        if (!threadDetail) continue;
        
        const threadData = threadDetail as any;
        const from = threadData.from || '';
        const subject = threadData.subject || '';
        
        // Extract email
        const emailMatch = from.match(/([^<]+)?<?([^>@]+@[^>]+)>?/);
        if (!emailMatch) continue;
        
        const name = emailMatch[1]?.trim() || emailMatch[2].split('@')[0];
        const email = emailMatch[2].trim();
        
        // Spam filter
        if (isSpam(email, subject)) {
          spamCount++;
          continue;
        }
        
        // Identify lead source
        const leadSource = identifyLeadSource(email, subject);
        
        allLeads.push({
          id: `GMAIL_${threads[i].id}`,
          source: 'gmail',
          leadSource,
          name,
          email,
          phone: null,
          company: email.split('@')[1],
          gmailThreadId: threads[i].id,
          gmailSubject: subject,
          gmailDate: threadData.date,
          rawData: threadData,
        });
        
      } catch (error) {
        // Skip failed threads
      }
    }
    
    console.log(`✅ Collected ${allLeads.filter(l => l.source === 'gmail').length} real Gmail leads`);
    console.log(`❌ Filtered ${spamCount} spam emails`);
    
  } catch (error) {
    console.log('❌ Gmail collection failed:', error);
  }
  
  // STEP 2: Calendar with full parsing
  console.log('\n\n📅 STEP 2: Calendar Collection (full parsing)');
  console.log('='.repeat(70));
  
  try {
    const events = await listCalendarEvents({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 500,
    });
    
    console.log(`✅ Found ${events.length} calendar events`);
    console.log('   Parsing event details...');
    
    for (const event of events) {
      const title = event.summary || '';
      const description = (event as any).description || '';
      const location = (event as any).location || '';
      const combined = title + ' ' + description;
      
      // Extract email
      const emailMatches = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
      const email = emailMatches ? emailMatches[0] : null;
      
      // Extract phone
      const phoneMatches = description.match(/(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g);
      const phone = phoneMatches ? phoneMatches[0].replace(/\s/g, '') : null;
      
      // Extract name from title
      const nameMatch = title.match(/([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/);
      const name = nameMatch ? nameMatch[0] : (email ? email.split('@')[0] : 'Unknown');
      
      // Parse time estimate
      const timeEstimate = parseTimeEstimate(combined);
      
      // Property size
      const m2Match = description.match(/(\d+)\s*m²/i);
      const propertySize = m2Match ? m2Match[1] + ' m²' : undefined;
      
      // Address
      const addrMatch = description.match(/(?:Adr|Adresse|Lokation)[:-]?\s*([^\n]+)/i);
      const address = addrMatch ? addrMatch[1].trim() : location;
      
      // Price
      const priceMatch = description.match(/(\d+[.,]?\d*)\s*kr/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : undefined;
      
      // Access code
      const codeMatch = description.match(/(?:kode|code)[:\s]*(\d+)/i);
      const accessCode = codeMatch ? codeMatch[1] : undefined;
      
      // Special instructions
      let specialInstructions: string | undefined;
      if (description.includes('Ingen sulfo')) specialInstructions = 'Ingen sulfo på trægulve';
      else if (description.includes('svanemærket')) specialInstructions = 'Svanemærkede produkter';
      
      // Service type
      let serviceType = 'Unknown';
      if (combined.toLowerCase().includes('fast rengøring')) serviceType = 'REN-005';
      else if (combined.toLowerCase().includes('flytte')) serviceType = 'REN-003';
      else if (combined.toLowerCase().includes('hoved')) serviceType = 'REN-002';
      else if (combined.toLowerCase().includes('erhverv') || combined.toLowerCase().includes('restaurant')) serviceType = 'REN-004';
      else serviceType = 'REN-001';
      
      allLeads.push({
        id: `CAL_${event.id}`,
        source: 'calendar',
        name,
        email,
        phone,
        company: email ? email.split('@')[1] : null,
        address,
        calendarEventId: event.id,
        calendarTitle: title,
        calendarDate: event.start || '',
        calendarLocation: location,
        serviceType,
        timeEstimate,
        propertySize,
        price,
        accessCode,
        specialInstructions,
        rawData: event,
      });
    }
    
    console.log(`✅ Parsed ${allLeads.filter(l => l.source === 'calendar').length} calendar events`);
    
  } catch (error) {
    console.log('❌ Calendar collection failed:', error);
  }
  
  // STEP 3: Billy
  console.log('\n\n💰 STEP 3: Billy Collection');
  console.log('='.repeat(70));
  
  try {
    const customers = await getCustomers();
    
    console.log(`✅ Found ${customers.length} Billy customers`);
    
    for (const customer of customers) {
      const name = (customer as any).name || 'Unknown';
      const phone = (customer as any).phone || null;
      
      allLeads.push({
        id: `BILLY_${customer.id}`,
        source: 'billy',
        name,
        email: null,
        phone,
        company: name,
        billyCustomerId: customer.id,
        rawData: customer,
      });
    }
    
    console.log(`✅ Collected ${allLeads.filter(l => l.source === 'billy').length} Billy customers`);
    
  } catch (error) {
    console.log('❌ Billy collection failed:', error);
  }
  
  // Save raw leads
  const outputPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/complete-leads-v3.json');
  const output = {
    metadata: {
      collected: new Date().toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      counts: {
        total: allLeads.length,
        gmail: allLeads.filter(l => l.source === 'gmail').length,
        calendar: allLeads.filter(l => l.source === 'calendar').length,
        billy: allLeads.filter(l => l.source === 'billy').length,
        spamFiltered: spamCount,
      },
      leadSources: {
        leadpoint: allLeads.filter(l => l.leadSource === LeadSource.LEADPOINT).length,
        rengoringnu: allLeads.filter(l => l.leadSource === LeadSource.RENGORINGNU).length,
        adhelp: allLeads.filter(l => l.leadSource === LeadSource.ADHELP).length,
        direct: allLeads.filter(l => l.leadSource === LeadSource.DIRECT).length,
        existing: allLeads.filter(l => l.leadSource === LeadSource.EXISTING).length,
      }
    },
    leads: allLeads,
  };
  
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COLLECTION SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`\n✅ Total leads collected: ${allLeads.length}`);
  console.log(`   • Gmail: ${output.metadata.counts.gmail} (${spamCount} spam filtered)`);
  console.log(`   • Calendar: ${output.metadata.counts.calendar}`);
  console.log(`   • Billy: ${output.metadata.counts.billy}`);
  
  console.log(`\n📊 Lead sources:`);
  console.log(`   • Leadpoint: ${output.metadata.leadSources.leadpoint}`);
  console.log(`   • Rengøring.nu: ${output.metadata.leadSources.rengoringnu}`);
  console.log(`   • AdHelp: ${output.metadata.leadSources.adhelp}`);
  console.log(`   • Direct: ${output.metadata.leadSources.direct}`);
  console.log(`   • Existing: ${output.metadata.leadSources.existing}`);
  
  const withTimeEstimate = allLeads.filter(l => l.timeEstimate).length;
  const withPropertySize = allLeads.filter(l => l.propertySize).length;
  const withPrice = allLeads.filter(l => l.price).length;
  
  console.log(`\n📋 Parsed data:`);
  console.log(`   • With time estimate: ${withTimeEstimate}`);
  console.log(`   • With property size: ${withPropertySize}`);
  console.log(`   • With price: ${withPrice}`);
  
  console.log('\n✅ Complete data collection V3 DONE!\n');
  
  process.exit(0);
}

collectCompleteData().catch((error) => {
  console.error('\n❌ Collection failed:', error);
  process.exit(1);
});
