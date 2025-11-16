# ChromaDB Threshold Tuning Plan 🎯

**Created:** November 9, 2025, 23:05
**Status:** Ready to Execute
**Purpose:** Use real RenDetalje data to optimize duplicate detection

---

## 🎉 Brilliant Idea

Brug **rigtige data fra RenDetalje** (Juli-December 2025) til at:

- Teste ChromaDB med real leads
- Optimere duplicate detection threshold
- Måle accuracy med rigtige duplicates
- Tune embeddings for bedre performance

---

## 📊 Data Sources

### 1. Google Calendar - RenOS Booking Calendar

- **Periode:** Juli 1 - December 31, 2025
- **Data:** Aftaler, kunder, kontaktinfo
- **Forventet:** 100-300 events

### 2. Email Threads (Gmail)

- **Periode:** Juli 1 - December 31, 2025
- **Data:** Email correspondance, participants
- **Forventet:** 200-500 threads

### 3. Billy Customer Database

- **Data:** Alle kunder fra Billy
- **Forventet:** 50-100 customers

**Total forventet:** 350-900 unique leads

---

## 🚀 Execution Plan

### Phase 1: Data Collection (30 min)

**Script:** `server/integrations/chromadb/scripts/collect-real-data.ts`

```bash
npx tsx server/integrations/chromadb/scripts/collect-real-data.ts

```text

**Output:**

- `test-data/real-leads.json` (all collected leads)
- Metadata (sources, counts, date range)
- Deduplication by email

**Expected output:**

```text
✅ Found 245 calendar events
✅ Found 389 email threads
✅ Found 67 Billy customers
✅ Total unique leads: 412
✅ Saved to: test-data/real-leads.json

```text

---

### Phase 2: Threshold Tuning (15 min)

**Script:** `server/integrations/chromadb/scripts/tune-threshold.ts`

```bash
npx tsx server/integrations/chromadb/scripts/tune-threshold.ts

```text

**What it does:**

1. Load all collected leads
1. Generate embeddings (OpenRouter API)
1. Identify known duplicates (same email = duplicate)
1. Test thresholds: **0.70, 0.75, 0.80, 0.85, 0.90, 0.95**
1. Calculate metrics:
   - **Precision:** TP / (TP + FP) - How accurate?
   - **Recall:** TP / (TP + FN) - How complete?
   - **F1 Score:**Harmonic mean -**Best metric!**
   - **Accuracy:** (TP + TN) / Total

**Expected output:**

```text
📊 RESULTS SUMMARY

Threshold | Precision | Recall | F1 Score | Accuracy
------------------------------------------------------------
0.70      |   85.2%  |  96.3% |   90.4% |   91.2%
0.75      |   88.1%  |  94.8% |   91.3% |   92.5%
0.80      |   91.3%  |  92.1% |   91.7% |   93.1%  ← BEST F1!
0.85      |   93.8%  |  89.4% |   91.5% |   92.8%  ← CURRENT
0.90      |   96.2%  |  84.7% |   90.1% |   91.5%
0.95      |   98.1%  |  76.3% |   85.9% |   88.2%

🎯 RECOMMENDATION: 0.80 (F1: 91.7%)
💡 Update server/db.ts line ~470

```text

---

### Phase 3: Update Code (5 min)

**If recommended threshold differs from 0.85:**

```typescript
// server/db.ts around line 470
if (similarity > 0.82) {
  // Changed from 0.85
  console.log(
    `[ChromaDB] Duplicate lead detected (similarity: ${similarity.toFixed(3)})`
  );
  return existingLead;
}

```bash

---

### Phase 4: Validation (10 min)

**Test in production:**

1. Restart server: `npm run dev`
1. Create test leads
1. Monitor logs for similarity scores
1. Verify duplicate detection works better

---

## 📈 Metrics Explained

### Confusion Matrix

```text
                 Predicted
              Duplicate | Unique
Actual ────────────────────────
Duplicate   TP         | FN
            (Correct!) | (Missed!)

Unique      FP         | TN
            (False     | (Correct!)
             alarm!)

```text

### Which Metric to Use

**F1 Score**←**USE THIS!**

