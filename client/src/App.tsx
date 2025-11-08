import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { EmailContextProvider } from "./contexts/EmailContext";
import { WorkflowContextProvider } from "./contexts/WorkflowContext";
import { ThemeProvider } from "./contexts/ThemeContext";
// V2: Renamed from ChatInterface to WorkspaceLayout for clarity
import WorkspaceLayout from "./pages/WorkspaceLayout";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "@/_core/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { warmupCache } from "./lib/cacheStrategy";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: false });

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
        console.warn('[Cache] Warmup failed:', err);
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
