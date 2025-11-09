# Open Source Stack - Implementation Roadmap 🗺️

**Project:** Langfuse + ChromaDB + Crawl4AI Integration  
**Timeline:** 2-3 Weeks  
**Status:** Planning Complete, Ready to Start  

---

## 📅 Week-by-Week Breakdown

### Week 1: Foundation & Observability (Days 1-5)

#### Day 1: Deep Dive & Setup ✅ (DONE TODAY!)
- [x] Complete codebase analysis
- [x] Document all AI integration points
- [x] Create architecture diagrams
- [x] Define success metrics
- [ ] Setup development environment

**Deliverables:**
- PHASE1_RESEARCH.md (Complete)
- IMPLEMENTATION_ROADMAP.md (This document)

---

#### Day 2: Langfuse Deployment (4 hours)

**Morning (2h): Docker Setup**
```bash
# 1. Create Docker Compose for Langfuse
mkdir -p server/integrations/langfuse/docker
cd server/integrations/langfuse/docker

# 2. Create docker-compose.langfuse.yml
# (Full config below)

# 3. Start services
docker compose -f docker-compose.langfuse.yml up -d

# 4. Verify
curl http://localhost:3000/api/public/health
```

**Afternoon (2h): TypeScript Client**
- Install Langfuse SDK
- Create wrapper service
- Add environment variables
- Test basic trace

**Success Criteria:**
- ✅ Langfuse running on localhost:3000
- ✅ Can create traces via TypeScript
- ✅ Dashboard accessible

---

#### Day 3: Langfuse Integration (4 hours)

**Morning (2h): Core LLM Tracing**
- Wrap `invokeLLM` function
- Wrap `streamResponse` function
- Add automatic trace creation
- Test with real AI calls

**Afternoon (2h): Model Router Tracking**
- Track model selection decisions
- Log task types and configurations
- Add usage metrics
- Create dashboard views

**Success Criteria:**
- ✅ All AI calls automatically traced
- ✅ <10ms overhead per call
- ✅ Dashboard shows real data

---

#### Day 4: Langfuse Advanced Features (3 hours)

**Implementation:**
- User feedback collection
- Error tracking
- Cost analysis (even for FREE models!)
- A/B testing setup
- Custom dashboards

**Success Criteria:**
- ✅ Complete observability stack
- ✅ Real-time error alerts
- ✅ Performance metrics visible

---

#### Day 5: Testing & Documentation (2 hours)

**Tasks:**
- Unit tests for Langfuse wrapper
- Integration tests
- Performance benchmarks
- Documentation

**Deliverables:**
- `server/integrations/langfuse/README.md`
- Test suite (10+ tests)
- Performance report

---

### Week 2: Semantic Search & Vector Database (Days 6-10)

#### Day 6: ChromaDB Deployment (4 hours)

**Morning (2h): Docker Setup**
```bash
# 1. Create Docker setup
mkdir -p server/integrations/chromadb/docker

# 2. Deploy ChromaDB
docker compose -f docker-compose.chromadb.yml up -d

# 3. Verify
curl http://localhost:8000/api/v1/heartbeat
```

**Afternoon (2h): TypeScript Client**
- Install chromadb SDK
- Create collection manager
- Test basic operations
- Performance benchmarks

**Success Criteria:**
- ✅ ChromaDB running on localhost:8000
- ✅ Can create/query collections
- ✅ <500ms query time

---

#### Day 7: Lead Indexing System (5 hours)

**Morning (3h): Lead Indexer**
```typescript
// server/integrations/chromadb/indexers/lead-indexer.ts
- Index all existing leads
- Auto-index new leads
- Update on lead changes
- Metadata extraction
```

**Afternoon (2h): Semantic Lead Search**
```typescript
// API endpoints:
- POST /api/leads/semantic-search
- GET /api/leads/similar/:id
- POST /api/leads/duplicates/check
```

