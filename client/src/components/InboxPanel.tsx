/**
 * ⚠️ DEPRECATED - DO NOT USE IN V2
 * 
 * This file is kept for reference only.
 * In V2 architecture, EmailCenterPanel directly uses EmailTab.
 * 
 * Migration path:
 * - Old: EmailCenterPanel → InboxPanel → EmailTab (+ 4 other tabs)
 * - New: EmailCenterPanel → EmailTab (dedicated to emails only)
 * 
 * Other tabs moved to:
 * - Fakturaer, Kalender, Leads, Opgaver → Mini-tabs system (future)
 * 
 * @deprecated Use EmailCenterPanel directly in V2
 * @see client/src/components/panels/EmailCenterPanel.tsx
 * @see docs/V2-MIGRATION-COMPLETE-PLAN.md
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckSquare, FileText, Mail, Users } from "lucide-react";
import { lazy, Suspense, memo } from "react";

// Lazy load tabs for better initial performance
const EmailTabV2 = lazy(() =>
  import("@/components/inbox/EmailTabV2")
);
const InvoicesTab = lazy(() =>
  import("@/components/inbox/InvoicesTab").then(m => ({ default: m.default }))
);
const CalendarTab = lazy(() =>
  import("@/components/inbox/CalendarTab").then(m => ({ default: m.default }))
);
const LeadsTab = lazy(() =>
  import("@/components/inbox/LeadsTab").then(m => ({ default: m.default }))
);
const TasksTab = lazy(() =>
  import("@/components/inbox/TasksTab").then(m => ({ default: m.default }))
);

const TabSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
    <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
  </div>
);

interface InboxPanelProps {
  activeTab: "email" | "invoices" | "calendar" | "leads" | "tasks";
  onTabChange: (
    tab: "email" | "invoices" | "calendar" | "leads" | "tasks"
  ) => void;
}

function InboxPanel({ activeTab, onTabChange }: InboxPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={v => onTabChange(v as any)}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-border px-2 sm:px-4 bg-muted/20">
          <TabsList className="w-full justify-start bg-transparent gap-1">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Fakturaer</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Kalender</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Opgaver</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent
            value="email"
            className="m-0 p-3 sm:p-4 h-full overflow-hidden"
            forceMount
            style={{ display: activeTab === "email" ? "block" : "none" }}
          >
            <Suspense fallback={<TabSkeleton />}>
              <EmailTabV2 />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="invoices"
            className="m-0 p-3 sm:p-4 h-full overflow-hidden"
          >
            <Suspense fallback={<TabSkeleton />}>
              <InvoicesTab />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="calendar"
            className="m-0 p-3 sm:p-4 h-full overflow-hidden"
          >
            <Suspense fallback={<TabSkeleton />}>
              <CalendarTab />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="leads"
            className="m-0 p-3 sm:p-4 h-full overflow-hidden"
          >
            <Suspense fallback={<TabSkeleton />}>
              <LeadsTab onRequestTabChange={onTabChange} />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="tasks"
            className="m-0 p-3 sm:p-4 h-full overflow-hidden"
          >
            <Suspense fallback={<TabSkeleton />}>
              <TasksTab />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default memo(InboxPanel);
