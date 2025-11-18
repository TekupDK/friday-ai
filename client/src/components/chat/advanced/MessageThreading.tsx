/**
 * MESSAGE THREADING - Reply til specifikke beskeder
 */

import { CornerDownRight, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ThreadMessage {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

interface MessageThreadingProps {
  parentMessage: {
    id: string;
    content: string;
    author: string;
  };
  replies: ThreadMessage[];
  onReply: (content: string) => void;
  compact?: boolean;
}

export function MessageThreading({
  parentMessage,
  replies,
  onReply,
  compact = false,
}: MessageThreadingProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Reply Count Button */}
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(!showReplies)}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <CornerDownRight className="w-3 h-3" />
          {replies.length} {replies.length === 1 ? "svar" : "svar"}
        </Button>
      )}

      {/* Thread View */}
      {showReplies && (
        <div
          className={cn(
            "ml-8 space-y-2 pl-4 border-l-2 border-primary/20",
            "animate-in slide-in-from-left-2"
          )}
        >
          {replies.map(reply => (
            <div
              key={reply.id}
              className="p-3 rounded-lg bg-muted/50 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{reply.author}</span>
                <span className="text-xs text-muted-foreground">
                  {reply.timestamp.toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm">{reply.content}</p>
            </div>
          ))}

          {/* Reply Input */}
          <div className="flex gap-2">
            <Input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Skriv et svar..."
              className="h-9 text-sm"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <Button size="sm" onClick={handleSubmit}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Reply */}
      {!showReplies && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(true)}
          className="gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <CornerDownRight className="w-3 h-3" />
          Svar
        </Button>
      )}
    </div>
  );
}
