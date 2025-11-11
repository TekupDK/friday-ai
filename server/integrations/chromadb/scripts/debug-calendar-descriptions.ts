/**
 * Debug Calendar Event Descriptions
 * Check what's in the event descriptions and if there are Gmail thread refs
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.dev') });

import { listCalendarEvents } from '../../../google-api';

async function debugCalendar() {
  console.log('🔍 Debugging Calendar Event Descriptions\n');
  console.log('='.repeat(70));
  
  const events = await listCalendarEvents({
    timeMin: new Date('2025-07-01').toISOString(),
    timeMax: new Date('2025-12-31').toISOString(),
    maxResults: 500,
  });
  
  console.log(`\n📅 Found ${events.length} events\n`);
  
  // Sample first 20 events with descriptions
  console.log('📋 SAMPLE EVENTS WITH DESCRIPTIONS:');
  console.log('='.repeat(70));
  
  let eventsWithDescription = 0;
  let eventsWithEmail = 0;
  let eventsWithThreadRef = 0;
  let eventsWithPhone = 0;
  
  events.slice(0, 30).forEach((event, i) => {
    const description = (event as any).description;
    
    if (description && description.trim()) {
      eventsWithDescription++;
      console.log(`\n${i + 1}. ${event.summary}`);
      console.log(`   Start: ${event.start}`);
      console.log(`   Description:`);
      console.log(`   ${description.substring(0, 500)}`);
      console.log('-'.repeat(70));
      
      // Check for emails
      const emailMatches = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
      if (emailMatches) {
        eventsWithEmail++;
        console.log(`   ✅ EMAILS FOUND: ${emailMatches.join(', ')}`);
      }
      
      // Check for Gmail thread references
      const threadMatches = description.match(/thread[_-]?id[:\s]+([a-zA-Z0-9]+)/gi) ||
                           description.match(/gmail\.com.*thread[=/]([a-zA-Z0-9]+)/gi) ||
                           description.match(/\b([0-9a-f]{16})\b/gi); // Thread IDs are 16 char hex
      if (threadMatches) {
        eventsWithThreadRef++;
        console.log(`   ✅ THREAD REF FOUND: ${threadMatches.join(', ')}`);
      }
      
      // Check for phone numbers
      const phoneMatches = description.match(/(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/g);
      if (phoneMatches) {
        eventsWithPhone++;
        console.log(`   ✅ PHONE FOUND: ${phoneMatches.join(', ')}`);
      }
      
      console.log('');
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 STATISTICS:');
  console.log('='.repeat(70));
  console.log(`Total events: ${events.length}`);
  console.log(`Events with description: ${eventsWithDescription}`);
  console.log(`Events with email in description: ${eventsWithEmail}`);
  console.log(`Events with thread reference: ${eventsWithThreadRef}`);
  console.log(`Events with phone in description: ${eventsWithPhone}`);
  
  if (eventsWithEmail > 0) {
    console.log('\n✅ WE CAN EXTRACT EMAILS FROM CALENDAR DESCRIPTIONS!');
  }
  
  if (eventsWithThreadRef > 0) {
    console.log('✅ WE CAN LINK CALENDAR EVENTS TO GMAIL THREADS!');
  }
  
  process.exit(0);
}

debugCalendar().catch(console.error);
