/**
 * SubscriptionManagement Component
 *
 * Standalone component for managing all subscriptions
 * - List all subscriptions
 * - Filter by status
 * - Actions: pause, cancel, upgrade, downgrade
 */

import { Filter, Pause, Play, TrendingDown, TrendingUp, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { SubscriptionCard } from "@/components/crm/SubscriptionCard";
import { trpc } from "@/lib/trpc";

type SubscriptionStatus = "all" | "active" | "paused" | "cancelled" | "expired";

export interface SubscriptionManagementProps {
  customerProfileId?: number;
  showFilters?: boolean;
  className?: string;
}

export function SubscriptionManagement({
  customerProfileId,
  showFilters = true,
  className = "",
}: SubscriptionManagementProps) {
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus>("all");

  const utils = trpc.useUtils();

  const {
    data: subscriptions,
    isLoading,
    error,
    isError,
  } = trpc.subscription.list.useQuery(
    {
      customerProfileId,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      enabled: true,
    }
  );

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      utils.subscription.list.invalidate();
      toast.success("Subscription cancelled successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const handleCancel = async (subscriptionId: number) => {
    if (
      !confirm(
        "Are you sure you want to cancel this subscription? This action cannot be undone."
      )
    ) {
      return;
    }

    await cancelMutation.mutateAsync({
      subscriptionId,
      reason: "Cancelled by user",
    });
  };

  const handlePause = async (subscriptionId: number) => {
    // TODO: Implement pause functionality when backend supports it
    toast.info("Pause functionality coming soon");
  };

  const handleResume = async (subscriptionId: number) => {
    // TODO: Implement resume functionality when backend supports it
    toast.info("Resume functionality coming soon");
  };

  const handleUpgrade = async (subscriptionId: number, currentPlan: string) => {
    // TODO: Implement upgrade functionality
    toast.info("Upgrade functionality coming soon");
  };

  const handleDowngrade = async (subscriptionId: number, currentPlan: string) => {
    // TODO: Implement downgrade functionality
    toast.info("Downgrade functionality coming soon");
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading subscriptions..." />;
  }

  if (isError) {
    return <ErrorDisplay message="Failed to load subscriptions" error={error} />;
  }

  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || [];
  const pausedSubscriptions = subscriptions?.filter(s => s.status === "paused") || [];
  const cancelledSubscriptions = subscriptions?.filter(s => s.status === "cancelled") || [];
  const expiredSubscriptions = subscriptions?.filter(s => s.status === "expired") || [];

  const filteredSubscriptions =
    statusFilter === "all"
      ? subscriptions || []
      : subscriptions?.filter(s => s.status === statusFilter) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground mt-1">
            {subscriptions?.length || 0} subscription{subscriptions?.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
          {(["all", "active", "paused", "cancelled", "expired"] as SubscriptionStatus[]).map(
            status => (
              <AppleButton
                key={status}
                type="button"
                variant={statusFilter === status ? "primary" : "tertiary"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-2 text-xs">
                    (
                    {
                      status === "active"
                        ? activeSubscriptions.length
                        : status === "paused"
                          ? pausedSubscriptions.length
                          : status === "cancelled"
                            ? cancelledSubscriptions.length
                            : expiredSubscriptions.length
                    }
                    )
                  </span>
                )}
              </AppleButton>
            )
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppleCard variant="elevated" padding="md">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeSubscriptions.length}
            </p>
          </div>
        </AppleCard>
        <AppleCard variant="elevated" padding="md">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paused</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pausedSubscriptions.length}
            </p>
          </div>
        </AppleCard>
        <AppleCard variant="elevated" padding="md">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {cancelledSubscriptions.length}
            </p>
          </div>
        </AppleCard>
        <AppleCard variant="elevated" padding="md">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {expiredSubscriptions.length}
            </p>
          </div>
        </AppleCard>
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <AppleCard variant="elevated" padding="lg">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "No subscriptions found"
                : `No ${statusFilter} subscriptions found`}
            </p>
          </div>
        </AppleCard>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map(subscription => (
            <AppleCard key={subscription.id} variant="elevated" padding="md">
              <div className="flex items-start justify-between gap-4">
                {/* Subscription Info */}
                <div className="flex-1">
                  <SubscriptionCard
                    subscription={subscription}
                    onCancel={handleCancel}
                    showChurnRisk={subscription.status === "active"}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {subscription.status === "active" && (
                    <>
                      <AppleButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePause(subscription.id)}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </AppleButton>
                      <AppleButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpgrade(subscription.id, subscription.planType)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Upgrade
                      </AppleButton>
                      <AppleButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDowngrade(subscription.id, subscription.planType)}
                      >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Downgrade
                      </AppleButton>
                      <AppleButton
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleCancel(subscription.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </AppleButton>
                    </>
                  )}
                  {subscription.status === "paused" && (
                    <AppleButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleResume(subscription.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </AppleButton>
                  )}
                </div>
              </div>
            </AppleCard>
          ))}
        </div>
      )}
    </div>
  );
}

