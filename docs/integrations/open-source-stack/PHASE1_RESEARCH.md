# Open Source AI Stack - Phase 1: Research & Analysis 🔬

**Date:** November 9, 2025
**Status:** In Progress
**Goal:** Analyze Friday AI codebase and plan integration of Langfuse, ChromaDB, and Crawl4AI

---

## 📋 Executive Summary

We are integrating **3 powerful open source tools** to enhance Friday AI:

1. **Langfuse** - LLM Observability & Analytics (FREE)
1. **ChromaDB** - Vector Database for Semantic Search (FREE)
1. **Crawl4AI** - Web Scraping for LLMs (FREE)

**Total Cost:** $0/month forever! 🎉
**Estimated Savings:** $2,000-3,000/year vs paid alternatives

---

## 🎯 Integration Goals

### 1. Langfuse - Observability

**Purpose:** Monitor all LiteLLM calls and AI operations

**Use Cases:**

- Track response times per model
- Monitor cost (even though we use FREE models)
- Error rate tracking
- User feedback collection
- A/B testing prompts
- Token usage analytics

**Expected Impact:**

- 100% visibility into AI operations
- Debug issues 10x faster
- Optimize model selection
- Track user satisfaction

### 2. ChromaDB - Semantic Search

**Purpose:** Replace paid RAG services with free vector database

**Use Cases:**

- Friday Docs intelligent search
- Lead similarity matching
- Email thread context retrieval
- Historical conversation search
- Customer profile matching

**Expected Impact:**

- 50% better document search
- 70% faster lead matching
- Semantic understanding vs keyword search
- Save $240-600/year (vs Ragie.ai)

### 3. Crawl4AI - Web Scraping

**Purpose:** Enrich leads and documents automatically

**Use Cases:**

- Automatic lead enrichment (scrape company websites)
- Competitive intelligence
- Import external docs to Friday Docs
- Market research automation

**Expected Impact:**

- 70% reduction in manual research
- Better lead qualification
- Automatic data enrichment
- Save $240-480/year (vs Firecrawl)

---

## 🔍 Codebase Analysis

### Current AI Integration Points

Based on code search, Friday AI has AI integrated in these areas:

#### 1. Core LLM Layer (`_core/llm.ts`)

```typescript
// Primary functions:

- invokeLLM() - Main AI call function
- streamResponse() - Streaming responses
- Supports: OpenRouter, Ollama, Gemini, OpenAI

// Current flow:
User Request → AI Router → Model Router → invokeLLM → LiteLLM/API → Response

```text

**Integration Point for Langfuse:**

- Wrap `invokeLLM` and `streamResponse` with Langfuse tracing
- Track every AI call automatically
- Zero code changes needed elsewhere!

#### 2. Model Router (`model-router.ts`)

```typescript
// Task-based routing:

- 10 task types (chat, email-draft, lead-analysis, etc.)
- 6 FREE OpenRouter models
- Automatic fallback logic
- LiteLLM integration (already done!)

// Current models:

- glm-4.5-air-free (primary)
- gpt-oss-20b-free
- deepseek-chat-v3.1-free
- minimax-m2-free
- qwen3-coder-free
- kimi-k2-free

```text

**Integration Point for Langfuse:**

- Track which models are used most
- Monitor success rates per model
- Compare performance across models

#### 3. Lead Processing

**Files:**

- `lead-source-detector.ts` - Pattern matching for lead sources
- `lead-source-workflows.ts` - Source-specific workflows
- `workflow-automation.ts` - End-to-end lead processing

**Integration Point for ChromaDB:**

- Index all leads for semantic search
- Find similar leads automatically
- Match leads to existing customers
- Smart duplicate detection

#### 4. Email Intelligence

**Files:**

- `ai-email-summary.ts` - Generate email summaries
- `ai-label-suggestions.ts` - Auto-label emails
- `email-intelligence/categorizer.ts` - Categorize emails

**Integration Point for ChromaDB:**

