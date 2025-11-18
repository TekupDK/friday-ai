# ChromaDB Testing med Langfuse Integration

**Date:** November 9, 2025 22:00
**Purpose:** Brug Langfuse til at evaluere og monitore ChromaDB kvalitet

---

## 🎯 Hvad Kan Langfuse Gøre For ChromaDB

### 1. **Embedding Quality Tracking**

- Track embedding generation time
- Monitor API call success/failure rates
- Analyze embedding costs (OpenRouter)
- Identify slow embeddings

### 2. **Similarity Score Analysis**

- Log all duplicate detection attempts
- Track similarity thresholds
- Analyze false positives/negatives
- Optimize similarity threshold

### 3. **Search Performance**

- Monitor search latency
- Track result relevance
- Analyze query patterns
- Identify slow searches

### 4. **Cost Monitoring**

- Track OpenRouter API usage
- Calculate embedding costs per lead/email
- Forecast monthly costs
- Identify cost optimization opportunities

---

## 🔧 Implementation Plan

### Step 1: Add Langfuse Tracing to Embeddings

```typescript
// server/integrations/chromadb/embeddings.ts

import { getLangfuseClient } from "../langfuse/client";

export async function generateEmbedding(text: string): Promise<number[]> {
  const langfuse = getLangfuseClient();

  // Create trace
  const trace = langfuse?.trace({
    name: "chroma-embedding-generation",
    metadata: {
      textLength: text.length,
      source: "chromadb",
    },
  });

  // Create generation span
  const generation = trace?.generation({
    name: "openrouter-embedding",
    model: "openai/text-embedding-3-small",
    input: text.substring(0, 100), // First 100 chars
  });

  const startTime = Date.now();

  try {
    // ... existing embedding generation ...

    const embedding = data.data[0].embedding;
    const duration = Date.now() - startTime;

    // Log success
    generation?.end({
      output: { dimensions: embedding.length },
      usage: {
        promptTokens: Math.ceil(text.length / 4), // Estimate
        completionTokens: 0,
        totalTokens: Math.ceil(text.length / 4),
      },
      metadata: {
        duration,
        cached: embeddingCache.has(cacheKey),
        dimensions: embedding.length,
      },
    });

    return embedding;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    generation?.end({
      metadata: {
        duration,
        error: error instanceof Error ? error.message : String(error),
        level: "ERROR",
      },
    });

    throw error;
  } finally {
    await langfuse?.flushAsync();
  }
}

```text

### Step 2: Add Langfuse Tracing to Lead Deduplication

```typescript
// server/db.ts - in createLead()

export async function createLead(data: InsertLead): Promise<Lead> {
  const langfuse = getLangfuseClient();

  // Create trace for lead creation
  const trace = langfuse?.trace({
    name: "lead-creation-with-deduplication",
    metadata: {
      leadName: data.name,
      leadCompany: data.company,
      source: data.source || "unknown",
    },
  });

  if (ENV.chromaEnabled) {
    const span = trace?.span({
      name: "duplicate-detection",
    });

    try {
      const similar = await searchSimilar("friday_leads", leadText, 3);

      if (similar && similar.distances.length > 0) {
        const similarity = 1 - similar.distances[0] / 2;

        // Log duplicate detection result
        span?.end({
          output: {
            duplicateFound: similarity > 0.85,
            similarity,
            existingLeadId: similar.metadatas[0]?.leadId,
          },
          metadata: {
            threshold: 0.85,
            topMatches: similar.distances.slice(0, 3).map((d, i) => ({
              similarity: 1 - d / 2,
              leadId: similar.metadatas[i]?.leadId,
            })),
          },
        });

        if (similarity > 0.85) {
          // Duplicate found - log and return existing
          trace?.update({
            metadata: {
              ...trace.metadata,
              duplicateDetected: true,
              returnedExistingLead: true,
            },
          });

          // ... return existing lead ...
        }
      }
    } catch (error) {
      span?.end({
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          level: "ERROR",
        },
      });
    }
  }

  // ... rest of lead creation ...

  await langfuse?.flushAsync();
  return newLead;
}

```text

