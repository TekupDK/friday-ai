/**
 * Server-Sent Events for Streaming AI Responses
 * Provides real-time streaming to frontend with proper error handling
 */

import { getFeatureFlags } from "./feature-flags";

export interface StreamEvent {
  type: "start" | "chunk" | "complete" | "error" | "action";
  data: any;
  timestamp: string;
  id?: string;
}

export interface StreamingOptions {
  conversationId: number;
  userId: number;
  messages: any[];
  context?: any;
  taskType?: string;
  correlationId?: string;
}

/**
 * Create streaming response using Server-Sent Events
 */
export async function createStreamingResponse(
  options: StreamingOptions,
  onEvent: (event: StreamEvent) => void
) {
  const {
    conversationId,
    userId,
    messages,
    context,
    taskType = "chat",
    correlationId,
  } = options;
  const flags = getFeatureFlags(userId);

  try {
    // Send start event
    onEvent({
      type: "start",
      data: {
        conversationId,
        model: "gemma-3-27b-free", // Will be enhanced with model routing
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // Build messages with context
    const fullMessages = [...messages];

    if (context) {
      const contextString = Object.entries(context)
        .filter(
          ([_, value]) =>
            value && (Array.isArray(value) ? value.length > 0 : true)
        )
        .map(([key, value]) => `${key.toUpperCase()}: ${JSON.stringify(value)}`)
        .join("\n");

      if (contextString) {
        fullMessages.unshift({
          role: "system",
          content: `<CONTEXT>\n${contextString}\n</CONTEXT>`,
        });
      }
    }

    // Use invokeLLM for non-streaming to get accurate token usage
    // For streaming, we'll need to capture usage from the final message
    // For now, use invokeLLM which provides accurate usage stats
    const { invokeLLM } = await import("./llm");
    const result = await invokeLLM({
      messages: fullMessages,
      model: "gemma-3-27b-free",
    });

    const content =
      typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0]?.message?.content
        : JSON.stringify(result.choices[0]?.message?.content || "");

    // Send content as a single chunk for compatibility
    onEvent({
      type: "chunk",
      data: {
        content: content,
        accumulated: content,
      },
      timestamp: new Date().toISOString(),
    });

    // Send completion event with actual usage from LLM response
    onEvent({
      type: "complete",
      data: {
        content: content,
        usage: result.usage
          ? {
              // ✅ FIXED: Get actual usage from LLM response
              promptTokens: result.usage.prompt_tokens,
              completionTokens: result.usage.completion_tokens,
              totalTokens: result.usage.total_tokens,
            }
          : {
              // Fallback if usage is not available
              promptTokens: 0,
              completionTokens: content.length,
              totalTokens: content.length,
            },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // ✅ SECURITY FIX: Use logger instead of console.error (redacts sensitive data)
    import("./logger").then(({ logger }) => {
      logger.error({ err: error }, "[Streaming] Streaming error");
    });
    onEvent({
      type: "error",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
        code: "STREAM_ERROR",
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Express handler for Server-Sent Events endpoint
 */
export function createSSEHandler(req: any, res: any) {
  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Send initial connection event
  res.write("event: connected\n");
  res.write(
    `data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    // ✅ SECURITY FIX: Use logger instead of console.log
    import("./logger").then(({ logger }) => {
      logger.debug("[SSE] Client disconnected");
    });
  });

  return res;
}

/**
 * Send event through SSE
 */
import type { Response } from "express";

export function sendSSEEvent(res: Response, event: StreamEvent) {
  const eventData = JSON.stringify(event);
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${eventData}\n\n`);
}

/**
 * Enhanced streaming with model routing
 */
export async function createStreamingResponseWithRouting(
  options: StreamingOptions,
  onEvent: (event: StreamEvent) => void
) {
  // Import model router to avoid circular dependency
  const { invokeLLMWithRouting } = await import("../model-router");

  const { taskType = "chat", ...restOptions } = options;

  try {
    onEvent({
      type: "start",
      data: {
        taskType,
        model: "auto", // Will be determined by routing
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // Use model routing for streaming
    const stream = await invokeLLMWithRouting(taskType as any, [], {
      stream: true,
      userId: options.userId,
    });

    let accumulatedContent = "";

    // Handle both streaming and non-streaming responses
    if (Symbol.asyncIterator in stream) {
      for await (const chunk of stream) {
        if (typeof chunk === "string") {
          accumulatedContent += chunk;

          onEvent({
            type: "chunk",
            data: {
              content: chunk,
              accumulated: accumulatedContent,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    } else {
      // Non-streaming response - treat as single chunk
      let content = "";
      if (
        typeof stream === "object" &&
        stream !== null &&
        "choices" in stream
      ) {
        const messageContent = stream.choices[0]?.message?.content;
        content =
          typeof messageContent === "string"
            ? messageContent
            : Array.isArray(messageContent)
              ? JSON.stringify(messageContent)
              : String(messageContent || "");
      } else {
        content = String(stream);
      }

      accumulatedContent = content;

      onEvent({
        type: "chunk",
        data: {
          content: content,
          accumulated: accumulatedContent,
        },
        timestamp: new Date().toISOString(),
      });
    }

    onEvent({
      type: "complete",
      data: {
        content: accumulatedContent,
        taskType,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // ✅ SECURITY FIX: Use logger instead of console.error (redacts sensitive data)
    import("./logger").then(({ logger }) => {
      logger.error({ err: error }, "[Streaming] Streaming with routing error");
    });
    onEvent({
      type: "error",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
        taskType,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
