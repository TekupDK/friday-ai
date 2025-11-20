import { Skeleton } from "@/components/ui/skeleton";

/**
 * EmailCenterSkeleton - Email Center Panel Skeleton
 * 
 * Shows realistic preview of email interface matching EmailListAI design
 * Includes search bar, filters, and email list
 */
export function EmailCenterSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar with Splits */}
        <div className="w-64 border-r border-border/20 shrink-0 p-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>

        {/* Main Email Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-border/20 shrink-0 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="border rounded-lg p-3 bg-background hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
