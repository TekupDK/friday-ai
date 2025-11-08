import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { useConflicts } from "@/hooks/docs/useDocuments";
import { formatDistanceToNow } from "date-fns";

interface ConflictListProps {
  conflicts: any[];
}

export function ConflictList({ conflicts }: ConflictListProps) {
  const { resolveConflict, isResolving } = useConflicts();

  const handleResolve = (conflictId: string, resolution: "accept_local" | "accept_remote") => {
    resolveConflict({
      conflictId,
      resolution,
    });
  };

  if (conflicts.length === 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          No conflicts detected. All documents are in sync.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map((conflict) => (
        <Card key={conflict.id} className="border-destructive">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Merge Conflict</CardTitle>
                  {conflict.resolution && (
                    <Badge variant="secondary">Resolved</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {conflict.path}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(conflict.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Resolution buttons */}
            {!conflict.resolution && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResolve(conflict.id, "accept_local")}
                  disabled={isResolving}
                >
                  Accept Local Version
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve(conflict.id, "accept_remote")}
                  disabled={isResolving}
                >
                  Accept Remote Version
                </Button>
                <Button variant="secondary" disabled>
                  Manual Merge (CLI)
                </Button>
              </div>
            )}

            {/* Resolution info */}
            {conflict.resolution && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Resolved using: <strong>{conflict.resolution}</strong>
                  {conflict.resolvedBy && ` by ${conflict.resolvedBy}`}
                  {conflict.resolvedAt && (
                    <> {formatDistanceToNow(new Date(conflict.resolvedAt), { addSuffix: true })}</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Conflict preview */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-green-600 mb-2">Local Version</div>
                <pre className="bg-muted p-3 rounded overflow-x-auto max-h-32">
                  {conflict.localContent?.slice(0, 200)}
                  {conflict.localContent?.length > 200 && "..."}
                </pre>
              </div>
              <div>
                <div className="font-semibold text-blue-600 mb-2">Remote Version</div>
                <pre className="bg-muted p-3 rounded overflow-x-auto max-h-32">
                  {conflict.remoteContent?.slice(0, 200)}
                  {conflict.remoteContent?.length > 200 && "..."}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