**Success Criteria:**
- ✅ 1000+ leads indexed
- ✅ <500ms search time
- ✅ >80% relevance score

---

#### Day 8: Email & Document Indexing (5 hours)

**Morning (3h): Email Indexer**
```typescript
// server/integrations/chromadb/indexers/email-indexer.ts
- Index email threads
- Subject + body vectorization
- Semantic email search
- Related thread discovery
```

**Afternoon (2h): Document Indexer (Friday Docs)**
```typescript
// server/integrations/chromadb/indexers/document-indexer.ts
- Index Friday Docs
- RAG preparation
- Semantic doc search
```

**Success Criteria:**
- ✅ Emails searchable semantically
- ✅ Documents indexed
- ✅ Fast retrieval (<300ms)

---

#### Day 9: Integration & APIs (4 hours)

**Tasks:**
- Integrate with existing lead flow
- Add to inbox router
- Create search endpoints
- Frontend integration points

**New APIs:**
```typescript
// tRPC procedures:
leads.semanticSearch(query, limit)
leads.findSimilar(leadId, limit)
leads.checkDuplicates(lead)
emails.semanticSearch(query, limit)
emails.findRelated(emailId, limit)
docs.semanticSearch(query, limit)
```

**Success Criteria:**
- ✅ All APIs functional
- ✅ Frontend can call endpoints
- ✅ Real-time search works

---

#### Day 10: ChromaDB Testing & Optimization (3 hours)

**Tasks:**
- Unit tests (15+ tests)
- Load testing (10k vectors)
- Performance tuning
- Documentation

**Deliverables:**
- Test suite
- Performance report
- API documentation

---

### Week 3: Lead Enrichment & Production (Days 11-15)

#### Day 11: Crawl4AI Setup (3 hours)

**Morning (2h): Installation & Config**
```bash
# Python environment for Crawl4AI
python -m venv venv
source venv/bin/activate
pip install crawl4ai

# Node.js wrapper
mkdir -p server/integrations/crawl4ai
```

**Afternoon (1h): Basic Testing**
- Test website scraping
- Verify LLM integration
- Performance benchmarks

**Success Criteria:**
- ✅ Can scrape websites
- ✅ LLM extraction working
- ✅ <30s per site

---

#### Day 12: Lead Enrichment Service (5 hours)

**Morning (3h): Enrichment Engine**
```typescript
// server/integrations/crawl4ai/lead-enricher.ts
- Scrape company websites
- Extract structured data
- Store enrichment results
- Error handling
```

**Afternoon (2h): Background Jobs**
```typescript
// Async processing:
- Job queue setup
- Retry logic
- Rate limiting
- Progress tracking
```

**Success Criteria:**
- ✅ Automatic enrichment works
- ✅ Background processing
- ✅ >80% success rate

---

#### Day 13: Workflow Integration (4 hours)

**Tasks:**
- Integrate with lead creation flow
- Auto-trigger on new leads
- Manual trigger option
- Results display in UI

**Integration Points:**
```typescript
// Hooks:
- onCreate: Auto-enrich if website exists
- onUpdate: Re-enrich if website changes
- Manual: Button in UI to trigger
```

**Success Criteria:**
- ✅ Seamless integration
- ✅ User-friendly
- ✅ Clear error messages

---

#### Day 14: Comprehensive Testing (5 hours)

**All Three Systems:**
- Unit tests (50+ total)
- Integration tests (20+)
- E2E tests (10+)
- Load testing
- Error scenarios

**Test Coverage:**
- Langfuse: All trace types
- ChromaDB: All indexers & queries
- Crawl4AI: Various websites

**Success Criteria:**
- ✅ >90% test coverage
- ✅ All tests passing
- ✅ Performance validated

---

#### Day 15: Documentation & Deployment Prep (4 hours)

**Documentation:**
- Complete API docs
- Deployment guides
- Troubleshooting
- Monitoring setup

