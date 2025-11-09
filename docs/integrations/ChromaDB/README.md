# ChromaDB Vector Database Integration

**Status:** ✅ Docker Running, Ready for Integration  
**Date Started:** November 9, 2025  
**Version:** ChromaDB Latest (V2 API)

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Day 4-5: Docker deployment & TypeScript client
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & design
- **[INTEGRATION.md](./INTEGRATION.md)** - Day 6-8: Lead & email integration
- **[API.md](./API.md)** - Client API reference

---

## 🎯 What Is ChromaDB?

ChromaDB is an open-source vector database that enables:

- **Semantic Search:** Find similar leads, emails, documents
- **Deduplication:** Detect duplicate leads intelligently
- **Context Retrieval:** Find related emails for better AI responses
- **RAG:** Retrieval Augmented Generation for documents
- **Scalability:** Handle millions of vectors efficiently

---

## ⚡ Quick Start

### 1. Start ChromaDB

```bash
cd server/integrations/chromadb
npm run start
```

### 2. Verify Running

```bash
curl http://localhost:8000/api/v2/heartbeat
# Expected: {"nanosecond heartbeat":...}
```

### 3. Add to .env.dev

```bash
CHROMA_ENABLED=true
CHROMA_URL=http://localhost:8000
CHROMA_AUTH_TOKEN=friday-chromadb-token-dev
```

### 4. Use in Code

```typescript
import { addDocuments, searchSimilar } from '../integrations/chromadb';

// Add lead
await addDocuments('friday_leads', [{
  id: 'lead-123',
  text: 'John Doe from ACME Corp',
  metadata: { leadId: '123' }
}]);

// Search similar
const results = await searchSimilar('friday_leads', 'ACME', 5);
```

---

## 📊 Current Status

```
✅ Docker:              Running on port 8000
✅ TypeScript Client:   Complete
✅ Collections:         Ready to use
✅ Persistence:         Configured
✅ Authentication:      Token-based
❌ Embeddings:          Simple hash (needs upgrade)
❌ Lead Integration:    Not yet done
❌ Email Integration:   Not yet done
```

---

## 🚀 Integration Roadmap

### Day 4-5: Setup ✅ COMPLETE
- Docker deployment
- TypeScript client
- Basic operations

### Day 6-8: Integration 🔄 IN PROGRESS
- Real embeddings API
- Lead deduplication
- Email context retrieval
- Testing & validation

### Day 9-10: Crawl4AI
- Web scraping integration
- Lead enrichment from ChromaDB data

---

## 💡 Use Cases

### 1. Lead Deduplication
```typescript
// Before creating a new lead:
const similar = await searchSimilar('friday_leads', leadText, 3);
if (similar && similar.distances[0] < 0.2) {
  // Lead already exists!
  return existingLead;
}
```

### 2. Email Context
```typescript
// When processing email:
const context = await searchSimilar('friday_emails', emailText, 5);
// Use context to generate better AI response
```

### 3. Document Search
```typescript
// When user asks question:
const relevantDocs = await searchSimilar('friday_docs', question, 3);
// Use as context for RAG
```

---

## 🔗 Related Documentation

- **Langfuse:** [../langfuse/](../langfuse/) - LLM Observability
- **LiteLLM:** [../litellm/](../litellm/) - LLM Gateway
- **Implementation Roadmap:** [../open-source-stack/IMPLEMENTATION_ROADMAP.md](../open-source-stack/IMPLEMENTATION_ROADMAP.md)

---

## 📈 Performance

```
Embeddings:        ~100ms per document (API dependent)
Search:            <50ms for up to 1M vectors
Storage:           ~1KB per vector (384 dimensions)
Memory:            ~200-500 MB
Scalability:       Millions of vectors
```

---

## 🆘 Troubleshooting

### ChromaDB not starting?
```bash
docker compose -f server/integrations/chromadb/docker/docker-compose.chromadb.yml logs
```

### Can't connect?
1. Check `CHROMA_ENABLED=true` in .env.dev
2. Verify ChromaDB running: `docker ps`
3. Test health: `curl http://localhost:8000/api/v2/heartbeat`

### No search results?
1. Check embeddings are being generated
2. Verify documents were added: `countDocuments('collection_name')`
3. Check collection exists: `listCollections()`

---

**Last Updated:** November 9, 2025 14:51  
**Status:** Foundation Ready, Integration In Progress
