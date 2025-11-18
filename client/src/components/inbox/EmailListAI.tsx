/**
 * EmailListAI - AI-Enhanced Email List Component (Phase 2: Thread View)
 *
 * Enhanced email list with thread grouping for Shortwave-style conversations
 * - Groups emails by threadId into collapsible threads
 * - Lead scoring, source detection, and AI-powered prioritization
 * - Phase 1 improvements: Quick Actions, minimal badges, clean design
 * - Phase 2 improvements: Thread conversations, expand/collapse
 */

import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DollarSign,
  Target,
  Flame,
  TrendingUp,
  Mail,
  SortAsc,
  Search,
} from "lucide-react";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";

import EmailStickyActionBar from "./EmailStickyActionBar";
import EmailThreadGroup from "./EmailThreadGroup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import type { EmailThread } from "@/types/email-thread";
import type {
  EnhancedEmailMessage,
  SortOption,
  FilterSource,
  Density,
} from "@/types/enhanced-email";
import {
  groupEmailsByThread,
  searchThreads,
  calculateThreadStats,
} from "@/utils/thread-grouping";



// Types imported from enhanced-email.ts

interface EmailListAIProps {
  emails: EnhancedEmailMessage[];
  onEmailSelect: (email: EnhancedEmailMessage) => void;
  selectedThreadId: string | null;
  selectedEmails: Set<string>;
  onEmailSelectionChange: (threadIds: Set<string>) => void;
  density?: Density;
  isLoading?: boolean;
}

// Note: Helper functions moved to EmailThreadGroup component (Phase 2)

