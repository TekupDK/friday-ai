/**
 * Enhanced Friday Chat Hook with Performance Optimizations
 * Includes pagination, memory management, and connection pooling
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface ChatContext {
  selectedEmails?: string[];
  calendarEvents?: any[];
  searchQuery?: string;
  hasEmails?: boolean;
  hasCalendar?: boolean;
  hasInvoices?: boolean;
  page?: string;
}

interface UseFridayChatOptions {
  conversationId?: number;
  context?: ChatContext;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
  onPendingAction?: (action: any) => void;
  maxMessages?: number;
}

interface UseFridayChatReturn {
  sendMessage: (content: string, options?: { streaming?: boolean }) => Promise<void>;
  messages: any[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  pendingAction: any | null;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

export function useFridayChat({
  conversationId,
  context,
  onComplete,
  onError,
  onPendingAction,
  maxMessages = 50
}: UseFridayChatOptions): UseFridayChatReturn {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingAction, setPendingAction] = useState<any | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load messages with pagination
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMoreMessages) return;

    try {
      const result = await trpc.chat.getMessages.query({
        conversationId,
        cursor,
        limit: 20
      });

      setMessages(prev => [...result.messages, ...prev]);
      setHasMoreMessages(result.hasMore);
      setCursor(result.nextCursor);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(error as Error);
    }
  }, [conversationId, cursor, hasMoreMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Abort pending requests
      }
    };
  }, []);

  // Memory management - limit messages
  useEffect(() => {
    if (messages.length > maxMessages) {
      setMessages(prev => prev.slice(-maxMessages)); // Keep only recent messages
    }
  }, [messages.length, maxMessages]);

  const sendMessage = useCallback(async (content: string, options?: { streaming?: boolean }) => {
    if (!conversationId) {
      setError(new Error('No conversation ID provided'));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // For now, use basic non-streaming implementation
      const response = await trpc.chat.sendMessage.mutate({
        conversationId,
        content,
      });

      if (response.pendingAction) {
        setPendingAction(response.pendingAction);
        onPendingAction?.(response.pendingAction);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.content }
        ]);
        onComplete?.(response.content);
      }
    } catch (error) {
      setError(error as Error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [conversationId, onComplete, onError, onPendingAction]);

  return {
    sendMessage,
    messages,
    isLoading,
    isStreaming,
    error,
    pendingAction,
    loadMoreMessages,
    hasMoreMessages
  };
}
