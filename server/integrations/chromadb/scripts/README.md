# ChromaDB Testing & Tuning Scripts

Scripts for collecting real production data and tuning ChromaDB duplicate detection.

---

## 📋 Overview

### Purpose

Use **real production data** from RenDetalje (July-December 2025) to:

- Test ChromaDB with actual leads
- Tune duplicate detection threshold
- Measure accuracy with real duplicates
- Optimize embedding performance

### Data Sources

1. **Google Calendar** (RenOS Booking Calendar)
2. **Email Threads** (Gmail)
3. **Billy Customer Database**

---

## 🚀 Usage

### Step 1: Collect Real Data (30 min)

```bash
npx tsx server/integrations/chromadb/scripts/collect-real-data.ts
```

**What it does:**

- Fetches calendar events (July-Dec 2025)
- Extracts email thread participants
- Pulls Billy customer database
- Deduplicates by email/name
- Saves to `test-data/real-leads.json`

**Output:**

```json
{
  "metadata": {
    "collected": "2025-11-09T22:30:00.000Z",
    "dateRange": {
      "start": "2025-07-01T00:00:00Z",
      "end": "2025-12-31T23:59:59Z"
    },
    "totalLeads": 450,
    "uniqueLeads": 320,
    "sources": {
      "calendar": 120,
      "email": 250,
      "billy": 80
    }
  },
  "leads": [
    {
      "source": "calendar",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+45 12 34 56 78",
      "company": "Example Corp",
      "rawData": {...}
    },
    ...
  ]
}
```

---

### Step 2: Tune Threshold (15 min)

```bash
npx tsx server/integrations/chromadb/scripts/tune-threshold.ts
```

**What it does:**

- Loads collected leads
- Generates embeddings for all
- Identifies known duplicates (same email)
- Tests thresholds: 0.70, 0.75, 0.80, 0.85, 0.90, 0.95
- Calculates metrics:
  - **Precision:** TP / (TP + FP)
  - **Recall:** TP / (TP + FN)
  - **F1 Score:** Harmonic mean
  - **Accuracy:** (TP + TN) / Total
- Recommends optimal threshold

**Example Output:**

```
📊 RESULTS SUMMARY
============================================================

Threshold | Precision | Recall | F1 Score | Accuracy
------------------------------------------------------------
0.70      |   85.2%  |  96.3% |   90.4% |   91.2%
0.75      |   88.1%  |  94.8% |   91.3% |   92.5%
0.80      |   91.3%  |  92.1% |   91.7% |   93.1%
0.85      |   93.8%  |  89.4% |   91.5% |   92.8% ← CURRENT
0.90      |   96.2%  |  84.7% |   90.1% |   91.5%
0.95      |   98.1%  |  76.3% |   85.9% |   88.2%

🎯 RECOMMENDATION:
------------------------------------------------------------
Optimal Threshold: 0.80
F1 Score: 91.7%
Precision: 91.3%
Recall: 92.1%
Accuracy: 93.1%

💡 Consider updating threshold from 0.85 to 0.80
   Update in: server/db.ts (line ~470)
   Change: if (similarity > 0.85) to if (similarity > 0.80)
```

---

## 📊 Understanding Metrics

### Confusion Matrix

```
                    Predicted
                 Duplicate | Unique
Actual ─────────────────────────────
Duplicate    TP          | FN
             (Good!)     | (Missed)
Unique       FP          | TN
             (False      | (Good!)
              alarm)
```

### Metrics Explained

**Precision (PPV)**

- What % of predicted duplicates are actually duplicates?
- High precision = Few false alarms
- Formula: `TP / (TP + FP)`

**Recall (Sensitivity)**

- What % of actual duplicates are detected?
- High recall = Few missed duplicates
- Formula: `TP / (TP + FN)`

**F1 Score**

- Harmonic mean of precision and recall
- Balances both metrics
- Formula: `2 * (P * R) / (P + R)`
- **Use this to pick optimal threshold**

**Accuracy**

- Overall correctness
- Formula: `(TP + TN) / Total`

---

## 🎯 Threshold Trade-offs

