import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricData {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: typeof TrendingUp;
  color?: string;
}

const metrics: MetricData[] = [
  {
    label: "I Dag",
    value: "0",
    icon: Calendar,
    color: "text-blue-500",
  },
  {
    label: "Bookings",
    value: "0",
    icon: Users,
    color: "text-purple-500",
  },
  {
    label: "Conversion",
    value: "0%",
    trend: "neutral",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    label: "Revenue (kr)",
    value: "0",
    icon: DollarSign,
    color: "text-emerald-500",
  },
  {
    label: "New Leads",
    value: "0",
    icon: Users,
    color: "text-orange-500",
  },
  {
    label: "Estimated Profit",
    value: "0 kr",
    subtext: "This month",
    icon: DollarSign,
    color: "text-green-500",
  },
];

export function BusinessMetricsCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Business Dashboard</CardTitle>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 font-medium">100%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Overview af business activities and urgent actions
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon || Calendar;

            return (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={cn("w-4 h-4", metric.color)} />
                  {metric.trend && (
                    <div
                      className={cn(
                        "flex items-center gap-0.5 text-xs",
                        metric.trend === "up" && "text-green-500",
                        metric.trend === "down" && "text-red-500",
                        metric.trend === "neutral" && "text-muted-foreground"
                      )}
                    >
                      {metric.trend === "up" && (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {metric.trend === "down" && (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {metric.trendValue && <span>{metric.trendValue}</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.label}
                  </div>
                  {metric.subtext && (
                    <div className="text-xs text-muted-foreground/60">
                      {metric.subtext}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Alerts */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span className="text-xs font-medium">⚠️ Kræver Handling</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs">Ingen bookings i dag</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
