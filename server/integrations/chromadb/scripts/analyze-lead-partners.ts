/**
 * Analyze Lead Partners
 * 
 * Identify HOW different lead partners send leads:
 * - Rengøring.nu (Nettbureau AS)
 * - Direct email inquiries
 * - Phone inquiries
 * - Formular submissions
 * - Other sources
 * 
 * Each partner has different email format!
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 ANALYZING LEAD PARTNERS & EMAIL PATTERNS\n');
console.log('='.repeat(70));

const googlePath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/google-leads.json');
const googleData = JSON.parse(readFileSync(googlePath, 'utf-8'));

const gmailLeads = googleData.leads.filter((l: any) => l.source === 'gmail');

console.log(`\n📧 Gmail threads: ${gmailLeads.length}\n`);

// Patterns to identify lead sources
const patterns = {
  rengoringNu: /rengøring\.nu|nettbureau\s*as/i,
  formular: /formular\s*via|form\s*submission/i,
  faktura: /faktura\s*nr|invoice/i,
  rebooking: /re:|sv:|tilbage|rebook/i,
  direct: /^(?!re:|sv:)/i, // Doesn't start with Re: or Sv:
};

interface LeadSource {
  name: string;
  count: number;
  subjects: string[];
  emails: string[];
  patterns: string[];
}

const sources = new Map<string, LeadSource>();

function addToSource(sourceName: string, subject: string, email: string, pattern: string) {
  if (!sources.has(sourceName)) {
    sources.set(sourceName, {
      name: sourceName,
      count: 0,
      subjects: [],
      emails: [],
      patterns: []
    });
  }
  
  const source = sources.get(sourceName)!;
  source.count++;
  
  if (!source.subjects.includes(subject) && source.subjects.length < 10) {
    source.subjects.push(subject);
  }
  
  if (!source.emails.includes(email) && source.emails.length < 10) {
    source.emails.push(email);
  }
  
  if (!source.patterns.includes(pattern)) {
    source.patterns.push(pattern);
  }
}

console.log('🔍 IDENTIFYING LEAD SOURCES...\n');

gmailLeads.forEach((lead: any) => {
  const subject = lead.rawData.subject || '';
  const email = lead.email || '';
  const from = lead.rawData.from || '';
  
  // Classify lead source
  if (patterns.rengoringNu.test(subject) || patterns.rengoringNu.test(from)) {
    addToSource('Rengøring.nu (Nettbureau AS)', subject, email, 'Subject/From contains "rengøring.nu" or "nettbureau"');
  } else if (patterns.formular.test(subject)) {
    addToSource('Formular submission', subject, email, 'Subject contains "Formular via"');
  } else if (patterns.faktura.test(subject)) {
    addToSource('Existing customer (Faktura)', subject, email, 'Subject contains "Faktura"');
  } else if (patterns.rebooking.test(subject)) {
    addToSource('Existing customer (Re:)', subject, email, 'Subject starts with Re: or Sv:');
  } else {
    addToSource('Direct inquiry', subject, email, 'Direct email contact');
  }
});

// Sort by count
const sortedSources = Array.from(sources.values()).sort((a, b) => b.count - a.count);

console.log('📊 LEAD SOURCE BREAKDOWN:');
console.log('='.repeat(70));

sortedSources.forEach((source, i) => {
  console.log(`\n${i + 1}. 📧 ${source.name}`);
  console.log(`   Count: ${source.count} leads (${Math.round(source.count/gmailLeads.length*100)}%)`);
  console.log(`   Patterns:`);
  source.patterns.forEach(p => console.log(`     • ${p}`));
  
  if (source.subjects.length > 0) {
    console.log(`   Sample subjects:`);
    source.subjects.slice(0, 5).forEach(s => {
      const truncated = s.length > 70 ? s.substring(0, 70) + '...' : s;
      console.log(`     • "${truncated}"`);
    });
  }
});

// Now analyze specific lead partner formats
console.log('\n\n' + '='.repeat(70));
console.log('📋 DETAILED ANALYSIS: Rengøring.nu Format');
console.log('='.repeat(70));

const rengoringNuLeads = gmailLeads.filter((l: any) => {
  const subject = l.rawData.subject || '';
  const from = l.rawData.from || '';
  return patterns.rengoringNu.test(subject) || patterns.rengoringNu.test(from);
});

console.log(`\nTotal Rengøring.nu leads: ${rengoringNuLeads.length}\n`);

if (rengoringNuLeads.length > 0) {
  console.log('Sample emails from Rengøring.nu:\n');
  
  rengoringNuLeads.slice(0, 10).forEach((lead: any, i: number) => {
    console.log(`${i + 1}. Subject: ${lead.rawData.subject}`);
    console.log(`   From: ${lead.rawData.from || 'N/A'}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Snippet: ${(lead.rawData.snippet || '').substring(0, 100)}...`);
    console.log('');
  });
}

// Analyze formular submissions
console.log('\n' + '='.repeat(70));
console.log('📋 DETAILED ANALYSIS: Formular Submissions');
console.log('='.repeat(70));

const formularLeads = gmailLeads.filter((l: any) => 
  patterns.formular.test(l.rawData.subject || '')
);

console.log(`\nTotal Formular submissions: ${formularLeads.length}\n`);

if (formularLeads.length > 0) {
  console.log('Sample formular emails:\n');
  
  formularLeads.slice(0, 10).forEach((lead: any, i: number) => {
    console.log(`${i + 1}. Subject: ${lead.rawData.subject}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Snippet: ${(lead.rawData.snippet || '').substring(0, 150)}...`);
    console.log('');
  });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY & RECOMMENDATIONS');
console.log('='.repeat(70));

console.log('\n✅ IDENTIFIED LEAD SOURCES:');
sortedSources.forEach((source, i) => {
  console.log(`${i + 1}. ${source.name}: ${source.count} leads (${Math.round(source.count/gmailLeads.length*100)}%)`);
});

console.log('\n💡 RECOMMENDATIONS FOR DATA ENRICHMENT:');
console.log('  1. Parse Rengøring.nu email format specifically');
console.log('  2. Extract customer info from formular submissions');
console.log('  3. Link "Re:" emails to original inquiries');
console.log('  4. Track lead source in customer cards');
console.log('  5. Different parsing rules per source');

console.log('\n📧 NEXT STEPS:');
console.log('  • Analyze actual email body content for each source');
console.log('  • Extract structured data (name, phone, address, etc.)');
console.log('  • Build source-specific parsers');
console.log('  • Link Gmail threads to calendar events more accurately');

console.log('\n');
process.exit(0);