| Threshold     | Behavior | Use Case                                                                        |
| ------------- | -------- | ------------------------------------------------------------------------------- |
| **0.70-0.75** | Loose    | High recall, more false positives. Use if missing duplicates is costly.         |
| **0.80-0.85** | Balanced | Good F1 score. Best for most cases.                                             |
| **0.90-0.95** | Strict   | High precision, may miss similar duplicates. Use if false positives are costly. |

---

## 💡 Interpretation Guide

### High Precision, Low Recall (e.g., 0.95 threshold)

- Very few false positives
- But misses some duplicates
- **Good for:** Critical data where false merges are expensive

### Low Precision, High Recall (e.g., 0.70 threshold)

- Catches most duplicates
- But many false positives
- **Good for:** Flagging potential duplicates for manual review

### Balanced (e.g., 0.80-0.85 threshold)

- Best F1 score
- Good compromise
- **Good for:** Automated duplicate prevention (our use case)

---

## 🔄 Recommended Workflow

1. **Collect data** (run once or when you need fresh data)

   ```bash
   npx tsx server/integrations/chromadb/scripts/collect-real-data.ts
   ```

2. **Tune threshold** (after collecting data)

   ```bash
   npx tsx server/integrations/chromadb/scripts/tune-threshold.ts
   ```

3. **Update threshold** if recommended

   ```typescript
   // server/db.ts around line 470
   if (similarity > 0.8) {
     // Changed from 0.85
     console.log(
       `[ChromaDB] Duplicate lead detected (similarity: ${similarity.toFixed(3)})`
     );
     return existingLead;
   }
   ```

4. **Test in production**
   - Create test leads
   - Monitor logs for similarity scores
   - Adjust if needed

5. **Re-tune periodically** (e.g., quarterly)
   - As your data evolves
   - As you get more leads
   - To maintain accuracy

---

## 📁 File Structure

```
chromadb/
├── scripts/
│   ├── README.md                 ← You are here
│   ├── collect-real-data.ts      ← Step 1: Data collection
│   └── tune-threshold.ts         ← Step 2: Threshold tuning
├── test-data/
│   └── real-leads.json           ← Generated by Step 1
└── ...
```

---

## 🐛 Troubleshooting

### "Real data not found"

**Solution:** Run `collect-real-data.ts` first

### "Failed to generate embedding"

**Cause:** OpenRouter API issue or rate limit  
**Solution:** Wait a minute, try again. Embeddings are cached.

### "No calendar events found"

**Cause:** No events in date range or calendar access issue  
**Solution:** Check Google Calendar auth, verify date range

### TypeScript errors in collect script

**Cause:** API response structure mismatch  
**Solution:** Check actual API responses, update type definitions

---

## 📝 Example: Full Workflow

```bash
# 1. Collect real data from production
npx tsx server/integrations/chromadb/scripts/collect-real-data.ts

# Expected output:
# ✅ Found 245 calendar events
# ✅ Found 389 email threads
# ✅ Found 67 Billy customers
# ✅ Saved to: test-data/real-leads.json
# Total unique leads: 412

# 2. Tune threshold with real data
npx tsx server/integrations/chromadb/scripts/tune-threshold.ts

# Expected output:
# ✅ Generated 412 embeddings
# ✅ Identified 45 known duplicate pairs
#
# Optimal Threshold: 0.82
# F1 Score: 92.4%
#
# 💡 Update threshold from 0.85 to 0.82

# 3. Update code
# Edit server/db.ts line ~470:
# if (similarity > 0.82) { // Changed from 0.85

# 4. Test
npm run dev
# Create test leads and observe duplicate detection
```

---

## 🎓 Best Practices

1. **Re-tune regularly** (every 3-6 months)
2. **Monitor false positives** in production logs
3. **Collect more data** as your business grows
4. **A/B test** if unsure (e.g., 0.80 vs 0.85)
5. **Document changes** in git commits

---

## 📚 Resources

- [ChromaDB Documentation](https://docs.trailofbits.com/chromadb/)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Precision vs Recall](https://en.wikipedia.org/wiki/Precision_and_recall)
- [F1 Score](https://en.wikipedia.org/wiki/F-score)

---

**Status:** ✅ Ready to use  
**Last Updated:** November 9, 2025  
**Maintainer:** RenDetalje Team
