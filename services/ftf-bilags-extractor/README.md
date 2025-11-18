# FTF BilagsExtractor

Standalone CLI tool for matching bank transactions against Gmail invoices/receipts for Foodtruck Fiesta ApS (`ftfiestaa@gmail.com`).

## Features

1. **Parse bank statements** (XLS/CSV) into structured transactions
2. **Search Gmail** (`ftfiestaa@gmail.com`) for relevant invoices/receipts
3. **Match transactions** with email attachments using intelligent scoring
4. **Download attachments** into organized folder structure
5. **Generate reports** (JSON + CSV) for accountant
6. **Deduplication** using SHA-256 hashing to avoid duplicate downloads

## Quick Start

### 1. First Run - Authorize Gmail

```bash
cd services/ftf-bilags-extractor
pnpm start --input bank-statement.xls --output ./output/test
```

This will show you an authorization URL. Follow these steps:

1. Copy the authorization URL from console
2. Open in browser
3. Sign in as `ftfiestaa@gmail.com`
4. Grant Gmail read-only access
5. Copy the authorization code from redirect URL (looks like `4/0A...`)
6. Run again with `--auth-code`:

```bash
pnpm start --input bank-statement.xls --output ./output/test --auth-code <your-code>
```

After first authorization, tokens are saved to `~/.config/ftf-bilag-extractor/token.json` and you won't need `--auth-code` again.

### 2. Normal Usage

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

# Dry run (no downloads, just report)
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3 \
  --dry-run
```

## Configuration

Credentials are already configured in `.env`:
- **Client ID**: `32040013275-oetuh0614ltcedsotr2ue1rajbd05n0n.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Email**: `ftfiestaa@gmail.com`

## Output Structure

```
output/2025-q3/
├── Danfoods/
│   ├── 20250603_danfoods_9986.14_msg-xxx_att-yyy.pdf
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
├── report.csv
└── matches.db.json  (deduplication cache)
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
        "path": "Danfoods/20250603_danfoods_9986.14_msg-xxx_att-yyy.pdf",
        "matchScore": 0.95,
        "hash": "sha256:..."
      }
    ]
  }
]
```

### report.csv

CSV with columns: `date, text, amount, supplier, status, files, matchCount, bestMatchScore`

## Supported Suppliers

- **Danfoods** - Keywords: "DANFOODS", "LS 38393"
- **Dagrofa** - Keywords: "DAGROFA"
- **Inco** - Keywords: "INCO CC", "INCO"
- **AarhusCatering** - Keywords: "AARHUS CATERING"
- **Braendstof** - Keywords: "CIRCLE K", "Q8", "UNO-X", "OK", "INGO", "OIL TANK GO", "SHELL", "STATOIL"
- **Airbnb** - Keywords: "AIRBNB"
- **Festival** - Keywords: "FESTIVAL", "SFF", "MARKED", "KLOSTERMÆRKEN", "DANA CUP", "ROSKILDE"
- **RendetaljeExcluded** - Keywords: "RENDETALJE" (excluded from processing)
- **Diverse** - Catch-all for unmatched transactions

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode (for development)
pnpm dev

# Run with TypeScript directly
tsx src/cli.ts --input test.xls --output ./test-output
```

## Architecture

- **config.ts** - Environment configuration loader
- **gmailAuth.ts** - OAuth2 authentication flow
- **gmailClient.ts** - Gmail API wrapper
- **bankImport.ts** - Bank statement parser (XLS/CSV)
- **supplierMapping.ts** - Supplier detection from transaction text
- **matcher.ts** - Transaction-to-email matching with scoring
- **dedupe.ts** - SHA-256 based deduplication
- **report.ts** - JSON + CSV report generation
- **cli.ts** - Command-line interface

## Troubleshooting

### "Missing Gmail OAuth credentials"
- Check `.env` file exists and has correct credentials
- Credentials are already configured for `ftfiestaa@gmail.com`

### "Please authorize the application"
- First run requires OAuth authorization
- Follow Quick Start Step 1 above

### "Invalid authorization code"
- Authorization codes expire quickly (minutes)
- Get a fresh code from the authorization URL

### "Gmail API rate limit exceeded"
- Gmail has rate limits (250 quota units per user per second)
- Wait a minute and try again
- The tool includes automatic retry logic

### Bank statement parsing issues
- Ensure file is XLS, XLSX, or CSV format
- Check that columns are named correctly (Dato, Tekst, Beløb)
- The parser tries common Danish bank export formats automatically
