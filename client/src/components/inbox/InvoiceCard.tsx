import type { BillyInvoice } from "@/../../shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileEdit,
  FileText,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";

interface InvoiceCardProps {
  invoice: BillyInvoice;
  isAnalyzing: boolean;
  isSelected: boolean;
  onAnalyze: (invoice: BillyInvoice) => void;
  onExportCSV: (invoice: BillyInvoice, analysis: string) => void;
}

/**
 * Get status badge configuration for invoice state
 */
function getStatusBadge(state: string) {
  switch (state) {
    case "paid":
      return {
        variant: "default" as const,
        label: "Betalt",
        icon: CheckCircle2,
      };
    case "sent":
      return {
        variant: "default" as const,
        label: "Sendt",
        icon: Send,
      };
    case "overdue":
      return {
        variant: "destructive" as const,
        label: "Forfalden",
        icon: X,
      };
    case "approved":
      return {
        variant: "secondary" as const,
        label: "Godkendt",
        icon: FileEdit,
      };
    case "draft":
      return {
        variant: "outline" as const,
        label: "Kladde",
        icon: FileText,
      };
    default:
      return {
        variant: "outline" as const,
        label: state,
        icon: Clock,
      };
  }
}

/**
 * Format due date information
 */
function formatDueInfo(
  entryDate: string,
  paymentTermsDays?: number | null
): string {
  if (!paymentTermsDays) return "N/A";

  const entry = new Date(entryDate);
  const dueDate = new Date(
    entry.getTime() + paymentTermsDays * 24 * 60 * 60 * 1000
  );
  return dueDate.toLocaleDateString("da-DK");
}

/**
 * InvoiceCard - Memoized invoice card component for virtual scrolling
 */
export const InvoiceCard = memo(function InvoiceCard({
  invoice,
  isAnalyzing,
  isSelected,
  onAnalyze,
  onExportCSV,
}: InvoiceCardProps) {
  const badge = getStatusBadge(invoice.state);
  const StatusIcon = badge.icon;

  return (
    <Card
      className="group p-2.5 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-pointer"
      data-invoice-id={invoice.id}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">
              {invoice.invoiceNo
                ? `Faktura #${invoice.invoiceNo}`
                : `Kladde ${invoice.id.slice(0, 8)}`}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Kunde: {invoice.contactId}
          </p>
          <p className="text-xs text-muted-foreground">
            Dato: {new Date(invoice.entryDate).toLocaleDateString("da-DK")} •
            Forfalder:{" "}
            {formatDueInfo(invoice.entryDate, invoice.paymentTermsDays)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {badge.label}
            </Badge>
            {/* Quick actions - visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Open in Billy.dk"
                onClick={e => {
                  e.stopPropagation();
                  window.open(
                    `https://app.billy.dk/invoices/${invoice.id}`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Download CSV"
                onClick={async e => {
                  e.stopPropagation();
                  try {
                    onExportCSV(invoice, "");
                    toast.success("CSV exported successfully");
                  } catch (error) {
                    console.error("CSV export failed:", error);
                    toast.error("Failed to export CSV. Please try again.");
                  }
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAnalyze(invoice)}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing && isSelected}
            className="gap-1"
          >
            {isAnalyzing && isSelected ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {isAnalyzing && isSelected ? "Analyserer…" : "Analyser"}
          </Button>
        </div>
      </div>
      {invoice.lines && invoice.lines.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
          {invoice.lines.length} line
          {invoice.lines.length !== 1 ? "s" : ""}
        </div>
      )}
    </Card>
  );
});
