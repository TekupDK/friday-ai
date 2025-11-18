# Crawl4AI - Ready to Start Guide 🕷️

**Date:** November 9, 2025, 22:20
**Status:** Ready to Implement
**Estimated Time:** 7-8 hours (2 days)

---

## 🎯 Quick Overview

**What:** Web scraping service for lead enrichment
**Why:** Automatic company info, contact discovery, competitive intel
**How:** Python service (Docker) + TypeScript client
**When:** Day 9-10 (Weekend project)

---

## 📋 Pre-Flight Checklist

### ✅ Prerequisites Complete

- [x] ChromaDB working (for storing scraped data)
- [x] Langfuse ready (for monitoring scraping quality)
- [x] OpenRouter API (for AI content extraction)
- [x] Docker installed (for Crawl4AI service)
- [x] Plan documented (`PLAN_DAY9-10.md`)

### 🎯 What You'll Build

````bash
Day 9 (4-6 hours):
├── Crawl4AI Docker service
├── FastAPI endpoint
├── TypeScript client
└── Basic scraping tests

Day 10 (4-6 hours):
├── Company intelligence
├── Contact discovery
├── Lead enrichment automation
└── Testing & documentation

```bash

---

## 🚀 Implementation Steps

### Day 9: Setup & Basic Scraping

#### Step 1: Create Docker Service (1.5h)

```bash
# Create directory structure
mkdir -p server/integrations/crawl4ai/app
mkdir -p server/integrations/crawl4ai/docker

# Files to create
server/integrations/crawl4ai/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.crawl4ai.yml
│   └── requirements.txt
├── app/
│   ├── main.py          # FastAPI app
│   ├── scraper.py       # Crawl4AI wrapper
│   └── models.py        # Pydantic models
└── README.md

```text

#### Step 2: TypeScript Client (1h)

```typescript
// server/integrations/crawl4ai/client.ts
export async function scrapePage(url: string);
export async function enrichLead(leadId: number);
export async function findContacts(companyUrl: string);

```text

#### Step 3: Test Basic Scraping (30min)

```bash
# Test endpoints
curl -X POST <http://localhost:8080/scrape> \
  -d '{"url": "<https://example.com"}'>

```bash

### Day 10: Advanced Features

#### Step 4: Company Intelligence (2h)

- Scrape company websites
- Extract: description, industry, size, location
- Store in ChromaDB for context
- Track in Langfuse

#### Step 5: Contact Discovery (2h)

- Find email patterns
- Extract phone numbers
- Scrape contact pages
- LinkedIn integration (optional)

#### Step 6: Automated Enrichment (1.5h)

- Integrate with `createLead()`
- Background job queue
- Error handling
- Rate limiting

---

## 🔧 Docker Setup Template

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy app
COPY app/ ./app/

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

```bash

### docker-compose.crawl4ai.yml

```yaml
version: "3.8"

services:
  crawl4ai:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: friday-crawl4ai
    ports:

      - "8080:8080"

    environment:

      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}

    volumes:

      - ./app:/app/app

    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "<http://localhost:8080/health"]>
      interval: 30s
      timeout: 10s
      retries: 3

```text

### requirements.txt

```bash
fastapi==0.104.1
uvicorn[standard]==0.24.0
crawl4ai==0.2.0
playwright==1.40.0
pydantic==2.5.0
aiohttp==3.9.1
beautifulsoup4==4.12.2
python-multipart==0.0.6

```text

---

## 📝 FastAPI App Template

### app/main.py

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from .scraper import scrape_page, extract_company_info, find_contacts

app = FastAPI(title="Crawl4AI Service", version="1.0.0")

class ScrapeRequest(BaseModel):
    url: HttpUrl

class ScrapeResponse(BaseModel):
    url: str
    title: str
    content: str
    metadata: dict

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    try:
        result = await scrape_page(str(request.url))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/company-intel")
async def get_company_intel(request: ScrapeRequest):
    try:
        intel = await extract_company_info(str(request.url))
        return intel
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/find-contacts")
async def discover_contacts(request: ScrapeRequest):
    try:
        contacts = await find_contacts(str(request.url))
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

