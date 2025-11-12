# 🎯 Day 6-8: ChromaDB Integration Plan

**Start Time:** November 9, 2025 14:51  
**Estimated Duration:** 1-2 hours  
**Status:** 🔄 In Progress

---

## 📋 Overview

Nu har vi ChromaDB kørende og TypeScript client klar. Nu skal vi:

1. **Opgradere embeddings** fra simple hash til rigtige embeddings
2. **Integrere i leads** for intelligent deduplication
3. **Integrere i emails** for context retrieval
4. **Teste** at alt virker sammen

---

## 🎯 Step 1: Embeddings API Integration

### Problem

Nuværende: Simple hash-based embeddings (ikke semantiske)  
Mål: Rigtige vector embeddings for semantic search

### Options

#### Option A: OpenAI Embeddings (Anbefalet)

```typescript
// Pros: Best quality, fast, reliable
// Cons: Koster penge ($0.00002 per 1K tokens)
// Model: text-embedding-3-small (1536 dimensions)

import OpenAI from "openai";

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: ENV.openaiApiKey });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
```

#### Option B: Voyage AI (Gratis Tier)

```typescript
// Pros: Free tier available, good quality
// Cons: Rate limits
// Model: voyage-2

import { VoyageAIClient } from "voyageai";

async function generateEmbedding(text: string): Promise<number[]> {
  const voyageai = new VoyageAIClient({ apiKey: ENV.voyageApiKey });
  const result = await voyageai.embed({
    input: [text],
    model: "voyage-2",
  });
  return result.data[0].embedding;
}
```

#### Option C: Local Model (100% Gratis)

```typescript
// Pros: Free, privacy, no API calls
// Cons: Slower, needs setup
// Model: all-MiniLM-L6-v2 (384 dimensions)

// Install: pip install sentence-transformers
// Run: Local Python service or use @xenova/transformers
```

**Valg:** Start med Option A (OpenAI) - bedste kvalitet og vi har API key

---

## 🎯 Step 2: Lead Deduplication Integration

### File: `server/db.ts`

### Current Flow

```typescript
export async function createLead(data) {
  // 1. Validate data
  // 2. Insert into database
  // 3. Return lead
}
```

### New Flow (Med ChromaDB)

```typescript
export async function createLead(data) {
  // 1. Validate data

  // 2. Check for duplicates in ChromaDB
  const leadText = formatLeadForEmbedding(data);
  const similar = await searchSimilar("friday_leads", leadText, 3);

  // 3. If very similar lead exists (distance < 0.15)
  if (similar && similar.distances[0] < 0.15) {
    const existingLeadId = similar.metadatas[0].leadId;
    // Return existing or merge
    return await getLeadById(existingLeadId);
  }

  // 4. Insert into database
  const lead = await db.insert(leads).values(data).returning();

  // 5. Add to ChromaDB for future duplicate detection
  await addDocuments("friday_leads", [
    {
      id: `lead-${lead.id}`,
      text: leadText,
      metadata: {
        leadId: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        createdAt: lead.createdAt.toISOString(),
      },
    },
  ]);

  // 6. Return lead
  return lead;
}
```

### Threshold Values

```typescript
// Distance thresholds (0.0 = identical, 1.0 = completely different)
const DUPLICATE_THRESHOLD = 0.15; // Almost identical
const SIMILAR_THRESHOLD = 0.3; // Very similar
const RELATED_THRESHOLD = 0.5; // Somewhat related
```

---

## 🎯 Step 3: Email Context Integration

### File: `server/email-router.ts` (eller hvor emails håndteres)

### Use Case

Når Friday AI skal svare på en email, hent relaterede emails som context.

### Implementation

```typescript
// When AI needs to respond to email:
async function generateEmailResponse(email: Email) {
  // 1. Format email for search
  const emailText = formatEmailForEmbedding({
    from: email.from,
    subject: email.subject,
    body: email.body,
  });

  // 2. Find related emails (same thread or similar topics)
  const relatedEmails = await searchSimilar(
    "friday_emails",
    emailText,
    5,
    { threadId: email.threadId } // Optional: filter by thread
  );

  // 3. Build context for AI
  const context = relatedEmails?.documents.join("\n\n---\n\n") || "";

  // 4. Generate AI response with context
  const aiResponse = await invokeLLM({
    messages: [
      { role: "system", content: `Previous context:\n${context}` },
      { role: "user", content: email.body },
    ],
  });

  return aiResponse;
}

// After processing email, add to ChromaDB
async function indexEmail(email: Email) {
  await addDocuments("friday_emails", [
    {
      id: `email-${email.id}`,
      text: formatEmailForEmbedding(email),
      metadata: {
        emailId: email.id,
        from: email.from,
        subject: email.subject,
        threadId: email.threadId,
        receivedAt: email.receivedAt.toISOString(),
      },
    },
  ]);
}
```

