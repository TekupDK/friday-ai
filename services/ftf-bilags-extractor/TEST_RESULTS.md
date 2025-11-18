# PDF Parsing Test Results

## ✅ Parser Logic Verified

The PDF parsing logic has been tested and verified using sample text content from the bank statement. The parser correctly:

1. ✅ Extracts dates in DD-MM-YYYY format
2. ✅ Parses amounts in parentheses as negative (expenses)
3. ✅ Handles Danish number format (1.234,56)
4. ✅ Identifies suppliers correctly (Danfoods, Dagrofa, Circle K, etc.)
5. ✅ Extracts transaction text properly

## Test Results

From sample text (34 transactions):
- **Braendstof**: 12 transactions
- **Diverse**: 8 transactions  
- **Danfoods**: 7 transactions
- **Dagrofa**: 4 transactions
- **Airbnb**: 2 transactions
- **Inco**: 1 transaction

**Total amount parsed**: 83,970.39 DKK

## Sample Parsed Transactions

```
2025-06-02 | MCD 00974 CIRCLE K ARHUS V      | -400.08 | Braendstof
2025-06-02 | MCD 00980 AIRBNB * HMHFMWNEQN   | -2643.52 | Airbnb
2025-06-02 | MCD 00984 DAGROFA S/ENGRO       | -1954.56 | Dagrofa
2025-06-03 | LS 38393 DANFOODS APS           | -9986.14 | Danfoods
```

## Next Steps: Test with Actual PDF

To test with the actual PDF file (`Åbenstående 2+3 kvt. 2025.pdf`):

1. **Place the PDF file** in the test-data directory:
   ```bash
   # Copy your PDF file to:
   services/ftf-bilags-extractor/test-data/Åbenstående 2+3 kvt. 2025.pdf
   ```

2. **View the extracted text** from the PDF:
   ```bash
   cd services/ftf-bilags-extractor
   pnpm view-pdf "test-data/Åbenstående 2+3 kvt. 2025.pdf"
   ```

3. **Parse the PDF** (dry-run mode):
   ```bash
   pnpm start --input "test-data/Åbenstående 2+3 kvt. 2025.pdf" --output ./test-output --dry-run
   ```

4. **Check the results**:
   - Review the console output for parsed transactions
   - Check `test-output/report.json` and `test-output/report.csv`

## Fixed Issues

- ✅ Amount parsing now correctly handles parentheses (negative amounts)
- ✅ Avoids matching years (2025) as amounts
- ✅ Properly extracts transaction text between date and amount
- ✅ Handles Danish number format with commas and dots
