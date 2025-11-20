import { Skeleton } from "@/components/ui/skeleton";

/**
 * SmartWorkspaceSkeleton - Smart Workspace Panel Skeleton
 * 
 * Shows realistic preview of workspace panel during lazy loading
 * Generic skeleton that works for all workspace contexts
 */
export function SmartWorkspaceSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border/20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header Card */}
        <div className="border rounded-lg p-4 bg-muted/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="border rounded-lg p-4 bg-muted/5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-3 bg-muted/5">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>

        {/* Action Items */}
        <div className="border rounded-lg p-4 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
