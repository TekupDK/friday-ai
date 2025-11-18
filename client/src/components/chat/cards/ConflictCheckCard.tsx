/**
 * CONFLICT CHECK CARD - Verificere dobbeltbookinger
 */

import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EventConflict {
  id: string;
  title: string;
  time: string;
  duration: string;
  location?: string;
  severity: "low" | "medium" | "high";
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: EventConflict[];
  suggestions?: string[];
}

interface ConflictCheckCardProps {
  proposedEvent?: {
    date: string;
    time: string;
    duration: string;
    location?: string;
  };
  result?: ConflictCheckResult;
  onCheckConflicts?: (event: any) => void;
  onProceedAnyway?: () => void;
  onSuggestAlternative?: () => void;
  onCancel?: () => void;
}

export function ConflictCheckCard({
  proposedEvent,
  result,
  onCheckConflicts,
  onProceedAnyway,
  onSuggestAlternative,
  onCancel,
}: ConflictCheckCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (proposedEvent) {
      setIsChecking(true);
      // Simulate checking
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCheckConflicts?.(proposedEvent);
      setIsChecking(false);
    }
  };

  const getSeverityColor = (severity: EventConflict["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityLabel = (severity: EventConflict["severity"]) => {
    switch (severity) {
      case "high":
        return "Høj";
      case "medium":
        return "Medium";
      case "low":
        return "Lav";
      default:
        return "Ukendt";
    }
  };

  // Default result for demo
  const defaultResult: ConflictCheckResult = {
    hasConflicts: true,
    conflicts: [
      {
        id: "1",
        title: "Team Møde",
        time: "10:00",
        duration: "1 time",
        location: "Mødelokale A",
        severity: "high",
      },
      {
        id: "2",
        title: "Kunde Call",
        time: "10:30",
        duration: "30 min",
        severity: "medium",
      },
    ],
    suggestions: [
      "Flyt til 14:00 - ingen konflikter",
      "Book kortere møde (30 min)",
      "Brug online møde i stedet",
    ],
  };

  const checkResult = result || defaultResult;

  return (
    <Card className="border-l-4 border-l-red-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Konflikthåndtering</h4>
            <p className="text-xs text-muted-foreground">
              Verificer dobbeltbookinger
            </p>
          </div>
        </div>

        {/* Proposed Event */}
        {proposedEvent && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Foreslået event:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>📅 {proposedEvent.date}</div>
              <div>
                ⏰ {proposedEvent.time} ({proposedEvent.duration})
              </div>
              {proposedEvent.location && (
                <div className="col-span-2">📍 {proposedEvent.location}</div>
              )}
            </div>
          </div>
        )}

        {/* Check Button */}
        {!result && (
          <Button
            onClick={handleCheck}
            className="w-full bg-linear-to-r from-red-600 to-orange-600"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Tjekker konflikter...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Tjek for konflikter
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Conflict Status */}
            <div
              className={cn(
                "p-3 rounded-lg border",
                checkResult.hasConflicts
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              )}
            >
              <div className="flex items-center gap-2">
                {checkResult.hasConflicts ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                <span
                  className={cn(
                    "font-medium text-sm",
                    checkResult.hasConflicts
                      ? "text-red-700 dark:text-red-400"
                      : "text-green-700 dark:text-green-400"
                  )}
                >
                  {checkResult.hasConflicts
                    ? `${checkResult.conflicts.length} konflikt${checkResult.conflicts.length > 1 ? "er" : ""} fundet`
                    : "Ingen konflikter - godkendt!"}
                </span>
              </div>
            </div>

            {/* Conflicts List */}
            {checkResult.hasConflicts && checkResult.conflicts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Konflikter:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {checkResult.conflicts.map(conflict => (
                    <div
                      key={conflict.id}
                      className="p-2 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {conflict.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conflict.time} ({conflict.duration})
                            </p>
                            {conflict.location && (
                              <p className="text-xs text-muted-foreground">
                                📍 {conflict.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {getSeverityLabel(conflict.severity)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {checkResult.suggestions && checkResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Forslag:
                </p>
                <div className="space-y-1">
                  {checkResult.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={onSuggestAlternative}
                      className="w-full text-left p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              {checkResult.hasConflicts ? (
                <>
                  <Button onClick={onSuggestAlternative} className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Find alternativ
                  </Button>
                  <Button
                    onClick={onProceedAnyway}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Fortsæt alligevel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onProceedAnyway}
                  className="w-full bg-linear-to-r from-green-600 to-emerald-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Opret event
                </Button>
              )}
              <Button onClick={onCancel} variant="ghost">
                Annuller
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