### Step 3: Add Langfuse Tracing to Email Context

```typescript
// server/db.ts - in getRelatedEmailThreads()

export async function getRelatedEmailThreads(
  emailThread: EmailThread,
  limit: number = 5
): Promise<EmailThread[]> {
  const langfuse = getLangfuseClient();

  const trace = langfuse?.trace({
    name: "email-context-retrieval",
    metadata: {
      emailId: emailThread.id,
      subject: emailThread.subject,
      requestedLimit: limit,
    },
  });

  try {
    const similar = await searchSimilar("friday_emails", emailText, limit + 1);

    // Log search results
    trace?.update({
      output: {
        foundCount: similar?.ids.length || 0,
        topSimilarities: similar?.distances.slice(0, 3).map(d => 1 - d / 2),
      },
      metadata: {
        searchPerformed: true,
        resultsReturned: relatedIds.length,
      },
    });

    return relatedEmails;
  } catch (error) {
    trace?.update({
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        level: "ERROR",
      },
    });

    return [];
  } finally {
    await langfuse?.flushAsync();
  }
}

```text

---

## 📊 Langfuse Dashboard Analysis

### Metrics to Track

**1. Embedding Performance**

```text
Metric: embedding-generation-time

- Average: <600ms
- P95: <1000ms
- P99: <2000ms
- Failures: <1%

```text

**2. Lead Deduplication**

```text
Metric: duplicate-detection-rate

- Duplicates found: X%
- False positives: <5%
- False negatives: <2%
- Average similarity: 0.XX

```text

**3. Email Context Quality**

```text
Metric: related-email-relevance

- Results returned: X per query
- Average top similarity: >0.7
- Zero results: <10%

```text

**4. Cost Tracking**

```text
Metric: embedding-cost

- Cost per embedding: $0.00002
- Daily cost: $X
- Monthly forecast: $Y

```text

---

## 🧪 Test Scenarios

### Scenario 1: Duplicate Lead Detection

**Setup:**

```typescript
// Create lead 1
const lead1 = await createLead({
  name: "John Doe",
  email: "<john@acme.com>",
  company: "ACME Corp",
});

// Try to create duplicate
const lead2 = await createLead({
  name: "John Doe",
  email: "<j<.doe@acme.co>m>", // Different email
  company: "ACME Corporation", // Different format
});

```text

**Expected Langfuse Traces:**

```text
Trace: lead-creation-with-deduplication (lead1)
  ├─ Span: duplicate-detection
  │   └─ Output: { duplicateFound: false }
  └─ Span: chromadb-indexing
      └─ Output: { indexed: true, leadId: 1 }

Trace: lead-creation-with-deduplication (lead2)
  ├─ Span: duplicate-detection
  │   └─ Output: {
  │        duplicateFound: true,
  │        similarity: 0.93,
  │        existingLeadId: 1
  │      }
  └─ Metadata: { duplicateDetected: true, returnedExistingLead: true }

```text

**Verification:**

- Check lead2.id === lead1.id
- Verify similarity score in Langfuse
- Check no new embedding was generated

### Scenario 2: Email Context Retrieval

**Setup:**

```typescript
// Index 3 related emails
await createEmailThread({ subject: "Product inquiry", from: "<john@acme.com>" });
await createEmailThread({
  subject: "Follow-up on pricing",
  from: "<john@acme.com>",
});
await createEmailThread({ subject: "Different topic", from: "<jane@xyz.com>" });

// Get related emails
const related = await getRelatedEmailThreads(currentEmail, 2);

```text

**Expected Langfuse Traces:**

```text
Trace: email-context-retrieval
  ├─ Input: { emailId: X, subject: "Ready to proceed" }
  └─ Output: {
       foundCount: 3,
       topSimilarities: [0.95, 0.87, 0.32],
       resultsReturned: 2
     }

```text

**Verification:**

- Check top 2 are from <john@acme.com>
- Verify <jane@xyz.com> email excluded
- Check similarity scores make sense

---

## 📈 Quality Metrics

