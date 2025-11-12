/**
 * Streaming Chat Hook
 * Handles Server-Sent Events for real-time AI responses
 */

import { useState, useCallback, useEffect, useRef } from "react";

interface StreamingChatOptions {
  conversationId: number;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
  onAction?: (action: any) => void;
}

interface StreamingState {
  isConnected: boolean;
  isStreaming: boolean;
  accumulatedContent: string;
  error: string | null;
  currentChunk: string | null;
  pendingAction: any | null;
}

export function useStreamingChat(options: StreamingChatOptions) {
  const [state, setState] = useState<StreamingState>({
    isConnected: false,
    isStreaming: false,
    accumulatedContent: "",
    error: null,
    currentChunk: null,
    pendingAction: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = useCallback(
    (content: string, context?: any) => {
      // Clean up previous connection
      stopStreaming();

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        isStreaming: true,
        accumulatedContent: "",
        error: null,
        currentChunk: null,
        pendingAction: null,
      }));

      try {
        // Create EventSource connection
        const url = new URL("/api/chat/stream", window.location.origin);
        url.searchParams.set(
          "conversationId",
          options.conversationId.toString()
        );
        url.searchParams.set("content", content);

        if (context) {
          url.searchParams.set("context", JSON.stringify(context));
        }

        eventSourceRef.current = new EventSource(url.toString());

        eventSourceRef.current.onopen = () => {
          setState(prev => ({ ...prev, isConnected: true }));
          console.log("🔗 Streaming connection established");
        };

        eventSourceRef.current.onmessage = event => {
          try {
            const streamEvent = JSON.parse(event.data);

            switch (streamEvent.type) {
              case "start":
                console.log("🚀 Streaming started:", streamEvent.data);
                break;

              case "chunk":
                setState(prev => ({
                  ...prev,
                  currentChunk: streamEvent.data.content,
                  accumulatedContent: streamEvent.data.accumulated,
                }));

                options.onChunk?.(streamEvent.data.content);
                break;

              case "complete":
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  currentChunk: null,
                }));

                options.onComplete?.(streamEvent.data.content);
                stopStreaming();
                break;

              case "action":
                setState(prev => ({
                  ...prev,
                  pendingAction: streamEvent.data,
                }));

                options.onAction?.(streamEvent.data);
                break;

              case "error":
                const errorMessage =
                  streamEvent.data.error || "Unknown streaming error";
                setState(prev => ({
                  ...prev,
                  error: errorMessage,
                  isStreaming: false,
                }));

                options.onError?.(errorMessage);
                stopStreaming();
                break;

              default:
                console.log("Unknown stream event:", streamEvent);
            }
          } catch (error) {
            console.error("Failed to parse stream event:", error);
            setState(prev => ({
              ...prev,
              error: "Failed to parse server response",
              isStreaming: false,
            }));
          }
        };

        eventSourceRef.current.onerror = error => {
          console.error("Streaming error:", error);
          setState(prev => ({
            ...prev,
            error: "Connection to server lost",
            isConnected: false,
            isStreaming: false,
          }));

          options.onError?.("Connection to server lost");
          stopStreaming();
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start streaming";
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isStreaming: false,
        }));

        options.onError?.(errorMessage);
      }
    },
    [options]
  );

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isStreaming: false,
      currentChunk: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    stopStreaming();
    setState({
      isConnected: false,
      isStreaming: false,
      accumulatedContent: "",
      error: null,
      currentChunk: null,
      pendingAction: null,
    });
  }, [stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]); // Cleanup streaming connection on unmount

  return {
    startStreaming,
    stopStreaming,
    clearError,
    reset,
    state,
    // Convenience getters
    isConnected: state.isConnected,
    isStreaming: state.isStreaming,
    accumulatedContent: state.accumulatedContent,
    currentChunk: state.currentChunk,
    error: state.error,
    pendingAction: state.pendingAction,
  };
}

/**
 * Fallback hook for environments where SSE is not available
 */
export function useFallbackStreaming(options: StreamingChatOptions) {
  const [state, setState] = useState({
    isStreaming: false,
    content: "",
    error: null as string | null,
  });

  const simulateStreaming = useCallback(
    async (content: string) => {
      setState(prev => ({ ...prev, isStreaming: true, error: null }));

      try {
        // Simulate streaming by breaking content into chunks
        const words = content.split(" ");
        let accumulated = "";

        for (const word of words) {
          accumulated += (accumulated ? " " : "") + word;
          setState(prev => ({ ...prev, content: accumulated }));

          options.onChunk?.(word);
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
        }

        setState(prev => ({ ...prev, isStreaming: false }));
        options.onComplete?.(accumulated);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Streaming failed";
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isStreaming: false,
        }));
        options.onError?.(errorMessage);
      }
    },
    [options]
  );

  return {
    simulateStreaming,
    state,
    isStreaming: state.isStreaming,
    content: state.content,
    error: state.error,
  };
}
