/**
 * SubscriptionPlanSelector Component
 *
 * Standalone component for displaying and selecting subscription plans
 */

import { Check, Sparkles } from "lucide-react";
import React, { useState } from "react";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import { trpc } from "@/lib/trpc";

export interface SubscriptionPlanSelectorProps {
  customerProfileId?: number;
  onSelectPlan?: (planType: string) => void;
  showRecommendation?: boolean;
  className?: string;
}

const SUBSCRIPTION_PLANS = [
  {
    value: "tier1",
    label: "Basis Abonnement",
    price: 1200,
    hours: 3,
    description: "1x månedlig rengøring (3 timer)",
    features: ["Månedlig rengøring", "3 timer inkluderet", "Grundlæggende support"],
    popular: false,
  },
  {
    value: "tier2",
    label: "Premium Abonnement",
    price: 1800,
    hours: 4,
    description: "1x månedlig rengøring (4 timer) + Hovedrengøring",
    features: ["Månedlig rengøring", "4 timer inkluderet", "Hovedrengøring", "Prioriteret support"],
    popular: true,
  },
  {
    value: "tier3",
    label: "VIP Abonnement",
    price: 2500,
    hours: 6,
    description: "2x månedlig rengøring (3 timer hver) + Hovedrengøring",
    features: [
      "2x månedlig rengøring",
      "6 timer inkluderet",
      "Hovedrengøring",
      "VIP support",
      "Prioriteret booking",
    ],
    popular: false,
  },
  {
    value: "flex_basis",
    label: "Flex Basis",
    price: 1000,
    hours: 2.5,
    description: "2.5 timer rengøring/måned (akkumuleres)",
    features: ["Fleksibel booking", "2.5 timer/måned", "Timer akkumuleres", "Grundlæggende support"],
    popular: false,
  },
  {
    value: "flex_plus",
    label: "Flex Plus",
    price: 1500,
    hours: 4,
    description: "4 timer rengøring/måned (akkumuleres)",
    features: [
      "Fleksibel booking",
      "4 timer/måned",
      "Timer akkumuleres",
      "Prioriteret support",
    ],
    popular: false,
  },
] as const;

export function SubscriptionPlanSelector({
  customerProfileId,
  onSelectPlan,
  showRecommendation = true,
  className = "",
}: SubscriptionPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get AI recommendation if customerProfileId provided
  const {
    data: recommendation,
    isLoading: isLoadingRecommendation,
  } = trpc.subscription.getRecommendation.useQuery(
    {
      customerProfileId: customerProfileId!,
      includeReasoning: true,
    },
    {
      enabled: showRecommendation && !!customerProfileId,
      refetchOnWindowFocus: false,
    }
  );

  const handleSelectPlan = (planType: string) => {
    setSelectedPlan(planType);
    onSelectPlan?.(planType);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Recommendation Banner */}
      {showRecommendation && recommendation && customerProfileId && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
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
                onClick={() => handleSelectPlan(recommendation.recommendedPlan)}
              >
                Vælg Anbefalet Plan
              </AppleButton>
            </div>
          </div>
        </div>
      )}

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.map(plan => {
          const isSelected = selectedPlan === plan.value;
          const isRecommended =
            recommendation?.recommendedPlan === plan.value && showRecommendation;

          return (
            <AppleCard
              key={plan.value}
              variant="elevated"
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${plan.popular ? "border-primary/50" : ""}`}
              onClick={() => handleSelectPlan(plan.value)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Mest Populær
                </div>
              )}

              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute top-0 left-0 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-br-lg rounded-tl-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Anbefalet
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Header */}
                <div>
                  <h3 className="font-bold text-xl mb-1">{plan.label}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {plan.price.toLocaleString("da-DK")} kr
                  </span>
                  <span className="text-muted-foreground">/måned</span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{plan.hours} timer</span>
                  <span className="text-muted-foreground">inkluderet</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <AppleButton
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  className="w-full"
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectPlan(plan.value);
                  }}
                >
                  {isSelected ? "Valgt" : "Vælg Plan"}
                </AppleButton>
              </div>
            </AppleCard>
          );
        })}
      </div>
    </div>
  );
}

