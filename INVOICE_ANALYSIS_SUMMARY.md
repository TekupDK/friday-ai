# Billy Invoice Analysis Summary

**Analysis Date:** November 6, 2025  
**Data Source:** billy-api-response.json  
**Total Invoices Analyzed:** 121  
**Date Range:** June 2025 - November 2025

## 📊 Executive Summary

This analysis provides comprehensive insights into the invoicing patterns and financial health based on 121 invoices from the Billy.dk invoicing system.

### Key Findings

- **Total Revenue:** 256,435.08 DKK
- **Total Paid:** 217,324.61 DKK (84.7% collection rate)
- **Total Outstanding:** 55,489.97 DKK
- **Payment Rate:** 76.03% (92 out of 121 invoices paid)
- **Average Invoice Value:** 2,119.30 DKK

## 💰 Financial Overview

### Revenue Distribution

| Metric | Amount (DKK) | Percentage |
|--------|--------------|------------|
| Total Revenue | 256,435.08 | 100% |
| Revenue Collected | 217,324.61 | 84.7% |
| Outstanding | 55,489.97 | 21.6% |
| Tax Collected | 52,738.90 | 20.6% of revenue |

### Invoice Types

| Type | Count | Revenue (DKK) | Avg Value (DKK) |
|------|-------|---------------|-----------------|
| Regular Invoices | 112 | 256,435.08 | 2,289.60 |
| Credit Notes | 9 | 16,379.50 | 1,819.94 |

## 📈 Trends & Insights

### Monthly Performance

The business shows seasonal variation with peak activity in September 2025:

| Month | Invoices | Revenue (DKK) | Paid (DKK) | Unpaid (DKK) | Collection Rate |
|-------|----------|---------------|------------|--------------|-----------------|
| Jun 2025 | 2 | 2,617.50 | 2,617.50 | 0.00 | 100% |
| Jul 2025 | 21 | 54,922.13 | 38,390.00 | 16,532.13 | 69.9% |
| Aug 2025 | 26 | 73,904.98 | 64,481.98 | 9,423.00 | 87.3% |
| Sep 2025 | 37 | 82,725.43 | 80,456.93 | 2,268.50 | 97.3% |
| Oct 2025 | 29 | 50,230.20 | 26,341.20 | 23,889.00 | 52.4% |
| Nov 2025 | 3 | 5,622.34 | 4,339.00 | 1,283.34 | 77.2% |

### Key Observations

1. **Peak Performance:** September 2025 showed the highest revenue (82,725.43 DKK) and excellent collection rate (97.3%)
2. **Recent Decline:** November shows an 88.8% revenue decrease from October, though this may be due to incomplete month data
3. **Collection Concerns:** October has a significantly lower collection rate (52.4%) with 23,889 DKK outstanding
4. **Credit Note Rate:** 7.4% of all invoices are credit notes, which is within normal range but worth monitoring

## 📋 Invoice States

| State | Count | Revenue (DKK) | Percentage |
|-------|-------|---------------|------------|
| Approved | 102 | 237,394.11 | 84.3% |
| Voided | 19 | 35,420.47 | 15.7% |

**Note:** 19 invoices (15.7%) are voided, representing 35,420.47 DKK. This requires investigation to understand cancellation reasons.

## 💳 Payment Analysis

### Payment Status Breakdown

- **Paid Invoices:** 92 (76.03%)
  - Total Amount: 217,324.61 DKK
- **Unpaid Invoices:** 29 (23.97%)
  - Total Amount: 55,489.97 DKK

### Notable Invoices

- **Largest Invoice:** #1030 - 8,376 DKK (August 9, 2025)
- **Smallest Invoice:** #1100 - -523.5 DKK (October 29, 2025) - Credit note

## 🔍 Actionable Recommendations

### Immediate Actions

1. **Follow up on Outstanding Payments:**
   - 55,489.97 DKK is outstanding across 29 invoices
   - Focus on October invoices with 23,889 DKK unpaid

2. **Investigate Voided Invoices:**
   - 19 voided invoices (35,420.47 DKK) represent potential lost revenue
   - Analyze reasons for cancellations to improve processes

3. **November Performance:**
   - Monitor November closely as it shows early signs of revenue decline
   - Only 3 invoices so far (data may be incomplete)

### Process Improvements

1. **Payment Terms Review:**
   - Current payment rate of 76% is acceptable but could be improved
   - Consider implementing earlier payment reminders

2. **Credit Note Analysis:**
   - 7.4% credit note rate suggests some service quality or pricing issues
   - Review patterns to identify systemic problems (similar to Emil Lærke case)

3. **Seasonal Planning:**
   - September showed peak performance - understand drivers
   - Prepare for October/November slowdown pattern

## 📊 Data Quality Notes

- Data timestamp: November 5, 2025, 20:28:52 UTC
- All amounts in DKK (Danish Kroner)
- Analysis includes both regular invoices and credit notes
- Voided invoices are included in totals for complete financial picture

## 🔗 Related Analysis

- **Customer Case Analysis:** See `analysis-emil-laerke.json` for detailed customer conflict analysis
- **Lessons Learned:** Price mismatch issues identified in customer cases should inform invoice clarity improvements

## 📁 Files Generated

1. `billy-invoice-analysis.json` - Complete structured analysis data
2. `INVOICE_ANALYSIS_SUMMARY.md` - This summary document (human-readable)
3. `server/scripts/analyze-billy-invoices.ts` - Analysis script (reusable)

## 🚀 Running the Analysis

To regenerate this analysis with updated data:

```bash
# Using npm script
pnpm run analyze:billy

# Or directly with tsx
npx tsx server/scripts/analyze-billy-invoices.ts
```

The script will:
1. Read `billy-api-response.json`
2. Perform comprehensive analysis
3. Generate `billy-invoice-analysis.json`
4. Display summary in console

---

**Generated by:** Billy Invoice Analysis Script  
**Version:** 1.0.0  
**Last Updated:** November 6, 2025
