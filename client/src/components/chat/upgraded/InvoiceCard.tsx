/**
 * INVOICE CARD - Opgraderet
 * Billy faktura integration med status tracking
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "viewed" | "overdue" | "paid";
  dueDate: Date;
  createdDate: Date;
  paidDate?: Date;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  paymentProgress?: number; // 0-100
}

interface InvoiceCardProps {
  data: InvoiceData;
  onView?: (id: string) => void;
  onSend?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const statusConfig = {
  draft: {
    icon: FileText,
    color: "bg-gray-500",
    textColor: "text-gray-700 dark:text-gray-300",
    label: "Kladde",
    border: "border-l-gray-500",
  },
  sent: {
    icon: Send,
    color: "bg-blue-500",
    textColor: "text-blue-700 dark:text-blue-300",
    label: "Sendt",
    border: "border-l-blue-500",
  },
  viewed: {
    icon: Eye,
    color: "bg-purple-500",
    textColor: "text-purple-700 dark:text-purple-300",
    label: "Åbnet",
    border: "border-l-purple-500",
  },
  overdue: {
    icon: AlertCircle,
    color: "bg-red-500",
    textColor: "text-red-700 dark:text-red-300",
    label: "Forfalden",
    border: "border-l-red-500",
  },
  paid: {
    icon: CheckCircle2,
    color: "bg-green-500",
    textColor: "text-green-700 dark:text-green-300",
    label: "Betalt",
    border: "border-l-green-500",
  },
};

export function InvoiceCardUpgraded({
  data,
  onView,
  onSend,
  onDownload,
}: InvoiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[data.status];
  const StatusIcon = config.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = () => {
    const now = new Date();
    const due = new Date(data.dueDate);
    const diff = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-l-4 transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.01]",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
        config.border
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md",
              "bg-linear-to-br from-yellow-400 to-orange-500",
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold text-base">
                Faktura #{data.invoiceNumber}
              </h4>
              <Badge className={config.color}>{config.label}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium">{data.customerName}</span>
            </div>

            {/* Amount - Large */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(data.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        {data.paymentProgress !== undefined &&
          data.paymentProgress > 0 &&
          data.paymentProgress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Delvist betalt</span>
                <span className="font-medium">{data.paymentProgress}%</span>
              </div>
              <Progress value={data.paymentProgress} className="h-2" />
            </div>
          )}

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Oprettet</p>
              <p className="text-xs font-medium">
                {formatDate(data.createdDate)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              daysUntilDue < 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-muted/50"
            )}
          >
            <Clock
              className={cn(
                "w-4 h-4",
                daysUntilDue < 0 ? "text-red-500" : "text-muted-foreground"
              )}
            />
            <div>
              <p className="text-xs text-muted-foreground">Forfald</p>
              <p
                className={cn(
                  "text-xs font-medium",
                  daysUntilDue < 0 && "text-red-600 dark:text-red-400"
                )}
              >
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} dage over`
                  : formatDate(data.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Preview - Expandable */}
        {data.items && data.items.length > 0 && isExpanded && (
          <div className="pt-3 border-t border-border/50 space-y-2 animate-in slide-in-from-top-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Linjer:
            </p>
            {data.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 rounded bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(item.quantity * item.price)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(data.id)}
            className="flex-1"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Vis
          </Button>

          {data.status === "draft" && (
            <Button
              size="sm"
              onClick={() => onSend?.(data.id)}
              className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload?.(data.id)}
            className="flex-1"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            PDF
          </Button>

          {data.items && data.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "▲" : "▼"}
            </Button>
          )}
        </div>

        {/* Paid Checkmark */}
        {data.status === "paid" && data.paidDate && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Betalt {formatDate(data.paidDate)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
