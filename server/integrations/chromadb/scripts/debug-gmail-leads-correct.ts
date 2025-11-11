/**
 * Debug Gmail Leads - Find ACTUAL customer leads from Juli-Dec 2025
 * 
 * Filter out spam/marketing and show ONLY real rengøring leads
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 DEBUGGING GMAIL LEADS - FINDING REAL CUSTOMERS\n');
console.log('='.repeat(70));

const googlePath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/google-leads.json');
const googleData = JSON.parse(readFileSync(googlePath, 'utf-8'));

const gmailLeads = googleData.leads.filter((l: any) => l.source === 'gmail');

console.log(`\nTotal Gmail threads: ${gmailLeads.length}\n`);

// Define what is a REAL lead vs spam
const spamDomains = [
  'stripe.com',
  'gumloopmail.com',
  'feedhive.com',
  'tasklet.com',
  'airtable.com',
  'shortwave.com',
  'google.com',
  'azets.com',
  'aliexpress.com',
  'link.com',
  'linkedin.com',
  'facebook.com',
  'wordpress.com',
];

const spamKeywords = [
  'invoice',
  'subscription',
  'verification code',
  'password reset',
  'lifetime deal',
  'demo day',
  'newsletter',
  'update available',
  'wp statistics',
  'calendar',
  'hiring',
];

function isSpam(email: string, subject: string): boolean {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Check spam domains
  for (const domain of spamDomains) {
    if (emailLower.includes(domain)) return true;
  }
  
  // Check spam keywords
  for (const keyword of spamKeywords) {
    if (subjectLower.includes(keyword)) return true;
  }
  
  return false;
}

function isRealLead(subject: string): boolean {
  const subjectLower = subject.toLowerCase();
  
  // Real lead indicators
  const leadIndicators = [
    'rengøring',
    'formular via',
    'flytterengøring',
    'hovedrengøring',
    'fast rengøring',
    'tilbud',
    'booking',
    'faktura nr',
  ];
  
  return leadIndicators.some(indicator => subjectLower.includes(indicator));
}

// Filter for REAL leads
const realLeads = gmailLeads.filter((lead: any) => {
  const email = lead.email || '';
  const subject = lead.rawData.subject || '';
  
  // Must not be spam AND must be real lead
  return !isSpam(email, subject) && isRealLead(subject);
});

const spamLeads = gmailLeads.filter((lead: any) => {
  const email = lead.email || '';
  const subject = lead.rawData.subject || '';
  return isSpam(email, subject);
});

console.log('📊 FILTERING RESULTS:');
console.log('='.repeat(70));
console.log(`Total threads: ${gmailLeads.length}`);
console.log(`✅ Real leads: ${realLeads.length}`);
console.log(`❌ Spam/marketing: ${spamLeads.length}`);
console.log(`❓ Other: ${gmailLeads.length - realLeads.length - spamLeads.length}`);

// Analyze real leads
console.log('\n\n✅ REAL RENGØRING LEADS:');
console.log('='.repeat(70));

// Group by source
const leadSources = {
  rengoringNu: [] as any[],
  formular: [] as any[],
  direct: [] as any[],
  existing: [] as any[],
};

realLeads.forEach((lead: any) => {
  const subject = lead.rawData.subject || '';
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('rengøring.nu') || subjectLower.includes('nettbureau')) {
    leadSources.rengoringNu.push(lead);
  } else if (subjectLower.includes('formular via')) {
    leadSources.formular.push(lead);
  } else if (subject.match(/^(re:|sv:)/i)) {
    leadSources.existing.push(lead);
  } else {
    leadSources.direct.push(lead);
  }
});

console.log(`\n📧 Rengøring.nu leads: ${leadSources.rengoringNu.length}`);
leadSources.rengoringNu.forEach((lead, i) => {
  console.log(`  ${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`     Subject: ${lead.rawData.subject}`);
  console.log(`     Date: ${lead.rawData.date || 'N/A'}`);
});

console.log(`\n📋 Formular leads: ${leadSources.formular.length}`);
leadSources.formular.forEach((lead, i) => {
  console.log(`  ${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`     Subject: ${lead.rawData.subject}`);
  console.log(`     Date: ${lead.rawData.date || 'N/A'}`);
});

console.log(`\n💬 Direct inquiry leads: ${leadSources.direct.length}`);
leadSources.direct.forEach((lead, i) => {
  console.log(`  ${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`     Subject: ${lead.rawData.subject}`);
  console.log(`     Date: ${lead.rawData.date || 'N/A'}`);
});

console.log(`\n🔄 Existing customer leads: ${leadSources.existing.length}`);
leadSources.existing.forEach((lead, i) => {
  console.log(`  ${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`     Subject: ${lead.rawData.subject}`);
  console.log(`     Date: ${lead.rawData.date || 'N/A'}`);
});

// Show sample spam for reference
console.log('\n\n❌ SAMPLE SPAM/MARKETING (filtered out):');
console.log('='.repeat(70));
spamLeads.slice(0, 10).forEach((lead, i) => {
  console.log(`${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`   Subject: ${lead.rawData.subject}`);
});

console.log('\n\n📊 SUMMARY:');
console.log('='.repeat(70));
console.log(`\n✅ REAL CUSTOMER LEADS: ${realLeads.length}`);
console.log(`   • Rengøring.nu: ${leadSources.rengoringNu.length}`);
console.log(`   • Formular: ${leadSources.formular.length}`);
console.log(`   • Direct: ${leadSources.direct.length}`);
console.log(`   • Existing customers: ${leadSources.existing.length}`);

console.log(`\n❌ Filtered out: ${spamLeads.length} spam/marketing emails`);

console.log(`\n💡 PROBLEM IDENTIFIED:`);
console.log(`   The Gmail collection included ${spamLeads.length} irrelevant emails!`);
console.log(`   We should only use the ${realLeads.length} real customer leads.`);

console.log('\n');
process.exit(0);
