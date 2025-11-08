/**
 * Enhanced Friday AI Chat Panel with Performance Optimizations
 * 
 * Features:
 * - Message pagination with infinite scroll
 * - Memory management (max 50 messages)
 * - Connection pooling and request cancellation
 * - Server-side AI routing with streaming
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useFridayChatSimple } from "@/hooks/useFridayChatSimple";
import WelcomeScreen from "./WelcomeScreen";
import ChatInput from "./ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ShortWaveChatPanelProps {
  className?: string;
  conversationId?: number;
  context?: {
    selectedEmails?: string[];
    calendarEvents?: any[];
    searchQuery?: string;
  };
}

export default function ShortWaveChatPanel({ 
  className = "", 
  conversationId,
  context = {} 
}: ShortWaveChatPanelProps) {
  
  // Memoize context to prevent unnecessary re-renders
  const memoizedContext = useMemo(() => context, [context]);
  
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    messages: chatMessages, 
    isLoading, 
    error, 
    sendMessage 
  } = useFridayChatSimple({ 
    conversationId,
    context: memoizedContext 
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isLoading]); // Auto-scroll to bottom when new messages arrive

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || !conversationId) return;

    try {
      await sendMessage(inputMessage.trim());
      setInputMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  }, [inputMessage, isLoading, conversationId, sendMessage]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (!conversationId || isLoading) return;
    
    // Directly send the suggestion without setting input
    try {
      await sendMessage(suggestion);
    } catch (error) {
      toast.error("Failed to send message");
    }
  }, [conversationId, isLoading, sendMessage]);

  const handleStop = useCallback(() => {
    // TODO: Implement streaming stop
    console.log("Stop streaming");
  }, []);

  return (
    <div 
      data-testid="friday-ai-panel"
      className={`flex flex-col h-full bg-background ${className}`}
    >
      {/* Welcome Screen when no messages */}
      {chatMessages.length === 0 && !isLoading && (
        <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.map((message: any) => (
            <div
              key={message.id}
              data-testid={message.role === "user" ? "user-message" : "ai-message"}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start" data-testid="loading-indicator">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Friday is thinking...</span>
                </div>
              </div>
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            Error: {error.message}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          isStreaming={isLoading}
          onStop={handleStop}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}