```text

---

## 🧪 Testing Strategy

### Manual Tests

```bash
# 1. Health check
curl <http://localhost:8080/health>

# 2. Basic scraping
curl -X POST <http://localhost:8080/scrape> \
  -H "Content-Type: application/json" \
  -d '{"url": "<https://example.com"}'>

# 3. Company intel
curl -X POST <http://localhost:8080/company-intel> \
  -H "Content-Type: application/json" \
  -d '{"url": "<https://acme.com"}'>

# 4. Contact discovery
curl -X POST <http://localhost:8080/find-contacts> \
  -H "Content-Type: application/json" \
  -d '{"url": "<https://acme.com/contact"}'>

```text

### Integration Tests

```typescript
// server/integrations/crawl4ai/test-scraping.ts
import { scrapePage, enrichLead, findContacts } from "./client";

async function test() {
  // Test basic scraping
  const page = await scrapePage("<https://example.com>");
  console.log("✅ Scraped:", page.title);

  // Test lead enrichment
  const enriched = await enrichLead(123);
  console.log("✅ Enriched:", enriched.company);

  // Test contact discovery
  const contacts = await findContacts("<https://acme.com>");
  console.log("✅ Found contacts:", contacts.length);
}

```bash

---

## 📊 Success Metrics

### Day 9 Goals

- [ ] Docker service running on port 8080
- [ ] Basic scraping endpoint working
- [ ] TypeScript client integrated
- [ ] 3+ test websites scraped successfully
- [ ] Error handling robust

### Day 10 Goals

- [ ] Company intel extraction working
- [ ] Contact discovery functional
- [ ] Automated lead enrichment
- [ ] Langfuse monitoring active
- [ ] Documentation complete

### Overall Success

- [ ] Can enrich leads automatically
- [ ] Data quality >80%
- [ ] Response time <30s per lead
- [ ] No legal/ethical issues
- [ ] Production ready

---

## ⚠️ Important Considerations

### Legal & Ethical

- ✅ Respect robots.txt
- ✅ Rate limit requests (10/hour per domain)
- ✅ Identify bot clearly (User-Agent)
- ✅ Only scrape publicly available data
- ✅ Provide opt-out mechanism

### Performance

- ✅ Cache results (24h TTL)
- ✅ Background processing (don't block UI)
- ✅ Timeout handling (30s max)
- ✅ Retry logic (3 attempts)

### Cost

- ✅ OpenRouter AI extraction: ~$0.01/page
- ✅ Infrastructure: $0 (self-hosted)
- ✅ Estimated monthly: $15-30

---

## 🎯 Next Steps

### Ready to Start

1. **Read the plan:** `PLAN_DAY9-10.md`
1. **Create Docker files** (Step 1 above)
1. **Test basic scraping** (curl commands)
1. **Integrate TypeScript client**
1. **Add to Friday AI**

### Timeline

```bash
Saturday (Day 9):
10:00 - 11:30   Docker setup
11:30 - 12:30   FastAPI app
12:30 - 13:00   Break
13:00 - 14:00   TypeScript client
14:00 - 14:30   Testing
14:30 - 15:30   Integration

Sunday (Day 10):
10:00 - 12:00   Company intelligence
12:00 - 13:00   Break
13:00 - 15:00   Contact discovery
15:00 - 16:30   Automated enrichment
16:30 - 18:00   Testing & docs

````

---

## 💡 Tips

1. **Start Simple:** Basic scraping first, then add features
1. **Test Early:** Use curl to test each endpoint immediately
1. **Monitor Langfuse:** Track scraping quality from day 1
1. **Respect Limits:** Don't hammer websites with requests
1. **Document as You Go:** Update docs with learnings

---

**Status:** 📋 Ready to Start
**Prerequisites:** ✅ All Complete
**Estimated Time:** 7-8 hours
**Difficulty:** Medium
**Value:** High (lead enrichment automation)

---

**Last Updated:** November 9, 2025, 22:20
**Next Action:** Create Docker files and start Day 9!