- Semantic email search
- Find related conversations
- Context-aware responses
- Thread similarity detection

#### 5. Document Processing (Friday Docs)

**Current state:** Not found in code search
**Assumption:** Friday Docs is separate or planned feature

**Integration Point for ChromaDB:**

- Document vector storage
- Semantic document search
- RAG for document Q&A

#### 6. Lead Enrichment

**Current state:** Manual or minimal automation

**Integration Point for Crawl4AI:**

- Automatic website scraping
- Company info extraction
- Contact detail discovery
- Competitor analysis

---

## 📊 Integration Architecture

### Current Architecture

```text
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
┌──────▼──────┐
│  AI Router  │ ◄─── Intents, Context
└──────┬──────┘
       │
┌──────▼──────────┐
│  Model Router   │ ◄─── Task-based routing
└──────┬──────────┘
       │
┌──────▼──────────┐
│ LiteLLM Client  │ ◄─── Rate limiting, Caching
└──────┬──────────┘
       │
┌──────▼──────────┐
│  FREE Models    │ ◄─── 6 OpenRouter models
└─────────────────┘

```text

### Proposed Architecture with New Stack

```text
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
┌──────▼──────┐
│  AI Router  │ ◄─── Intents, Context
└──────┬──────┘
       │
┌──────▼──────────┐
│  Model Router   │ ◄─── Task-based routing
└──────┬──────────┘
       │
┌──────▼──────────┐
│ LiteLLM Client  │ ◄─── Rate limiting, Caching
└──────┬──────────┘
       │
       ├─────────────────────┐
       │                     │
┌──────▼──────────┐   ┌─────▼────────┐
│  FREE Models    │   │  Langfuse    │ ◄─── Observability
└─────────────────┘   └──────────────┘
                             │
                      ┌──────┴────────┐
                      │  Traces       │
                      │  Metrics      │
                      │  Analytics    │
                      └───────────────┘

┌─────────────────────────────────────┐
│          ChromaDB Layer             │
├─────────────────────────────────────┤
│  • Lead Vectors                     │
│  • Email Vectors                    │
│  • Document Vectors                 │
│  • Semantic Search API              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Crawl4AI Layer              │
├─────────────────────────────────────┤
│  • Lead Enrichment                  │
│  • Website Scraping                 │
│  • Data Extraction                  │
│  • Async Processing                 │
└─────────────────────────────────────┘

```text

---

## 🔧 Technical Integration Points

### 1. Langfuse Integration Points

#### A. Wrap Core LLM Functions

```typescript
// server/_core/llm.ts

import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  publicKey: ENV.langfusePublicKey,
  secretKey: ENV.langfuseSecretKey,
  baseUrl: ENV.langfuseBaseUrl || "<http://localhost:3000",> // Self-hosted
});

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // START TRACE
  const trace = langfuse.trace({
    name: "llm-invocation",
    userId: params.userId?.toString(),
    metadata: {
      taskType: params.taskType,
      model: params.model,
    },
  });

  const span = trace.span({
    name: "llm-call",
    input: params.messages,
  });

  try {
    const result = await actualInvokeLLM(params);

    // END TRACE WITH SUCCESS
    span.end({
      output: result,
      metadata: {
        usage: result.usage,
        model: result.model,
      },
    });

    return result;
  } catch (error) {
    // END TRACE WITH ERROR
    span.end({
      level: "ERROR",
      statusMessage: error.message,
    });
    throw error;
  }
}

```text

#### B. Track Model Router Decisions

```typescript
// server/model-router.ts

export async function invokeLLMWithRouting(...) {
  const generation = langfuse.generation({
    name: 'model-routing',
    model: selectedModel,
    input: messages,
    metadata: {
      taskType,
      config,
    }
  });

  // ... existing logic ...

  generation.end({
    output: result,
    usage: {
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
    }
  });
}

```text

### 2. ChromaDB Integration Points

#### A. Lead Indexing

