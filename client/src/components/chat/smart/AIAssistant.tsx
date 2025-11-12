/**
 * AI ASSISTANT - Interaktiv AI hjælper
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bot,
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Volume2,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface AIMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
  type: "text" | "suggestion" | "action" | "error";
  metadata?: Record<string, any>;
}

export interface AIAssistantData {
  status: "idle" | "thinking" | "speaking" | "error";
  capabilities: string[];
  currentContext?: string;
  suggestions: string[];
}

interface AIAssistantProps {
  data?: AIAssistantData;
  messages?: AIMessage[];
  onSendMessage?: (message: string) => void;
  onVoiceToggle?: () => void;
  onCapabilityToggle?: (capability: string) => void;
  onClearChat?: () => void;
}

export function AIAssistant({
  data,
  messages = [],
  onSendMessage,
  onVoiceToggle,
  onCapabilityToggle,
  onClearChat,
}: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    "email",
    "calendar",
    "invoices",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default AI assistant data
  const defaultData: AIAssistantData = {
    status: "idle",
    capabilities: [
      "email",
      "calendar",
      "invoices",
      "analytics",
      "automation",
      "support",
    ],
    currentContext: "Hjælper med daglige opgaver",
    suggestions: [
      "Hvordan kan jeg hjælpe dig i dag?",
      "Skal jeg oprette en ny faktura?",
      "Vil du se din kalender for i dag?",
      "Har du brug for hjælp til email management?",
    ],
  };

  const assistantData = data || defaultData;

  // Default messages
  const defaultMessages: AIMessage[] = [
    {
      id: "1",
      content:
        "Hej! Jeg er din AI assistent. Jeg kan hjælpe dig med emails, kalender, fakturaer og meget mere.",
      sender: "assistant",
      timestamp: "10:00",
      type: "text",
    },
    {
      id: "2",
      content: "Hvad kan jeg hjælpe dig med i dag?",
      sender: "assistant",
      timestamp: "10:01",
      type: "suggestion",
    },
  ];

  const chatMessages = messages.length > 0 ? messages : defaultMessages;

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      onSendMessage?.(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    setVoiceEnabled(!voiceEnabled);
    setIsListening(!isListening);
    onVoiceToggle?.();

    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setInput("Kan du hjælpe mig med at oprette en ny faktura?");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleCapabilityToggle = (capability: string) => {
    const updated = selectedCapabilities.includes(capability)
      ? selectedCapabilities.filter(c => c !== capability)
      : [...selectedCapabilities, capability];
    setSelectedCapabilities(updated);
    onCapabilityToggle?.(capability);
  };

  const getStatusColor = (status: AIAssistantData["status"]) => {
    switch (status) {
      case "idle":
        return "bg-gray-500";
      case "thinking":
        return "bg-blue-500";
      case "speaking":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: AIAssistantData["status"]) => {
    switch (status) {
      case "idle":
        return "Inaktiv";
      case "thinking":
        return "Tænker";
      case "speaking":
        return "Taler";
      case "error":
        return "Fejl";
      default:
        return status;
    }
  };

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case "email":
        return "📧";
      case "calendar":
        return "📅";
      case "invoices":
        return "📄";
      case "analytics":
        return "📊";
      case "automation":
        return "⚡";
      case "support":
        return "🎧";
      default:
        return "🔧";
    }
  };

  const getCapabilityLabel = (capability: string) => {
    switch (capability) {
      case "email":
        return "Email";
      case "calendar":
        return "Kalender";
      case "invoices":
        return "Fakturaer";
      case "analytics":
        return "Analytik";
      case "automation":
        return "Automatisering";
      case "support":
        return "Support";
      default:
        return capability;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">AI Assistant</h4>
              <p className="text-xs text-muted-foreground">
                Interaktiv AI hjælper
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(assistantData.status)}>
              {getStatusLabel(assistantData.status)}
            </Badge>
            <Button size="sm" variant="ghost">
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Capabilities:
          </label>
          <div className="flex flex-wrap gap-1">
            {assistantData.capabilities.map(capability => (
              <button
                key={capability}
                onClick={() => handleCapabilityToggle(capability)}
                className={cn(
                  "px-2 py-1 rounded text-xs transition-colors flex items-center gap-1",
                  selectedCapabilities.includes(capability)
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                <span>{getCapabilityIcon(capability)}</span>
                <span>{getCapabilityLabel(capability)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Context */}
        {assistantData.currentContext && (
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 dark:text-blue-400">
                {assistantData.currentContext}
              </span>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">Chat:</h5>
            <Button size="sm" variant="ghost" onClick={onClearChat}>
              Ryd chat
            </Button>
          </div>

          <div className="border rounded-lg bg-background p-3 h-64 overflow-y-auto">
            <div className="space-y-3">
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg",
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : message.type === "suggestion"
                          ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Forslag:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {assistantData.suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-xs"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv dit spørgsmål..."
              className="pr-20"
              disabled={assistantData.status === "thinking"}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceToggle}
                className={cn(
                  "h-7 w-7 p-0",
                  isListening ? "text-red-500" : "text-gray-500"
                )}
              >
                {isListening ? (
                  <MicOff className="w-3 h-3" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!input.trim() || assistantData.status === "thinking"}
                className="h-7 px-2"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {isListening && (
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-700 dark:text-red-400">
                  Lytter til stemme...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        {voiceEnabled && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 dark:text-blue-400">
                Stemmeassistent aktiv
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVoiceEnabled(false)}
            >
              <MicOff className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <MessageCircle className="w-3 h-3 mr-1" />
            Chat historik
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Hurtige handlinger
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <HelpCircle className="w-3 h-3 mr-1" />
            Hjælp
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-xs text-muted-foreground">
          AI Assistant er klar til at hjælpe • {selectedCapabilities.length}{" "}
          capabilities aktive
        </div>
      </div>
    </Card>
  );
}
