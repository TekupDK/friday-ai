/**
 * Langfuse Integration - Main Export
 */

export {
  getLangfuseClient,
  createTrace,
  createGeneration,
  flushLangfuse,
  shutdownLangfuse,
  tracedOperation,
  langfuse,
} from "./client";

// Re-export for convenience
export { getLangfuseClient as default } from "./client";