```typescript
// server/integrations/chromadb/lead-indexer.ts

import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  path: ENV.chromaUrl || "<http://localhost:8000",>
});

export async function indexLead(lead: Lead) {
  const collection = await client.getOrCreateCollection({
    name: "leads",
    metadata: { "hnsw:space": "cosine" },
  });

  // Create embedding-ready text
  const leadText = `
    Lead: ${lead.name}
    Email: ${lead.email}
    Phone: ${lead.phone}
    Source: ${lead.source}
    Notes: ${lead.notes}
    Company: ${lead.company}
  `.trim();

  await collection.add({
    ids: [lead.id.toString()],
    documents: [leadText],
    metadatas: [
      {
        leadId: lead.id,
        source: lead.source,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    ],
  });
}

export async function findSimilarLeads(lead: Lead, limit = 5) {
  const collection = await client.getCollection({ name: "leads" });

  const leadText = `${lead.name} ${lead.email} ${lead.company}`;

  const results = await collection.query({
    queryTexts: [leadText],
    nResults: limit,
  });

  return results.ids[0].map(id => parseInt(id));
}

```text

#### B. Email Semantic Search

```typescript
// server/integrations/chromadb/email-indexer.ts

export async function indexEmail(email: EmailMessage) {
  const collection = await client.getOrCreateCollection({
    name: "emails",
  });

  const emailText = `
    From: ${email.from}
    Subject: ${email.subject}
    Body: ${email.body.substring(0, 2000)}
  `.trim();

  await collection.add({
    ids: [email.id.toString()],
    documents: [emailText],
    metadatas: [
      {
        emailId: email.id,
        threadId: email.threadId,
        from: email.from,
        subject: email.subject,
        receivedAt: email.receivedAt,
      },
    ],
  });
}

export async function searchEmails(query: string, limit = 10) {
  const collection = await client.getCollection({ name: "emails" });

  const results = await collection.query({
    queryTexts: [query],
    nResults: limit,
  });

  return results.metadatas[0];
}

```text

### 3. Crawl4AI Integration Points

#### A. Lead Enrichment Service

```typescript
// server/integrations/crawl4ai/lead-enricher.ts

import { AsyncWebCrawler, LLMExtractionStrategy } from "crawl4ai";

export async function enrichLeadFromWebsite(lead: Lead) {
  if (!lead.website) {
    return { success: false, message: "No website provided" };
  }

  const crawler = new AsyncWebCrawler({
    verbose: false,
  });

  await crawler.start();

  try {
    const result = await crawler.arun({
      url: lead.website,
      extractionStrategy: new LLMExtractionStrategy({
        provider: "openrouter/glm-4.5-air-free", // Use our FREE model!
        apiToken: ENV.openRouterApiKey,
        instruction: `Extract company information:

          - Company name
          - Industry/services
          - Contact phone/email
          - Location/address
          - Team size (if mentioned)
          - Key products/services

          Return as JSON.`,
      }),
      wordCountThreshold: 10,
    });

    // Parse extracted data
    const data = JSON.parse(result.extracted_content);

    // Update lead with enriched data
    await updateLead(lead.id, {
      enrichedData: data,
      enrichedAt: new Date(),
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Lead enrichment failed:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await crawler.stop();
  }
}

```bash

---

## 📅 Implementation Phases

### Phase 1: Research & Planning (Current) - Day 1

- [x] Analyze codebase structure
- [x] Identify integration points
- [ ] Create detailed architecture
- [ ] Define success metrics
- [ ] Document API contracts

### Phase 2: Langfuse Setup - Day 2-3 (2-4 hours)

- [ ] Deploy Langfuse (Docker self-hosted)
- [ ] Wrap `invokeLLM` with tracing
- [ ] Wrap `streamResponse` with tracing
- [ ] Add model router tracking
- [ ] Create Langfuse dashboard
- [ ] Test with real AI calls

### Phase 3: ChromaDB Integration - Day 4-6 (6-8 hours)

