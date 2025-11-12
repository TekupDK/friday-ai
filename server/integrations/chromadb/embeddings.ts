/**
 * Embeddings Service - Using OpenRouter
 *
 * Generates vector embeddings for semantic search using OpenRouter's API.
 * Uses the same infrastructure and API key as our LLM calls.
 */

import { ENV } from "../../_core/env";

// Cache for embeddings to avoid duplicate API calls
const embeddingCache = new Map<string, number[]>();

/**
 * Generate embedding using OpenRouter
 *
 * Models available (choose based on cost/quality):
 * - openai/text-embedding-3-small (1536 dims) - Cheap
 * - openai/text-embedding-ada-002 (1536 dims) - Cheap
 * - voyage/voyage-2 (1024 dims) - If available
 *
 * We use text-embedding-3-small as default (good quality, low cost)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Return cached embedding if available
  const cacheKey = text.substring(0, 100); // Use first 100 chars as key
  const wasCached = embeddingCache.has(cacheKey);

  if (wasCached) {
    return embeddingCache.get(cacheKey)!;
  }

  // Validate API key
  if (!ENV.openRouterApiKey) {
    console.error("[Embeddings] No OpenRouter API key configured");
    return generateFallbackEmbedding(text);
  }

  // Langfuse tracing for quality monitoring
  const { getLangfuseClient, flushLangfuse } = await import(
    "../langfuse/client"
  );
  const langfuse = getLangfuseClient();

  const trace = langfuse?.trace({
    name: "chromadb-embedding-generation",
    metadata: {
      textLength: text.length,
      source: "chromadb",
    },
  });

  const generation = trace?.generation({
    name: "embedding-api-call",
    model: "openai/text-embedding-3-small",
    input: text.substring(0, 200), // First 200 chars for context
  });

  const startTime = Date.now();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.openRouterApiKey || ""}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Optional: for rankings
        "X-Title": "Friday AI", // Optional: for rankings
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding API failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;
    const duration = Date.now() - startTime;

    // Cache the result
    embeddingCache.set(cacheKey, embedding);

    // Limit cache size to prevent memory issues
    if (embeddingCache.size > 1000) {
      const firstKey = embeddingCache.keys().next().value;
      if (firstKey !== undefined) {
        embeddingCache.delete(firstKey);
      }
    }

    // Log success to Langfuse
    generation?.end({
      output: { dimensions: embedding.length },
      usage: {
        promptTokens: Math.ceil(text.length / 4), // Estimate
        completionTokens: 0,
        totalTokens: Math.ceil(text.length / 4),
      },
      metadata: {
        duration,
        cached: false,
        dimensions: embedding.length,
        cacheSize: embeddingCache.size,
      },
    });

    console.log(
      `[Embeddings] Generated embedding (${embedding.length} dimensions) in ${duration}ms`
    );
    await flushLangfuse();

    return embedding;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error to Langfuse
    generation?.end({
      metadata: {
        duration,
        error: error instanceof Error ? error.message : String(error),
        level: "ERROR",
        fallbackUsed: true,
      },
    });

    console.error("[Embeddings] Failed to generate embedding:", error);
    await flushLangfuse();

    // Fallback to simple embedding if API fails
    return generateFallbackEmbedding(text);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Check cache first
  const results: number[][] = [];
  const uncachedTexts: string[] = [];
  const uncachedIndices: number[] = [];

  for (let i = 0; i < texts.length; i++) {
    const cacheKey = texts[i].substring(0, 100);
    if (embeddingCache.has(cacheKey)) {
      results[i] = embeddingCache.get(cacheKey)!;
    } else {
      uncachedTexts.push(texts[i]);
      uncachedIndices.push(i);
    }
  }

  // If all cached, return early
  if (uncachedTexts.length === 0) {
    return results;
  }

  // Validate API key
  if (!ENV.openRouterApiKey) {
    console.error("[Embeddings] No OpenRouter API key configured");
    return texts.map(text => generateFallbackEmbedding(text));
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.openRouterApiKey || ""}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Friday AI",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: uncachedTexts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Batch embedding API failed: ${response.status} - ${error}`
      );
    }

    const data = await response.json();

    // Fill in uncached results
    for (let i = 0; i < uncachedTexts.length; i++) {
      const embedding = data.data[i].embedding;
      const originalIndex = uncachedIndices[i];
      results[originalIndex] = embedding;

      // Cache the result
      const cacheKey = uncachedTexts[i].substring(0, 100);
      embeddingCache.set(cacheKey, embedding);
    }

    console.log(
      `[Embeddings] Generated ${uncachedTexts.length} embeddings in batch`
    );
    return results;
  } catch (error) {
    console.error("[Embeddings] Batch embedding failed:", error);
    // Fallback
    return texts.map(text => generateFallbackEmbedding(text));
  }
}

/**
 * Fallback embedding using simple hash
 * Used when API is unavailable or fails
 *
 * Note: This is NOT semantic! Only use as emergency fallback.
 */
function generateFallbackEmbedding(text: string): number[] {
  console.warn(
    "[Embeddings] Using fallback hash-based embedding (not semantic!)"
  );

  // Create a 1536-dimensional embedding to match OpenAI's size
  const embedding = new Array(1536).fill(0);

  // Simple hash-based approach
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = charCode % 1536;
    embedding[index] += Math.sin(charCode * i) * 0.1;
  }

  // Normalize
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  return embedding.map(val => val / (magnitude || 1));
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns value between -1 (opposite) and 1 (identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embeddings must have same dimensions");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Clear the embedding cache
 * Useful for testing or memory management
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log("[Embeddings] Cache cleared");
}

/**
 * Get cache statistics
 */
export function getEmbeddingCacheStats() {
  return {
    size: embeddingCache.size,
    maxSize: 1000,
  };
}
