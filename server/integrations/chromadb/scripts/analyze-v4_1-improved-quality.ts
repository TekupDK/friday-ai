/**
 * Analyze V4.1 Improved Data Quality
 * Compare with original V4.1
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('📊 V4.1 Improved - Quality Comparison\n');
console.log('='.repeat(70));

const v41Path = resolve(process.cwd(), 'server/integrations/chromadb/test-data/complete-leads-v4.1.json');
const v41Improved = resolve(process.cwd(), 'server/integrations/chromadb/test-data/complete-leads-v4.1-improved.json');

const v41 = JSON.parse(readFileSync(v41Path, 'utf-8'));
const v41Imp = JSON.parse(readFileSync(v41Improved, 'utf-8'));

const leadsOld = v41.leads || [];
const leadsNew = v41Imp.leads || [];

function analyzeDataset(leads: any[], label: string) {
  const metrics = {
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
  });

  console.log(`\n${label}:`);
  console.log(`  Total: ${metrics.total}`);
  console.log(`  Email: ${metrics.hasEmail}/${metrics.total} (${(metrics.hasEmail / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Phone: ${metrics.hasPhone}/${metrics.total} (${(metrics.hasPhone / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Address: ${metrics.hasAddress}/${metrics.total} (${(metrics.hasAddress / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Time: ${metrics.hasTimeEstimate}/${metrics.total} (${(metrics.hasTimeEstimate / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Price: ${metrics.hasPrice}/${metrics.total} (${(metrics.hasPrice / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  m²: ${metrics.hasPropertySize}/${metrics.total} (${(metrics.hasPropertySize / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Gmail: ${metrics.hasGmailThread}/${metrics.total} (${(metrics.hasGmailThread / metrics.total * 100).toFixed(1)}%)`);
  console.log(`  Calendar: ${metrics.hasCalendarLink}/${metrics.total} (${(metrics.hasCalendarLink / metrics.total * 100).toFixed(1)}%)`);

  return metrics;
}

const metricsOld = analyzeDataset(leadsOld, '📋 V4.1 Original');
const metricsNew = analyzeDataset(leadsNew, '✨ V4.1 Improved');

console.log('\n\n📈 Improvements:\n');

const improvements = [
  { field: 'Total', old: metricsOld.total, new: metricsNew.total },
  { field: 'Email', old: metricsOld.hasEmail, new: metricsNew.hasEmail },
  { field: 'Phone', old: metricsOld.hasPhone, new: metricsNew.hasPhone },
  { field: 'Address', old: metricsOld.hasAddress, new: metricsNew.hasAddress },
  { field: 'Time', old: metricsOld.hasTimeEstimate, new: metricsNew.hasTimeEstimate },
  { field: 'Price', old: metricsOld.hasPrice, new: metricsNew.hasPrice },
  { field: 'm²', old: metricsOld.hasPropertySize, new: metricsNew.hasPropertySize },
  { field: 'Gmail', old: metricsOld.hasGmailThread, new: metricsNew.hasGmailThread },
  { field: 'Calendar', old: metricsOld.hasCalendarLink, new: metricsNew.hasCalendarLink },
];

improvements.forEach(({ field, old, new: newVal }) => {
  const oldPct = (old / metricsOld.total * 100).toFixed(1);
  const newPct = (newVal / metricsNew.total * 100).toFixed(1);
  const change = parseFloat(newPct) - parseFloat(oldPct);
  const symbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
  console.log(`${symbol} ${field.padEnd(10)} ${oldPct.padStart(5)}% → ${newPct.padStart(5)}% (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`);
});

console.log('\n' + '='.repeat(70));
