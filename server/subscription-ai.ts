/**
 * Subscription AI Features
 *
 * AI-powered features for subscription management including recommendations,
 * churn prediction, and usage optimization.
 */

import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";

import {
  customerProfiles,
  customerProperties,
  bookings,
  subscriptionUsage,
} from "../drizzle/schema";

import { routeAI } from "./ai-router";
import { getDb } from "./db";
import {
  getSubscriptionByCustomerId,
  getSubscriptionById,
} from "./subscription-db";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanType,
} from "./subscription-helpers";

export interface SubscriptionRecommendation {
  recommendedPlan: SubscriptionPlanType;
  confidence: number; // 0-100
  reasoning: string;
  alternatives: Array<{
    plan: SubscriptionPlanType;
    pros: string[];
    cons: string[];
  }>;
}

/**
 * Get AI-powered subscription plan recommendation for a customer
 */
export async function recommendSubscriptionPlan(
  customerId: number,
  userId: number,
  includeReasoning: boolean = true
): Promise<SubscriptionRecommendation> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // Get customer profile
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer not found",
    });
  }

  // Check if customer already has subscription
  const existingSubscription = await getSubscriptionByCustomerId(
    customerId,
    userId
  );

  // Build customer context for AI
  const customerContext = {
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    customerType: customer.customerType,
    status: customer.status,
    totalInvoiced: customer.totalInvoiced || 0,
    totalPaid: customer.totalPaid || 0,
    balance: customer.balance || 0,
    hasExistingSubscription: !!existingSubscription,
    existingPlan: existingSubscription?.planType || null,
  };

  // Prepare AI prompt
  const prompt = `Analyze this customer profile and recommend the best subscription plan.

Customer Data:
- Name: ${customerContext.name}
- Email: ${customerContext.email}
- Type: ${customerContext.customerType || "private"}
- Total Invoiced: ${customerContext.totalInvoiced} DKK
- Total Paid: ${customerContext.totalPaid} DKK
- Balance: ${customerContext.balance} DKK
${customerContext.hasExistingSubscription ? `- Current Plan: ${customerContext.existingPlan}` : "- No current subscription"}

Available Plans:
${Object.entries(SUBSCRIPTION_PLANS)
  .map(
    ([key, plan]) =>
      `- ${key}: ${plan.name} - ${plan.monthlyPrice / 100} kr/måned, ${plan.includedHours} timer - ${plan.description}`
  )
  .join("\n")}

Based on this customer's profile, recommend the best subscription plan. Consider:
1. Customer type (private vs erhverv)
2. Historical spending patterns
3. Payment behavior
4. Current subscription status

Return a JSON object with:
{
  "recommendedPlan": "tier1" | "tier2" | "tier3" | "flex_basis" | "flex_plus",
  "confidence": 0-100,
  "reasoning": "Detailed explanation in Danish",
  "alternatives": [
    {
      "plan": "plan_type",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"]
    }
  ]
}`;

  try {
    // Call AI router for analysis
    const aiResponse = await routeAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      taskType: "chat",
      userId,
      requireApproval: false,
    });

    // Parse AI response
    const content = aiResponse.content.trim();

    // Try to extract JSON from response
    let recommendation: SubscriptionRecommendation;

    // Look for JSON in code blocks or plain text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        recommendation = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Fallback: parse manually or use defaults
        recommendation = parseRecommendationFromText(content);
      }
    } else {
      recommendation = parseRecommendationFromText(content);
    }

    // Validate recommendation
    if (
      !Object.keys(SUBSCRIPTION_PLANS).includes(recommendation.recommendedPlan)
    ) {
      // Fallback to tier1 if invalid
      recommendation.recommendedPlan = "tier1";
      recommendation.confidence = 50;
      recommendation.reasoning =
        "Kunne ikke analysere kundeprofil - anbefaler Basis Abonnement som standard.";
    }

    return recommendation;
  } catch (error) {
    console.error("Error getting AI recommendation:", error);

    // Fallback recommendation
    return {
      recommendedPlan: "tier1",
      confidence: 50,
      reasoning:
        "Kunne ikke generere AI-anbefaling. Anbefaler Basis Abonnement som standard.",
      alternatives: [
        {
          plan: "tier2",
          pros: ["Mere timer inkluderet", "Hovedrengøring inkluderet"],
          cons: ["Højere pris"],
        },
      ],
    };
  }
}

