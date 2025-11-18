/**
 * Subscription Landing Page
 *
 * Public-facing page for displaying subscription plans and pricing
 */

import { Check, Sparkles } from "lucide-react";
import React from "react";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { SubscriptionPlanSelector } from "@/components/subscription";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocation } from "wouter";

export default function SubscriptionLandingPage() {
  usePageTitle("Subscription Plans");
  const [, setLocation] = useLocation();

  const handleSelectPlan = (planType: string) => {
    // Navigate to create subscription or customer selection
    setLocation(`/crm/customers?action=create-subscription&plan=${planType}`);
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Subscription Landing">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Choose Your Cleaning Subscription
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Flexible monthly subscriptions for regular cleaning services. Choose the plan that
                fits your needs.
              </p>
            </section>

            {/* Benefits Section */}
            <section>
              <AppleCard variant="elevated" padding="lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Regular Service</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent monthly cleaning on your schedule
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Flexible Plans</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose from 5 different plans to match your needs
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Easy Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Pause, upgrade, or cancel anytime from your dashboard
                    </p>
                  </div>
                </div>
              </AppleCard>
            </section>

            {/* Plan Selector */}
            <section>
              <SubscriptionPlanSelector
                onSelectPlan={handleSelectPlan}
                showRecommendation={false}
              />
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AppleCard variant="elevated" padding="md">
                  <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect
                    on your next billing cycle.
                  </p>
                </AppleCard>
                <AppleCard variant="elevated" padding="md">
                  <h3 className="font-semibold mb-2">What happens if I use more hours?</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional hours are billed at 349 kr/hour. We'll notify you if you're
                    approaching your limit.
                  </p>
                </AppleCard>
                <AppleCard variant="elevated" padding="md">
                  <h3 className="font-semibold mb-2">Can I pause my subscription?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can pause your subscription for up to 3 months. Your unused hours will
                    be preserved.
                  </p>
                </AppleCard>
                <AppleCard variant="elevated" padding="md">
                  <h3 className="font-semibold mb-2">How do I cancel?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can cancel anytime from your subscription management page. Cancellation takes
                    effect at the end of your current billing period.
                  </p>
                </AppleCard>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <AppleCard variant="elevated" padding="lg" className="bg-primary/5">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Select a plan above or contact us for a custom solution
                  </p>
                  <div className="flex gap-4 justify-center">
                    <AppleButton
                      variant="primary"
                      onClick={() => setLocation("/crm/customers")}
                    >
                      View Customers
                    </AppleButton>
                    <AppleButton
                      variant="secondary"
                      onClick={() => setLocation("/subscriptions")}
                    >
                      Manage Subscriptions
                    </AppleButton>
                  </div>
                </div>
              </AppleCard>
            </section>
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}