- Balances precision and recall
- Best for finding optimal threshold
- Formula: `2 *(Precision* Recall) / (Precision + Recall)`

**Precision**

- How many predicted duplicates are actually duplicates?
- High = Few false positives
- Formula: `TP / (TP + FP)`

**Recall**

- How many actual duplicates did we catch?
- High = Few missed duplicates
- Formula: `TP / (TP + FN)`

---

## 🎯 Threshold Trade-offs

| Threshold     | Behavior                                | Use Case                              |
| ------------- | --------------------------------------- | ------------------------------------- |
| **0.70-0.75** | Loose - Catches more, more false alarms | High volume, manual review available  |
| **0.80-0.85** | Balanced - Best F1 score                | Automated detection (our case)        |
| **0.90-0.95** | Strict - Very accurate, may miss some   | Critical data, expensive false merges |

---

## 🔄 Workflow Summary

```mermaid
graph LR
    A[Collect Data] --> B[Generate Embeddings]
    B --> C[Test Thresholds]
    C --> D[Calculate Metrics]
    D --> E[Find Optimal]
    E --> F[Update Code]
    F --> G[Validate]

```text

1. **Collect** → Real data from Calendar, Email, Billy
1. **Embed** → Generate embeddings for all leads
1. **Test** → Try different thresholds
1. **Measure** → Calculate P, R, F1, Accuracy
1. **Optimize** → Pick highest F1 score
1. **Update** → Change threshold in code
1. **Validate** → Test in production

---

## 💡 Why This Works

### Real Data Benefits

✅ **Actual duplicates** - Not synthetic
✅ **Real edge cases** - Name variations, typos
✅ **Production patterns** - How customers actually appear
✅ **Domain-specific** - RenDetalje business context

### Scientific Approach

✅ **Objective metrics** - Not guessing
✅ **Data-driven** - Based on real results
✅ **Reproducible** - Can re-run anytime
✅ **Continuous improvement** - Re-tune as data grows

---

## 📁 Files Created

```text
server/integrations/chromadb/
├── scripts/
│   ├── README.md                    ← Full documentation
│   ├── collect-real-data.ts         ← Phase 1: Data collection
│   └── tune-threshold.ts            ← Phase 2: Threshold tuning
├── test-data/
│   └── real-leads.json              ← Generated data (not committed)
└── THRESHOLD_TUNING_PLAN.md         ← This file

```text

---

## 🎯 Success Criteria

**After tuning, we should have:**

- ✅ Optimal threshold identified (data-driven)
- ✅ F1 score >90% (high quality)
- ✅ Precision >85% (few false positives)
- ✅ Recall >85% (catches most duplicates)
- ✅ Tested with 300+ real leads
- ✅ Production validation complete

---

## 🐛 Known Limitations

1. **Duplicate identification** - Uses email matching (may miss some)
1. **OpenRouter API** - Rate limits may slow down embedding generation
1. **Data freshness** - Need to re-tune as business grows
1. **Edge cases** - Some duplicates may be subjective

**Solutions:**

- Manual review of edge cases
- Re-tune quarterly with fresh data
- A/B test if uncertain
- Monitor production logs

---

## 🚀 Ready to Execute

**Quick start:**

```bash
# Step 1: Collect data (30 min)
npx tsx server/integrations/chromadb/scripts/collect-real-data.ts

# Step 2: Tune threshold (15 min)
npx tsx server/integrations/chromadb/scripts/tune-threshold.ts

# Step 3: Update code if recommended

# Step 4: Test in production
npm run dev

```

---

## 📊 Expected Benefits

### Before (Current: 0.85)

- Threshold: 0.85 (guessed)
- Accuracy: ~90% (estimated)
- Confidence: Medium (not tested with real data)

### After (Optimized)

- Threshold: **0.80-0.85** (data-driven)
- Accuracy: **91-93%** (measured)
- Confidence: **High** (tested with 300+ leads)
- F1 Score: **>91%**

**Improvement:** +3-5% accuracy, science-backed confidence! 🎉

---

**Status:** ✅ Scripts Ready, Awaiting Execution
**Next Step:** Run data collection script
**Estimated Time:** 1 hour total
**Value:** Optimized duplicate detection for production

**Let's do this! 🚀**
