/**
 * AI Assistant Panel V2 - Friday AI Production Ready
 * 
 * Ultra-clean interface with OpenRouter + Gemma 3 27B Free
 * Context-aware responses for Rendetalje business operations
 */

import { memo, useState, useEffect } from "react";
import ShortWaveChatPanel from "@/components/chat/ShortWaveChatPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trpc } from "@/lib/trpc";

const AIAssistantPanelV2 = memo(function AIAssistantPanelV2() {
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  
  // Auto-create conversation on mount
  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (newConv) => {
      setConversationId(newConv.id);
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
    }
  });

  useEffect(() => {
    // Create conversation only once when component mounts
    createConversation.mutate({ title: "Friday AI Chat" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - run once on mount

  // TODO: Add real context when EmailContext is available
  const context = {
    selectedEmails: [],
    searchQuery: undefined,
  };

  // Show loading state while creating conversation
  if (!conversationId && createConversation.isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Starting Friday AI...</div>
      </div>
    );
  }

  // Show error state if conversation creation failed
  if (createConversation.isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-destructive">
          Failed to start chat. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full bg-background">
        {/* Friday AI Chat with Context */}
        <ShortWaveChatPanel 
          context={context} 
          conversationId={conversationId}
        />
      </div>
    </ErrorBoundary>
  );
});

export default AIAssistantPanelV2;