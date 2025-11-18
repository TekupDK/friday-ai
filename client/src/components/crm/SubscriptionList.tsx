/**
 * SubscriptionList Component
 *
 * Displays list of subscriptions for a customer
 */

import { Plus, Repeat } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleCard, AppleModal } from "./apple-ui";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";
import { SubscriptionCard } from "./SubscriptionCard";
import { SubscriptionUsageDisplay } from "./SubscriptionUsageDisplay";
import { CreateSubscriptionModal } from "./CreateSubscriptionModal";
import { trpc } from "@/lib/trpc";

interface SubscriptionListProps {
  customerProfileId: number;
}

export function SubscriptionList({ customerProfileId }: SubscriptionListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const utils = trpc.useUtils();

  const {
    data: subscriptions,
    isLoading,
    error,
    isError,
  } = trpc.subscription.list.useQuery({
    customerProfileId,
    status: "all",
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      utils.subscription.list.invalidate({ customerProfileId });
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

  if (isLoading) {
    return <LoadingSpinner message="Loading subscriptions..." />;
  }

  if (isError) {
    return <ErrorDisplay message="Failed to load subscriptions" error={error} />;
  }

  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || [];
  const otherSubscriptions = subscriptions?.filter(s => s.status !== "active") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscriptions</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer subscriptions and billing
          </p>
        </div>
        <AppleButton
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Subscription
        </AppleButton>
      </div>

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Subscriptions</h3>
          <div className="space-y-6">
            {activeSubscriptions.map(subscription => (
              <div key={subscription.id} className="space-y-4">
                <SubscriptionCard
                  subscription={subscription}
                  onCancel={handleCancel}
                  showChurnRisk={true}
                />
                <SubscriptionUsageDisplay subscriptionId={subscription.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Subscriptions */}
      {otherSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Other Subscriptions ({otherSubscriptions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {subscriptions && subscriptions.length === 0 && (
        <AppleCard variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Repeat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a subscription to set up recurring billing for this customer
            </p>
            <AppleButton
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Subscription
            </AppleButton>
          </div>
        </AppleCard>
      )}

      {/* Create Modal */}
      <CreateSubscriptionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customerProfileId={customerProfileId}
        onSuccess={() => {
          setShowCreateModal(false);
          utils.subscription.list.invalidate({ customerProfileId });
        }}
      />
    </div>
  );
}

