/**
 * Subscription Configuration
 *
 * Maps subscription plan types to Billy.dk product IDs and defines subscription plans
 */

import { ENV } from "./_core/env";

export type SubscriptionPlanType =
  | "tier1"
  | "tier2"
  | "tier3"
  | "flex_basis"
  | "flex_plus";

export interface SubscriptionPlanConfig {
  name: string;
  monthlyPrice: number; // in kr (NOT øre)
  includedHours: number;
  description: string;
  features: string[];
  billyProductId: string | null;
}

/**
 * Get Billy.dk product ID for a subscription plan type
 */
export function getBillyProductIdForPlan(
  planType: SubscriptionPlanType
): string | null {
  const mapping: Record<SubscriptionPlanType, string> = {
    tier1: ENV.billySubscriptionTier1ProductId,
    tier2: ENV.billySubscriptionTier2ProductId,
    tier3: ENV.billySubscriptionTier3ProductId,
    flex_basis: ENV.billySubscriptionFlexBasisProductId,
    flex_plus: ENV.billySubscriptionFlexPlusProductId,
  };

  const productId = mapping[planType];
  return productId || null;
}

/**
 * Get subscription plan configuration
 */
export function getSubscriptionPlanConfig(
  planType: SubscriptionPlanType
): SubscriptionPlanConfig {
  const configs: Record<SubscriptionPlanType, SubscriptionPlanConfig> = {
    tier1: {
      name: "Basis Abonnement",
      monthlyPrice: 1200,
      includedHours: 3,
      description: "1x månedlig rengøring (3 timer)",
      features: [
        "Månedlig rengøring",
        "3 timer inkluderet",
        "Grundlæggende support",
      ],
      billyProductId: getBillyProductIdForPlan("tier1"),
    },
    tier2: {
      name: "Premium Abonnement",
      monthlyPrice: 1800,
      includedHours: 4,
      description: "1x månedlig rengøring (4 timer) + Hovedrengøring",
      features: [
        "Månedlig rengøring",
        "4 timer inkluderet",
        "Hovedrengøring",
        "Prioriteret support",
      ],
      billyProductId: getBillyProductIdForPlan("tier2"),
    },
    tier3: {
      name: "VIP Abonnement",
      monthlyPrice: 2500,
      includedHours: 6,
      description: "2x månedlig rengøring (3 timer hver) + Hovedrengøring",
      features: [
        "2x månedlig rengøring",
        "6 timer inkluderet",
        "Hovedrengøring",
        "VIP support",
        "Prioriteret booking",
      ],
      billyProductId: getBillyProductIdForPlan("tier3"),
    },
    flex_basis: {
      name: "Flex Basis",
      monthlyPrice: 1000,
      includedHours: 2.5,
      description: "2.5 timer rengøring/måned (akkumuleres)",
      features: [
        "Fleksibel booking",
        "2.5 timer/måned",
        "Timer akkumuleres",
        "Grundlæggende support",
      ],
      billyProductId: getBillyProductIdForPlan("flex_basis"),
    },
    flex_plus: {
      name: "Flex Plus",
      monthlyPrice: 1500,
      includedHours: 4,
      description: "4 timer rengøring/måned (akkumuleres)",
      features: [
        "Fleksibel booking",
        "4 timer/måned",
        "Timer akkumuleres",
        "Prioriteret support",
      ],
      billyProductId: getBillyProductIdForPlan("flex_plus"),
    },
  };

  return configs[planType];
}

/**
 * Get all subscription plan configurations
 */
export function getAllSubscriptionPlans(): SubscriptionPlanConfig[] {
  return [
    getSubscriptionPlanConfig("tier1"),
    getSubscriptionPlanConfig("tier2"),
    getSubscriptionPlanConfig("tier3"),
    getSubscriptionPlanConfig("flex_basis"),
    getSubscriptionPlanConfig("flex_plus"),
  ];
}

/**
 * Validate that all subscription product IDs are configured
 * Returns an array of missing product IDs
 */
export function validateSubscriptionProductIds(): {
  valid: boolean;
  missing: SubscriptionPlanType[];
} {
  const plans: SubscriptionPlanType[] = [
    "tier1",
    "tier2",
    "tier3",
    "flex_basis",
    "flex_plus",
  ];

  const missing = plans.filter(plan => !getBillyProductIdForPlan(plan));

  return {
    valid: missing.length === 0,
    missing,
  };
}
