/**
 * V4.3.4 Script 3: Add Recurring & Active Tags
 * 
 * Adds three new tags to complete leads:
 * - isActive: Lead from active period (Oct-Nov 2025)
 * - isRecurring: Customer has 2+ bookings
 * - recurringFrequency: Pattern of recurring bookings
 * 
 * Input: complete-leads-v4.3.3.json
 * Output: complete-leads-v4.3.3.json (updated)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { V4_3_Dataset, V4_3_Lead } from '../v4_3-types';
import { ACTIVE_PERIOD } from '../v4_3-config';

console.log('🏷️  V4.3.5 Script 3: Add Recurring & Active Tags (AI-Enhanced)\n');
console.log('='.repeat(70));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getExpectedDays(frequency: string): number {
  switch (frequency) {
    case 'weekly': return 7;
    case 'biweekly': return 14;
    case 'triweekly': return 21;
    case 'monthly': return 30;
    default: return 0;
  }
}

// Load complete leads
const completePath = resolve(
  process.cwd(),
  'server/integrations/chromadb/test-data/complete-leads-v4.3.3.json'
);

console.log(`📂 Loading: ${completePath}\n`);
const dataset: V4_3_Dataset = JSON.parse(readFileSync(completePath, 'utf-8'));
let leads = dataset.leads;

console.log(`Loaded ${leads.length} leads\n`);

// ============================================================================
// STEP 1: Mark Active Leads (Oct-Nov)
// ============================================================================

console.log('🏷️  Step 1: Marking active leads (Oct-Nov)...\n');

const activeStart = new Date(ACTIVE_PERIOD.start);
const activeEnd = new Date(ACTIVE_PERIOD.end);

let activeCount = 0;

for (const lead of leads) {
  const leadDate = new Date(lead.gmail?.date || '');
  const isActive = leadDate >= activeStart && leadDate <= activeEnd;
  
  lead.customer.isActive = isActive;
  if (isActive) activeCount++;
}

console.log(`✅ Marked ${activeCount} active leads (${(activeCount/leads.length*100).toFixed(1)}%)\n`);

// ============================================================================
// STEP 2: Detect Recurring Customers
// ============================================================================

console.log('🔄 Step 2: Detecting recurring customers...\n');

// Group leads by Calendar customer name (from event summary)
// This is more accurate than email because recurring bookings use same name in Calendar
const leadsByCalendarCustomer = new Map<string, V4_3_Lead[]>();

for (const lead of leads) {
  if (!lead.calendar) continue;
  
  // Extract customer name from Calendar summary like "🏠 FAST RENGØRING #7 - Tommy Callesen"
  const summary = lead.calendar.summary;
  const match = summary.match(/[-–]\s*(.+)$/);
  let customerInCalendar = match ? match[1].trim() : summary;
  
  // V4.3.4: Normalize customer name - remove status tags
  customerInCalendar = customerInCalendar
    .replace(/✅/g, '')
    .replace(/\s*UDFØRT\s*/gi, '')
    .replace(/\s*aflyst\s*/gi, '')
    .replace(/\s*\(REBOOKING\)\s*/gi, '')
    .replace(/\s*\(FÆRDIGGØRELSE\)\s*/gi, '')
    .replace(/\s*\(ik fortaget\)\s*/gi, '')
    .trim();
  
  if (!leadsByCalendarCustomer.has(customerInCalendar)) {
    leadsByCalendarCustomer.set(customerInCalendar, []);
  }
  leadsByCalendarCustomer.get(customerInCalendar)!.push(lead);
}

// Also group by email for leads without calendar
const leadsByEmail = new Map<string, V4_3_Lead[]>();
for (const lead of leads) {
  const email = lead.customerEmail.toLowerCase();
  if (!leadsByEmail.has(email)) {
    leadsByEmail.set(email, []);
  }
  leadsByEmail.get(email)!.push(lead);
}

// Find recurring customers (2+ bookings with calendar)
let recurringCount = 0;
const frequencyCounts = {
  weekly: 0,
  biweekly: 0,
  triweekly: 0,
  monthly: 0,
  irregular: 0,
};

