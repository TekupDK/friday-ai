import { lazy, Suspense } from "react";
import { Mail } from "lucide-react";

/**
 * Email Center Panel - Dedicated Email Workspace
 * 
 * Refactored to focus 100% on emails.
 * Other tabs (Fakturaer, Kalender, Leads, Opgaver) moved to WorkspacePanel.
 * 
 * Features:
 * - Full-width email list for maximum readability
 * - No tab switching - always shows emails
 * - Optimized for Shortwave-style workflow
 * - Mini-tabs at bottom for quick access to other tools
 */

const EmailTabV2 = lazy(() =>
  import("@/components/inbox/EmailTabV2")
);

const EmailSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
    <div className="h-24 bg-muted rounded w-full animate-pulse"></div>
  </div>
);

export default function EmailCenterPanel() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Email Center Header */}
      <div className="px-4 py-3 border-b border-border/20 bg-background">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Email Center</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI-powered email workspace
        </p>
      </div>

      {/* Email Content - Full focus on emails */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<EmailSkeleton />}>
          <EmailTabV2 />
        </Suspense>
      </div>
    </div>
  );
}