---

## 🎯 Step 4: Testing & Validation

### Test 1: Embeddings Quality

```typescript
// Test semantic similarity
const tests = [
  { text: "John Doe from ACME Corp", expected: "Similar to other ACME leads" },
  { text: "Jane Smith from ACME Corp", expected: "Similar to John Doe" },
  { text: "Bob Jones from XYZ Inc", expected: "Different from ACME leads" },
];

for (const test of tests) {
  const results = await searchSimilar("friday_leads", test.text, 3);
  console.log(`Query: ${test.text}`);
  console.log(`Results:`, results?.documents);
  console.log(`Distances:`, results?.distances);
}
```

### Test 2: Duplicate Detection

```typescript
// Create duplicate lead
const lead1 = await createLead({
  name: "John Doe",
  email: "john@acme.com",
  company: "ACME Corp",
  message: "Interested in product",
});

// Try creating similar lead (should detect duplicate)
const lead2 = await createLead({
  name: "John Doe",
  email: "john.doe@acme.com", // Slightly different
  company: "ACME Corporation", // Slightly different
  message: "Want product info", // Similar intent
});

console.log("Lead1 ID:", lead1.id);
console.log("Lead2 ID:", lead2.id);
console.log("Same?", lead1.id === lead2.id); // Should be true
```

### Test 3: Email Context

```typescript
// Index test emails
await indexEmail({
  id: 1,
  from: "client@acme.com",
  subject: "Re: Project",
  body: "Thanks for the proposal",
});
await indexEmail({
  id: 2,
  from: "client@acme.com",
  subject: "Re: Project",
  body: "When can we start?",
});
await indexEmail({
  id: 3,
  from: "other@xyz.com",
  subject: "Question",
  body: "How much does it cost?",
});

// Search for related emails
const related = await searchSimilar(
  "friday_emails",
  "Project status update",
  3
);

console.log("Related emails:", related?.documents);
// Should return emails 1 & 2 (project related), not 3
```

---

## 📁 Files To Modify

### 1. Embeddings Service (New File)

**File:** `server/integrations/chromadb/embeddings.ts`

```typescript
// Implement OpenAI embeddings
// Export: generateEmbedding(text: string): Promise<number[]>
```

### 2. Lead Creation

**File:** `server/db.ts`
**Function:** `createLead()`

```typescript
// Add: ChromaDB duplicate check before insert
// Add: ChromaDB indexing after insert
```

### 3. Email Processing

**File:** `server/email-router.ts` (or similar)

```typescript
// Add: ChromaDB context retrieval
// Add: ChromaDB indexing after processing
```

### 4. Client Update

**File:** `server/integrations/chromadb/client.ts`

```typescript
// Update: OpenRouterEmbeddings class to use real API
```

---

## ⏱️ Estimated Time

```
Step 1: Embeddings API          30 min
Step 2: Lead Integration        20 min
Step 3: Email Integration       20 min
Step 4: Testing                 20 min
─────────────────────────────────────
Total:                          90 min (~1.5 hours)
```

---

## ✅ Success Criteria

```
✅ OpenAI embeddings working
✅ Duplicate leads detected and merged
✅ Email context improves AI responses
✅ All tests passing
✅ Performance acceptable (<200ms per operation)
✅ Documentation updated
```

---

## 🚀 After Day 6-8

### Day 9-10: Crawl4AI

- Lead enrichment from web
- Company information scraping
- Competitive intelligence

### Week 3: Testing & Production

- End-to-end tests
- Performance optimization
- Production deployment
- Monitoring setup

---

## 💡 Tips

1. **Start Simple:** Test embeddings with console.log først
2. **Small Batches:** Test med få leads/emails først
3. **Monitor Performance:** Check response times
4. **Iterate:** Start med leads, derefter emails
5. **Document:** Opdater docs løbende

---

**Ready to start?** Lad os begynde med Step 1: Embeddings! 🚀

**Current Time:** 14:51  
**Next:** Implement OpenAI embeddings
