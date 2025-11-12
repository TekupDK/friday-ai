/**
 * CHAT MESSAGE - Opgraderet chat besked komponent
 * Moderne bubble design med avatars, reactions, og animations
 */

import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface ChatMessageProps {
  type: "user" | "ai" | "system";
  content: string;
  timestamp?: Date;
  status?: "sending" | "sent" | "error";
  showAvatar?: boolean;
  showReactions?: boolean;
  model?: string;
  onCopy?: () => void;
  onReaction?: (reaction: "up" | "down") => void;
}

export function ChatMessage({
  type,
  content,
  timestamp,
  status = "sent",
  showAvatar = true,
  showReactions = false,
  model,
  onCopy,
  onReaction,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type: "up" | "down") => {
    setReaction(type);
    onReaction?.(type);
  };

  if (type === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-muted/50 text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  const isUser = type === "user";

  return (
    <div
      className={cn(
        "group flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-gray-600 dark:bg-gray-700 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              {status === "sending" && (
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3">
                  <div className="w-full h-full rounded-full bg-yellow-500 animate-pulse" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}
      >
        {/* Model Badge */}
        {!isUser && model && (
          <Badge variant="outline" className="text-xs px-2 py-0">
            {model}
          </Badge>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-md",
            "transition-all duration-200",
            isUser
              ? "bg-linear-to-r from-blue-500 to-purple-600 text-white"
              : "bg-white dark:bg-slate-800 border border-border",
            status === "error" && "border-red-500",
            "group-hover:shadow-lg"
          )}
        >
          <p
            className={cn(
              "text-sm whitespace-pre-wrap break-words",
              !isUser && "text-foreground"
            )}
          >
            {content}
          </p>

          {/* Status indicator for sending */}
          {status === "sending" && isUser && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div
          className={cn(
            "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          {/* Timestamp */}
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {/* Copy Button */}
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}

          {/* Reactions */}
          {showReactions && !isUser && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6", reaction === "up" && "text-green-500")}
                onClick={() => handleReaction("up")}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6", reaction === "down" && "text-red-500")}
                onClick={() => handleReaction("down")}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {status === "error" && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <span>Kunne ikke sende besked</span>
            <Button variant="ghost" size="sm" className="h-5 text-xs">
              Prøv igen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