**Files to Create:**
```
docs/integrations/open-source-stack/
├── LANGFUSE_GUIDE.md
├── CHROMADB_GUIDE.md
├── CRAWL4AI_GUIDE.md
├── DEPLOYMENT.md
├── MONITORING.md
└── TROUBLESHOOTING.md
```

**Success Criteria:**
- ✅ All docs complete
- ✅ Ready for staging
- ✅ Rollback plan ready

---

## 🚀 Week 4: Staging & Production Rollout

### Day 16-17: Staging Deployment (2 days)
- Deploy to staging
- Monitor for 48 hours
- Performance validation
- User acceptance testing

### Day 18-20: Production Rollout (3 days)
- Gradual rollout (25% → 50% → 100%)
- Daily monitoring
- User feedback collection
- Performance optimization

### Day 21: Post-Launch Review (1 day)
- Metrics analysis
- User feedback review
- Optimization plan
- Celebration! 🎉

---

## 📊 Detailed Task Breakdown

### Langfuse Implementation (Days 2-4)

#### Docker Setup
```yaml
# docker-compose.langfuse.yml
version: '3.8'

services:
  langfuse-db:
    image: postgres:15
    environment:
      POSTGRES_DB: langfuse
      POSTGRES_USER: langfuse
      POSTGRES_PASSWORD: langfuse
    volumes:
      - langfuse-db:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  langfuse:
    image: langfuse/langfuse:latest
    depends_on:
      - langfuse-db
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://langfuse:langfuse@langfuse-db:5432/langfuse
      NEXTAUTH_SECRET: langfuse-secret-change-in-production
      NEXTAUTH_URL: http://localhost:3000
      SALT: langfuse-salt-change-in-production

volumes:
  langfuse-db:
```

#### TypeScript Client
```typescript
// server/integrations/langfuse/client.ts
import { Langfuse } from 'langfuse';
import { ENV } from '../_core/env';

export const langfuseClient = new Langfuse({
  publicKey: ENV.langfusePublicKey,
  secretKey: ENV.langfuseSecretKey,
  baseUrl: ENV.langfuseBaseUrl || 'http://localhost:3000',
});

export async function createTrace(params: {
  name: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  return langfuseClient.trace({
    name: params.name,
    userId: params.userId,
    metadata: params.metadata,
  });
}

export async function createGeneration(traceId: string, params: {
  name: string;
  model: string;
  input: any;
  output?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}) {
  const trace = langfuseClient.getTrace(traceId);
  return trace.generation({
    name: params.name,
    model: params.model,
    input: params.input,
    output: params.output,
    usage: params.usage ? {
      promptTokens: params.usage.promptTokens,
      completionTokens: params.usage.completionTokens,
    } : undefined,
  });
}
```

#### LLM Wrapper
```typescript
// server/_core/llm.ts (modified)
import { langfuseClient } from '../integrations/langfuse';

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // Create trace
  const trace = langfuseClient.trace({
    name: 'llm-invocation',
    userId: params.userId?.toString(),
    metadata: {
      taskType: params.taskType,
      model: params.model,
    },
  });

  const generation = trace.generation({
    name: 'llm-call',
    model: params.model || 'glm-4.5-air-free',
    input: params.messages,
  });

  const startTime = Date.now();

  try {
    // Call actual LLM
    const result = await actualInvokeLLM(params);
    
    const responseTime = Date.now() - startTime;

    // End generation with success
    generation.end({
      output: result,
      usage: result.usage ? {
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
      } : undefined,
      metadata: {
        responseTime,
        model: result.model,
      },
    });

    // Flush to Langfuse
    await langfuseClient.flushAsync();

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // End generation with error
    generation.end({
      level: 'ERROR',
      statusMessage: error instanceof Error ? error.message : String(error),
      metadata: {
        responseTime,
        error: error,
      },
    });

    await langfuseClient.flushAsync();

    throw error;
  }
}
```

