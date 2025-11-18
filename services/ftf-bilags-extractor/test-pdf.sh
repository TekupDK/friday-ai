#!/bin/bash
# Simple test script for PDF parsing
# Usage: ./test-pdf.sh <path-to-pdf-file>

set -e

PDF_FILE="${1:-test-data/Åbenstående 2+3 kvt. 2025.pdf}"

if [ ! -f "$PDF_FILE" ]; then
    echo "❌ PDF file not found: $PDF_FILE"
    echo ""
    echo "Usage: ./test-pdf.sh <path-to-pdf-file>"
    echo "Example: ./test-pdf.sh '/path/to/Åbenstående 2+3 kvt. 2025.pdf'"
    exit 1
fi

echo "📄 Testing PDF parsing with: $PDF_FILE"
echo ""

# Step 1: View PDF content
echo "Step 1: Extracting text from PDF..."
echo "=================================="
pnpm view-pdf "$PDF_FILE"
echo ""

# Step 2: Parse PDF (dry run)
echo "Step 2: Parsing PDF transactions (dry run)..."
echo "=============================================="
pnpm start --input "$PDF_FILE" --output ./test-output --dry-run

echo ""
echo "✅ Test complete! Check ./test-output/ for results."
