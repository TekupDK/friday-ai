/**
 * UNSUBSCRIBE CARD - Afmelde nyhedsbreve
 */

import { Mail, Ban, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface NewsletterSubscription {
  id: string;
  sender: string;
  email: string;
  frequency: string;
  lastReceived: string;
  category: "newsletter" | "marketing" | "updates" | "spam";
}

interface UnsubscribeCardProps {
  subscriptions: NewsletterSubscription[];
  onUnsubscribe?: (subscriptionIds: string[]) => void;
  onCancel?: () => void;
}

export function UnsubscribeCard({
  subscriptions,
  onUnsubscribe,
  onCancel,
}: UnsubscribeCardProps) {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSubscription = (id: string) => {
    setSelectedSubs(prev =>
      prev.includes(id) ? prev.filter(subId => subId !== id) : [...prev, id]
    );
  };

  const handleUnsubscribe = async () => {
    if (selectedSubs.length > 0) {
      setIsProcessing(true);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUnsubscribe?.(selectedSubs);
      setIsProcessing(false);
    }
  };

  const getCategoryColor = (category: NewsletterSubscription["category"]) => {
    switch (category) {
      case "newsletter":
        return "bg-blue-500";
      case "marketing":
        return "bg-orange-500";
      case "updates":
        return "bg-green-500";
      case "spam":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: NewsletterSubscription["category"]) => {
    switch (category) {
      case "newsletter":
        return "Nyhedsbrev";
      case "marketing":
        return "Marketing";
      case "updates":
        return "Opdateringer";
      case "spam":
        return "Spam";
      default:
        return "Andet";
    }
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-md">
            <Ban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Unsubscribe</h4>
            <p className="text-xs text-muted-foreground">Afmeld nyhedsbreve</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-400">
              <p className="font-semibold">Bemærk:</p>
              <p>
                Du vil ikke længere modtage emails fra disse afsendere. Denne
                handling kan ikke fortrydes.
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Vælg nyhedsbreve at afmelde ({subscriptions.length} fundet):
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subscriptions.map(sub => (
              <button
                key={sub.id}
                onClick={() => toggleSubscription(sub.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedSubs.includes(sub.id)
                    ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
                    : "bg-background border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{sub.sender}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(sub.category)}>
                          {getCategoryLabel(sub.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {sub.frequency} • {sub.lastReceived}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {selectedSubs.includes(sub.id) ? (
                      <Check className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-border" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedSubs.length > 0 && (
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-xs">
            <span className="font-medium text-red-700 dark:text-red-400">
              {selectedSubs.length} nyhedsbrev
              {selectedSubs.length > 1 ? "er" : ""} valgt til afmelding
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleUnsubscribe}
            className="flex-1 bg-linear-to-r from-red-600 to-orange-600"
            disabled={selectedSubs.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Unsubscribe ({selectedSubs.length})
              </>
            )}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
