#!/usr/bin/env python3
"""
Google Data Extractor

This script fetches data from Gmail and Google Calendar APIs and saves it to JSON or Markdown format.
Usage: python extract_google_data.py --output-format json|md
"""

import argparse
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import sys

# Google API imports
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Constants
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly'
]
TOKEN_FILE = 'token.json'
CREDENTIALS_FILE = 'credentials.json'

class GoogleDataExtractor:
    """Main class for extracting data from Google APIs"""
    
    def __init__(self):
        self.creds = None
        self.gmail_service = None
        self.calendar_service = None
        
    def authenticate(self) -> bool:
        """Authenticate with Google APIs using OAuth 2.0"""
        try:
            # Load existing token if available
            if os.path.exists(TOKEN_FILE):
                self.creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
            
            # If there are no (valid) credentials available, let the user log in.
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if not os.path.exists(CREDENTIALS_FILE):
                        print(f"Error: {CREDENTIALS_FILE} not found. Please download it from Google Cloud Console.")
                        return False
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        CREDENTIALS_FILE, SCOPES)
                    self.creds = flow.run_local_server(port=0)
                
                # Save the credentials for the next run
                with open(TOKEN_FILE, 'w') as token:
                    token.write(self.creds.to_json())
            
            # Build services
            self.gmail_service = build('gmail', 'v1', credentials=self.creds)
            self.calendar_service = build('calendar', 'v3', credentials=self.creds)
            
            print("✅ Authentication successful")
            return True
            
        except Exception as e:
            print(f"❌ Authentication failed: {str(e)}")
            return False
    
    def fetch_gmail_data(self, max_results: int = 50) -> List[Dict[str, Any]]:
        """Fetch recent emails from Gmail"""
        try:
            print(f"📧 Fetching {max_results} recent emails...")
            
            # Get messages list
            results = self.gmail_service.users().messages().list(
                userId='me',
                maxResults=max_results,
                labelIds=['INBOX']
            ).execute()
            
            messages = results.get('messages', [])
            email_data = []
            
            for message in messages:
                # Get full message details
                msg_detail = self.gmail_service.users().messages().get(
                    userId='me',
                    id=message['id']
                ).execute()
                
                # Extract headers
                headers = msg_detail['payload'].get('headers', [])
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
                date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
                
                # Parse date to ISO format
                try:
                    if date:
                        # Parse email date format
                        parsed_date = datetime.strptime(date, '%a, %d %b %Y %H:%M:%S %z')
                        iso_date = parsed_date.isoformat()
                    else:
                        iso_date = datetime.now().isoformat()
                except:
                    iso_date = datetime.now().isoformat()
                
                # Extract snippet
                snippet = msg_detail.get('snippet', '')[:200]  # Limit snippet length
                
                email_data.append({
                    'id': message['id'],
                    'subject': subject,
                    'sender': sender,
                    'date': iso_date,
                    'snippet': snippet,
                    'thread_id': msg_detail.get('threadId', ''),
                    'labels': msg_detail.get('labelIds', [])
                })
            
            print(f"✅ Fetched {len(email_data)} emails")
            return email_data
            
        except HttpError as error:
            print(f"❌ Gmail API error: {error}")
            return []
        except Exception as e:
            print(f"❌ Error fetching Gmail data: {str(e)}")
            return []
    
    def fetch_calendar_data(self, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """Fetch upcoming calendar events"""
        try:
            print(f"📅 Fetching calendar events for next {days_ahead} days...")
            
            # Calculate time range
            now = datetime.utcnow()
            time_min = now.isoformat() + 'Z'
            time_max = (now + timedelta(days=days_ahead)).isoformat() + 'Z'
            
            # Get events
            events_result = self.calendar_service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=50,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            calendar_data = []
            
            for event in events:
                # Extract start and end times
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                
                # Convert to ISO format
                try:
                    if 'T' in start:  # datetime format
                        start_iso = datetime.fromisoformat(start.replace('Z', '+00:00')).isoformat()
                    else:  # date format
                        start_iso = datetime.fromisoformat(start).isoformat()
                    
                    if 'T' in end:
                        end_iso = datetime.fromisoformat(end.replace('Z', '+00:00')).isoformat()
                    else:
                        end_iso = datetime.fromisoformat(end).isoformat()
                except:
                    start_iso = start
                    end_iso = end
                
                # Extract attendees
                attendees = []
                for attendee in event.get('attendees', []):
                    attendees.append({
                        'email': attendee.get('email', ''),
                        'display_name': attendee.get('displayName', ''),
                        'response_status': attendee.get('responseStatus', 'needsAction')
                    })
                
                calendar_data.append({
                    'id': event['id'],
                    'summary': event.get('summary', 'No Title'),
                    'description': event.get('description', ''),
                    'start': start_iso,
                    'end': end_iso,
                    'location': event.get('location', ''),
                    'attendees': attendees,
                    'creator': event.get('creator', {}).get('email', ''),
                    'status': event.get('status', 'confirmed')
                })
            
            print(f"✅ Fetched {len(calendar_data)} calendar events")
            return calendar_data
            
        except HttpError as error:
            print(f"❌ Calendar API error: {error}")
            return []
        except Exception as e:
            print(f"❌ Error fetching calendar data: {str(e)}")
            return []
    
    def test_api_access(self) -> bool:
        """Test API access without fetching actual data"""
        try:
            print("🔍 Testing API access...")
            
            # Test Gmail access
            gmail_test = self.gmail_service.users().getProfile(userId='me').execute()
            print(f"✅ Gmail access verified: {gmail_test.get('emailAddress', 'Unknown')}")
            
            # Test Calendar access
            calendar_test = self.calendar_service.calendars().get(calendarId='primary').execute()
            print(f"✅ Calendar access verified: {calendar_test.get('summary', 'Unknown')}")
            
            return True
            
        except Exception as e:
            print(f"❌ API test failed: {str(e)}")
            return False
    
    def validate_output_format(self, data: Dict[str, Any]) -> bool:
        """Validate the output format"""
        try:
            required_fields = ['emails', 'calendar_events', 'metadata']
            
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Validate email structure
            for email in data['emails']:
                email_fields = ['id', 'subject', 'sender', 'date', 'snippet']
                for field in email_fields:
                    if field not in email:
                        print(f"❌ Missing email field: {field}")
                        return False
            
            # Validate calendar structure
            for event in data['calendar_events']:
                event_fields = ['id', 'summary', 'start', 'end']
                for field in event_fields:
                    if field not in event:
                        print(f"❌ Missing calendar field: {field}")
                        return False
            
            print("✅ Output format validation passed")
            return True
            
        except Exception as e:
            print(f"❌ Output validation failed: {str(e)}")
            return False
    
    def extract_all_data(self) -> Dict[str, Any]:
        """Extract all data from Google APIs"""
        print("🚀 Starting data extraction...")
        
        # Fetch data
        emails = self.fetch_gmail_data()
        calendar_events = self.fetch_calendar_data()
        
        # Create structured output
        output_data = {
            'metadata': {
                'extracted_at': datetime.now().isoformat(),
                'total_emails': len(emails),
                'total_calendar_events': len(calendar_events),
                'version': '1.0'
            },
            'emails': emails,
            'calendar_events': calendar_events
        }
        
        return output_data
    
    def save_to_json(self, data: Dict[str, Any], filename: str) -> bool:
        """Save data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Data saved to {filename}")
            return True
        except Exception as e:
            print(f"❌ Error saving JSON: {str(e)}")
            return False
    
    def save_to_markdown(self, data: Dict[str, Any], filename: str) -> bool:
        """Save data to Markdown file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("# Google Data Extract\n\n")
                f.write(f"**Extracted at:** {data['metadata']['extracted_at']}\n")
                f.write(f"**Total Emails:** {data['metadata']['total_emails']}\n")
                f.write(f"**Total Calendar Events:** {data['metadata']['total_calendar_events']}\n\n")
                
                # Emails section
                f.write("## Recent Emails\n\n")
                for i, email in enumerate(data['emails'], 1):
                    f.write(f"### Email {i}: {email['subject']}\n")
                    f.write(f"- **From:** {email['sender']}\n")
                    f.write(f"- **Date:** {email['date']}\n")
                    f.write(f"- **ID:** {email['id']}\n")
                    f.write(f"- **Snippet:** {email['snippet']}\n")
                    f.write(f"- **Labels:** {', '.join(email['labels'])}\n\n")
                
                # Calendar events section
                f.write("## Upcoming Calendar Events\n\n")
                for i, event in enumerate(data['calendar_events'], 1):
                    f.write(f"### Event {i}: {event['summary']}\n")
                    f.write(f"- **Start:** {event['start']}\n")
                    f.write(f"- **End:** {event['end']}\n")
                    f.write(f"- **Location:** {event['location']}\n")
                    f.write(f"- **Status:** {event['status']}\n")
                    if event['attendees']:
                        f.write(f"- **Attendees:** {len(event['attendees'])}\n")
                        for attendee in event['attendees']:
                            f.write(f"  - {attendee['email']} ({attendee['response_status']})\n")
                    f.write("\n")
            
            print(f"✅ Data saved to {filename}")
            return True
        except Exception as e:
            print(f"❌ Error saving Markdown: {str(e)}")
            return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Extract data from Google APIs')
    parser.add_argument('--output-format', choices=['json', 'md'], default='json',
                       help='Output format (json or md)')
    parser.add_argument('--test', action='store_true',
                       help='Test API access without fetching data')
    parser.add_argument('--validate-only', action='store_true',
                       help='Only validate output format without saving')
    
    args = parser.parse_args()
    
    # Initialize extractor
    extractor = GoogleDataExtractor()
    
    # Authenticate
    if not extractor.authenticate():
        print("❌ Failed to authenticate. Exiting.")
        sys.exit(1)
    
    # Test mode
    if args.test:
        print("🧪 Running in test mode...")
        if extractor.test_api_access():
            print("✅ All tests passed!")
            sys.exit(0)
        else:
            print("❌ Tests failed!")
            sys.exit(1)
    
    # Extract data
    data = extractor.extract_all_data()
    
    # Validate output
    if not extractor.validate_output_format(data):
        print("❌ Output validation failed. Exiting.")
        sys.exit(1)
    
    # Validation only mode
    if args.validate_only:
        print("✅ Output format is valid!")
        sys.exit(0)
    
    # Save output
    output_filename = f"google_data_output.{args.output_format}"
    
    if args.output_format == 'json':
        success = extractor.save_to_json(data, output_filename)
    else:  # markdown
        success = extractor.save_to_markdown(data, output_filename)
    
    if success:
        print(f"🎉 Extraction completed successfully!")
        print(f"📁 Output saved to: {os.path.abspath(output_filename)}")
    else:
        print("❌ Failed to save output.")
        sys.exit(1)

if __name__ == '__main__':
    main()