import {
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Download,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PatternRecognitionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  patterns: Array<{
    id: string;
    name: string;
    type: "trend" | "seasonal" | "cyclical" | "anomaly" | "correlation";
    description: string;
    confidence: number;
    strength: number; // 0-100
    frequency: string;
    impact: "low" | "medium" | "high";
    category: string;
    lastDetected: string;
    data?: any;
  }>;
  onPatternClick?: (pattern: any) => void;
  onAnalyze?: (id: string) => void;
  onExport?: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function PatternRecognitionCard({
  patterns,
  onPatternClick,
  onAnalyze,
  onExport,
  onRefresh,
  isLoading = false,
  className,
  ...props
}: PatternRecognitionCardProps) {
  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case "trend":
        return TrendingUp;
      case "seasonal":
        return BarChart3;
      case "cyclical":
        return Activity;
      case "anomaly":
        return Zap;
      case "correlation":
        return Target;
      default:
        return Eye;
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case "trend":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      case "seasonal":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "cyclical":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950/20";
      case "anomaly":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "correlation":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-yellow-500";
    if (strength >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Pattern Recognition
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI-drevet mønsteranalyse og trenddetektion
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Activity className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Analyserer mønstre...
              </p>
            </div>
          </div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ingen mønstre identificeret endnu
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Mere data kræves for mønsteranalyse
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patterns.map(pattern => {
              const TypeIcon = getPatternTypeIcon(pattern.type);
              return (
                <div
                  key={pattern.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                    getPatternTypeColor(pattern.type)
                  )}
                  onClick={() => onPatternClick?.(pattern)}
                >
                  <div className="shrink-0">
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{pattern.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {pattern.type === "trend"
                            ? "Trend"
                            : pattern.type === "seasonal"
                              ? "Sæsonmæssig"
                              : pattern.type === "cyclical"
                                ? "Cyklisk"
                                : pattern.type === "anomaly"
                                  ? "Anomali"
                                  : "Korrelation"}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            getImpactColor(pattern.impact)
                          )}
                        >
                          {pattern.impact.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {pattern.lastDetected}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Styrke:
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300",
                                  getStrengthColor(pattern.strength)
                                )}
                                style={{ width: `${pattern.strength}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {pattern.strength}%
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {pattern.frequency}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pattern.confidence}% confidence
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation();
                            onAnalyze?.(pattern.id);
                          }}
                        >
                          Analyser
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation();
                            onExport?.(pattern.id);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="secondary" className="text-xs">
                        {pattern.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
