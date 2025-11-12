/**
 * LIVE ACTIVITY FEED - Realtime aktivitetsfeed
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Users,
  MessageSquare,
  FileText,
  Edit3,
  Calendar,
  Zap,
  Eye,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";

export interface ActivityItem {
  id: string;
  type:
    | "user_joined"
    | "user_left"
    | "message_sent"
    | "document_created"
    | "document_updated"
    | "calendar_event"
    | "system_update"
    | "collaboration_started";
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: string;
    name: string;
    id: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
  priority: "low" | "medium" | "high";
}

interface LiveActivityFeedProps {
  activities?: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  onFilterChange?: (filter: string) => void;
  onClearFeed?: () => void;
  maxItems?: number;
}

export function LiveActivityFeed({
  activities = [],
  onActivityClick,
  onFilterChange,
  onClearFeed,
  maxItems = 20,
}: LiveActivityFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showLiveUpdates, setShowLiveUpdates] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Default activities
  const defaultActivities: ActivityItem[] = [
    {
      id: "1",
      type: "user_joined",
      user: { id: "1", name: "Sarah Johnson" },
      action: "joined the workspace",
      timestamp: "lige nu",
      priority: "medium",
      metadata: { workspace: "Main Workspace" },
    },
    {
      id: "2",
      type: "message_sent",
      user: { id: "2", name: "John Smith" },
      action: "sent a message in",
      target: { type: "chat", name: "Support Team", id: "chat-1" },
      timestamp: "for 30 sekunder siden",
      priority: "low",
      metadata: { messagePreview: "Kan I hjælpe med fakturaen?" },
    },
    {
      id: "3",
      type: "document_updated",
      user: { id: "3", name: "Emma Davis" },
      action: "updated",
      target: {
        type: "document",
        name: "Faktura - ABC Corporation",
        id: "doc-1",
      },
      timestamp: "for 1 minut siden",
      priority: "medium",
      metadata: { changes: "Price updated", version: "v2.1" },
    },
    {
      id: "4",
      type: "collaboration_started",
      user: { id: "4", name: "Mike Wilson" },
      action: "started collaborating on",
      target: { type: "document", name: "Møde referat Q1", id: "doc-2" },
      timestamp: "for 2 minutter siden",
      priority: "high",
      metadata: { collaborators: ["John Smith", "Sarah Johnson"] },
    },
    {
      id: "5",
      type: "calendar_event",
      user: { id: "5", name: "System" },
      action: "created calendar event",
      target: {
        type: "event",
        name: "Team Meeting - Q1 Review",
        id: "event-1",
      },
      timestamp: "for 5 minutter siden",
      priority: "medium",
      metadata: { date: "2024-01-20", time: "14:00" },
    },
    {
      id: "6",
      type: "document_created",
      user: { id: "2", name: "John Smith" },
      action: "created",
      target: {
        type: "document",
        name: "Email template - Welcome",
        id: "doc-3",
      },
      timestamp: "for 10 minutter siden",
      priority: "low",
      metadata: { template: true, category: "email" },
    },
    {
      id: "7",
      type: "system_update",
      user: { id: "5", name: "System" },
      action: "completed backup",
      timestamp: "for 15 minutter siden",
      priority: "low",
      metadata: { size: "2.3GB", duration: "3 min" },
    },
    {
      id: "8",
      type: "user_left",
      user: { id: "6", name: "Alex Chen" },
      action: "left the workspace",
      timestamp: "for 20 minutter siden",
      priority: "medium",
      metadata: { workspace: "Main Workspace", duration: "2 hours" },
    },
  ];

  const allActivities = activities.length > 0 ? activities : defaultActivities;

  const filteredActivities = allActivities
    .filter(activity => {
      if (activeFilter === "all") return true;
      if (activeFilter === "users")
        return ["user_joined", "user_left"].includes(activity.type);
      if (activeFilter === "documents")
        return ["document_created", "document_updated"].includes(activity.type);
      if (activeFilter === "collaboration")
        return activity.type === "collaboration_started";
      if (activeFilter === "messages") return activity.type === "message_sent";
      if (activeFilter === "system")
        return ["calendar_event", "system_update"].includes(activity.type);
      return activity.type === activeFilter;
    })
    .slice(0, maxItems);

  const recentActivities = filteredActivities.slice(0, 5);
  const highPriorityCount = filteredActivities.filter(
    a => a.priority === "high"
  ).length;

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_joined":
        return Users;
      case "user_left":
        return Users;
      case "message_sent":
        return MessageSquare;
      case "document_created":
        return FileText;
      case "document_updated":
        return Edit3;
      case "calendar_event":
        return Calendar;
      case "system_update":
        return Zap;
      case "collaboration_started":
        return Users;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_joined":
        return "bg-green-500";
      case "user_left":
        return "bg-red-500";
      case "message_sent":
        return "bg-blue-500";
      case "document_created":
        return "bg-purple-500";
      case "document_updated":
        return "bg-orange-500";
      case "calendar_event":
        return "bg-indigo-500";
      case "system_update":
        return "bg-gray-500";
      case "collaboration_started":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: ActivityItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_joined":
        return "Bruger joinede";
      case "user_left":
        return "Bruger forlod";
      case "message_sent":
        return "Besked sendt";
      case "document_created":
        return "Dokument oprettet";
      case "document_updated":
        return "Dokument opdateret";
      case "calendar_event":
        return "Kalender event";
      case "system_update":
        return "System opdatering";
      case "collaboration_started":
        return "Samarbejde startet";
      default:
        return type;
    }
  };

  const activityFilters = [
    { id: "all", label: "Alle", count: allActivities.length },
    {
      id: "users",
      label: "Brugere",
      count: allActivities.filter(a =>
        ["user_joined", "user_left"].includes(a.type)
      ).length,
    },
    {
      id: "documents",
      label: "Dokumenter",
      count: allActivities.filter(a =>
        ["document_created", "document_updated"].includes(a.type)
      ).length,
    },
    {
      id: "collaboration",
      label: "Samarbejde",
      count: allActivities.filter(a => a.type === "collaboration_started")
        .length,
    },
    {
      id: "messages",
      label: "Beskeder",
      count: allActivities.filter(a => a.type === "message_sent").length,
    },
    {
      id: "system",
      label: "System",
      count: allActivities.filter(a =>
        ["calendar_event", "system_update"].includes(a.type)
      ).length,
    },
  ];

  const isRecentActivity = (timestamp: string) => {
    return (
      timestamp.includes("lige nu") ||
      timestamp.includes("sekunder") ||
      timestamp.includes("1 minut")
    );
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Live Activity Feed</h4>
              <p className="text-xs text-muted-foreground">
                Realtime aktivitetsfeed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500">
              {filteredActivities.length} aktiviteter
            </Badge>
            {highPriorityCount > 0 && (
              <Badge className="bg-red-500">{highPriorityCount} vigtige</Badge>
            )}
          </div>
        </div>

        {/* Live Status */}
        {showLiveUpdates && (
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                Live opdateringer aktive • Opdateres i real-time
              </span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Filter:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {activityFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  onFilterChange?.(filter.id);
                }}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  activeFilter === filter.id
                    ? "bg-emerald-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">Seneste aktivitet:</h5>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAutoScroll(!autoScroll)}
              >
                {autoScroll ? "Auto-scroll på" : "Auto-scroll fra"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClearFeed}>
                Ryd feed
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredActivities.length > 0 ? (
              filteredActivities.map(activity => {
                const Icon = getActivityIcon(activity.type);
                const isRecent = isRecentActivity(activity.timestamp);

                return (
                  <button
                    key={activity.id}
                    onClick={() => onActivityClick?.(activity)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      isRecent
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-background border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                          getActivityColor(activity.type)
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {activity.user.name}
                              </span>
                              <Badge
                                className={getPriorityColor(activity.priority)}
                              >
                                {activity.priority}
                              </Badge>
                              {isRecent && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {activity.action}{" "}
                              {activity.target && (
                                <span className="font-medium">
                                  {activity.target.name}
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{activity.timestamp}</span>
                              <span>{getActivityLabel(activity.type)}</span>
                            </div>

                            {/* Metadata */}
                            {activity.metadata && (
                              <div className="mt-2 p-2 rounded bg-white/50 dark:bg-black/20 text-xs">
                                {Object.entries(activity.metadata).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-1"
                                    >
                                      <span className="font-medium capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span>{String(value)}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action indicator */}
                      {activity.target && (
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen aktiviteter</p>
                <p className="text-xs">Prøv at ændre filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {
                filteredActivities.filter(a => isRecentActivity(a.timestamp))
                  .length
              }
            </p>
            <p className="text-emerald-600 dark:text-emerald-400">Seneste</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {
                filteredActivities.filter(a => a.type === "document_updated")
                  .length
              }
            </p>
            <p className="text-blue-600 dark:text-blue-400">Opdateringer</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {
                filteredActivities.filter(a =>
                  ["user_joined", "user_left"].includes(a.type)
                ).length
              }
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Bruger aktivitet
            </p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="font-bold text-orange-700 dark:text-orange-300">
              {highPriorityCount}
            </p>
            <p className="text-orange-600 dark:text-orange-400">Vigtige</p>
          </div>
        </div>

        {/* Live Updates Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Live opdateringer</span>
          </div>
          <Button
            size="sm"
            variant={showLiveUpdates ? "default" : "outline"}
            onClick={() => setShowLiveUpdates(!showLiveUpdates)}
          >
            {showLiveUpdates ? "Aktiv" : "Inaktiv"}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={onClearFeed} variant="outline" className="flex-1">
            <Activity className="w-4 h-4 mr-2" />
            Ryd feed
          </Button>
          <Button
            onClick={() => setAutoScroll(!autoScroll)}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {autoScroll ? "Stop auto-scroll" : "Start auto-scroll"}
          </Button>
          <Button className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600">
            <Zap className="w-4 h-4 mr-2" />
            Export log
          </Button>
        </div>
      </div>
    </Card>
  );
}
