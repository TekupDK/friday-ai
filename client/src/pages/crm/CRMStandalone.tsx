/**
 * CRM Standalone Page
 *
 * Isolated CRM module for debugging and development.
 * This page provides a standalone view of the CRM system without
 * requiring the full application context.
 *
 * Access via: /crm-standalone or /crm/debug
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";

import CRMLayout from "@/components/crm/CRMLayout";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { trpcClient } from "@/lib/trpc-client";
// Simple error boundary component (no external dependency needed)
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    FallbackComponent: React.ComponentType<{
      error: Error;
      resetErrorBoundary: () => void;
    }>;
  },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CRM Standalone Error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

// Create a dedicated query client for standalone mode
const standaloneQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      gcTime: 300000,
    },
  },
});

// Error fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error in CRM Module
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
          >
            Try Again
          </button>
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer mb-2">Stack Trace</summary>
          <pre className="bg-muted p-3 rounded overflow-auto max-h-60">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Standalone CRM Router
function StandaloneCRMRouter() {
  const [path] = useLocation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CRMLayout>
        <Suspense fallback={<LoadingSpinner message="Loading CRM module..." />}>
          <Switch>
            <Route
              path="/crm-standalone"
              component={() => <CRMDashboardStandalone />}
            />
            <Route
              path="/crm-standalone/dashboard"
              component={() => <CRMDashboardStandalone />}
            />
            <Route
              path="/crm-standalone/customers"
              component={() => <CustomerListStandalone />}
            />
            <Route
              path="/crm-standalone/customers/:id"
              component={() => <CustomerDetailStandalone />}
            />
            <Route
              path="/crm-standalone/leads"
              component={() => <LeadPipelineStandalone />}
            />
            <Route
              path="/crm-standalone/leads/:id"
              component={() => <LeadDetailStandalone />}
            />
            <Route
              path="/crm-standalone/opportunities"
              component={() => <OpportunityPipelineStandalone />}
            />
            <Route
              path="/crm-standalone/segments"
              component={() => <SegmentListStandalone />}
            />
            <Route
              path="/crm-standalone/segments/:id"
              component={() => <SegmentDetailStandalone />}
            />
            <Route
              path="/crm-standalone/bookings"
              component={() => <BookingCalendarStandalone />}
            />
            <Route>
              <div className="p-6">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <h1 className="text-2xl font-bold">CRM Standalone Mode</h1>
                  <p className="text-muted-foreground">
                    Isolated CRM module for debugging and development.
                  </p>
                  <div className="mt-8 space-y-2 text-left">
                    <p className="font-semibold">Available Routes:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>
                        <code>/crm-standalone/dashboard</code> - CRM Dashboard
                      </li>
                      <li>
                        <code>/crm-standalone/customers</code> - Customer List
                      </li>
                      <li>
                        <code>/crm-standalone/leads</code> - Lead Pipeline
                      </li>
                      <li>
                        <code>/crm-standalone/opportunities</code> -
                        Opportunities
                      </li>
                      <li>
                        <code>/crm-standalone/segments</code> - Customer
                        Segments
                      </li>
                      <li>
                        <code>/crm-standalone/bookings</code> - Booking Calendar
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </CRMLayout>
    </ErrorBoundary>
  );
}

// Standalone wrapper components (lazy loaded)
const CRMDashboardStandalone = React.lazy(() =>
  import("./CRMDashboard").then(m => ({ default: m.default }))
);

const CustomerListStandalone = React.lazy(() =>
  import("./CustomerList").then(m => ({ default: m.default }))
);

const CustomerDetailStandalone = React.lazy(() =>
  import("./CustomerDetail").then(m => ({ default: m.default }))
);

const LeadPipelineStandalone = React.lazy(() =>
  import("./LeadPipeline").then(m => ({ default: m.default }))
);

const LeadDetailStandalone = React.lazy(() =>
  import("./LeadDetail").then(m => ({ default: m.default }))
);

const OpportunityPipelineStandalone = React.lazy(() =>
  import("./OpportunityPipeline").then(m => ({ default: m.default }))
);

const SegmentListStandalone = React.lazy(() =>
  import("./SegmentList").then(m => ({ default: m.default }))
);

const SegmentDetailStandalone = React.lazy(() =>
  import("./SegmentDetail").then(m => ({ default: m.default }))
);

const BookingCalendarStandalone = React.lazy(() =>
  import("./BookingCalendar").then(m => ({ default: m.default }))
);

/**
 * Main Standalone CRM Page
 *
 * Provides isolated access to CRM module for debugging and development.
 * This page wraps all CRM routes in a standalone context with its own
 * query client and error boundaries.
 */
export default function CRMStandalone() {
  return (
    <trpc.Provider client={trpcClient} queryClient={standaloneQueryClient}>
      <QueryClientProvider client={standaloneQueryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {/* Debug Banner */}
            {import.meta.env.DEV && (
              <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-sm">
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  🐛 CRM Standalone Debug Mode
                </span>
                <span className="text-muted-foreground ml-2">
                  Isolated CRM module for development and debugging
                </span>
              </div>
            )}

            <StandaloneCRMRouter />
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
