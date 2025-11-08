/**
 * EmailThreadGroup - Thread Grouping Component
 * 
 * Groups related emails by threadId for better conversation view
 * Shows message count, latest message, and thread summary
 * 
 * Inspired by Shortwave's thread view
 */

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { EnhancedEmailMessage } from "@/types/enhanced-email";
import { CategoryBadge } from "@/components/email-intelligence/CategoryBadge";
import { PriorityIndicator } from "@/components/email-intelligence/PriorityIndicator";
import {
  Paperclip,
  MessageSquare,
  Clock,
} from "lucide-react";

export interface EmailThread {
  threadId: string;
  messages: EnhancedEmailMessage[];
  latest: EnhancedEmailMessage;
  count: number;
  unreadCount: number;
  hasAttachment: boolean;
}

interface EmailThreadGroupProps {
  thread: EmailThread;
  isSelected: boolean;
  isChecked: boolean;
  onClick: (thread: EmailThread, event: React.MouseEvent) => void;
  onCheckboxChange: (checked: boolean) => void;
  density?: 'compact' | 'comfortable';
  intelligence?: {
    category?: { category: string; subcategory: string | null; confidence: number };
    priority?: { level: string; score: number; reasoning: string | null };
  };
}

export default function EmailThreadGroup({
  thread,
  isSelected,
  isChecked,
  onClick,
  onCheckboxChange,
  density = 'comfortable',
  intelligence,
}: EmailThreadGroupProps) {
  const { latest, count, unreadCount, hasAttachment } = thread;
  
  // Get display name from email
  const getDisplayName = (email: string) => {
    return email.split('<')[0].trim().replace(/"/g, '');
  };
  
  // Format timestamp
  const formatTime = (date: string | number) => {
    return new Date(date).toLocaleString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Thread summary for multi-message threads
  const threadSummary = useMemo(() => {
    if (count <= 1) return null;
    
    const senders = new Set(thread.messages.map(m => getDisplayName(m.from)));
    if (senders.size > 1) {
      return `Samtale med ${senders.size} personer`;
    }
    return `${count} beskeder`;
  }, [thread.messages, count]);
  
  return (
    <div
      className={`group border-b border-border/20 transition-colors ${
        isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
      }`}
    >
      <div
        className={`p-3 cursor-pointer ${
          density === 'compact' ? 'py-2' : 'py-3'
        }`}
        onClick={(e) => onClick(thread, e)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isChecked}
              onCheckedChange={onCheckboxChange}
              onClick={e => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center gap-2 mb-1">
              {/* Message Count (if thread) */}
              {count > 1 && (
                <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {count}
                </Badge>
              )}
              
              {/* Unread indicator */}
              {latest.unread && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
              
              {/* Sender name */}
              <button
                onClick={e => e.stopPropagation()}
                className="font-medium text-sm text-foreground hover:underline hover:text-primary transition-colors"
              >
                {getDisplayName(latest.from || latest.sender)}
              </button>
              
              {/* Category Badge */}
              {intelligence?.category && (
                <div className="shrink-0">
                  <CategoryBadge
                    category={intelligence.category.category}
                    confidence={intelligence.category.confidence}
                    className="h-5 text-xs"
                  />
                </div>
              )}
              
              {/* Priority Indicator */}
              {intelligence?.priority && (
                <div className="shrink-0">
                  <PriorityIndicator
                    level={intelligence.priority.level}
                    score={intelligence.priority.score}
                    className="h-5 text-xs"
                  />
                </div>
              )}
              
              {/* Attachment icon */}
              {hasAttachment && (
                <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
              
              {/* Timestamp */}
              <span className="ml-auto text-xs text-muted-foreground/70 whitespace-nowrap tabular-nums shrink-0">
                {formatTime(latest.internalDate || latest.date)}
              </span>
            </div>
            
            {/* Subject Row */}
            <h3 className={`text-sm mb-1 truncate ${
              latest.unread ? 'font-semibold text-foreground' : 'text-foreground/90'
            }`}>
              {latest.subject}
            </h3>
            
            {/* Thread Summary */}
            {threadSummary && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span>{threadSummary}</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">
                    {unreadCount} ulæst
                  </Badge>
                )}
              </div>
            )}
            
            {/* Snippet */}
            {density === 'comfortable' && (
              <p className="text-xs text-muted-foreground/70 line-clamp-2">
                {latest.snippet}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
