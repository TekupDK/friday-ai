# FTF BilagsExtractor

Standalone CLI tool for matching bank transactions against Gmail invoices/receipts for Foodtruck Fiesta ApS.

## Features

1. **Parse bank statements** (XLS/CSV) into structured transactions
2. **Search Gmail** (`ftfiestaa@gmail.com`) for relevant invoices/receipts
3. **Match transactions** with email attachments
4. **Download attachments** into organized folder structure
5. **Generate reports** (JSON + CSV) for accountant

## Setup

### 1. Google OAuth Credentials

Create a Google Cloud project and OAuth 2.0 credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing) - e.g., "TekUp - BilagsExtractor"
3. Enable **Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. Create **OAuth 2.0 Client ID**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: "BilagsExtractor"
   - Click "Create"
   - Copy **Client ID** and **Client Secret**
5. **Important**: Add authorized redirect URIs:
   - `http://localhost:8080/callback`
   - Or use the redirect URI you specify in `.env`

### 2. Environment Variables

Create `.env` file in `services/ftf-bilags-extractor/`:

```bash
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:8080/callback
GMAIL_EMAIL=ftfiestaa@gmail.com
```

### 3. Install Dependencies

```bash
cd services/ftf-bilags-extractor
pnpm install
```

### 4. Build

```bash
pnpm build
```

## Usage

### First Run - Authorize Gmail Access

```bash
# This will prompt you to authorize
pnpm start --input bank-statement.xls --output ./output/2025-q3
```

On first run, you'll be prompted to:
1. Open authorization URL in browser
2. Sign in as `ftfiestaa@gmail.com`
3. Grant Gmail read-only access
4. Copy authorization code
5. Run again with `--auth-code <code>`

### Normal Usage

```bash
# Extract bilag for Q3 2025
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3

# Filter by specific suppliers (for testing)
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3 \
  --supplier-filter "Danfoods,Dagrofa"

# Dry run (no downloads)
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3 \
  --dry-run
```

## Output Structure

```
output/2025-q3/
├── Danfoods/
│   ├── 2025-06-03_danfoods_9986.14_msg-xxx_att-yyy.pdf
│   └── ...
├── Dagrofa/
├── Inco/
├── Aarhus-Catering/
├── Braendstof/
├── Airbnb/
├── Festivaler/
├── Diverse/
├── Rendetalje-excluded/
├── report.json
└── report.csv
```

## Report Format

### report.json

```json
[
  {
    "transactionId": "tx-001",
    "date": "2025-06-03",
    "text": "LS 38393 DANFOODS APS",
    "amount": -9986.14,
    "supplier": "Danfoods",
    "status": "FOUND",
    "matchedAttachments": [
      {
        "transactionId": "tx-001",
        "messageId": "msg-xxx",
        "attachmentId": "att-yyy",
        "filename": "invoice.pdf",
        "path": "Danfoods/2025-06-03_danfoods_9986.14_msg-xxx_att-yyy.pdf",
        "matchScore": 0.95,
        "hash": "sha256:..."
      }
    ]
  }
]
```

### report.csv

CSV with columns: `date, text, amount, supplier, status, files`

## Development

```bash
# Watch mode
pnpm dev

# Run with TypeScript directly
tsx src/cli.ts --input test.xls --output ./test-output
```

## Architecture

- **config.ts** - Environment configuration
- **gmailAuth.ts** - OAuth2 authentication
- **gmailClient.ts** - Gmail API wrapper
- **bankImport.ts** - Bank statement parser
- **supplierMapping.ts** - Supplier detection
- **matcher.ts** - Transaction-to-email matching
- **dedupe.ts** - Attachment deduplication
- **report.ts** - Report generation
- **cli.ts** - Command-line interface