---

### ChromaDB Implementation (Days 6-10)

#### Docker Setup
```yaml
# docker-compose.chromadb.yml
version: '3.8'

services:
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chromadb-data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - PERSIST_DIRECTORY=/chroma/chroma
      - ANONYMIZED_TELEMETRY=FALSE

volumes:
  chromadb-data:
```

#### TypeScript Client
```typescript
// server/integrations/chromadb/client.ts
import { ChromaClient } from 'chromadb';
import { ENV } from '../_core/env';

export const chromaClient = new ChromaClient({
  path: ENV.chromaUrl || 'http://localhost:8000',
});

export async function getOrCreateCollection(name: string) {
  return await chromaClient.getOrCreateCollection({
    name,
    metadata: {
      'hnsw:space': 'cosine',
    },
  });
}
```

#### Lead Indexer
```typescript
// server/integrations/chromadb/indexers/lead-indexer.ts
import { chromaClient, getOrCreateCollection } from '../client';
import type { Lead } from '../../../drizzle/schema';

export async function indexLead(lead: Lead) {
  const collection = await getOrCreateCollection('leads');

  const leadText = `
    Lead ID: ${lead.id}
    Name: ${lead.name}
    Email: ${lead.email || 'N/A'}
    Phone: ${lead.phone || 'N/A'}
    Source: ${lead.source}
    Company: ${lead.company || 'N/A'}
    Notes: ${lead.notes || 'N/A'}
    Status: ${lead.status}
  `.trim();

  await collection.upsert({
    ids: [`lead-${lead.id}`],
    documents: [leadText],
    metadatas: [{
      leadId: lead.id,
      source: lead.source,
      status: lead.status,
      createdAt: lead.createdAt?.toISOString() || new Date().toISOString(),
      userId: lead.userId,
    }],
  });

  console.log(`✅ [ChromaDB] Indexed lead ${lead.id}`);
}

export async function findSimilarLeads(query: string, userId: number, limit = 5) {
  const collection = await getOrCreateCollection('leads');

  const results = await collection.query({
    queryTexts: [query],
    nResults: limit,
    where: { userId },
  });

  return results;
}

export async function checkLeadDuplicate(lead: { name: string; email?: string; phone?: string }, userId: number) {
  const queryText = `${lead.name} ${lead.email || ''} ${lead.phone || ''}`.trim();
  
  const results = await findSimilarLeads(queryText, userId, 3);
  
  // Check if any result is very similar (>0.9 similarity)
  // ChromaDB returns distances, lower = more similar
  const duplicates = results.ids[0]
    ?.filter((_, idx) => (results.distances?.[0]?.[idx] || 1) < 0.1) // Very similar
    .map(id => parseInt(id.replace('lead-', '')));

  return {
    isDuplicate: duplicates && duplicates.length > 0,
    duplicateIds: duplicates || [],
  };
}
```

---

### Crawl4AI Implementation (Days 11-13)

#### Installation
```bash
# Create Python virtual environment
cd server/integrations/crawl4ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Crawl4AI
pip install crawl4ai
pip install crawl4ai[llm]  # With LLM support

# Test installation
python -c "from crawl4ai import AsyncWebCrawler; print('✅ Crawl4AI installed')"
```

#### Node.js Wrapper
```typescript
// server/integrations/crawl4ai/enricher.ts
import { spawn } from 'child_process';
import { ENV } from '../_core/env';

export interface EnrichmentResult {
  success: boolean;
  data?: {
    companyName?: string;
    industry?: string;
    services?: string[];
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    teamSize?: string;
    description?: string;
  };
  error?: string;
}

export async function enrichLeadFromWebsite(website: string): Promise<EnrichmentResult> {
  return new Promise((resolve, reject) => {
    // Call Python script
    const pythonProcess = spawn('python', [
      'server/integrations/crawl4ai/scripts/scrape_website.py',
      website,
      ENV.openRouterApiKey || '',
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: errorOutput || 'Unknown error',
        });
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve({
          success: true,
          data: result,
        });
      } catch (error) {
        resolve({
          success: false,
          error: 'Failed to parse result',
        });
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'Timeout after 60 seconds',
      });
    }, 60000);
  });
}
```

