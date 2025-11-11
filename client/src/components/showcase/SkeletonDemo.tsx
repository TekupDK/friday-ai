import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Loading states med skeleton animationer
        </p>
        <Button onClick={toggleLoading} variant="outline" size="sm">
          🔄 Reload
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              {loading ? (
                <>
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold">Matilde Skinneholm</h4>
                    <p className="text-xs text-muted-foreground">
                      Re: Tilbud på vinduespudsning
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">22:02</div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Kunde efterspørger tilbud på vinduespudsning for kontor bygning.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-full">
                    🔥 HOT
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    Rengøring.nu
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metric Card Skeleton */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full">
                    +15%
                  </span>
                </div>
                <div className="text-3xl font-bold">125,000 kr</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* List Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </>
                ) : (
                  <>
                    <input type="checkbox" className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Task {i}</p>
                      <p className="text-xs text-muted-foreground">I dag</p>
                    </div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