/**
 * Parse recommendation from AI text response (fallback)
 */
function parseRecommendationFromText(text: string): SubscriptionRecommendation {
  const lowerText = text.toLowerCase();

  // Try to detect plan from text
  let recommendedPlan: SubscriptionPlanType = "tier1";
  let confidence = 50;

  if (lowerText.includes("tier3") || lowerText.includes("vip")) {
    recommendedPlan = "tier3";
    confidence = 70;
  } else if (lowerText.includes("tier2") || lowerText.includes("premium")) {
    recommendedPlan = "tier2";
    confidence = 70;
  } else if (
    lowerText.includes("flex_plus") ||
    lowerText.includes("flex plus")
  ) {
    recommendedPlan = "flex_plus";
    confidence = 70;
  } else if (
    lowerText.includes("flex_basis") ||
    lowerText.includes("flex basis")
  ) {
    recommendedPlan = "flex_basis";
    confidence = 70;
  }

  return {
    recommendedPlan,
    confidence,
    reasoning: text.substring(0, 500), // First 500 chars as reasoning
    alternatives: [],
  };
}

export interface ChurnRiskPrediction {
  churnRisk: number; // 0-100
  riskFactors: Array<{
    factor: string;
    impact: number; // 0-100
  }>;
  recommendedActions: Array<{
    action: string;
    priority: "high" | "medium" | "low";
  }>;
  timeline: string; // "30 days", "60 days", etc.
}

/**
 * Predict churn risk for a customer with subscription
 */
