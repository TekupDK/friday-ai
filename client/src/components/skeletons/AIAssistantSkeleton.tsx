import { Skeleton } from "@/components/ui/skeleton";

/**
 * AIAssistantSkeleton - AI Assistant Panel Skeleton
 * 
 * Shows realistic preview of AI chat interface during lazy loading
 */
export function AIAssistantSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Message */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>

        {/* User Message */}
        <div className="flex items-start gap-3 justify-end">
          <div className="flex-1 space-y-2 text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-12 w-3/4 ml-auto rounded-lg" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>

        {/* AI Message */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border/20 shrink-0">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
