import { ChevronDown, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  ACTION_ICONS,
  ACTION_LABELS,
  RISK_COLORS,
  RISK_LABELS,
  type PendingAction,
} from "@/components/ActionApprovalModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SuggestionsBarProps {
  suggestions: PendingAction[];
  onApprove: (suggestion: PendingAction) => void;
  onRefresh: () => void;
  isLoading: boolean;
  className?: string;
}

function SuggestionSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/70 px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3 flex-1">
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SuggestionsBar({
  suggestions,
  onApprove,
  onRefresh,
  isLoading,
  className,
}: SuggestionsBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasSuggestions = suggestions && suggestions.length > 0;

  if (!hasSuggestions && !isLoading) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <h3 className="text-xs font-medium text-muted-foreground">
            Friday foreslår handlinger
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRefresh()}
            disabled={isLoading}
            aria-label="Genopfrisk forslag"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Vis forslag" : "Skjul forslag"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "-rotate-90"
              )}
            />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-2">
          {isLoading && !hasSuggestions ? (
            <>
              <SuggestionSkeleton />
              <SuggestionSkeleton />
            </>
          ) : (
            suggestions.map(suggestion => {
              const label = ACTION_LABELS[suggestion.type] ?? suggestion.type;
              const Icon = ACTION_ICONS[suggestion.type] ?? Sparkles;
              const riskClass = RISK_COLORS[suggestion.riskLevel];
              const riskLabel = RISK_LABELS[suggestion.riskLevel];

              return (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {label}
                        </span>
                        {suggestion.riskLevel === "high" && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-600 border-red-200"
                          >
                            Høj risiko
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.impact}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApprove(suggestion)}
                    className="shrink-0 h-7 text-xs"
                  >
                    Godkend
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default SuggestionsBar;
