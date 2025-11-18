# Test PDF Parsing

## Quick Test Guide

### Step 1: Place your PDF file
Place your PDF bank statement file in this directory or provide the full path.

Example:
```bash
# If your PDF is named "Åbenstående 2+3 kvt. 2025.pdf"
# Place it in: services/ftf-bilags-extractor/test-data/
# Or use the full path when running commands
```

### Step 2: View PDF content (debug)
First, extract and view the text content to understand the PDF structure:

```bash
pnpm view-pdf "path/to/your/file.pdf"
# Or if in test-data folder:
pnpm view-pdf "test-data/Åbenstående 2+3 kvt. 2025.pdf"
```

This will show you:
- Number of pages
- Extracted text content
- First 20 lines for debugging

### Step 3: Test PDF parsing
Run the full CLI with your PDF file:

```bash
# Dry run (no Gmail calls, just parse PDF)
pnpm start --input "path/to/your/file.pdf" --output ./test-output --dry-run

# Full run (requires Gmail auth)
pnpm start --input "path/to/your/file.pdf" --output ./test-output
```

### Step 4: Check results
After running, check:
- `test-output/report.json` - Full transaction data
- `test-output/report.csv` - CSV report for accountant
- Console output - Summary statistics

## Expected Output

The parser should extract:
- Transaction dates (DD-MM-YYYY, DD.MM.YYYY, etc.)
- Transaction descriptions/text
- Amounts (Danish format: 1.234,56)
- Supplier guesses (Danfoods, Dagrofa, etc.)

## Troubleshooting

If parsing fails:
1. Run `view-pdf` first to see the raw text
2. Check if date/amount patterns match Danish bank formats
3. Adjust regex patterns in `src/bankImport.ts` if needed
