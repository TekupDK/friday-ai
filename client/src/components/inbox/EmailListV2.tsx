/**
 * EmailListV2 - Modular Email List Component
 * 
 * Extracted from EmailTab for better maintainability and performance.
 * Handles virtual scrolling, email rendering, and selection logic.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, lazy } from "react";
import { UI_CONSTANTS } from "@/constants/business";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useRef } from "react";
import {
  Archive,
  CheckCircle2,
  Circle,
  Paperclip,
  Star,
  Trash2,
} from "lucide-react";

// Lazy load AI components for performance
const EmailAISummary = lazy(() => import("./EmailAISummary"));
const EmailLabelSuggestions = lazy(() => import("./EmailLabelSuggestions"));

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate?: number;
  body: string;
  snippet: string;
  unread: boolean;
  labels: string[];
  hasAttachment: boolean;
  sender: string;
}

interface EmailListV2Props {
  emails: EmailMessage[];
  onEmailSelect: (email: EmailMessage) => void;
  selectedThreadId: string | null;
  selectedEmails: Set<string>;
  onEmailSelectionChange: (threadIds: Set<string>) => void;
  density: 'comfortable' | 'compact';
  showAIFeatures: boolean;
  isLoading?: boolean;
}

export default function EmailListV2({
  emails,
  onEmailSelect,
  selectedThreadId,
  selectedEmails,
  onEmailSelectionChange,
  density,
  showAIFeatures,
  isLoading = false,
}: EmailListV2Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoized email data for virtual scrolling
  const virtualizedItems = useMemo(() => {
    return emails.map((email, index) => ({
      type: "email" as const,
      data: email,
      index,
      key: email.threadId,
    }));
  }, [emails]);

  // Virtual scrolling configuration
  const virtualizer = useVirtualizer({
    count: virtualizedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => density === 'compact' ? 60 : 80,
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  // Handle email selection with performance optimization
  const handleEmailClick = useCallback((email: EmailMessage, event: React.MouseEvent) => {
    const checkbox = (event.target as HTMLElement).closest('input[type="checkbox"]');
    
    if (checkbox) {
      event.stopPropagation();
      // Handle checkbox selection
      const newSelection = new Set(selectedEmails);
      if (newSelection.has(email.threadId)) {
        newSelection.delete(email.threadId);
      } else {
        newSelection.add(email.threadId);
      }
      onEmailSelectionChange(newSelection);
    } else {
      // Handle email selection
      onEmailSelect(email);
    }
  }, [selectedEmails, onEmailSelect, onEmailSelectionChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, email: EmailMessage) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEmailSelect(email);
    }
  }, [onEmailSelect]);

  // Memoized display name function
  const getDisplayName = useCallback((email: string) => {
    return email.split('<')[0].trim().replace(/"/g, '');
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: UI_CONSTANTS.DEFAULT_PAGE_SIZE }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted/30" />
          <p className="text-sm text-muted-foreground">Ingen emails fundet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden relative nice-scrollbar"
      ref={parentRef}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const item = virtualizedItems[virtualRow.index];
          if (!item || item.type !== "email") return null;

          const email = item.data;
          const isSelected = selectedThreadId === email.threadId;
          const isKeyboardSelected = false; // TODO: Add keyboard navigation state

          return (
            <div
              key={email.threadId}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={`group border-b border-border/20 transition-colors ${
                isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
              }`}
            >
              <div
                className={`p-3 cursor-pointer ${
                  density === 'compact' ? 'py-2' : 'py-3'
                }`}
                onClick={(e) => handleEmailClick(email, e)}
                onKeyDown={(e) => handleKeyDown(e, email)}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox for multi-select */}
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedEmails.has(email.threadId)}
                      onClick={e => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {density === 'compact' ? (
                      // Compact layout
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {email.unread && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <button
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-sm text-foreground shrink-0 hover:underline hover:text-primary transition-colors"
                          >
                            {getDisplayName(email.from || email.sender)}
                          </button>
                          <span className="text-muted-foreground/70 text-sm">•</span>
                          <h3 className="text-sm text-foreground/90 truncate">
                            {email.subject}
                          </h3>
                          {email.hasAttachment && (
                            <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground/70 whitespace-nowrap tabular-nums">
                            {new Date(email.internalDate || email.date).toLocaleString("da-DK", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Comfortable layout
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          {email.unread && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                          <button
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-sm text-foreground hover:underline hover:text-primary transition-colors"
                          >
                            {getDisplayName(email.from || email.sender)}
                          </button>
                          <span className="text-muted-foreground/70 text-xs">
                            {new Date(email.internalDate || email.date).toLocaleString("da-DK", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h3 className="text-sm text-foreground/90 mb-1">
                          {email.subject}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">
                          {email.snippet}
                        </p>
                      </>
                    )}

                    {/* Labels */}
                    {email.labels && email.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {email.labels.slice(0, 3).map(label => (
                          <Badge key={label} variant="outline" className="text-[10px] h-4 px-1.5 py-0 border-border/40">
                            {label}
                          </Badge>
                        ))}
                        {email.labels.length > 3 && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 border-border/40">
                            +{email.labels.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* AI Features */}
                    {showAIFeatures && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        <Suspense fallback={<div className="h-3 bg-muted/40 rounded w-3/4" />}>
                          <EmailAISummary
                            threadId={email.threadId || email.id}
                            collapsed={!isKeyboardSelected}
                            className="text-xs"
                          />
                        </Suspense>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