console.log('🔍 Analyzing customer patterns (with AI validation)...\n');

// Process Calendar-based recurring customers
for (const [calendarName, customerLeads] of leadsByCalendarCustomer.entries()) {
  // These all have calendar by definition
  const bookings = customerLeads.map(l => ({
    lead: l,
    date: new Date(l.calendar!.startTime),
    price: l.calculated?.financial?.invoicedPrice || 0,
    aiFrequency: l.calendar?.aiParsed?.service?.frequency || null,
    aiBookingNumber: l.calendar?.aiParsed?.qualitySignals?.bookingNumber || null,
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // V4.3.5: Check AI for repeat booking signals
  const aiSaysRepeat = bookings.some(b => b.lead.calendar?.aiParsed?.qualitySignals?.isRepeatBooking);
  const maxAIBookingNumber = Math.max(...bookings.map(b => b.aiBookingNumber || 0));
  
  const isRecurring = bookings.length >= 2 || aiSaysRepeat || maxAIBookingNumber > 1;
  
  let frequency: 'weekly' | 'biweekly' | 'triweekly' | 'monthly' | 'irregular' | null = null;
  let avgDays = 0;
  
  if (isRecurring) {
    recurringCount++;
    
    // V4.3.5: Try AI frequency first (most reliable for single bookings)
    const aiFrequencies = bookings.map(b => b.aiFrequency).filter(f => f && f !== 'one-time');
    const mostCommonAIFrequency = aiFrequencies.length > 0 ? 
      aiFrequencies.sort((a, b) => 
        aiFrequencies.filter(f => f === b).length - aiFrequencies.filter(f => f === a).length
      )[0] : null;
    
    if (bookings.length >= 2) {
      // Calculate average days between bookings
      const daysBetween: number[] = [];
      for (let i = 1; i < bookings.length; i++) {
        const days = Math.round((bookings[i].date.getTime() - bookings[i-1].date.getTime()) / (1000 * 60 * 60 * 24));
        daysBetween.push(days);
      }
      
      avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
      
      // Classify frequency from calculated days
      if (avgDays <= 9) {
        frequency = 'weekly';
      } else if (avgDays <= 16) {
        frequency = 'biweekly';
      } else if (avgDays <= 23) {
        frequency = 'triweekly';
      } else if (avgDays <= 35) {
        frequency = 'monthly';
      } else {
        frequency = 'irregular';
      }
      
      // V4.3.5: Validate with AI frequency (override if AI is more specific)
      if (mostCommonAIFrequency && mostCommonAIFrequency !== frequency) {
        const aiFreq = mostCommonAIFrequency as typeof frequency;
        // Trust AI for edge cases
        if (frequency === 'irregular' || Math.abs(avgDays - getExpectedDays(aiFreq)) < 5) {
          frequency = aiFreq;
        }
      }
    } else {
      // Single booking but AI says repeat - use AI frequency
      frequency = (mostCommonAIFrequency as typeof frequency) || 'irregular';
      avgDays = getExpectedDays(frequency);
    }
    
    // Update frequency counts
    if (frequency) {
      frequencyCounts[frequency]++;
    }
    
    // V4.3.5: Enhanced logging with AI insights
    const aiMaxBooking = maxAIBookingNumber > bookings.length ? ` (AI: #${maxAIBookingNumber})` : '';
    const aiFreqNote = mostCommonAIFrequency && mostCommonAIFrequency !== frequency ? ` [AI: ${mostCommonAIFrequency}]` : '';
    
    console.log(`   ✅ ${calendarName}`);
    console.log(`      📧 ${customerLeads[0].customerEmail}`);
    console.log(`      📅 ${bookings.length} bookings${aiMaxBooking}`);
    console.log(`      ⏱️  ${frequency}${aiFreqNote} (~${Math.round(avgDays)} days)`);
    console.log(`      💰 ${bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString('da-DK')} kr total\n`);
  }
  
  // Update ALL leads for this customer
  for (const lead of customerLeads) {
    lead.customer.isRecurring = isRecurring;
    lead.customer.recurringFrequency = frequency;
  }
}

console.log(`\n✅ Found ${recurringCount} recurring customers:\n`);
console.log(`   🟢 Weekly:       ${frequencyCounts.weekly}`);
console.log(`   🟡 Biweekly:     ${frequencyCounts.biweekly}`);
console.log(`   🟠 Triweekly:    ${frequencyCounts.triweekly}`);
console.log(`   🔵 Monthly:      ${frequencyCounts.monthly}`);
console.log(`   ⚪ Irregular:    ${frequencyCounts.irregular}\n`);

// ============================================================================
// STEP 3: Update Customer Value Metrics
// ============================================================================

console.log('📊 Step 3: Updating customer value metrics (with AI quality signals)...\n');

// Update based on email grouping (for all leads)
for (const [email, customerLeads] of leadsByEmail.entries()) {
  const bookings = customerLeads.filter((l: V4_3_Lead) => l.calendar);
  
  // Update totalBookings to reflect calendar bookings
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum: number, l: V4_3_Lead) => sum + (l.calculated?.financial?.invoicedPrice || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const repeatRate = totalBookings > 1 ? ((totalBookings - 1) / totalBookings) * 100 : 0;
  
  // V4.3.5: Aggregate AI quality signals from all bookings
  const aiQualitySignals = bookings
    .map(l => l.calendar?.aiParsed?.qualitySignals)
    .filter(q => q);
  
  const hasComplaints = aiQualitySignals.some(q => q?.hasComplaints);
  const hasSpecialNeeds = aiQualitySignals.some(q => q?.hasSpecialNeeds);
  
  // Determine customer type (worst case wins)
  let customerType: 'standard' | 'premium' | 'problematic' | 'unknown' = 'unknown';
  if (hasComplaints) {
    customerType = 'problematic';
  } else if (aiQualitySignals.some(q => q?.customerType === 'premium')) {
    customerType = 'premium';
  } else if (aiQualitySignals.some(q => q?.customerType === 'standard')) {
    customerType = 'standard';
  }
  
  // Collect all special requirements
  const allSpecialRequirements = bookings
    .flatMap(l => l.calendar?.aiParsed?.specialRequirements || [])
    .filter((req, idx, arr) => arr.indexOf(req) === idx); // unique
  
  for (const lead of customerLeads) {
    lead.customer.totalBookings = totalBookings;
    lead.customer.lifetimeValue = totalRevenue;
    lead.customer.avgBookingValue = avgBookingValue;
    lead.customer.averageBookingValue = avgBookingValue; // Keep both for compatibility
    lead.customer.repeatRate = repeatRate;
    
    // V4.3.5: Add AI quality signals
    if (aiQualitySignals.length > 0) {
      lead.customer.customerType = customerType;
      lead.customer.hasComplaints = hasComplaints;
      lead.customer.hasSpecialNeeds = hasSpecialNeeds;
      lead.customer.specialRequirements = allSpecialRequirements;
    }
  }
}

console.log('✅ Updated customer value metrics\n');

// ============================================================================
// SAVE UPDATED DATASET
// ============================================================================

console.log('💾 Saving updated dataset...\n');

dataset.leads = leads;

writeFileSync(completePath, JSON.stringify(dataset, null, 2));

console.log('='.repeat(70));
console.log('✅ RECURRING & ACTIVE TAGS ADDED\n');
console.log(`📊 SUMMARY:`);
console.log(`   Total Leads: ${leads.length}`);
console.log(`   Active (Oct-Nov): ${activeCount} (${(activeCount/leads.length*100).toFixed(1)}%)`);
console.log(`   Recurring Customers: ${recurringCount}`);
console.log(`   Total Calendar Bookings: ${leads.filter(l => l.calendar).length}\n`);

console.log('💡 Next: Upload to ChromaDB');
console.log('   npx tsx server/integrations/chromadb/scripts/4-upload-to-chromadb.ts\n');