#### Python Scraper Script
```python
# server/integrations/crawl4ai/scripts/scrape_website.py
import sys
import json
import asyncio
from crawl4ai import AsyncWebCrawler, LLMExtractionStrategy

async def scrape_website(url, api_key):
    crawler = AsyncWebCrawler()
    await crawler.start()
    
    try:
        result = await crawler.arun(
            url=url,
            extraction_strategy=LLMExtractionStrategy(
                provider=f"openrouter/glm-4.5-air-free",
                api_token=api_key,
                instruction="""
                Extract company information from this website:
                - Company name
                - Industry/services offered
                - Contact information (email, phone, address)
                - Team size (if mentioned)
                - Brief description
                
                Return as JSON with these exact keys:
                {
                  "companyName": string,
                  "industry": string,
                  "services": [string],
                  "contactInfo": {
                    "email": string,
                    "phone": string,
                    "address": string
                  },
                  "teamSize": string,
                  "description": string
                }
                """
            ),
            word_count_threshold=10,
        )
        
        data = json.loads(result.extracted_content)
        print(json.dumps(data))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
    
    finally:
        await crawler.stop()

if __name__ == "__main__":
    url = sys.argv[1]
    api_key = sys.argv[2]
    
    asyncio.run(scrape_website(url, api_key))
```

---

## 🎯 Success Metrics

### Langfuse Metrics
- ✅ 100% of AI calls traced
- ✅ <10ms overhead per call
- ✅ Dashboard accessible 24/7
- ✅ Real-time error alerts working
- ✅ User feedback collected

### ChromaDB Metrics
- ✅ <500ms semantic search
- ✅ >80% relevance score on searches
- ✅ 10,000+ vectors indexed
- ✅ <100MB memory usage
- ✅ 99.9% uptime

### Crawl4AI Metrics
- ✅ >80% successful scrapes
- ✅ <30s average per website
- ✅ LLM-ready markdown output
- ✅ Background processing working
- ✅ Error handling robust

---

## 💰 Cost Tracking

### Development Costs
```
Week 1: 13 hours × $50/hour = $650
Week 2: 21 hours × $50/hour = $1,050
Week 3: 21 hours × $50/hour = $1,050
Week 4: 15 hours × $50/hour = $750
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 70 hours = $3,500
```

### Operational Costs (Annual)
```
Langfuse (self-hosted): $0
ChromaDB (self-hosted): $0
Crawl4AI (self-hosted): $0
LLM API calls: $0 (using FREE models)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $0/year 🎉
```

### ROI Analysis
```
Annual savings: $9,000+
Development cost: $3,500
ROI: 257% in year 1
Break-even: 5 months
```

---

## 🚨 Risk Mitigation

### Technical Risks
1. **Performance degradation**
   - Mitigation: Async processing, caching, monitoring
   
2. **Integration bugs**
   - Mitigation: Comprehensive testing, gradual rollout
   
3. **Data privacy**
   - Mitigation: Self-hosted, no external data transfer

### Operational Risks
1. **Deployment complexity**
   - Mitigation: Docker Compose, detailed docs
   
2. **Maintenance burden**
   - Mitigation: Simple architecture, good monitoring

---

## 📝 Next Steps

1. **Review this roadmap** ✅
2. **Start Day 2: Langfuse deployment** (Tomorrow)
3. **Daily progress updates**
4. **Weekly check-ins**

---

**Status:** ✅ Roadmap Complete  
**Ready to Start:** Day 2 (Tomorrow)  
**Timeline:** On track for 3-week completion  

**Last Updated:** November 9, 2025 12:10 PM
