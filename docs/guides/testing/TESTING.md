# ChromaDB Integration Testing Guide

**Date:** November 9, 2025
**Status:** Testing Lead Deduplication

---

## 🧪 Test 1: Embeddings

**Script:** `server/integrations/chromadb/test-embeddings.ts`

```bash
npx tsx server/integrations/chromadb/test-embeddings.ts

```text

**Expected Results:**

- ✅ 1536 dimensions
- ✅ Similar leads: 0.93 similarity
- ✅ Different leads: 0.66 similarity
- ✅ Performance: ~600ms per embedding

**Status:** ✅ PASSED

---

## 🧪 Test 2: Lead Deduplication

**Script:** `server/integrations/chromadb/test-lead-dedup.ts`

```bash
npx tsx server/integrations/chromadb/test-lead-dedup.ts

```text

**Test Scenario:**

1. Create Lead 1: John Doe @ ACME Corporation
1. Create Lead 2: John Doe @ ACME Corp (slight variation)
1. Create Lead 3: Jane Smith @ XYZ Industries

**Expected Results:**

- ✅ Lead 1: New lead created
- ✅ Lead 2: Returns Lead 1 (duplicate detected)
- ✅ Lead 3: New lead created
- ✅ Total unique leads: 2

**Check Server Logs For:**

```text
[ChromaDB] Indexed new lead #1
[ChromaDB] Duplicate lead detected (similarity: 0.93X), returning existing lead #1
[ChromaDB] Indexed new lead #3

```bash

---

## 🧪 Test 3: Manual Lead Creation (UI)

### Prerequisites

1. ChromaDB running: `docker ps | grep chromadb`
1. Friday AI running: `pnpm dev`
1. `.env.dev` has `CHROMA_ENABLED=true`

### Steps

**Step 1: Create First Lead**

1. Go to Leads tab
1. Create lead:
   - Name: Test User
   - Email: <test@example.com>
   - Company: Test Company
1. Note the lead ID

**Step 2: Create Duplicate Lead**

1. Create another lead with slight variations:
   - Name: Test User
   - Email: <test<.user@example.co>m>
   - Company: Test Co
1. Check if same lead ID is returned

**Expected Behavior:**

- ✅ First lead creates new entry
- ✅ Second lead returns existing (duplicate detected)
- ✅ Console shows duplicate detection message

---

## 🧪 Test 4: Email Context (After Integration)

**Coming soon...**

---

## 🐛 Troubleshooting Tests

### ChromaDB Not Responding

```bash
# Check if running
docker ps | grep chromadb

# Check logs
docker logs friday-chromadb

# Restart
docker restart friday-chromadb

```text

### No Duplicate Detection

**Check:**

1. `CHROMA_ENABLED=true` in `.env.dev`
1. Server restarted after env change
1. ChromaDB has data: Check collections
1. Embeddings API working (OpenRouter key valid)

**Debug:**

```bash
# Check ChromaDB collections
curl <http://localhost:8000/api/v2/collections>

```text

### Embeddings Failing

**Check:**

1. `OPENROUTER_API_KEY` set in `.env.dev`
1. API key is valid
1. Network connectivity

**Test:**

```bash
npx tsx server/integrations/chromadb/test-embeddings.ts

```text

---

## 📊 Performance Benchmarks

### Embeddings

```text
Single embedding:     ~600ms (API call)
Cached embedding:     ~1ms
Batch (10 texts):     ~800ms

```text

### Lead Deduplication

```text
Duplicate check:      ~700ms (includes embedding + search)
New lead creation:    ~800ms (includes embedding + insert)

```text

### ChromaDB Operations

```text
Add document:         ~50ms
Search (1M vectors):  ~50ms

```text

---

## ✅ Success Criteria

**Embeddings:**

- [x] Generates 1536-dim vectors
- [x] Semantic similarity works
- [x] Caching reduces latency
- [x] Fallback on API failure

**Lead Deduplication:**

- [ ] Detects near-identical leads (>0.85 similarity)
- [ ] Creates new for different leads (<0.85)
- [ ] Logs similarity scores
- [ ] Gracefully handles ChromaDB failures

**Performance:**

- [ ] <1s total for lead creation
- [ ] No UI blocking
- [ ] Scales to 10K+ leads

---

## 🔍 Monitoring

### Check ChromaDB Data

```bash
# List collections
curl <http://localhost:8000/api/v2/collections>

# Count documents
curl <http://localhost:8000/api/v2/collections/friday_leads>

```text

### Check Logs

**Friday AI Server:**

```text
[ChromaDB] Duplicate lead detected (similarity: 0.932)
[ChromaDB] Indexed new lead #123
[Embeddings] Generated embedding (1536 dimensions)

```bash

**ChromaDB Docker:**

```bash
docker logs friday-chromadb -f

```

---

## 📝 Test Results Log

### Test Run: [DATE]

**Environment:**

- ChromaDB: Running ✅
- OpenRouter API: Connected ✅
- Friday AI: v2.0.0

**Test 1: Embeddings**

- Status: PASSED ✅
- Time: 660ms avg

**Test 2: Lead Dedup**

- Status: [PENDING]
- Duplicate detected: [YES/NO]
- Similarity score: [X.XXX]

**Test 3: Manual UI**

- Status: [PENDING]
- Notes: [Add notes here]

---

**Last Updated:** November 9, 2025 15:10
