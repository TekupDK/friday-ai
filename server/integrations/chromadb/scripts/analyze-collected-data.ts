/**
 * Analyze All Collected Data
 * 
 * Provides detailed analysis of Billy, Calendar, and Gmail data
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('📊 ANALYZING COLLECTED DATA\n');
console.log('='.repeat(70));

// Load data files
const billyDataPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/real-leads.json');
const googleDataPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/google-leads.json');

const billyData = JSON.parse(readFileSync(billyDataPath, 'utf-8'));
const googleData = JSON.parse(readFileSync(googleDataPath, 'utf-8'));

// Analysis
console.log('\n📦 DATA SOURCES');
console.log('-'.repeat(70));
console.log(`Billy Customers: ${billyData.leads.length} leads (${billyData.metadata.uniqueLeads} unique)`);
console.log(`Google Calendar: ${googleData.leads.filter((l: any) => l.source === 'calendar').length} leads`);
console.log(`Gmail: ${googleData.leads.filter((l: any) => l.source === 'gmail').length} leads`);
console.log(`Google Total: ${googleData.metadata.totalLeads} leads (${googleData.metadata.uniqueLeads} unique)`);

// Email coverage
const billyWithEmail = billyData.leads.filter((l: any) => l.email).length;
const googleWithEmail = googleData.leads.filter((l: any) => l.email).length;

console.log('\n📧 EMAIL COVERAGE');
console.log('-'.repeat(70));
console.log(`Billy with email: ${billyWithEmail}/${billyData.leads.length} (${Math.round(billyWithEmail/billyData.leads.length*100)}%)`);
console.log(`Google with email: ${googleWithEmail}/${googleData.leads.length} (${Math.round(googleWithEmail/googleData.leads.length*100)}%)`);

// Company types
const billyCompanyTypes = billyData.leads.reduce((acc: any, lead: any) => {
  const type = lead.rawData?.customerData?.type || 'unknown';
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.log('\n🏢 BILLY CUSTOMER TYPES');
console.log('-'.repeat(70));
Object.entries(billyCompanyTypes).forEach(([type, count]) => {
  console.log(`${type}: ${count}`);
});

// Sample leads by source
console.log('\n📋 SAMPLE LEADS - BILLY (First 10)');
console.log('-'.repeat(70));
billyData.leads.slice(0, 10).forEach((lead: any, i: number) => {
  console.log(`${i + 1}. ${lead.name}`);
  console.log(`   Company: ${lead.company || 'N/A'}`);
  console.log(`   Phone: ${lead.phone || 'N/A'}`);
  console.log(`   Email: ${lead.email || 'N/A'}`);
  console.log(`   Type: ${lead.rawData?.customerData?.type || 'N/A'}`);
  console.log('');
});

console.log('\n📋 SAMPLE LEADS - CALENDAR (First 10)');
console.log('-'.repeat(70));
googleData.leads
  .filter((l: any) => l.source === 'calendar')
  .slice(0, 10)
  .forEach((lead: any, i: number) => {
    console.log(`${i + 1}. ${lead.name}`);
    console.log(`   Event: ${lead.rawData.eventTitle}`);
    console.log(`   Date: ${lead.rawData.eventStart}`);
    console.log(`   Location: ${lead.rawData.eventLocation || 'N/A'}`);
    console.log('');
  });

console.log('\n📋 SAMPLE LEADS - GMAIL (First 10)');
console.log('-'.repeat(70));
googleData.leads
  .filter((l: any) => l.source === 'gmail')
  .slice(0, 10)
  .forEach((lead: any, i: number) => {
    console.log(`${i + 1}. ${lead.name}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Company: ${lead.company}`);
    console.log(`   Subject: ${lead.rawData.subject}`);
    console.log('');
  });

// Potential duplicates analysis
console.log('\n🔍 POTENTIAL DUPLICATE ANALYSIS');
console.log('-'.repeat(70));

// Find common names between Billy and Calendar
const billyNames = new Set(billyData.leads.map((l: any) => l.name.toLowerCase().trim()));
const calendarNames = googleData.leads
  .filter((l: any) => l.source === 'calendar')
  .map((l: any) => l.name.toLowerCase().trim());

const potentialMatches = calendarNames.filter((name: string) => {
  // Check if calendar name appears in any Billy name
  for (const billyName of billyNames) {
    if (billyName.includes(name) || name.includes(billyName)) {
      return true;
    }
  }
  return false;
});

console.log(`Potential name matches between Billy & Calendar: ${new Set(potentialMatches).size}`);

// Email domain analysis
const gmailDomains = googleData.leads
  .filter((l: any) => l.source === 'gmail' && l.email)
  .reduce((acc: any, lead: any) => {
    const domain = lead.company || 'unknown';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

console.log('\n📬 TOP EMAIL DOMAINS (Gmail)');
console.log('-'.repeat(70));
Object.entries(gmailDomains)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([domain, count]) => {
    console.log(`${domain}: ${count}`);
  });

// Date range analysis
const calendarDates = googleData.leads
  .filter((l: any) => l.source === 'calendar' && l.rawData.eventStart)
  .map((l: any) => new Date(l.rawData.eventStart));

if (calendarDates.length > 0) {
  const earliestDate = new Date(Math.min(...calendarDates.map((d: Date) => d.getTime())));
  const latestDate = new Date(Math.max(...calendarDates.map((d: Date) => d.getTime())));
  
  console.log('\n📅 CALENDAR DATE RANGE');
  console.log('-'.repeat(70));
  console.log(`Earliest event: ${earliestDate.toLocaleDateString('da-DK')}`);
  console.log(`Latest event: ${latestDate.toLocaleDateString('da-DK')}`);
  console.log(`Span: ${Math.round((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))} days`);
}

// Service type analysis from calendar titles
const serviceTypes = googleData.leads
  .filter((l: any) => l.source === 'calendar')
  .reduce((acc: any, lead: any) => {
    const title = lead.rawData.eventTitle.toLowerCase();
    if (title.includes('flytterengøring')) acc['Flytterengøring'] = (acc['Flytterengøring'] || 0) + 1;
    else if (title.includes('hovedrengøring')) acc['Hovedrengøring'] = (acc['Hovedrengøring'] || 0) + 1;
    else if (title.includes('fast rengøring')) acc['Fast Rengøring'] = (acc['Fast Rengøring'] || 0) + 1;
    else if (title.includes('restaurant')) acc['Restaurant'] = (acc['Restaurant'] || 0) + 1;
    else if (title.includes('renovering')) acc['Renovering'] = (acc['Renovering'] || 0) + 1;
    else acc['Andet'] = (acc['Andet'] || 0) + 1;
    return acc;
  }, {});

console.log('\n🧹 SERVICE TYPES (From Calendar)');
console.log('-'.repeat(70));
Object.entries(serviceTypes)
  .sort((a: any, b: any) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY');
console.log('='.repeat(70));
console.log(`\nTotal Unique Data Sources:`);
console.log(`  • Billy Customers: ${billyData.metadata.uniqueLeads} unique`);
console.log(`  • Google (Calendar + Gmail): ${googleData.metadata.uniqueLeads} unique`);
console.log(`  • Combined Estimate: ~${billyData.metadata.uniqueLeads + googleData.metadata.uniqueLeads} unique leads`);
console.log(`\nData Quality:`);
console.log(`  • Billy: High (structured customer data, ${Math.round(billyWithEmail/billyData.leads.length*100)}% has email)`);
console.log(`  • Calendar: Medium (names + locations, no email)`);
console.log(`  • Gmail: High (${Math.round(googleWithEmail/googleData.leads.filter((l: any) => l.source === 'gmail').length*100)}% has email)`);
console.log(`\nBest Use Cases:`);
console.log(`  • Billy: Customer database, invoicing history`);
console.log(`  • Calendar: Service history, appointment tracking`);
console.log(`  • Gmail: Communication history, lead sources`);
console.log(`\n✅ Data collection complete and ready for ChromaDB testing!`);
console.log('');

process.exit(0);
