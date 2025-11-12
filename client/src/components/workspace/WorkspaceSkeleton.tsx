import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Target,
  Calendar,
  DollarSign,
  Briefcase,
  BarChart3,
} from "lucide-react";

interface WorkspaceSkeletonProps {
  type: "lead" | "booking" | "invoice" | "customer" | "dashboard";
}

export function WorkspaceSkeleton({ type }: WorkspaceSkeletonProps) {
  const getIcon = () => {
    switch (type) {
      case "lead":
        return <Target className="w-5 h-5 text-muted-foreground" />;
      case "booking":
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
      case "invoice":
        return <DollarSign className="w-5 h-5 text-muted-foreground" />;
      case "customer":
        return <Briefcase className="w-5 h-5 text-muted-foreground" />;
      case "dashboard":
        return <BarChart3 className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "lead":
        return "Lead Analyzer";
      case "booking":
        return "Booking Manager";
      case "invoice":
        return "Invoice Tracker";
      case "customer":
        return "Customer Profile";
      case "dashboard":
        return "Business Dashboard";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in-0 duration-300">
      {/* Header Card */}
      <div className="border rounded-lg p-4 bg-muted/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center">
              {getIcon()}
            </div>
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid gap-4">
        {/* Main content card */}
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

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-3 bg-muted/5">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>

        {/* Action items */}
        <div className="border rounded-lg p-4 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
