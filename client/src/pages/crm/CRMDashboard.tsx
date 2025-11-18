/**
 * CRM Dashboard Page
 *
 * Main dashboard showing CRM KPIs and metrics
 */

import { BarChart3, Calendar, Target, Users } from "lucide-react";

import { AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { RevenueChart } from "@/components/crm/RevenueChart";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

export default function CRMDashboard() {
  usePageTitle("CRM Dashboard");

  const {
    data: stats,
    isLoading,
    error,
    isError,
  } = trpc.crm.stats.getDashboardStats.useQuery();

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("da-DK").format(num);
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="CRM Dashboard">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className="text-3xl font-bold"
                    data-testid="crm-dashboard-title"
                  >
                    CRM Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Overview of customers, leads, and bookings
                  </p>
                </div>
              </div>
            </header>

            {/* Loading state */}
            {isLoading && (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading dashboard statistics"
              >
                <LoadingSpinner message="Loading dashboard statistics..." />
              </div>
            )}

            {/* Error state */}
            {isError && (
              <ErrorDisplay
                message="Failed to load dashboard statistics"
                error={error}
              />
            )}

            {/* Success state */}
            {!isLoading && !isError && stats && (
              <>
                {/* KPI Cards */}
                <section
                  aria-label="Key performance indicators"
                  data-testid="crm-dashboard-stats"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AppleCard variant="elevated">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Users
                            className="w-8 h-8 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-muted-foreground">
                            Total
                          </span>
                        </div>
                        <div
                          className="text-3xl font-bold"
                          aria-label={`Total customers: ${stats.customers.total}`}
                        >
                          {formatNumber(stats.customers.total)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Customers
                        </p>
                      </div>
                    </AppleCard>

                    <AppleCard variant="elevated">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Target
                            className="w-8 h-8 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-muted-foreground">
                            Active
                          </span>
                        </div>
                        <div
                          className="text-3xl font-bold"
                          aria-label={`Active customers: ${stats.customers.active}`}
                        >
                          {formatNumber(stats.customers.active)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Active Customers
                        </p>
                      </div>
                    </AppleCard>

                    <AppleCard variant="elevated">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Calendar
                            className="w-8 h-8 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-muted-foreground">
                            Planned
                          </span>
                        </div>
                        <div
                          className="text-3xl font-bold"
                          aria-label={`Planned bookings: ${stats.bookings.planned}`}
                        >
                          {formatNumber(stats.bookings.planned)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Planned Bookings
                        </p>
                      </div>
                    </AppleCard>

                    <AppleCard variant="elevated">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <BarChart3
                            className="w-8 h-8 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-muted-foreground">
                            Total
                          </span>
                        </div>
                        <div
                          className="text-3xl font-bold"
                          aria-label={`Total revenue: ${formatNumber(stats.revenue.total)} DKK`}
                        >
                          {formatNumber(stats.revenue.total)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Revenue (DKK)
                        </p>
                      </div>
                    </AppleCard>
                  </div>
                </section>

                {/* Revenue Forecast Chart */}
                <section aria-label="Revenue forecast">
                  <RevenueChart />
                </section>
              </>
            )}
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
