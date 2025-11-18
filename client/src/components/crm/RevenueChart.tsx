/**
 * RevenueChart Component
 *
 * Displays revenue forecast visualization using pipeline stats and revenue forecast
 */

import { AppleCard } from "./apple-ui";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";

import { trpc } from "@/lib/trpc";

export function RevenueChart() {
  const {
    data: pipelineStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = trpc.crm.extensions.getPipelineStats.useQuery();

  const {
    data: revenueForecast,
    isLoading: isLoadingForecast,
    error: forecastError,
  } = trpc.crm.extensions.getRevenueForecast.useQuery();

  const isLoading = isLoadingStats || isLoadingForecast;
  const error = statsError || forecastError;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <LoadingSpinner message="Loading revenue forecast..." />
      </AppleCard>
    );
  }

  if (error) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <ErrorDisplay message="Failed to load revenue forecast" error={error} />
      </AppleCard>
    );
  }

  const totalValue = revenueForecast?.totalValue || 0;
  const weightedValue = revenueForecast?.weightedValue || 0;
  const opportunityCount = revenueForecast?.count || 0;

  // Calculate stage breakdown
  const stageBreakdown =
    pipelineStats?.reduce(
      (acc, stat) => {
        acc[stat.stage] = {
          count: stat.count,
          totalValue: stat.totalValue,
          avgProbability: stat.avgProbability,
        };
        return acc;
      },
      {} as Record<
        string,
        { count: number; totalValue: number; avgProbability: number }
      >
    ) || {};

  const activeStages = ["lead", "qualified", "proposal", "negotiation"];
  const activeValue = activeStages.reduce(
    (sum, stage) => sum + (stageBreakdown[stage]?.totalValue || 0),
    0
  );

  return (
    <AppleCard variant="elevated" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Revenue Forecast</h3>
          <p className="text-sm text-muted-foreground">
            Pipeline value and weighted forecast
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Total Pipeline Value
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {opportunityCount} opportunities
            </p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Weighted Forecast
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(weightedValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Probability-adjusted
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Active Pipeline
            </p>
            <p className="text-2xl font-bold">{formatCurrency(activeValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Excluding won/lost
            </p>
          </div>
        </div>

        {/* Stage Breakdown */}
        {pipelineStats && pipelineStats.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Pipeline by Stage</h4>
            <div className="space-y-2">
              {pipelineStats.map(stat => (
                <div
                  key={stat.stage}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {stat.stage}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stat.count} deals
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Value: {formatCurrency(stat.totalValue)}</span>
                      {stat.avgProbability > 0 && (
                        <span>Avg Probability: {stat.avgProbability}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!pipelineStats || pipelineStats.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No opportunities in pipeline</p>
            <p className="text-xs mt-1">
              Create opportunities to see revenue forecast
            </p>
          </div>
        )}
      </div>
    </AppleCard>
  );
}
