/**
 * MESSAGE REACTIONS - Emoji reactions på beskeder
 */

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  compact?: boolean;
}

const QUICK_REACTIONS = ["👍", "❤️", "😊", "🎉", "🔥", "👀"];

export function MessageReactions({
  messageId,
  reactions,
  onReact,
  onRemoveReaction,
  compact = false,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string, userReacted: boolean) => {
    if (userReacted) {
      onRemoveReaction(emoji);
    } else {
      onReact(emoji);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing Reactions */}
      {reactions.map((reaction, idx) => (
        <Button
          key={idx}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-1 transition-all",
            reaction.userReacted &&
              "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
          )}
          onClick={() =>
            handleReactionClick(reaction.emoji, reaction.userReacted)
          }
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </Button>
      ))}

      {/* Add Reaction */}
      {!showPicker && (
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={() => setShowPicker(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="text-lg">+😊</span>
        </Button>
      )}

      {/* Quick Picker */}
      {showPicker && (
        <div className="flex gap-1 animate-in fade-in zoom-in-95">
          {QUICK_REACTIONS.map(emoji => (
            <Button
              key={emoji}
              variant="ghost"
              size={compact ? "sm" : "default"}
              onClick={() => {
                onReact(emoji);
                setShowPicker(false);
              }}
              className="hover:scale-125 transition-transform"
            >
              {emoji}
            </Button>
          ))}
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={() => setShowPicker(false)}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}
