import { lazy, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuth } from "@/_core/hooks/useAuth";

import ErrorBoundary from "./components/ErrorBoundary";
import { SkipLinks } from "./components/SkipLinks";
import { EmailContextProvider } from "./contexts/EmailContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WorkflowContextProvider } from "./contexts/WorkflowContext";
import { warmupCache } from "./lib/cacheStrategy";
import ChatComponentsShowcase from "./pages/ChatComponentsShowcase";
import ComponentShowcase from "./pages/ComponentShowcase";
import LoginPage from "./pages/LoginPage";
import NotFound from "@/pages/NotFound";
import WorkspaceLayout from "./pages/WorkspaceLayout";
import DocsPage from "./pages/docs/DocsPage";

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
      <Route path={"/showcase"} component={ComponentShowcase} />
      <Route path={"/chat-components"} component={ChatComponentsShowcase} />
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
        path={"/crm/leads"}
        component={lazy(() => import("./pages/crm/LeadPipeline"))}
      />
      <Route
        path={"/crm/bookings"}
        component={lazy(() => import("./pages/crm/BookingCalendar"))}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
