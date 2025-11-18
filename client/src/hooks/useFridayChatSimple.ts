/**
 * Simplified Friday Chat Hook - Clean Architecture
 * Working foundation without complex features
 */

import { useState, useCallback } from "react";

import { trpc } from "@/lib/trpc";

interface UseFridayChatSimpleOptions {
  conversationId?: number;
  context?: {
    selectedEmails?: string[];
    calendarEvents?: any[];
    searchQuery?: string;
  };
}

export function useFridayChatSimple({
  conversationId,
  context,
}: UseFridayChatSimpleOptions) {
  const utils = trpc.useUtils();

  // Basic message loading with tRPC
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = trpc.chat.getMessages.useQuery(
    {
      conversationId: conversationId || 0,
      limit: 20,
    },
    {
      enabled: !!conversationId,
    }
  );

  // Message sending with auto-refetch and optimistic updates
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onMutate: async variables => {
      // Cancel any outgoing refetches
      await utils.chat.getMessages.cancel({
        conversationId: conversationId || 0,
        limit: 20,
      });

      // Snapshot the previous value
      const previousMessages = utils.chat.getMessages.getData({
        conversationId: conversationId || 0,
        limit: 20,
      });

      // Optimistically update to the new value
      utils.chat.getMessages.setData(
        { conversationId: conversationId || 0, limit: 20 },
        old => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...old.messages,
              {
                id: Date.now(), // Temporary ID
                conversationId: conversationId || 0,
                role: "user" as const,
                content: variables.content,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
      );

      // Return context with previous value
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          { conversationId: conversationId || 0, limit: 20 },
          context.previousMessages
        );
      }
    },
    onSuccess: () => {
      // Invalidate and refetch messages to show AI response
      utils.chat.getMessages.invalidate({
        conversationId: conversationId || 0,
        limit: 20,
      });
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;

      try {
        await sendMessageMutation.mutateAsync({
          conversationId,
          content,
          context, // Send context to server
        });
        // Query will auto-refetch due to onSuccess invalidation
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [conversationId, sendMessageMutation, context]
  );

  return {
    messages: messagesData?.messages || [],
    isLoading: messagesLoading || sendMessageMutation.isPending,
    error: messagesError || sendMessageMutation.error,
    sendMessage,
  };
}
