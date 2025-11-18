# Phase 0: SMTP Infrastructure Setup Guide

## Overview

This guide documents the setup for Phase 0 email infrastructure using self-hosted SMTP server (`inbound-email`) to replace Gmail API for email reading, eliminating rate limits.

## Components

### 1. Docker Service (`inbound-email`)

**Location:** `docker-compose.yml`

**Service Configuration:**

- **Ports:** 25 (SMTP), 587 (SMTP Submission)
- **Webhook:** `http://friday-ai:3000/api/inbound/email`
- **Storage:** Volume-mounted at `/app/storage`

### 2. Database Schema

**New Tables:**

- `emails` - Individual email messages
- `attachments` - Email attachments
- `emailPipelineState` - Pipeline stage tracking
- `emailPipelineTransitions` - Transition history
- `emailLabelRules` - Auto-labeling rules

**Location:** `drizzle/schema.ts`

### 3. Webhook Endpoint

**Endpoint:** `POST /api/inbound/email`

**Location:** `server/api/inbound-email.ts`

**Functionality:**

- Receives parsed email data from SMTP server
- Stores emails in database
- Handles attachments (local filesystem)
- Triggers enrichment pipeline asynchronously

### 4. Enrichment Pipeline

**Location:** `server/email-enrichment.ts`

**Functionality:**

- Billy customer lookup
- Lead source detection (Rengøring.nu, Rengøring Århus, AdHelp)
- Auto-labeling ("Needs Action", source labels)
- Pipeline state management

## Setup Instructions

### Step 1: Database Migration

Run Drizzle migration to create new tables:

````bash
# From project root
pnpm db:push

```text

Or manually:

```bash
drizzle-kit generate
drizzle-kit migrate

```text

**Verify Migration:**

- Check that new tables exist in database
- Verify foreign key relationships

### Step 2: Environment Variables

Add to `.env` file:

```bash
# Inbound Email SMTP Server
INBOUND_EMAIL_WEBHOOK_URL=<http://localhost:3000/api/inbound/email>
INBOUND_EMAIL_WEBHOOK_SECRET=your-webhook-secret-key
INBOUND_STORAGE_TYPE=local
INBOUND_STORAGE_PATH=./storage/attachments

```text

### Step 3: Setup Inbound-Email Repository

**Option A: Clone Repository (Recommended)**

```bash
# From project root
cd inbound-email
git clone <https://github.com/sendbetter/inbound-email.git> .
npm install

```bash

**Option B: Use Pre-built Image**

If Docker image is available, update `docker-compose.yml`:

```yaml
inbound-email:
  image: sendbetter/inbound-email:latest
  # Remove build section

```text

### Step 4: Build and Start Services

```bash
# Build inbound-email service
docker-compose build inbound-email

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f inbound-email
docker-compose logs -f friday-ai

```text

### Step 5: Test Webhook Endpoint

```bash
# Test webhook (should return 200 OK)
curl -X POST <http://localhost:3000/api/inbound/email> \
  -H "Content-Type: application/json" \
  -d '{
    "from": "<test@example.com>",
    "to": "<info@rendetalje.dk>",
    "subject": "Test Email",
    "text": "Test body",
    "html": "<p>Test body</p>",
    "receivedAt": "2025-01-15T10:00:00Z",
    "messageId": "test-123"
  }'

```text

### Step 6: Configure Google Workspace

**Option A: Auto-Forward**

1. Go to Google Workspace Admin Console
1. Navigate to `Apps` → `Google Workspace` → `Gmail`
1. Go to `Routing` → `Default routing`
1. Add forwarding rule:
   - **Recipient:** `info@rendetalje.dk`
   - **Action:** Forward to `parse@tekup.dk` (or your SMTP server domain)

**Option B: Dual Delivery**

1. Same location as above
1. Enable "Dual delivery"
1. Configure secondary delivery to your SMTP server

**Option C: MX Records (Production)**

1. Setup DNS MX record:

```text
   parse.tekup.dk → [SMTP Server IP]

```text

1. Google Workspace will route emails to your server

### Step 7: Verify Integration

1. **Send test email** to `info@rendetalje.dk`
1. **Check webhook logs:**

   ```bash
   docker-compose logs -f friday-ai | grep "InboundEmail"

```text

1. **Verify database:**

   ```sql
   SELECT * FROM emails ORDER BY receivedAt DESC LIMIT 10;

```text

1. **Check enrichment:**

   ```sql
   SELECT * FROM email_pipeline_state ORDER BY createdAt DESC LIMIT 10;

```text

## Testing

### Manual Test Email

Create test script `test-inbound-email.js`:

```javascript
const http = require("http");

const payload = JSON.stringify({
  from: "<lead@rengoring.nu>",
  to: "<info@rendetalje.dk>",
  subject: "Test Lead - Rengøring",
  text: "Hej, jeg leder efter rengøring.",
  html: "<p>Hej, jeg leder efter rengøring.</p>",
  receivedAt: new Date().toISOString(),
  messageId: `test-${Date.now()}`,
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/inbound/email",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length,
  },
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  res.on("data", d => {
    process.stdout.write(d);
  });
});

req.on("error", e => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();

```text

Run:

```bash
node test-inbound-email.js

```text

## Troubleshooting

### Issue: Webhook Not Receiving Emails

**Check:**

1. Verify webhook endpoint is accessible:

   ```bash
   curl <http://localhost:3000/api/inbound/email>

```text

1. Check `friday-ai` service logs:

   ```bash
   docker-compose logs friday-ai | grep "inbound"

```text

1. Verify network connectivity between containers:

   ```bash
   docker exec inbound-email-container curl <http://friday-ai:3000/api/inbound/email>

```text

### Issue: Database Connection Errors

**Check:**

1. Verify database is running:

   ```bash
   docker-compose ps db

```text

1. Test connection string:

   ```bash
   mysql -h localhost -u friday_user -p friday_ai

```text

1. Check database logs:

   ```bash
   docker-compose logs db

```text

### Issue: Enrichment Not Running

**Check:**

1. Verify enrichment function is called:

   ```bash
   docker-compose logs friday-ai | grep "EmailEnrichment"

```text

1. Check for errors in enrichment:

   ```bash
   docker-compose logs friday-ai | grep "error"

```text

1. Verify Billy API connection:
   - Check `BILLY_API_KEY` and `BILLY_ORGANIZATION_ID` in `.env`

### Issue: Attachments Not Saving

**Check:**

1. Verify storage directory exists:

   ```bash
   docker exec inbound-email-container ls -la /app/storage

```text

1. Check permissions:

   ```bash
   docker exec inbound-email-container ls -la /app/storage/attachments

````

1. Verify `INBOUND_STORAGE_PATH` in environment

## Next Steps

After Phase 0 is complete:

1. **Phase 1:** Pipeline Status View with column layout
1. **Phase 1:** Smart Label Detection improvements
1. **Phase 1:** Pipeline Quick Actions
1. **Phase 2:** Workflow Automation (calendar, invoices)
1. **Phase 3:** Advanced Features (dashboard, bulk ops, templates)

## References

- **Plan Document:** `docs/EMAIL_TAB_COMPLETE_ROADMAP.md`
- **Alternatives Analysis:** `docs/GMAIL_RATE_LIMIT_ALTERNATIVES.md`
- **Workflow Analysis:** `docs/SHORTWAVE_WORKFLOW_ANALYSIS.md`
