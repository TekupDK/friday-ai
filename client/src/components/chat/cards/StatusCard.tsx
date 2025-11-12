/**
 * STATUS CARD - Status kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";

export interface StatusCardProps {
  status?: {
    id: string;
    service: string;
    status: "operational" | "degraded" | "partial" | "offline";
    message: string;
    lastChecked: string;
    uptime: string;
  };
  onRefresh?: () => void;
  onViewHistory?: () => void;
}

export function StatusCard({
  status = {
    id: "1",
    service: "API Server",
    status: "operational",
    message: "Alle systemer kører normalt",
    lastChecked: "for 2 minutter siden",
    uptime: "99.98%",
  },
  onRefresh,
  onViewHistory,
}: StatusCardProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-white" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-white" />;
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "operational":
        return "bg-emerald-600";
      case "degraded":
        return "bg-amber-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-blue-600";
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case "operational":
        return <Badge className="bg-green-500">Operationel</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500">Nedsat</Badge>;
      case "offline":
        return <Badge className="bg-red-500">Offline</Badge>;
      default:
        return <Badge className="bg-blue-500">Delvist</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                getStatusColor()
              )}
            >
              {getStatusIcon()}
            </div>
            <div>
              <h4 className="font-semibold">{status.service}</h4>
              <p className="text-xs text-muted-foreground">
                Tjekket {status.lastChecked}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <p className="text-sm text-muted-foreground">{status.message}</p>

        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
          <span className="text-xs text-muted-foreground">Uptime</span>
          <span className="text-sm font-semibold">{status.uptime}</span>
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" onClick={onRefresh}>
            <Activity className="w-3 h-3 mr-1" />
            Opdater
          </Button>
          <Button size="sm" variant="outline" onClick={onViewHistory}>
            Se historik
          </Button>
        </div>
      </div>
    </Card>
  );
}
