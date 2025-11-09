/**
 * EmailThreadGroup - Thread Conversation Component (Phase 2)
 * 
 * Groups related emails by threadId for Shortwave-style conversation view
 * - Collapsible thread with expand/collapse
 * - Shows message count, latest message, and thread summary
 * - Integrates Phase 1 improvements (Quick Actions, lead score badges)
 * - Smooth animations and hover effects
 */

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { EnhancedEmailMessage } from "@/types/enhanced-email";
import type { EmailThread } from "@/types/email-thread";
import EmailQuickActions from "./EmailQuickActions";
import {
  Paperclip,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronDown,
  Flame,
  TrendingUp,
  Target,
  Circle,
} from "lucide-react";

// Lead score badge configuration (Phase 2.1: Simplified from 4 → 2 types)
// Only show badges for important leads (score >= 70)
// Solid colors (no 3-shade system) for cleaner visual
const getLeadScoreConfig = (score: number) => {
  if (score >= 80) {
    // 🔥 HOT (solid red, high impact)
    return { 
      color: 'bg-red-500 text-white hover:bg-red-600 transition-colors', 
      icon: Flame, 
      label: 'Hot' 
    };
  }
  if (score >= 70) {
    // ⚡ WARM (solid amber, medium-high priority)
    return { 
      color: 'bg-amber-500 text-white hover:bg-amber-600 transition-colors', 
      icon: TrendingUp, 
      label: 'Warm' 
    };
  }
  // ✅ NO badge for scores < 70 (reduces clutter!)
  return null;
};

interface EmailThreadGroupProps {
  thread: EmailThread;
  isSelected: boolean;
  isChecked: boolean;
  expanded?: boolean;
  onClick: (thread: EmailThread, event: React.MouseEvent) => void;
  onToggle?: () => void;
  onCheckboxChange: (checked: boolean) => void;
  onEmailSelect?: (email: EnhancedEmailMessage) => void;
  selectedEmails?: Set<string>;
  density?: 'compact' | 'comfortable';
}

export default function EmailThreadGroup({
  thread,
  isSelected,
  isChecked,
  expanded = false,
  onClick,
  onToggle,
  onCheckboxChange,
  onEmailSelect,
  selectedEmails = new Set(),
  density = 'comfortable',
}: EmailThreadGroupProps) {
  const { latestMessage, messageCount, unreadCount, hasAttachments, maxLeadScore } = thread;
  const leadScoreConfig = maxLeadScore >= 70 ? getLeadScoreConfig(maxLeadScore) : null;
  
  // Get display name from email (from Phase 1)
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
    if (messageCount <= 1) return null;
    
    const senders = new Set(thread.messages.map(m => getDisplayName(m.from)));
    if (senders.size > 1) {
      return `Samtale med ${senders.size} personer`;
    }
    return `${messageCount} beskeder`;
  }, [thread.messages, messageCount]);
  
  // Handle expand/collapse toggle
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };
  
  return (
    <div
      className={`border-b border-border/20 transition-colors ${
        isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
      }`}
    >
      {/* Thread Header - Always visible (Phase 2.1: improved spacing) */}
      <div
        className={`group p-4 cursor-pointer ${
          density === 'compact' ? 'py-2' : 'py-4'
        }`}
        onClick={(e) => onClick(thread, e)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Icon (if multi-message thread) */}
          {messageCount > 1 && onToggle && (
            <button
              onClick={handleToggle}
              className="shrink-0 pt-1 hover:bg-muted/50 rounded p-0.5 transition-colors"
              aria-label={expanded ? "Collapse thread" : "Expand thread"}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          
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
            {/* Header Row - Shortwave-inspired (Phase 2.1: more spacing) */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Message Count Badge (if thread) */}
                {messageCount > 1 && (
                  <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {messageCount}
                  </Badge>
                )}
                
                {/* Unread indicator */}
                {latestMessage.unread && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                )}
                
                {/* Sender name (Phase 2.1: bigger, bolder, better hierarchy) */}
                <span className={`font-semibold text-base leading-relaxed shrink-0 ${
                  latestMessage.unread ? 'text-foreground' : 'text-foreground/80'
                }`}>
                  {getDisplayName(latestMessage.from || latestMessage.sender)}
                </span>
                
                {/* Attachment icon */}
                {hasAttachments && (
                  <Paperclip className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                {/* Timestamp (Phase 2.1: simplified color) */}
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                  {formatTime(latestMessage.internalDate || latestMessage.date)}
                </span>
                
                {/* Hot Lead Badge - Phase 2.1: Simplified (solid color, no border) */}
                {leadScoreConfig && (
                  <Badge className={`shrink-0 ${leadScoreConfig.color} text-xs font-semibold border-0 shadow-sm`}>
                    <leadScoreConfig.icon className="w-3 h-3 mr-1" />
                    {maxLeadScore}
                  </Badge>
                )}
                
                {/* Quick Actions - Phase 1 integration (hover-activated) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <EmailQuickActions
                    threadId={thread.id}
                    isStarred={thread.isStarred}
                    isRead={unreadCount === 0}
                    onArchive={() => console.log('Archive thread:', thread.id)}
                    onStar={() => console.log('Star thread:', thread.id)}
                    onDelete={() => console.log('Delete thread:', thread.id)}
                    onSnooze={(threadId, until) => console.log('Snooze thread:', threadId, until)}
                    onMarkAsRead={() => console.log('Mark read:', thread.id)}
                    onMarkAsUnread={() => console.log('Mark unread:', thread.id)}
                  />
                </div>
              </div>
            </div>
            
            {/* Subject Row (Phase 2.1: normal weight, more space, line-height) */}
            <h3 className={`text-sm leading-relaxed mb-2 truncate ${
              latestMessage.unread ? 'font-semibold text-foreground' : 'font-normal text-foreground/80'
            }`}>
              {latestMessage.subject}
            </h3>
            
            {/* Thread Summary (only for multi-message threads) */}
            {threadSummary && (
              <div className="flex items-center gap-1 text-xs leading-relaxed text-muted-foreground mb-1.5">
                <Clock className="w-3 h-3" />
                <span>{threadSummary}</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">
                    {unreadCount} ulæst
                  </Badge>
                )}
              </div>
            )}
            
            {/* Snippet (only in comfortable mode when collapsed) (Phase 2.1: line-height) */}
            {density === 'comfortable' && !expanded && (
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {latestMessage.snippet}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Thread Messages - Smooth animation */}
      {expanded && messageCount > 1 && (
        <div 
          className="border-t border-border/10 bg-muted/20 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: expanded ? `${messageCount * 80}px` : '0px',
          }}
        >
          <div className="p-2 pl-12 space-y-1">
            {/* Show all messages except the latest (already shown in header) */}
            {thread.messages.slice(0, -1).reverse().map((message, index) => (
              <div
                key={message.id}
                className="group/message p-2 rounded border border-border/20 bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onEmailSelect?.(message);
                }}
              >
                <div className="flex items-start gap-2">
                  {message.unread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs leading-relaxed shrink-0 ${
                        message.unread ? 'font-medium text-foreground' : 'text-foreground/70'
                      }`}>
                        {getDisplayName(message.from || message.sender)}
                      </span>
                      
                      <span className="text-xs leading-relaxed text-muted-foreground whitespace-nowrap tabular-nums ml-auto">
                        {formatTime(message.internalDate || message.date)}
                      </span>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {message.snippet}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
