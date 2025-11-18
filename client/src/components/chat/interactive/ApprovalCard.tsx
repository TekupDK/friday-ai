/**
 * APPROVAL CARD - Godkendelse af bookinger, fakturaer, tilbud
 */

import { Check, X, Clock, User, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ApprovalItem {
  id: string;
  type: "booking" | "invoice" | "quote" | "lead";
  title: string;
  description: string;
  amount?: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  metadata?: Record<string, any>;
}

interface ApprovalCardProps {
  item: ApprovalItem;
  onApprove?: (id: string, note?: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onView?: (id: string) => void;
}

export function ApprovalCard({
  item,
  onApprove,
  onReject,
  onView,
}: ApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getTypeColor = () => {
    switch (item.type) {
      case "booking":
        return "bg-purple-600";
      case "invoice":
        return "bg-emerald-600";
      case "quote":
        return "bg-blue-600";
      case "lead":
        return "bg-amber-500";
      default:
        return "bg-slate-600";
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "booking":
        return Calendar;
      case "invoice":
        return DollarSign;
      case "quote":
        return DollarSign;
      case "lead":
        return User;
      default:
        return Clock;
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove?.(item.id);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject?.(item.id);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const Icon = getTypeIcon();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              getTypeColor()
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{item.title}</h4>
              <Badge className={getPriorityColor()}>{item.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>

          {item.status === "pending" && (
            <Badge variant="outline" className="shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              Afventer
            </Badge>
          )}
          {item.status === "approved" && (
            <Badge className="bg-emerald-600 shrink-0">
              <Check className="w-3 h-3 mr-1" />
              Godkendt
            </Badge>
          )}
          {item.status === "rejected" && (
            <Badge className="bg-red-500 shrink-0">
              <X className="w-3 h-3 mr-1" />
              Afvist
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Anmodet af:</span>
            <p className="font-medium">{item.requestedBy}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tidspunkt:</span>
            <p className="font-medium">{item.requestedAt}</p>
          </div>
          {item.amount && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Beløb:</span>
              <p className="font-semibold text-base">{item.amount}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {item.status === "pending" && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onView?.(item.id)}
            >
              Se detaljer
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" />
              Afvis
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-1" />
              Godkend
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
