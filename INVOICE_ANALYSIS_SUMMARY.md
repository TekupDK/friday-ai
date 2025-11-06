# Billy Invoice Analysis Summary

**Analysis Date:** November 6, 2025  
**Data Source:** billy-api-response.json  
**Total Invoices Analyzed:** 121  
**Date Range:** June 2025 - November 2025

## 📊 Executive Summary

This analysis provides comprehensive insights into the invoicing patterns and financial health based on 121 invoices from the Billy.dk invoicing system.

### Key Findings

- **Total Revenue:** 240,055.58 DKK (net of credit notes)
- **Total Paid:** 195,035.61 DKK (81.2% collection rate)
- **Total Outstanding:** 45,019.97 DKK
- **Payment Rate:** 76.03% (92 out of 121 invoices paid)
- **Average Invoice Value:** 1,983.93 DKK

## 💰 Financial Overview

### Revenue Distribution

| Metric | Amount (DKK) | Percentage |
|--------|--------------|------------|
| Total Revenue | 240,055.58 | 100% |
| Revenue Collected | 195,035.61 | 81.2% |
| Outstanding | 45,019.97 | 18.8% |
| Tax Collected | 46,187.10 | 19.2% of revenue |

### Invoice Types

| Type | Count | Revenue (DKK) | Avg Value (DKK) |
|------|-------|---------------|-----------------|
| Regular Invoices | 112 | 256,435.08 | 2,289.60 |
| Credit Notes | 9 | -16,379.50 | -1,819.94 |
| **Net Total** | **121** | **240,055.58** | **1,983.93** |

## 📈 Trends & Insights

### Monthly Performance

The business shows seasonal variation with peak activity in September 2025:

| Month | Invoices | Revenue (DKK) | Paid (DKK) | Unpaid (DKK) | Collection Rate |
|-------|----------|---------------|------------|--------------|-----------------|
| Jun 2025 | 2 | 2,617.50 | 2,617.50 | 0.00 | 100% |
| Jul 2025 | 21 | 46,546.13 | 38,390.00 | 8,156.13 | 82.5% |
| Aug 2025 | 26 | 62,038.98 | 52,615.98 | 9,423.00 | 84.8% |
| Sep 2025 | 37 | 77,141.43 | 74,872.93 | 2,268.50 | 97.1% |
| Oct 2025 | 29 | 45,391.20 | 21,502.20 | 23,889.00 | 47.4% |
| Nov 2025 | 3 | 5,622.34 | 4,339.00 | 1,283.34 | 77.2% |

### Key Observations

1. **Peak Performance:** September 2025 showed the highest revenue (77,141.43 DKK) and excellent collection rate (97.1%)
2. **Recent Decline:** November shows an 87.6% revenue decrease from October, though this may be due to incomplete month data
3. **Collection Concerns:** October has a significantly lower collection rate (47.4%) with 23,889 DKK outstanding
4. **Credit Note Rate:** 7.4% of all invoices are credit notes (16,379.50 DKK in refunds), worth monitoring

## 📋 Invoice States

| State | Count | Revenue (DKK) | Percentage |
|-------|-------|---------------|------------|
| Approved | 102 | 215,105.11 | 89.6% |
| Voided | 19 | 24,950.47 | 10.4% |

**Note:** 19 invoices (15.7%) are voided, representing 24,950.47 DKK. This requires investigation to understand cancellation reasons.

## 💳 Payment Analysis

### Payment Status Breakdown

- **Paid Invoices:** 92 (76.03%)
  - Total Amount: 195,035.61 DKK
- **Unpaid Invoices:** 29 (23.97%)
  - Total Amount: 45,019.97 DKK

### Notable Invoices

- **Largest Invoice:** #1030 - 8,376 DKK (August 9, 2025)
- **Smallest Invoice:** #1100 - -523.5 DKK (October 29, 2025) - Credit note

## 🔍 Actionable Recommendations

### Immediate Actions

1. **Follow up on Outstanding Payments:**
   - 45,019.97 DKK is outstanding across 29 invoices
   - Focus on October invoices with 23,889 DKK unpaid

2. **Investigate Voided Invoices:**
   - 19 voided invoices (24,950.47 DKK) represent potential lost revenue
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
