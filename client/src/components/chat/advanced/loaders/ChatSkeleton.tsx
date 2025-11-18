import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonVariant =
  | "message"
  | "document"
  | "sidebar"
  | "search"
  | "datagrid";

interface ChatSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

const variants: Record<SkeletonVariant, React.ReactNode> = {
  message: (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
  document: (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="pt-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  ),
  sidebar: (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  ),
  search: (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 border rounded-lg">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </div>
        ))}
      </div>
    </div>
  ),
  datagrid: (
    <div className="space-y-2 p-4">
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {[...Array(5)].map((_, row) => (
        <div key={`row-${row}`} className="flex gap-2">
          {[...Array(5)].map((_, col) => (
            <Skeleton key={`cell-${row}-${col}`} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  ),
};

export function ChatSkeleton({
  variant = "message",
  count = 1,
  className,
  ...props
}: ChatSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-2", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{variants[variant]}</React.Fragment>
      ))}
    </div>
  );
}

// Specific skeleton components for convenience
export function MessageSkeleton({
  count = 1,
  className,
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return <ChatSkeleton variant="message" count={count} className={className} />;
}

export function DocumentSkeleton({
  count = 1,
  className,
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ChatSkeleton variant="document" count={count} className={className} />
  );
}

export function SidebarSkeleton({
  count = 1,
  className,
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return <ChatSkeleton variant="sidebar" count={count} className={className} />;
}

export function SearchResultsSkeleton({
  count = 1,
  className,
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return <ChatSkeleton variant="search" count={count} className={className} />;
}

export function DataGridSkeleton({
  count = 1,
  className,
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ChatSkeleton variant="datagrid" count={count} className={className} />
  );
}
