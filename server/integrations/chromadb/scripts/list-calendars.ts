import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.dev') });

import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
const impersonatedUser = process.env.GOOGLE_IMPERSONATED_USER || 'info@rendetalje.dk';

const serviceAccount = JSON.parse(serviceAccountKey);

const auth = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  subject: impersonatedUser,
});

const calendar = google.calendar({ version: 'v3', auth });

async function listCalendars() {
  console.log('📅 Listing all available calendars...\n');

  const response = await calendar.calendarList.list();
  const calendars = response.data.items || [];

  console.log(`Found ${calendars.length} calendars:\n`);

  for (const cal of calendars) {
    console.log(`📆 ${cal.summary}`);
    console.log(`   ID: ${cal.id}`);
    console.log(`   Primary: ${cal.primary || false}`);
    console.log(`   Access: ${cal.accessRole}`);
    
    // Count events in July-Nov
    try {
      const events = await calendar.events.list({
        calendarId: cal.id!,
        timeMin: '2025-07-01T00:00:00Z',
        timeMax: '2025-11-30T23:59:59Z',
        maxResults: 2500,
        singleEvents: true,
      });
      console.log(`   Events (Jul-Nov): ${events.data.items?.length || 0}`);
    } catch (err: any) {
      console.log(`   Events: Error - ${err.message}`);
    }
    console.log('');
  }
}

listCalendars().catch(console.error);