export async function predictChurnRisk(
  customerId: number,
  userId: number,
  lookbackDays: number = 90
): Promise<ChurnRiskPrediction> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // Get customer profile
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer not found",
    });
  }

  // Get subscription
  const subscription = await getSubscriptionByCustomerId(customerId, userId);
  if (!subscription) {
    // No subscription = no churn risk (can't churn if no subscription)
    return {
      churnRisk: 0,
      riskFactors: [],
      recommendedActions: [
        {
          action: "Opret subscription for kunden",
          priority: "high",
        },
      ],
      timeline: "N/A",
    };
  }

  // Calculate risk factors
  const riskFactors: Array<{ factor: string; impact: number }> = [];
  let totalRisk = 0;

  // 1. Payment delays (balance > 0)
  if (customer.balance && customer.balance > 0) {
    const balanceRisk = Math.min(
      100,
      (customer.balance / (subscription.monthlyPrice / 100)) * 50
    );
    riskFactors.push({
      factor: `Ubetalt balance: ${customer.balance} kr`,
      impact: balanceRisk,
    });
    totalRisk += balanceRisk * 0.3; // 30% weight
  }

  // 2. Low payment ratio
  if (customer.totalInvoiced && customer.totalInvoiced > 0) {
    const paymentRatio = (customer.totalPaid || 0) / customer.totalInvoiced;
    if (paymentRatio < 0.8) {
      const ratioRisk = (1 - paymentRatio) * 100;
      riskFactors.push({
        factor: `Lav betalingsratio: ${Math.round(paymentRatio * 100)}%`,
        impact: ratioRisk,
      });
      totalRisk += ratioRisk * 0.25; // 25% weight
    }
  }

  // 3. Subscription age (new subscriptions more likely to churn)
  const subscriptionAge = Math.floor(
    (Date.now() - new Date(subscription.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (subscriptionAge < 30) {
    riskFactors.push({
      factor: "Ny subscription (< 30 dage)",
      impact: 30,
    });
    totalRisk += 30 * 0.15; // 15% weight
  }

  // 4. Auto-renew disabled
  if (!subscription.autoRenew) {
    riskFactors.push({
      factor: "Auto-renew deaktiveret",
      impact: 40,
    });
    totalRisk += 40 * 0.2; // 20% weight
  }

  // 5. Status check
  if (subscription.status !== "active") {
    riskFactors.push({
      factor: `Status: ${subscription.status}`,
      impact: 80,
    });
    totalRisk += 80 * 0.1; // 10% weight
  }

  // Normalize risk to 0-100
  const churnRisk = Math.min(100, Math.max(0, totalRisk));

  // Determine timeline
  let timeline = "90+ dage";
  if (churnRisk >= 70) {
    timeline = "30 dage";
  } else if (churnRisk >= 50) {
    timeline = "60 dage";
  }

  // Generate recommended actions
  const recommendedActions: Array<{
    action: string;
    priority: "high" | "medium" | "low";
  }> = [];

  if (customer.balance && customer.balance > 0) {
    recommendedActions.push({
      action: "Følg op på ubetalt balance",
      priority: "high",
    });
  }

  if (!subscription.autoRenew) {
    recommendedActions.push({
      action: "Aktiver auto-renew for subscription",
      priority: "high",
    });
  }

  if (churnRisk >= 50) {
    recommendedActions.push({
      action: "Send retention email til kunden",
      priority: "high",
    });
  }

  const paymentRatio =
    customer.totalInvoiced && customer.totalInvoiced > 0
      ? (customer.totalPaid || 0) / customer.totalInvoiced
      : 1;
  if (paymentRatio < 0.8) {
    recommendedActions.push({
      action: "Gennemgå betalingshistorik",
      priority: "medium",
    });
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push({
      action: "Overvåg kundens engagement",
      priority: "low",
    });
  }

  // Use AI for advanced analysis if risk is high
  if (churnRisk >= 50) {
    try {
      const prompt = `Analyze this customer's churn risk and provide detailed recommendations.

Customer Data:
- Name: ${customer.name}
- Email: ${customer.email}
- Balance: ${customer.balance || 0} kr
- Total Invoiced: ${customer.totalInvoiced || 0} kr
- Total Paid: ${customer.totalPaid || 0} kr
- Payment Ratio: ${customer.totalInvoiced ? Math.round(((customer.totalPaid || 0) / customer.totalInvoiced) * 100) : 0}%

Subscription Data:
- Plan: ${subscription.planType}
- Status: ${subscription.status}
- Auto-renew: ${subscription.autoRenew ? "Yes" : "No"}
- Subscription Age: ${subscriptionAge} days

Current Risk Factors:
${riskFactors.map(f => `- ${f.factor}: ${f.impact}% impact`).join("\n")}

Calculate churn risk (0-100) and provide specific retention actions. Return JSON:
{
  "churnRisk": 0-100,
  "riskFactors": [{"factor": "string", "impact": 0-100}],
  "recommendedActions": [{"action": "string", "priority": "high|medium|low"}],
  "timeline": "30 days|60 days|90+ days"
}`;

      const aiResponse = await routeAI({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        taskType: "chat",
        userId,
        requireApproval: false,
      });

      const content = aiResponse.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const aiPrediction = JSON.parse(jsonMatch[0]);
          // Merge AI insights with calculated risk
          return {
            churnRisk: Math.max(churnRisk, aiPrediction.churnRisk || churnRisk),
            riskFactors: [...riskFactors, ...(aiPrediction.riskFactors || [])],
            recommendedActions:
              aiPrediction.recommendedActions || recommendedActions,
            timeline: aiPrediction.timeline || timeline,
          };
        } catch (e) {
          // Fallback to calculated risk
        }
      }
    } catch (error) {
      console.error("Error getting AI churn prediction:", error);
      // Fallback to calculated risk
    }
  }

  return {
    churnRisk,
    riskFactors,
    recommendedActions,
    timeline,
  };
}

