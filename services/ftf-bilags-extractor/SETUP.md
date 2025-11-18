# Quick Setup Guide

## ✅ Already Configured!

OAuth credentials are already set up in `.env`:
- **Client ID**: `32040013275-oetuh0614ltcedsotr2ue1rajbd05n0n.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Email**: `ftfiestaa@gmail.com`

## Step 1: First Run - Authorize Gmail

```bash
cd services/ftf-bilags-extractor
pnpm start --input your-bank-statement.xls --output ./output/test
```

You'll see an authorization URL. Follow these steps:

1. **Copy the URL** from console (starts with `https://accounts.google.com/...`)
2. **Open in browser**
3. **Sign in** as `ftfiestaa@gmail.com`
4. **Grant access** to Gmail read-only
5. **Copy the code** from redirect URL (parameter `code=4/0A...`)
6. **Run again** with the code:

```bash
pnpm start --input your-bank-statement.xls --output ./output/test --auth-code 4/0A...
```

✅ **Done!** Tokens are saved. You won't need `--auth-code` again.

## Step 2: Use It!

```bash
# Process full bank statement
pnpm start \
  --input ./data/bank-2025-q3.xls \
  --output ./output/2025-q3

# Test with specific suppliers
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

## Output

After running, you'll get:
- **Organized folders** by supplier (Danfoods/, Dagrofa/, etc.)
- **Downloaded attachments** (PDFs, images)
- **report.json** - Full match details
- **report.csv** - Summary for accountant
- **matches.db.json** - Deduplication cache

## Troubleshooting

### "Missing Gmail OAuth credentials"
✅ Already configured in `.env` - should not happen

### "Please authorize the application"
- First run requires OAuth - follow Step 1 above

### "Invalid authorization code"
- Codes expire quickly - get a fresh one from the URL

### "Gmail API rate limit exceeded"
- Wait 1 minute and try again
- Gmail limits: 250 quota units per user per second

### Bank file not found
- Check file path is correct
- Supported formats: `.xls`, `.xlsx`, `.csv`

## Next Steps

1. ✅ **Test with a small bank file** first
2. ✅ **Check output** - verify matches look correct
3. ✅ **Run on full period** when ready
4. ✅ **Share report.csv** with accountant
