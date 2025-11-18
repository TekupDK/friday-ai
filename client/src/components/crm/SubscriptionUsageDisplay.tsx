/**
 * SubscriptionUsageDisplay Component
 *
 * Displays subscription usage with overage warnings
 */

import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import React from "react";

import { AppleCard } from "./apple-ui";

import { trpc } from "@/lib/trpc";

interface SubscriptionUsageDisplayProps {
  subscriptionId: number;
  year?: number;
  month?: number;
}

export function SubscriptionUsageDisplay({
  subscriptionId,
  year,
  month,
}: SubscriptionUsageDisplayProps) {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const currentMonth = month || now.getMonth() + 1;

  const { data: usageData, isLoading } = trpc.subscription.getUsage.useQuery(
    {
      subscriptionId,
      year: currentYear,
      month: currentMonth,
    },
    {
      enabled: !!subscriptionId,
    }
  );

  if (isLoading) {
    return (
      <AppleCard variant="elevated" padding="md">
        <div className="text-center py-4 text-muted-foreground">
          Loading usage data...
        </div>
      </AppleCard>
    );
  }

  if (!usageData) {
    return null;
  }

  const { subscription, totalUsage, includedHours, overage } = usageData;
  const hoursUsed = totalUsage || 0;
  const included = Number(includedHours);
  const usagePercentage = included > 0 ? (hoursUsed / included) * 100 : 0;
  const hasOverage = overage?.hasOverage || false;
  const overageHours = overage?.overageHours || 0;

  // Calculate cost for overage (349 kr/hour)
  const HOURLY_RATE = 349;
  const overageCost = overageHours * HOURLY_RATE;

  return (
    <AppleCard variant="elevated" padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Usage Tracking</h3>
          <span className="text-sm text-muted-foreground">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString(
              "da-DK",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </span>
        </div>

        {/* Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hours Used</span>
            <span className="font-medium">
              {hoursUsed.toFixed(1)} / {included} timer
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                hasOverage
                  ? "bg-red-500"
                  : usagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(usagePercentage)}% used</span>
            {hasOverage && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                +{overageHours.toFixed(1)} timer over
              </span>
            )}
          </div>
        </div>

        {/* Overage Warning */}
        {hasOverage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-1">
                  Overage Detected
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Kunden har brugt {overageHours.toFixed(1)} timer mere end
                  inkluderet i abonnementet.
                </p>
                <div className="text-sm font-medium">
                  Estimeret ekstra kost: {overageCost.toLocaleString("da-DK")}{" "}
                  kr
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Warning (80%+) */}
        {!hasOverage && usagePercentage >= 80 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                  Nær Overage
                </h4>
                <p className="text-sm text-muted-foreground">
                  Kunden har brugt {Math.round(usagePercentage)}% af inkluderede
                  timer. Overvej at opgradere plan hvis dette fortsætter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Details */}
        {usageData.usage && usageData.usage.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-2">Usage History</h4>
            <div className="space-y-2">
              {usageData.usage.slice(0, 5).map((usage: any) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(usage.date).toLocaleDateString("da-DK")}
                    </span>
                  </div>
                  <span className="font-medium">
                    {Number(usage.hoursUsed).toFixed(1)} timer
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppleCard>
  );
}
