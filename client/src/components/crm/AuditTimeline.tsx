/**
 * AuditTimeline Component
 *
 * Displays audit logs for an entity (customer, lead, etc.)
 */

import { Clock, User, FileText, Edit, Trash2, Plus } from "lucide-react";
import React from "react";

import { AppleCard } from "./apple-ui";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";

import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface AuditTimelineProps {
  entityType: "customer" | "lead" | "opportunity" | "segment" | "booking";
  entityId: number;
}

// Action icons
const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
      return Plus;
    case "update":
    case "edit":
      return Edit;
    case "delete":
    case "remove":
      return Trash2;
    default:
      return FileText;
  }
};

// Action colors
const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
      return "text-green-600 dark:text-green-400";
    case "update":
    case "edit":
      return "text-blue-600 dark:text-blue-400";
    case "delete":
    case "remove":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
};

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

export function AuditTimeline({ entityType, entityId }: AuditTimelineProps) {
  const {
    data: auditLogs,
    isLoading,
    error,
    isError,
  } = trpc.crm.extensions.getAuditLog.useQuery({
    entityType,
    entityId,
    limit: 50,
  });

  if (isLoading) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <LoadingSpinner message="Loading audit log..." />
      </AppleCard>
    );
  }

  if (isError) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <ErrorDisplay message="Failed to load audit log" error={error} />
      </AppleCard>
    );
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <AppleCard variant="elevated" padding="lg">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No audit history</h3>
          <p className="text-sm text-muted-foreground">
            Audit logs will appear here when changes are made
          </p>
        </div>
      </AppleCard>
    );
  }

  return (
    <AppleCard variant="elevated" padding="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Audit Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Complete history of changes to this {entityType}
          </p>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log, index) => {
            const ActionIcon = getActionIcon(log.action);
            const actionColor = getActionColor(log.action);

            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border border-border",
                  index === 0 && "bg-primary/5"
                )}
              >
                {/* Icon */}
                <div
                  className={cn("p-2 rounded-full bg-muted/50", actionColor)}
                >
                  <ActionIcon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-sm capitalize",
                          actionColor
                        )}
                      >
                        {log.action}
                      </span>
                      {log.userId && (
                        <span className="text-xs text-muted-foreground">
                          by User {log.userId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>

                  {/* Changes */}
                  {(() => {
                    if (
                      !log.changes ||
                      typeof log.changes !== "object" ||
                      log.changes === null ||
                      Object.keys(log.changes).length === 0
                    ) {
                      return null;
                    }
                    const changes = log.changes as Record<string, any>;
                    return (
                      <div className="mt-2 space-y-1">
                        {Object.entries(changes).map(
                          ([field, change]: [string, any]) => {
                            const oldValue = change?.old ?? "N/A";
                            const newValue = change?.new ?? "N/A";
                            return (
                              <div
                                key={field}
                                className="text-xs bg-muted/30 rounded px-2 py-1"
                              >
                                <span className="font-medium capitalize">
                                  {field}:
                                </span>{" "}
                                <span className="text-muted-foreground line-through">
                                  {String(oldValue)}
                                </span>{" "}
                                →{" "}
                                <span className="text-foreground font-medium">
                                  {String(newValue)}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    );
                  })()}

                  {/* IP Address & User Agent */}
                  {(log.ipAddress || log.userAgent) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      {log.ipAddress && log.userAgent && <span> • </span>}
                      {log.userAgent && (
                        <span className="truncate">{log.userAgent}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppleCard>
  );
}
