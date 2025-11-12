/**
 * CROSS REFERENCE CARD - Kombinere email+kalender+faktura data
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Link2,
  Mail,
  Calendar,
  FileText,
  Search,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export interface CrossReferenceData {
  query: string;
  emailResults: Array<{
    id: string;
    subject: string;
    sender: string;
    date: string;
    snippet: string;
  }>;
  calendarResults: Array<{
    id: string;
    title: string;
    date: string;
    location?: string;
    attendees?: string[];
  }>;
  invoiceResults: Array<{
    id: string;
    number: string;
    customer: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    date: string;
  }>;
}

interface CrossReferenceCardProps {
  data?: CrossReferenceData;
  onSearch?: (query: string) => void;
  onSelectItem?: (type: "email" | "calendar" | "invoice", id: string) => void;
  onCancel?: () => void;
}

export function CrossReferenceCard({
  data,
  onSearch,
  onSelectItem,
  onCancel,
}: CrossReferenceCardProps) {
  const [query, setQuery] = useState(data?.query || "");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (query.trim()) {
      setIsSearching(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSearch?.(query.trim());
      setIsSearching(false);
    }
  };

  // Default cross-reference data
  const defaultData: CrossReferenceData = {
    query: "Kunde A",
    emailResults: [
      {
        id: "1",
        subject: "Møde om rengøringsaftale",
        sender: "kunde@a.dk",
        date: "2024-01-15",
        snippet: "Vi vil gerne aftale et møde om den nye rengøringsaftale...",
      },
      {
        id: "2",
        subject: "Faktura spørgsmål",
        sender: "kunde@a.dk",
        date: "2024-01-10",
        snippet: "Har et spørgsmål til den seneste faktura...",
      },
    ],
    calendarResults: [
      {
        id: "1",
        title: "Møde med Kunde A",
        date: "2024-01-20 14:00",
        location: "Kontor A",
        attendees: ["John Doe", "Jane Smith"],
      },
    ],
    invoiceResults: [
      {
        id: "1",
        number: "F-2024-001",
        customer: "Kunde A",
        amount: 5000,
        status: "paid",
        date: "2024-01-05",
      },
    ],
  };

  const referenceData = data || defaultData;

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Betalt";
      case "pending":
        return "Afventer";
      case "overdue":
        return "Forfalden";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("da-DK") + " kr";
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Cross Reference</h4>
            <p className="text-xs text-muted-foreground">
              Kombiner email, kalender & faktura
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Søg på tværs af alle systemer..."
              className="w-full pl-9 pr-3 h-10 border rounded-lg text-sm"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Søger...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Søg på tværs
              </>
            )}
          </Button>
        </div>

        {/* Results Summary */}
        {referenceData.query && (
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                Resultater for "{referenceData.query}":
              </span>
              <div className="flex gap-2">
                <Badge className="bg-blue-500">
                  {referenceData.emailResults.length} emails
                </Badge>
                <Badge className="bg-purple-500">
                  {referenceData.calendarResults.length} events
                </Badge>
                <Badge className="bg-green-500">
                  {referenceData.invoiceResults.length} fakturaer
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Email Results */}
        {referenceData.emailResults.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Emails ({referenceData.emailResults.length})
            </h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {referenceData.emailResults.map(email => (
                <button
                  key={email.id}
                  onClick={() => onSelectItem?.("email", email.id)}
                  className="w-full text-left p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {email.sender}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {email.snippet}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {email.date}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Results */}
        {referenceData.calendarResults.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Kalender ({referenceData.calendarResults.length})
            </h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {referenceData.calendarResults.map(event => (
                <button
                  key={event.id}
                  onClick={() => onSelectItem?.("calendar", event.id)}
                  className="w-full text-left p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Results */}
        {referenceData.invoiceResults.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              Fakturaer ({referenceData.invoiceResults.length})
            </h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {referenceData.invoiceResults.map(invoice => (
                <button
                  key={invoice.id}
                  onClick={() => onSelectItem?.("invoice", invoice.id)}
                  className="w-full text-left p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.customer}
                      </p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getInvoiceStatusColor(invoice.status)}>
                        {getInvoiceStatusLabel(invoice.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {invoice.date}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {referenceData.query &&
          referenceData.emailResults.length === 0 &&
          referenceData.calendarResults.length === 0 &&
          referenceData.invoiceResults.length === 0 && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingen resultater fundet for "{referenceData.query}"
              </p>
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Luk
          </Button>
          <Button variant="ghost" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analyse
          </Button>
        </div>
      </div>
    </Card>
  );
}
