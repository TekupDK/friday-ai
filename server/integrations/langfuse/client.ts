/**
 * Langfuse Client - LLM Observability Integration
 * 
 * Provides complete tracing and monitoring for all AI operations in Friday AI.
 * Self-hosted, zero cost, complete control.
 */

import { Langfuse } from 'langfuse';
import { ENV } from '../../_core/env';

// Singleton client instance
let langfuseClient: Langfuse | null = null;

/**
 * Get or create Langfuse client
 */
export function getLangfuseClient(): Langfuse | null {
  // Check if Langfuse is enabled
  if (!ENV.langfuseEnabled) {
    return null;
  }

  // Return existing client
  if (langfuseClient) {
    return langfuseClient;
  }

  // Validate configuration
  if (!ENV.langfusePublicKey || !ENV.langfuseSecretKey) {
    console.warn('[Langfuse] Missing API keys, tracing disabled');
    return null;
  }

  try {
    // Create new client
    langfuseClient = new Langfuse({
      publicKey: ENV.langfusePublicKey,
      secretKey: ENV.langfuseSecretKey,
      baseUrl: ENV.langfuseBaseUrl || 'http://localhost:3001',
      flushAt: 1, // Flush after 1 event (or use higher number for batching)
      flushInterval: 1000, // Flush every 1 second
      requestTimeout: 5000, // 5 second timeout
      enabled: ENV.langfuseEnabled,
    });

    console.log(`[Langfuse] ✅ Client initialized (${ENV.langfuseBaseUrl || 'http://localhost:3001'})`);
    
    return langfuseClient;
  } catch (error) {
    console.error('[Langfuse] Failed to initialize client:', error);
    return null;
  }
}

/**
 * Create a trace for an operation
 */
export function createTrace(params: {
  name: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}) {
  const client = getLangfuseClient();
  if (!client) return null;

  try {
    const trace = client.trace({
      name: params.name,
      userId: params.userId,
      sessionId: params.sessionId,
      metadata: params.metadata,
      tags: params.tags,
    });

    return trace;
  } catch (error) {
    console.error('[Langfuse] Failed to create trace:', error);
    return null;
  }
}

/**
 * Create a generation (LLM call) within a trace
 */
export function createGeneration(params: {
  name: string;
  model: string;
  input: any;
  output?: any;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, any>;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
  statusMessage?: string;
  startTime?: Date;
  endTime?: Date;
}) {
  const client = getLangfuseClient();
  if (!client) return null;

  try {
    const generation = client.generation({
      name: params.name,
      model: params.model,
      input: params.input,
      output: params.output,
      usage: params.usage ? {
        promptTokens: params.usage.promptTokens,
        completionTokens: params.usage.completionTokens,
        totalTokens: params.usage.totalTokens,
      } : undefined,
      metadata: params.metadata,
      level: params.level,
      statusMessage: params.statusMessage,
      startTime: params.startTime,
      endTime: params.endTime,
    });

    return generation;
  } catch (error) {
    console.error('[Langfuse] Failed to create generation:', error);
    return null;
  }
}

/**
 * Flush all pending events to Langfuse
 */
export async function flushLangfuse(): Promise<void> {
  const client = getLangfuseClient();
  if (!client) return;

  try {
    await client.flushAsync();
  } catch (error) {
    console.error('[Langfuse] Failed to flush:', error);
  }
}

/**
 * Shutdown Langfuse client gracefully
 */
export async function shutdownLangfuse(): Promise<void> {
  const client = getLangfuseClient();
  if (!client) return;

  try {
    await client.shutdownAsync();
    langfuseClient = null;
    console.log('[Langfuse] Client shutdown complete');
  } catch (error) {
    console.error('[Langfuse] Failed to shutdown:', error);
  }
}

/**
 * Wrapper function to trace any async operation
 */
export async function tracedOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: {
    userId?: string;
    sessionId?: string;
    tags?: string[];
    data?: Record<string, any>;
  }
): Promise<T> {
  const trace = createTrace({
    name: operationName,
    userId: metadata?.userId,
    sessionId: metadata?.sessionId,
    metadata: metadata?.data,
    tags: metadata?.tags,
  });

  const startTime = Date.now();

  try {
    const result = await operation();
    
    // Log success
    if (trace) {
      trace.update({
        output: result,
        metadata: {
          ...metadata?.data,
          duration: Date.now() - startTime,
          success: true,
        },
      });
    }

    return result;
  } catch (error) {
    // Log error
    if (trace) {
      trace.update({
        metadata: {
          ...metadata?.data,
          duration: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          level: 'ERROR',
          statusMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }

    throw error;
  } finally {
    // Ensure flush
    await flushLangfuse();
  }
}

// Export singleton client getter
export { getLangfuseClient as langfuse };
export default getLangfuseClient;
