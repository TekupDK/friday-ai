import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  Eye,
  Bell,
} from "lucide-react";

export interface AnomalyDetectionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  anomalies: Array<{
    id: string;
    type: "performance" | "security" | "data" | "behavior";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    detectedAt: string;
    confidence: number;
    affected: string;
    status: "new" | "investigating" | "resolved";
  }>;
  onAnomalyClick?: (anomaly: any) => void;
  onMarkResolved?: (id: string) => void;
  onInvestigate?: (id: string) => void;
  isLoading?: boolean;
}

export function AnomalyDetectionCard({
  anomalies,
  onAnomalyClick,
  onMarkResolved,
  onInvestigate,
  isLoading = false,
  className,
  ...props
}: AnomalyDetectionCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-100 dark:bg-red-950/30";
      case "high":
        return "text-orange-700 bg-orange-100 dark:bg-orange-950/30";
      case "medium":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-950/30";
      case "low":
        return "text-blue-700 bg-blue-100 dark:bg-blue-950/30";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-950/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return Activity;
      case "security":
        return Shield;
      case "data":
        return TrendingUp;
      case "behavior":
        return Eye;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-500";
      case "investigating":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Anomaly Detection
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Automatisk detektion af uregelmæssigheder
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {anomalies.filter(a => a.status === "new").length} Nye
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Scanner for anomalier...
              </p>
            </div>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Ingen anomalier detekteret</p>
            <p className="text-sm text-muted-foreground mt-1">
              Alle systemer fungerer normalt
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map(anomaly => {
              const TypeIcon = getTypeIcon(anomaly.type);
              return (
                <div
                  key={anomaly.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-card"
                  onClick={() => onAnomalyClick?.(anomaly)}
                >
                  <div className="shrink-0">
                    <TypeIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{anomaly.title}</h4>
                        <Badge
                          className={cn(
                            "text-xs",
                            getSeverityColor(anomaly.severity)
                          )}
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(anomaly.status)
                          )}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {anomaly.status === "new"
                            ? "Ny"
                            : anomaly.status === "investigating"
                              ? "Undersøges"
                              : "Løst"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {anomaly.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Påvirker: {anomaly.affected}
                        </span>
                        <span className="text-muted-foreground">
                          Confidence: {anomaly.confidence}%
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {anomaly.detectedAt}
                      </span>
                    </div>

                    {anomaly.status === "new" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation();
                            onInvestigate?.(anomaly.id);
                          }}
                        >
                          Undersøg
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation();
                            onMarkResolved?.(anomaly.id);
                          }}
                        >
                          Markér Løst
                        </Button>
                      </div>
                    )}
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
