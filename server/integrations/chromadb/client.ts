/**
 * ChromaDB Client - Vector Database Integration
 *
 * Provides semantic search and similarity matching for:
 * - Lead deduplication
 * - Email context retrieval
 * - Document search
 */

import { ChromaClient, Collection, IEmbeddingFunction } from "chromadb";
import { ENV } from "../../_core/env";
import { generateEmbeddings } from "./embeddings";

// Singleton client instance
let chromaClient: ChromaClient | null = null;

/**
 * Custom embedding function using OpenRouter
 * Uses real embeddings API for semantic search
 */
class OpenRouterEmbeddings implements IEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    // Use real embeddings from OpenRouter
    return await generateEmbeddings(texts);
  }
}

/**
 * Get or create ChromaDB client
 */
export function getChromaClient(): ChromaClient | null {
  // Check if ChromaDB is enabled
  if (!ENV.chromaEnabled) {
    return null;
  }

  // Return existing client
  if (chromaClient) {
    return chromaClient;
  }

  try {
    // Create new client
    chromaClient = new ChromaClient({
      path: ENV.chromaUrl || "http://localhost:8000",
      auth: ENV.chromaAuthToken
        ? {
            provider: "token",
            credentials: ENV.chromaAuthToken,
          }
        : undefined,
    });

    console.log(
      `[ChromaDB] ✅ Client initialized (${ENV.chromaUrl || "http://localhost:8000"})`
    );

    return chromaClient;
  } catch (error) {
    console.error("[ChromaDB] Failed to initialize client:", error);
    return null;
  }
}

/**
 * Get or create a collection
 */
export async function getCollection(
  name: string,
  metadata?: Record<string, any>
): Promise<Collection | null> {
  const client = getChromaClient();
  if (!client) return null;

  try {
    // Try to get existing collection
    return await client.getOrCreateCollection({
      name,
      metadata,
      embeddingFunction: new OpenRouterEmbeddings(),
    });
  } catch (error) {
    console.error(`[ChromaDB] Failed to get collection "${name}":`, error);
    return null;
  }
}

/**
 * Add documents to a collection
 */
export async function addDocuments(
  collectionName: string,
  documents: {
    id: string;
    text: string;
    metadata?: Record<string, any>;
  }[]
): Promise<boolean> {
  if (documents.length === 0) return true;

  const collection = await getCollection(collectionName);
  if (!collection) return false;

  try {
    await collection.add({
      ids: documents.map(d => d.id),
      documents: documents.map(d => d.text),
      metadatas: documents.map(d => d.metadata || {}),
    });

    console.log(
      `[ChromaDB] ✅ Added ${documents.length} documents to "${collectionName}"`
    );
    return true;
  } catch (error) {
    console.error(`[ChromaDB] Failed to add documents:`, error);
    return false;
  }
}

/**
 * Search for similar documents
 */
export async function searchSimilar(
  collectionName: string,
  query: string,
  limit: number = 5,
  where?: Record<string, any>
): Promise<{
  ids: string[];
  documents: string[];
  distances: number[];
  metadatas: Record<string, any>[];
} | null> {
  const collection = await getCollection(collectionName);
  if (!collection) return null;

  try {
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
      where,
    });

    return {
      ids: (results.ids[0] || []).filter((id): id is string => id !== null),
      documents: (results.documents[0] || []).filter(
        (doc): doc is string => doc !== null
      ),
      distances: (results.distances?.[0] || []).filter(
        (dist): dist is number => dist !== null
      ),
      metadatas: (results.metadatas?.[0] || []).filter(
        (meta): meta is Record<string, any> => meta !== null
      ),
    };
  } catch (error) {
    console.error(`[ChromaDB] Search failed:`, error);
    return null;
  }
}

/**
 * Update document in collection
 */
export async function updateDocument(
  collectionName: string,
  id: string,
  text: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const collection = await getCollection(collectionName);
  if (!collection) return false;

  try {
    await collection.update({
      ids: [id],
      documents: [text],
      metadatas: metadata ? [metadata] : undefined,
    });

    console.log(
      `[ChromaDB] ✅ Updated document "${id}" in "${collectionName}"`
    );
    return true;
  } catch (error) {
    console.error(`[ChromaDB] Failed to update document:`, error);
    return false;
  }
}

/**
 * Delete document from collection
 */
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<boolean> {
  const collection = await getCollection(collectionName);
  if (!collection) return false;

  try {
    await collection.delete({
      ids: [id],
    });

    console.log(
      `[ChromaDB] ✅ Deleted document "${id}" from "${collectionName}"`
    );
    return true;
  } catch (error) {
    console.error(`[ChromaDB] Failed to delete document:`, error);
    return false;
  }
}

/**
 * Get document by ID
 */
export async function getDocument(
  collectionName: string,
  id: string
): Promise<{
  id: string;
  document: string;
  metadata: Record<string, any>;
} | null> {
  const collection = await getCollection(collectionName);
  if (!collection) return null;

  try {
    const results = await collection.get({
      ids: [id],
    });

    if (!results.ids.length) return null;

    return {
      id: results.ids[0],
      document: (results.documents?.[0] as string) || "",
      metadata: results.metadatas?.[0] || {},
    };
  } catch (error) {
    console.error(`[ChromaDB] Failed to get document:`, error);
    return null;
  }
}

/**
 * Count documents in collection
 */
export async function countDocuments(collectionName: string): Promise<number> {
  const collection = await getCollection(collectionName);
  if (!collection) return 0;

  try {
    return await collection.count();
  } catch (error) {
    console.error(`[ChromaDB] Failed to count documents:`, error);
    return 0;
  }
}

/**
 * Delete entire collection
 */
export async function deleteCollection(name: string): Promise<boolean> {
  const client = getChromaClient();
  if (!client) return false;

  try {
    await client.deleteCollection({ name });
    console.log(`[ChromaDB] ✅ Deleted collection "${name}"`);
    return true;
  } catch (error) {
    console.error(`[ChromaDB] Failed to delete collection:`, error);
    return false;
  }
}

/**
 * List all collections
 */
export async function listCollections(): Promise<string[]> {
  const client = getChromaClient();
  if (!client) return [];

  try {
    const collections = await client.listCollections();
    return (collections as any[]).map(c => c.name);
  } catch (error) {
    console.error(`[ChromaDB] Failed to list collections:`, error);
    return [];
  }
}

// Helper: Format lead for embedding
export function formatLeadForEmbedding(lead: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
}): string {
  const parts: string[] = [];

  if (lead.name) parts.push(`Name: ${lead.name}`);
  if (lead.company) parts.push(`Company: ${lead.company}`);
  if (lead.email) parts.push(`Email: ${lead.email}`);
  if (lead.phone) parts.push(`Phone: ${lead.phone}`);
  if (lead.message) parts.push(`Message: ${lead.message}`);

  return parts.join("\n");
}

// Helper: Format email for embedding
export function formatEmailForEmbedding(email: {
  from?: string;
  subject?: string;
  body?: string;
}): string {
  const parts: string[] = [];

  if (email.from) parts.push(`From: ${email.from}`);
  if (email.subject) parts.push(`Subject: ${email.subject}`);
  if (email.body) parts.push(`Body: ${email.body}`);

  return parts.join("\n");
}
