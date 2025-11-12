/**
 * EmailTabV2 - Modular Email Interface
 *
 * Refactored from monolithic EmailTab (2318 lines) to modular architecture.
 * Each component has a single responsibility and can be tested independently.
 *
 * Architecture:
 * - EmailSearchV2: Search and filtering
 * - EmailBulkActionsV2: Bulk operations
 * - EmailListV2: Virtual scrolling and email rendering
 * - EmailComposerV2: Reply/forward/compose (future)
 * - EmailAIV2: AI features (future)
 */

import { useState, useCallback, useMemo } from "react";
import { useEmailContext } from "@/contexts/EmailContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useEmailKeyboardShortcuts } from "@/hooks/useEmailKeyboardShortcuts";
import { trpc } from "@/lib/trpc";
import { UI_CONSTANTS } from "@/constants/business";
import EmailSearchV2, { type FolderType } from "./EmailSearchV2";
import EmailBulkActionsV2, { type BulkAction } from "./EmailBulkActionsV2";
import EmailListV2, { type EmailMessage } from "./EmailListV2";
import EmailListAI from "./EmailListAI";
import EmailSplits, { type SplitId } from "./EmailSplits";
import type { EnhancedEmailMessage } from "@/types/enhanced-email";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailTabV2Props {
  // Configuration
  showAIFeatures?: boolean;
  density?: "comfortable" | "compact";
  maxResults?: number;
  useAIEnhancedList?: boolean; // New prop to enable AI features
}

