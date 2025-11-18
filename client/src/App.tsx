import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { SkipLinks } from "./components/SkipLinks";
import { EmailContextProvider } from "./contexts/EmailContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WorkflowContextProvider } from "./contexts/WorkflowContext";
import { warmupCache } from "./lib/cacheStrategy";
import DocsPage from "./pages/docs/DocsPage";
import LoginPage from "./pages/LoginPage";
import WorkspaceLayout from "./pages/WorkspaceLayout";
// Lazy load showcase components - only in development to reduce production bundle
const ComponentShowcase = __ENABLE_SHOWCASE__
  ? lazy(() => import("./pages/ComponentShowcase"))
  : null;
const ChatComponentsShowcase = __ENABLE_SHOWCASE__
  ? lazy(() => import("./pages/ChatComponentsShowcase"))
  : null;

import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

function Router() {
  const [path] = useLocation();
  const { isAuthenticated, loading } = useAuth({
    redirectOnUnauthenticated: false,
  });

  // Public preview route: render LoginPage without auth/side-effects
  if (path === "/preview/login") {
    return <LoginPage preview />;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return (
    <Switch>
      <Route path={"/"} component={WorkspaceLayout} />
      {/* Showcase routes - only available in development */}
      {ComponentShowcase && (
        <Route
          path={"/showcase"}
          component={() => (
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              }
            >
              <ComponentShowcase />
            </Suspense>
          )}
        />
      )}
      {ChatComponentsShowcase && (
        <Route
          path={"/chat-components"}
          component={() => (
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              }
            >
              <ChatComponentsShowcase />
            </Suspense>
          )}
        />
      )}
      <Route
        path={"/lead-analysis"}
        component={lazy(() => import("./pages/LeadAnalysisDashboard"))}
      />
      <Route path={"/docs"} component={DocsPage} />
      <Route
        path={"/accessibility"}
        component={lazy(() => import("./pages/AccessibilityStatement"))}
      />
      {/* CRM Routes */}
      <Route
        path={"/crm/dashboard"}
        component={lazy(() => import("./pages/crm/CRMDashboard"))}
      />
      <Route
        path={"/crm/customers"}
        component={lazy(() => import("./pages/crm/CustomerList"))}
      />
      <Route
        path={"/crm/customers/:id"}
        component={lazy(() => import("./pages/crm/CustomerDetail"))}
      />
      <Route
        path={"/crm/leads"}
        component={lazy(() => import("./pages/crm/LeadPipeline"))}
      />
      <Route
        path={"/crm/leads/:id"}
        component={lazy(() => import("./pages/crm/LeadDetail"))}
      />
      <Route
        path={"/crm/bookings"}
        component={lazy(() => import("./pages/crm/BookingCalendar"))}
      />
      <Route
        path={"/crm/opportunities"}
        component={lazy(() => import("./pages/crm/OpportunityPipeline"))}
      />
      <Route
        path={"/crm/segments"}
        component={lazy(() => import("./pages/crm/SegmentList"))}
      />
      <Route
        path={"/crm/segments/:id"}
        component={lazy(() => import("./pages/crm/SegmentDetail"))}
      />
      {/* Subscription Routes */}
      <Route
        path={"/subscriptions"}
        component={lazy(() => import("./pages/SubscriptionManagement"))}
      />
      <Route
        path={"/subscriptions/plans"}
        component={lazy(() => import("./pages/SubscriptionLanding"))}
      />
      {/* Admin Routes */}
      <Route
        path={"/admin/users"}
        component={lazy(() => import("./pages/admin/UserList"))}
      />
      {/* CRM Standalone Debug Mode - Isolated CRM access for debugging */}
      <Route
        path={"/crm-standalone"}
        component={lazy(() => import("./pages/crm/CRMStandalone"))}
      />
      <Route
        path={"/crm-standalone/:path*"}
        component={lazy(() => import("./pages/crm/CRMStandalone"))}
      />
      <Route
        path={"/crm/debug"}
        component={lazy(() => import("./pages/crm/CRMStandalone"))}
      />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function HydrationReady() {
  useEffect(() => {
    (window as any).__FRIDAY_READY__ = true;
    document.dispatchEvent(new Event("friday:ready"));
  }, []); // Signal hydration complete for testing and external integrations
  return null;
}

// Phase 7.2: Cache warming component for performance optimization
function CacheWarmer() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("[Cache] Warming up cache for authenticated user");
      try {
        warmupCache(queryClient, String(user.id));
      } catch (err) {
        console.warn("[Cache] Warmup failed:", err);
      }
    }
    // queryClient is stable and doesn't need to be in dependencies
  }, [isAuthenticated, user?.id]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <EmailContextProvider>
          <WorkflowContextProvider>
            <TooltipProvider>
              <SkipLinks />
              <Toaster />
              <HydrationReady />
              <Router />
              <CacheWarmer />
            </TooltipProvider>
          </WorkflowContextProvider>
        </EmailContextProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
