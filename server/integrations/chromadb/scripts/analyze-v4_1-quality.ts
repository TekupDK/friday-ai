/**
 * Analyze V4.1 Data Quality
 * 
 * - Check coverage: email, phone, address, time, price, m²
 * - Identify missing fields per lead source
 * - Identify leads without Gmail threads or Calendar links
 * - Show top 10 profiles by data completeness
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('📊 V4.1 Data Quality Analysis\n');
console.log('='.repeat(70));

const v41Path = resolve(process.cwd(), 'server/integrations/chromadb/test-data/complete-leads-v4.1.json');
const v41 = JSON.parse(readFileSync(v41Path, 'utf-8'));
const leads: any[] = v41.leads || [];

interface QualityMetrics {
  total: number;
  hasEmail: number;
  hasPhone: number;
  hasAddress: number;
  hasTimeEstimate: number;
  hasPrice: number;
  hasPropertySize: number;
  hasGmailThread: number;
  hasCalendarLink: number;
  hasLeadSource: number;
  bySource: Record<string, any>;
}

const metrics: QualityMetrics = {
  total: leads.length,
  hasEmail: 0,
  hasPhone: 0,
  hasAddress: 0,
  hasTimeEstimate: 0,
  hasPrice: 0,
  hasPropertySize: 0,
  hasGmailThread: 0,
  hasCalendarLink: 0,
  hasLeadSource: 0,
  bySource: {},
};

leads.forEach((lead) => {
  if (lead.email) metrics.hasEmail++;
  if (lead.phone) metrics.hasPhone++;
  if (lead.address) metrics.hasAddress++;
  if (lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours) metrics.hasTimeEstimate++;
  if (lead.price) metrics.hasPrice++;
  if (lead.propertySize) metrics.hasPropertySize++;
  if (lead.gmailThreadId) metrics.hasGmailThread++;
  if (lead.calendarEventId) metrics.hasCalendarLink++;
  if (lead.leadSource && lead.leadSource !== 'Unknown') metrics.hasLeadSource++;

  const src = lead.leadSource || 'Unknown';
  if (!metrics.bySource[src]) {
    metrics.bySource[src] = {
      count: 0,
      email: 0,
      phone: 0,
      address: 0,
      time: 0,
      price: 0,
      m2: 0,
      gmailThreads: 0,
      calendarLinks: 0,
    };
  }
  metrics.bySource[src].count++;
  if (lead.email) metrics.bySource[src].email++;
  if (lead.phone) metrics.bySource[src].phone++;
  if (lead.address) metrics.bySource[src].address++;
  if (lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours) metrics.bySource[src].time++;
  if (lead.price) metrics.bySource[src].price++;
  if (lead.propertySize) metrics.bySource[src].m2++;
  if (lead.gmailThreadId) metrics.bySource[src].gmailThreads++;
  if (lead.calendarEventId) metrics.bySource[src].calendarLinks++;
});

console.log('\n📈 Overall Coverage:\n');
console.log(`Total leads: ${metrics.total}`);
console.log(`Email: ${metrics.hasEmail} (${(metrics.hasEmail / metrics.total * 100).toFixed(1)}%)`);
console.log(`Phone: ${metrics.hasPhone} (${(metrics.hasPhone / metrics.total * 100).toFixed(1)}%)`);
console.log(`Address: ${metrics.hasAddress} (${(metrics.hasAddress / metrics.total * 100).toFixed(1)}%)`);
console.log(`Time Estimate: ${metrics.hasTimeEstimate} (${(metrics.hasTimeEstimate / metrics.total * 100).toFixed(1)}%)`);
console.log(`Price: ${metrics.hasPrice} (${(metrics.hasPrice / metrics.total * 100).toFixed(1)}%)`);
console.log(`Property Size (m²): ${metrics.hasPropertySize} (${(metrics.hasPropertySize / metrics.total * 100).toFixed(1)}%)`);
console.log(`Gmail Threads: ${metrics.hasGmailThread} (${(metrics.hasGmailThread / metrics.total * 100).toFixed(1)}%)`);
console.log(`Calendar Links: ${metrics.hasCalendarLink} (${(metrics.hasCalendarLink / metrics.total * 100).toFixed(1)}%)`);
console.log(`Lead Source (known): ${metrics.hasLeadSource} (${(metrics.hasLeadSource / metrics.total * 100).toFixed(1)}%)`);

console.log('\n📊 By Lead Source:\n');
Object.entries(metrics.bySource)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([src, data]) => {
    console.log(`\n${src} (${data.count} leads):`);
    console.log(`  Email: ${data.email}/${data.count} (${(data.email / data.count * 100).toFixed(0)}%)`);
    console.log(`  Phone: ${data.phone}/${data.count} (${(data.phone / data.count * 100).toFixed(0)}%)`);
    console.log(`  Address: ${data.address}/${data.count} (${(data.address / data.count * 100).toFixed(0)}%)`);
    console.log(`  Time: ${data.time}/${data.count} (${(data.time / data.count * 100).toFixed(0)}%)`);
    console.log(`  Price: ${data.price}/${data.count} (${(data.price / data.count * 100).toFixed(0)}%)`);
    console.log(`  m²: ${data.m2}/${data.count} (${(data.m2 / data.count * 100).toFixed(0)}%)`);
    console.log(`  Gmail: ${data.gmailThreads}/${data.count} (${(data.gmailThreads / data.count * 100).toFixed(0)}%)`);
    console.log(`  Calendar: ${data.calendarLinks}/${data.count} (${(data.calendarLinks / data.count * 100).toFixed(0)}%)`);
  });

// Find leads with lowest data completeness
console.log('\n\n⚠️  Leads with Missing Critical Data:\n');

const incomplete = leads
  .map((lead) => {
    const score =
      (lead.email ? 1 : 0) +
      (lead.phone ? 1 : 0) +
      (lead.address ? 1 : 0) +
      (lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours ? 1 : 0) +
      (lead.price ? 1 : 0) +
      (lead.propertySize ? 1 : 0);
    return { lead, score };
  })
  .sort((a, b) => a.score - b.score)
  .slice(0, 20);

incomplete.forEach(({ lead, score }) => {
  console.log(`\n${lead.name || 'Unknown'} (${lead.leadSource || 'Unknown'}) - Score: ${score}/6`);
  console.log(`  Email: ${lead.email || '❌'}`);
  console.log(`  Phone: ${lead.phone || '❌'}`);
  console.log(`  Address: ${lead.address || '❌'}`);
  console.log(`  Time: ${lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours ? '✓' : '❌'}`);
  console.log(`  Price: ${lead.price || '❌'}`);
  console.log(`  m²: ${lead.propertySize || '❌'}`);
});

console.log('\n\n✅ Leads with Complete Data:\n');

const complete = leads
  .map((lead) => {
    const score =
      (lead.email ? 1 : 0) +
      (lead.phone ? 1 : 0) +
      (lead.address ? 1 : 0) +
      (lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours ? 1 : 0) +
      (lead.price ? 1 : 0) +
      (lead.propertySize ? 1 : 0);
    return { lead, score };
  })
  .filter(({ score }) => score === 6)
  .slice(0, 10);

console.log(`Found ${complete.length} leads with complete data (6/6 fields)\n`);
complete.forEach(({ lead }) => {
  console.log(`✓ ${lead.name || 'Unknown'} (${lead.leadSource || 'Unknown'})`);
  console.log(`  ${lead.email} | ${lead.phone} | ${lead.address}`);
  console.log(`  Time: ${lead.timeEstimate?.estimatedHours || lead.timeEstimate?.actualHours}h | Price: ${lead.price} kr | Size: ${lead.propertySize}`);
});

console.log('\n' + '='.repeat(70));
