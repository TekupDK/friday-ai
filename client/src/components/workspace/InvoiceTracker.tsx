import {
  AlertTriangle,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

import SmartActionBar, { type InvoiceData } from "./SmartActionBar";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";


interface InvoiceTrackerProps {
  context: {
    emailId?: string;
    threadId?: string;
    subject?: string;
    from?: string;
    body?: string;
    labels?: string[];
  };
}

export function InvoiceTracker({ context }: InvoiceTrackerProps) {
  // Extract invoice data from email context
  const subject = context.subject || "";
  const from = context.from || "";
  const body = context.body || "";

  // Parse invoice number from subject (e.g., "Re: Faktura nr. 1110")
  const invoiceMatch = subject.match(/faktura\s+nr\.?\s*(\d+)/i);
  const invoiceNumber = invoiceMatch ? invoiceMatch[1] : null;

  // State for Billy invoice data
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice from Billy API
  const {
    data: billyInvoice,
    isLoading: isBillyLoading,
    error: billyError,
  } = trpc.inbox.invoices.getByNumber.useQuery(
    { invoiceNumber: invoiceNumber || "" },
    {
      enabled: !!invoiceNumber, // Only fetch if we have an invoice number
      retry: 1,
    }
  );

  useEffect(() => {
    if (invoiceNumber) {
      setIsLoading(true);
      setError(null);

      if (billyInvoice) {
        // Calculate days overdue
        const daysOverdue = billyInvoice.dueDate
          ? Math.floor(
              (new Date().getTime() -
                new Date(billyInvoice.dueDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        setInvoice({
          id: billyInvoice.invoiceNo || `#${invoiceNumber}`,
          billyId: billyInvoice.id,
          customer: from.replace(/<.*>/, "").trim() || "Kunde",
          email: from.includes("<") ? from.match(/<(.+)>/)?.[1] : from,
          phone: "Ikke angivet", // Would need customer lookup
          amount: Math.round(
            billyInvoice.grossAmount || billyInvoice.amount || 0
          ),
          sent: billyInvoice.createdTime
            ? new Date(billyInvoice.createdTime).toLocaleDateString("da-DK")
            : "Ikke angivet",
          due: billyInvoice.dueDate
            ? new Date(billyInvoice.dueDate).toLocaleDateString("da-DK")
            : "Ikke angivet",
          daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
          status: billyInvoice.state || "pending",
          balance: Math.round(billyInvoice.balance || 0),
          isPaid: billyInvoice.isPaid || false,
          downloadUrl: billyInvoice.downloadUrl,
        });
        setIsLoading(false);
      } else if (billyError) {
        setError("Kunne ikke finde faktura i Billy");
        setIsLoading(false);
      }
    } else {
      // Fallback to parsed data if no invoice number found
      const amountMatch = body.match(
        /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*kr/i
      );
      const amount = amountMatch
        ? parseInt(amountMatch[1].replace(/[.,]/g, ""))
        : 0;

      setInvoice({
        id: "#XXXX",
        customer: from.replace(/<.*>/, "").trim() || "Kunde",
        email: from.includes("<") ? from.match(/<(.+)>/)?.[1] : from,
        phone: "Ikke angivet",
        amount: amount || 4339,
        sent: "Ikke angivet",
        due: "Ikke angivet",
        daysOverdue: 0,
        status: "pending" as const,
        balance: amount || 4339,
        isPaid: false,
      });
      setIsLoading(false);
    }
  }, [invoiceNumber, billyInvoice, billyError, from, body]); // All deps needed for invoice processing

  // Loading state
  if (isLoading || isBillyLoading) {
    return <WorkspaceSkeleton type="invoice" />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">💰 Invoice Tracker</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fejl ved hentning af faktura
              </p>
              <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                {error}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!invoice) return null;

  // Status badge configuration
  const getStatusBadge = (
    status: string,
    daysOverdue: number,
    isPaid: boolean
  ) => {
    if (isPaid)
      return {
        variant: "default" as const,
        text: "Betalt",
        color: "bg-green-500",
      };
    if (daysOverdue > 14)
      return {
        variant: "destructive" as const,
        text: `${daysOverdue} dage forsinket`,
        color: "bg-red-500",
      };
    if (daysOverdue > 0)
      return {
        variant: "destructive" as const,
        text: `${daysOverdue} dage forsinket`,
        color: "bg-orange-500",
      };
    if (status === "sent")
      return {
        variant: "secondary" as const,
        text: "Sendt",
        color: "bg-blue-500",
      };
    if (status === "draft")
      return {
        variant: "outline" as const,
        text: "Kladde",
        color: "bg-gray-500",
      };
    return {
      variant: "secondary" as const,
      text: "Afventer betaling",
      color: "bg-yellow-500",
    };
  };

  const statusBadge = getStatusBadge(
    invoice.status,
    invoice.daysOverdue,
    invoice.isPaid
  );

  // Prepare invoice data for SmartActionBar
  const invoiceData: InvoiceData = {
    customer: invoice.customer,
    email: from,
    amount: invoice.amount,
    dueDate: invoice.dueDate,
    status: invoice.status as "paid" | "unpaid" | "overdue" | "cancelled",
    isPaid: invoice.isPaid,
    invoiceId: invoice.invoiceId,
    invoiceUrl: invoice.invoiceUrl,
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">💰 Invoice Tracker</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faktura {invoice.id}{" "}
              {invoice.billyId && "• Billy ID: " + invoice.billyId}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className={statusBadge.color}>
            {statusBadge.text}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <div className="font-semibold">{invoice.customer}</div>
            <div className="text-xs text-muted-foreground">{invoice.email}</div>
            <div className="text-xs text-muted-foreground">{invoice.phone}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">💵 Beløb & Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total beløb:</span>
            <span className="font-bold text-lg">
              {invoice.amount.toLocaleString("da-DK")} kr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resterende:</span>
            <span
              className={`font-bold text-lg ${invoice.balance > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {invoice.balance.toLocaleString("da-DK")} kr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sendt:</span>
            <span className="font-medium">{invoice.sent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Forfald:</span>
            <span
              className={`font-medium ${invoice.daysOverdue > 0 ? "text-red-600" : ""}`}
            >
              {invoice.due}
              {invoice.daysOverdue > 0 &&
                ` (${invoice.daysOverdue} dage forsinket)`}
            </span>
          </div>
          {invoice.downloadUrl && (
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={invoice.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Download Faktura PDF
                </a>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Risk Analysis based on real Billy data */}
      {invoice.daysOverdue > 0 && (
        <Card className="p-4 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h4 className="font-semibold text-sm">⚠️ Risk Analysis</h4>
          </div>
          <div className="space-y-1 text-xs">
            {invoice.daysOverdue > 30 && (
              <>
                <div>🔴 KRITISK: {invoice.daysOverdue} dage forsinket</div>
                <div>• Betaling er meget forsinket</div>
                <div>• Overvej inkasso</div>
              </>
            )}
            {invoice.daysOverdue > 14 && invoice.daysOverdue <= 30 && (
              <>
                <div>🟠 Høj risiko: {invoice.daysOverdue} dage forsinket</div>
                <div>• Send påmindelse NU</div>
                <div>• Ring til kunde</div>
              </>
            )}
            {invoice.daysOverdue > 0 && invoice.daysOverdue <= 14 && (
              <>
                <div>
                  🟡 Mellem risiko: {invoice.daysOverdue} dage forsinket
                </div>
                <div>• Send venlig påmindelse</div>
                <div>• Overvåg tæt</div>
              </>
            )}
            <div>
              • Resterende: {invoice.balance.toLocaleString("da-DK")} kr
            </div>
          </div>
        </Card>
      )}

      {/* Payment received confirmation */}
      {invoice.isPaid && (
        <Card className="p-4 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-sm">✅ Betaling Modtaget</h4>
          </div>
          <div className="space-y-1 text-xs text-green-800 dark:text-green-200">
            <div>• Faktura er fuldt betalt</div>
            <div>• Status: {invoice.status}</div>
            <div>• Ingen handling nødvendig</div>
          </div>
        </Card>
      )}

      <Card className="p-4 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <h4 className="font-semibold text-sm mb-2">💡 Anbefaling</h4>
        <div className="space-y-1 text-xs">
          <div>1. Ring til kunde (ikke email)</div>
          <div>2. Forklar situation professionelt</div>
          <div>3. Tilbyd 10% rabat hvis nødvendigt</div>
        </div>
      </Card>

      {/* Smart Actions - Phase 5.2.2 */}
      <SmartActionBar
        context={{ ...context, type: "invoice" }}
        workspaceData={invoiceData}
        onAction={async (actionId: string, data: any) => {
          // Handle smart actions
          console.log("Smart action executed:", actionId, data);

          switch (actionId) {
            case "sendReminder":
              // Send payment reminder email
              console.log("Sending payment reminder to:", invoiceData.customer);
              break;
            case "callCustomer":
              // Initiate call to customer
              console.log("Calling customer:", invoiceData.customer);
              break;
            case "sendReceipt":
              // Send payment receipt
              console.log("Sending receipt to:", invoiceData.customer);
              break;
            case "editInvoice":
              // Open invoice edit dialog
              console.log("Editing invoice:", invoiceData.invoiceId);
              break;
            case "viewHistory":
              // View customer payment history
              console.log("Viewing history for:", invoiceData.customer);
              break;
            default:
              console.log("Unknown action:", actionId);
          }
        }}
      />
    </div>
  );
}