### Embedding Quality

```typescript
// Track in Langfuse
interface EmbeddingMetrics {
  generationTime: number; // ms
  dimensions: number; // 1536
  cached: boolean;
  apiSuccess: boolean;
  cost: number; // USD
}

// Alerts
if (generationTime > 2000) {
  alert("Slow embedding generation");
}

if (!apiSuccess) {
  alert("Embedding API failure");
}

```text

### Duplicate Detection Quality

```typescript
// Manual review sample
const sampleLeads = [
  { name: "John Doe", company: "ACME" },
  { name: "J. Doe", company: "ACME Corp" }, // Should match
  { name: "Jane Smith", company: "XYZ" }, // Should not match
];

// Track in Langfuse
for (const lead of sampleLeads) {
  const similarity = await checkSimilarity(lead, existingLeads);
  trace({
    name: "duplicate-test",
    input: lead,
    output: { similarity },
    metadata: {
      expected: lead.shouldMatch ? "duplicate" : "unique",
      actual: similarity > 0.85 ? "duplicate" : "unique",
      correct:
        (lead.shouldMatch && similarity > 0.85) ||
        (!lead.shouldMatch && similarity <= 0.85),
    },
  });
}

```text

---

## 🔍 Debugging with Langfuse

### Find False Positives

```text
Langfuse Query:

- Filter: metadata.duplicateDetected = true
- Filter: metadata.manualReview = "not duplicate"
- Sort: similarity DESC

Action: Review high-similarity non-duplicates
Adjust: Increase threshold if needed

```text

### Find False Negatives

```text
Langfuse Query:

- Filter: metadata.duplicateDetected = false
- Filter: metadata.manualReview = "is duplicate"
- Sort: similarity DESC

Action: Review missed duplicates
Adjust: Decrease threshold or improve embeddings

```text

### Optimize Threshold

```typescript
// Run A/B test in Langfuse
const thresholds = [0.8, 0.85, 0.9, 0.95];

for (const threshold of thresholds) {
  const results = await testDuplicateDetection({
    threshold,
    testSet: knownDuplicates,
  });

  langfuse.trace({
    name: "threshold-optimization",
    metadata: {
      threshold,
      precision: results.precision,
      recall: results.recall,
      f1Score: results.f1,
    },
  });
}

```

---

## 🎯 Success Criteria

### Embeddings

- [x] 95%+ API success rate
- [x] <1s average generation time
- [x] Cache hit rate >30%
- [x] Cost <$50/month

### Duplicate Detection

- [ ] 90%+ duplicate detection rate
- [ ] <5% false positive rate
- [ ] <10% false negative rate
- [ ] Logged in Langfuse for review

### Email Context

- [ ] 80%+ relevant results
- [ ] <10% zero results
- [ ] Average top similarity >0.7
- [ ] Logged for quality review

---

## 📚 Implementation Checklist

**Phase 1: Add Tracing**

- [ ] Add Langfuse to embeddings.ts
- [ ] Add Langfuse to createLead()
- [ ] Add Langfuse to getRelatedEmailThreads()
- [ ] Test tracing works

**Phase 2: Dashboard Setup**

- [ ] Create Langfuse dashboards
- [ ] Set up metrics
- [ ] Configure alerts
- [ ] Document queries

**Phase 3: Quality Testing**

- [ ] Run duplicate detection tests
- [ ] Run email context tests
- [ ] Review Langfuse traces
- [ ] Optimize thresholds

**Phase 4: Production Monitoring**

- [ ] Enable in production
- [ ] Monitor for 1 week
- [ ] Review metrics
- [ ] Adjust based on data

---

## 💡 Next Steps

1. **Start Friday AI server** med ChromaDB enabled
1. **Run full integration test**
1. **Add Langfuse tracing** til embedding functions
1. **Create test data** (leads + emails)
1. **Monitor in Langfuse dashboard**
1. **Optimize based on metrics**

---

**Status:** 📋 Plan Ready
**Implementation Time:** 2-3 hours
**Value:** High - Quality assurance + optimization data
