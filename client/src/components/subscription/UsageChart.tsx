/**
 * UsageChart Component
 *
 * Visualizes subscription usage over time with overage warnings
 */

import { AlertTriangle, Calendar, Clock, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

import { AppleCard } from "@/components/crm/apple-ui";
import { trpc } from "@/lib/trpc";

export interface UsageChartProps {
  subscriptionId: number;
  months?: number; // Number of months to display (default: 6)
  showOverageWarnings?: boolean;
  className?: string;
}

interface MonthData {
  month: string;
  year: number;
  monthNumber: number;
  hoursUsed: number;
  includedHours: number;
  percentage: number;
  hasOverage: boolean;
  overageHours: number;
}

export function UsageChart({
  subscriptionId,
  months = 6,
  showOverageWarnings = true,
  className = "",
}: UsageChartProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Generate list of months to fetch
  const monthsToFetch = useMemo(() => {
    const monthsList: Array<{ year: number; month: number }> = [];
    for (let i = 0; i < months; i++) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      monthsList.unshift({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
    return monthsList;
  }, [months, currentYear, currentMonth]);

  // Fetch usage data for all months
  const usageQueries = monthsToFetch.map(({ year, month }) =>
    trpc.subscription.getUsage.useQuery(
      {
        subscriptionId,
        year,
        month,
      },
      {
        enabled: !!subscriptionId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    )
  );

  const isLoading = usageQueries.some(q => q.isLoading);
  const hasError = usageQueries.some(q => q.isError);

  // Process data for chart
  const chartData: MonthData[] = useMemo(() => {
    return monthsToFetch.map(({ year, month }, index) => {
      const query = usageQueries[index];
      const usageData = query.data;

      if (!usageData) {
        return {
          month: new Date(year, month - 1).toLocaleDateString("da-DK", {
            month: "short",
            year: "numeric",
          }),
          year,
          monthNumber: month,
          hoursUsed: 0,
          includedHours: 0,
          percentage: 0,
          hasOverage: false,
          overageHours: 0,
        };
      }

      const hoursUsed = usageData.totalUsage || 0;
      const includedHours = Number(usageData.includedHours || 0);
      const percentage =
        includedHours > 0 ? (hoursUsed / includedHours) * 100 : 0;
      const hasOverage = usageData.overage?.hasOverage || false;
      const overageHours = usageData.overage?.overageHours || 0;

      return {
        month: new Date(year, month - 1).toLocaleDateString("da-DK", {
          month: "short",
          year: "numeric",
        }),
        year,
        monthNumber: month,
        hoursUsed,
        includedHours,
        percentage: Math.min(100, percentage),
        hasOverage,
        overageHours,
      };
    });
  }, [usageQueries, monthsToFetch]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsed = chartData.reduce((sum, d) => sum + d.hoursUsed, 0);
    const totalIncluded = chartData.reduce(
      (sum, d) => sum + d.includedHours,
      0
    );
    const averageUsage =
      chartData.length > 0 ? totalUsed / chartData.length : 0;
    const monthsWithOverage = chartData.filter(d => d.hasOverage).length;
    const maxUsage = Math.max(...chartData.map(d => d.hoursUsed), 0);

    return {
      totalUsed,
      totalIncluded,
      averageUsage,
      monthsWithOverage,
      maxUsage,
      utilizationRate:
        totalIncluded > 0 ? (totalUsed / totalIncluded) * 100 : 0,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <AppleCard variant="elevated" padding="lg" className={className}>
        <div className="text-center py-8 text-muted-foreground">
          Loading usage data...
        </div>
      </AppleCard>
    );
  }

  if (hasError) {
    return (
      <AppleCard variant="elevated" padding="lg" className={className}>
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Failed to load usage data
        </div>
      </AppleCard>
    );
  }

  const maxHours = Math.max(
    ...chartData.map(d => Math.max(d.hoursUsed, d.includedHours)),
    1
  );

  return (
    <AppleCard variant="elevated" padding="lg" className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Usage Over Time</h3>
            <p className="text-sm text-muted-foreground">
              Last {months} months
            </p>
          </div>
          {showOverageWarnings && stats.monthsWithOverage > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {stats.monthsWithOverage} month
                {stats.monthsWithOverage !== 1 ? "s" : ""} with overage
              </span>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Used</p>
            <p className="text-lg font-semibold">
              {stats.totalUsed.toFixed(1)} timer
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average/Month</p>
            <p className="text-lg font-semibold">
              {stats.averageUsage.toFixed(1)} timer
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-lg font-semibold">
              {stats.utilizationRate.toFixed(0)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Peak Usage</p>
            <p className="text-lg font-semibold">
              {stats.maxUsage.toFixed(1)} timer
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          {chartData.map((data, index) => (
            <div key={`${data.year}-${data.monthNumber}`} className="space-y-2">
              {/* Month Label */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {data.hoursUsed.toFixed(1)} / {data.includedHours} timer
                  </span>
                  {data.hasOverage && (
                    <span className="text-red-600 dark:text-red-400 font-medium text-xs">
                      +{data.overageHours.toFixed(1)} over
                    </span>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="relative">
                {/* Background (included hours) */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  {/* Used hours */}
                  <div
                    className={`h-full transition-all ${
                      data.hasOverage
                        ? "bg-red-500"
                        : data.percentage >= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (data.hoursUsed / maxHours) * 100)}%`,
                    }}
                  />
                  {/* Included hours limit line */}
                  {data.includedHours > 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 dark:bg-blue-400"
                      style={{
                        left: `${(data.includedHours / maxHours) * 100}%`,
                      }}
                    />
                  )}
                </div>

                {/* Overage indicator */}
                {data.hasOverage && (
                  <div
                    className="absolute top-0 bottom-0 bg-red-600 dark:bg-red-500 opacity-50"
                    style={{
                      left: `${(data.includedHours / maxHours) * 100}%`,
                      width: `${((data.hoursUsed - data.includedHours) / maxHours) * 100}%`,
                    }}
                  />
                )}
              </div>

              {/* Percentage */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(data.percentage)}% used</span>
                {data.hasOverage && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Overage: {(data.overageHours * 349).toLocaleString("da-DK")}{" "}
                    kr
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Normal usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Near limit (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Overage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3 bg-blue-500" />
              <span>Included limit</span>
            </div>
          </div>
        </div>
      </div>
    </AppleCard>
  );
}
