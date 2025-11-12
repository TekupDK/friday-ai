import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatData {
  label: string;
  value: number;
  target: number;
  prefix?: string;
  suffix?: string;
  icon: typeof DollarSign;
  color: string;
  trend: "up" | "down";
}

const stats: StatData[] = [
  {
    label: "Revenue",
    value: 0,
    target: 125000,
    prefix: "",
    suffix: " kr",
    icon: DollarSign,
    color: "text-green-500",
    trend: "up",
  },
  {
    label: "New Leads",
    value: 0,
    target: 48,
    icon: Users,
    color: "text-blue-500",
    trend: "up",
  },
  {
    label: "Conversion",
    value: 0,
    target: 68,
    suffix: "%",
    icon: Target,
    color: "text-purple-500",
    trend: "up",
  },
  {
    label: "Active Tasks",
    value: 0,
    target: 12,
    icon: Zap,
    color: "text-orange-500",
    trend: "down",
  },
];

export function AnimatedStatsCard() {
  const [animatedStats, setAnimatedStats] = useState(
    stats.map(s => ({ ...s, value: 0 }))
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Animate numbers
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setAnimatedStats(prev =>
        prev.map(stat => {
          if (stat.value < stat.target) {
            const increment = stat.target / steps;
            return {
              ...stat,
              value: Math.min(stat.value + increment, stat.target),
            };
          }
          return stat;
        })
      );
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {animatedStats.map((stat, idx) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <Card
            key={stat.label}
            className={cn(
              "relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-lg",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{
              transitionDelay: `${idx * 100}ms`,
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br from-primary/10 to-primary/5",
                    "group-hover:scale-110"
                  )}
                >
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    stat.trend === "up"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  <TrendIcon className="w-3 h-3" />
                  <span>
                    {stat.trend === "up" ? "+" : "-"}
                    {Math.round(Math.random() * 20 + 5)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">
                  {stat.prefix}
                  {Math.round(stat.value).toLocaleString("da-DK")}
                  {stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>

              {/* Progress bar animation */}
              <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    stat.color.replace("text-", "bg-")
                  )}
                  style={{
                    width: `${(stat.value / stat.target) * 100}%`,
                  }}
                />
              </div>
            </CardContent>

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </Card>
        );
      })}
    </div>
  );
}
