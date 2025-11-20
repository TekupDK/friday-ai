import { Skeleton } from "@/components/ui/skeleton";

/**
 * WorkspaceLayoutSkeleton - 3-Panel Preview Skeleton
 * 
 * Shows realistic preview of 3-panel layout during auth loading
 * Gives users immediate visual feedback of what's coming
 */
export function WorkspaceLayoutSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          
          {/* CRM Navigation Skeletons */}
          <div className="hidden md:flex items-center gap-1 ml-4 border-l border-border pl-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* 3-Panel Layout Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI Assistant (20%) */}
        <div className="w-[20%] border-r border-border p-4 space-y-4 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3 flex-1">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Center Panel - Email Center (60%) */}
        <div className="w-[60%] border-r border-border flex flex-col bg-muted/5">
          {/* Email Header */}
          <div className="px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          
          {/* Email Content */}
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {/* Search Bar */}
            <Skeleton className="h-10 w-full rounded-lg" />
            
            {/* Filters */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            
            {/* Email List */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="border rounded-lg p-3 bg-background">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-4 w-16 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Smart Workspace (20%) */}
        <div className="w-[20%] p-4 space-y-4 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
