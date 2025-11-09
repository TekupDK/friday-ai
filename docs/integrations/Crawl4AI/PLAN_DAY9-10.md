# Day 9-10: Crawl4AI Integration Plan

**Start Date:** November 9, 2025, 22:00  
**Duration:** 2 days (8-12 hours)  
**Goal:** Web scraping for lead enrichment & company intelligence

---

## 🎯 Objectives

### Day 9: Setup & Basic Scraping (4-6 hours)
1. Research Crawl4AI capabilities
2. Setup Docker/Python service
3. Create scraping endpoints
4. Test basic web scraping
5. Integrate with leads API

### Day 10: Advanced Features & Testing (4-6 hours)
1. Company intelligence gathering
2. Social media scraping
3. Contact information extraction
4. Email address finding
5. Testing & validation
6. Documentation

---

## 🕷️ What is Crawl4AI?

**Crawl4AI** is an AI-powered web scraping tool designed for:
- Smart content extraction
- JavaScript rendering
- Anti-bot bypass
- Structured data extraction
- LLM-friendly output

**Perfect for:**
- Lead enrichment (company info, contacts)
- Competitive intelligence
- Market research
- Contact discovery
- Company profiling

---

## 🏗️ Architecture Options

### Option 1: Python Service (Docker) ⭐ RECOMMENDED

```
Friday AI (TypeScript)
    ↓ HTTP API
Crawl4AI Service (Python/Docker)
    ↓ Scraping
External Websites
```

**Pros:**
- ✅ Isolated Python environment
- ✅ Easy to scale
- ✅ No TypeScript conflicts
- ✅ Can use full Crawl4AI features

**Cons:**
- ❌ Extra Docker container
- ❌ HTTP overhead (minimal)

### Option 2: Direct Python Integration

```
Friday AI (TypeScript)
    ↓ child_process
Python Script (Crawl4AI)
    ↓ Scraping
External Websites
```

**Pros:**
- ✅ No extra container
- ✅ Direct integration

**Cons:**
- ❌ Python dependency management
- ❌ Harder to scale
- ❌ Process management complexity

**Decision:** Use Option 1 (Docker Service) for scalability and isolation.

---

## 📦 Tech Stack

### Core
- **Crawl4AI:** Python library for AI-powered scraping
- **FastAPI:** Python web framework for API
- **Docker:** Containerization
- **Playwright/Selenium:** Browser automation

### Integrations
- **OpenRouter:** For AI content extraction
- **ChromaDB:** Store scraped data for context
- **PostgreSQL:** Store enriched lead data

---

## 🔧 Day 9 Implementation Plan

### Step 1: Research & Setup (1 hour)

**Tasks:**
- [ ] Research Crawl4AI documentation
- [ ] Identify best scraping strategies
- [ ] Define API endpoints
- [ ] Create Docker setup

**Deliverables:**
- Research summary
- Architecture document
- Docker files ready

### Step 2: Docker Service (1.5 hours)

**Create:**
```
server/integrations/crawl4ai/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.crawl4ai.yml
│   └── requirements.txt
├── app/
│   ├── main.py              (FastAPI app)
│   ├── scraper.py           (Crawl4AI wrapper)
│   └── models.py            (Pydantic models)
└── README.md
```

**API Endpoints:**
```python
POST /scrape
    - URL to scrape
    - Returns structured data

POST /enrich-lead
    - Lead information
    - Company URL
    - Returns enriched data

POST /find-contacts
    - Company URL
    - Returns email addresses, phone numbers

GET /health
    - Health check
```

### Step 3: TypeScript Client (1 hour)

**Create:**
```typescript
// server/integrations/crawl4ai/client.ts
export async function scrapePage(url: string): Promise<ScrapedData>
export async function enrichLead(leadId: number): Promise<EnrichedLead>
export async function findContacts(companyUrl: string): Promise<Contacts>
```

### Step 4: Basic Testing (30 min)

**Test:**
- Scrape simple webpage
- Extract company info
- Find contact information

### Step 5: Lead Integration (1 hour)

**Integrate with:**
- `server/db.ts` - Add enrichment on lead creation
- `client/src/components/leads/` - Show enriched data
- ChromaDB - Store scraped data for context

---

## 🔧 Day 10 Implementation Plan

### Step 1: Company Intelligence (2 hours)

**Features:**
- Company description
- Industry classification
- Company size estimate
- Location information
- Social media profiles

**Implementation:**
```typescript
interface CompanyIntel {
  description: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: {
    city: string;
    country: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}
```

### Step 2: Contact Discovery (2 hours)

**Features:**
- Email pattern detection
- Phone number extraction
- Contact page scraping
- LinkedIn profile finding

**Sources:**
- Company website
- LinkedIn
- Crunchbase
- Hunter.io API (if available)

### Step 3: Automated Enrichment (1.5 hours)

**Workflow:**
```
New Lead Created
    ↓
Has company URL?
    ↓ YES
Scrape company website
    ↓
Extract company info
    ↓
Find contacts
    ↓
Update lead in database
    ↓
Index in ChromaDB
```

**Background Job:**
- Queue-based processing
- Retry on failure
- Rate limiting (respect robots.txt)

### Step 4: Testing & Validation (1.5 hours)

**Test Scenarios:**
- [ ] Scrape various company websites
- [ ] Handle errors (404, timeout, blocking)
- [ ] Verify data quality
- [ ] Check rate limiting
- [ ] Performance testing

### Step 5: Documentation (1 hour)

**Create:**
- Setup guide
- API documentation
- Usage examples
- Troubleshooting guide
- Best practices

---

## 📊 Use Cases

### 1. Lead Enrichment

