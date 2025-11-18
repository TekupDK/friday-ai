/**
 * SubscriptionCard Component
 *
 * Displays subscription information in a card format
 */

import { AlertTriangle, Calendar, Clock, CreditCard, X } from "lucide-react";
import React from "react";

import { AppleButton, AppleCard } from "./apple-ui";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";

import { trpc } from "@/lib/trpc";

interface SubscriptionCardProps {
  subscription: {
    id: number;
    planType: string;
    monthlyPrice: number;
    includedHours: string;
    status: "active" | "paused" | "cancelled" | "expired";
    startDate: string;
    nextBillingDate: string | null;
    autoRenew: boolean;
    customerProfileId: number;
  };
  onCancel?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  showChurnRisk?: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  tier1: "Basis Abonnement",
  tier2: "Premium Abonnement",
  tier3: "VIP Abonnement",
  flex_basis: "Flex Basis",
  flex_plus: "Flex Plus",
};

export function SubscriptionCard({
  subscription,
  onCancel,
  onViewDetails,
  showChurnRisk = false,
}: SubscriptionCardProps) {
  const planName = PLAN_NAMES[subscription.planType] || subscription.planType;
  const priceInDkk = subscription.monthlyPrice / 100; // Convert from øre to DKK

  // Get churn risk if enabled
  const { data: churnRisk } = trpc.subscription.predictChurnRisk.useQuery(
    {
      customerProfileId: subscription.customerProfileId,
    },
    {
      enabled: showChurnRisk && subscription.status === "active",
    }
  );

  return (
    <AppleCard variant="elevated" className="hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{planName}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <SubscriptionStatusBadge status={subscription.status} />
              {churnRisk && churnRisk.churnRisk >= 50 && (
                <span
                  className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                    churnRisk.churnRisk >= 70
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                  title={`Churn risk: ${churnRisk.churnRisk}% - ${churnRisk.timeline}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {churnRisk.churnRisk}% risk
                </span>
              )}
            </div>
          </div>
          {onViewDetails && (
            <AppleButton
              variant="tertiary"
              size="sm"
              onClick={() => onViewDetails(subscription.id)}
            >
              View
            </AppleButton>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              {priceInDkk.toLocaleString("da-DK")} kr/måned
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Included hours:</span>
            <span className="font-medium">
              {subscription.includedHours} timer/måned
            </span>
          </div>

          {subscription.nextBillingDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next billing:</span>
              <span className="font-medium">
                {new Date(subscription.nextBillingDate).toLocaleDateString(
                  "da-DK"
                )}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Auto-renew:</span>
            <span
              className={`font-medium ${subscription.autoRenew ? "text-green-600" : "text-gray-500"}`}
            >
              {subscription.autoRenew ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Actions */}
        {subscription.status === "active" && onCancel && (
          <div className="pt-4 border-t border-border">
            <AppleButton
              variant="tertiary"
              size="sm"
              onClick={() => onCancel(subscription.id)}
              leftIcon={<X className="w-4 h-4" />}
              className="w-full"
            >
              Cancel Subscription
            </AppleButton>
          </div>
        )}
      </div>
    </AppleCard>
  );
}
