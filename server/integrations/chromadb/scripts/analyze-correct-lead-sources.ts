/**
 * Analyze CORRECT Lead Sources
 * 
 * Based on actual lead flow:
 * 1. Leadpoint.dk / "Rengøring Aarhus" - Primary source
 * 2. Rengøring.nu (via Leadmail.no) - Secondary
 * 3. AdHelp (mw@adhelp.dk / sp@adhelp.dk) - New source
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 ANALYZING CORRECT LEAD SOURCES\n');
console.log('='.repeat(70));

const googlePath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/google-leads.json');
const googleData = JSON.parse(readFileSync(googlePath, 'utf-8'));

const gmailLeads = googleData.leads.filter((l: any) => l.source === 'gmail');

console.log(`Total Gmail threads: ${gmailLeads.length}\n`);

// CORRECT lead source identification
enum LeadSource {
  LEADPOINT = 'Leadpoint.dk (Rengøring Aarhus)',
  RENGORINGNU = 'Rengøring.nu (Leadmail.no)',
  ADHELP = 'AdHelp',
  DIRECT = 'Direct Customer Contact',
  EXISTING = 'Existing Customer',
  SPAM = 'Spam/Marketing',
}

function identifyCorrectSource(email: string, subject: string, from: string): LeadSource {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const fromLower = from.toLowerCase();
  
  // 1. Leadpoint.dk / "Rengøring Aarhus"
  if (
    subjectLower.includes('rengøring aarhus') ||
    subjectLower.includes('leadpoint') ||
    emailLower.includes('leadpoint.dk') ||
    emailLower.includes('system@leadpoint.dk') ||
    subjectLower.includes('formular via rengøring aarhus') ||
    subjectLower.includes('opkald via rengøring aarhus')
  ) {
    return LeadSource.LEADPOINT;
  }
  
  // 2. Rengøring.nu (via Leadmail.no)
  if (
    subjectLower.includes('rengøring.nu') ||
    subjectLower.includes('nettbureau') ||
    emailLower.includes('leadmail.no') ||
    emailLower.includes('kontakt@leadmail.no')
  ) {
    return LeadSource.RENGORINGNU;
  }
  
  // 3. AdHelp
  if (
    emailLower.includes('adhelp.dk') ||
    emailLower.includes('mw@adhelp.dk') ||
    emailLower.includes('sp@adhelp.dk')
  ) {
    return LeadSource.ADHELP;
  }
  
  // Spam/Marketing
  const spamDomains = ['stripe.com', 'google.com', 'tasklet.com', 'feedhive.com', 'bubble.io', 'lindy.ai'];
  if (spamDomains.some(domain => emailLower.includes(domain))) {
    return LeadSource.SPAM;
  }
  
  // Existing customer (Re: or Faktura)
  if (subject.match(/^(re:|sv:)/i) || subjectLower.includes('faktura nr')) {
    return LeadSource.EXISTING;
  }
  
  // Direct customer inquiry
  return LeadSource.DIRECT;
}

// Categorize all leads
const leadsBySource = {
  [LeadSource.LEADPOINT]: [] as any[],
  [LeadSource.RENGORINGNU]: [] as any[],
  [LeadSource.ADHELP]: [] as any[],
  [LeadSource.DIRECT]: [] as any[],
  [LeadSource.EXISTING]: [] as any[],
  [LeadSource.SPAM]: [] as any[],
};

gmailLeads.forEach((lead: any) => {
  const email = lead.email || '';
  const subject = lead.rawData.subject || '';
  const from = lead.rawData.from || '';
  
  const source = identifyCorrectSource(email, subject, from);
  leadsBySource[source].push(lead);
});

// Report
console.log('📊 LEAD SOURCE BREAKDOWN (CORRECT):');
console.log('='.repeat(70));

const totalRealLeads = 
  leadsBySource[LeadSource.LEADPOINT].length +
  leadsBySource[LeadSource.RENGORINGNU].length +
  leadsBySource[LeadSource.ADHELP].length;

console.log(`\n✅ TOTAL REAL LEADS: ${totalRealLeads}`);
console.log(`\n1️⃣  Leadpoint.dk (Rengøring Aarhus): ${leadsBySource[LeadSource.LEADPOINT].length} leads`);
console.log(`   Volume: Largest source (80-90 leads/måned expected)`);
console.log(`   Quality: Bedre conversion rate`);
console.log(`   ✅ Can reply directly`);

console.log(`\n2️⃣  Rengøring.nu (Leadmail.no): ${leadsBySource[LeadSource.RENGORINGNU].length} leads`);
console.log(`   Volume: Secondary source`);
console.log(`   Quality: Lavere conversion rate`);
console.log(`   ⚠️  NEVER reply directly! Extract data → new email to customer`);

console.log(`\n3️⃣  AdHelp: ${leadsBySource[LeadSource.ADHELP].length} leads`);
console.log(`   Volume: New/early phase`);
console.log(`   ⚠️  Always send tilbud directly to customer email, not AdHelp`);

console.log(`\n💬 Direct customer contact: ${leadsBySource[LeadSource.DIRECT].length}`);
console.log(`🔄 Existing customers: ${leadsBySource[LeadSource.EXISTING].length}`);
console.log(`❌ Spam/marketing: ${leadsBySource[LeadSource.SPAM].length}`);

// Show samples
console.log('\n\n' + '='.repeat(70));
console.log('📧 LEADPOINT.DK LEADS (Rengøring Aarhus):');
console.log('='.repeat(70));

leadsBySource[LeadSource.LEADPOINT].slice(0, 10).forEach((lead, i) => {
  console.log(`\n${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`   Subject: ${lead.rawData.subject}`);
  console.log(`   Date: ${lead.rawData.date || 'N/A'}`);
  console.log(`   Thread ID: ${lead.rawData.threadId}`);
});

console.log('\n\n' + '='.repeat(70));
console.log('📧 RENGØRING.NU LEADS (via Leadmail.no):');
console.log('='.repeat(70));

leadsBySource[LeadSource.RENGORINGNU].slice(0, 10).forEach((lead, i) => {
  console.log(`\n${i + 1}. ${lead.name} (${lead.email})`);
  console.log(`   Subject: ${lead.rawData.subject}`);
  console.log(`   Date: ${lead.rawData.date || 'N/A'}`);
  console.log(`   Thread ID: ${lead.rawData.threadId}`);
  console.log(`   ⚠️  Remember: Extract data → New email to ${lead.email}`);
});

if (leadsBySource[LeadSource.ADHELP].length > 0) {
  console.log('\n\n' + '='.repeat(70));
  console.log('📧 ADHELP LEADS:');
  console.log('='.repeat(70));

  leadsBySource[LeadSource.ADHELP].forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.name} (${lead.email})`);
    console.log(`   Subject: ${lead.rawData.subject}`);
    console.log(`   Date: ${lead.rawData.date || 'N/A'}`);
  });
}

// Summary with percentages
console.log('\n\n' + '='.repeat(70));
console.log('📊 FINAL SUMMARY:');
console.log('='.repeat(70));

console.log(`\n✅ REAL CUSTOMER LEADS: ${totalRealLeads}`);
console.log(`   • Leadpoint (Rengøring Aarhus): ${leadsBySource[LeadSource.LEADPOINT].length} (${Math.round(leadsBySource[LeadSource.LEADPOINT].length/totalRealLeads*100)}%)`);
console.log(`   • Rengøring.nu (Leadmail): ${leadsBySource[LeadSource.RENGORINGNU].length} (${Math.round(leadsBySource[LeadSource.RENGORINGNU].length/totalRealLeads*100)}%)`);
console.log(`   • AdHelp: ${leadsBySource[LeadSource.ADHELP].length} (${Math.round(leadsBySource[LeadSource.ADHELP].length/totalRealLeads*100)}%)`);

console.log(`\n💬 Other:`);
console.log(`   • Direct customer contact: ${leadsBySource[LeadSource.DIRECT].length}`);
console.log(`   • Existing customers: ${leadsBySource[LeadSource.EXISTING].length}`);

console.log(`\n❌ Filtered: ${leadsBySource[LeadSource.SPAM].length} spam/marketing`);

console.log(`\n💡 INSIGHTS:`);
console.log(`   • Leadpoint is ${Math.round(leadsBySource[LeadSource.LEADPOINT].length/leadsBySource[LeadSource.RENGORINGNU].length*10)/10}x larger than Rengøring.nu`);
console.log(`   • ${Math.round((totalRealLeads / gmailLeads.length) * 100)}% of Gmail threads are real customer leads`);
console.log(`   • ${leadsBySource[LeadSource.SPAM].length} spam emails need filtering`);

console.log('\n');
process.exit(0);