**Before:**
```
Lead:
  Name: John Doe
  Email: john@acme.com
  Company: ACME Corp
```

**After:**
```
Lead:
  Name: John Doe
  Email: john@acme.com
  Company: ACME Corp
  CompanyInfo:
    Description: "ACME Corp is a leading..."
    Industry: "Technology"
    Size: "medium"
    Employees: 50-200
    Location: "Copenhagen, Denmark"
    Website: "https://acme.com"
    LinkedIn: "https://linkedin.com/company/acme"
    Phone: "+45 12 34 56 78"
```

### 2. Competitive Intelligence

**Track competitors:**
- Product launches
- Pricing changes
- Team changes (LinkedIn)
- Blog posts
- News mentions

### 3. Contact Discovery

**Find decision makers:**
- CEO, CTO, CMO emails
- Department contacts
- Sales team contacts
- Support emails

---

## 🔒 Legal & Ethical Considerations

### Respect robots.txt
```python
# Always check robots.txt before scraping
from urllib.robotparser import RobotFileParser

def can_scrape(url: str) -> bool:
    rp = RobotFileParser()
    rp.set_url(f"{url}/robots.txt")
    rp.read()
    return rp.can_fetch("*", url)
```

### Rate Limiting
```python
# Limit requests per domain
MAX_REQUESTS_PER_DOMAIN = 10  # per hour
DELAY_BETWEEN_REQUESTS = 2  # seconds
```

### User Agent
```python
# Identify ourselves clearly
USER_AGENT = "FridayAI-Bot/1.0 (+https://friday-ai.com/bot)"
```

### Data Privacy
- Don't scrape personal data without consent
- Respect GDPR regulations
- Only scrape publicly available information
- Provide opt-out mechanism

---

## ⚡ Performance & Scalability

### Caching
```python
# Cache scraped data for 24 hours
CACHE_TTL = 86400  # seconds

@lru_cache(maxsize=1000)
def scrape_cached(url: str) -> ScrapedData:
    return scrape_page(url)
```

### Background Processing
```python
# Use Celery or similar for background jobs
from celery import Celery

app = Celery('crawl4ai')

@app.task
def enrich_lead_async(lead_id: int):
    # Scrape and enrich in background
    pass
```

### Rate Limiting
```python
# Implement per-domain rate limiting
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/scrape")
@limiter.limit("10/minute")
async def scrape_endpoint(url: str):
    pass
```

---

## 🐛 Error Handling

### Common Issues

**1. Website Blocking**
```python
# Use rotating user agents
# Add delays between requests
# Use proxies if needed (Bright Data, ScraperAPI)
```

**2. JavaScript-Heavy Sites**
```python
# Use Playwright for full browser rendering
from playwright.async_api import async_playwright

async def scrape_js_site(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(url)
        content = await page.content()
        await browser.close()
        return content
```

**3. Timeouts**
```python
# Set reasonable timeouts
import asyncio

async def scrape_with_timeout(url: str, timeout: int = 30):
    try:
        return await asyncio.wait_for(scrape_page(url), timeout=timeout)
    except asyncio.TimeoutError:
        logger.error(f"Timeout scraping {url}")
        return None
```

---

## 💰 Cost Estimation

### Infrastructure
```
Crawl4AI Docker Container: Free (self-hosted)
CPU/RAM: ~500MB RAM, 0.5 CPU
Monthly: $0 (runs on existing server)
```

### API Costs
```
OpenRouter (for AI extraction): $0.01 per page
Hunter.io (email finding): $0.01 per search (optional)

Example Monthly:
- 1,000 leads enriched = $10 (OpenRouter)
- 500 email searches = $5 (Hunter.io)

Total: ~$15/month
```

### Proxies (Optional)
```
If websites block you:
- Bright Data: $500/month (50GB)
- ScraperAPI: $49/month (100k requests)

Only needed if scraping at scale
```

---

## 📚 Resources

### Crawl4AI
- Docs: https://crawl4ai.com/docs
- GitHub: https://github.com/unclecode/crawl4ai
- Examples: https://crawl4ai.com/examples

### Web Scraping Best Practices
- robots.txt specification
- GDPR compliance
- Ethical scraping guidelines
- Anti-scraping detection bypass

### Tools
- Playwright: Browser automation
- BeautifulSoup: HTML parsing
- Scrapy: Web scraping framework
- Hunter.io: Email finding API

---

## ✅ Success Criteria

**Day 9:**
- [ ] Docker service running
- [ ] Basic scraping working
- [ ] API endpoints functional
- [ ] TypeScript client integrated
- [ ] Test with 3+ websites

**Day 10:**
- [ ] Company intelligence extraction
- [ ] Contact discovery working
- [ ] Automated lead enrichment
- [ ] Error handling robust
- [ ] Documentation complete

**Overall:**
- [ ] Can enrich leads automatically
- [ ] Data quality > 80%
- [ ] Response time < 30s per lead
- [ ] No legal issues
- [ ] Production ready

---

## 🚀 Timeline

### Saturday (Day 9)
```
10:00 - 11:00   Research & Planning
11:00 - 12:30   Docker Service Setup
12:30 - 13:00   Break
13:00 - 14:00   TypeScript Client
14:00 - 14:30   Basic Testing
14:30 - 15:30   Lead Integration
```

### Sunday (Day 10)
```
10:00 - 12:00   Company Intelligence
12:00 - 13:00   Break
13:00 - 15:00   Contact Discovery
15:00 - 16:30   Automated Enrichment
16:30 - 18:00   Testing & Documentation
```

---

**Status:** 📋 Planned - Ready to Start  
**Next Step:** Begin Day 9 Research & Docker Setup  
**Estimated Start:** Now (22:00, November 9, 2025)