export default function EmailTabV2({
  showAIFeatures = true,
  density = "compact",
  maxResults = UI_CONSTANTS.DEFAULT_PAGE_SIZE,
  useAIEnhancedList = true, // Enable AI by default
}: EmailTabV2Props) {
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<FolderType>("inbox");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeSplit, setActiveSplit] = useState<SplitId>("all");

  // Context integration
  const emailContext = useEmailContext();
  const rateLimit = useRateLimit();

  // Build query for API
  const inboxQuery = useMemo(() => {
    let query = "";

    // Folder mapping
    const folderQueries = {
      inbox: "in:inbox",
      sent: "in:sent",
      archive: "-in:inbox",
      starred: "is:starred",
    };
    query = folderQueries[selectedFolder];

    // Add label filters
    if (selectedLabels.length > 0) {
      const labelQuery = selectedLabels
        .map(label => `label:${label}`)
        .join(" ");
      query = query ? `${query} ${labelQuery}` : labelQuery;
    }

    // Add search query
    if (searchQuery.trim()) {
      query = query ? `${query} ${searchQuery}` : searchQuery;
    }

    return query || "in:inbox";
  }, [selectedFolder, selectedLabels, searchQuery]);

  // API call with optimized configuration
  const {
    data: emailData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = trpc.inbox.email.listPaged.useQuery(
    {
      maxResults: searchQuery.trim() ? UI_CONSTANTS.MAX_PAGE_SIZE : maxResults,
      query: inboxQuery,
      pageToken: undefined,
    },
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      staleTime: UI_CONSTANTS.STALE_TIME,
      gcTime: UI_CONSTANTS.GC_TIME,
      retry: (failureCount: number, err: any) => {
        if (rateLimit.isRateLimitError(err)) return false;
        return failureCount < 2;
      },
      enabled: !rateLimit.isRateLimited,
    }
  );

  // Extract and enhance emails from API response
  const emails = useMemo(() => {
    const rawEmails = (emailData as any)?.threads || [];

    // Convert to EnhancedEmailMessage format
    return rawEmails.map(
      (email: EmailMessage): EnhancedEmailMessage => ({
        ...email,
        aiAnalysis: {
          leadScore: 75, // Default score - Enhanced by backend AI analysis
          source: email.from?.includes("rengøring.nu")
            ? "rengoring_nu"
            : email.from?.includes("leadpoint")
              ? "rengoring_aarhus"
              : email.from?.includes("adhelp")
                ? "adhelp"
                : "direct",
          estimatedValue: 2000, // Default estimate - Calculated by backend AI
          urgency: email.unread ? "high" : "medium",
          jobType: email.subject?.toLowerCase().includes("hovedrengøring")
            ? "Hovedrengøring"
            : email.subject?.toLowerCase().includes("flytterengøring")
              ? "Flytterengøring"
              : "Anden",
          location: email.subject?.toLowerCase().includes("aarhus")
            ? "Aarhus"
            : email.subject?.toLowerCase().includes("københavn")
              ? "København"
              : "Anden",
          confidence: 85, // Default confidence - Real scoring via backend
        },
      })
    );
  }, [emailData]);

  // Fetch batch intelligence data for all visible emails
  const visibleThreadIds = useMemo(
    () => emails.map((e: EnhancedEmailMessage) => e.threadId).slice(0, 50), // Limit to 50 for performance
    [emails]
  );

  const { data: batchIntelligence } =
    trpc.emailIntelligence.getBatchIntelligence.useQuery(
      { threadIds: visibleThreadIds },
      {
        enabled: visibleThreadIds.length > 0 && useAIEnhancedList,
        staleTime: 5 * 60 * 1000, // 5 min cache
        gcTime: 10 * 60 * 1000, // 10 min garbage collection
      }
    );

  // Filter emails based on active split
  const filteredEmails = useMemo(() => {
    if (activeSplit === "all") return emails;

    return emails.filter((email: EnhancedEmailMessage) => {
      const intel = batchIntelligence?.[email.threadId];

      switch (activeSplit) {
        case "hot-leads":
          const isHighPriority =
            intel?.priority?.level === "urgent" ||
            intel?.priority?.level === "high" ||
            (intel?.priority?.score && intel.priority.score >= 70);
          const notReplied =
            !email.labels?.includes("replied") &&
            !email.labels?.includes("sent-offer");
          return isHighPriority && notReplied && email.unread;

        case "waiting":
          const hasSentOffer =
            email.labels?.includes("sent-offer") ||
            email.labels?.includes("pending");
          const stillWaiting = !email.labels?.includes("replied");
          return hasSentOffer && stillWaiting;

        case "finance":
          return intel?.category?.category === "finance";

        case "done":
          return (
            email.labels?.includes("archived") ||
            email.labels?.includes("done") ||
            email.labels?.includes("completed")
          );

        default:
          return true;
      }
    });
  }, [emails, batchIntelligence, activeSplit]);

  // Extract available labels from emails
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>();
    emails.forEach((email: EnhancedEmailMessage) => {
      email.labels?.forEach(label => labelSet.add(label));
    });
    return Array.from(labelSet).sort();
  }, [emails]);

  // Handle email selection
  const handleEmailSelect = useCallback(
    (email: EnhancedEmailMessage) => {
      setSelectedThreadId(email.threadId);
      setSelectedEmails(new Set()); // Clear multi-select when single email selected

      // Update EmailContext for SmartWorkspacePanel
      emailContext.setSelectedEmail({
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        labels: email.labels || [],
        threadLength: 1, // Would be updated with real thread data
      });
    },
    [emailContext]
  );

  // Handle bulk actions
  const handleBulkAction = useCallback(
    (action: BulkAction, params?: any) => {
      switch (action) {
        case "clearSelection":
          setSelectedEmails(new Set());
          break;
        case "markAsRead":
          // TODO: Implement bulk mark as read
          console.log("Mark as read:", Array.from(selectedEmails));
          break;
        case "markAsUnread":
          // TODO: Implement bulk mark as unread
          console.log("Mark as unread:", Array.from(selectedEmails));
          break;
        case "archive":
          // TODO: Implement bulk archive
          console.log("Archive:", Array.from(selectedEmails));
          break;
        case "delete":
          // TODO: Implement bulk delete
          console.log("Delete:", Array.from(selectedEmails));
          break;
        case "selectAll":
          const allThreadIds = new Set(
            emails.map((email: EmailMessage) => email.threadId)
          ) as Set<string>;
          setSelectedEmails(allThreadIds);
          break;
        default:
          console.log("Bulk action:", action, params);
      }
    },
    [selectedEmails, emails]
  );

  // Handle search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedEmails(new Set()); // Clear selection when search changes
  }, []);

  // Handle folder changes
  const handleFolderChange = useCallback((folder: FolderType) => {
    setSelectedFolder(folder);
    setSelectedEmails(new Set()); // Clear selection when folder changes
  }, []);

  // Handle label changes
  const handleLabelsChange = useCallback((labels: string[]) => {
    setSelectedLabels(labels);
    setSelectedEmails(new Set()); // Clear selection when labels change
  }, []);

  // Keyboard shortcuts
  useEmailKeyboardShortcuts({
    enabled: true,
    selectedThreadId,
    onArchive: () => {
      if (selectedThreadId) {
        console.log("Archive:", selectedThreadId);
        // TODO: Implement archive via TRPC
      }
    },
    onStar: () => {
      if (selectedThreadId) {
        console.log("Star:", selectedThreadId);
        // TODO: Implement star via TRPC
      }
    },
    onDelete: () => {
      if (selectedThreadId) {
        console.log("Delete:", selectedThreadId);
        // TODO: Implement delete via TRPC
      }
    },
    onClearSelection: () => {
      setSelectedEmails(new Set());
      setSelectedThreadId(null);
    },
    onSelectAll: () => {
      const allThreadIds = new Set(
        emails.map((e: EnhancedEmailMessage) => e.threadId)
      );
      setSelectedEmails(allThreadIds as Set<string>);
    },
  });

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive/50" />
          <div>
            <h3 className="font-medium text-foreground">
              Kunne ikke hente emails
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rateLimit.isRateLimitError(error)
                ? "Rate limit overskredet. Prøv igen om et øjeblik."
                : "Der opstod en fejl. Prøv igen."}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isFetching || rateLimit.isRateLimited}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {rateLimit.isRateLimited ? "Venter..." : "Prøv igen"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar with SPLITS */}
      <div className="w-64 border-r border-border/20 shrink-0 overflow-y-auto">
        <div className="p-4">
          <EmailSplits
            emails={emails}
            intelligence={batchIntelligence || {}}
            activeSplit={activeSplit}
            onSplitChange={setActiveSplit}
          />
        </div>
      </div>

      {/* Main email area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search and Filtering */}
        <EmailSearchV2
          searchQuery={searchQuery}
          selectedFolder={selectedFolder}
          selectedLabels={selectedLabels}
          availableLabels={availableLabels}
          onSearchChange={handleSearchChange}
          onFolderChange={handleFolderChange}
          onLabelsChange={handleLabelsChange}
          isLoading={isLoading}
        />

        {/* Bulk Actions */}
        <EmailBulkActionsV2
          selectedEmails={selectedEmails}
          onBulkAction={handleBulkAction}
          isLoading={isFetching}
          disabled={isLoading}
        />

        {/* Email List */}
        {useAIEnhancedList ? (
          <EmailListAI
            emails={filteredEmails}
            onEmailSelect={handleEmailSelect}
            selectedThreadId={selectedThreadId}
            selectedEmails={selectedEmails}
            onEmailSelectionChange={setSelectedEmails}
            density={density}
            isLoading={isLoading}
          />
        ) : (
          <EmailListV2
            emails={filteredEmails}
            onEmailSelect={handleEmailSelect}
            selectedThreadId={selectedThreadId}
            selectedEmails={selectedEmails}
            onEmailSelectionChange={setSelectedEmails}
            density={density}
            showAIFeatures={showAIFeatures}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
