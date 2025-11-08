/**
 * LLM Tracing & Observability System
 * Tracks all LLM calls with inputs, outputs, tokens, cost, and performance
 *
 * Alternative to LangSmith/LangFuse - fully custom, no dependencies
 */

import { Message } from "./_core/llm";

export interface LLMTrace {
  id: string;
  conversationId: number;
  userId: number;

  // Call metadata
  model: string;
  provider: "openai" | "gemini" | "anthropic" | "openrouter";
  timestamp: string;
  duration: number; // ms

  // Inputs/outputs
  messages: Message[];
  response: string;
  toolCalls?: Array<{ name: string; args: any }>;

  // Token usage
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;

  // Cost (calculated)
  estimatedCost: number; // USD

  // Quality metrics
  intent?: string;
  intentConfidence?: number;
  userApproved?: boolean;
  errorMessage?: string;

  // Performance
  firstTokenLatency?: number; // ms to first token
  tokensPerSecond?: number;
}

/**
 * Trace store (in-memory for dev, can be switched to database)
 */
const traceStore: LLMTrace[] = [];
const MAX_TRACES = 50000;

/**
 * Cost per 1M tokens (approximate)
 */
const TOKEN_COSTS = {
  "gemma-3-27b-free": { prompt: 0, completion: 0 }, // Free!
  "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
  "gpt-4o": { prompt: 2.50, completion: 10.00 },
  "claude-3.5-sonnet": { prompt: 3.00, completion: 15.00 },
} as const;

/**
 * Start tracing an LLM call
 */
export function startTrace(
  conversationId: number,
  userId: number,
  model: string,
  messages: Message[]
): { id: string; startTime: number } {
  const id = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const startTime = Date.now();

  console.log(`[LLM TRACE] Started ${id} - model=${model}`);

  return { id, startTime };
}

/**
 * End tracing and record results
 */
export function endTrace(
  traceId: string,
  startTime: number,
  conversationId: number,
  userId: number,
  model: string,
  messages: Message[],
  response: string,
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  },
  metadata?: {
    intent?: string;
    intentConfidence?: number;
    toolCalls?: Array<{ name: string; args: any }>;
    firstTokenLatency?: number;
    errorMessage?: string;
  }
): LLMTrace {
  const duration = Date.now() - startTime;

  // Calculate cost
  const modelCost = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] ||
    TOKEN_COSTS["gemma-3-27b-free"];

  const estimatedCost =
    (usage.promptTokens / 1_000_000) * modelCost.prompt +
    (usage.completionTokens / 1_000_000) * modelCost.completion;

  // Calculate tokens per second
  const tokensPerSecond =
    duration > 0 ? Math.round((usage.completionTokens / duration) * 1000) : 0;

  const trace: LLMTrace = {
    id: traceId,
    conversationId,
    userId,
    model,
    provider: getProvider(model),
    timestamp: new Date().toISOString(),
    duration,
    messages,
    response,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCost,
    tokensPerSecond,
    ...metadata,
  };

  // Store trace
  traceStore.push(trace);
  if (traceStore.length > MAX_TRACES) {
    traceStore.shift(); // Remove oldest
  }

  // Log summary
  console.log(
    `[LLM TRACE] Completed ${traceId} - ` +
    `${duration}ms, ${usage.totalTokens} tokens, ` +
    `$${estimatedCost.toFixed(4)}, ${tokensPerSecond} tok/s`
  );

  return trace;
}

/**
 * Update trace with user feedback
 */
export function updateTraceWithFeedback(
  traceId: string,
  userApproved: boolean
): void {
  const trace = traceStore.find(t => t.id === traceId);
  if (trace) {
    trace.userApproved = userApproved;
    console.log(
      `[LLM TRACE] Updated ${traceId} - userApproved=${userApproved}`
    );
  }
}

/**
 * Get trace statistics
 */
export function getTraceStats(options?: {
  userId?: number;
  conversationId?: number;
  model?: string;
  since?: Date;
}): {
  totalTraces: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
  avgTokensPerSecond: number;
  successRate: number;
  costByModel: Record<string, number>;
  tokensByModel: Record<string, number>;
} {
  let traces = traceStore;

  // Apply filters
  if (options?.userId) {
    traces = traces.filter(t => t.userId === options.userId);
  }
  if (options?.conversationId) {
    traces = traces.filter(t => t.conversationId === options.conversationId);
  }
  if (options?.model) {
    traces = traces.filter(t => t.model === options.model);
  }
  if (options?.since) {
    traces = traces.filter(t => t.timestamp > options.since!.toISOString());
  }

  // Calculate stats
  const totalTokens = traces.reduce((sum, t) => sum + t.totalTokens, 0);
  const totalCost = traces.reduce((sum, t) => sum + t.estimatedCost, 0);
  const avgDuration = traces.length > 0
    ? Math.round(traces.reduce((sum, t) => sum + t.duration, 0) / traces.length)
    : 0;
  const avgTokensPerSecond = traces.length > 0
    ? Math.round(
        traces.reduce((sum, t) => sum + (t.tokensPerSecond || 0), 0) / traces.length
      )
    : 0;

  // Success rate (traces without errors)
  const successCount = traces.filter(t => !t.errorMessage).length;
  const successRate = traces.length > 0
    ? Math.round((successCount / traces.length) * 100)
    : 0;

  // Cost/tokens by model
  const costByModel: Record<string, number> = {};
  const tokensByModel: Record<string, number> = {};

  traces.forEach(trace => {
    costByModel[trace.model] = (costByModel[trace.model] || 0) + trace.estimatedCost;
    tokensByModel[trace.model] = (tokensByModel[trace.model] || 0) + trace.totalTokens;
  });

  return {
    totalTraces: traces.length,
    totalTokens,
    totalCost,
    avgDuration,
    avgTokensPerSecond,
    successRate,
    costByModel,
    tokensByModel,
  };
}

/**
 * Export traces for analysis (JSON Lines format)
 */
export function exportTraces(since?: Date): string {
  const traces = since
    ? traceStore.filter(t => t.timestamp > since.toISOString())
    : traceStore;

  // JSON Lines format (one trace per line)
  return traces.map(t => JSON.stringify(t)).join("\n");
}

/**
 * Get provider from model name
 */
function getProvider(model: string): LLMTrace["provider"] {
  if (model.includes("gpt")) return "openai";
  if (model.includes("gemini") || model.includes("gemma")) return "gemini";
  if (model.includes("claude")) return "anthropic";
  return "openrouter";
}

/**
 * Get expensive traces (top N by cost)
 */
export function getExpensiveTraces(limit: number = 10): LLMTrace[] {
  return [...traceStore]
    .sort((a, b) => b.estimatedCost - a.estimatedCost)
    .slice(0, limit);
}

/**
 * Get slow traces (top N by duration)
 */
export function getSlowTraces(limit: number = 10): LLMTrace[] {
  return [...traceStore]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, limit);
}
