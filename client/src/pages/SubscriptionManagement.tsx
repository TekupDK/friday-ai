/**
 * Subscription Management Page
 *
 * Main page for managing all subscriptions with dashboard metrics
 */

import { BarChart3, Calendar, CreditCard, TrendingUp, Users } from "lucide-react";
import React from "react";

import { AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { SubscriptionManagement, UsageChart } from "@/components/subscription";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

export default function SubscriptionManagementPage() {
  usePageTitle("Subscription Management");

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    isError: isStatsError,
  } = trpc.subscription.stats.useQuery();

  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
  } = trpc.subscription.list.useQuery({});

  const isLoading = isLoadingStats || isLoadingSubscriptions;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 0,
    }).format(value / 100); // Convert from øre to kr
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("da-DK").format(num);
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Subscription Management">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Subscription Management</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage all subscriptions, track usage, and monitor revenue
                  </p>
                </div>
              </div>
            </header>

            {/* Loading state */}
            {isLoading && (
              <div className="py-12">
                <LoadingSpinner message="Loading subscription data..." />
              </div>
            )}

            {/* Error state */}
            {isStatsError && statsError && (
              <ErrorDisplay message="Failed to load subscription statistics" error={statsError} />
            )}

            {/* Dashboard Stats */}
            {!isLoading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MRR */}
                <AppleCard variant="elevated" padding="md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.mrr || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      ARR: {formatCurrency(stats.arr || 0)}
                    </p>
                  </div>
                </AppleCard>

                {/* Active Subscriptions */}
                <AppleCard variant="elevated" padding="md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(stats.active || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(stats.total || 0)} total
                    </p>
                  </div>
                </AppleCard>

                {/* ARPU */}
                <AppleCard variant="elevated" padding="md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Average Revenue Per User</p>
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.arpu || 0)}</p>
                    <p className="text-xs text-muted-foreground">Per month</p>
                  </div>
                </AppleCard>

                {/* Churn Rate */}
                <AppleCard variant="elevated" padding="md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Churn Rate</p>
                      <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">
                      {stats.cancelled > 0 && stats.active > 0
                        ? `${((stats.cancelled / (stats.active + stats.cancelled)) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.cancelled} cancelled
                    </p>
                  </div>
                </AppleCard>
              </div>
            )}

            {/* Subscription Management Component */}
            {!isLoading && (
              <div className="space-y-6">
                <SubscriptionManagement showFilters={true} />

                {/* Usage Charts for Active Subscriptions */}
                {subscriptions && subscriptions.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Usage Analytics</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {subscriptions
                        .filter(sub => sub.status === "active")
                        .slice(0, 4)
                        .map(subscription => (
                          <UsageChart
                            key={subscription.id}
                            subscriptionId={subscription.id}
                            months={6}
                            showOverageWarnings={true}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}

