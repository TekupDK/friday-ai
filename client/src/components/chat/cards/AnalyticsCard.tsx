/**
 * ANALYTICS CARD - Analyse kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";

export interface AnalyticsCardProps {
  analytics?: {
    id: string;
    title: string;
    value: string;
    change: number;
    trend: "up" | "down" | "stable";
    period: string;
    data: number[];
  };
  onViewDetails?: () => void;
  onExport?: () => void;
}

export function AnalyticsCard({
  analytics = {
    id: "1",
    title: "Månedlig Omsætning",
    value: "245,650 DKK",
    change: 12.5,
    trend: "up",
    period: "Januar 2024",
    data: [30, 45, 38, 52, 48, 65, 72],
  },
  onViewDetails,
  onExport,
}: AnalyticsCardProps) {
  const getTrendIcon = () => {
    return analytics.trend === "up" ? (
      <TrendingUp className="w-5 h-5 text-white" />
    ) : (
      <TrendingDown className="w-5 h-5 text-white" />
    );
  };

  const getTrendColor = () => {
    if (analytics.trend === "up") return "bg-emerald-600";
    if (analytics.trend === "down") return "bg-red-500";
    return "bg-blue-600";
  };

  const getChangeIcon = () => {
    return analytics.change > 0 ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                getTrendColor()
              )}
            >
              {getTrendIcon()}
            </div>
            <div>
              <h4 className="font-semibold">{analytics.title}</h4>
              <p className="text-xs text-muted-foreground">
                {analytics.period}
              </p>
            </div>
          </div>
          <Badge
            className={cn(analytics.change > 0 ? "bg-green-500" : "bg-red-500")}
          >
            {getChangeIcon()}
            {Math.abs(analytics.change)}%
          </Badge>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-2xl font-bold">{analytics.value}</p>
          <div className="mt-2 flex items-end gap-1 h-12">
            {analytics.data.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-indigo-500 rounded-t"
                style={{
                  height: `${(value / Math.max(...analytics.data)) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" onClick={onViewDetails}>
            <BarChart className="w-3 h-3 mr-1" />
            Se detaljer
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            Eksporter
          </Button>
        </div>
      </div>
    </Card>
  );
}