export interface UsageOptimization {
  recommendedSchedule: Array<{
    date: string;
    hours: number;
    serviceType: string;
    reasoning: string;
  }>;
  expectedValue: number; // DKK
  reasoning: string;
  alternatives: Array<{
    schedule: Array<{
      date: string;
      hours: number;
      serviceType: string;
    }>;
    value: number;
    description: string;
  }>;
  currentUsage: {
    hoursUsed: number;
    hoursRemaining: number;
    utilizationRate: number; // 0-100
  };
}

/**
 * Optimize subscription usage by analyzing patterns and recommending optimal booking schedule
 */
export async function optimizeSubscriptionUsage(
  subscriptionId: number,
  userId: number,
  optimizeFor: "value" | "convenience" | "efficiency" = "value"
): Promise<UsageOptimization> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // Get subscription
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Subscription not found",
    });
  }

  // Get subscription usage for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usageRecords = await db
    .select()
    .from(subscriptionUsage)
    .where(
      and(
        eq(subscriptionUsage.subscriptionId, subscriptionId),
        gte(subscriptionUsage.date, monthStart.toISOString()),
        lte(subscriptionUsage.date, monthEnd.toISOString())
      )
    );

  // Get bookings for this subscription
  const customerBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.customerProfileId, subscription.customerProfileId),
        gte(bookings.scheduledStart, monthStart.toISOString()),
        lte(bookings.scheduledStart, monthEnd.toISOString())
      )
    )
    .orderBy(bookings.scheduledStart);

  // Calculate current usage
  const hoursUsed = usageRecords.reduce(
    (sum, record) => sum + Number(record.hoursUsed || 0),
    0
  );
  const includedHours = Number(subscription.includedHours || 0);
  const hoursRemaining = Math.max(0, includedHours - hoursUsed);
  const utilizationRate =
    includedHours > 0 ? (hoursUsed / includedHours) * 100 : 0;

  // Get plan details
  const plan =
    SUBSCRIPTION_PLANS[subscription.planType as SubscriptionPlanType];
  if (!plan) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid subscription plan",
    });
  }

  // Build AI prompt for optimization
  const prompt = `Analyze subscription usage and recommend optimal booking schedule.

Subscription Data:
- Plan: ${subscription.planType} (${plan.name})
- Included Hours: ${includedHours} hours/month
- Hours Used: ${hoursUsed.toFixed(2)} hours
- Hours Remaining: ${hoursRemaining.toFixed(2)} hours
- Utilization Rate: ${utilizationRate.toFixed(1)}%
- Monthly Price: ${subscription.monthlyPrice / 100} kr

Current Month Bookings:
${
  customerBookings.length > 0
    ? customerBookings
        .map(
          (b: any) =>
            `- ${new Date(b.scheduledStart).toLocaleDateString("da-DK")}: ${b.title || "Booking"}`
        )
        .join("\n")
    : "- No bookings yet this month"
}

Optimization Goal: ${optimizeFor === "value" ? "Maximize value within included hours" : optimizeFor === "convenience" ? "Optimize for customer convenience" : "Maximize efficiency"}

Recommend an optimal booking schedule for the remaining days of this month that:
1. Uses remaining hours efficiently
2. Maximizes customer value
3. Considers typical cleaning service patterns
4. Avoids overage costs

Return JSON:
{
  "recommendedSchedule": [
    {
      "date": "YYYY-MM-DD",
      "hours": number,
      "serviceType": "string",
      "reasoning": "string"
    }
  ],
  "expectedValue": number,
  "reasoning": "Detailed explanation in Danish",
  "alternatives": [
    {
      "schedule": [{"date": "YYYY-MM-DD", "hours": number, "serviceType": "string"}],
      "value": number,
      "description": "string"
    }
  ]
}`;

  try {
    const aiResponse = await routeAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      taskType: "chat",
      userId,
      requireApproval: false,
    });

    const content = aiResponse.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const optimization = JSON.parse(jsonMatch[0]);
        return {
          ...optimization,
          currentUsage: {
            hoursUsed,
            hoursRemaining,
            utilizationRate,
          },
        };
      } catch (e) {
        // Fallback
      }
    }
  } catch (error) {
    console.error("Error optimizing usage:", error);
  }

  // Fallback: Simple recommendation
  const daysRemaining = Math.ceil(
    (monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const recommendedHoursPerWeek =
    hoursRemaining > 0 && daysRemaining > 0
      ? Math.min(4, hoursRemaining / Math.ceil(daysRemaining / 7))
      : 0;

  return {
    recommendedSchedule:
      hoursRemaining > 0 && daysRemaining > 0
        ? [
            {
              date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              hours: Math.min(recommendedHoursPerWeek, hoursRemaining),
              serviceType: "Hovedrengøring",
              reasoning: `Anbefaler ${recommendedHoursPerWeek.toFixed(1)} timer om ugen for at bruge resterende ${hoursRemaining.toFixed(1)} timer effektivt.`,
            },
          ]
        : [],
    expectedValue: (subscription.monthlyPrice / 100) * (utilizationRate / 100),
    reasoning:
      utilizationRate < 50
        ? `Lav udnyttelse (${utilizationRate.toFixed(1)}%). Overvej at planlægge flere bookinger for at maksimere værdi.`
        : utilizationRate > 90
          ? `Høj udnyttelse (${utilizationRate.toFixed(1)}%). Vær opmærksom på overage costs.`
          : `God udnyttelse (${utilizationRate.toFixed(1)}%).`,
    alternatives: [],
    currentUsage: {
      hoursUsed,
      hoursRemaining,
      utilizationRate,
    },
  };
}

export interface UpsellOpportunity {
  type: "upgrade" | "add_service" | "increase_frequency";
  currentValue: number;
  potentialValue: number;
  confidence: number; // 0-100
  recommendedAction: string;
  emailTemplate?: string;
}

export interface UpsellOpportunities {
  opportunities: UpsellOpportunity[];
  totalPotentialValue: number;
}

/**
 * Generate upsell and cross-sell opportunities for a customer
 */
export async function generateUpsellOpportunities(
  customerId: number,
  userId: number,
  includeCrossSell: boolean = true
): Promise<UpsellOpportunities> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // Get customer profile
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer not found",
    });
  }

  // Get subscription
  const subscription = await getSubscriptionByCustomerId(customerId, userId);
  if (!subscription) {
    // No subscription = opportunity to create one
    return {
      opportunities: [
        {
          type: "add_service",
          currentValue: 0,
          potentialValue: SUBSCRIPTION_PLANS.tier1.monthlyPrice / 100,
          confidence: 70,
          recommendedAction: "Opret subscription for kunden",
          emailTemplate: "subscription_intro",
        },
      ],
      totalPotentialValue: SUBSCRIPTION_PLANS.tier1.monthlyPrice / 100,
    };
  }

  const opportunities: UpsellOpportunity[] = [];
  let totalPotentialValue = 0;

  // Get current plan
  const currentPlan =
    SUBSCRIPTION_PLANS[subscription.planType as SubscriptionPlanType];
  const currentValue = subscription.monthlyPrice / 100;

  // Check for upgrade opportunities
  const planOrder: SubscriptionPlanType[] = [
    "flex_basis",
    "tier1",
    "flex_plus",
    "tier2",
    "tier3",
  ];
  const currentIndex = planOrder.indexOf(
    subscription.planType as SubscriptionPlanType
  );

  if (currentIndex < planOrder.length - 1) {
    const nextPlan = planOrder[currentIndex + 1];
    const nextPlanDetails = SUBSCRIPTION_PLANS[nextPlan];
    const potentialValue = nextPlanDetails.monthlyPrice / 100;
    const valueIncrease = potentialValue - currentValue;

    // Check usage to determine upgrade confidence
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const usageRecords = await db
      .select()
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.subscriptionId, subscription.id),
          gte(subscriptionUsage.date, monthStart.toISOString())
        )
      );

    const hoursUsed = usageRecords.reduce(
      (sum, record) => sum + Number(record.hoursUsed || 0),
      0
    );
    const utilizationRate =
      Number(subscription.includedHours) > 0
        ? (hoursUsed / Number(subscription.includedHours)) * 100
        : 0;

    // High utilization = good upgrade candidate
    const upgradeConfidence =
      utilizationRate > 80 ? 85 : utilizationRate > 60 ? 70 : 50;

    if (upgradeConfidence >= 50) {
      opportunities.push({
        type: "upgrade",
        currentValue,
        potentialValue,
        confidence: upgradeConfidence,
        recommendedAction: `Upgrade fra ${currentPlan.name} til ${nextPlanDetails.name} (+${valueIncrease} kr/måned)`,
        emailTemplate: "subscription_upgrade",
      });
      totalPotentialValue += valueIncrease;
    }
  }

  // Check for frequency increase (if on flex plan)
  if (
    subscription.planType === "flex_basis" ||
    subscription.planType === "flex_plus"
  ) {
    const flexPlusValue = SUBSCRIPTION_PLANS.flex_plus.monthlyPrice / 100;
    if (currentValue < flexPlusValue) {
      opportunities.push({
        type: "increase_frequency",
        currentValue,
        potentialValue: flexPlusValue,
        confidence: 65,
        recommendedAction: "Øg frekvens til Flex Plus for mere fleksibilitet",
        emailTemplate: "frequency_increase",
      });
      totalPotentialValue += flexPlusValue - currentValue;
    }
  }

  // Cross-sell: Additional services
  if (includeCrossSell) {
    // Check if customer has multiple properties
    // Note: customerProperties doesn't have userId, filter by customerProfileId only
    const properties = await db
      .select()
      .from(customerProperties)
      .where(eq(customerProperties.customerProfileId, customerId));

    if (properties.length > 1) {
      const additionalServiceValue = currentValue * 0.5; // 50% of current plan for additional property
      opportunities.push({
        type: "add_service",
        currentValue,
        potentialValue: currentValue + additionalServiceValue,
        confidence: 60,
        recommendedAction: `Tilføj subscription for ekstra ejendom (${properties.length - 1} ejendomme tilgængelige)`,
        emailTemplate: "multi_property_upsell",
      });
      totalPotentialValue += additionalServiceValue;
    }
  }

  // Use AI to analyze and enhance opportunities
  if (opportunities.length > 0) {
    try {
      const prompt = `Analyze these upsell opportunities and enhance them with specific recommendations.

Customer Data:
- Name: ${customer.name}
- Current Plan: ${subscription.planType} (${currentPlan.name})
- Monthly Value: ${currentValue} kr
- Total Invoiced: ${customer.totalInvoiced || 0} kr

Opportunities:
${opportunities
  .map(
    (opp, i) =>
      `${i + 1}. ${opp.type}: ${opp.recommendedAction} (Confidence: ${opp.confidence}%)`
  )
  .join("\n")}

Enhance these opportunities with:
1. More specific recommendations
2. Better confidence scores
3. Personalized email templates
4. Additional opportunities if relevant

Return JSON:
{
  "opportunities": [
    {
      "type": "upgrade|add_service|increase_frequency",
      "currentValue": number,
      "potentialValue": number,
      "confidence": 0-100,
      "recommendedAction": "string",
      "emailTemplate": "string"
    }
  ],
  "totalPotentialValue": number
}`;

      const aiResponse = await routeAI({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        taskType: "chat",
        userId,
        requireApproval: false,
      });

      const content = aiResponse.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const aiOpportunities = JSON.parse(jsonMatch[0]);
          return aiOpportunities;
        } catch (e) {
          // Fallback to calculated opportunities
        }
      }
    } catch (error) {
      console.error("Error getting AI upsell analysis:", error);
      // Fallback to calculated opportunities
    }
  }

  return {
    opportunities,
    totalPotentialValue,
  };
}
