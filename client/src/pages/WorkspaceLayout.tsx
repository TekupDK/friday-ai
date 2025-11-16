import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useEmailContext } from "@/contexts/EmailContext";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { MobileUserMenuSheet } from "@/components/MobileUserMenuSheet";
import { SettingsDialog } from "@/components/SettingsDialog";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import { InvoiceProvider } from "@/context/InvoiceContext";
import {
  Bot,
  LogOut,
  Menu,
  Settings,
  User,
  BookOpen,
  BarChart3,
  Users,
  Target,
  Calendar,
} from "lucide-react";
import { useLocation } from "wouter";

// Lazy load panels for code splitting optimization
const AIAssistantPanel = lazy(
  () => import("@/components/panels/AIAssistantPanelV2")
);
const EmailCenterPanel = lazy(
  () => import("@/components/panels/EmailCenterPanel")
);
const WorkflowPanelV2 = lazy(
  () => import("@/components/panels/SmartWorkspacePanel")
);

// Loading skeleton component
const PanelSkeleton = ({ name }: { name: string }) => (
  <div className="h-full flex items-center justify-center bg-muted/10">
    <div className="space-y-3 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading {name}...</p>
    </div>
  </div>
);

/**
 * Workspace Layout - Main 3-Panel Interface
 *
 * Replaces old "ChatInterface" with proper naming.
 *
 * Layout:
 * - Left (20%): AI Assistant (Friday)
 * - Center (60%): Email Center (dedicated to emails only)
 * - Right (20%): Smart Workspace (context-aware)
 *
 * Features:
 * - Resizable panels with min/max constraints
 * - Keyboard shortcuts (Alt+1/2/3 for panel focus)
 * - Mobile responsive with drawer navigation
 * - Context-aware right panel based on selected email
 */
function WorkspaceLayout() {
  usePageTitle("Workspace");
  const { user, isAuthenticated, loading } = useAuth();
  const { state: emailState } = useEmailContext();
  const [, navigate] = useLocation();
  const [showMobileInbox, setShowMobileInbox] = useState(false);

  // Dialog and Sheet state management
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Panel refs for focus management
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const emailPanelRef = useRef<HTMLDivElement>(null);
  const workflowPanelRef = useRef<HTMLDivElement>(null);

  // Panel focus management
  const focusPanel = useCallback((panel: "ai" | "email" | "workflow") => {
    const refs = {
      ai: aiPanelRef,
      email: emailPanelRef,
      workflow: workflowPanelRef,
    };

    const targetRef = refs[panel];
    if (targetRef?.current) {
      targetRef.current.focus();
    }
  }, []);

  // Keyboard shortcuts for panel navigation
  useKeyboardShortcuts([
    {
      key: "1",
      ctrlKey: true,
      handler: () => focusPanel("ai"),
      description: "Focus AI Assistant panel",
      category: "navigation",
    },
    {
      key: "2",
      ctrlKey: true,
      handler: () => focusPanel("email"),
      description: "Focus Email Center panel",
      category: "navigation",
    },
    {
      key: "3",
      ctrlKey: true,
      handler: () => focusPanel("workflow"),
      description: "Focus Workspace panel",
      category: "navigation",
    },
    {
      key: "?",
      shiftKey: false,
      handler: () => setShowKeyboardShortcuts(true),
      description: "Show keyboard shortcuts",
      category: "help",
    },
    {
      key: "?",
      shiftKey: true,
      handler: () => setShowKeyboardShortcuts(true),
      description: "Show keyboard shortcuts",
      category: "help",
    },
  ]);

  const handleLogout = useCallback(() => {
    window.location.href = getLoginUrl();
  }, []);

  // Memoize panel components to prevent unnecessary re-renders
  const AIAssistantPanelMemo = useMemo(() => <AIAssistantPanel />, []);

  const EmailCenterPanelMemo = useMemo(() => <EmailCenterPanel />, []);

  const WorkflowPanelMemo = useMemo(() => <WorkflowPanelV2 />, []);

  // Auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <InvoiceProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header id="navigation" className="h-14 border-b border-border flex items-center justify-between px-4 bg-background shrink-0">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="font-semibold text-lg">Friday AI</h1>
            <Badge variant="secondary" className="text-xs">
              Workspace
            </Badge>
            {/* CRM Navigation */}
            <div className="hidden md:flex items-center gap-1 ml-4 border-l border-border pl-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/crm/dashboard")}
                className="text-sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/crm/customers")}
                className="text-sm"
              >
                <Users className="w-4 h-4 mr-1" />
                Customers
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/crm/leads")}
                className="text-sm"
              >
                <Target className="w-4 h-4 mr-1" />
                Leads
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/crm/bookings")}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Bookings
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={showMobileInbox} onOpenChange={setShowMobileInbox}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open email center menu">
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              <div className="h-full">
                <PanelErrorBoundary name="Email Center">
                  <Suspense fallback={<PanelSkeleton name="Email Center" />}>
                    <EmailCenterPanel />
                  </Suspense>
                </PanelErrorBoundary>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Open user menu">
                <User className="w-5 h-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/docs")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Documentation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/crm/dashboard")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                CRM Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/crm/customers")}>
                <Users className="w-4 h-4 mr-2" />
                Customers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/crm/leads")}>
                <Target className="w-4 h-4 mr-2" />
                Leads
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/crm/bookings")}>
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-hidden min-h-0">
          {/* Desktop: 3-Panel Layout */}
          <div className="hidden md:flex h-full">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* AI Assistant Panel (Left - 20%) */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div
                ref={aiPanelRef}
                data-testid="ai-assistant-panel"
                tabIndex={0}
                className="h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
              >
                <PanelErrorBoundary name="AI Assistant">
                  <Suspense fallback={<PanelSkeleton name="AI Assistant" />}>
                    {AIAssistantPanelMemo}
                  </Suspense>
                </PanelErrorBoundary>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Email Center Panel (Middle - 60%) */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div
                ref={emailPanelRef}
                data-testid="email-center-panel"
                tabIndex={0}
                className="h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
              >
                <PanelErrorBoundary name="Email Center">
                  <Suspense fallback={<PanelSkeleton name="Email Center" />}>
                    {EmailCenterPanelMemo}
                  </Suspense>
                </PanelErrorBoundary>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Smart Workspace Panel (Right - 20%) */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div
                ref={workflowPanelRef}
                data-testid="workspace-panel"
                tabIndex={0}
                className="h-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
              >
                <PanelErrorBoundary name="Smart Workspace">
                  <Suspense fallback={<PanelSkeleton name="Smart Workspace" />}>
                    {WorkflowPanelMemo}
                  </Suspense>
                </PanelErrorBoundary>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>

          {/* Mobile: Single column */}
          <div className="md:hidden h-full">
          <PanelErrorBoundary name="AI Assistant">
            <Suspense fallback={<PanelSkeleton name="AI Assistant" />}>
              {AIAssistantPanelMemo}
            </Suspense>
          </PanelErrorBoundary>
          </div>
        </main>

        {/* Dialogs */}
        <UserProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
        />
        <SettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
        />
        <KeyboardShortcutsDialog
          open={showKeyboardShortcuts}
          onOpenChange={setShowKeyboardShortcuts}
        />
        <MobileUserMenuSheet
          open={showMobileUserMenu}
          onOpenChange={setShowMobileUserMenu}
          onProfileClick={() => setShowProfileDialog(true)}
          onSettingsClick={() => setShowSettingsDialog(true)}
        />
      </div>
    </InvoiceProvider>
  );
}

export default memo(WorkspaceLayout);
