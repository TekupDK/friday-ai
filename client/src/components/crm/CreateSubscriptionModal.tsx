/**
 * CreateSubscriptionModal Component
 *
 * Modal form for creating a new subscription
 */

import { Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppleButton, AppleModal } from "./apple-ui";

import { trpc } from "@/lib/trpc";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerProfileId: number;
  onSuccess?: () => void;
}

const SUBSCRIPTION_PLANS = [
  {
    value: "tier1",
    label: "Basis Abonnement",
    price: "1,200 kr/måned",
    hours: "3 timer",
    description: "1x månedlig rengøring (3 timer)",
  },
  {
    value: "tier2",
    label: "Premium Abonnement",
    price: "1,800 kr/måned",
    hours: "4 timer",
    description: "1x månedlig rengøring (4 timer) + Hovedrengøring",
  },
  {
    value: "tier3",
    label: "VIP Abonnement",
    price: "2,500 kr/måned",
    hours: "6 timer",
    description: "2x månedlig rengøring (3 timer hver) + Hovedrengøring",
  },
  {
    value: "flex_basis",
    label: "Flex Basis",
    price: "1,000 kr/måned",
    hours: "2.5 timer",
    description: "2.5 timer rengøring/måned (akkumuleres)",
  },
  {
    value: "flex_plus",
    label: "Flex Plus",
    price: "1,500 kr/måned",
    hours: "4 timer",
    description: "4 timer rengøring/måned (akkumuleres)",
  },
] as const;

export function CreateSubscriptionModal({
  isOpen,
  onClose,
  customerProfileId,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    planType: "tier1" as
      | "tier1"
      | "tier2"
      | "tier3"
      | "flex_basis"
      | "flex_plus",
    autoRenew: true,
    startDate: new Date().toISOString().split("T")[0], // Today's date
  });

  const utils = trpc.useUtils();

  // Get AI recommendation
  const { data: recommendation, isLoading: isLoadingRecommendation } =
    trpc.subscription.getRecommendation.useQuery(
      {
        customerProfileId,
        includeReasoning: true,
      },
      {
        enabled: isOpen && !!customerProfileId,
        refetchOnWindowFocus: false,
      }
    );

  // Auto-select recommended plan when recommendation loads
  useEffect(() => {
    if (recommendation?.recommendedPlan && !formData.planType) {
      setFormData(prev => ({
        ...prev,
        planType: recommendation.recommendedPlan,
      }));
    }
  }, [recommendation]);

  const createMutation = trpc.subscription.create.useMutation({
    onSuccess: () => {
      utils.subscription.list.invalidate({ customerProfileId });
      toast.success("Subscription created successfully");
      onClose();
      onSuccess?.();
      // Reset form
      setFormData({
        planType: "tier1",
        autoRenew: true,
        startDate: new Date().toISOString().split("T")[0],
      });
    },
    onError: error => {
      toast.error(error.message || "Failed to create subscription");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      customerProfileId,
      planType: formData.planType,
      startDate: formData.startDate,
      autoRenew: formData.autoRenew,
    });
  };

  const handleClose = () => {
    setFormData({
      planType: "tier1",
      autoRenew: true,
      startDate: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Subscription"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Recommendation */}
        {recommendation && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  AI Anbefaling ({recommendation.confidence}% konfidens)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {recommendation.reasoning}
                </p>
                <AppleButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      planType: recommendation.recommendedPlan,
                    }))
                  }
                >
                  Vælg Anbefalet Plan
                </AppleButton>
              </div>
            </div>
          </div>
        )}

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Select Plan *
          </label>
          <div className="space-y-2">
            {SUBSCRIPTION_PLANS.map(plan => (
              <label
                key={plan.value}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.planType === plan.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  value={plan.value}
                  checked={formData.planType === plan.value}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      planType: e.target.value as typeof formData.planType,
                    })
                  }
                  className="sr-only"
                />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{plan.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{plan.price}</div>
                    <div className="text-xs text-muted-foreground">
                      {plan.hours}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date *
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={e =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Auto Renew */}
        <div className="flex items-center gap-2">
          <input
            id="autoRenew"
            type="checkbox"
            checked={formData.autoRenew}
            onChange={e =>
              setFormData({ ...formData, autoRenew: e.target.checked })
            }
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="autoRenew" className="text-sm">
            Auto-renew subscription monthly
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <AppleButton
            type="button"
            variant="tertiary"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </AppleButton>
          <AppleButton type="submit" loading={createMutation.isPending}>
            Create Subscription
          </AppleButton>
        </div>
      </form>
    </AppleModal>
  );
}
