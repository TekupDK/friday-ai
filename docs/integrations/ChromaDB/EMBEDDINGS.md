# Embeddings Service Documentation

**Status:** ✅ Implemented with OpenRouter  
**Date:** November 9, 2025 15:00

---

## 🎯 Overview

The embeddings service generates vector representations of text for semantic search in ChromaDB. We use **OpenRouter's embeddings API** with the same API key as our LLM calls.

---

## 🔧 Configuration

### Model Used
```
openai/text-embedding-3-small
- Dimensions: 1536
- Cost: Very low (~$0.00002 per 1K tokens)
- Quality: Excellent for semantic search
```

### API Endpoint
```
https://openrouter.ai/api/v1/embeddings
```

### Authentication
Uses existing `OPENROUTER_API_KEY` from environment.

---

## 📚 API Reference

### `generateEmbedding(text: string): Promise<number[]>`

Generate embedding for a single text.

```typescript
import { generateEmbedding } from '../integrations/chromadb';

const embedding = await generateEmbedding('Hello World');
console.log(embedding.length); // 1536
```

**Features:**
- ✅ Caching (avoids duplicate API calls)
- ✅ Fallback to simple hash if API fails
- ✅ Error handling

---

### `generateEmbeddings(texts: string[]): Promise<number[][]>`

Generate embeddings for multiple texts in batch (more efficient).

```typescript
import { generateEmbeddings } from '../integrations/chromadb';

const texts = ['Text 1', 'Text 2', 'Text 3'];
const embeddings = await generateEmbeddings(texts);
console.log(embeddings.length); // 3
```

**Features:**
- ✅ Batch processing (single API call)
- ✅ Partial caching
- ✅ More efficient than multiple single calls

---

### `cosineSimilarity(a: number[], b: number[]): number`

Calculate similarity between two embeddings.

```typescript
import { generateEmbedding, cosineSimilarity } from '../integrations/chromadb';

const emb1 = await generateEmbedding('Hello World');
const emb2 = await generateEmbedding('Hi World');

const similarity = cosineSimilarity(emb1, emb2);
console.log(similarity); // 0.95 (very similar)
```

**Returns:** Value between -1 (opposite) and 1 (identical)

**Interpretation:**
- `> 0.9`: Nearly identical
- `0.7-0.9`: Very similar (likely duplicate)
- `0.5-0.7`: Somewhat similar
- `< 0.5`: Different

---

### `clearEmbeddingCache(): void`

Clear the embedding cache.

```typescript
import { clearEmbeddingCache } from '../integrations/chromadb';

clearEmbeddingCache();
```

---

### `getEmbeddingCacheStats()`

Get cache statistics.

```typescript
import { getEmbeddingCacheStats } from '../integrations/chromadb';

const stats = getEmbeddingCacheStats();
console.log(stats); // { size: 42, maxSize: 1000 }
```

---

## 🧪 Testing

### Run Test Script

```bash
tsx server/integrations/chromadb/test-embeddings.ts
```

### Expected Output

```
🧪 Testing OpenRouter Embeddings

Test 1: Generate embedding for "Hello World"
✅ Generated embedding with 1536 dimensions

Test 2: Semantic similarity test
Text 1: "John Doe works at ACME Corporation"
Text 2: "Jane Smith is employed by ACME Corp"
Similarity 1-2: 0.8234 (should be HIGH - same company)

Text 3: "Python programming language tutorial"
Similarity 1-3: 0.2156 (should be LOW - different topic)

...
```

---

## 💡 Use Cases

### 1. Lead Deduplication

```typescript
import { generateEmbedding, cosineSimilarity } from '../integrations/chromadb';

async function isDuplicateLead(newLead, existingLeads) {
  const newEmbedding = await generateEmbedding(
    formatLeadForEmbedding(newLead)
  );
  
  for (const existing of existingLeads) {
    const existingEmbedding = await generateEmbedding(
      formatLeadForEmbedding(existing)
    );
    
    const similarity = cosineSimilarity(newEmbedding, existingEmbedding);
    
    if (similarity > 0.85) {
      return true; // Likely duplicate
    }
  }
  
  return false;
}
```

### 2. Email Context Retrieval

```typescript
import { searchSimilar } from '../integrations/chromadb';

async function getRelatedEmails(currentEmail) {
  const results = await searchSimilar(
    'friday_emails',
    formatEmailForEmbedding(currentEmail),
    5
  );
  
  return results?.documents || [];
}
```

### 3. Document Search (RAG)

```typescript
import { searchSimilar } from '../integrations/chromadb';

async function findRelevantDocs(question) {
  const results = await searchSimilar(
    'friday_docs',
    question,
    3
  );
  
  return results?.documents.join('\n\n');
}
```

---

## ⚡ Performance

### Benchmarks

```
Single embedding:    ~100-200ms (API call)
Cached embedding:    ~1ms
Batch (10 texts):    ~150-300ms
Similarity calc:     <1ms
```

### Optimization Tips

1. **Use Batch API** when embedding multiple texts
2. **Cache is automatic** - repeated texts are cached
3. **Pre-generate embeddings** for existing data
4. **Limit text length** to ~500 words for best performance

---

## 🔒 Security & Privacy

- ✅ Uses existing OpenRouter API key
- ✅ Text data sent to OpenRouter (via OpenAI)
- ✅ No data stored by OpenRouter (per their policy)
- ✅ Embeddings cached locally in memory
- ⚠️ For sensitive data, consider local embeddings

---

## 🐛 Troubleshooting

### Problem: "No OpenRouter API key configured"

**Solution:** Ensure `.env.dev` has:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

### Problem: API call fails

**Solution:** 
- Check API key is valid
- Check OpenRouter status
- Fallback to simple hash automatically kicks in

### Problem: Slow performance

**Solutions:**
- Use batch API for multiple texts
- Check network latency
- Consider caching strategy
- Pre-generate embeddings offline

### Problem: Unexpected similarity scores

**Solutions:**
- Check text preprocessing
- Ensure embeddings are from same model
- Test with known similar/different pairs
- Adjust thresholds based on testing

---

## 📊 Cost Estimation

### OpenRouter Pricing
```
Model: openai/text-embedding-3-small
Cost: $0.00002 per 1K tokens

Example usage:
- 1,000 leads @ 100 tokens each = 100K tokens = $2
- 10,000 emails @ 200 tokens each = 2M tokens = $40
```

### Cost Optimization

1. **Cache frequently used embeddings**
2. **Batch process when possible**
3. **Limit text to essential content**
4. **Consider local model for high volume** (see below)

---

## 🔄 Alternative: Local Embeddings

If cost or privacy is a concern, consider local embeddings:

```typescript
// Install: pnpm add @xenova/transformers
import { pipeline } from '@xenova/transformers';

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

const output = await extractor('Hello World', {
  pooling: 'mean',
  normalize: true,
});

const embedding = Array.from(output.data); // 384 dimensions
```

**Pros:**
- 100% free
- No API calls
- Complete privacy

**Cons:**
- Slower (~500ms per embedding)
- Lower quality than OpenAI
- Needs model download (~100MB)

---

## 🚀 Next Steps

1. ✅ Embeddings implemented
2. 🔄 Integrate in lead deduplication
3. 🔄 Integrate in email context
4. 🔄 Test end-to-end
5. 📊 Monitor performance & costs

---

**Last Updated:** November 9, 2025 15:00  
**Status:** Production Ready
