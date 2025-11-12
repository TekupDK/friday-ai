/**
 * ChromaDB Integration - Main Export
 */

export {
  getChromaClient,
  getCollection,
  addDocuments,
  searchSimilar,
  updateDocument,
  deleteDocument,
  getDocument,
  countDocuments,
  deleteCollection,
  listCollections,
  formatLeadForEmbedding,
  formatEmailForEmbedding,
} from "./client";

export {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  clearEmbeddingCache,
  getEmbeddingCacheStats,
} from "./embeddings";

// Re-export for convenience
export { getChromaClient as default } from "./client";