export default function EmailListAI({
  emails,
  onEmailSelect,
  selectedThreadId,
  selectedEmails,
  onEmailSelectionChange,
  density = "comfortable",
  isLoading = false,
}: EmailListAIProps) {
  const [sortBy, setSortBy] = useState<SortOption>("leadScore");
  const [filterSource, setFilterSource] = useState<FilterSource>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );

  const parentRef = useRef<HTMLDivElement>(null);

  // AI Analysis mutation for emails without analysis
  // DISABLED: Causes infinite loop - needs proper state management
  // const analyzeEmail = trpc.automation['analyzeEmail'].useMutation();

  // TODO: Re-enable AI analysis with proper state management to avoid infinite loop
  // useEffect(() => {
  //   emails.forEach(async (email) => {
  //     if (!email.aiAnalysis && email.body && email.from) {
  //       try {
  //         const result = await analyzeEmail.mutateAsync({
  //           from: email.from,
  //           subject: email.subject,
  //           body: email.body,
  //         });
  //
  //         // Update email with AI analysis (this would typically update state)
  //         console.log('AI Analysis for', email.threadId, result);
  //       } catch (error) {
  //         console.error('Failed to analyze email:', error);
  //       }
  //     }
  //   });
  // }, [emails, analyzeEmail]);

  // Phase 2: Group emails into threads
  const threads = useMemo(() => {
    // First group all emails into threads
    let groupedThreads = groupEmailsByThread(emails, {
      sortBy: sortBy === "leadScore" ? "leadScore" : "date",
      sortDirection: "desc",
    });

    // Apply source filter
    if (filterSource !== "all") {
      groupedThreads = groupedThreads.filter(
        thread => thread.source === filterSource
      );
    }

    // Apply search filter
    if (searchQuery) {
      groupedThreads = searchThreads(groupedThreads, searchQuery);
    }

    return groupedThreads;
  }, [emails, filterSource, searchQuery, sortBy]);

  // Virtual scrolling setup for threads
  const virtualizer = useVirtualizer({
    count: threads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "compact" ? 60 : 80),
    overscan: 5,
  });

  // Thread expansion handlers
  const toggleThread = useCallback((threadId: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  }, []);

  // Handle thread click (Phase 2: clicks on thread, not individual email)
  const handleThreadClick = useCallback(
    (thread: EmailThread, event: React.MouseEvent) => {
      // Select the latest message in the thread
      onEmailSelect(thread.latestMessage);
    },
    [onEmailSelect]
  );

  // Handle individual email selection within expanded thread
  const handleEmailInThreadClick = useCallback(
    (email: EnhancedEmailMessage) => {
      onEmailSelect(email);
    },
    [onEmailSelect]
  );

  // Get selected threads list for actionbar
  const selectedThreadsList = useMemo(() => {
    return threads.filter(thread => selectedEmails.has(thread.id));
  }, [threads, selectedEmails]);

  // Bulk action handlers
  const handleDeselectAll = useCallback(() => {
    onEmailSelectionChange(new Set());
  }, [onEmailSelectionChange]);

  const handleBulkReply = useCallback(() => {
    // TODO: Implement bulk reply logic
    console.log("Bulk reply to", selectedThreadsList.length, "threads");
    // For now, just select first thread for reply
    if (selectedThreadsList.length > 0) {
      onEmailSelect(selectedThreadsList[0].latestMessage);
    }
  }, [selectedThreadsList, onEmailSelect]);

  const handleBulkBook = useCallback(() => {
    // TODO: Open booking dialog with selected threads
    console.log("Bulk book for", selectedThreadsList.length, "threads");
  }, [selectedThreadsList]);

  const handleBulkCreateTask = useCallback(() => {
    // TODO: Create tasks from selected threads
    console.log("Create tasks for", selectedThreadsList.length, "threads");
  }, [selectedThreadsList]);

  const handleBulkLabel = useCallback(() => {
    // TODO: Open label dialog
    console.log("Label", selectedThreadsList.length, "threads");
  }, [selectedThreadsList]);

  const handleBulkArchive = useCallback(() => {
    // TODO: Archive selected threads
    console.log("Archive", selectedThreadsList.length, "threads");
    handleDeselectAll();
  }, [selectedThreadsList, handleDeselectAll]);

  // Get display name
  const getDisplayName = useCallback((email: string) => {
    return email.split("<")[0].trim().replace(/"/g, "");
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Phase 2: Intelligence summary based on threads
  const intelligenceSummary = useMemo(() => {
    const stats = calculateThreadStats(threads);
    const sourceCounts = emails.reduce(
      (acc, email) => {
        const source = email.aiAnalysis?.source || "unknown";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalValue: stats.totalValue,
      hotLeads: stats.hotLeadThreads,
      sourceCounts,
      totalEmails: threads.length, // Show thread count instead of email count
      totalMessages: stats.totalMessages,
      unreadThreads: stats.unreadThreads,
    };
  }, [threads, emails]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Intelligence Header */}
      <div className="border-b border-border/20 p-4 bg-muted/30">
        <div className="space-y-3">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Søg emails..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortBy(sortBy === "leadScore" ? "date" : "leadScore")
              }
              className="flex items-center gap-2"
            >
              <SortAsc className="w-4 h-4" />
              {sortBy === "leadScore"
                ? "Score"
                : sortBy === "value"
                  ? "Value"
                  : "Date"}
            </Button>
          </div>

          {/* Source Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterSource === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSource("all")}
            >
              All ({intelligenceSummary.totalEmails})
            </Button>
            <Button
              variant={filterSource === "rengoring_nu" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSource("rengoring_nu")}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Rengøring.nu ({intelligenceSummary.sourceCounts.rengoring_nu || 0}
              )
            </Button>
            <Button
              variant={filterSource === "direct" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSource("direct")}
            >
              <Mail className="w-3 h-3 mr-1" />
              Direct ({intelligenceSummary.sourceCounts.direct || 0})
            </Button>
          </div>

          {/* Intelligence Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-medium">
                {intelligenceSummary.hotLeads}
              </span>
              <span className="text-muted-foreground">Hot Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">
                {formatCurrency(intelligenceSummary.totalValue)}
              </span>
              <span className="text-muted-foreground">Est. Value</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {Math.round(
                  intelligenceSummary.totalValue /
                    Math.max(intelligenceSummary.totalEmails, 1)
                )}
              </span>
              <span className="text-muted-foreground">Avg Value</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Sticky ActionBar - only when threads selected (Phase 2.1) */}
      {selectedThreadsList.length > 0 && (
        <EmailStickyActionBar
          selectedThreads={selectedThreadsList}
          onReply={handleBulkReply}
          onBook={handleBulkBook}
          onCreateTask={handleBulkCreateTask}
          onLabel={handleBulkLabel}
          onArchive={handleBulkArchive}
          onDeselectAll={handleDeselectAll}
        />
      )}

      {/* Email List */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        ref={parentRef}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Phase 2: Render threads instead of flat emails */}
          {virtualizer.getVirtualItems().map(virtualRow => {
            const thread = threads[virtualRow.index];
            if (!thread) return null;

            const isSelected = selectedThreadId === thread.id;
            const isChecked = selectedEmails.has(thread.id);

            return (
              <div
                key={thread.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <EmailThreadGroup
                  thread={thread}
                  isSelected={isSelected}
                  isChecked={isChecked}
                  expanded={expandedThreads.has(thread.id)}
                  onClick={handleThreadClick}
                  onToggle={() => toggleThread(thread.id)}
                  onCheckboxChange={checked => {
                    const newSelection = new Set(selectedEmails);
                    if (checked) {
                      newSelection.add(thread.id);
                    } else {
                      newSelection.delete(thread.id);
                    }
                    onEmailSelectionChange(newSelection);
                  }}
                  onEmailSelect={handleEmailInThreadClick}
                  selectedEmails={selectedEmails}
                  density={density}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
