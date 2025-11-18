/**
 * CUSTOMER HISTORY CARD - Kundehistorik og tidligere aftaler
 */

import {
  AlertCircle,
  Calendar,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CustomerHistoryItem {
  id: string;
  type: "email" | "meeting" | "call" | "invoice" | "note";
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  metadata?: Record<string, any>;
}

export interface CustomerHistoryData {
  customer: {
    id: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    address?: string;
    since: string;
    totalValue: number;
    status: "active" | "inactive" | "prospect";
  };
  history: CustomerHistoryItem[];
  summary: {
    totalInvoices: number;
    totalMeetings: number;
    totalEmails: number;
    lastContact: string;
    nextAction?: string;
  };
}

interface CustomerHistoryCardProps {
  data?: CustomerHistoryData;
  onAddNote?: (note: string) => void;
  onScheduleMeeting?: () => void;
  onSendEmail?: () => void;
  onExport?: () => void;
}

export function CustomerHistoryCard({
  data,
  onAddNote,
  onScheduleMeeting,
  onSendEmail,
  onExport,
}: CustomerHistoryCardProps) {
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Default customer history data
  const defaultData: CustomerHistoryData = {
    customer: {
      id: "1",
      name: "John Smith",
      company: "ABC Corporation",
      email: "john@abc.com",
      phone: "+45 12345678",
      address: "Business Park 123, 8000 Aarhus C",
      since: "2023-03-15",
      totalValue: 125000,
      status: "active",
    },
    history: [
      {
        id: "1",
        type: "meeting",
        date: "2024-01-15",
        title: "Møde om rengøringsaftale",
        description: "Diskuterede nye rengøringsløsninger for kontorlokaler",
        metadata: { location: "ABC Corporation", duration: "2 timer" },
      },
      {
        id: "2",
        type: "invoice",
        date: "2024-01-10",
        title: "Faktura #F-2024-001",
        description: "Månedlig rengøring - Januar",
        amount: 5000,
        status: "paid",
      },
      {
        id: "3",
        type: "email",
        date: "2024-01-08",
        title: "Opfølgning på service",
        description: "Spørgsmål om kvaliteten af den seneste rengøring",
      },
      {
        id: "4",
        type: "call",
        date: "2024-01-05",
        title: "Telefonisk opfølgning",
        description: "Kunden var tilfreds med servicen",
      },
      {
        id: "5",
        type: "meeting",
        date: "2023-12-20",
        title: "Årsmøde",
        description: "Gennemgang af årets samarbejde og planer for 2024",
      },
      {
        id: "6",
        type: "invoice",
        date: "2023-12-15",
        title: "Faktura #F-2023-012",
        description: "Ekstra rengøring før jul",
        amount: 2500,
        status: "paid",
      },
    ],
    summary: {
      totalInvoices: 12,
      totalMeetings: 8,
      totalEmails: 24,
      lastContact: "2024-01-15",
      nextAction: "Opfølgning på ny aftale",
    },
  };

  const historyData = data || defaultData;

  const getHistoryIcon = (type: CustomerHistoryItem["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "meeting":
        return <Calendar className="w-4 h-4" />;
      case "call":
        return <Phone className="w-4 h-4" />;
      case "invoice":
        return <FileText className="w-4 h-4" />;
      case "note":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getHistoryColor = (type: CustomerHistoryItem["type"]) => {
    switch (type) {
      case "email":
        return "bg-blue-500";
      case "meeting":
        return "bg-purple-500";
      case "call":
        return "bg-green-500";
      case "invoice":
        return "bg-orange-500";
      case "note":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status?: string) => {
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("da-DK") + " kr";
  };

  const displayHistory = showFullHistory
    ? historyData.history
    : historyData.history.slice(0, 4);

  return (
    <Card className="border-l-4 border-l-teal-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Kundehistorik</h4>
              <p className="text-xs text-muted-foreground">
                Komplet kundeoversigt
              </p>
            </div>
          </div>
          <Badge
            className={
              historyData.customer.status === "active"
                ? "bg-green-500"
                : "bg-gray-500"
            }
          >
            {historyData.customer.status === "active" ? "Aktiv" : "Inaktiv"}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <div>
                <p className="font-medium text-sm">
                  {historyData.customer.name}
                </p>
                {historyData.customer.company && (
                  <p className="text-xs text-muted-foreground">
                    {historyData.customer.company}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                {formatCurrency(historyData.customer.totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Siden {historyData.customer.since}
              </p>
            </div>
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>{historyData.customer.email}</span>
            </div>
            {historyData.customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{historyData.customer.phone}</span>
              </div>
            )}
            {historyData.customer.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{historyData.customer.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {historyData.summary.totalInvoices}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Fakturaer
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {historyData.summary.totalMeetings}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Møder
            </p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {historyData.summary.totalEmails}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">Emails</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {historyData.history.length}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Aktiviteter
            </p>
          </div>
        </div>

        {/* Next Action */}
        {historyData.summary.nextAction && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Næste handling: {historyData.summary.nextAction}
              </span>
            </div>
          </div>
        )}

        {/* History Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              Historik ({displayHistory.length} af {historyData.history.length})
            </h5>
            {historyData.history.length > 4 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFullHistory(!showFullHistory)}
              >
                {showFullHistory ? "Vis mindre" : "Vis alle"}
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayHistory.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
                    getHistoryColor(item.type)
                  )}
                >
                  {getHistoryIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      {item.amount && (
                        <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                          {formatCurrency(item.amount)}
                        </p>
                      )}
                      {item.metadata &&
                        Object.keys(item.metadata).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {Object.entries(item.metadata).map(
                              ([key, value]) => (
                                <p
                                  key={key}
                                  className="text-xs text-muted-foreground"
                                >
                                  {key}: {value}
                                </p>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {item.date}
                      </span>
                      {item.status && (
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === "paid" ? "Betalt" : item.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            onClick={() => onAddNote?.("")}
            variant="outline"
            className="flex-1"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Tilføj note
          </Button>
          <Button
            onClick={onScheduleMeeting}
            variant="outline"
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Planlæg møde
          </Button>
          <Button onClick={onSendEmail} variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Send email
          </Button>
          <Button onClick={onExport} variant="outline" className="flex-1">
            <History className="w-4 h-4 mr-2" />
            Eksport
          </Button>
        </div>
      </div>
    </Card>
  );
}