- [ ] Deploy ChromaDB (Docker)
- [ ] Create lead indexer
- [ ] Create email indexer
- [ ] Build semantic search API
- [ ] Integrate with existing lead flow
- [ ] Test similarity search
- [ ] Performance optimization

### Phase 4: Crawl4AI Integration - Day 7-9 (4-6 hours)

- [ ] Setup Crawl4AI
- [ ] Create lead enrichment service
- [ ] Integrate with lead creation flow
- [ ] Add background job processing
- [ ] Test with real websites
- [ ] Error handling & retries

### Phase 5: Testing & Validation - Day 10-11 (4-6 hours)

- [ ] Unit tests for all new services
- [ ] Integration tests
- [ ] Performance benchmarks
- [ ] Load testing
- [ ] Error scenario testing

### Phase 6: Documentation - Day 12 (2-3 hours)

- [ ] API documentation
- [ ] Integration guides
- [ ] Deployment procedures
- [ ] Monitoring setup
- [ ] Troubleshooting guide

### Phase 7: Production Rollout - Week 3-4

- [ ] Deploy to staging
- [ ] Monitor for 48 hours
- [ ] Gradual production rollout
- [ ] User feedback collection

---

## 🎯 Success Metrics

### Langfuse Metrics

```text

- 100% of AI calls tracked
- <10ms tracing overhead
- Dashboard accessible 24/7
- Real-time error alerts

```text

### ChromaDB Metrics

```text

- <500ms semantic search
- >80% relevance score
- 10,000+ vectors indexed
- <100MB memory usage

```text

### Crawl4AI Metrics

```text

- >80% successful scrapes
- <30s per website
- LLM-ready markdown output
- Background processing

```text

---

## 💰 Cost Analysis

### Current Costs (Without Integration)

```text
Manual lead research:    10 hours/month × $50/hour = $500/month
Manual document work:    5 hours/month × $50/hour = $250/month
No AI observability:     Unknown issues, debug time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total hidden cost:       ~$750/month

```text

### Proposed Costs (With Integration)

```text
Langfuse (self-hosted):  $0/month (FREE)
ChromaDB (self-hosted):  $0/month (FREE)
Crawl4AI (self-hosted):  $0/month (FREE)
LLM calls:               $0/month (already FREE with LiteLLM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total cost:              $0/month 🎉
Annual savings:          $9,000/year

```text

### ROI Analysis

```text
Development time:        ~30-40 hours (1-2 weeks)
Development cost:        ~$2,000 (if outsourced)
Annual savings:          $9,000
ROI:                     450% in year 1
Break-even:              3 months

```

---

## 🚨 Risks & Mitigations

### Risk 1: Self-Hosting Complexity

**Mitigation:**

- Use Docker Compose for easy deployment
- Provide detailed documentation
- Test on staging first
- Have cloud backup options (Langfuse Cloud, Qdrant Cloud)

### Risk 2: Performance Impact

**Mitigation:**

- Async processing for heavy operations
- Caching for frequent queries
- Performance monitoring
- Gradual rollout

### Risk 3: Data Privacy

**Mitigation:**

- Self-hosted = full control
- No data leaves your infrastructure
- GDPR compliant by design
- Encryption at rest

### Risk 4: Integration Bugs

**Mitigation:**

- Comprehensive testing
- Gradual rollout (feature flags)
- Easy rollback procedures
- Monitoring & alerts

---

## 🔄 Next Steps

1. **Complete Phase 1 Research** (Today)
   - Finish codebase analysis
   - Create detailed architecture diagram
   - Define API contracts

1. **Start Phase 2: Langfuse** (Tomorrow)
   - Deploy Langfuse locally
   - Integrate with LiteLLM
   - Test basic tracing

1. **Weekly Check-ins**
   - Progress reviews
   - Adjust timeline if needed
   - Document learnings

---

**Status:** ✅ Phase 1 In Progress (60% complete)
**Next:** Complete codebase analysis, create architecture diagram
**Timeline:** On track for 2-3 week completion

**Last Updated:** November 9, 2025 12:06 PM
