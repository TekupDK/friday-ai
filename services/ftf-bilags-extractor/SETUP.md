# Quick Setup Guide

## Step 1: Google Cloud Setup (5 min)

1. **Create Project**
   - Go to https://console.cloud.google.com/
   - Click "Create Project"
   - Name: "TekUp - BilagsExtractor"

2. **Enable Gmail API**
   - APIs & Services → Library
   - Search "Gmail API" → Enable

3. **Create OAuth Credentials**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Desktop app**
   - Name: "BilagsExtractor"
   - Authorized redirect URIs: `http://localhost:8080/callback`
   - Copy Client ID + Secret

## Step 2: Configure Environment

```bash
cd services/ftf-bilags-extractor
cp .env.example .env
```

Edit `.env` and add your credentials:
```bash
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_EMAIL=ftfiestaa@gmail.com
```

## Step 3: Install & Build

```bash
pnpm install
pnpm build
```

## Step 4: First Run - Authorize

```bash
# This will show you an authorization URL
pnpm start --input test.xls --output ./test-output
```

1. Copy the authorization URL from console
2. Open in browser
3. Sign in as `ftfiestaa@gmail.com`
4. Grant Gmail read-only access
5. Copy the authorization code from redirect URL
6. Run again with `--auth-code <code>`

```bash
pnpm start --input test.xls --output ./test-output --auth-code <your-code>
```

After first authorization, tokens are saved and you won't need `--auth-code` again.

## Step 5: Use It!

```bash
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3
```

## Troubleshooting

### "Missing Gmail OAuth credentials"
- Check `.env` file exists and has `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`

### "Please authorize the application"
- First run requires OAuth authorization
- Follow Step 4 above

### "Invalid authorization code"
- Authorization codes expire quickly (minutes)
- Get a fresh code from the authorization URL

### "Gmail API rate limit exceeded"
- Gmail has rate limits (250 quota units per user per second)
- Wait a minute and try again
- The tool includes automatic retry logic
