import type { BillyInvoice } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceContext } from "@/context/InvoiceContext";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRateLimit } from "@/hooks/useRateLimit";
import { trpc } from "@/lib/trpc";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  AlertCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SafeStreamdown } from "../SafeStreamdown";
import { InvoiceCard } from "./InvoiceCard";

/**
 * Type-safe invoice list item
 */
type InvoiceListItem = BillyInvoice;

/**
 * InvoicesTab - Displays and manages Billy.dk invoices
 *
 * Integration: Uses Billy-mcp By Tekup (TekupDK/tekup-billy)
 * - Base URL: https://tekup-billy-production.up.railway.app
 * - API Version: 2.0.0
 * - Authentication: X-API-Key header
 * - Features: Automatic pagination, search, filter, AI analysis, virtual scrolling
 */
export default function InvoicesTab() {
  // Rate limit handling
  const rateLimit = useRateLimit();

  const {
    data: invoices,
    isLoading,
    isFetching,
    error,
    refetch,
  } = trpc.inbox.invoices.list.useQuery(undefined, {
    // Disable automatic polling - use adaptive polling instead
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    enabled: !rateLimit.isRateLimited,
    retry: (failureCount, error) => {
      if (rateLimit.isRateLimitError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Get invoice statistics
  const { data: stats } = trpc.inbox.invoices.stats.useQuery(undefined, {
    enabled: !rateLimit.isRateLimited,
    refetchInterval: false,
  });

  // Adaptive polling based on user activity
  useAdaptivePolling({
    baseInterval: 60000, // 60 seconds base
    minInterval: 30000, // 30 seconds when active
    maxInterval: 180000, // 3 minutes when inactive
    inactivityThreshold: 60000, // 1 minute to consider inactive
    pauseOnHidden: true,
    enabled: !rateLimit.isRateLimited && !isLoading,
    onPoll: async () => {
      if (!rateLimit.isRateLimited) {
        await refetch();
      }
    },
  });

  // Handle rate limit errors
  useEffect(() => {
    if (error && rateLimit.isRateLimitError(error)) {
      rateLimit.handleRateLimitError(error);
    }
  }, [error, rateLimit]);

  // Use shared context for invoice selection and AI analysis
  const {
    selectedInvoice,
    setSelectedInvoice,
    aiAnalysis,
    setAiAnalysis,
    analyzingInvoice,
    setAnalyzingInvoice,
    currentAnalysisId,
    setCurrentAnalysisId,
  } = useInvoiceContext();

  const analyzeInvoiceMutation = trpc.chat.analyzeInvoice.useMutation();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Local state for feedback (not shared with ChatPanel)
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(
    null
  );
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const submitFeedbackMutation = trpc.chat.submitAnalysisFeedback.useMutation();

  // Filter invoices based on search and status
  const filteredInvoices = useMemo((): InvoiceListItem[] => {
    if (!invoices) return [];

    return invoices.filter((invoice: InvoiceListItem): boolean => {
      const matchesSearch =
        debouncedSearch === "" ||
        invoice.invoiceNo
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        invoice.contactId
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        invoice.id?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.state === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, debouncedSearch, statusFilter]);

  // Virtual scrolling setup for performance with 100+ invoices
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredInvoices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated card height in pixels
    overscan: 5, // Render 5 extra items above/below viewport
  });

  const handleFeedback = async (rating: "up" | "down") => {
    if (!selectedInvoice) return;

    setFeedbackGiven(rating);

    // Show comment input for negative feedback
    if (rating === "down") {
      setShowCommentInput(true);
      return;
    }

    try {
      await submitFeedbackMutation.mutateAsync({
        invoiceId: selectedInvoice.id,
        rating,
        analysis: aiAnalysis,
        ...(feedbackComment && { comment: feedbackComment }),
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const submitFeedbackWithComment = async () => {
    if (!selectedInvoice || !feedbackGiven) return;

    try {
      await submitFeedbackMutation.mutateAsync({
        invoiceId: selectedInvoice.id,
        rating: feedbackGiven,
        analysis: aiAnalysis,
        ...(feedbackComment && { comment: feedbackComment }),
      });
      setShowCommentInput(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const csvEscape = (val: unknown): string => {
    const s = val == null ? "" : String(val);
    const escaped = s.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const formatDate = (d: string | Date | null | undefined): string => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("da-DK");
  };

  const exportToCSV = (invoice: BillyInvoice, analysis: string) => {
    // Auto-categorize based on invoice state and AI analysis
    const category = (() => {
      if (invoice.state === "overdue") return "URGENT";
      if (invoice.state === "draft") return "PENDING_REVIEW";
      if (
        analysis.toLowerCase().includes("risk") ||
        analysis.toLowerCase().includes("concern")
      )
        return "ATTENTION_NEEDED";
      if (
        analysis.toLowerCase().includes("good") ||
        analysis.toLowerCase().includes("positive")
      )
        return "HEALTHY";
      return "NORMAL";
    })();

    // Extract priority from analysis
    const priority = (() => {
      if (
        analysis.toLowerCase().includes("urgent") ||
        invoice.state === "overdue"
      )
        return "HIGH";
      if (
        analysis.toLowerCase().includes("important") ||
        invoice.state === "approved"
      )
        return "MEDIUM";
      return "LOW";
    })();

    // Create CSV content with categorization
    const headers = [
      "Invoice Number",
      "Customer",
      "Status",
      "Category",
      "Priority",
      "Entry Date",
      "Payment Terms",
      "AI Summary",
      "Recommendations",
    ];

    // Extract recommendations from AI analysis (simple text extraction)
    const recommendations = analysis
      .split("\n")
      .filter(
        line =>
          line.toLowerCase().includes("recommend") ||
          line.toLowerCase().includes("action") ||
          line.toLowerCase().includes("follow-up")
      )
      .join(" | ");

    const summary = analysis.replace(/[\n\r]/g, " ").substring(0, 200) + "...";

    const row = [
      csvEscape(invoice.invoiceNo || invoice.id.slice(0, 8)),
      csvEscape(invoice.contactId ?? ""),
      csvEscape(invoice.state ?? ""),
      csvEscape(category),
      csvEscape(priority),
      csvEscape(formatDate(invoice.entryDate)),
      csvEscape(`${invoice.paymentTermsDays} days`),
      csvEscape(summary),
      csvEscape(recommendations || "See full analysis"),
    ];

    const csvContent = [headers.join(","), row.join(",")].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoice-${invoice.invoiceNo || invoice.id}-analysis.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Fix memory leak
  };

  const handleAnalyzeInvoice = async (invoice: BillyInvoice) => {
    const analysisId = invoice.id;

    setSelectedInvoice(invoice);
    setCurrentAnalysisId(analysisId);
    setFeedbackGiven(null);
    setFeedbackComment("");
    setShowCommentInput(false);
    setAnalyzingInvoice(true);
    setAiAnalysis("");

    try {
      // Create a formatted invoice summary for AI analysis
      const invoiceSummary = `
Invoice Analysis Request:
- Invoice Number: ${invoice.invoiceNo || invoice.id}
- Customer: ${invoice.contactId}
- Status: ${invoice.state}
- Entry Date: ${invoice.entryDate}
- Payment Terms: ${invoice.paymentTermsDays} days
- Lines: ${invoice.lines?.length || 0} items

Please analyze this invoice and provide:
1. Payment status and any overdue warnings
2. Invoice completeness check
3. Any anomalies or unusual patterns
4. Recommendations for follow-up actions
`;

      // Call AI to analyze the invoice using tRPC
      const result = await analyzeInvoiceMutation.mutateAsync({
        invoiceData: invoiceSummary,
      });

      // Only update if still analyzing the same invoice
      if (analysisId === currentAnalysisId) {
        setAiAnalysis(
          result.analysis || "Analysis complete. No issues detected."
        );
      }
    } catch (error) {
      console.error("Error analyzing invoice:", error);
      // Only update if still analyzing the same invoice
      if (analysisId === currentAnalysisId) {
        setAiAnalysis("Error analyzing invoice. Please try again.");
      }
    } finally {
      // Only update if still analyzing the same invoice
      if (analysisId === currentAnalysisId) {
        setAnalyzingInvoice(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
    }).format(amount);
  };

  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const copy = new Date(d);
    copy.setDate(copy.getDate() + (days || 0));
    return copy;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Header */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Fakturaer</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.unpaidCount}</p>
                <p className="text-sm text-muted-foreground">Ubetalte</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.unpaidAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.overdueCount}</p>
                <p className="text-sm text-muted-foreground">Forfaldne</p>
                <p className="text-xs text-red-500">
                  {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.paidThisMonth)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Betalt denne måned
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søg fakturaer…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer efter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statusser</SelectItem>
            <SelectItem value="draft">Kladde</SelectItem>
            <SelectItem value="approved">Godkendt</SelectItem>
            <SelectItem value="sent">Afsendt</SelectItem>
            <SelectItem value="paid">Betalt</SelectItem>
            <SelectItem value="overdue">Forfalden</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
          title="Synkroniser fakturaer fra Billy"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isFetching ? "Synkroniserer…" : "Synkroniser"}
        </Button>
        {(searchInput || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchInput("");
              setStatusFilter("all");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Invoice List with Virtual Scrolling */}
      <div
        ref={parentRef}
        className="h-[calc(100vh-280px)] overflow-auto"
        data-testid="invoice-list"
      >
        {filteredInvoices.length > 0 ? (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map(virtualRow => {
              const invoice = filteredInvoices[virtualRow.index];
              return (
                <div
                  key={invoice.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="px-0.5 pb-2"
                >
                  <InvoiceCard
                    invoice={invoice}
                    isAnalyzing={analyzingInvoice}
                    isSelected={selectedInvoice?.id === invoice.id}
                    onAnalyze={handleAnalyzeInvoice}
                    onExportCSV={exportToCSV}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <FileText className="w-16 h-16 opacity-20" />
                <Search className="w-6 h-6 absolute -bottom-1 -right-1 opacity-40" />
              </div>
            </div>
            <p className="font-semibold text-base mb-2">
              {searchInput || statusFilter !== "all"
                ? "No invoices match your filters"
                : "No invoices yet"}
            </p>
            <p className="text-sm mb-4">
              {searchInput || statusFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for"
                : "Your invoices from Billy.dk will automatically appear here"}
            </p>
            {!(searchInput || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Sync from Billy
              </Button>
            )}
          </div>
        )}
      </div>

      {/* AI Analysis Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={open => !open && setSelectedInvoice(null)}
      >
        <DialogContent className="w-full sm:max-w-[800px] max-h-[85vh] flex flex-col">
          <div className="flex-1 overflow-y-auto smooth-scroll pr-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Invoice Analysis
              </DialogTitle>
              <DialogDescription>
                {selectedInvoice && (
                  <>
                    Invoice{" "}
                    {selectedInvoice.invoiceNo ||
                      selectedInvoice.id.slice(0, 8)}{" "}
                    • {selectedInvoice.contactId}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {analyzingInvoice ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      Analyzing invoice with AI...
                    </span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[97%]" />
                  <Skeleton className="h-4 w-[85%]" />
                </div>
              ) : aiAnalysis ? (
                <>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <SafeStreamdown content={aiAnalysis} />
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Was this analysis helpful?
                        </span>
                        <Button
                          variant={
                            feedbackGiven === "up" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleFeedback("up")}
                          className="gap-1"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {feedbackGiven === "up" && "Thanks!"}
                        </Button>
                        <Button
                          variant={
                            feedbackGiven === "down" ? "destructive" : "outline"
                          }
                          size="sm"
                          onClick={() => handleFeedback("down")}
                          className="gap-1"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          {feedbackGiven === "down" && "Noted"}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            exportToCSV(selectedInvoice!, aiAnalysis);
                            toast.success("CSV exported successfully");
                          } catch (error) {
                            console.error("CSV export failed:", error);
                            toast.error(
                              "Failed to export CSV. Please try again."
                            );
                          }
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export to CSV
                      </Button>
                    </div>

                    {/* Feedback Comment Input */}
                    {showCommentInput && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Tell us what could be improved... (optional)"
                          value={feedbackComment}
                          onChange={e => setFeedbackComment(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={submitFeedbackWithComment}>
                            Submit Feedback
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowCommentInput(false);
                              setFeedbackComment("");
                            }}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Click "Analyser" to get AI insights about this invoice
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
